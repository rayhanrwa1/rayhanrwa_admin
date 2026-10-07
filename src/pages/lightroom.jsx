import React, { useState, useEffect } from 'react';
import Layout from '../components/layout';
import api from '../utils/api';
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader2, X } from 'lucide-react';

export default function Lightroom() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    preset_name: '',
    photo_before: '',
    photo_after: ''
  });

  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/lightroom_edits');
      const fetchedData = res.data?.data || res.data;
      setItems(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (error) {
      console.error('Error fetching lightroom edits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploader = type === 'before' ? setUploadingBefore : setUploadingAfter;
    uploader(true);

    const data = new FormData();
    data.append('file', file);

    try {
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data?.data?.url || res.data?.url;
      if (type === 'before') {
        setFormData((prev) => ({ ...prev, photo_before: url }));
      } else {
        setFormData((prev) => ({ ...prev, photo_after: url }));
      }
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed!');
    } finally {
      uploader(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingItem) {
        await api.put(`/lightroom/${editingItem.id}`, formData);
      } else {
        await api.post('/lightroom', formData);
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to save data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this edit?')) return;
    try {
      await api.delete(`/lightroom/${id}`);
      fetchItems();
    } catch (error) {
      console.error('Delete failed', error);
      alert('Failed to delete data');
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        preset_name: item.preset_name || '',
        before_image_url: item.photo_before || '',
        after_image_url: item.photo_after || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ title: '', preset_name: '', photo_before: '', photo_after: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Lightroom Edits</h1>
          <p className="text-sm text-gray-500 mt-2">Manage your photography preset before/after portfolio.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all font-medium shadow-md hover:shadow-lg"
        >
          <Plus size={18} />
          <span>Add Edit</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Edits Found</h3>
          <p className="text-gray-500">You haven't uploaded any Lightroom edits yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
              <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="w-1/2 h-full bg-cover bg-center border-r border-white/30" style={{ backgroundImage: `url(${item.photo_before})` }} />
                  <div className="w-1/2 h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.photo_after})` }} />
                </div>
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-1 rounded">Before</div>
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-1 rounded">After</div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{item.title}</h3>
                </div>
                <div className="mb-4">
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">{item.preset_name}</span>
                </div>
                <div className="mt-auto flex justify-end gap-2 pt-4 border-t border-gray-100">
                  <button onClick={() => openModal(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingItem ? 'Edit Lightroom Preset' : 'New Lightroom Preset'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" placeholder="Moody Tokyo Streets" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preset Name</label>
                    <input required type="text" value={formData.preset_name} onChange={(e) => setFormData({ ...formData, preset_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" placeholder="Cyberpunk Neon" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Before Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors relative overflow-hidden group">
                      {formData.photo_before ? (
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${formData.photo_before})` }}>
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm font-medium">Change Image</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center">
                          {uploadingBefore ? <Loader2 className="mx-auto h-8 w-8 text-gray-400 animate-spin" /> : <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />}
                          <div className="text-sm text-gray-600">Upload before image</div>
                        </div>
                      )}
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleUpload(e, 'before')} disabled={uploadingBefore} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">After Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors relative overflow-hidden group">
                      {formData.photo_after ? (
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${formData.photo_after})` }}>
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm font-medium">Change Image</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center">
                          {uploadingAfter ? <Loader2 className="mx-auto h-8 w-8 text-gray-400 animate-spin" /> : <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />}
                          <div className="text-sm text-gray-600">Upload after image</div>
                        </div>
                      )}
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleUpload(e, 'after')} disabled={uploadingAfter} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving || !formData.photo_before || !formData.photo_after} className="px-5 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {editingItem ? 'Save Changes' : 'Create Preset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}