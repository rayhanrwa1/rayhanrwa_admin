import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Layout from '../components/layout';
import { Users, Edit2, Loader2, Bot, MapPin, Heart } from 'lucide-react';

export default function AICharacters() {
  const [items, setItems] = useState([]);
  const [romancePairs, setRomancePairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [romanceLoading, setRomanceLoading] = useState(true);
  const [romanceError, setRomanceError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    division: '',
    role: '',
    jobdesk: '',
    status: 'working'
  });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchRomance();
    const interval = setInterval(() => {
      fetchItems();
      fetchRomance();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai_characters');
      if (res.data && Array.isArray(res.data.data)) {
        setItems(res.data.data);
      } else if (Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Error fetching AI characters', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRomance = async () => {
    try {
      setRomanceLoading(true);
      const res = await api.get('/ai_characters/romance');
      setRomancePairs(Array.isArray(res.data?.data) ? res.data.data : []);
      setRomanceError('');
    } catch (err) {
      console.error('Error fetching AI character romance monitoring', err);
      setRomanceError(err.response?.data?.error || 'Monitoring romansa belum dapat dimuat.');
    } finally {
      setRomanceLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (item) => {
    setFormData({
      name: item.name || '',
      division: item.division || '',
      role: item.role || '',
      jobdesk: item.jobdesk || '',
      status: item.status || 'working'
    });
    setEditingId(item.id);
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
      // In this version, we save changes to character role & jobdesk
      await api.put(`/ai_characters/${editingId}`, formData);
      closeModal();
      fetchItems();
    } catch (err) {
      console.error('Error saving character', err);
      // If PUT endpoint is not yet mounted, gracefully inform
      setError(err.response?.data?.error || err.response?.data?.message || 'Gagal menyimpan perubahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDivisionBadge = (division) => {
    switch (division) {
      case 'IT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">IT</span>;
      case 'Financial':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Financial</span>;
      case 'Marketing':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Marketing</span>;
      case 'Asisten Pribadi':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Asisten</span>;
      case 'Bos':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Founder & Bos</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">{division}</span>;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-black" /> AI Office Characters
          </h1>
          <p className="text-sm text-gray-500 mt-1">Daftar 13 staf virtual kantor RayhanRWA Journey beserta peran dan jobdesk spesifik.</p>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-rose-100 overflow-hidden mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" /> Monitoring perasaan karakter
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Dinamika romansa roleplay fiksi antar persona AI; diperbarui otomatis tiap 30 detik.
            </p>
          </div>
          <span className="text-xs text-gray-500">
            {romancePairs.length} dinamika terpantau
          </span>
        </div>

        {romanceError ? (
          <div className="m-5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            {romanceError} Jalankan migrasi `016_ai_character_dynamics.sql` dan pastikan server sudah diperbarui.
          </div>
        ) : romanceLoading && romancePairs.length === 0 ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="animate-spin text-gray-400" size={24} />
          </div>
        ) : romancePairs.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            Belum ada karakter yang menunjukkan ketertarikan. Perasaan berkembang bertahap melalui obrolan otomatis.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {romancePairs.map((pair) => (
              <div key={`${pair.character_a}-${pair.character_b}`} className="px-6 py-4 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] items-center gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-gray-800">{pair.character_a} → {pair.character_b}</span>
                    <span className="text-rose-600 font-semibold">{pair.a_to_b}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-400 rounded-full transition-all" style={{ width: `${Math.min(100, pair.a_to_b)}%` }} />
                  </div>
                </div>
                <Heart className={`w-4 h-4 mx-auto ${pair.a_to_b >= 60 && pair.b_to_a >= 60 ? 'text-rose-500 fill-rose-500' : 'text-rose-300'}`} />
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-gray-800">{pair.character_b} → {pair.character_a}</span>
                    <span className="text-rose-600 font-semibold">{pair.b_to_a}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-400 rounded-full transition-all" style={{ width: `${Math.min(100, pair.b_to_a)}%` }} />
                  </div>
                </div>
                <div className="md:text-right">
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100 capitalize">
                    {pair.status}
                  </span>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {pair.updated_at ? new Date(pair.updated_at).toLocaleString('id-ID') : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Belum ada karakter yang terdaftar di database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
                  <th className="px-6 py-4">Nama & Role</th>
                  <th className="px-6 py-4">Divisi</th>
                  <th className="px-6 py-4">Jobdesk & Cara Pandang</th>
                  <th className="px-6 py-4">Posisi Kursi</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 w-20 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-gray-400" />
                        {item.name}
                      </div>
                      <div className="text-xs text-indigo-600 font-medium mt-0.5">{item.role}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getDivisionBadge(item.division)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 max-w-md">
                      {item.jobdesk}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        ({item.pos_x}, {item.pos_y})
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 capitalize">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openModal(item)}
                        className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Jobdesk"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Edit Jobdesk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              Edit Jobdesk {formData.name}
            </h3>
            <p className="text-xs text-gray-500 mb-4">Ubah peran dan cara pandang staf AI ini saat berdiskusi.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Nama Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Jobdesk & Cara Pandang</label>
                <textarea
                  name="jobdesk"
                  rows={4}
                  value={formData.jobdesk}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
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
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
