import React, { useState, useEffect, useRef } from 'react';
import { analyticsApi } from '../services/api';

// We import Leaflet dynamically to avoid SSR issues
let L;
if (typeof window !== 'undefined') {
  L = require('leaflet');
  require('leaflet/dist/leaflet.css');
}

// Fix leaflet default icon
const fixLeafletIcons = () => {
  if (!L) return;
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

// Site coordinates
const SITE_COORDS = {
  S001: { lat: 37.7749, lng: -122.4194, name: 'San Francisco Main Depot' },
  S002: { lat: 37.3382, lng: -121.8863, name: 'Silicon Valley Hub' },
  S003: { lat: 37.8044, lng: -122.2712, name: 'Oakland Port Yard' },
  S004: { lat: 38.5816, lng: -121.4944, name: 'Sacramento Yard' },
  S005: { lat: 37.3861, lng: -121.9642, name: 'San Jose North' },
  S006: { lat: 36.7468, lng: -119.7726, name: 'Fresno Industrial Depot' },
  S007: { lat: 40.5865, lng: -122.3917, name: 'Redding Heavy Yard' },
  S008: { lat: 35.3733, lng: -119.0187, name: 'Bakersfield Fleet Hub' },
};

const STATUS_COLORS = {
  AVAILABLE: '#10b981',
  RENTED: '#38bdf8',
  MAINTENANCE: '#f97316',
  IN_USE: '#38bdf8',
};

export const MapView = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filterSite, setFilterSite] = useState('');

  useEffect(() => {
    fixLeafletIcons();
    const load = async () => {
      try {
        const res = await analyticsApi.get('/assets');
        setAssets(res.data.assets || []);
      } catch {
        setError('Could not load asset locations. Is FastAPI running on port 8000?');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [37.7, -121.5],
      zoom: 7,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  // Add markers when assets load
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !L || assets.length === 0) return;

    // Clear existing markers
    map.eachLayer(layer => { if (layer instanceof L.Marker || layer instanceof L.CircleMarker) map.removeLayer(layer); });

    const filtered = filterSite ? assets.filter(a => a.Site_ID === filterSite) : assets;

    filtered.forEach(asset => {
      const siteId = asset.Site_ID;
      const coords = SITE_COORDS[siteId];
      if (!coords) return;

      // Jitter so overlapping assets don't stack
      const jitter = () => (Math.random() - 0.5) * 0.05;
      const lat = coords.lat + jitter();
      const lng = coords.lng + jitter();

      const status = (asset.Status || 'AVAILABLE').toUpperCase();
      const color = STATUS_COLORS[status] || '#64748b';

      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      });

      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; min-width: 180px;">
          <div style="font-weight: 800; font-size: 0.95rem; color: #ffcd00; margin-bottom: 8px;">${asset.Equipment_ID}</div>
          <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;"><b style="color:#f1f5f9">${asset.Equipment_Type}</b> · ${asset.Make} ${asset.Model}</div>
          <div style="font-size: 0.75rem; color: #64748b;">Site: <b style="color:#38bdf8">${siteId}</b> — ${coords.name}</div>
          <div style="margin-top: 6px; display: flex; gap: 8px;">
            <div style="font-size: 0.7rem; background: ${color}22; color: ${color}; padding: 2px 8px; border-radius: 10px; border: 1px solid ${color}44; font-weight: 700; text-transform: uppercase;">${status}</div>
          </div>
          <div style="margin-top: 8px; font-size: 0.72rem; color: #64748b;">
            Engine Hours: <b style="color:#f1f5f9">${Number(asset.Engine_Hours || 0).toLocaleString()}</b>
          </div>
          <div style="font-size: 0.72rem; color: #64748b;">
            Daily Rate: <b style="color:#10b981">$${Number(asset.Daily_Rate_USD || 0).toFixed(0)}</b>
          </div>
        </div>
      `);

      marker.on('click', () => setSelected(asset));
      marker.addTo(map);
    });
  }, [assets, filterSite]);

  const sites = [...new Set(assets.map(a => a.Site_ID).filter(Boolean))].sort();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--topbar-h) - 56px)', gap: 16 }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Fleet Map</h1>
          <p className="page-subtitle">{assets.length} assets across {sites.length} sites</p>
        </div>
        <div className="flex gap-3 items-center">
          <select className="select" value={filterSite} onChange={e => setFilterSite(e.target.value)}>
            <option value="">All Sites</option>
            {sites.map(s => <option key={s} value={s}>{s} — {SITE_COORDS[s]?.name || s}</option>)}
          </select>
          {/* Legend */}
          <div className="flex gap-3" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {Object.entries(STATUS_COLORS).slice(0,3).map(([k, v]) => (
              <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: v, display: 'inline-block' }} />
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="alert-banner alert-banner-error">⚠️ {error}</div>}

      {loading ? (
        <div className="loading-center" style={{ flex: 1 }}>
          <div className="spinner spinner-lg" /><span>Loading asset locations…</span>
        </div>
      ) : (
        <div style={{ flex: 1, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative', minHeight: 400 }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 400 }} />

          {/* Selected Asset Panel */}
          {selected && (
            <div style={{
              position: 'absolute', top: 16, right: 16, zIndex: 1000,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '16px 20px', minWidth: 240,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 800, color: 'var(--amber)', fontFamily: 'JetBrains Mono, monospace' }}>{selected.Equipment_ID}</span>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{selected.Equipment_Type} · {selected.Make} {selected.Model}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Site', value: selected.Site_ID },
                  { label: 'Status', value: selected.Status },
                  { label: 'Engine Hrs', value: Number(selected.Engine_Hours || 0).toLocaleString() },
                  { label: 'Daily Rate', value: `$${Number(selected.Daily_Rate_USD || 0).toFixed(0)}` },
                ].map(f => (
                  <div key={f.label} style={{ background: 'var(--bg-elevated)', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{f.value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
