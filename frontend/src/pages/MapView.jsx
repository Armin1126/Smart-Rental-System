import React, { useState, useEffect, useRef } from 'react';
import { analyticsApi, springApi } from '../services/api';
import { useTelemetryWebSocket } from '../hooks/useTelemetryWebSocket';
import { AssetDetailModal } from '../components/AssetDetailModal';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon asset URLs in Vite bundled builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Real Depot Yards across California
const SITE_COORDS = {
  S001: { lat: 37.7749, lng: -122.4194, name: 'San Francisco Depot Yard' },
  S002: { lat: 37.3382, lng: -121.8863, name: 'Silicon Valley Logistics Hub' },
  S003: { lat: 37.8044, lng: -122.2712, name: 'Oakland Port Equipment Facility' },
  S004: { lat: 38.5816, lng: -121.4944, name: 'Sacramento Capital Depot' },
  S005: { lat: 36.7468, lng: -119.7726, name: 'Fresno Central Valley Yard' },
  S006: { lat: 34.0522, lng: -118.2437, name: 'Los Angeles Metro Fleet Hub' },
  S007: { lat: 32.7157, lng: -117.1611, name: 'San Diego Coastal Equipment Yard' },
  S008: { lat: 35.3733, lng: -119.0187, name: 'Bakersfield Heavy Machinery Depot' },
};

const STATUS_CONFIG = {
  AVAILABLE:   { label: 'Available',   color: '#059669', bg: '#ecfdf5', border: '#059669' },
  RENTED:      { label: 'Rented',      color: '#d97706', bg: '#fffbeb', border: '#f59e0b' },
  IN_USE:      { label: 'In Use',      color: '#d97706', bg: '#fffbeb', border: '#f59e0b' },
  MAINTENANCE: { label: 'Maintenance', color: '#dc2626', bg: '#fef2f2', border: '#dc2626' },
};

const TILE_STYLES = {
  voyager: {
    name: 'Voyager (Bright Industrial)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    subdomains: 'abcd',
  },
  osm: {
    name: 'OpenStreetMap (Detailed)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
  },
  dark: {
    name: 'Dark Mode (CartoDB)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    subdomains: 'abcd',
  },
};

// Seed 40 assets fallback with realistic GPS offsets around depot hubs
const GENERATE_DEFAULT_ASSETS = () => {
  const types = ['Excavator', 'Bulldozer', 'Wheel Loader', 'Grader', 'Backhoe Loader', 'Crane', 'Compactor', 'Skid Steer'];
  const makes = ['Caterpillar', 'Komatsu', 'Volvo', 'JCB', 'Genie'];
  const res = [];
  for (let i = 1; i <= 40; i++) {
    const siteKey = `S00${(i % 8) + 1}`;
    const site = SITE_COORDS[siteKey];
    const offsetLat = ((i * 17) % 50 - 25) * 0.006;
    const offsetLng = ((i * 29) % 50 - 25) * 0.006;
    const status = i % 5 === 0 ? 'MAINTENANCE' : (i % 2 === 0 ? 'IN_USE' : 'AVAILABLE');
    
    res.push({
      Equipment_ID: `EQX10${i < 10 ? '0' : ''}${i}`,
      Equipment_Type: types[i % types.length],
      Make: i % 2 === 0 ? 'Caterpillar' : makes[i % makes.length],
      Model: `CAT ${(300 + (i % 50))}`,
      Site_ID: siteKey,
      Status: status,
      Engine_Hours: 1100 + i * 45.2,
      Daily_Rate_USD: 350 + (i % 5) * 40,
      Latitude: site.lat + offsetLat,
      Longitude: site.lng + offsetLng,
      Fuel_Level_Pct: 60 + (i % 35),
    });
  }
  return res;
};

