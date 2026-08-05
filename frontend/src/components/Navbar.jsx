import React from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export const Navbar = () => {
  return (
    <header className="h-14 bg-black text-white flex items-center justify-between px-4 select-none z-50 border-b border-neutral-800">
      {/* Left Section: Menu & Brand */}
      <div className="flex items-center gap-4">
        <button className="text-gray-300 hover:text-white transition-colors p-1">
          <MenuIcon fontSize="medium" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer">
          {/* Cat Triangle Icon Accent */}
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-[#ffcd00]" />
          <span className="text-lg font-extrabold tracking-wider text-white uppercase font-sans">
            VISION<span className="font-light tracking-widest text-gray-200">LINK</span>
          </span>
        </div>
      </div>

      {/* Right Section: Controls, Search, Product Selector, Avatar */}
      <div className="flex items-center gap-5 text-sm">
        {/* Filters */}
        <button className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
          <FilterListIcon fontSize="small" />
          <span className="font-medium text-xs">Filters</span>
        </button>

        {/* Global Search Bar */}
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-2.5 text-gray-400" fontSize="small" />
          <input
            type="text"
            placeholder="Search assets"
            className="bg-neutral-900 text-gray-200 placeholder-gray-400 text-xs pl-8 pr-3 py-1.5 rounded border border-neutral-700 focus:outline-none focus:border-gray-400 w-44 transition-all"
          />
        </div>

        {/* Help Badge Icon */}
        <div className="relative cursor-pointer text-gray-300 hover:text-white">
          <HelpOutlineIcon fontSize="small" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ffcd00] rounded-full border border-black" />
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-neutral-800" />

        {/* Cat Product Switcher */}
        <button className="flex items-center gap-1 text-xs font-semibold tracking-wide text-gray-300 hover:text-white">
          <span>CAT PRODUCT...</span>
          <KeyboardArrowDownIcon fontSize="small" />
        </button>

        {/* User Profile Circle */}
        <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold text-gray-200 border border-neutral-600 hover:bg-neutral-600 cursor-pointer">
          PK
        </div>
      </div>
    </header>
  );
};
