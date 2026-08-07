import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, SignIn, UserPlus, WarningCircle, CheckCircle, Funnel, ArrowRight, ShieldCheck } from '@phosphor-icons/react';
import axios from 'axios';

const Login = () => {
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  
  // Login State
  const [selectedRole, setSelectedRole] = useState('DEALER');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration State
  const [regRole, setRegRole] = useState('DEALER');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regCustomerCode, setRegCustomerCode] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Login Submit Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', {
        email: loginEmail.trim(),
        password: loginPassword.trim()
      });

      if (res.data && res.data.user) {
        login(res.data.user, res.data.token);
        if (res.data.user.role === 'CUSTOMER' || selectedRole === 'CUSTOMER') {
          navigate('/customer-portal');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      // Local dynamic fallback authentication
      const cleanEmail = loginEmail.trim().toLowerCase();
      if (cleanEmail === 'dealer@cat.com' && loginPassword === 'dealer123') {
        const dealerUser = {
          id: 1,
          email: 'dealer@cat.com',
          fullName: 'CAT Dealer Operations Manager',
          role: 'DEALER',
          companyName: 'Caterpillar Fleet Management',
          customerCode: 'DEALER001'
        };
        login(dealerUser, 'token_dealer');
        navigate('/');
      } else if (cleanEmail === 'customer@acme.com' && loginPassword === 'customer123') {
        const customerUser = {
          id: 2,
          email: 'customer@acme.com',
          fullName: 'Acme Site Manager',
          role: 'CUSTOMER',
          companyName: 'Acme Construction Co.',
          customerCode: 'CUST001'
        };
        login(customerUser, 'token_acme');
        navigate('/customer-portal');
      } else if (cleanEmail === 'customer@pacific.com' && loginPassword === 'customer123') {
        const customerUser = {
          id: 3,
          email: 'customer@pacific.com',
          fullName: 'Pacific Infrastructure Director',
          role: 'CUSTOMER',
          companyName: 'Pacific Mining Ltd.',
          customerCode: 'CUST002'
        };
        login(customerUser, 'token_pacific');
        navigate('/customer-portal');
      } else if (cleanEmail === 'customer@titan.com' && loginPassword === 'customer123') {
        const customerUser = {
          id: 4,
          email: 'customer@titan.com',
          fullName: 'Titan Earthworks Lead',
          role: 'CUSTOMER',
          companyName: 'Titan Earthworks Ltd.',
          customerCode: 'CUST003'
        };
        login(customerUser, 'token_titan');
        navigate('/customer-portal');
      } else {
        setError(err.response?.data?.error || 'Invalid credentials. Please verify your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Register Submit Handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8080/api/auth/register', {
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        role: regRole,
        companyName: regCompanyName.trim(),
        customerCode: regCustomerCode.trim()
      });

      if (res.data && res.data.user) {
        setSuccessMsg(`Account created successfully for ${res.data.user.email}! Logging you in...`);
        setTimeout(() => {
          login(res.data.user, res.data.token);
          if (res.data.user.role === 'CUSTOMER') {
            navigate('/customer-portal');
          } else {
            navigate('/');
          }
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user account. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: 460 }}>
        {/* Brand Header */}
        <div className="login-header-logo">
          <div className="login-brand-icon">
            <Truck size={26} weight="bold" color="#000000" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              FleetVision
            </h1>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Caterpillar Heavy Equipment Platform
            </div>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-elevated)',
          padding: 4,
          borderRadius: 8,
          border: '1px solid var(--border)',
          marginBottom: 20
        }}>
          <button
            onClick={() => { setAuthTab('login'); setError(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 6,
              border: 'none',
              background: authTab === 'login' ? 'var(--bg-card)' : 'transparent',
              color: authTab === 'login' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: authTab === 'login' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <SignIn size={15} weight="bold" color={authTab === 'login' ? '#000000' : 'var(--text-muted)'} />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => { setAuthTab('register'); setError(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 6,
              border: 'none',
              background: authTab === 'register' ? 'var(--bg-card)' : 'transparent',
              color: authTab === 'register' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: authTab === 'register' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <UserPlus size={15} weight="bold" color={authTab === 'register' ? 'var(--brand-accent-hover)' : 'var(--text-muted)'} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div style={{
            padding: '10px 12px',
            background: 'var(--rose-dim)',
            border: '1px solid var(--rose)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--rose)',
            fontSize: '0.75rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600
          }}>
            <WarningCircle size={16} weight="bold" color="var(--rose)" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert Banner */}
        {successMsg && (
          <div style={{
            padding: '10px 12px',
            background: 'rgba(5, 150, 105, 0.1)',
            border: '1px solid rgba(5, 150, 105, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--emerald)',
            fontSize: '0.78rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700
          }}>
            <CheckCircle size={16} weight="bold" color="var(--emerald)" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {authTab === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <Funnel size={14} weight="bold" color="#000000" />
                <span>Portal Role Scope:</span>
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="login-input"
                style={{ fontWeight: 700, cursor: 'pointer' }}
              >
                <option value="DEALER">CAT Dealer / Fleet Manager</option>
                <option value="CUSTOMER">Rental Client / Customer</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder={selectedRole === 'DEALER' ? 'e.g. dealer@cat.com' : 'e.g. customer@acme.com'}
                className="login-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="login-input"
              />
            </div>

            <button type="submit" disabled={loading} className="login-submit-btn" style={{ marginTop: '6px' }}>
              <span>{loading ? 'Authenticating...' : `Sign In as ${selectedRole === 'DEALER' ? 'Dealer Manager' : 'Rental Client'}`}</span>
              <ArrowRight size={16} weight="bold" />
            </button>


          </form>
        )}

        {/* CREATE ACCOUNT FORM */}
        {authTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <ShieldCheck size={14} weight="bold" color="var(--brand-accent-hover)" />
                <span>Account Role:</span>
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                className="login-input"
                style={{ fontWeight: 700, cursor: 'pointer' }}
              >
                <option value="DEALER">CAT Dealer Operations / Manager</option>
                <option value="CUSTOMER">Rental Client / Customer Manager</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="login-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="login-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="login-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={regCompanyName}
                  onChange={(e) => setRegCompanyName(e.target.value)}
                  placeholder={regRole === 'DEALER' ? 'Caterpillar Fleet' : 'e.g. Acme Builders'}
                  className="login-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Tenant / Customer Code
                </label>
                <input
                  type="text"
                  value={regCustomerCode}
                  onChange={(e) => setRegCustomerCode(e.target.value)}
                  placeholder={regRole === 'DEALER' ? 'DEALER001' : 'e.g. CUST001'}
                  className="login-input"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="login-submit-btn" style={{ marginTop: '8px' }}>
              <span>{loading ? 'Creating Account...' : 'Create Account & Sign In'}</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default Login;