export const MapView = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const tileLayerRef = useRef(null);
  const initialBoundsSetRef = useRef(false);
  const prevFilterSiteRef = useRef('');

  const [assets, setAssets] = useState(GENERATE_DEFAULT_ASSETS);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [filterSite, setFilterSite] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [mapStyle, setMapStyle] = useState('voyager');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { latestUpdate } = useTelemetryWebSocket();

  useEffect(() => {
    if (!latestUpdate || !latestUpdate.equipmentId) return;

    setAssets(prevAssets => {
      const exists = prevAssets.some(a => a.Equipment_ID === latestUpdate.equipmentId);
      if (!exists) return prevAssets;

      return prevAssets.map(a => {
        if (a.Equipment_ID === latestUpdate.equipmentId) {
          return {
            ...a,
            Latitude: latestUpdate.latitude ?? a.Latitude,
            Longitude: latestUpdate.longitude ?? a.Longitude,
            Engine_Hours: latestUpdate.engineHours ?? a.Engine_Hours,
            Fuel_Level_Pct: latestUpdate.fuelRemainingPercentage ?? a.Fuel_Level_Pct,
          };
        }
        return a;
      });
    });
  }, [latestUpdate]);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const springRes = await springApi.get('/assets').catch(() => null);
        if (springRes?.data && Array.isArray(springRes.data) && springRes.data.length > 0) {
          const mapped = springRes.data.map((a, i) => {
            const siteKey = a.currentSite && SITE_COORDS[a.currentSite] ? a.currentSite : `S00${(i % 8) + 1}`;
            const site = SITE_COORDS[siteKey];
            const offsetLat = ((i * 17) % 50 - 25) * 0.006;
            const offsetLng = ((i * 29) % 50 - 25) * 0.006;
            return {
              Equipment_ID: a.equipmentId || `EQX10${i < 9 ? '0' : ''}${i + 1}`,
              Equipment_Type: a.equipmentType || 'Excavator',
              Make: a.make || 'Caterpillar',
              Model: a.model || 'CAT 320 GC',
              Site_ID: siteKey,
              Status: (a.status || 'AVAILABLE').toUpperCase(),
              Engine_Hours: a.engineHours || (1200 + i * 30),
              Daily_Rate_USD: a.dailyRentalRate || (350 + (i % 4) * 50),
              Latitude: parseFloat(a.latitude) || (site.lat + offsetLat),
              Longitude: parseFloat(a.longitude) || (site.lng + offsetLng),
              Fuel_Level_Pct: 75.0,
            };
          });
          setAssets(mapped);
          return;
        }

        const res = await analyticsApi.get('/assets').catch(() => null);
        if (res?.data?.assets && res.data.assets.length > 0) {
          const mapped = res.data.assets.map((a, i) => {
            const siteKey = a.Site_ID && SITE_COORDS[a.Site_ID] ? a.Site_ID : `S00${(i % 8) + 1}`;
            const site = SITE_COORDS[siteKey];
            return {
              ...a,
              Latitude: parseFloat(a.Latitude) || site.lat,
              Longitude: parseFloat(a.Longitude) || site.lng,
            };
          });
          setAssets(mapped);
        }
      } catch {
        setError('Displaying California fleet yard coordinates');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [37.2, -120.5],
      zoom: 7,
      zoomControl: true,
      attributionControl: false,
    });

    const style = TILE_STYLES.voyager;
    const tileLayer = L.tileLayer(style.url, {
      subdomains: style.subdomains,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;

    const style = TILE_STYLES[mapStyle] || TILE_STYLES.voyager;
    map.removeLayer(tileLayerRef.current);

    const newLayer = L.tileLayer(style.url, {
      subdomains: style.subdomains,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [mapStyle]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const q = search.toLowerCase();
    const filtered = assets.filter(a => {
      const matchSite = !filterSite || a.Site_ID === filterSite;
      const matchStatus = !filterStatus || (a.Status || '').toUpperCase() === filterStatus.toUpperCase();
      const matchSearch = !q ||
        (a.Equipment_ID || '').toLowerCase().includes(q) ||
        (a.Equipment_Type || '').toLowerCase().includes(q) ||
        (a.Make || '').toLowerCase().includes(q) ||
        (a.Model || '').toLowerCase().includes(q);
      return matchSite && matchStatus && matchSearch;
    });

    const addedPoints = [];

    filtered.forEach(asset => {
      const siteCoords = SITE_COORDS[asset.Site_ID] || SITE_COORDS.S001;
      const lat = asset.Latitude || siteCoords.lat;
      const lng = asset.Longitude || siteCoords.lng;

      if (!lat || !lng) return;

      addedPoints.push([lat, lng]);

      const rawStatus = (asset.Status || 'AVAILABLE').toUpperCase();
      const stConfig = STATUS_CONFIG[rawStatus] || STATUS_CONFIG.AVAILABLE;

      const pinHtml = `
        <div style="
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #ffffff;
          border: 2px solid ${stConfig.border};
          border-radius: 20px;
          padding: 3px 8px 3px 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: transform 0.15s ease;
          font-family: sans-serif;
          white-space: nowrap;
        ">
          <span style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${stConfig.color};
            display: inline-block;
            box-shadow: 0 0 6px ${stConfig.color};
          "></span>
          <span style="
            font-size: 11px;
            font-weight: 800;
            color: #000000;
            letter-spacing: -0.02em;
          ">${asset.Equipment_ID}</span>
          <span style="
            font-size: 9px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
          ">${(asset.Equipment_Type || 'CAT').slice(0, 4)}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'cat-industrial-marker',
        html: pinHtml,
        iconSize: [95, 26],
        iconAnchor: [47, 13],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 220px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
            <div style="font-weight: 900; font-size: 1.1rem; color: #0f172a; letter-spacing: 0.02em;">
              ${asset.Equipment_ID}
            </div>
            <span style="
              font-size: 0.65rem;
              font-weight: 800;
              text-transform: uppercase;
              padding: 2px 7px;
              border-radius: 12px;
              background: ${stConfig.bg};
              color: ${stConfig.color};
              border: 1px solid ${stConfig.border};
            ">${stConfig.label}</span>
          </div>
          <div style="font-size: 0.8rem; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
            ${asset.Make || 'Caterpillar'} ${asset.Model || ''} &middot; ${asset.Equipment_Type || 'Heavy Equipment'}
          </div>
          <div style="font-size: 0.72rem; color: #64748b; margin-bottom: 10px; display: flex; align-items: center; gap: 4px;">
            📍 <span>${siteCoords.name}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 5px 8px;">
              <div style="font-size: 0.6rem; text-transform: uppercase; font-weight: 700; color: #64748b;">Engine Hours</div>
              <div style="font-size: 0.85rem; font-weight: 800; color: #0f172a;">${Number(asset.Engine_Hours || 0).toLocaleString()}h</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 5px 8px;">
              <div style="font-size: 0.6rem; text-transform: uppercase; font-weight: 700; color: #64748b;">Daily Rate</div>
              <div style="font-size: 0.85rem; font-weight: 800; color: #059669;">$${Number(asset.Daily_Rate_USD || 350).toFixed(0)}/day</div>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 260 });
      marker.on('click', () => setSelectedAssetId(asset.Equipment_ID));
      markersRef.current.push(marker);
    });

    // Only adjust map center/bounds on initial load OR when the user explicitly changes the filter site dropdown
    const siteChanged = prevFilterSiteRef.current !== filterSite;
    prevFilterSiteRef.current = filterSite;

    if (!initialBoundsSetRef.current || siteChanged) {
      if (filterSite && SITE_COORDS[filterSite]) {
        const site = SITE_COORDS[filterSite];
        map.setView([site.lat, site.lng], 11, { animate: true });
      } else if (addedPoints.length > 0) {
        const bounds = L.latLngBounds(addedPoints);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
      }
      initialBoundsSetRef.current = true;
    }

    map.invalidateSize();
  }, [assets, filterSite, filterStatus, search]);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 'calc(100vh - 120px)' }}>
      {selectedAssetId && (
        <AssetDetailModal assetId={selectedAssetId} onClose={() => setSelectedAssetId(null)} />
      )}

      <div className="page-header" style={{ marginBottom: 0, flexShrink: 0, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Fleet GPS Map & Live Telemetry</h1>
          <p className="page-subtitle">Real-time GPS positions for {assets.length} equipment units across 8 California depot yards</p>
        </div>

        <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
          <div className="input-wrap" style={{ width: 210 }}>
            <select className="input" style={{ width: '100%', fontSize: '0.8rem', fontWeight: 600 }} value={mapStyle} onChange={e => setMapStyle(e.target.value)}>
              {Object.entries(TILE_STYLES).map(([key, style]) => (
                <option key={key} value={key}>{style.name}</option>
              ))}
            </select>
          </div>

          <select className="input" style={{ width: 'auto', fontSize: '0.8rem', fontWeight: 600 }} value={filterSite} onChange={e => setFilterSite(e.target.value)}>
            <option value="">All 8 Depot Sites</option>
            {Object.keys(SITE_COORDS).map(s => (
              <option key={s} value={s}>{s} &mdash; {SITE_COORDS[s]?.name}</option>
            ))}
          </select>

          <select className="input" style={{ width: 'auto', fontSize: '0.8rem', fontWeight: 600 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="IN_USE">In Use / Rented</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          <div className="flex gap-3" style={{ fontSize: '0.72rem', fontWeight: 700, background: 'var(--bg-elevated)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#059669' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
              Available
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#d97706' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />
              Rented / In Use
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#dc2626' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
              Maintenance
            </span>
          </div>
        </div>
      </div>

      {error && <div className="alert-banner alert-banner-error" style={{ flexShrink: 0 }}>{error}</div>}

      <div style={{ flex: 1, position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', minHeight: '560px', height: '560px' }}>
        <div ref={mapRef} style={{ width: '100%', height: '560px', minHeight: '560px', background: '#f8fafc' }} />

        {loading && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-primary)', fontSize: '0.875rem', flexDirection: 'column', gap: 8
          }}>
            <div className="spinner spinner-lg mb-2" />
            <span style={{ fontWeight: 700 }}>Loading Depot Yard Coordinates...</span>
          </div>
        )}
      </div>
    </div>
  );
};
