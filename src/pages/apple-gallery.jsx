import React, { useState, useEffect } from 'react';
import Layout from '../components/layout';
import api from '../utils/api';
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader2, X } from 'lucide-react';

export default function AppleGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    location: '',
    date_taken: ''
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/apple_gallery');
      const fetchedData = res.data?.data || res.data;
      setItems(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (error) {
      console.error('Error fetching apple gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data?.data?.url || res.data?.url;
      setFormData((prev) => ({ ...prev, image_url: url }));
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed!');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingItem) {
        await api.put(`/apple-gallery/${editingItem.id}`, formData);
      } else {
        await api.post('/apple-gallery', formData);
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
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await api.delete(`/apple-gallery/${id}`);
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
        image_url: item.url || item.image_url || '',
        location: item.location || '',
        date_taken: item.date_taken || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ title: '', image_url: '', location: '', date_taken: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Apple Gallery</h1>
          <p className="text-sm text-gray-500 mt-2">Manage your photography collection.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all font-medium shadow-md hover:shadow-lg"
        >
          <Plus size={18} />
          <span>Add Image</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Images Found</h3>
          <p className="text-gray-500">You haven't uploaded any images yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
              <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                {item.type === 'video' ? (
                  <video src={item.url || item.image_url} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" autoPlay muted loop playsInline />
                ) : (
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${item.url || item.image_url})` }} />
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900 text-base line-clamp-1">{item.title || 'Untitled'}</h3>
                </div>
                {(item.location || item.date_taken) && (
                   <p className="text-xs text-gray-500 mb-4">{item.location} {item.date_taken ? `• ${item.date_taken}` : ''}</p>
                )}
                <div className="mt-auto flex justify-end gap-2 pt-3 border-t border-gray-100">
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
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingItem ? 'Edit Image' : 'New Image'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image Photo</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors relative overflow-hidden group">
                    {formData.image_url ? (
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${formData.image_url})` }}>
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-white text-sm font-medium">Change Image</span>
                         </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        {uploading ? <Loader2 className="mx-auto h-8 w-8 text-gray-400 animate-spin" /> : <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />}
                        <div className="text-sm text-gray-600">Upload Media</div>
                      </div>
                    )}
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,video/*" onChange={handleUpload} disabled={uploading} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" placeholder="Sunset at Bali" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                     <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" placeholder="Bali, Indonesia" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Date Taken</label>
                     <input type="date" value={formData.date_taken} onChange={(e) => setFormData({...formData, date_taken: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" />
                   </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving || !formData.image_url} className="px-5 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {editingItem ? 'Save Changes' : 'Upload Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}