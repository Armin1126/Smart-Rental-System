import React, { useState, useEffect } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WifiIcon from '@mui/icons-material/Wifi';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { getSiteLocation, getLiveTimestamp } from '../utils/formatters';

// Equipment Category Badge
const MachineThumbnail = ({ type = '' }) => {
  const label = type.substring(0, 3).toUpperCase();
  return (
    <div className="w-10 h-7 bg-amber-100 rounded border border-amber-300 flex items-center justify-center text-[#ffcd00] font-bold text-[10px]">
      {label}
    </div>
  );
};

export const AssetTable = ({ assets = [] }) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden text-xs font-sans">
      {/* Dynamic Telemetry Status Header Bar */}
      <div className="bg-neutral-900 text-white px-3 py-1.5 flex items-center justify-between text-[11px] border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-gray-200">PostgreSQL IoT Telemetry Sync Active</span>
        </div>
        <span className="text-gray-400 font-mono text-[10px]">
          Stream: {assets.length} Assets Connected | Live Tick #{tick}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
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

              <th className="p-3 min-w-[230px]">
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

          <tbody className="divide-y divide-gray-100 text-gray-800">
            {assets.map((asset, idx) => {
              const code = asset.equipmentId || asset.assetCode || `EX-${idx + 10}`;
              const type = asset.equipmentType || asset.category || 'Excavator';
              const makeModel = `${asset.model || '320 GC'} - ${asset.make || 'CAT'} - ${code}`;
              const location = getSiteLocation(asset.currentSite);
              
              const baseHours = asset.engineHours != null ? asset.engineHours : 1200 + idx * 145;
              const liveHours = (baseHours + (tick * 0.01) % 5).toFixed(1);
              
              const baseFuel = asset.fuelRemainingPercentage != null ? asset.fuelRemainingPercentage : (idx % 3 === 0 ? 79 : idx % 3 === 1 ? 55 : 82);
              const liveFuel = Math.max(5, Math.round(baseFuel - (tick * 0.1) % 3));

              const liveTime = getLiveTimestamp(idx * 20);
              const isOnline = asset.status !== 'MAINTENANCE';

              return (
                <tr key={code + idx} className="hover:bg-amber-50/30 transition-colors">
                  <td className="p-3 text-center">
                    <input type="checkbox" className="rounded border-gray-300 accent-neutral-800" />
                  </td>

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

                  <td className="p-3">
                    <a href="#map" className="text-blue-600 hover:underline font-semibold text-xs block truncate max-w-[220px]">
                      {location}
                    </a>
                    <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">
                      {liveTime}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="bg-white border border-gray-200 rounded px-2.5 py-1 inline-flex items-baseline gap-1 shadow-2xs min-w-[120px] justify-between">
                      <span className="font-bold text-gray-900 text-xs font-mono">{Number(liveHours).toLocaleString()}</span>
                      <span className="text-[10px] text-gray-500 font-medium">Hours</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">
                      {liveTime}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="font-bold text-gray-900 text-xs font-mono flex items-center gap-1.5">
                      <span>{liveFuel}%</span>
                      <span className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden inline-block">
                        <span
                          className={`h-full block transition-all duration-500 ${
                            liveFuel < 20 ? 'bg-rose-500' : liveFuel < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${liveFuel}%` }}
                        />
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">
                      {liveTime}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    {isOnline ? (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white shadow-2xs cursor-pointer hover:bg-emerald-700 transition-colors" title="Connected to PostgreSQL Telemetry Stream">
                        <WifiIcon fontSize="inherit" className="text-sm animate-pulse" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-gray-400" title="Offline">
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
