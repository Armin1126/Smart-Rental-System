import React, { useState, useMemo } from 'react';

/**
 * Generic sortable, filterable data table.
 * Props:
 *   columns: [{ key, label, render?, sortable?, width? }]
 *   rows: array of data objects
 *   rowKey: function(row) => unique key
 *   emptyMessage?: string
 */
export const DataTable = ({ columns = [], rows = [], rowKey, emptyMessage = 'No data available' }) => {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const PER_PAGE = 25;

  const handleSort = (key) => {
    if (sortCol === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const sorted = useMemo(() => {
    if (!sortCol) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortCol] ?? '';
      const bv = b[sortCol] ?? '';
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortCol, sortDir]);

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paged = sorted.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  if (rows.length === 0) {
    return (
      <div className="data-table-wrapper">
        <div className="empty-state">
          <div className="empty-title">{emptyMessage}</div>
          <div className="empty-desc">No records to display</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {col.label}
                    {col.sortable !== false && (
                      <span style={{ opacity: sortCol === col.key ? 1 : 0.3, fontSize: '0.65rem' }}>
                        {sortCol === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={rowKey ? rowKey(row) : i} className="fade-in">
                {columns.map(col => (
                  <td key={col.key} className={col.primary ? 'primary' : ''}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-2" style={{ padding: '8px 0' }}>
          <span className="text-xs text-muted">
            {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, sorted.length)} of {sorted.length}
          </span>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>← Prev</button>
            <span className="text-xs text-muted" style={{ padding: '5px 8px' }}>Page {page + 1}/{totalPages}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
};
