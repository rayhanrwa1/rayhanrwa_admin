import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/layout';
import ReactCountryFlag from 'react-country-flag';
import { Globe } from 'lucide-react';

const contentKeys = [
  "projects", "profile", "journal", "archive_tracks", "core_stack",
  "stats", "archive_quotes", "certifications", "lightroom_edits",
  "apple_gallery", "socials", "nav_links", "ui_projects",
  "video_edits", "questions", "winners", "social_posts",
  "magangku_items", "magangku_messages", "share_backgrounds"
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllVisitors, setShowAllVisitors] = useState(false);
  const [showAllContent, setShowAllContent] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard');
        setDashboardData(response.data.data);
      } catch (err) {
        if (!err.response || (err.response.status !== 401 && err.response.status !== 403)) {
          console.error('Failed to fetch dashboard data:', err);
        }
        // 401/403 is handled globally by api.js interceptor (redirect to /login)
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const formatKey = (key) => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const validContentKeys = dashboardData ? contentKeys.filter(key => dashboardData[key] !== undefined) : [];
  const displayedContent = showAllContent ? validContentKeys : validContentKeys.slice(0, 5);
  const hasMoreContent = validContentKeys.length > 5;

  const sortedVisitors = dashboardData?.recent_visitors ? [...dashboardData.recent_visitors].reverse() : [];
  const displayedVisitors = sortedVisitors.length > 0 ? (showAllVisitors ? sortedVisitors : sortedVisitors.slice(0, 5)) : [];
  const hasMoreVisitors = sortedVisitors.length > 5;

  const displayedLocations = dashboardData?.top_countries ? (showAllLocations ? dashboardData.top_countries : dashboardData.top_countries.slice(0, 5)) : [];
  const hasMoreLocations = (dashboardData?.top_countries?.length || 0) > 5;

  return (
    <Layout>
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-[13px] text-gray-500 mt-1">Analytics and operational overview.</p>
        </div>
        <div className="text-right bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-[14px] font-bold text-gray-900">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
        </div>
      </div>

      {loading || !dashboardData ? (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">Loading dashboard statistics...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-3 px-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <h3 className="text-[10px] font-bold tracking-wider uppercase mb-1 text-gray-400">Total Visitors</h3>
              <p className="text-xl font-bold text-gray-900">{dashboardData.total_visitors || 0}</p>
            </div>
            <div className="bg-white p-3 px-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <h3 className="text-[10px] font-bold tracking-wider uppercase mb-1 text-gray-400">Today Visitors</h3>
              <p className="text-xl font-bold text-gray-900">{dashboardData.today_visitors || 0}</p>
            </div>
            <div className="bg-gray-900 p-3 px-4 rounded-xl border border-gray-900 shadow-sm flex flex-col justify-between">
              <h3 className="text-[10px] font-bold tracking-wider uppercase mb-1 text-gray-400">Total Content</h3>
              <p className="text-xl font-bold text-white">{dashboardData.total_content || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column: Visitors & Server */}
            <div className="lg:col-span-2 space-y-4">

              {/* Recent Visitors Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-3 px-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-[13px] font-bold text-gray-900">Recent Visitors</h2>
                </div>
                <div className={showAllVisitors ? "overflow-x-auto max-h-87.5 overflow-y-auto" : "overflow-x-auto"}>
                  <table className="w-full text-left text-[12px]">
                    <thead className="bg-[#FAFAFA] text-gray-500 border-b border-gray-100 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-2 font-medium">IP Address</th>
                        <th className="px-4 py-2 font-medium">Country</th>
                        <th className="px-4 py-2 font-medium">User Agent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {displayedVisitors.length > 0 ? (
                        displayedVisitors.map((visitor, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2.5 text-gray-900 font-medium">{visitor.ip_address}</td>
                            <td className="px-4 py-2.5 text-gray-600">
                              <div className="flex items-center gap-2">
                                {visitor.country === 'Unknown' ? (
                                  <Globe size={14} className="text-gray-400" />
                                ) : (
                                  <ReactCountryFlag countryCode={visitor.country} svg style={{ width: '1.2em', height: '1.2em' }} />
                                )}
                                <span>{visitor.country}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-gray-500 max-w-50 sm:max-w-xs truncate" title={visitor.user_agent}>
                              {visitor.user_agent}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-4 py-4 text-center text-gray-400">No recent visitors</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {hasMoreVisitors && (
                    <button
                      onClick={() => setShowAllVisitors(!showAllVisitors)}
                      className="w-full py-3 text-center text-[13px] font-semibold text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors border-t border-gray-100"
                    >
                      {showAllVisitors ? 'Show Less' : `See ${dashboardData.recent_visitors.length - 5} More`}
                    </button>
                  )}
                </div>
              </div>

              {/* Server Stats */}
              {dashboardData.server_stats && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h2 className="text-[14px] font-bold text-gray-900 mb-5">Server Status</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div className="col-span-2 sm:col-span-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">CPU Model</p>
                      <p className="text-[13px] font-semibold text-gray-900">{dashboardData.server_stats.cpu_model}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">CPU Usage</p>
                      <p className="text-xl font-semibold text-gray-900">{dashboardData.server_stats.cpu_usage}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">RAM (Used / Total)</p>
                      <p className="text-xl font-semibold text-gray-900">{dashboardData.server_stats.used_ram_gb} / {dashboardData.server_stats.total_ram_gb} GB</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Disk (Used / Total)</p>
                      <p className="text-xl font-semibold text-gray-900">{dashboardData.server_stats.used_disk_gb} / {dashboardData.server_stats.total_disk_gb} GB</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Uptime</p>
                      <p className="text-xl font-semibold text-gray-900">{dashboardData.server_stats.uptime_hours}h</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Content Stats List & Top Countries */}
            <div className="space-y-8">

              {/* Content Breakdown (Replaces the boxes) */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-[14px] font-bold text-gray-900">Content Overview</h2>
                </div>
                <div className={showAllContent ? "p-0 max-h-87.5 overflow-y-auto" : "p-0"}>
                  <ul className="divide-y divide-gray-100">
                    {displayedContent.map(key => (
                      <li key={key} className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                        <span className="text-[13px] text-gray-600">{formatKey(key)}</span>
                        <span className="text-[12px] font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">{dashboardData[key]}</span>
                      </li>
                    ))}
                  </ul>
                  {hasMoreContent && (
                    <button
                      onClick={() => setShowAllContent(!showAllContent)}
                      className="w-full py-3 text-center text-[13px] font-semibold text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors border-t border-gray-100"
                    >
                      {showAllContent ? 'Show Less' : `+ ${validContentKeys.length - 5} More`}
                    </button>
                  )}
                </div>
              </div>

              {/* Top Countries */}
              {dashboardData.top_countries && dashboardData.top_countries.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h2 className="text-[14px] font-bold text-gray-900">Top Locations</h2>
                  </div>
                  <div className={showAllLocations ? "p-0 max-h-87.5 overflow-y-auto" : "p-0"}>
                    <ul className="divide-y divide-gray-100">
                      {displayedLocations.map((loc, i) => (
                        <li key={i} className="flex justify-between items-center px-4 py-3">
                          <div className="flex items-center gap-2">
                            {loc.country === 'Unknown' ? (
                              <Globe size={16} className="text-gray-400" />
                            ) : (
                              <ReactCountryFlag countryCode={loc.country} svg style={{ width: '1.2em', height: '1.2em' }} />
                            )}
                            <span className="text-[13px] text-gray-700 font-medium">{loc.country}</span>
                          </div>
                          <span className="text-[12px] text-gray-500 bg-gray-50 px-2 py-1 rounded">{loc.views} views</span>
                        </li>
                      ))}
                    </ul>
                    {hasMoreLocations && (
                      <button
                        onClick={() => setShowAllLocations(!showAllLocations)}
                        className="w-full py-3 text-center text-[13px] font-semibold text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors border-t border-gray-100"
                      >
                        {showAllLocations ? 'Show Less' : `See ${dashboardData.top_countries.length - 5} More`}
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}