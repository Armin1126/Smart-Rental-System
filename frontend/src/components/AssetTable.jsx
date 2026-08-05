import React from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WifiIcon from '@mui/icons-material/Wifi';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Caterpillar Equipment Category Icons / Thumbnails
const MachineThumbnail = ({ type = '' }) => {
  const t = type.toLowerCase();

  if (t.includes('excavator') || t.includes('ex')) {
    return (
      <div className="w-10 h-7 bg-amber-100 rounded border border-amber-300 flex items-center justify-center text-[#ffcd00] font-bold text-[10px]">
        🚜
      </div>
    );
  }
  if (t.includes('dozer') || t.includes('dz') || t.includes('bulldozer')) {
    return (
      <div className="w-10 h-7 bg-yellow-100 rounded border border-yellow-300 flex items-center justify-center text-yellow-800 font-bold text-[10px]">
        🚜
      </div>
    );
  }
  if (t.includes('skid') || t.includes('skd')) {
    return (
      <div className="w-10 h-7 bg-[#ffcd00]/20 rounded border border-[#ffcd00]/40 flex items-center justify-center text-amber-900 font-bold text-[10px]">
        🚜
      </div>
    );
  }
  if (t.includes('loader') || t.includes('bl') || t.includes('wheel')) {
    return (
      <div className="w-10 h-7 bg-amber-50 rounded border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-[10px]">
        🚜
      </div>
    );
  }
  if (t.includes('truck') || t.includes('tr')) {
    return (
      <div className="w-10 h-7 bg-slate-100 rounded border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-[10px]">
        🛻
      </div>
    );
  }
  if (t.includes('compactor') || t.includes('roller') || t.includes('cp')) {
    return (
      <div className="w-10 h-7 bg-[#ffcd00]/15 rounded border border-[#ffcd00]/30 flex items-center justify-center text-amber-800 font-bold text-[10px]">
        🚜
      </div>
    );
  }

  return (
    <div className="w-10 h-7 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-gray-700 font-bold text-[10px]">
      ⚙️
    </div>
  );
};

export const AssetTable = ({ assets = [] }) => {
  return (
    <div className="w-full bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden text-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          {/* Table Header matching VisionLink */}
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-700 font-semibold select-none">
              <th className="p-3 w-10 text-center">
                <input type="checkbox" className="rounded border-gray-300 accent-neutral-800" />
              </th>
              
              <th className="p-3 min-w-[200px]">
                <div className="flex items-center gap-1 cursor-pointer">
                  <ArrowUpwardIcon fontSize="inherit" className="text-gray-900" />
                  <span>Asset</span>
                  <KeyboardArrowDownIcon fontSize="inherit" />
                </div>
              </th>

              <th className="p-3 min-w-[220px]">
                <div className="flex items-center gap-1 cursor-pointer">
                  <span>Known Location</span>
                  <KeyboardArrowDownIcon fontSize="inherit" />
                </div>
              </th>

              <th className="p-3 min-w-[200px]">
                <div className="flex items-center gap-1 cursor-pointer">
                  <span>Last Known Service Meter</span>
                  <KeyboardArrowDownIcon fontSize="inherit" />
                </div>
              </th>

              <th className="p-3 min-w-[160px]">
                <div className="flex items-center gap-1 cursor-pointer">
                  <span>Fuel Level</span>
                  <KeyboardArrowDownIcon fontSize="inherit" />
                </div>
              </th>

              <th className="p-3 min-w-[150px] text-center">
                <span>Subscription Status</span>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-100 text-gray-800">
            {assets.map((asset, idx) => {
              const code = asset.equipmentId || asset.assetCode || `EX-${idx + 10}`;
              const type = asset.equipmentType || asset.category || 'Excavator';
              const makeModel = `${asset.model || '320 GC'} - ${asset.make || 'CAT'} - ${code}`;
              const location = asset.currentSite || 'Eastern, Peoria, IL 60450, USA';
              const meterHours = asset.engineHours != null ? asset.engineHours.toLocaleString() : (1200 + idx * 145).toLocaleString();
              const fuel = asset.fuelRemainingPercentage != null ? `${Math.round(asset.fuelRemainingPercentage)}%` : (idx % 3 === 0 ? '79%' : idx % 3 === 1 ? '55%' : '82%');
              const isOnline = asset.status !== 'MAINTENANCE';

              return (
                <tr key={code + idx} className="hover:bg-gray-50/80 transition-colors">
                  {/* Checkbox */}
                  <td className="p-3 text-center">
                    <input type="checkbox" className="rounded border-gray-300 accent-neutral-800" />
                  </td>

                  {/* Asset Column */}
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <MachineThumbnail type={type} />
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-gray-900 text-sm tracking-tight">{code}</div>
                        <div className="text-[11px] text-gray-500 truncate">{makeModel}</div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-700 p-1">
                        <MoreVertIcon fontSize="small" />
                      </button>
                    </div>
                  </td>

                  {/* Known Location */}
                  <td className="p-3">
                    <a href="#map" className="text-blue-600 hover:underline font-medium text-xs block truncate max-w-[200px]">
                      {location}
                    </a>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      01/25/2025; 06:03 AM CDT
                    </span>
                  </td>

                  {/* Service Meter Box */}
                  <td className="p-3">
                    <div className="bg-white border border-gray-200 rounded px-2.5 py-1 inline-flex items-baseline gap-1 shadow-2xs min-w-[120px] justify-between">
                      <span className="font-bold text-gray-900 text-xs">{meterHours}</span>
                      <span className="text-[10px] text-gray-500 font-medium">Hours</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      01/25/2025; 06:03 AM CDT
                    </span>
                  </td>

                  {/* Fuel Level */}
                  <td className="p-3">
                    <div className="font-bold text-gray-900 text-xs">{fuel}</div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      01/25/2025; 06:03 AM CDT
                    </span>
                  </td>

                  {/* Subscription Status (Wifi Icon Badge) */}
                  <td className="p-3 text-center">
                    {isOnline ? (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white shadow-xs">
                        <WifiIcon fontSize="inherit" className="text-sm" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-gray-400">
                        <WifiIcon fontSize="inherit" className="text-sm" />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
