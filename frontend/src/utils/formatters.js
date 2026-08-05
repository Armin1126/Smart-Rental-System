/**
 * Utility formatter functions for numbers, currency, dates, site locations, and badges.
 */

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const SITE_LOCATIONS = {
  'S001': 'Peoria Proving Grounds, IL 61629, USA',
  'S002': 'Austin Construction Site 4, TX 78701, USA',
  'S003': 'Denver Substation Project, CO 80202, USA',
  'S004': 'Oakland Port Terminal, CA 94607, USA',
  'S005': 'Phoenix Solar Facility, AZ 85001, USA',
  'S006': 'Seattle Transit Expansion, WA 98101, USA',
  'S007': 'Dallas Logistics Hub, TX 75201, USA',
  'S008': 'Chicago Highway Project, IL 60601, USA',
};

export const getSiteLocation = (siteId) => {
  if (!siteId) return 'Peoria Proving Grounds, IL 61629, USA';
  return SITE_LOCATIONS[siteId] || `${siteId} - Peoria Regional Field Office, IL`;
};

export const getLiveTimestamp = (secondsAgo = 0) => {
  const now = new Date(Date.now() - secondsAgo * 1000);
  const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  return `${dateStr}; ${timeStr} CDT`;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'AVAILABLE': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    case 'RENTED': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
    case 'MAINTENANCE': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    case 'ACTIVE': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    case 'RESERVED': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    case 'COMPLETED': return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
  }
};
