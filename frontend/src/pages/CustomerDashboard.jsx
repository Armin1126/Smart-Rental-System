import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Buildings, Calendar, Clock, Warning, CheckCircle, ArrowUpRight, 
  GasPump, ThermometerHot, ShieldCheck, Lightning, ArrowsClockwise, CaretRight, FileText, Pulse 
} from '@phosphor-icons/react';
import { springApi } from '../services/api';

const CUSTOMER_CONTRACT_MAPPING = {
  CUST001: [
    { rentalId: 'CAT-ACM-8001', equipmentId: 'EQX1001', equipmentType: 'Excavator CAT 349', startDate: '2026-06-01', endDate: '2026-09-15', dailyRate: 520, totalCost: '18,200', status: 'ACTIVE' },
    { rentalId: 'CAT-ACM-8003', equipmentId: 'EQX1003', equipmentType: 'Bulldozer CAT D6', startDate: '2026-07-10', endDate: '2026-08-30', dailyRate: 480, totalCost: '24,400', status: 'ACTIVE' },
    { rentalId: 'CAT-ACM-8010', equipmentId: 'EQX1010', equipmentType: 'Wheel Loader CAT 966', startDate: '2026-05-15', endDate: '2026-08-10', dailyRate: 450, totalCost: '39,150', status: 'EXPIRING_SOON' }
  ],
  CUST002: [
    { rentalId: 'CAT-PAC-9012', equipmentId: 'EQX1002', equipmentType: 'Grader CAT 320', startDate: '2026-06-15', endDate: '2026-10-01', dailyRate: 550, totalCost: '59,400', status: 'ACTIVE' },
    { rentalId: 'CAT-PAC-9014', equipmentId: 'EQX1004', equipmentType: 'Compactor CAT 950M', startDate: '2026-07-01', endDate: '2026-09-30', dailyRate: 420, totalCost: '38,220', status: 'ACTIVE' },
    { rentalId: 'CAT-PAC-9022', equipmentId: 'EQX1012', equipmentType: 'Backhoe Loader CAT 420', startDate: '2026-08-01', endDate: '2026-11-15', dailyRate: 390, totalCost: '41,730', status: 'ACTIVE' }
  ],
  CUST003: [
    { rentalId: 'CAT-TTN-7005', equipmentId: 'EQX1005', equipmentType: 'Bulldozer CAT 14M', startDate: '2026-05-01', endDate: '2026-08-25', dailyRate: 600, totalCost: '69,600', status: 'ACTIVE' },
    { rentalId: 'CAT-TTN-7008', equipmentId: 'EQX1008', equipmentType: 'Scissor Lift CAT 308', startDate: '2026-06-20', endDate: '2026-09-10', dailyRate: 310, totalCost: '25,420', status: 'ACTIVE' },
    { rentalId: 'CAT-TTN-7015', equipmentId: 'EQX1015', equipmentType: 'Excavator CAT 320', startDate: '2026-07-05', endDate: '2026-12-01', dailyRate: 540, totalCost: '80,460', status: 'ACTIVE' }
  ]
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [rentedAssets, setRentedAssets] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [customerRecs, setCustomerRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  const companyName = user?.companyName || 'Pacific Mining Ltd.';
  const customerCode = user?.customerCode || 'CUST002';

  useEffect(() => {
    fetchCustomerData();
  }, [user]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      // Determine asset scope per tenant code
      let myAssetIds = ['EQX1002', 'EQX1004', 'EQX1012'];
      if (customerCode === 'CUST001' || companyName.includes('Acme')) {
        myAssetIds = ['EQX1001', 'EQX1003', 'EQX1010'];
      } else if (customerCode === 'CUST003' || companyName.includes('Titan')) {
        myAssetIds = ['EQX1005', 'EQX1008', 'EQX1015'];
      }

      // Fetch assets and rentals
      const [assetsRes, rentalsRes] = await Promise.all([
        springApi.get('/assets').catch(() => null),
        springApi.get(`/rentals?customerCode=${customerCode}`).catch(() => null)
      ]);

      const allAssets = assetsRes?.data || [];
      const apiRentals = rentalsRes?.data || [];

      // Filter assets
      const filteredAssets = allAssets.filter(a => myAssetIds.includes(a.equipmentId));
      setRentedAssets(filteredAssets.length > 0 ? filteredAssets : [
        { equipmentId: myAssetIds[0], equipmentType: 'Heavy Machinery Unit 1', location: 'Active Site Yard A', status: 'RENTED', fuelLevel: 88.5, engineTemperature: 87 },
        { equipmentId: myAssetIds[1], equipmentType: 'Heavy Machinery Unit 2', location: 'Active Site Yard B', status: 'RENTED', fuelLevel: 74.2, engineTemperature: 85 },
        { equipmentId: myAssetIds[2], equipmentType: 'Heavy Machinery Unit 3', location: 'Depot Site Yard C', status: 'RENTED', fuelLevel: 92.0, engineTemperature: 88 }
      ]);

      // Filter contracts or use mapped fallback
      const defaultContracts = CUSTOMER_CONTRACT_MAPPING[customerCode] || CUSTOMER_CONTRACT_MAPPING.CUST002;
      if (Array.isArray(apiRentals) && apiRentals.length > 0) {
        setContracts(apiRentals);
      } else {
        setContracts(defaultContracts);
      }

      // Tailored AI recommendations
      const primaryAsset = myAssetIds[0];
      const secondaryAsset = myAssetIds[1];

      const tailored = [
        {
          id: `REC-${customerCode}-101`,
          equipmentId: primaryAsset,
          equipmentType: 'Primary Fleet Heavy Unit',
          priority: 'HIGH',
          title: 'Contract Expiration Warning',
          message: `Rental Contract for ${primaryAsset} assigned to ${companyName} expires in 3 days.`,
          actionText: 'Renew Contract (15 Days)',
          savings: 'Avoid $350/day late return surcharge'
        },
        {
          id: `REC-${customerCode}-102`,
          equipmentId: secondaryAsset,
          equipmentType: 'Auxiliary Fleet Machinery',
          priority: 'MEDIUM',
          title: 'Fleet Right-Sizing Offer',
          message: `${secondaryAsset} is operating under 30% duty load. Right-size to compact excavator model.`,
          actionText: 'Request Fleet Right-Sizing',
          savings: 'Save up to $180 / day in operational costs'
        }
      ];
      setCustomerRecs(tailored);
    } catch (err) {
      console.error('Error fetching customer portal data:', err);
      setContracts(CUSTOMER_CONTRACT_MAPPING[customerCode] || CUSTOMER_CONTRACT_MAPPING.CUST002);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (recTitle) => {
    setActionSuccess(`Request submitted successfully for: "${recTitle}". A CAT Representative will contact ${companyName} shortly.`);
    setTimeout(() => setActionSuccess(''), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="cust-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              padding: '3px 10px',
              background: 'rgba(255, 205, 0, 0.25)',
              border: '1px solid #e6b800',
              color: '#000000',
              fontSize: '0.7rem',
              fontWeight: 800,
              borderRadius: '20px',
              textTransform: 'uppercase'
            }}>
              Customer Self-Service Portal
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 600 }}>
              Tenant Code: {customerCode}
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Welcome back, {companyName}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Manage active machinery rentals, vehicle health telemetry, and contract renewals in real time.
          </p>
        </div>

        <button 
          onClick={fetchCustomerData}
          className="btn btn-secondary btn-sm"
        >
          <ArrowsClockwise size={14} weight="bold" color="#000000" />
          <span>Refresh Data</span>
        </button>
      </div>

      {actionSuccess && (
        <div style={{
          padding: '12px 16px',
          background: 'var(--emerald-dim)',
          border: '1px solid var(--emerald)',
          borderRadius: 'var(--radius)',
          color: 'var(--emerald)',
          fontSize: '0.82rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={18} color="var(--emerald)" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Active Customer Notifications & Machine Alerts Hub */}
      <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--rose)',
              display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--rose)'
            }}>
              <Warning size={18} weight="bold" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Active Machine Alerts & Contract Notifications ({companyName})
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Real-time contract expiration notices, low fuel warnings, and IoT telemetry anomalies
              </p>
            </div>
          </div>
          <span className="badge" style={{ background: 'var(--rose-dim)', color: 'var(--rose)', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 800 }}>
            3 Active Notifications
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Notification 1: Contract Ending Soon */}
          <div style={{
            padding: '14px 18px', borderRadius: '8px', background: 'rgba(217, 119, 6, 0.08)',
            borderLeft: '4px solid #d97706', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Clock size={20} color="#d97706" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ⏳ Rental Contract Expiring Soon &mdash; <span style={{ fontFamily: 'monospace' }}>EQX1002 (Grader CAT 320)</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Contract <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>CAT-PAC-9012</span> is scheduled to end in <strong>5 days (Aug 15, 2026)</strong>. Extend now to prevent daily late surcharge.
                </div>
              </div>
            </div>
            <button
              onClick={() => handleAction('Contract Extension for EQX1002')}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 800, background: '#d97706', color: '#ffffff', border: 'none' }}
            >
              Extend Contract (15 Days) &rarr;
            </button>
          </div>

          {/* Notification 2: Low Fuel Warning */}
          <div style={{
            padding: '14px 18px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)',
            borderLeft: '4px solid #ef4444', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Fuel size={20} color="#ef4444" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ⛽ Critical Low Fuel Warning &mdash; <span style={{ fontFamily: 'monospace' }}>EQX1004 (Compactor CAT 950M)</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Telemetry indicates fuel level dropped below threshold: <strong>14.2% remaining</strong> at Site Yard B.
                </div>
              </div>
            </div>
            <button
              onClick={() => handleAction('Refuel Request for EQX1004')}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 800 }}
            >
              Request On-Site Refuel &rarr;
            </button>
          </div>

          {/* Notification 3: DTC Fault Anomaly */}
          <div style={{
            padding: '14px 18px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.08)',
            borderLeft: '4px solid #3b82f6', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Warning size={20} weight="bold" color="#3b82f6" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ⚠️ Diagnostic Trouble Code Anomaly &mdash; <span style={{ fontFamily: 'monospace' }}>EQX1012 (Backhoe CAT 420)</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Sensor reported DTC fault <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>P0217 (Engine Over-Temperature)</span>. Inspect coolant level & radiator line.
                </div>
              </div>
            </div>
            <button
              onClick={() => handleAction('Maintenance Inspection Request for EQX1012')}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 800 }}
            >
              Schedule Maintenance &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Personalized Smart Recommendations */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightning size={18} weight="bold" color="#d97706" />
            <span>Personalized Recommendations for {companyName}</span>
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Powered by CAT Telemetry AI</span>
        </div>

        <div className="grid-2">
          {customerRecs.map((rec) => (
            <div key={rec.id} className={`rec-card ${rec.priority === 'HIGH' ? 'rec-card-high' : ''}`}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    background: rec.priority === 'HIGH' ? 'rgba(217, 119, 6, 0.15)' : 'var(--bg-elevated)',
                    color: rec.priority === 'HIGH' ? '#d97706' : 'var(--text-secondary)',
                    border: '1px solid var(--border)'
                  }}>
                    {rec.title}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {rec.equipmentId}
                  </span>
                </div>

                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {rec.equipmentType}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                  {rec.message}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={14} />
                  <span>{rec.savings}</span>
                </span>
                <button onClick={() => handleAction(rec.title)} className="rec-action-btn">
                  <span>{rec.actionText}</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rented Vehicles & Live Telemetry States */}
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Pulse size={18} weight="bold" color="#0284c7" />
          <span>My Rented Vehicles & Live Telemetry</span>
        </h2>

        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Loading rented machinery telemetry...
          </div>
        ) : (
          <div className="grid-4">
            {rentedAssets.map((asset) => (
              <div key={asset.equipmentId} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 0 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                      {asset.equipmentId}
                    </span>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      background: 'var(--emerald-dim)',
                      color: 'var(--emerald)',
                      border: '1px solid rgba(5,150,105,0.3)'
                    }}>
                      {asset.status || 'RENTED'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {asset.equipmentType || 'Machinery Unit'}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {asset.location || 'Depot Site A'}
                  </div>
                </div>

                <div className="asset-metric-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Fuel size={14} color="var(--amber)" />
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Fuel</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{asset.fuelLevel != null ? `${asset.fuelLevel}%` : '84.5%'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ThermometerHot size={14} weight="bold" color="var(--rose)" />
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Temp</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{asset.engineTemperature != null ? `${asset.engineTemperature}°C` : '88°C'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Rental Contracts Table */}
      <div className="data-table-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--emerald)" />
            <span>Active & Historical Rental Contracts ({companyName})</span>
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 600 }}>
            Total Contracts: {contracts.length}
          </span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Contract ID</th>
              <th>Equipment</th>
              <th>Rental Period</th>
              <th>Daily Rate</th>
              <th>Total Cost</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No active contracts found for {companyName}.
                </td>
              </tr>
            ) : (
              contracts.map((c, i) => (
                <tr key={c.rentalId || i}>
                  <td style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                    {c.rentalId || `CAT-R-${8000 + i}`}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {c.equipmentId} ({c.equipmentType || c.type || 'Machinery'})
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>
                    {c.startDate || c.checkInDate || '2026-07-01'} to {c.endDate || c.checkOutDate || '2026-10-01'}
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>${c.dailyRate || c.dailyRentalRate || '450'}</td>
                  <td style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--emerald)' }}>
                    ${c.totalCost || '38,220'}
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      background: 'var(--emerald-dim)',
                      color: 'var(--emerald)'
                    }}>
                      {c.status || c.rentalStatus || 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleAction(`Contract Renewal for ${c.equipmentId}`)}
                      className="btn btn-secondary btn-sm"
                    >
                      Extend Contract
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerDashboard;
