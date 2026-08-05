import React from 'react';
import { formatCurrency, getStatusColor } from '../utils/formatters';

export const AssetTable = ({ assets = [] }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-800/60">
      <table className="w-full text-left text-sm text-slate-200">
        <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-slate-700">
          <tr>
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Asset Name</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Daily Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {assets.map((asset) => (
            <tr key={asset.id || asset.assetCode} className="hover:bg-slate-700/30 transition-colors">
              <td className="px-4 py-3 font-mono text-amber-400 font-medium">{asset.assetCode}</td>
              <td className="px-4 py-3 font-semibold">{asset.name}</td>
              <td className="px-4 py-3 text-slate-400">{asset.category}</td>
              <td className="px-4 py-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(asset.status)}`}>
                  {asset.status}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-emerald-400">{formatCurrency(asset.dailyRate)}/day</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
