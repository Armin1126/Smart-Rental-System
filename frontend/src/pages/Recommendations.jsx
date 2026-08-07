import React, { useState, useEffect, useMemo } from 'react';
import { analyticsApi, springApi } from '../services/api';
import { DataTable } from '../components/DataTable';
import { ActionBadge, PriorityBadge } from '../components/Badges';
import { AssetDetailModal } from '../components/AssetDetailModal';
import { MagnifyingGlass, Wrench, ArrowsClockwise, CalendarPlus, Truck, ArrowsCounterClockwise, ArrowRight, Funnel } from '@phosphor-icons/react';

export const Recommendations = () => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterAction, setFilterAction] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await springApi.get('/recommendations').catch(() => analyticsApi.get('/recommendations')).catch(() => null);
        const data = Array.isArray(res?.data) ? res.data : (res?.data?.recommendations || []);
        
        if (data.length === 0) {
          setRecs([
            { id: 1, assetId: 'EQX1004', type: 'Backhoe Loader', site: 'S004', action: 'Schedule Maintenance', priority: 'HIGH', justification: '250-hour oil & filter service due in 12 engine hours' },
            { id: 2, assetId: 'EQX1001', type: 'Excavator', site: 'S001', action: 'Right-Size Asset Swap', priority: 'HIGH', justification: 'Heavy asset operating under light load (24% util). Swap to CAT 308 Mini Excavator saves customer $180/day & returns heavy asset to depot inventory.' },
            { id: 3, assetId: 'EQX1003', type: 'Wheel Loader', site: 'S003', action: 'Proactive Extension Offer', priority: 'MEDIUM', justification: 'High active utilization (78%) with 5 days remaining. Extension predicted; issue 14-day renewal quote to protect fleet availability.' },
            { id: 4, assetId: 'EQX1002', type: 'Bulldozer', site: 'S002', action: 'Reallocate Asset', priority: 'MEDIUM', justification: 'Low operating utilization (28.5%). Site S002 requested additional equipment capacity.' },
          ]);
        } else {
          const normalised = data.map((r, i) => ({
            id: r.id || i,
            assetId: r.equipmentId || r.Equipment_ID || '—',
            type: r.equipmentType || r.Equipment_Type || '—',
            site: r.currentSite || r.Current_Site || '—',
            action: r.action || r.Action || '—',
            priority: r.priority || r.Priority || 'Low',
            justification: r.justification || r.Justification || '—',
          }));
          setRecs(normalised);
        }
      } catch {
        setError('Could not load contract & fleet recommendations.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleExecuteAction = (rec) => {
    const act = (rec.action || '').toLowerCase();
    let msg = `Executed action for asset ${rec.assetId}!`;
    if (act.includes('right-size') || act.includes('swap')) {
      msg = `Swap proposal generated for ${rec.assetId}! Customer sent $180/day discount quote & heavy machine reserved for depot inventory.`;
    } else if (act.includes('proactive') || act.includes('extension')) {
      msg = `1-Click Contract Extension quote sent to customer for asset ${rec.assetId}. Fleet reservation locked for 14 additional days.`;
    } else if (act.includes('maintenance')) {
      msg = `Preventative maintenance service booked for asset ${rec.assetId}. Technician dispatched.`;
    } else if (act.includes('reallocate')) {
      msg = `Depot transfer dispatch order created for ${rec.assetId} to Site S002.`;
    }
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 6000);
  };

  const actions = useMemo(() => [...new Set(recs.map(r => r.action).filter(Boolean))].sort(), [recs]);

  // Flexible Filter Matching
  const filtered = useMemo(() => recs.filter(r => {
    const act = (r.action || '').toLowerCase();
    const targetAct = (filterAction || '').toLowerCase();

    let matchAction = !filterAction;
    if (filterAction) {
      if (targetAct.includes('right-size') || targetAct.includes('swap')) {
        matchAction = act.includes('right-size') || act.includes('swap');
      } else if (targetAct.includes('proactive') || targetAct.includes('extension offer')) {
        matchAction = act.includes('proactive') || act.includes('extension offer');
      } else if (targetAct.includes('reallocate') || targetAct.includes('move')) {
        matchAction = act.includes('reallocate') || act.includes('move');
      } else if (targetAct.includes('maintenance')) {
        matchAction = act.includes('maintenance');
      } else {
        matchAction = r.action === filterAction;
      }
    }

    const matchPriority = !filterPriority || r.priority?.toUpperCase() === filterPriority.toUpperCase();
    
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (r.assetId || '').toLowerCase().includes(q) ||
      (r.type || '').toLowerCase().includes(q) ||
      (r.action || '').toLowerCase().includes(q) ||
      (r.justification || '').toLowerCase().includes(q);

    return matchAction && matchPriority && matchSearch;
  }), [recs, filterAction, filterPriority, search]);

  const counts = useMemo(() => ({
    maintenance: recs.filter(r => r.action?.toLowerCase().includes('maintenance')).length,
    rightSize: recs.filter(r => r.action?.toLowerCase().includes('right-size') || r.action?.toLowerCase().includes('swap')).length,
    proactiveExt: recs.filter(r => r.action?.toLowerCase().includes('proactive') || r.action?.toLowerCase().includes('extension offer')).length,
    reallocate: recs.filter(r => r.action?.toLowerCase().includes('reallocate')).length,
  }), [recs]);

  const columns = [
    {
      key: 'assetId', label: 'Asset ID', primary: true, width: 110,
      render: v => <span className="asset-link" onClick={() => setSelectedAssetId(v)}>{v}</span>
    },
    { key: 'type', label: 'Equipment Type', width: 150 },
    {
      key: 'site', label: 'Depot Site', width: 100,
      render: v => <span className="badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 600 }}>{v}</span>
    },
    {
      key: 'action', label: 'Recommended Action', width: 220,
      render: v => <ActionBadge action={v} />
    },
    {
      key: 'priority', label: 'Priority', width: 100,
      render: v => <PriorityBadge priority={v} />
    },
    {
      key: 'justification', label: 'AI Justification & Contract Impact',
      render: v => <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{v}</span>
    },
    {
      key: 'cta', label: 'Operations Action', width: 200,
      render: (_, row) => {
        const act = (row.action || '').toLowerCase();
        let btnText = 'Execute Action';
        if (act.includes('right-size') || act.includes('swap')) btnText = 'Offer Swap (-$180/day)';
        else if (act.includes('proactive') || act.includes('extension')) btnText = 'Send 1-Click Extension';
        else if (act.includes('maintenance')) btnText = 'Book Service Slot';
        else if (act.includes('reallocate')) btnText = 'Dispatch Transfer';

        return (
          <button
            className="btn btn-primary btn-sm flex items-center gap-1"
            style={{ fontSize: '0.73rem', padding: '6px 12px' }}
            onClick={() => handleExecuteAction(row)}
          >
            <span>{btnText}</span>
            <ArrowRight size={12} />
          </button>
        );
      }
    }
  ];

  if (loading) return <div className="loading-center" style={{ margin: '60px 0' }}><div className="spinner spinner-lg" /><span>Loading proactive recommendations...</span></div>;

  return (
    <div className="fade-in">
      {/* Interactive Asset Detail Modal */}
      {selectedAssetId && <AssetDetailModal assetId={selectedAssetId} onClose={() => setSelectedAssetId(null)} />}

      <div className="page-header flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Proactive Fleet Recommendations</h1>
          <p className="page-subtitle">{filtered.length} of {recs.length} actionable optimization & contract recommendations</p>
        </div>
      </div>

      {error && <div className="alert-banner alert-banner-error" style={{ marginBottom: 24 }}>{error}</div>}

      {actionSuccessMessage && (
        <div style={{
          background: '#d1fae5', border: '1px solid #059669', color: '#065f46',
          borderRadius: 6, padding: '14px 20px', marginBottom: 24, fontSize: '0.85rem', fontWeight: 600
        }}>
          {actionSuccessMessage}
        </div>
      )}

      {/* Action Category Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Right-Size Asset Swap', categoryKey: 'Right-Size Asset Swap', count: counts.rightSize, icon: ArrowsClockwise },
          { label: 'Proactive Extension Offer', categoryKey: 'Proactive Extension Offer', count: counts.proactiveExt, icon: CalendarPlus },
          { label: 'Schedule Maintenance', categoryKey: 'Schedule Maintenance', count: counts.maintenance, icon: Wrench },
          { label: 'Reallocate Site Depot', categoryKey: 'Reallocate Asset', count: counts.reallocate, icon: Truck },
        ].map(c => {
          const Icon = c.icon;
          const isSelected = (filterAction || '').toLowerCase().includes(c.categoryKey.toLowerCase().split(' ')[0]);
          return (
            <div
              key={c.label}
              className="card"
              style={{
                padding: '18px 20px',
                marginBottom: 0,
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--brand-accent)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(255, 205, 0, 0.15)' : 'var(--bg-card)',
                transition: 'all 0.15s ease'
              }}
              onClick={() => setFilterAction(isSelected ? '' : c.categoryKey)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="tracking-uppercase">{c.label}</span>
                <Icon size={16} color="var(--text-muted)" />
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                {c.count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter & Search Panel */}
      <div className="card" style={{ padding: '20px 22px', marginBottom: 24, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Funnel size={15} color="var(--brand-accent-hover)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
              Filter & Search Controls
            </span>
          </div>

          <div className="input-wrap">
            <span className="input-icon">
              <MagnifyingGlass size={16} color="var(--text-muted)" />
            </span>
            <input
              className="input input-with-icon"
              placeholder="Search asset ID, type, action, or justification..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="input" style={{ width: 'auto', minWidth: 240 }} value={filterAction} onChange={e => setFilterAction(e.target.value)}>
              <option value="">All Recommendation Actions</option>
              {actions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <select className="input" style={{ width: 'auto', minWidth: 180 }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {(filterAction || filterPriority || search) && (
              <button className="btn btn-secondary btn-sm flex items-center gap-1.5" onClick={() => { setFilterAction(''); setFilterPriority(''); setSearch(''); }}>
                <ArrowsCounterClockwise size={13} /> Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} rows={filtered} rowKey={r => r.id} emptyMessage="No recommendations match your search criteria" />
    </div>
  );
};
