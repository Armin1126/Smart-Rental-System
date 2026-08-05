import React, { useState, useEffect, useMemo } from 'react';
import { analyticsApi } from '../services/api';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/Badges';
import { SparkBar } from '../components/SparkBar';

export const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await analyticsApi.get('/assets');
        setAssets(res.data.assets || []);
      } catch {
        setError('Could not load assets. Is FastAPI running on port 8000?');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const types = useMemo(() => [...new Set(assets.map(a => a.Equipment_Type).filter(Boolean))].sort(), [assets]);
  const sites = useMemo(() => [...new Set(assets.map(a => a.Site_ID).filter(Boolean))].sort(), [assets]);

  const filtered = useMemo(() => {
    return assets.filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        (a.Equipment_ID || '').toLowerCase().includes(q) ||
        (a.Equipment_Type || '').toLowerCase().includes(q) ||
        (a.Make || '').toLowerCase().includes(q) ||
        (a.Model || '').toLowerCase().includes(q);
      const matchType = !filterType || a.Equipment_Type === filterType;
      const matchSite = !filterSite || a.Site_ID === filterSite;
      const matchStatus = !filterStatus || (a.Status || '').toUpperCase() === filterStatus.toUpperCase();
      return matchSearch && matchType && matchSite && matchStatus;
    });
  }, [assets, search, filterType, filterSite, filterStatus]);

  const columns = [
    {
      key: 'Equipment_ID', label: 'Asset ID', primary: true, width: 110,
      render: v => <span className="font-mono" style={{ color: 'var(--amber)', fontWeight: 700 }}>{v}</span>
    },
    { key: 'Equipment_Type', label: 'Type', width: 140 },
    {
      key: 'Make', label: 'Make / Model', width: 160,
      render: (v, row) => <span style={{ color: 'var(--text-secondary)' }}>{v} {row.Model}</span>
    },
    {
      key: 'Site_ID', label: 'Site', width: 80,
      render: v => <span className="badge badge-info">{v}</span>
    },
    {
      key: 'Status', label: 'Status', width: 110,
      render: v => <StatusBadge status={v || 'AVAILABLE'} />
    },
    {
      key: 'Engine_Hours', label: 'Engine Hrs', width: 110,
      render: v => <span className="font-mono">{Number(v || 0).toLocaleString()}</span>
    },
    {
      key: 'Fuel_Capacity_Liters', label: 'Fuel Cap (L)', width: 110,
      render: v => <span className="font-mono">{Number(v || 0).toLocaleString()}</span>
    },
    {
      key: 'Daily_Rate_USD', label: 'Daily Rate', width: 110,
      render: v => <span className="font-mono text-emerald">${Number(v || 0).toFixed(0)}</span>
    },
    {
      key: 'Health_Score', label: 'Health', width: 120,
      render: v => <SparkBar value={parseFloat(v) || 0} max={100} />
    },
  ];

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /><span>Loading assets…</span></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Assets</h1>
          <p className="page-subtitle">{filtered.length} of {assets.length} assets shown</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSearch(''); setFilterType(''); setFilterSite(''); setFilterStatus(''); }}>
          Clear Filters
        </button>
      </div>

      {error && <div className="alert-banner alert-banner-error">⚠️ {error}</div>}

      {/* Filter Bar */}
      <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        <div className="input-wrap" style={{ flex: '1 1 260px' }}>
          <span className="input-icon">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input className="input input-with-icon" placeholder="Search by ID, type, make, model…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="select" value={filterSite} onChange={e => setFilterSite(e.target.value)}>
          <option value="">All Sites</option>
          {sites.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="RENTED">Rented</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={r => r.Equipment_ID}
        emptyMessage="No assets match your filters"
      />
    </div>
  );
};
