import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import {
  MagnifyingGlass,
  Clock,
  Buildings,
  ShieldCheck,
  Bell,
  Warning,
  GasPump,
  FileText,
  CheckCircle,
  X,
  ArrowsClockwise,
  CaretRight,
  Broadcast,
  Trash
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { useTelemetryWebSocket } from '../hooks/useTelemetryWebSocket';
import { springApi } from '../services/api';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="font-mono" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
      <Clock size={16} weight="bold" color="var(--text-muted)" />
      <span>{time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
    </div>
  );
};

export const Shell = () => {
  const [search, setSearch] = useState('');
  const { user, isCustomer } = useAuth();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const dropdownRef = useRef(null);

  const customerCode = user?.customerCode || 'CUST002';
  const companyName = user?.companyName || (isCustomer ? 'Acme Construction Co.' : 'Caterpillar Fleet Management');

  const { latestUpdate } = useTelemetryWebSocket();

  // Load initial role-based notifications
  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      if (isCustomer) {
        // Customer notifications: contract expiry + customer asset fuel/faults
        const res = await springApi.get(`/notifications?customerCode=${customerCode}`).catch(() => null);
        if (res?.data?.notifications?.length > 0) {
          setNotifications(res.data.notifications);
        } else {
          setNotifications([
            {
              id: 101,
              type: 'CONTRACT',
              severity: 'WARNING',
              title: 'Contract Expiring Soon',
              assetId: customerCode === 'CUST001' ? 'EQX1003' : (customerCode === 'CUST003' ? 'EQX1005' : 'EQX1002'),
              message: `Rental contract for asset assigned to ${companyName} ends in 5 days. Extend contract to avoid surcharges.`,
              timestamp: 'Live DB Record',
              action: 'Extend Contract',
              link: '/customer-portal'
            },
            {
              id: 102,
              type: 'FUEL',
              severity: 'CRITICAL',
              title: 'Low Fuel Telemetry Alert',
              assetId: customerCode === 'CUST001' ? 'EQX1001' : (customerCode === 'CUST003' ? 'EQX1008' : 'EQX1004'),
              message: `Asset fuel level dropped below 18% threshold. Schedule refuel request.`,
              timestamp: 'Live Sensor Stream',
              action: 'View Telemetry',
              link: '/telemetry'
            }
          ]);
        }
      } else {
        // Dealer notifications: fleet-wide critical alerts & anomalies
        const alertsRes = await springApi.get('/alerts').catch(() => null);
        const alertsList = Array.isArray(alertsRes?.data) ? alertsRes.data : [];

        if (alertsList.length > 0) {
          const mapped = alertsList.map((a, idx) => ({
            id: 200 + idx,
            type: a.anomalyType?.includes('FUEL') ? 'FUEL' : (a.anomalyType?.includes('TEMP') || a.anomalyType?.includes('DTC') ? 'FAULT' : 'ANOMALY'),
            severity: a.severity || 'HIGH',
            title: a.anomalyType || 'Fleet Operation Anomaly',
            assetId: a.assetId || a.equipmentId || 'EQX1004',
            message: `${a.description || 'Sensor reading out of standard threshold bounds.'} ${a.recommendedAction ? 'Action: ' + a.recommendedAction : ''}`,
            timestamp: a.timestamp || 'Live Sensor Stream',
            action: 'View Alerts',
            link: '/alerts'
          }));
          setNotifications(mapped);
        } else {
          setNotifications([
            {
              id: 201,
              type: 'FAULT',
              severity: 'CRITICAL',
              title: 'Engine DTC Fault P0217',
              assetId: 'EQX1004',
              message: 'Engine over-temperature warning detected on Caterpillar 320 at Oakland Port Yard.',
              timestamp: 'Live Sensor Stream',
              action: 'View Diagnostics',
              link: '/telemetry'
            },
            {
              id: 202,
              type: 'FUEL',
              severity: 'WARNING',
              title: 'Fleet Low Fuel Warning',
              assetId: 'EQX1001',
              message: 'Asset EQX1001 fuel level at 14.8%. Dispatch fuel tender to San Francisco Depot.',
              timestamp: 'Live Sensor Stream',
              action: 'Check Telemetry',
              link: '/telemetry'
            },
            {
              id: 203,
              type: 'ANOMALY',
              severity: 'MEDIUM',
              title: 'Geofence Reposition Warning',
              assetId: 'EQX1012',
              message: 'Asset moved outside primary work zone perimeter at Sacramento Yard.',
              timestamp: 'GPS Stream',
              action: 'View Map',
              link: '/map'
            }
          ]);
        }
      }
    } catch {
      // Handled cleanly
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user, isCustomer]);

  // Real-time WebSocket anomaly ingestion into notifications badge
  useEffect(() => {
    if (!latestUpdate) return;

    const isLowFuel = latestUpdate.fuelRemainingPercentage !== undefined && latestUpdate.fuelRemainingPercentage < 20.0;
    const isEngineWarning = latestUpdate.engineCondition === 'WARNING' || latestUpdate.diagnosticTroubleCode;

    if (isLowFuel || isEngineWarning) {
      const newNotif = {
        id: Date.now(),
        type: isLowFuel ? 'FUEL' : 'FAULT',
        severity: isEngineWarning ? 'CRITICAL' : 'WARNING',
        title: isEngineWarning ? `Engine DTC Alert (${latestUpdate.diagnosticTroubleCode || 'P0217'})` : 'Low Fuel Warning',
        assetId: latestUpdate.equipmentId,
        message: isEngineWarning
          ? `High temperature warning on ${latestUpdate.equipmentId} (Engine Condition: ${latestUpdate.engineCondition}).`
          : `Fuel remaining is low (${latestUpdate.fuelRemainingPercentage?.toFixed(1)}%).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: 'View Telemetry',
        link: '/telemetry'
      };

      setNotifications((prev) => {
        if (prev.some((n) => n.assetId === newNotif.assetId && n.title === newNotif.title)) {
          return prev;
        }
        return [newNotif, ...prev.slice(0, 19)];
      });
    }
  }, [latestUpdate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDismiss = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    setNotifications([]);
  };

  const handleActionClick = (link) => {
    setShowDropdown(false);
    navigate(link);
  };

  // Customer tenant asset scoping filter
  const customerAssetIds = isCustomer
    ? (customerCode === 'CUST001' ? ['EQX1001', 'EQX1003', 'EQX1010'] : (customerCode === 'CUST003' ? ['EQX1005', 'EQX1008', 'EQX1015'] : ['EQX1002', 'EQX1004', 'EQX1012']))
    : null;

  const displayNotifications = isCustomer
    ? notifications.filter(n => !n.assetId || customerAssetIds.includes(n.assetId))
    : notifications;

  const unreadCount = displayNotifications.length;

  return (
    <div className="shell">
      <Sidebar />
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ flex: '1 1 320px', maxWidth: 440 }}>
            <div className="input-wrap">
              <span className="input-icon">
                <MagnifyingGlass size={18} weight="bold" color="var(--text-muted)" />
              </span>
              <input
                className="input input-with-icon"
                placeholder="Search equipment ID, contract #, or alert type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }} ref={dropdownRef}>
            <LiveClock />

            {/* Notification Bell Symbol */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                title="Notifications & Alerts"
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: showDropdown ? 'var(--bg-hover)' : 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Bell size={20} weight="bold" color={unreadCount > 0 ? '#dc2626' : 'var(--text-muted)'} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    minWidth: 18,
                    height: 18,
                    padding: '0 5px',
                    borderRadius: 9,
                    background: '#dc2626',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.4)',
                    border: '2px solid var(--bg-card)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover Dropdown */}
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 48,
                  right: 0,
                  width: 420,
                  maxWidth: 'calc(100vw - 32px)',
                  maxHeight: 520,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.18)',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  animation: 'fadeIn 0.15s ease-out'
                }}>
                  {/* Header Bar */}
                  <div style={{
                    padding: '14px 18px',
                    background: 'var(--bg-elevated)',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <Bell size={18} weight="bold" color="var(--brand-accent-hover)" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        Notifications & Alerts
                      </span>
                      {unreadCount > 0 && (
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 12,
                          background: 'var(--rose-dim)',
                          color: 'var(--rose)',
                          border: '1px solid var(--rose)',
                          whiteSpace: 'nowrap'
                        }}>
                          {unreadCount} Live
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleClearAll}
                          title="Clear all topbar notifications"
                          style={{
                            background: 'var(--rose-dim)',
                            border: '1px solid var(--rose)',
                            borderRadius: 6,
                            padding: '4px 10px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: 'var(--rose)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Trash size={12} weight="bold" />
                          <span>Clear All</span>
                        </button>
                      )}
                      <button
                        onClick={fetchNotifications}
                        title="Refresh Notifications"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex', alignItems: 'center' }}
                      >
                        <ArrowsClockwise size={15} weight="bold" className={loadingNotifs ? 'spin' : ''} />
                      </button>
                      <button
                        onClick={() => setShowDropdown(false)}
                        title="Close Window"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex', alignItems: 'center' }}
                      >
                        <X size={16} weight="bold" />
                      </button>
                    </div>
                  </div>

                  {/* List Body */}
                  <div style={{ flex: 1, overflowY: 'auto', maxHeight: 380 }}>
                    {loadingNotifs ? (
                      <div style={{ padding: 28, textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Fetching notifications...
                      </div>
                    ) : displayNotifications.length === 0 ? (
                      <div style={{ padding: 36, textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <CheckCircle size={28} weight="bold" color="var(--emerald)" />
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>All notifications cleared!</span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.4 }}>
                          Historical telemetry anomalies remain saved on the <strong style={{ color: 'var(--brand-accent-hover)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => handleActionClick('/alerts')}>Alerts & Anomalies page &rarr;</strong>
                        </span>
                      </div>
                    ) : (
                      displayNotifications.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: '14px 18px',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex',
                            gap: 12,
                            alignItems: 'flex-start',
                            transition: 'background 0.15s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          onClick={() => handleActionClick(n.link || '/telemetry')}
                        >
                          <div style={{ marginTop: 2, flexShrink: 0 }}>
                            {n.type === 'FUEL' && <GasPump size={18} weight="bold" color="#dc2626" />}
                            {n.type === 'CONTRACT' && <FileText size={18} weight="bold" color="#d97706" />}
                            {n.type === 'FAULT' && <Warning size={18} weight="bold" color="#dc2626" />}
                            {n.type === 'ANOMALY' && <Pulse size={18} weight="bold" color="#0284c7" />}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Top Title & Tag & Timestamp Row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0 }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                                  {n.title}
                                </span>
                                {n.assetId && (
                                  <span style={{
                                    fontSize: '0.66rem',
                                    fontWeight: 800,
                                    fontFamily: 'monospace',
                                    padding: '1px 6px',
                                    borderRadius: 4,
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-secondary)',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {n.assetId}
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 1 }}>
                                {n.timestamp}
                              </span>
                            </div>

                            {/* Description */}
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '4px 0 8px 0' }}>
                              {n.message}
                            </p>

                            {/* Action & Dismiss Bar */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                color: 'var(--brand-accent-hover)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3
                              }}>
                                {n.action || 'View Details'} <CaretRight size={13} weight="bold" />
                              </span>

                              <button
                                onClick={(e) => handleDismiss(n.id, e)}
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: 'var(--text-muted)',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '2px 6px',
                                  borderRadius: 4
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--rose)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Scope Footer Bar */}
                  <div style={{
                    padding: '10px 18px',
                    background: 'var(--bg-elevated)',
                    borderTop: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600
                  }}>
                    Notification Scope: <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{isCustomer ? `${companyName} (${customerCode})` : 'Caterpillar Dealer Operations (All Fleets)'}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Tenant/Company Profile Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 8,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-primary)'
            }}>
              <Buildings size={14} weight="bold" color="var(--amber)" />
              <span>{user?.companyName || (isCustomer ? 'Acme Construction Co.' : 'CAT Fleet Management')}</span>
            </div>

            {/* Role Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 8,
              background: isCustomer ? 'rgba(56, 189, 248, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: isCustomer ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: isCustomer ? '#38bdf8' : '#fbbf24'
            }}>
              <ShieldCheck size={13} />
              <span>{user?.role || (isCustomer ? 'CUSTOMER' : 'DEALER')}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};


