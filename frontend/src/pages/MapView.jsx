import React, { useState, useEffect, useRef } from 'react';
import { analyticsApi } from '../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default marker icons (broken by bundler)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Known site locations
const SITE_COORDS = {
  S001: { lat: 37.7749,  lng: -122.4194, name: 'San Francisco Main Depot' },
  S002: { lat: 37.3382,  lng: -121.8863, name: 'Silicon Valley Hub' },
  S003: { lat: 37.8044,  lng: -122.2712, name: 'Oakland Port Yard' },
  S004: { lat: 38.5816,  lng: -121.4944, name: 'Sacramento Yard' },
  S005: { lat: 37.3861,  lng: -121.9642, name: 'San Jose North' },
  S006: { lat: 36.7468,  lng: -119.7726, name: 'Fresno Industrial Depot' },
  S007: { lat: 40.5865,  lng: -122.3917, name: 'Redding Heavy Yard' },
  S008: { lat: 35.3733,  lng: -119.0187, name: 'Bakersfield Fleet Hub' },
};

const STATUS_COLORS = {
  AVAILABLE:   '#10b981',
  RENTED:      '#0284c7',
  IN_USE:      '#0284c7',
  MAINTENANCE: '#ea580c',
};

const TILE_STYLES = {
  voyager: {
    name: '🎨 Voyager (Bright & Clear)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    subdomains: 'abcd',
  },
  dark: {
    name: '🌙 Dark Mode',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    subdomains: 'abcd',
  },
  osm: {
    name: '🗺️ OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
  },
};

