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

  const unreadCount = notifications.length;

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
                  top: 46,
                  right: 0,
                  width: 380,
                  maxHeight: 480,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  animation: 'fadeIn 0.15s ease-out'
                }}>
                  {/* Header */}
                  <div style={{
                    padding: '12px 16px',
                    background: 'var(--bg-elevated)',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Bell size={16} color="var(--brand-accent-hover)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Notifications & Alerts
                      </span>
                      {unreadCount > 0 && (
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 10,
                          background: 'rgba(220, 38, 38, 0.1)',
                          color: '#dc2626',
                          border: '1px solid rgba(220, 38, 38, 0.2)'
                        }}>
                          {unreadCount} Live
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleClearAll}
                          title="Clear all topbar notifications"
                          style={{
                            background: 'rgba(220, 38, 38, 0.08)',
                            border: '1px solid rgba(220, 38, 38, 0.2)',
                            borderRadius: 6,
                            padding: '3px 8px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: '#dc2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginRight: 2
                          }}
                        >
                          <Trash2 size={12} />
                          <span>Clear All</span>
                        </button>
                      )}
                      <button
                        onClick={fetchNotifications}
                        title="Refresh"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                      >
                        <RotateCw size={14} className={loadingNotifs ? 'spin' : ''} />
                      </button>
                      <button
                        onClick={() => setShowDropdown(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* List Body */}
                  <div style={{ flex: 1, overflowY: 'auto', maxHeight: 360 }}>
                    {loadingNotifs ? (
                      <div style={{ padding: 24, textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Fetching notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div style={{ padding: 32, textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <CheckCircle size={24} weight="bold" color="var(--emerald)" />
                        <span>All topbar notifications cleared!</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          System-wide anomalies remain saved on the <strong style={{ color: 'var(--brand-accent-hover)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => handleActionClick('/alerts')}>Alerts & Anomalies page →</strong>
                        </span>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: '12px 16px',
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
                            {n.type === 'FUEL' && <GasPump size={16} weight="bold" color="#dc2626" />}
                            {n.type === 'CONTRACT' && <FileText size={16} weight="bold" color="#d97706" />}
                            {n.type === 'FAULT' && <Warning size={16} weight="bold" color="#dc2626" />}
                            {n.type === 'ANOMALY' && <Pulse size={16} weight="bold" color="#0284c7" />}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {n.title}
                                {n.assetId && (
                                  <span style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    fontFamily: 'monospace',
                                    padding: '1px 5px',
                                    borderRadius: 4,
                                    background: 'var(--bg-hover)',
                                    color: 'var(--text-secondary)'
                                  }}>
                                    {n.assetId}
                                  </span>
                                )}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                {n.timestamp}
                              </span>
                            </div>

                            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 6 }}>
                              {n.message}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: 'var(--brand-accent-hover)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3
                              }}>
                                {n.action || 'View Details'} <CaretRight size={12} weight="bold" />
                              </span>

                              <button
                                onClick={(e) => handleDismiss(n.id, e)}
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  color: 'var(--text-muted)',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{
                    padding: '8px 16px',
                    background: 'var(--bg-elevated)',
                    borderTop: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)'
                  }}>
                    Scope: <strong style={{ color: 'var(--text-primary)' }}>{companyName} ({isCustomer ? customerCode : 'Dealer Admin'})</strong>
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


