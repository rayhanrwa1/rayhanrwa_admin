import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { uploadFile } from '../utils/upload';
import Layout from '../components/layout';
import { Plus, Edit2, Trash2, X, Loader2, Video as VideoIcon, Image as ImageIcon } from 'lucide-react';

export default function VideoEdits() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [thumbPreview, setThumbPreview] = useState('');
  const [existingThumb, setExistingThumb] = useState('');
  const [existingVideo, setExistingVideo] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [formData, setFormData] = useState({
    title: "",
    youtube_url: "",
    video_url: "",
    thumbnail_url: ""
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
      const res = await api.get('/video_edits');
      if (res.data && Array.isArray(res.data.data)) {
        setItems(res.data.data);
      } else if (Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching items', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (!file) return;
      
      if (file.type.startsWith('image/')) setThumbPreview(URL.createObjectURL(file));
      if (file.type.startsWith('video/')) setVideoPreview(URL.createObjectURL(file));

      setIsSubmitting(true);
      try {
        const url = await uploadFile(file, file.type.startsWith('video/') ? 'video' : 'image');
        setFormData(prev => ({ ...prev, [name]: url }));
      } catch (err) {
        console.error("Upload failed", err);
        alert("Upload failed");
      } finally {
        setIsSubmitting(false);
      }
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const openModal = (item = null) => {
    setThumbPreview('');
    setVideoPreview('');
    if (item) {
      let editableData = { ...item };
      setExistingThumb(item.thumbnail || item.thumbnail_url || item.image_url || item.image || '');
      setExistingVideo(item.video_url || item.video || '');
      setFormData(editableData);
      setEditingId(item.id || item._id);
    } else {
      setExistingThumb('');
      setExistingVideo('');
      setFormData({
        title: "",
        youtube_url: "",
        video_url: "",
        thumbnail_url: ""
      });
      setEditingId(null);
    }
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setThumbPreview('');
    setVideoPreview('');
    setExistingThumb('');
    setExistingVideo('');
    setFormData({
      title: "",
      youtube_url: "",
      video_url: "",
      thumbnail_url: ""
    });
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      let processedData = { ...formData };

      

      

      if (editingId) {
        await api.put(`/video_edits/${editingId}`, processedData);
      } else {
        await api.post('/video_edits', processedData);
      }

      closeModal();
      fetchItems();
    } catch (err) {
      console.error('Error submitting form', err);
      setError(err.response?.data?.message || 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/video_edits/${id}`);
        fetchItems();
      } catch (err) {
        console.error('Error deleting item', err);
        alert('Failed to delete item');
      }
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Edits</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your video edits data.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm cursor-pointer"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add New</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No data found.</p>
            <button onClick={() => openModal()} className="mt-4 text-blue-600 font-medium hover:underline cursor-pointer">
              Create your first item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
                  <th className="px-6 py-4 w-20">Thumbnail</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4 w-32 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const thumbUrl = item.thumbnail || item.thumbnail_url || item.image_url || item.image;
                  return (
                    <tr key={item.id || item._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={item.title_en || item.title_id || 'Thumbnail'}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                            <VideoIcon size={20} />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 text-sm">
                          {item.title || `Video ${item.id || item._id}`}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-md">
                          {item.youtube_url ? `YouTube: ${item.youtube_url}` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => openModal(item)}
                            className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id || item._id)}
                            className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Item' : 'New Item'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">YouTube URL</label>
                  <input
                    type="text"
                    name="youtube_url"
                    value={formData.youtube_url || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Video File</label>
                  {(videoPreview || existingVideo) && (
                    <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-xl mb-3">
                      <video
                        src={videoPreview || existingVideo}
                        className="w-32 h-20 object-cover rounded-lg border border-gray-200 shrink-0"
                        controls
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">
                          {videoPreview ? 'New Video Selected' : 'Current Loaded Video'}
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    name="video_url"
                    accept="video/*"
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm cursor-pointer"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Thumbnail Image</label>
                  {(thumbPreview || existingThumb) && (
                    <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-xl mb-3">
                      <img
                        src={thumbPreview || existingThumb}
                        alt="Thumbnail Preview"
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">
                          {thumbPreview ? 'New Thumbnail Selected' : 'Current Loaded Thumbnail'}
                        </p>
                        <p className="text-[11px] text-gray-400">Pilih file baru di bawah jika ingin mengganti thumbnail.</p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    name="thumbnail_url"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm cursor-pointer"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium text-sm cursor-pointer"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
