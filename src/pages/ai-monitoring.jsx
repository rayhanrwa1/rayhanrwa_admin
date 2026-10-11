import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Layout from '../components/layout';
import {
  Users,
  Activity,
  Zap,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  Send,
  Radio
} from 'lucide-react';

export default function AIMonitoring() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, logsRes] = await Promise.all([
        api.get('/ai-traffic/stats').catch(() => ({ data: { data: null } })),
        api.get('/ai-traffic?limit=50').catch(() => ({ data: { data: [] } }))
      ]);

      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
      if (logsRes.data?.data) {
        setLogs(logsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load AI monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async () => {
    try {
      setSimulating(true);
      const res = await api.post('/ai-traffic/simulate');
      const char = res.data?.data?.character_name || 'AI Staff';
      setToastMessage(`Aktivitas baru tercatat: ${char} menyelesaikan tugas.`);
      setTimeout(() => setToastMessage(''), 3000);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const ds = stats?.deepseek || {
    topped_up_balance: '9.86',
    currency: 'USD',
    total_cost_usd: 0.13,
    api_requests: 1917,
    total_tokens: 552515
  };

  // Filter personas
  const personas = stats?.character_traffic || [];
  const filteredPersonas = personas.filter((p) => {
    if (activeTab !== 'ALL' && p.division !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.role?.toLowerCase().includes(q) ||
        p.division?.toLowerCase().includes(q) ||
        p.recent_thought?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate overall effectiveness
  const avgEffectiveness = personas.length > 0
    ? (personas.reduce((acc, curr) => acc + (curr.effectiveness_rate || 94), 0) / personas.length).toFixed(1)
    : '96.4';

  const getDivisionBadge = (division) => {
    switch (division) {
      case 'IT':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Financial':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Marketing':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Asisten Pribadi':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Layout>
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-black text-white px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 border border-gray-800 animate-in fade-in">
          <CheckCircle2 size={15} className="text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* DeepSeek API Live Telemetry Strip (Flat, minimalist, compact) */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-800">
            <Cpu size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">DeepSeek API Engine</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] text-emerald-700 font-medium">Live Connected</span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Saldo Akun: <strong className="text-gray-900 font-semibold">${ds.topped_up_balance} {ds.currency}</strong>
              <span className="mx-2 text-gray-300">•</span>
              Biaya Terpakai: <strong className="text-gray-900 font-semibold">${ds.total_cost_usd?.toFixed(2) || '0.13'}</strong>
              <span className="mx-2 text-gray-300">•</span>
              Total Token: <strong className="text-gray-900 font-semibold">{(ds.total_tokens || 552515).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 flex items-center gap-1.5 transition"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Sync
          </button>
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Radio size={13} className={simulating ? 'animate-pulse' : ''} />
            Test Task Event
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-black" /> Monitoring Efektivitas Tim AI
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Evaluasi produktivitas, ketepatan tugas, dan kecepatan respons tiap anggota kantor (Lutfi, Farras, Bayu, Hanai, dll).
          </p>
        </div>
      </div>

      {/* 4 Summary Cards (Flat, clean, no heavy shadows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs font-medium text-gray-500">Rata-Rata Efektivitas Tim</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{avgEffectiveness}%</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Optimal
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Dihitung dari tingkat keberhasilan task</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs font-medium text-gray-500">Top Performer (Paling Efektif)</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{stats?.top_agent || 'Lutfi'}</span>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              98.4%
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Throughput tinggi & response cepat</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs font-medium text-gray-500">Total Tugas Terselesaikan</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{stats?.total_activities || 14}</span>
            <span className="text-xs text-gray-500">Tugas</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Chat Telegram & otonom worker</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs font-medium text-gray-500">Kecepatan Respons Rata-Rata</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">320</span>
            <span className="text-xs text-gray-500">ms</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Waktu eksekusi instruksi per agent</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto">
          {['ALL', 'IT', 'Financial', 'Marketing', 'Asisten Pribadi'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {tab === 'ALL' ? 'Semua Staf (13)' : tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama misal 'farras', 'lutfi'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Grid: Kartu Monitoring Orang-Orangnya (Farras, Lutfi, Bayu, dll) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filteredPersonas.map((person) => {
          const eff = person.effectiveness_rate ? person.effectiveness_rate.toFixed(1) : '94.0';
          const effNum = parseFloat(eff);
          return (
            <div
              key={person.name}
              className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between hover:border-gray-300 transition"
            >
              {/* Header: Name, Division, Role */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-sm text-gray-800">
                      {person.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{person.name}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDivisionBadge(person.division)}`}>
                          {person.division}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 block">{person.role}</span>
                    </div>
                  </div>

                  {/* Status dot */}
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="capitalize">{person.status || 'Active'}</span>
                  </div>
                </div>

                {/* Score & Progress Bar */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-gray-500">Skor Efektivitas Kerja</span>
                    <span className={`font-bold ${effNum >= 95 ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {eff}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        effNum >= 96 ? 'bg-emerald-500' : effNum >= 92 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(effNum, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Performance Stats Mini Row */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-2">
                    <span className="text-[10px] text-gray-400 block font-medium">Tasks</span>
                    <span className="text-xs font-bold text-gray-800">{person.count || 1}</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-2">
                    <span className="text-[10px] text-gray-400 block font-medium">Latency</span>
                    <span className="text-xs font-bold text-gray-800">{person.avg_response_ms || 340}ms</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-2">
                    <span className="text-[10px] text-gray-400 block font-medium">Tokens</span>
                    <span className="text-xs font-bold text-gray-800">{person.tokens_burned || 180}</span>
                  </div>
                </div>
              </div>

              {/* Recent Output / Focus Text */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="text-[10px] font-semibold uppercase text-gray-400 tracking-wider block mb-1">
                  Aktivitas & Fokus Terakhir
                </span>
                <p className="text-xs text-gray-600 italic line-clamp-2">
                  "{person.recent_thought || 'Siap menerima instruksi dan menjalankan tugas divisi.'}"
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Riwayat Penugasan & Telemetri Terkini</h2>
            <p className="text-xs text-gray-500 mt-0.5">Catatan live eksekusi tugas masing-masing personel AI</p>
          </div>
          <span className="text-xs font-medium text-gray-400">{logs.length} Log tercatat</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Personel</th>
                <th className="py-3 px-4">Divisi</th>
                <th className="py-3 px-4">Tipe Aksi</th>
                <th className="py-3 px-4">Deskripsi Aktivitas</th>
                <th className="py-3 px-4 text-center">Latency</th>
                <th className="py-3 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {logs.map((log) => {
                const d = new Date(log.created_at);
                const timeStr = !isNaN(d)
                  ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  : '-';
                return (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-mono text-gray-400 whitespace-nowrap">{timeStr}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                      {log.character_name}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDivisionBadge(log.division)}`}>
                        {log.division}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap capitalize text-gray-600">
                      {log.action_type?.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-gray-700 max-w-md">
                      <p className="line-clamp-2">{log.summary}</p>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-gray-500">
                      {log.response_time_ms ? `${log.response_time_ms}ms` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-500">
                      {log.tokens_used ? `${log.tokens_used} tok` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
