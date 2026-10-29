import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../utils/api';
import {
  SquaresFour, User, Article, MusicNotes, Code, ChartBar,
  Quotes, Certificate, Camera, Image, ShareNetwork, Link, FileText,
  PaintBrush, VideoCamera, SignOut, Key
} from '@phosphor-icons/react';
import { X, Loader2, ChevronLeft, ChevronRight, ChevronDown, Globe, Server, Link2, Users, Activity, Terminal } from 'lucide-react';
import logo from '../assets/logo.png';


export default function Sidebar({ isOpen, setIsOpen }) {
  const [user, setUser] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(localStorage.getItem('sidebar_collapsed') === 'true');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // State for collapsible groups
  const [expandedGroups, setExpandedGroups] = useState({
    'MAIN': true,
    'AI & CLOUD SYSTEM': true,
    'ARCHIVE': true,
    'JOURNEY & PROJECT': true,
    'JOURNAL': true,
    'HOME / INDEX': true,
    'CONTACT & NAVIGATION': true,
    'OTHERS': false
  });

  const toggleGroup = (title) => {
    setExpandedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

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

  const toggleCollapse = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    localStorage.setItem('sidebar_collapsed', newVal);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      await api.put(`/users/${user?.id || 'me'}`, {
        password: newPassword // Adjust according to backend
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
        { name: 'Dashboard', path: '/dashboard', icon: <SquaresFour size={18} /> },
        { name: 'Visitors', path: '/visitors', icon: <Globe size={18} /> }
      ]
    },
    {
      title: 'AI & CLOUD SYSTEM',
      items: [
        { name: 'Server Configs', path: '/server-configs', icon: <Server size={18} /> },
        { name: 'Integrations', path: '/integrations', icon: <Link2 size={18} /> },
        { name: 'AI Characters', path: '/ai-characters', icon: <Users size={18} /> },
        { name: 'AI Monitoring', path: '/ai-monitoring', icon: <Activity size={18} /> },
        { name: 'AI API Keys', path: '/api-keys', icon: <Key size={18} /> },
        { name: 'System Logs', path: '/system-logs', icon: <Terminal size={18} /> }
      ]
    },
    {
      title: 'ARCHIVE',
      items: [
        { name: 'Archive Tracks', path: '/archive-tracks', icon: <MusicNotes size={18} /> },
        { name: 'Archive Quotes', path: '/archive-quotes', icon: <Quotes size={18} /> },
        { name: 'Lightroom Edits', path: '/lightroom', icon: <Camera size={18} /> },
        { name: 'UI Projects', path: '/ui-projects', icon: <PaintBrush size={18} /> },
        { name: 'Apple Gallery', path: '/apple-gallery', icon: <Image size={18} /> },
        { name: 'Social Posts', path: '/social-posts', icon: <ShareNetwork size={18} /> },
        { name: 'Video Edits', path: '/video-edits', icon: <VideoCamera size={18} /> },
        { name: 'Winners', path: '/winners', icon: <User size={18} /> }
      ]
    },
    {
      title: 'JOURNEY & PROJECT',
      items: [
        { name: 'Profile', path: '/profile', icon: <User size={18} /> },
        { name: 'CV Builder', path: '/cv-builder', icon: <FileText size={18} /> },
        { name: 'Stats', path: '/stats', icon: <ChartBar size={18} /> },
        { name: 'Projects', path: '/projects', icon: <PaintBrush size={18} /> }
      ]
    },
    {
      title: 'JOURNAL',
      items: [
        { name: 'Journal', path: '/journal', icon: <Article size={18} /> },
        { name: 'Share BGs', path: '/share-backgrounds', icon: <Image size={18} /> }
      ]
    },
    {
      title: 'HOME / INDEX',
      items: [
        { name: 'Core Stack', path: '/core-stack', icon: <Code size={18} /> },
        { name: 'Certifications', path: '/certifications', icon: <Certificate size={18} /> }
      ]
    },
    {
      title: 'CONTACT & NAVIGATION',
      items: [
        { name: 'Socials', path: '/socials', icon: <ShareNetwork size={18} /> },
        { name: 'Nav Links', path: '/nav-links', icon: <Link size={18} /> }
      ]
    },
    {
      title: 'OTHERS',
      items: [
        { name: 'Magangku Items', path: '/magangku-items', icon: <Article size={18} /> },
        { name: 'Magangku Messages', path: '/magangku-messages', icon: <Article size={18} /> },
        { name: 'Questions', path: '/questions', icon: <Quotes size={18} /> }
      ]
    }
  ];

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-50 bg-[#FAFAFA] border-r border-gray-200 flex flex-col h-screen transform transition-all duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`p-6 border-b border-gray-100 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} relative`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="shrink-0">
              <img
                src={logo}
                alt="Logo"
                className={`object-contain transition-all duration-300 ${isCollapsed ? 'w-8 h-8' : 'w-9 h-9'}`}
              />
            </div>
            {!isCollapsed && (
              <div className="leading-tight overflow-hidden transition-all duration-300">
                <h3 className="text-[15px] font-extrabold tracking-tight text-gray-900 truncate">rayhanrwa.</h3>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              className="md:hidden text-gray-400 hover:text-gray-700 transition-colors shrink-0"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          )}

          <button
            onClick={toggleCollapse}
            className={`hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 shadow-sm transition-transform z-10`}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-4 pt-4 overflow-x-hidden">
          {navGroups.map((group, idx) => {
            const isGroupExpanded = expandedGroups[group.title];
            return (
              <div key={idx} className="mb-4">
                {!isCollapsed ? (
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between px-6 mb-2 cursor-pointer group"
                  >
                    <p className="text-[10px] font-bold text-gray-400 tracking-widest whitespace-nowrap group-hover:text-gray-600 transition-colors">
                      {group.title}
                    </p>
                    {isGroupExpanded ? (
                      <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600" />
                    ) : (
                      <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600" />
                    )}
                  </button>
                ) : (
                  <div className="w-full flex justify-center mb-2">
                    <div className="h-px w-8 bg-gray-200"></div>
                  </div>
                )}

                <div className={`space-y-0.5 overflow-hidden transition-all duration-200 ${isGroupExpanded || isCollapsed ? 'max-h-250 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {group.items.map((item, i) => (
                    <NavLink
                      key={i}
                      to={item.path}
                      title={isCollapsed ? item.name : ""}
                      className={({ isActive }) =>
                        `flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-6'} py-2.5 text-[13px] font-medium transition-all ${isActive
                          ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                        }`
                      }
                    >
                      <div className={isCollapsed ? 'flex items-center justify-center w-full' : ''}>
                        {item.icon}
                      </div>
                      {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-200 py-4 overflow-x-hidden">
          {!isCollapsed && <p className="px-6 mb-2 text-[10px] font-bold text-gray-400 tracking-widest whitespace-nowrap">SETTINGS</p>}
          <button title={isCollapsed ? "Change password" : ""} onClick={() => setIsPasswordModalOpen(true)} className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-6'} py-2.5 w-full text-gray-600 hover:bg-gray-50 border-l-4 border-transparent text-[13px] font-medium transition-colors`}>
            <div className={isCollapsed ? 'flex items-center justify-center w-full' : ''}>
              <Key size={18} />
            </div>
            {!isCollapsed && <span className="whitespace-nowrap">Change password</span>}
          </button>
          <button
            title={isCollapsed ? "Logout" : ""}
            onClick={handleLogout}
            className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-6'} py-2.5 w-full text-gray-600 hover:bg-gray-50 border-l-4 border-transparent text-[13px] font-medium transition-colors`}>
            <div className={isCollapsed ? 'flex items-center justify-center w-full' : ''}>
              <SignOut size={18} />
            </div>
            {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
          </button>
          {!isCollapsed && (
            <div className="px-6 mt-4">
              <p className="text-[10px] text-gray-400 whitespace-nowrap">Internal v1.0.0</p>
            </div>
          )}
        </div>
      </aside>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="sext-xl font-bold text-gray-900">Change Password</h2>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
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