export const MapView = () => {
  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef   = useRef(null);
  const markersRef     = useRef([]);

  const [assets,     setAssets]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [filterSite, setFilterSite] = useState('');
  const [mapStyle,   setMapStyle]   = useState('voyager');

  // Load assets from API
  useEffect(() => {
    analyticsApi.get('/assets')
      .then(res => setAssets(res.data.assets || []))
      .catch(() => setError('Could not load asset locations. Is FastAPI running on port 8000?'))
      .finally(() => setLoading(false));
  }, []);

  // Initialize Leaflet map on mount
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [37.7749, -122.4194],
      zoom: 7,
      zoomControl: true,
    });

    const currentStyle = TILE_STYLES[mapStyle] || TILE_STYLES.voyager;
    const tileLayer = L.tileLayer(currentStyle.url, {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: currentStyle.subdomains,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Resize observer & invalidation timer
    const interval = setInterval(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    setTimeout(() => clearInterval(interval), 1500);

    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    observer.observe(mapRef.current);

    return () => {
      clearInterval(interval);
      observer.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  // Dynamic Tile Layer Update on style change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const selectedStyle = TILE_STYLES[mapStyle] || TILE_STYLES.voyager;
    const newTileLayer = L.tileLayer(selectedStyle.url, {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: selectedStyle.subdomains,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [mapStyle]);

  // Update markers and view bounds whenever assets or filterSite changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const visible = filterSite ? assets.filter(a => a.Site_ID === filterSite) : assets;
    const addedPoints = [];

    visible.forEach(asset => {
      const siteCoords = SITE_COORDS[asset.Site_ID] || { lat: parseFloat(asset.Latitude) || 37.7749, lng: parseFloat(asset.Longitude) || -122.4194, name: asset.Site_ID };
      
      // Deterministic small jitter based on equipment ID so markers don't overlap completely
      const idNum = parseInt((asset.Equipment_ID || '100').replace(/\D/g, '')) || 100;
      const jitterLat = ((idNum % 7) - 3) * 0.008;
      const jitterLng = (((idNum * 3) % 7) - 3) * 0.008;
      
      const lat = siteCoords.lat + jitterLat;
      const lng = siteCoords.lng + jitterLng;

      addedPoints.push([lat, lng]);

      const status = (asset.Status || 'AVAILABLE').toUpperCase();
      const color  = STATUS_COLORS[status] || '#64748b';

      const marker = L.circleMarker([lat, lng], {
        radius: 9,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.95,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;min-width:190px;padding:4px 0">
          <div style="font-weight:800;font-size:0.9rem;color:#ffcd00;margin-bottom:6px">${asset.Equipment_ID}</div>
          <div style="font-size:0.78rem;color:#94a3b8;margin-bottom:4px">
            <b style="color:#f1f5f9">${asset.Equipment_Type}</b><br/>
            ${asset.Make || ''} ${asset.Model || ''}
          </div>
          <div style="font-size:0.72rem;color:#64748b;margin-bottom:8px">
            📍 ${asset.Site_ID} — ${siteCoords.name}
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <span style="font-size:0.68rem;background:${color}22;color:${color};padding:2px 8px;border-radius:10px;border:1px solid ${color}55;font-weight:700;text-transform:uppercase">${status}</span>
          </div>
          <div style="margin-top:8px;font-size:0.7rem;color:#64748b">
            ⚙️ <b style="color:#f1f5f9">${Number(asset.Engine_Hours || 0).toLocaleString()}</b> hrs &nbsp;
            💰 <b style="color:#10b981">$${Number(asset.Daily_Rate_USD || 0).toFixed(0)}/day</b>
          </div>
        </div>
      `);

      marker.on('click', () => setSelected(asset));
      markersRef.current.push(marker);
    });

    // Auto pan/zoom map to fit markers or site center
    if (filterSite && SITE_COORDS[filterSite]) {
      const site = SITE_COORDS[filterSite];
      map.setView([site.lat, site.lng], 11, { animate: true });
    } else if (addedPoints.length > 0) {
      const bounds = L.latLngBounds(addedPoints);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }
    
    map.invalidateSize();
  }, [assets, filterSite]);

  const sites = [...new Set(assets.map(a => a.Site_ID).filter(Boolean))].sort();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0, flexShrink: 0 }}>
        <div>
          <h1 className="page-title">Fleet Map</h1>
          <p className="page-subtitle">{assets.length} assets across {sites.length || 8} sites</p>
        </div>
        <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
          {/* Map Style Selector */}
          <select className="select" value={mapStyle} onChange={e => setMapStyle(e.target.value)}>
            {Object.entries(TILE_STYLES).map(([key, style]) => (
              <option key={key} value={key}>{style.name}</option>
            ))}
          </select>

          {/* Site Filter */}
          <select className="select" value={filterSite} onChange={e => setFilterSite(e.target.value)}>
            <option value="">All Sites</option>
            {(sites.length > 0 ? sites : Object.keys(SITE_COORDS)).map(s => (
              <option key={s} value={s}>{s} — {SITE_COORDS[s]?.name || s}</option>
            ))}
          </select>

          {/* Legend */}
          <div className="flex gap-3" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {[['AVAILABLE','#10b981'],['RENTED','#0284c7'],['MAINTENANCE','#ea580c']].map(([label, color]) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="alert-banner alert-banner-error" style={{ flexShrink: 0 }}>⚠️ {error}</div>}

      {/* Map Container */}
      <div style={{ flex: 1, position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', minHeight: '540px', height: '540px' }}>
        {/* Leaflet map div */}
        <div ref={mapRef} style={{ width: '100%', height: '540px', minHeight: '540px', background: '#e2e8f0' }} />

        {/* Loading Overlay */}
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1000,
            background: 'rgba(15, 17, 23, 0.65)', backdropFilter: 'blur(2px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyCenter: 'center',
            gap: 12, color: 'var(--text-secondary)', fontSize: '0.85rem'
          }}>
            <div className="spinner spinner-lg" />
            <span>Loading asset locations…</span>
          </div>
        )}

        {/* Selected asset info panel */}
        {selected && (
          <div style={{
            position: 'absolute', top: 16, right: 16, zIndex: 1001,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '16px 20px', minWidth: 240, maxWidth: 280,
            boxShadow: '0 8px 32px rgba(0,0,0,.6)',
          }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <span style={{ fontWeight: 800, color: 'var(--amber)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem' }}>
                {selected.Equipment_ID}
              </span>
              <button onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>
                ✕
              </button>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
              {selected.Equipment_Type} · {selected.Make} {selected.Model}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Site',      value: selected.Site_ID },
                { label: 'Status',    value: selected.Status || 'AVAILABLE' },
                { label: 'Eng Hours', value: Number(selected.Engine_Hours || 0).toLocaleString() },
                { label: 'Daily Rate',value: `$${Number(selected.Daily_Rate_USD || 0).toFixed(0)}` },
              ].map(f => (
                <div key={f.label} style={{ background: 'var(--bg-elevated)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
