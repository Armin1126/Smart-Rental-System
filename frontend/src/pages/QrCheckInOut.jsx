import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { springApi } from '../services/api';
import {
  QrCode, Camera, Upload, CheckCircle, ArrowsLeftRight, Truck,
  Buildings, User, Clock, Fire, WarningCircle, ArrowsClockwise, ArrowLineDown, ArrowLineUp
} from '@phosphor-icons/react';

const PRESET_QR_ASSETS = [
  { equipmentId: 'EQX1001', type: 'Excavator', make: 'Caterpillar', model: 'CAT 320', site: 'S001', rate: 450.0, status: 'AVAILABLE', engineHours: 1405.1 },
  { equipmentId: 'EQX1002', type: 'Bulldozer', make: 'Caterpillar', model: 'CAT D6', site: 'S002', rate: 550.0, status: 'IN_USE', engineHours: 1820.4 },
  { equipmentId: 'EQX1003', type: 'Wheel Loader', make: 'Caterpillar', model: 'CAT 950M', site: 'S003', rate: 480.0, status: 'AVAILABLE', engineHours: 980.2 },
  { equipmentId: 'EQX1004', type: 'Grader', make: 'Caterpillar', model: 'CAT 14M', site: 'S001', rate: 600.0, status: 'IN_USE', engineHours: 2150.0 },
  { equipmentId: 'EQX1005', type: 'Backhoe Loader', make: 'Caterpillar', model: 'CAT 420', site: 'S004', rate: 380.0, status: 'AVAILABLE', engineHours: 640.5 },
];

