import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { uploadFile } from '../utils/upload';
import Layout from '../components/layout';
import { Plus, Edit2, Trash2, X, Loader2, Image as ImageIcon } from 'lucide-react';

export default function Projects() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [thumbPreview, setThumbPreview] = useState('');
  const [existingThumb, setExistingThumb] = useState('');
  const [formData, setFormData] = useState({
    number: "",
    slug: "",
    category: "",
    title: "",
    short_desc_id: "",
    short_desc_en: "",
    long_desc_id: "",
    long_desc_en: "",
    thumbnail: "",
    images: [],
    tags: "",
    live_link: "",
    github_link: "",
    client: "",
    role: "",
    start_date: "",
    end_date: "",
    status: ""
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
      const res = await api.get('/projects');
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
      
      if (name === 'thumbnail' && file.type.startsWith('image/')) setThumbPreview(URL.createObjectURL(file));

      setIsSubmitting(true);
      try {
        const url = await uploadFile(file, 'image');
        if (name === 'images') {
            setFormData(prev => ({ ...prev, images: [...(prev.images || []), url] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: url }));
        }
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
    if (item) {
      let editableData = { ...item };

      if (Array.isArray(editableData.tags)) {
        editableData.tags = editableData.tags.join(', ');
      }
      
      if (!Array.isArray(editableData.images)) {
          editableData.images = [];
      }

      const currentImg = item.thumbnail || item.image || item.image_url || '';
      setExistingThumb(currentImg);
      editableData.thumbnail = currentImg;

      setFormData(editableData);
      setEditingId(item.id || item._id);
    } else {
      setExistingThumb('');
      setFormData({
        number: "",
        slug: "",
        category: "",
        title: "",
        short_desc_id: "",
        short_desc_en: "",
        long_desc_id: "",
        long_desc_en: "",
        thumbnail: "",
        images: [],
        tags: "",
        live_link: "",
        github_link: "",
        client: "",
        role: "",
        start_date: "",
        end_date: "",
        status: ""
      });
      setEditingId(null);
    }
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setThumbPreview('');
    setExistingThumb('');
    setFormData({
        number: "",
        slug: "",
        category: "",
        title: "",
        short_desc_id: "",
        short_desc_en: "",
        long_desc_id: "",
        long_desc_en: "",
        thumbnail: "",
        images: [],
        tags: "",
        live_link: "",
        github_link: "",
        client: "",
        role: "",
        start_date: "",
        end_date: "",
        status: ""
    });
    setEditingId(null);
    setError('');
  };

  const removeImage = (index) => {
      setFormData(prev => {
          const newImages = [...prev.images];
          newImages.splice(index, 1);
          return { ...prev, images: newImages };
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      let processedData = { ...formData };

      if (typeof processedData.tags === 'string' && processedData.tags) {
        processedData.tags = processedData.tags.split(',').map(s => s.trim()).filter(Boolean);
      }

      if (editingId) {
        await api.put(`/projects/${editingId}`, processedData);
      } else {
        await api.post('/projects', processedData);
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
        await api.delete(`/projects/${id}`);
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
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your projects data.</p>
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
            <button onClick={() => openModal()} className="mt-4 text-blue-600 font-medium hover:underline">
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
                  const imgUrl = item.thumbnail || item.image || item.image_url || item.url;
                  return (
                    <tr key={item.id || item._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={item.title || 'Preview'}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 text-sm">
                          {item.title || item.name || item.category || `Item ${item.id || item._id}`}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-md">
                          {item.short_desc_id || item.short_desc_en || item.category || item.live_link || ''}
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
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition-colors">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Number</label>
                  <input type="text" name="number" value={formData.number || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                  <input type="text" name="slug" value={formData.slug || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <input type="text" name="category" value={formData.category || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                  <input type="text" name="title" value={formData.title || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description (EN)</label>
                  <textarea name="short_desc_en" value={formData.short_desc_en || ''} onChange={handleInputChange} rows="2" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all resize-y text-sm"></textarea>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description (ID)</label>
                  <textarea name="short_desc_id" value={formData.short_desc_id || ''} onChange={handleInputChange} rows="2" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all resize-y text-sm"></textarea>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Long Description (EN)</label>
                  <textarea name="long_desc_en" value={formData.long_desc_en || ''} onChange={handleInputChange} rows="4" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all resize-y text-sm"></textarea>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Long Description (ID)</label>
                  <textarea name="long_desc_id" value={formData.long_desc_id || ''} onChange={handleInputChange} rows="4" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all resize-y text-sm"></textarea>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma separated)</label>
                  <input type="text" name="tags" value={formData.tags || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Thumbnail Image</label>
                  {(thumbPreview || existingThumb) && (
                    <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-xl mb-3">
                      <img src={thumbPreview || existingThumb} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">Thumbnail Preview</p>
                      </div>
                    </div>
                  )}
                  <input type="file" name="thumbnail" accept="image/*" onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm cursor-pointer" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Gallery Images</label>
                  <div className="flex flex-wrap gap-4 mb-3">
                      {formData.images && formData.images.map((img, i) => (
                          <div key={i} className="relative group">
                              <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                              <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X size={14} />
                              </button>
                          </div>
                      ))}
                  </div>
                  <input type="file" name="images" accept="image/*" onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm cursor-pointer" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Live Link</label>
                  <input type="text" name="live_link" value={formData.live_link || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">GitHub Link</label>
                  <input type="text" name="github_link" value={formData.github_link || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Client</label>
                  <input type="text" name="client" value={formData.client || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                  <input type="text" name="role" value={formData.role || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date (e.g. 2023-01)</label>
                  <input type="text" name="start_date" value={formData.start_date || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date (e.g. 2023-06)</label>
                  <input type="text" name="end_date" value={formData.end_date || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select name="status" value={formData.status || ''} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm">
                      <option value="">-- Select Status --</option>
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Maintenance">Maintenance</option>
                  </select>
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
