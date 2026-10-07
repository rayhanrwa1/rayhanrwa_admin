import React from 'react';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-3 flex justify-end items-center sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">
          AD
        </div>
        <div className="text-right">
          <p className="text-[13px] font-bold text-gray-900 leading-tight">Admin Rayhan</p>
          <p className="text-[11px] text-gray-500 leading-tight">Administrator</p>
        </div>
      </div>
    </header>
  );
}