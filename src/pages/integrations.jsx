import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Layout from '../components/layout';
import { Plus, Edit2, Trash2, X, Loader2, Link2, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function Integrations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'github',
    target_url: '',
    auth_type: 'token',
    username: '',
    auth_key: '',
    is_active: true
  });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/integrations');
      if (res.data && Array.isArray(res.data.data)) {
        setItems(res.data.data);
      } else if (Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Error fetching integrations', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setFormData({
        name: item.name || '',
        platform: item.platform || 'github',
        target_url: item.target_url || '',
        auth_type: item.auth_type || 'token',
        username: item.username || '',
        auth_key: item.auth_key || '',
        is_active: item.is_active ?? true
      });
      setEditingId(item.id);
    } else {
      setFormData({
        name: '',
        platform: 'github',
        target_url: '',
        auth_type: 'token',
        username: '',
        auth_key: '',
        is_active: true
      });
      setEditingId(null);
    }
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (editingId) {
        await api.put(`/integrations/${editingId}`, formData);
      } else {
        await api.post('/integrations', formData);
      }
      closeModal();
      fetchItems();
    } catch (err) {
      console.error('Error saving integration', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save integration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus konfigurasi integrasi ini?')) {
      try {
        await api.delete(`/integrations/${id}`);
        fetchItems();
      } catch (err) {
        console.error('Error deleting integration', err);
        alert('Gagal menghapus integrasi');
      }
    }
  };

  const getPlatformBadge = (platform) => {
    switch (platform) {
      case 'github':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-900 text-white">GitHub</span>;
      case 'web_report':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Web Report</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">{platform}</span>;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Link2 className="w-6 h-6 text-black" /> Integrations
          </h1>
          <p className="text-sm text-gray-500 mt-1">Kelola koneksi API GitHub, web laporan kerja, dan layanan luar untuk AI.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} />
          <span>Tambah Integrasi</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Belum ada integrasi pihak ketiga.</p>
            <button onClick={() => openModal()} className="mt-4 text-black font-medium hover:underline">
              Tambah integrasi pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
                  <th className="px-6 py-4">Nama Integrasi</th>
                  <th className="px-6 py-4">Platform</th>
                  <th className="px-6 py-4">Target URL</th>
                  <th className="px-6 py-4">Auth Pointer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 w-28 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 text-sm">{item.name}</div>
                      {item.username && (
                        <div className="text-xs text-gray-400 mt-0.5">User: {item.username}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getPlatformBadge(item.platform)}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-600 max-w-xs truncate">
                      {item.target_url}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-indigo-600">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-indigo-500" />
                        {item.auth_key}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.is_active ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                          <XCircle className="w-4 h-4" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(item)}
                          className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">
                {editingId ? 'Edit Integrasi' : 'Tambah Integrasi Baru'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Nama Integrasi</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: GitHub Magangku Repo"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Platform</label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="github">GitHub</option>
                    <option value="web_report">Web Report</option>
                    <option value="jira">Jira</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Metode Auth</label>
                  <select
                    name="auth_type"
                    value={formData.auth_type}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="token">Token / API Key</option>
                    <option value="username_password">Username & Password</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Target URL</label>
                <input
                  type="text"
                  name="target_url"
                  value={formData.target_url}
                  onChange={handleInputChange}
                  required
                  placeholder="https://github.com/rayhanrwa1/Magangku-id atau URL Web Laporan"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Username (Opsional)</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Akun login web"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Auth Key (Pointer .env)</label>
                  <input
                    type="text"
                    name="auth_key"
                    value={formData.auth_key}
                    onChange={handleInputChange}
                    placeholder="ENV:GITHUB_TOKEN"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded text-black border-gray-300 focus:ring-black"
                />
                <label htmlFor="is_active" className="text-xs font-medium text-gray-700 select-none">
                  Aktifkan integrasi ini untuk AI
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                  <span>{editingId ? 'Simpan Perubahan' : 'Buat Integrasi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
