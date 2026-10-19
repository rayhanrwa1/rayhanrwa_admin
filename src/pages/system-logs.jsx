import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Layout from '../components/layout';
import {
  Terminal,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Trash2,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [limit, setLimit] = useState(100);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let url = `/ai-traffic?limit=${limit}`;
      if (selectedDivision !== 'ALL') {
        url += `&division=${encodeURIComponent(selectedDivision)}`;
      }
      if (selectedAction !== 'ALL') {
        url += `&action_type=${encodeURIComponent(selectedAction)}`;
      }
      const res = await api.get(url);
      if (res.data?.data) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load system logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedDivision, selectedAction, limit]);

  const filteredLogs = logs.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.character_name && item.character_name.toLowerCase().includes(q)) ||
      (item.summary && item.summary.toLowerCase().includes(q)) ||
      (item.division && item.division.toLowerCase().includes(q)) ||
      (item.action_type && item.action_type.toLowerCase().includes(q)) ||
      (item.endpoint_source && item.endpoint_source.toLowerCase().includes(q))
    );
  });

  const exportAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `system_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#fafbfc] text-[#2c323f] px-8 py-8 font-sans">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200/80 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE AUDIT TRAIL
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 font-medium">Real-Time Autonomous Agent Logs</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
              <Terminal className="w-6 h-6 text-gray-700" />
              System & Agent Traffic Logs
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-gray-400' : 'text-gray-600'}`} />
              Refresh
            </button>
            <button
              onClick={exportAsJSON}
              disabled={filteredLogs.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-800 shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="mt-6 bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search logs by agent name, summary, endpoint, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition"
            />
          </div>

          {/* Division Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Filter className="w-3.5 h-3.5" />
              <span>Division:</span>
            </div>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:border-gray-400 cursor-pointer"
            >
              <option value="ALL">All Divisions</option>
              <option value="IT">IT Division</option>
              <option value="Financial">Financial</option>
              <option value="Marketing">Marketing</option>
              <option value="Asisten Pribadi">Asisten Pribadi</option>
            </select>
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-gray-500 font-medium">Action:</span>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-3 py-2 text-xs bg-gray-50/70 border rounded-lg text-gray-700 font-medium focus:outline-none focus:border-gray-400 cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="monitoring_check">monitoring_check</option>
              <option value="task_execution">task_execution</option>
              <option value="autonomous_thought">autonomous_thought</option>
              <option value="chat_response">chat_response</option>
            </select>
          </div>

          {/* Limit Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-gray-500 font-medium">Rows:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:border-gray-400 cursor-pointer"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>

        {/* Total stats pill */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 px-1">
          <span>Showing <strong className="text-gray-900 font-semibold">{filteredLogs.length}</strong> recorded activities</span>
          <span>Target Database: <code className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[11px] font-mono">ai_traffic_logs</code></span>
        </div>

        {/* Logs Table / List */}
        <div className="mt-3 bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500 font-medium">Fetching real-time logs from PostgreSQL pool...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-20 text-center">
              <Terminal className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No logs found</p>
              <p className="text-xs text-gray-400 mt-0.5">Try clearing filters or search keywords</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Agent / Character</th>
                    <th className="py-3 px-4">Division</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Activity Summary</th>
                    <th className="py-3 px-4 text-center">Latency</th>
                    <th className="py-3 px-4 text-center">Tokens</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map((log) => {
                    const isSuccess = log.status === 'success';
                    const formattedDate = log.created_at
                      ? new Date(log.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      : '-';

                    return (
                      <tr key={log.id} className="hover:bg-gray-50/60 transition group">
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-gray-500">
                          {formattedDate}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-gray-900 text-white flex items-center justify-center font-bold text-[10px] tracking-tight">
                              {log.character_name ? log.character_name.slice(0, 2).toUpperCase() : 'AI'}
                            </span>
                            <span className="font-semibold text-gray-900">{log.character_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">
                            {log.division || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded">
                            {log.action_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700 font-medium max-w-md">
                          <div className="truncate group-hover:whitespace-normal group-hover:break-words transition-all duration-200">
                            {log.summary}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-center font-mono text-gray-500 text-[11px]">
                          {log.response_time_ms ? `${log.response_time_ms}ms` : '-'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-center font-mono text-gray-700 text-[11px] font-semibold">
                          {log.tokens_used ? `${log.tokens_used} tok` : '-'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isSuccess 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {log.status || 'success'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
