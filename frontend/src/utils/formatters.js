/**
 * Utility formatter functions for numbers, currency, dates, and badges.
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
