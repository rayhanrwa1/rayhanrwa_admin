import React, { useState, useEffect } from 'react';
import { List } from 'lucide-react';
import { User } from '@phosphor-icons/react';

export default function Header({ onMenuClick }) {
  const [user, setUser] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('admin_user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 flex justify-between md:justify-end items-center sticky top-0 z-10">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <List size={24} />
      </button>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-[13px] font-bold text-gray-900 leading-tight">{user?.name || 'Admin Rayhan'}</p>
          <p className="text-[11px] text-gray-500 leading-tight">{user?.email || 'Administrator'}</p>
        </div>
        <div className="shrink-0">
          {user?.photo_profile && !imageError ? (
            <img
              src={user.photo_profile}
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover border border-gray-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
              <User size={18} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}