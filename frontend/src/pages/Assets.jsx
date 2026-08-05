import React, { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { AssetTable } from '../components/AssetTable';
import { getAssets } from '../services/assetService';
import { MOCK_ASSETS } from '../constants/mockData';

export const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssetData = async () => {
      setLoading(true);
      try {
        const data = await getAssets();
        if (data && data.length > 0) {
          setAssets(data);
        } else {
          setAssets(MOCK_ASSETS);
        }
      } catch (e) {
        setAssets(MOCK_ASSETS);
      } finally {
        setLoading(false);
      }
    };
    fetchAssetData();
  }, []);

  // Filter assets based on search query
  const filteredAssets = assets.filter((a) => {
    const id = (a.equipmentId || a.assetCode || '').toLowerCase();
    const type = (a.equipmentType || a.category || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return id.includes(q) || type.includes(q);
  });

  return (
    <div className="space-y-3 font-sans">
      {/* VisionLink Top Grid Controls Toolbar */}
      <div className="bg-white p-3 rounded-md border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs select-none">
        {/* Search Input: Find asset */}
        <div className="relative flex items-center min-w-[240px]">
          <SearchIcon className="absolute left-2.5 text-gray-400" fontSize="small" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find asset"
            className="w-full bg-white text-gray-800 placeholder-gray-400 text-xs pl-8 pr-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:border-gray-500 transition-all"
          />
        </div>

        {/* Right Controls: Item count, Pagination, Action Icons */}
        <div className="flex items-center gap-4 text-gray-600 font-medium">
          {/* Pagination Counter */}
          <span className="text-gray-500">
            1 - {filteredAssets.length} of {assets.length > 0 ? assets.length : 250}
          </span>

          {/* Nav arrows */}
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700">
              <ChevronLeftIcon fontSize="small" />
            </button>
            <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700">
              <ChevronRightIcon fontSize="small" />
            </button>
          </div>

          {/* Toolbar Action Icons */}
          <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors" title="Date Range">
              <CalendarTodayOutlinedIcon fontSize="small" />
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors" title="Export CSV">
              <FileDownloadOutlinedIcon fontSize="small" />
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors" title="Table Settings">
              <SettingsOutlinedIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>

      {/* VisionLink Data Grid Table */}
      {loading ? (
        <div className="p-12 bg-white rounded-md border border-gray-200 text-center text-gray-500 text-sm">
          Loading Caterpillar VisionLink Asset Inventory...
        </div>
      ) : (
        <AssetTable assets={filteredAssets} />
      )}
    </div>
  );
};