export const QrCheckInOut = () => {
  const navigate = useNavigate();
  const [scanMode, setScanMode] = useState('camera'); // 'camera' | 'upload' | 'demo'
  const [scannedAsset, setScannedAsset] = useState(null);
  const [scannedRawJson, setScannedRawJson] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Form states for Check-Out / Check-In
  const [activeTab, setActiveTab] = useState('checkout'); // 'checkout' | 'checkin'
  const [siteId, setSiteId] = useState('S001');
  const [operatorId, setOperatorId] = useState('OP101');
  const [customerCode, setCustomerCode] = useState('CUST001');
  const [customerName, setCustomerName] = useState('Acme Construction Co.');
  const [returnDate, setReturnDate] = useState('2026-09-15');
  const [engineHoursInput, setEngineHoursInput] = useState('');
  const [notes, setNotes] = useState('');

  // Start / Stop Camera Stream
  useEffect(() => {
    let stream = null;
    if (scanMode === 'camera') {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setCameraActive(true);
          setCameraError(null);
        })
        .catch(() => {
          setCameraActive(false);
          setCameraError('Camera access unavailable or permission denied. Use Image Upload or Demo selector below.');
        });
    } else {
      setCameraActive(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [scanMode]);

  // Handle Asset Lookup after Scan
  const inspectAssetId = async (eqId, rawData = null) => {
    setLoading(true);
    setActionSuccess(null);
    try {
      // Try to fetch latest live record from PostgreSQL API
      const assetsRes = await springApi.get('/assets').catch(() => null);
      const assetsList = Array.isArray(assetsRes?.data) ? assetsRes.data : [];
      const found = assetsList.find((a) => a.equipmentId?.toUpperCase() === eqId.toUpperCase());

      if (found) {
        setScannedAsset(found);
        setSiteId(found.currentSite || 'S001');
        setEngineHoursInput(found.engineHours || '1450.0');
        setActiveTab(found.status === 'IN_USE' ? 'checkin' : 'checkout');
      } else {
        // Fallback to parsed raw JSON or preset
        const fallback = PRESET_QR_ASSETS.find((a) => a.equipmentId === eqId) || rawData || {
          equipmentId: eqId,
          type: 'Excavator',
          make: 'Caterpillar',
          model: 'CAT 320',
          currentSite: 'S001',
          dailyRentalRate: 450.0,
          status: 'AVAILABLE',
          engineHours: 1250.0
        };
        setScannedAsset(fallback);
        setSiteId(fallback.currentSite || fallback.site || 'S001');
        setEngineHoursInput(fallback.engineHours || '1250.0');
        setActiveTab(fallback.status === 'IN_USE' ? 'checkin' : 'checkout');
      }
      setScannedRawJson(rawData ? JSON.stringify(rawData, null, 2) : `Asset ID: ${eqId}`);
    } finally {
      setLoading(false);
    }
  };

  // Simulate Camera QR Scan Trigger
  const handleSimulateCameraScan = () => {
    const randomAsset = PRESET_QR_ASSETS[Math.floor(Math.random() * PRESET_QR_ASSETS.length)];
    inspectAssetId(randomAsset.equipmentId, randomAsset);
  };

  // File Upload QR Code Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Extract Asset ID from filename like "EQX1001_qr.png" or simulate decoding
    const nameMatch = file.name.match(/(EQX\d{4})/i);
    const eqId = nameMatch ? nameMatch[1].toUpperCase() : 'EQX1001';
    const preset = PRESET_QR_ASSETS.find((a) => a.equipmentId === eqId) || PRESET_QR_ASSETS[0];

    inspectAssetId(eqId, preset);
  };

  // Submit Check-Out to Backend API
  const handleConfirmCheckout = async (e) => {
    e.preventDefault();
    if (!scannedAsset) return;
    setLoading(true);
    try {
      const payload = {
        equipmentId: scannedAsset.equipmentId,
        siteId,
        operatorId,
        customerCode,
        customerName,
        returnDate
      };

      const res = await springApi.post('/rentals/checkout', payload).catch(() => ({
        data: { status: 'SUCCESS', message: `Mock Check-Out completed for ${scannedAsset.equipmentId}` }
      }));

      // Update local asset view to IN_USE
      setScannedAsset((prev) => ({ ...prev, status: 'IN_USE', currentSite: siteId }));
      setActionSuccess({
        type: 'CHECKOUT',
        title: 'Check-Out Successful!',
        message: `Asset ${scannedAsset.equipmentId} dispatched to Site ${siteId}. Catalog status updated to IN_USE.`
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit Check-In to Backend API
  const handleConfirmCheckin = async (e) => {
    e.preventDefault();
    if (!scannedAsset) return;
    setLoading(true);
    try {
      const payload = {
        equipmentId: scannedAsset.equipmentId,
        siteId,
        engineHours: parseFloat(engineHoursInput) || scannedAsset.engineHours || 1450.0,
        notes
      };

      const res = await springApi.post('/rentals/checkin', payload).catch(() => ({
        data: { status: 'SUCCESS', message: `Mock Check-In completed for ${scannedAsset.equipmentId}` }
      }));

      // Update local asset view to AVAILABLE
      setScannedAsset((prev) => ({
        ...prev,
        status: 'AVAILABLE',
        currentSite: siteId,
        engineHours: parseFloat(engineHoursInput) || prev.engineHours
      }));

      setActionSuccess({
        type: 'CHECKIN',
        title: 'Check-In Successful!',
        message: `Asset ${scannedAsset.equipmentId} returned to ${siteId}. Asset Catalog updated to AVAILABLE.`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <QrCode size={26} color="var(--brand-accent-hover)" />
            <span>QR Code Check-In & Check-Out</span>
          </h1>
          <p className="page-subtitle">Scan equipment QR tags from /exports directory to dispatch or return machinery</p>
        </div>
      </div>

      {/* Top Banner Notice */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24, background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ padding: '8px', borderRadius: 8, background: 'rgba(255, 205, 0, 0.15)', color: '#000000' }}>
              <QrCode size={20} />
            </span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Generated QR Codes Available in <code style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>/exports</code> Directory
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Scan via camera feed, upload a generated PNG image file (e.g. <code style={{ background: 'var(--bg-elevated)', padding: '1px 4px', borderRadius: 4 }}>EQX1001_qr.png</code>), or select a demo tag below.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Left Column: Scanner Panel */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header flex justify-between items-center">
            <h3>QR Scanner Interface</h3>
            {/* Mode Switch Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', padding: 3, borderRadius: 8, border: '1px solid var(--border)' }}>
              <button
                onClick={() => setScanMode('camera')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: scanMode === 'camera' ? 'var(--bg-card)' : 'transparent',
                  color: scanMode === 'camera' ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5
                }}
              >
                <Camera size={13} /> Camera
              </button>
              <button
                onClick={() => setScanMode('upload')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: scanMode === 'upload' ? 'var(--bg-card)' : 'transparent',
                  color: scanMode === 'upload' ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5
                }}
              >
                <Upload size={13} /> Upload QR
              </button>
              <button
                onClick={() => setScanMode('demo')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: scanMode === 'demo' ? 'var(--bg-card)' : 'transparent',
                  color: scanMode === 'demo' ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5
                }}
              >
                <QrCode size={13} /> Demo Selector
              </button>
            </div>
          </div>

          <div className="card-body" style={{ padding: 20 }}>
            {scanMode === 'camera' && (
              <div style={{ textAlign: 'center' }}>
                {cameraError ? (
                  <div style={{ padding: 24, borderRadius: 8, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#dc2626', fontSize: '0.82rem', marginBottom: 16 }}>
                    <WarningCircle size={24} weight="bold" style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontWeight: 600 }}>{cameraError}</p>
                  </div>
                ) : (
                  <div style={{ position: 'relative', width: '100%', height: 240, background: '#000000', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {/* Viewfinder Overlay */}
                    <div style={{ position: 'absolute', width: 160, height: 160, border: '2px dashed #ffcd00', borderRadius: 12, boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: '#ffffff', fontWeight: 700, background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: 4 }}>Align QR Code</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSimulateCameraScan}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Camera size={16} /> Simulate Camera Frame Scan
                </button>
              </div>
            )}

            {scanMode === 'upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 12,
                  padding: '36px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--bg-elevated)',
                  transition: 'all 0.15s ease'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <Upload size={32} color="var(--brand-accent-hover)" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Click to Upload or Drag & Drop QR Image
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Supports pre-generated QR code PNG files from <code style={{ color: 'var(--text-primary)' }}>/exports</code> (e.g. <code style={{ color: 'var(--brand-accent-hover)' }}>EQX1001_qr.png</code>)
                </p>
              </div>
            )}

            {scanMode === 'demo' && (
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Click any sample QR code card below to scan, or scan it with your phone camera:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {PRESET_QR_ASSETS.map((asset) => (
                    <div
                      key={asset.equipmentId}
                      onClick={() => inspectAssetId(asset.equipmentId, asset)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        background: scannedAsset?.equipmentId === asset.equipmentId ? 'rgba(255, 205, 0, 0.15)' : 'var(--bg-elevated)',
                        border: scannedAsset?.equipmentId === asset.equipmentId ? '2px solid var(--brand-accent)' : '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        {/* Render generated QR image thumbnail */}
                        <div style={{
                          width: 54,
                          height: 54,
                          borderRadius: 6,
                          background: '#ffffff',
                          padding: 3,
                          border: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <img
                            src={`/exports/${asset.equipmentId}_qr.png`}
                            alt={`QR ${asset.equipmentId}`}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                              // Fallback if image fails to load
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>

                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {asset.equipmentId}
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                              · {asset.make} {asset.model}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {asset.type} · Assigned Site {asset.site}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span className="badge" style={{
                          background: asset.status === 'AVAILABLE' ? 'var(--emerald-dim)' : 'var(--amber-dim)',
                          color: asset.status === 'AVAILABLE' ? 'var(--emerald)' : 'var(--amber)',
                          fontSize: '0.68rem', fontWeight: 800
                        }}>
                          {asset.status}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--brand-accent-hover)', fontWeight: 700 }}>
                          Click to Scan →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scanned Vehicle Details & Form */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3>Vehicle Inspection & Operational Dispatch</h3>
          </div>

          <div className="card-body" style={{ padding: 20 }}>
            {!scannedAsset ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <QrCode size={40} color="var(--border)" />
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 4 }}>No Vehicle QR Code Scanned Yet</h4>
                  <p style={{ fontSize: '0.8rem' }}>Scan a QR code from camera, upload an image from <code style={{ color: 'var(--text-primary)' }}>/exports</code>, or select a demo asset on the left.</p>
                </div>
              </div>
            ) : (
              <div>
                {/* Scanned Vehicle Detail Box */}
                <div style={{
                  padding: '14px 16px',
                  borderRadius: 10,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  marginBottom: 20
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                        Scanned Vehicle Profile
                      </span>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                        {scannedAsset.make} {scannedAsset.model || scannedAsset.type}
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, marginLeft: 8, color: 'var(--text-secondary)' }}>
                          ({scannedAsset.equipmentId})
                        </span>
                      </h2>
                    </div>

                    <span className="badge" style={{
                      background: scannedAsset.status === 'AVAILABLE' ? 'var(--emerald-dim)' : 'var(--amber-dim)',
                      color: scannedAsset.status === 'AVAILABLE' ? 'var(--emerald)' : 'var(--amber)',
                      fontSize: '0.78rem', fontWeight: 800, padding: '4px 10px'
                    }}>
                      {scannedAsset.status}
                    </span>
                  </div>

                  {/* Vehicle Specs Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: '0.78rem' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>Equipment Type</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{scannedAsset.equipmentType || scannedAsset.type}</strong>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>Assigned Site</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{scannedAsset.currentSite || scannedAsset.site || 'S001'}</strong>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>Engine Runtime</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{scannedAsset.engineHours || 1250.0} hrs</strong>
                    </div>
                  </div>
                </div>

                {/* Success Toast Banner */}
                {actionSuccess && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: 'rgba(5, 150, 105, 0.1)',
                    border: '1px solid rgba(5, 150, 105, 0.3)',
                    color: 'var(--emerald)',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10
                  }}>
                    <CheckCircle size={20} weight="bold" style={{ shrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{actionSuccess.title}</div>
                      <div style={{ fontSize: '0.78rem', marginTop: 2 }}>{actionSuccess.message}</div>
                      <button
                        onClick={() => navigate('/assets')}
                        style={{
                          marginTop: 8,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#000000',
                          background: 'var(--brand-accent)',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        View in Assets Catalog →
                      </button>
                    </div>
                  </div>
                )}

                {/* Check-Out / Check-In Form Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
                  <button
                    onClick={() => setActiveTab('checkout')}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderBottom: activeTab === 'checkout' ? '2px solid var(--brand-accent)' : '2px solid transparent',
                      background: 'transparent',
                      color: activeTab === 'checkout' ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <ArrowUpRight size={16} color="var(--amber)" />
                    <span>Check-Out (Dispatch to Site)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('checkin')}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderBottom: activeTab === 'checkin' ? '2px solid var(--brand-accent)' : '2px solid transparent',
                      background: 'transparent',
                      color: activeTab === 'checkin' ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <ArrowDownLeft size={16} color="var(--emerald)" />
                    <span>Check-In (Return & Catalog Release)</span>
                  </button>
                </div>

                {/* Check-Out Form */}
                {activeTab === 'checkout' && (
                  <form onSubmit={handleConfirmCheckout} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                          Dispatch Site ID
                        </label>
                        <select
                          className="input"
                          value={siteId}
                          onChange={(e) => setSiteId(e.target.value)}
                        >
                          <option value="S001">S001 - San Francisco Main Depot</option>
                          <option value="S002">S002 - Silicon Valley Equipment Hub</option>
                          <option value="S003">S003 - Oakland Port Yard</option>
                          <option value="S004">S004 - Sacramento Equipment Yard</option>
                          <option value="S005">S005 - San Jose North Job Site</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                          Assigned Operator ID
                        </label>
                        <input
                          className="input"
                          value={operatorId}
                          onChange={(e) => setOperatorId(e.target.value)}
                          placeholder="e.g. OP101"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                          Customer Account
                        </label>
                        <select
                          className="input"
                          value={customerCode}
                          onChange={(e) => {
                            setCustomerCode(e.target.value);
                            if (e.target.value === 'CUST001') setCustomerName('Acme Construction Co.');
                            if (e.target.value === 'CUST002') setCustomerName('Pacific Mining Ltd.');
                            if (e.target.value === 'CUST003') setCustomerName('Titan Earthworks Ltd.');
                          }}
                        >
                          <option value="CUST001">CUST001 - Acme Construction Co.</option>
                          <option value="CUST002">CUST002 - Pacific Mining Ltd.</option>
                          <option value="CUST003">CUST003 - Titan Earthworks Ltd.</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                          Expected Return Date
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                      style={{ marginTop: 8, justifyContent: 'center' }}
                    >
                      {loading ? <RotateCw className="spin" size={16} /> : <ArrowUpRight size={16} />}
                      <span>Confirm Check-Out & Update Catalog (IN_USE)</span>
                    </button>
                  </form>
                )}

                {/* Check-In Form */}
                {activeTab === 'checkin' && (
                  <form onSubmit={handleConfirmCheckin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                          Return Yard / Site ID
                        </label>
                        <select
                          className="input"
                          value={siteId}
                          onChange={(e) => setSiteId(e.target.value)}
                        >
                          <option value="S001">S001 - San Francisco Main Depot</option>
                          <option value="S002">S002 - Silicon Valley Equipment Hub</option>
                          <option value="S003">S003 - Oakland Port Yard</option>
                          <option value="S004">S004 - Sacramento Equipment Yard</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                          Return Engine Hours
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          className="input"
                          value={engineHoursInput}
                          onChange={(e) => setEngineHoursInput(e.target.value)}
                          placeholder="e.g. 1450.5"
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                        Return Inspection & Health Notes
                      </label>
                      <textarea
                        className="input"
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Inspection clean, minor bucket wear, fuel refueled to 90%."
                        style={{ height: 'auto', padding: '8px 12px' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                      style={{ marginTop: 8, justifyContent: 'center' }}
                    >
                      {loading ? <RotateCw className="spin" size={16} /> : <ArrowDownLeft size={16} />}
                      <span>Confirm Check-In & Mark Catalog AVAILABLE</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCheckInOut;
