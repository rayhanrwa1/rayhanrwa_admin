import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Layout from '../components/layout';
import {
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Radio,
  Share2,
  Plus,
  RefreshCw,
  MoreHorizontal,
  Sparkles,
  Check,
  Activity,
  Paperclip,
  MessageSquare,
  ListFilter,
  Send,
  Users,
  Compass,
  Box,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function AIMonitoring() {
  const scheduleStorageKey = 'ai-monitoring-schedule-v1';
  const notesStorageKey = 'ai-monitoring-notes-v1';
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDivision, setFilterDivision] = useState('ALL');
  const [simulating, setSimulating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [schedules, setSchedules] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(scheduleStorageKey) || '[]');
    } catch {
      return [];
    }
  });
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(notesStorageKey) || '[]');
    } catch {
      return [];
    }
  });
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    date: new Date().toLocaleDateString('en-CA'),
    time: '09:00',
    character: 'Bayu',
    focus: 'Website'
  });
  const [noteForm, setNoteForm] = useState({ title: '', detail: '', character: 'Bayu', focus: 'Website' });

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

  useEffect(() => {
    localStorage.setItem(scheduleStorageKey, JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem(notesStorageKey, JSON.stringify(notes));
  }, [notes]);

  const handleSimulate = async () => {
    try {
      setSimulating(true);
      const res = await api.post('/ai-traffic/simulate');
      const char = res.data?.data?.character_name || 'AI Staff';
      setToastMessage(`Tugas baru berhasil disimulasikan untuk ${char}.`);
      setTimeout(() => setToastMessage(''), 4000);
      fetchData();
    } catch (err) {
      console.error(err);
      setToastMessage('Gagal simulasi tugas.');
      setTimeout(() => setToastMessage(''), 3000);
    } finally {
      setSimulating(false);
    }
  };

  const handleSendEmailReport = async () => {
    try {
      setSendingEmail(true);
      const res = await api.post('/ai-traffic/send-report', {
        recipient_email: '',
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

  const personas = stats?.character_traffic || [];

  const filteredPersonas = personas.filter((p) => {
    if (filterDivision !== 'ALL' && p.division !== filterDivision) return false;
    return true;
  });

  // Calculate overall effectiveness
  const avgEffectiveness = personas.length > 0
    ? (personas.reduce((acc, curr) => acc + (curr.effectiveness_rate || 95.5), 0) / personas.length).toFixed(1)
    : '96.8';

  // Greeting helper
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 11) return 'Good Morning';
    if (hr < 15) return 'Good Afternoon';
    if (hr < 19) return 'Good Evening';
    return 'Good Night';
  };

  // Get current date string formatted like screenshot: "Thursday, 20th February"
  const getFormattedDate = () => {
    const d = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayName = days[d.getDay()];
    const monthName = months[d.getMonth()];
    const dateNum = d.getDate();
    const nth = (d) => {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    return `${dayName}, ${dateNum}${nth(dateNum)} ${monthName}`;
  };

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + index);
    return {
      key: date.toLocaleDateString('en-CA'),
      day: date.toLocaleDateString('id-ID', { weekday: 'short' }),
      date: date.getDate()
    };
  });
  const selectedSchedules = schedules
    .filter((schedule) => schedule.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));
  const focusOptions = ['Website', 'Database (non-Firebase)', 'GitHub repositories'];
  const characterOptions = ['Bayu', 'Lutfi', 'Naufal', 'Rayangga', 'Ikhsan', 'Awik', 'Hamda', 'Hanai'];

  const saveSchedule = (event) => {
    event.preventDefault();
    if (!scheduleForm.title.trim()) return;
    setSchedules((current) => [...current, { ...scheduleForm, id: crypto.randomUUID() }]);
    setSelectedDate(scheduleForm.date);
    setScheduleForm((current) => ({ ...current, title: '' }));
    setShowScheduleForm(false);
    setToastMessage('Jadwal berhasil disimpan.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const saveNote = (event) => {
    event.preventDefault();
    if (!noteForm.title.trim() || !noteForm.detail.trim()) return;
    setNotes((current) => [...current, { ...noteForm, id: crypto.randomUUID(), done: false }]);
    setNoteForm((current) => ({ ...current, title: '', detail: '' }));
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

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header: Greeting + Actions matching reference screenshot */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 font-medium tracking-wide">
              {getFormattedDate()}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mt-1">
              {getGreeting()}! Rayhan,
            </h1>

            {/* Pill Capsule Stat strip matching reference: ⏱ 12hrs Time Saved  ✓ 24 Projects Completed  ⌛ 7 Projects In-progress */}
            <div className="mt-4 inline-flex flex-wrap items-center gap-4 sm:gap-6 bg-white border border-gray-200/90 rounded-full px-5 py-2.5 shadow-2xs text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <span>
                  <strong className="text-gray-900 font-bold">320ms</strong> Latency Avg
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-gray-400" />
                <span>
                  <strong className="text-gray-900 font-bold">{stats?.total_activities || 706}</strong> Tasks Completed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-purple-500" />
                <span>
                  <strong className="text-gray-900 font-bold">{avgEffectiveness}%</strong> Team Effectiveness
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-gray-400" />
                <span>
                  <strong className="text-gray-900 font-bold">{personas.length}</strong> AI Agents Active
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons Top Right: Share / Send Report + Add Task */}
          <div className="flex items-center gap-2.5 shrink-0 self-start">
            <button
              onClick={handleSendEmailReport}
              disabled={sendingEmail}
              className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-2 shadow-2xs transition"
            >
              <Share2 size={14} className={sendingEmail ? 'animate-spin text-blue-600' : 'text-gray-500'} />
              <span>{sendingEmail ? 'Sending...' : 'Share Report'}</span>
            </button>
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
            >
              <Plus size={15} />
              <span>{simulating ? 'Executing...' : 'Add Task'}</span>
            </button>
          </div>
        </div>

        {/* Section 1: "My Projects / AI Team Tasks" Table Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xs overflow-hidden">
          {/* Card Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-base font-bold text-gray-900">
                <span className="text-gray-400">☰</span>
                <span>My Projects & AI Operations</span>
              </div>

              {/* Filter Dropdown Pill */}
              <div className="relative">
                <select
                  value={filterDivision}
                  onChange={(e) => setFilterDivision(e.target.value)}
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 px-2.5 py-1 pr-6 cursor-pointer focus:outline-none transition appearance-none"
                >
                  <option value="ALL">All Divisions ({personas.length})</option>
                  <option value="IT">IT Division</option>
                  <option value="Financial">Financial</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Asisten Pribadi">Executive Assistant</option>
                </select>
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">
                  ▼
                </div>
              </div>
            </div>

            <button
              onClick={fetchData}
              className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-xs font-medium transition flex items-center gap-1.5"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Table Header Row */}
          <div className="grid grid-cols-12 px-5 py-3 text-xs font-medium text-gray-400 bg-gray-50/50 border-b border-gray-100">
            <div className="col-span-6 flex items-center gap-1.5">
              <span>✎</span>
              <span>Task Name</span>
            </div>
            <div className="col-span-3 flex items-center gap-1.5">
              <Users size={13} />
              <span>Assign</span>
            </div>
            <div className="col-span-3 flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>Status</span>
            </div>
          </div>

          {/* Table Body Rows */}
          <div className="divide-y divide-gray-100 text-xs">
            {filteredPersonas.slice(0, 7).map((person, index) => {
              const eff = person.effectiveness_rate ? person.effectiveness_rate.toFixed(1) : '95.0';
              const effNum = parseFloat(eff);

              // Status styles matching screenshot pills
              const getStatusPill = () => {
                if (effNum >= 97.5) {
                  return {
                    label: 'In Progress',
                    className: 'bg-emerald-100/90 text-emerald-800'
                  };
                } else if (effNum >= 96.0) {
                  return {
                    label: 'Completed',
                    className: 'bg-blue-100/90 text-blue-800'
                  };
                } else {
                  return {
                    label: 'Pending',
                    className: 'bg-purple-100/90 text-purple-800'
                  };
                }
              };

              const pill = getStatusPill();

              // Icon for task
              const getTaskIcon = () => {
                if (person.division === 'IT') return <Compass size={14} className="text-gray-400" />;
                if (person.division === 'Financial') return <Box size={14} className="text-gray-400" />;
                return <Users size={14} className="text-gray-400" />;
              };

              return (
                <div
                  key={person.name}
                  className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-gray-50/70 transition"
                >
                  {/* Col 1: Task Name + Chat & Paperclip icons */}
                  <div className="col-span-6 flex items-center justify-between pr-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {getTaskIcon()}
                      <span className="font-medium text-gray-800 truncate">
                        {person.recent_thought && person.recent_thought.length > 5
                          ? person.recent_thought
                          : `Maintain & execute tasks for ${person.role}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-400 shrink-0 ml-2">
                      <div className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        <span className="text-[11px] font-mono">{person.count || 7}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Paperclip size={12} />
                        <span className="text-[11px] font-mono">{Math.floor((person.count || 10) / 4) + 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Assignee (Avatar + Name) */}
                  <div className="col-span-3 flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-linear-to-tr from-gray-800 to-gray-600 text-white font-bold text-[10px] flex items-center justify-center border border-white shadow-2xs">
                      {person.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 block truncate">{person.name}</span>
                      <span className="text-[10px] text-gray-400 block truncate">{person.division}</span>
                    </div>
                  </div>

                  {/* Col 3: Status Pill */}
                  <div className="col-span-3 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${pill.className}`}>
                      {pill.label}
                    </span>

                    <span className="text-[11px] font-mono text-gray-400 font-semibold hidden sm:inline">
                      {eff}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Bottom Two-Column Split (Schedule & Notes) matching reference screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* LEFT: Schedule Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-base font-bold text-gray-900">
                <Calendar size={17} className="text-gray-500" />
                <span>Schedule</span>
              </div>
              <button
                onClick={() => setShowScheduleForm((value) => !value)}
                className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
              >
                <Plus size={15} /> Add schedule
              </button>
            </div>

            {showScheduleForm && (
              <form onSubmit={saveSchedule} className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                <input
                  required
                  value={scheduleForm.title}
                  onChange={(event) => setScheduleForm({ ...scheduleForm, title: event.target.value })}
                  placeholder="Task / agenda"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    required
                    type="date"
                    value={scheduleForm.date}
                    onChange={(event) => setScheduleForm({ ...scheduleForm, date: event.target.value })}
                    className="min-w-0 px-2 py-2 rounded-lg border border-gray-200 text-xs"
                  />
                  <input
                    required
                    type="time"
                    value={scheduleForm.time}
                    onChange={(event) => setScheduleForm({ ...scheduleForm, time: event.target.value })}
                    className="min-w-0 px-2 py-2 rounded-lg border border-gray-200 text-xs"
                  />
                  <select
                    value={scheduleForm.character}
                    onChange={(event) => setScheduleForm({ ...scheduleForm, character: event.target.value })}
                    className="px-2 py-2 rounded-lg border border-gray-200 text-xs"
                  >
                    {characterOptions.map((character) => <option key={character}>{character}</option>)}
                  </select>
                  <select
                    value={scheduleForm.focus}
                    onChange={(event) => setScheduleForm({ ...scheduleForm, focus: event.target.value })}
                    className="px-2 py-2 rounded-lg border border-gray-200 text-xs"
                  >
                    {focusOptions.map((focus) => <option key={focus}>{focus}</option>)}
                  </select>
                </div>
                <button type="submit" className="px-3 py-2 rounded-lg bg-black text-white text-xs font-semibold">Save schedule</button>
              </form>
            )}

            <div className="grid grid-cols-7 gap-1.5 text-center mb-5 pb-4 border-b border-gray-100">
              {weekDays.map((item) => {
                const isSelected = selectedDate === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedDate(item.key)}
                    className={`p-2 rounded-xl text-xs transition flex flex-col items-center justify-center ${isSelected
                      ? 'bg-purple-500 text-white font-bold shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <span className={`text-[10px] ${isSelected ? 'text-purple-100' : 'text-gray-400'}`}>
                      {item.day}
                    </span>
                    <span className="text-sm font-semibold mt-0.5">{item.date}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3.5 text-xs">
              {selectedSchedules.length === 0 && (
                <p className="py-5 text-center text-[11px] text-gray-400">No schedule for this date. Add an agenda and assign an AI character.</p>
              )}
              {selectedSchedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between gap-2 p-2 hover:bg-gray-50 rounded-xl transition">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-1 h-9 rounded-full bg-purple-500 shrink-0 mt-0.5"></div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-1.5 truncate">
                        <Clock size={12} className="text-gray-400 shrink-0" /> {schedule.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">{schedule.time} · {schedule.character} · {schedule.focus}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSchedules((current) => current.filter((item) => item.id !== schedule.id))}
                    className="text-gray-300 hover:text-red-500 p-1"
                    aria-label={`Delete ${schedule.title}`}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Notes Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-base font-bold text-gray-900">
                <FileText size={17} className="text-gray-500" />
                <span>Notes & AI Focus</span>
              </div>
              <button
                onClick={() => setNotes([])}
                className="text-xs text-gray-400 font-medium hover:text-gray-700"
                disabled={notes.length === 0}
              >
                Clear
              </button>
            </div>

            <form onSubmit={saveNote} className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <input
                required
                value={noteForm.title}
                onChange={(event) => setNoteForm({ ...noteForm, title: event.target.value })}
                placeholder="AI focus / task"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs"
              />
              <textarea
                required
                value={noteForm.detail}
                onChange={(event) => setNoteForm({ ...noteForm, detail: event.target.value })}
                placeholder="What should the AI discuss or work on?"
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs resize-y"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={noteForm.character}
                  onChange={(event) => setNoteForm({ ...noteForm, character: event.target.value })}
                  className="px-2 py-2 rounded-lg border border-gray-200 text-xs"
                >
                  {characterOptions.map((character) => <option key={character}>{character}</option>)}
                </select>
                <select
                  value={noteForm.focus}
                  onChange={(event) => setNoteForm({ ...noteForm, focus: event.target.value })}
                  className="px-2 py-2 rounded-lg border border-gray-200 text-xs"
                >
                  {focusOptions.map((focus) => <option key={focus}>{focus}</option>)}
                </select>
              </div>
              <button type="submit" className="px-3 py-2 rounded-lg bg-black text-white text-xs font-semibold">Add AI focus</button>
              <p className="text-[10px] text-gray-400">Firebase is excluded. GitHub actions use only the repository configured on the server.</p>
            </form>

            <div className="space-y-4 text-xs">
              {notes.length === 0 && <p className="py-3 text-center text-[11px] text-gray-400">No AI focus notes yet.</p>}
              {notes.map((note) => (
                <div key={note.id} className="flex items-start gap-3 pb-3 border-b border-gray-100">
                  <button
                    onClick={() => setNotes((current) => current.map((item) => item.id === note.id ? { ...item, done: !item.done } : item))}
                    className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${note.done ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-300'}`}
                    aria-label={note.done ? 'Mark focus as active' : 'Mark focus as done'}
                  >
                    {note.done && <Check size={10} strokeWidth={3} />}
                  </button>
                  <div className="min-w-0">
                    <h4 className={`font-semibold ${note.done ? 'line-through text-gray-400' : 'text-gray-900'}`}>{note.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{note.detail}</p>
                    <p className="text-[10px] text-purple-700 mt-1">{note.character} · {note.focus}</p>
                  </div>
                  <button
                    onClick={() => setNotes((current) => current.filter((item) => item.id !== note.id))}
                    className="ml-auto text-gray-300 hover:text-red-500"
                    aria-label={`Delete ${note.title}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
