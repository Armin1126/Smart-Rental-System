import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { StatusBadge, PriorityBadge, ActionBadge } from './Badges';
import { getEquipmentIcon } from './icons/equipment';
import {
  X,
  Calendar,
  Clock,
  GasPump,
  ThermometerHot,
  User,
  MapPin,
  FileText,
  Pulse,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  CurrencyDollar
} from '@phosphor-icons/react';

const ASSET_CATALOG_MOCK = {
  EQX1001: { make: 'Caterpillar', model: 'CAT 320 GC', year: 2024, type: 'Backhoe Loader', site: 'S001', checkIn: '2025-04-01', checkOut: '2025-04-16', rDays: 15, engineHours: 1450.4, idleHours: 185.2, fuel: 76.5, temp: 86, rate: 450, op: 'OP101', status: 'IN_USE', rec: 'Right-Size Asset Swap', recPrio: 'HIGH', recJust: 'Heavy asset operating under light load (13% util). Swap to CAT 420 Backhoe Loader saves customer $180/day & returns heavy asset to depot inventory.' },
  EQX1002: { make: 'Komatsu', model: 'D65EX', year: 2023, type: 'Crane', site: 'S002', checkIn: '2025-03-10', checkOut: '2025-03-30', rDays: 20, engineHours: 1800.0, idleHours: 210.5, fuel: 64.0, temp: 88, rate: 520, op: 'NULL', status: 'AVAILABLE', rec: 'Dispatch Field Refuel', recPrio: 'MEDIUM', recJust: 'Routine fuel level monitoring scheduled.' },
  EQX1003: { make: 'Volvo', model: 'L120H', year: 2024, type: 'Bulldozer', site: 'S002', checkIn: '2025-02-15', checkOut: '2025-03-11', rDays: 25, engineHours: 1232.2, idleHours: 140.0, fuel: 82.0, temp: 84, rate: 420, op: 'OP203', status: 'RENTED', rec: 'Right-Size Asset Swap', recPrio: 'HIGH', recJust: 'Heavy asset operating under light load (21.2% util). Swap to CAT 420 Backhoe Loader saves customer $180/day & returns heavy asset to depot inventory.' },
  EQX1004: { make: 'JCB', model: '3CX', year: 2023, type: 'Compactor', site: 'S004', checkIn: '2025-05-05', checkOut: '2025-05-15', rDays: 10, engineHours: 2490.1, idleHours: 310.0, fuel: 48.5, temp: 96, rate: 468, op: 'OP106', status: 'MAINTENANCE', rec: 'Schedule Maintenance', recPrio: 'HIGH', recJust: '250-hour oil & filter service due in 12 engine hours (Health Score: 52.0/100).' },
  EQX1005: { make: 'Caterpillar', model: 'CAT 14M', year: 2022, type: 'Bulldozer', site: 'S006', checkIn: '2025-01-01', checkOut: '2025-01-31', rDays: 30, engineHours: 2846.9, idleHours: 350.0, fuel: 91.0, temp: 85, rate: 517, op: 'OP301', status: 'RENTED', rec: 'Proactive Extension Offer', recPrio: 'MEDIUM', recJust: 'High active utilization with contract expiration approaching. Extension predicted.' },
  EQX1006: { make: 'Caterpillar', model: 'CAT 259D3', year: 2024, type: 'Grader', site: 'S001', checkIn: '2025-04-05', checkOut: '2025-04-23', rDays: 18, engineHours: 1276.6, idleHours: 155.0, fuel: 55.0, temp: 87, rate: 516, op: 'OP114', status: 'IN_USE', rec: 'Proactive Extension Offer', recPrio: 'MEDIUM', recJust: 'High active utilization (81.1%) with 1 days remaining. Extension predicted.' },
  EQX1007: { make: 'Caterpillar', model: 'CAT CB2.7', year: 2023, type: 'Crane', site: 'S001', checkIn: '2025-03-20', checkOut: '2025-04-01', rDays: 12, engineHours: 3233.8, idleHours: 410.0, fuel: 72.0, temp: 89, rate: 560, op: 'NULL', status: 'AVAILABLE', rec: 'Right-Size Asset Swap', recPrio: 'HIGH', recJust: 'Heavy asset operating under light load (0.0% util). Swap to CAT 420 Backhoe Loader saves customer $180/day.' },
};

