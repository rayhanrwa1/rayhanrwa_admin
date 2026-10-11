import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Layout from '../components/layout';
import { Plus, Edit2, Trash2, X, Loader2, Server, Globe, Database, Shield } from 'lucide-react';

export default function ServerConfigs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    type: 'vercel',
    host_url: '',
    auth_key: '',
    username: '',
    project_path: '',
    status: 'active'
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
      const res = await api.get('/server-configs');
      if (res.data && Array.isArray(res.data.data)) {
        setItems(res.data.data);
      } else if (Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Error fetching server configs', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (item = null) => {
    if (item) {
      setFormData({
        name: item.name || '',
        type: item.type || 'vercel',
        host_url: item.host_url || '',
        auth_key: item.auth_key || '',
        username: item.username || '',
        project_path: item.project_path || '',
        status: item.status || 'active'
      });
      setEditingId(item.id);
    } else {
      setFormData({
        name: '',
        type: 'vercel',
        host_url: '',
        auth_key: '',
        username: '',
        project_path: '',
        status: 'active'
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
        await api.put(`/server-configs/${editingId}`, formData);
      } else {
        await api.post('/server-configs', formData);
      }
      closeModal();
      fetchItems();
    } catch (err) {
      console.error('Error saving server config', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save config');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus konfigurasi server ini?')) {
      try {
        await api.delete(`/server-configs/${id}`);
        fetchItems();
      } catch (err) {
        console.error('Error deleting server config', err);
        alert('Gagal menghapus konfigurasi');
      }
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'vercel':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Vercel</span>;
      case 'firebase':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Firebase</span>;
      case 'vps':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">VPS</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">{type}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active</span>;
      case 'down':
        return <span className="flex items-center gap-1.5 text-xs font-medium text-rose-600"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Down</span>;
      default:
        return <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Warning</span>;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Server className="w-6 h-6 text-indigo-600" /> Server Configs
          </h1>
          <p className="text-sm text-gray-500 mt-1">Kelola server VPS, hosting Vercel, dan database Firebase yang dipantau AI.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} />
          <span>Tambah Server</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Belum ada konfigurasi server.</p>
            <button onClick={() => openModal()} className="mt-4 text-indigo-600 font-medium hover:underline">
              Tambah server pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
                  <th className="px-6 py-4">Server / Project</th>
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4">Host / URL</th>
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
                      {item.project_path && (
                        <div className="text-xs text-gray-400 mt-0.5">Path: {item.project_path}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(item.type)}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-600 max-w-xs truncate">
                      {item.host_url}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-indigo-600">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-indigo-500" />
                        {item.auth_key}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
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
                {editingId ? 'Edit Server Config' : 'Tambah Server Config'}
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
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Nama Server / Web</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: Magangku Web (Vercel)"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Tipe</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="vercel">Vercel</option>
                    <option value="firebase">Firebase</option>
                    <option value="vps">VPS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="active">Active</option>
                    <option value="warning">Warning</option>
                    <option value="down">Down</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Host / URL</label>
                <input
                  type="text"
                  name="host_url"
                  value={formData.host_url}
                  onChange={handleInputChange}
                  required
                  placeholder="https://www.magangku.web.id/ atau IP VPS"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Auth Key (Pointer .env atau Raw Token)
                </label>
                <input
                  type="text"
                  name="auth_key"
                  value={formData.auth_key}
                  onChange={handleInputChange}
                  placeholder="Contoh: ENV:VERCEL_TOKEN atau ENV:FIREBASE_MAGANGKU_CONFIG"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-[11px] text-gray-400 mt-1">Gunakan format <code>ENV:NAMA_VARIABEL</code> agar token rahasia aman di file .env.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Username (Opsional)</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="root atau username akun"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Project Path / Repo</label>
                  <input
                    type="text"
                    name="project_path"
                    value={formData.project_path}
                    onChange={handleInputChange}
                    placeholder="rayhanrwa1/Magangku-id"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
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
                  <span>{editingId ? 'Simpan Perubahan' : 'Buat Server'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
