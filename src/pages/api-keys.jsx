import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Layout from '../components/layout';
import { 
  Key, Plus, Trash2, CheckCircle2, XCircle, Copy, Check, 
  ShieldAlert, Terminal, Eye, EyeOff, Loader2, RefreshCw, Cpu
} from 'lucide-react';

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Modal form state
  const [name, setName] = useState('');
  const [rateLimit, setRateLimit] = useState(60);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api-keys');
      if (res.data && Array.isArray(res.data.data)) {
        setKeys(res.data.data);
      } else {
        setKeys([]);
      }
    } catch (err) {
      console.error('Error fetching API keys', err);
      setError('Gagal mengambil daftar API key');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await api.post('/api-keys', {
        name: name.trim(),
        rate_limit: parseInt(rateLimit, 10) || 60,
        scopes: ['ai:chat']
      });

      if (res.data && res.data.data) {
        setNewlyCreatedKey(res.data.data.api_key);
        fetchKeys();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Gagal membuat API key');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await api.put(`/api-keys/${id}/toggle`, { is_active: !currentStatus });
      setKeys(keys.map(k => k.id === id ? { ...k, is_active: !currentStatus } : k));
    } catch (err) {
      alert('Gagal mengubah status API key');
    }
  };

  const handleDelete = async (id, keyName) => {
    if (!window.confirm(`Yakin ingin mencabut dan menghapus API Key "${keyName}"? Sistem atau server yang menggunakan key ini akan langsung kehilangan akses.`)) {
      return;
    }
    try {
      await api.delete(`/api-keys/${id}`);
      setKeys(keys.filter(k => k.id !== id));
    } catch (err) {
      alert('Gagal menghapus API key');
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const sampleCurl = `curl -X POST https://api.rayhanrwa.my.id/api/external/ai/chat \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${newlyCreatedKey || 'rwa_live_YOUR_API_KEY'}" \\
  -d '{
    "character": "Bayu",
    "message": "Halo Bayu, cek arsitektur microservice server kami apakah aman?",
    "context": "Server Linux Ubuntu 22.04 Docker Host"
  }'`;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI External API Keys</h1>
                <p className="text-sm text-gray-500">Kelola token API agar server, bot, atau sistem eksternal lain bisa mengakses AI Asisten kantor.</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setName('');
              setRateLimit(60);
              setError('');
              setNewlyCreatedKey(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Generate New Key
          </button>
        </div>

        {/* Integration Guide Banner */}
        <div className="bg-gradient-to-r from-gray-900 to-slate-800 text-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-semibold text-sm tracking-wide text-blue-300">
              <Terminal className="w-4 h-4" />
              CARA AKSES DARI SERVER EKSTERNAL LAIN
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sampleCurl);
                setCopiedCurl(true);
                setTimeout(() => setCopiedCurl(false), 2500);
              }}
              className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg font-mono transition-colors cursor-pointer text-gray-200"
            >
              {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCurl ? 'Tersalin!' : 'Copy cURL'}
            </button>
          </div>
          <p className="text-xs text-gray-300 mb-3">
            Kirimkan request HTTP POST ke endpoint <code className="bg-black/40 text-blue-300 px-1.5 py-0.5 rounded font-mono text-[11px]">/api/external/ai/chat</code> dengan header <code className="bg-black/40 text-amber-300 px-1.5 py-0.5 rounded font-mono text-[11px]">X-API-Key: rwa_live_...</code>. Anda bisa memilih nama karakter asisten: <span className="text-white font-medium">Hanai, Bayu, Lutfi, Ikhsan, Naufal, Rayangga, Awik, Hamda, Qinada, Natasya, Farras</span>.
          </p>
          <pre className="bg-black/50 p-3.5 rounded-xl text-[12px] font-mono text-emerald-300 overflow-x-auto leading-relaxed border border-white/5">
            {sampleCurl}
          </pre>
        </div>

        {/* List Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-800">Daftar API Key Terdaftar ({keys.length})</h2>
            </div>
            <button
              onClick={fetchKeys}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
              <p className="text-sm">Memuat data API Keys...</p>
            </div>
          ) : keys.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Key className="w-10 h-10 mx-auto mb-2 text-gray-300 stroke-[1.5]" />
              <p className="font-medium text-gray-600">Belum ada API Key</p>
              <p className="text-xs text-gray-400 mt-1">Buat API Key pertama Anda untuk menghubungkan sistem atau server luar ke AI Asisten.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Nama Sistem / Server</th>
                    <th className="py-3.5 px-6">Token Prefix</th>
                    <th className="py-3.5 px-6">Hak Akses (Scopes)</th>
                    <th className="py-3.5 px-6">Rate Limit</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Terakhir Dipakai</th>
                    <th className="py-3.5 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {keys.map((k) => (
                    <tr key={k.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {k.name}
                        <div className="text-[11px] text-gray-400 font-normal">Dibuat: {new Date(k.created_at).toLocaleDateString('id-ID')}</div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded border border-gray-200">
                          {k.key_prefix}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {k.scopes?.map((scope, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-600 text-[11px] font-mono px-2 py-0.5 rounded-full border border-blue-100">
                              {scope}
                            </span>
                          )) || <span className="text-gray-400 text-xs">-</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-600">
                        {k.rate_limit || 60} req/menit
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggle(k.id, k.is_active)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            k.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {k.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {k.is_active ? 'Active' : 'Revoked'}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500">
                        {k.last_used_at ? new Date(k.last_used_at).toLocaleString('id-ID') : 'Belum pernah'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete(k.id, k.name)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Generate API Key */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Key className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {newlyCreatedKey ? 'Simpan API Key Anda' : 'Generate New API Key'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
                  {error}
                </div>
              )}

              {newlyCreatedKey ? (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <strong>PENTING:</strong> Kunci ini hanya akan ditampilkan sekali ini saja demi keamanan. Segera salin dan simpan di file <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">.env</code> atau secrets server Anda.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">API KEY</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={newlyCreatedKey}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 font-mono text-xs text-gray-900 select-all"
                      />
                      <button
                        onClick={() => handleCopy(newlyCreatedKey, 'modal')}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                      >
                        {copiedKey === 'modal' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedKey === 'modal' ? 'Disalin' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreate} className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Nama Server / Sistem Klien <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Server VPS-2 Monitoring, Bot Discord, dsb."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Rate Limit (Request per Menit)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="600"
                      value={rateLimit}
                      onChange={(e) => setRateLimit(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Default 60 request/menit untuk menjaga server tidak overload.</p>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Generate Key
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