export const AssetDetailModal = ({ assetId, onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('specs');
  const [actionSuccess, setActionSuccess] = useState(null);

  if (!assetId) return null;

  const data = ASSET_CATALOG_MOCK[assetId] || {
    make: 'Caterpillar', model: 'CAT Standard', year: 2024, type: 'Machinery', site: 'S001',
    checkIn: '2025-04-01', checkOut: '2025-04-16', rDays: 15, engineHours: 1250.0, idleHours: 150.0,
    fuel: 75.0, temp: 85, rate: 450, op: 'OP101', status: 'RENTED',
    rec: 'Contract Extension', recPrio: 'LOW', recJust: 'Rental contract operating normally.'
  };

  const handleExecuteCta = () => {
    const act = (data.rec || '').toLowerCase();
    let msg = `Action executed for ${assetId}!`;
    if (act.includes('swap') || act.includes('right-size')) {
      msg = `Right-Sizing discount quote (-$180/day) sent to customer for ${assetId}. Heavy asset reserved for central depot.`;
    } else if (act.includes('extension')) {
      msg = `1-Click Extension proposal issued for ${assetId}. Contract extended by 14 days.`;
    } else if (act.includes('maintenance')) {
      msg = `Service technician dispatched for ${assetId}. Maintenance ticket logged.`;
    }
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 5000);
  };

  const modalContent = (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container fade-in" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 8,
              background: 'var(--brand-accent)', color: '#000000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '1.2rem', border: '1px solid #e6b800'
            }}>
              {getEquipmentIcon(data.type, { size: 24, color: '#000000' })}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{assetId}</h2>
                <StatusBadge status={data.status} />
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {data.make} {data.model} · {data.type} ({data.year})
              </p>
            </div>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: 6, borderRadius: '50%' }}>
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>

        {/* Action Success Alert */}
        {actionSuccess && (
          <div style={{ background: '#d1fae5', border: '1px solid #059669', color: '#065f46', padding: '12px 18px', fontSize: '0.82rem', fontWeight: 600 }}>
            {actionSuccess}
          </div>
        )}

        {/* Tab Bar Navigation */}
        <div className="modal-tabs">
          <button className={`modal-tab ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')}>
            <FileText size={15} />
            <span>Contract Specs</span>
          </button>
          <button className={`modal-tab ${activeTab === 'telemetry' ? 'active' : ''}`} onClick={() => setActiveTab('telemetry')}>
            <Pulse size={15} weight="bold" />
            <span>Live Telemetry & Health</span>
          </button>
          <button className={`modal-tab ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>
            <ShieldCheck size={15} />
            <span>AI Optimization</span>
          </button>
        </div>

        {/* Tab 1: Contract Specs */}
        {activeTab === 'specs' && (
          <div className="modal-body">
            <div className="grid-2 mb-4">
              <div className="card" style={{ padding: '16px 18px', marginBottom: 0 }}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={15} color="var(--brand-accent-hover)" />
                  <span className="tracking-uppercase">Contract Dates</span>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {data.checkIn} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>to</span> {data.checkOut}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                  Total Rental Duration: <strong className="tabular-nums">{data.rDays} days</strong>
                </div>
              </div>

              <div className="card" style={{ padding: '16px 18px', marginBottom: 0 }}>
                <div className="flex items-center gap-2 mb-2">
                  <CurrencyDollar size={15} weight="bold" color="var(--emerald)" />
                  <span className="tracking-uppercase">Rental Valuation</span>
                </div>
                <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ${data.rate}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/day</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                  Estimated Contract Value: <strong className="tabular-nums">${(data.rate * data.rDays).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '18px 20px', marginBottom: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div>
                  <span className="tracking-uppercase">Site Depot</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={14} color="var(--brand-accent-hover)" /> {data.site}
                  </div>
                </div>
                <div>
                  <span className="tracking-uppercase">Assigned Operator</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={14} color="var(--text-secondary)" /> {data.op}
                  </div>
                </div>
                <div>
                  <span className="tracking-uppercase">Manufacture Year</span>
                  <div className="tabular-nums" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                    {data.year}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live Telemetry & Health */}
        {activeTab === 'telemetry' && (
          <div className="modal-body">
            <div className="grid-3 mb-4">
              <div className="card" style={{ padding: '16px 18px', marginBottom: 0 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="tracking-uppercase">Engine Hours</span>
                  <Clock size={15} color="var(--text-muted)" />
                </div>
                <div className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {data.engineHours.toFixed(1)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>hrs</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Idle: <strong className="tabular-nums">{data.idleHours.toFixed(1)} hrs</strong>
                </div>
              </div>

              <div className="card" style={{ padding: '16px 18px', marginBottom: 0 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="tracking-uppercase">Fuel Tank Level</span>
                  <GasPump size={15} weight="bold" color="var(--text-muted)" />
                </div>
                <div className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: data.fuel < 25 ? 'var(--rose)' : 'var(--text-primary)' }}>
                  {data.fuel.toFixed(1)}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={13} weight="bold" /> Sensor Active
                </div>
              </div>

              <div className="card" style={{ padding: '16px 18px', marginBottom: 0 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="tracking-uppercase">Coolant Temp</span>
                  <ThermometerHot size={15} weight="bold" color="var(--text-muted)" />
                </div>
                <div className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: data.temp > 95 ? 'var(--rose)' : 'var(--text-primary)' }}>
                  {data.temp}°C
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Status: <strong style={{ color: 'var(--text-primary)' }}>Normal</strong>
                </div>
              </div>
            </div>

            <button
              className="btn btn-secondary flex items-center justify-between"
              style={{ width: '100%', padding: '12px 18px' }}
              onClick={() => { onClose(); navigate(`/telemetry?assetId=${assetId}`); }}
            >
              <div className="flex items-center gap-2">
                <Pulse size={16} weight="bold" color="var(--brand-accent-hover)" />
                <span style={{ fontWeight: 700 }}>Open Real-Time Telemetry Stream →</span>
              </div>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Tab 3: AI Recommendations */}
        {activeTab === 'ai' && (
          <div className="modal-body">
            <div className="card" style={{ padding: '20px 22px', marginBottom: 20, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="tracking-uppercase">Active AI Optimization Recommendation</span>
                <PriorityBadge priority={data.recPrio} />
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <ActionBadge action={data.rec} />
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {data.recJust}
              </p>
            </div>

            <button
              className="btn btn-primary flex items-center justify-center gap-2"
              style={{ width: '100%', padding: '12px', fontSize: '0.85rem' }}
              onClick={handleExecuteCta}
            >
              <span>Execute Operations Action</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close Window</button>
          <button className="btn btn-primary btn-sm" onClick={() => { onClose(); navigate('/telemetry'); }}>
            View Telemetry
          </button>
        </div>

      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
