const fs = require('fs');

const sidebarContent = `import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import {
  SquaresFour, User, Article, MusicNotes, Code, ChartBar,
  Quotes, Certificate, Camera, Image, ShareNetwork, Link,
  PaintBrush, VideoCamera, SignOut, Key, X, Loader2
} from '@phosphor-icons/react';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/login';
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(\`\${BASE_URL}/users/\${user?.id || 'me'}\`, {
        password: newPassword // Adjust according to backend
      }, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      setMessage('Password changed successfully');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setOldPassword('');
        setNewPassword('');
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navGroups = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: <SquaresFour size={18} /> }
      ]
    },
    {
      title: 'PORTFOLIO',
      items: [
        { name: 'Projects', path: '/projects', icon: <PaintBrush size={18} /> },
        { name: 'UI Projects', path: '/ui-projects', icon: <PaintBrush size={18} /> },
        { name: 'Video Edits', path: '/video-edits', icon: <VideoCamera size={18} /> }
      ]
    },
    {
      title: 'CONTENT',
      items: [
        { name: 'Journal', path: '/journal', icon: <Article size={18} /> },
        { name: 'Archive Tracks', path: '/archive-tracks', icon: <MusicNotes size={18} /> },
        { name: 'Archive Quotes', path: '/archive-quotes', icon: <Quotes size={18} /> },
        { name: 'Lightroom Edits', path: '/lightroom', icon: <Camera size={18} /> },
        { name: 'Apple Gallery', path: '/apple-gallery', icon: <Image size={18} /> }
      ]
    },
    {
      title: 'IDENTITY & OTHERS',
      items: [
        { name: 'Profile', path: '/profile', icon: <User size={18} /> },
        { name: 'Core Stack', path: '/core-stack', icon: <Code size={18} /> },
        { name: 'Stats', path: '/stats', icon: <ChartBar size={18} /> },
        { name: 'Certifications', path: '/certifications', icon: <Certificate size={18} /> },
        { name: 'Socials', path: '/socials', icon: <ShareNetwork size={18} /> },
        { name: 'Nav Links', path: '/nav-links', icon: <Link size={18} /> }
      ]
    },
    {
      title: 'EXTRA',
      items: [
        { name: 'Questions', path: '/questions', icon: <Quotes size={18} /> },
        { name: 'Winners', path: '/winners', icon: <User size={18} /> },
        { name: 'Social Posts', path: '/social-posts', icon: <ShareNetwork size={18} /> },
        { name: 'Magangku Items', path: '/magangku-items', icon: <Article size={18} /> },
        { name: 'Magangku Messages', path: '/magangku-messages', icon: <Article size={18} /> },
        { name: 'Share BGs', path: '/share-backgrounds', icon: <Image size={18} /> }
      ]
    }
  ];

  return (
    <>
      <aside className="w-64 bg-[#FAFAFA] border-r border-gray-200 flex flex-col h-screen sticky top-0 hidden md:flex">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {user?.photo_profile ? (
              <img src={user.photo_profile} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <User size={20} />
              </div>
            )}
            <div className="leading-tight overflow-hidden">
              <h3 className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Admin Dashboard'}</h3>
              <p className="text-[11px] text-gray-500 truncate">{user?.email || 'Manage your portfolio'}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-4 pt-4">
          {navGroups.map((group, idx) => (
            <div key={idx} className="mb-6">
              <p className="px-6 mb-2 text-[10px] font-bold text-gray-400 tracking-widest">{group.title}</p>
              <div className="space-y-0.5">
                {group.items.map((item, i) => (
                  <NavLink
                    key={i}
                    to={item.path}
                    className={({ isActive }) =>
                      \`flex items-center gap-3 px-6 py-2.5 text-[13px] font-medium transition-all \${isActive
                        ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                      }\`
                    }
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 py-4">
          <p className="px-6 mb-2 text-[10px] font-bold text-gray-400 tracking-widest">SETTINGS</p>
          <button onClick={() => setIsPasswordModalOpen(true)} className="flex items-center gap-3 px-6 py-2.5 w-full text-gray-600 hover:bg-gray-50 border-l-4 border-transparent text-[13px] font-medium transition-colors">
            <Key size={18} />
            <span>Change password</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-2.5 w-full text-gray-600 hover:bg-gray-50 border-l-4 border-transparent text-[13px] font-medium transition-colors">
            <SignOut size={18} />
            <span>Logout</span>
          </button>
          <div className="px-6 mt-4">
            <p className="text-[10px] text-gray-400">Internal v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {message && (
              <div className={\`mb-4 p-3 rounded-lg text-sm font-medium \${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}\`}>
                {message}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-black rounded-xl hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
`;

fs.writeFileSync('src/components/sidebar.jsx', sidebarContent);
