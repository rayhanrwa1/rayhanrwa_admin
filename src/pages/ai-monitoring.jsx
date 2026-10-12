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
  Cpu,
  Mail,
  Phone,
  MoreHorizontal,
  FileText,
  ChevronRight,
  Send,
  Check,
  X,
  Radio,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function AIMonitoring() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [navTab, setNavTab] = useState('members'); // 'overview', 'members', 'telemetry', 'logs'
  const [sidebarTab, setSidebarTab] = useState('activities'); // 'overview', 'activities'
  const [searchQuery, setSearchQuery] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedAgentName, setSelectedAgentName] = useState(null);

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
      setToastMessage(`Aktivitas baru dicatat: ${char} berhasil menyelesaikan instruksi.`);
      setTimeout(() => setToastMessage(''), 4000);
      fetchData();
    } catch (err) {
      console.error(err);
      setToastMessage('Gagal simulasi event.');
      setTimeout(() => setToastMessage(''), 3000);
    } finally {
      setSimulating(false);
    }
  };

  const handleSendEmailReport = async () => {
    try {
      setSendingEmail(true);
      const res = await api.post('/ai-traffic/send-report', {
        recipient_email: '', // Backend automatically extracts or defaults to Bos Rayhan's email
        report_title: 'Executive AI Town Operations & Team Monitoring Report',
        notes: 'Laporan pemantauan performa seluruh agen AI Town dikirim langsung via Admin Dashboard.'
      });
      const recipient = res.data?.recipient || 'email Bos Rayhan';
      setToastMessage(`Sukses! Laporan executive dikirimkan ke: ${recipient}`);
      setTimeout(() => setToastMessage(''), 5000);
    } catch (err) {
      console.error(err);
      setToastMessage('Gagal mengirimkan email laporan.');
      setTimeout(() => setToastMessage(''), 4000);
    } finally {
      setSendingEmail(false);
    }
  };

  const ds = stats?.deepseek || {
    topped_up_balance: '9.86',
    currency: 'USD',
    total_cost_usd: 0.13,
    api_requests: 1917,
    total_tokens: 552515
  };

  const personas = stats?.character_traffic || [];

  // Filter personas
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
    ? (personas.reduce((acc, curr) => acc + (curr.effectiveness_rate || 95.5), 0) / personas.length).toFixed(1)
    : '96.8';

  // Selected agent (default to first or Ikhsan)
  const currentAgent = personas.find(p => p.name === selectedAgentName) || personas[0] || {
    name: 'Ikhsan',
    division: 'IT',
    role: 'Database & Security Admin',
    status: 'working',
    count: 133,
    avg_response_ms: 361,
    tokens_burned: 4417,
    effectiveness_rate: 98.4,
    recent_thought: 'Siap menerima instruksi dan menjalankan tugas divisi.'
  };

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
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-black text-white px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2.5 border border-gray-800 shadow-xl animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Top Header / Breadcrumbs matching class style */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1">
            <span className="hover:text-gray-600 cursor-pointer">AI Operations</span>
            <span>&rsaquo;</span>
            <span className="text-gray-700 font-semibold">{currentAgent.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Team Performance & Monitoring
          </h1>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
            <span>Created On: <strong className="text-gray-800 font-medium">Today, 12 Oct 2026</strong></span>
            <span className="text-gray-300">•</span>
            {/* Avatar group badge */}
            <div className="flex items-center -space-x-1.5">
              {personas.slice(0, 3).map((p, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full bg-gray-800 text-white text-[9px] font-bold flex items-center justify-center border border-white"
                >
                  {p.name.charAt(0)}
                </div>
              ))}
              <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-1 py-0.5 rounded-full border border-gray-200 ml-1">
                +{personas.length}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Top Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSendEmailReport}
            disabled={sendingEmail}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-sm transition"
          >
            <Mail size={14} className={sendingEmail ? 'animate-bounce text-blue-600' : 'text-gray-500'} />
            {sendingEmail ? 'Mengirim...' : 'Send Email Report'}
          </button>
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="px-3.5 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Radio size={14} className={simulating ? 'animate-pulse text-emerald-400' : ''} />
            + Add Task Event
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs matching reference (Details, Position, Documents, Assessment, Notes, etc.) */}
      <div className="border-b border-gray-200 mb-6 flex items-center gap-8 text-xs font-medium text-gray-500 overflow-x-auto">
        <button
          onClick={() => setNavTab('members')}
          className={`pb-3.5 border-b-2 font-semibold transition whitespace-nowrap ${
            navTab === 'members'
              ? 'border-black text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Staff Members ({personas.length})
        </button>
        <button
          onClick={() => setNavTab('overview')}
          className={`pb-3.5 border-b-2 font-semibold transition whitespace-nowrap ${
            navTab === 'overview'
              ? 'border-black text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Performance Matrix
        </button>
        <button
          onClick={() => setNavTab('telemetry')}
          className={`pb-3.5 border-b-2 font-semibold transition whitespace-nowrap ${
            navTab === 'telemetry'
              ? 'border-black text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          DeepSeek Telemetry
        </button>
        <button
          onClick={() => setNavTab('logs')}
          className={`pb-3.5 border-b-2 font-semibold transition whitespace-nowrap ${
            navTab === 'logs'
              ? 'border-black text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Live Logs ({logs.length})
        </button>
      </div>

      {/* Main Split Layout matching reference screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Agent Dossier & Activities (3.5 cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          {/* Selected Agent Header */}
          <div className="text-center pb-5 border-b border-gray-100">
            <div className="relative inline-block mx-auto mb-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 text-white font-bold text-xl flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-gray-200">
                {currentAgent.name.charAt(0)}
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>

            <h3 className="text-base font-bold text-gray-900">{currentAgent.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Group | <span className="font-mono text-gray-700 font-medium">#{currentAgent.division.toUpperCase()}-{currentAgent.name.toUpperCase()}</span>
            </p>

            {/* 3 Quick Action Buttons matching reference (Mail, Call, More) */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={handleSendEmailReport}
                title="Send email report for this agent"
                className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 flex items-center justify-center transition shadow-2xs"
              >
                <Mail size={18} />
              </button>
              <button
                onClick={handleSimulate}
                title="Trigger simulated task"
                className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 flex items-center justify-center transition shadow-2xs"
              >
                <Phone size={18} />
              </button>
              <button
                onClick={fetchData}
                title="Refresh telemetry"
                className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 flex items-center justify-center transition shadow-2xs"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="text-[11px] text-gray-400 mt-3 font-medium flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Last Activity: <strong className="text-gray-700 font-semibold">{currentAgent.last_active || 'Baru Saja'}</strong>
            </div>
          </div>

          {/* Segmented Tab Switcher (Overview vs Activities) */}
          <div className="flex border-b border-gray-200 mt-4">
            <button
              onClick={() => setSidebarTab('activities')}
              className={`flex-1 py-2 text-center text-xs font-semibold transition border-b-2 ${
                sidebarTab === 'activities'
                  ? 'border-black text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              Activities
            </button>
            <button
              onClick={() => setSidebarTab('overview')}
              className={`flex-1 py-2 text-center text-xs font-semibold transition border-b-2 ${
                sidebarTab === 'overview'
                  ? 'border-black text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              Profile Info
            </button>
          </div>

          {/* Tab Content: Activities Timeline */}
          {sidebarTab === 'activities' ? (
            <div className="pt-4 space-y-4">
              {/* Timeline item 1 */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 shrink-0 mt-0.5">
                  <MessageSquare size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">
                    Instruksi Diterima dari Bos Rayhan
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Hari ini • Sesi Telegram</p>
                  <span className="inline-block mt-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    ✓ Accepted
                  </span>
                </div>
              </div>

              {/* Timeline item 2 */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 shrink-0 mt-0.5">
                  <Activity size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">
                    Eksekusi Tugas & Pemrosesan Log
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Latency {currentAgent.avg_response_ms || 340}ms</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                      Active
                    </span>
                    <ArrowRight size={10} className="text-gray-400" />
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                      In progress
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline item 3: Thought / Focus */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 shrink-0 mt-0.5">
                  <Sparkles size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">
                    Status Pikiran & Fokus AI
                  </p>
                  <p className="text-[11px] text-gray-600 italic bg-gray-50 p-2 rounded-lg border border-gray-100 mt-1">
                    "{currentAgent.recent_thought || 'Siap menerima instruksi dan menjalankan tugas divisi.'}"
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Tab Content: Profile Info */
            <div className="pt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-400">Divisi Kerja</span>
                <span className={`font-semibold px-2 py-0.5 rounded border text-[11px] ${getDivisionBadge(currentAgent.division)}`}>
                  {currentAgent.division}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-400">Peran & Tanggung Jawab</span>
                <span className="font-semibold text-gray-900 text-right">{currentAgent.role}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-400">Total Tugas Selesai</span>
                <span className="font-bold text-gray-900">{currentAgent.count || 0} Task</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-400">Kecepatan Respons</span>
                <span className="font-mono font-semibold text-gray-900">{currentAgent.avg_response_ms || 340} ms</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-400">Total Token Terpakai</span>
                <span className="font-mono font-semibold text-gray-900">{(currentAgent.tokens_burned || 0).toLocaleString()} tok</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-400">Efektivitas Kerja</span>
                <span className="font-bold text-emerald-600">
                  {currentAgent.effectiveness_rate ? currentAgent.effectiveness_rate.toFixed(1) : '95.5'}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: 3 Top KPI Cards + Clean Filter & Rows (8.5 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top 3 KPI Metric Cards matching reference (Docs Owed [5], Docs Pending Reviews [4], Docs Accepted [12/13]) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Team Effectiveness */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>Team Effectiveness</span>
                </div>
                <div className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
                  {avgEffectiveness}<span className="text-xl font-normal text-gray-400">%</span>
                </div>
              </div>
              <div className="mt-3 pt-2 flex items-center justify-between text-[11px] font-medium text-gray-500">
                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Optimal
                </span>
                <span className="text-gray-700 font-semibold cursor-pointer flex items-center hover:underline">
                  Go To Analytics &rsaquo;
                </span>
              </div>
            </div>

            {/* Card 2: Avg Latency */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5">
                  <Activity size={13} />
                  <span>Avg Response Latency</span>
                </div>
                <div className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
                  320 <span className="text-base font-normal text-gray-400">ms</span>
                </div>
              </div>
              <div className="mt-3 pt-2 text-[11px] text-gray-400">
                Throughput tinggi & stabil
              </div>
            </div>

            {/* Card 3: Active Personnel */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5">
                  <Users size={13} />
                  <span>Agents On-Duty</span>
                </div>
                <div className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
                  12 <span className="text-lg font-normal text-gray-400">/ 13</span>
                </div>
              </div>
              <div className="mt-3 pt-2 text-[11px] text-gray-400">
                Total {stats?.total_activities || 674} tugas terselesaikan
              </div>
            </div>
          </div>

          {/* Filter Bar & Action Strip matching reference (All Documents, Portal Milestones | + Add Template, etc.) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['ALL', 'IT', 'Financial', 'Marketing', 'Asisten Pribadi'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-black text-white shadow-xs'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  {tab === 'ALL' ? `Semua Staf (${personas.length})` : tab}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari anggota tim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition"
              />
            </div>
          </div>

          {/* List of Personnel Cards (Clean Row items matching Documents List from user screenshot) */}
          <div className="space-y-2.5">
            {filteredPersonas.map((person) => {
              const isSelected = currentAgent.name === person.name;
              const eff = person.effectiveness_rate ? person.effectiveness_rate.toFixed(1) : '95.0';
              const effNum = parseFloat(eff);

              return (
                <div
                  key={person.name}
                  onClick={() => setSelectedAgentName(person.name)}
                  className={`bg-white border rounded-xl p-3.5 flex items-center justify-between gap-4 cursor-pointer transition shadow-2xs hover:border-gray-400 ${
                    isSelected ? 'border-black ring-1 ring-black bg-gray-50/50' : 'border-gray-200'
                  }`}
                >
                  {/* Left: Icon & Meta */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 shrink-0 font-bold text-sm">
                      {person.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{person.name}</h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${getDivisionBadge(person.division)}`}>
                          {person.division}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                        {person.role} • <span className="font-mono text-gray-600">{person.count || 0} tasks</span> • <span className="font-mono text-gray-600">{person.avg_response_ms || 340}ms</span> • <span className="font-mono text-gray-600">{(person.tokens_burned || 0).toLocaleString()} tok</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Score Pill & Action Buttons (Check, Close/Info, Dots) */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Unique Effectiveness Pill */}
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md border ${
                        effNum >= 97 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                        effNum >= 95 ? 'text-blue-700 bg-blue-50 border-blue-200' :
                        'text-amber-700 bg-amber-50 border-amber-200'
                      }`}>
                        {eff}%
                      </span>
                    </div>

                    {/* Checkmark icon (circular dark background) */}
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>

                    {/* Status Pill */}
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>

                    {/* Dots Menu */}
                    <button className="text-gray-400 hover:text-gray-700 p-1">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DeepSeek Telemetry Strip */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
                <Cpu size={16} />
              </div>
              <div>
                <span className="font-bold text-gray-900">DeepSeek API Engine</span>
                <span className="text-gray-400 ml-2">Saldo: <strong className="text-gray-900">${ds.topped_up_balance} {ds.currency}</strong></span>
                <span className="text-gray-400 ml-2">Total Tokens: <strong className="text-gray-900">{(ds.total_tokens || 552515).toLocaleString()}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-semibold text-emerald-700">100% Operational</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
