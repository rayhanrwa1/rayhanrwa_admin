import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { uploadFile } from '../utils/upload';
import Layout from '../components/layout';
import { Plus, Edit2, Trash2, X, Loader2, Image as ImageIcon, Upload } from 'lucide-react';

export default function UIProjects() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    images: [],
    order_index: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRefs = useRef({});

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ui_projects');
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

  const handleAddImage = () => {
    setFormData(prev => ({ ...prev, images: [...(prev.images || []), { url: "", preview: "" }] }));
  };

  const handleRemoveImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleImageFileChange = async (index, file) => {
    if (!file) return;
    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    const newImages = [...formData.images];
    newImages[index] = { url: newImages[index]?.url || "", preview: localPreview, file };
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const openModal = (item = null) => {
    if (item) {
      let parsedImages = [];
      if (item.images) {
        if (Array.isArray(item.images)) {
          parsedImages = item.images.map(img => ({
            url: typeof img === 'string' ? img : (img.url || ''),
            preview: typeof img === 'string' ? img : (img.url || ''),
          }));
        } else if (typeof item.images === 'string') {
          try {
            const arr = JSON.parse(item.images);
            parsedImages = arr.map(img => ({
              url: typeof img === 'string' ? img : (img.url || ''),
              preview: typeof img === 'string' ? img : (img.url || ''),
            }));
          } catch (e) {
            parsedImages = item.images.split(',').map(s => ({ url: s.trim(), preview: s.trim() })).filter(i => i.url);
          }
        }
      }
      setFormData({
        title: item.title || "",
        images: parsedImages,
        order_index: item.order_index || ""
      });
      setEditingId(item.id || item._id);
    } else {
      setFormData({ title: "", images: [], order_index: "" });
      setEditingId(null);
    }
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ title: "", images: [], order_index: "" });
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Upload any images that have a pending file
      const uploadedImages = await Promise.all(
        formData.images.map(async (img, idx) => {
          if (img.file) {
            setUploadingIndex(idx);
            const uploadedUrl = await uploadFile(img.file);
            return uploadedUrl;
          }
          return img.url;
        })
      );
      setUploadingIndex(null);

      const processedData = {
        title: formData.title,
        images: uploadedImages.filter(Boolean),
        order_index: formData.order_index
      };

      if (editingId) {
        await api.put(`/ui_projects/${editingId}`, processedData);
      } else {
        await api.post('/ui_projects', processedData);
      }

      closeModal();
      fetchItems();
    } catch (err) {
      console.error('Error submitting form', err);
      setError(err.response?.data?.message || 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
      setUploadingIndex(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/ui_projects/${id}`);
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
          <h1 className="text-2xl font-bold text-gray-900">UI Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your UI projects data.</p>
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
                  <th className="px-6 py-4 w-24">Preview</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4 w-32 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  let firstImage = null;
                  if (item.images) {
                    if (Array.isArray(item.images) && item.images.length > 0) {
                      firstImage = typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url;
                    } else if (typeof item.images === 'string') {
                      try { firstImage = JSON.parse(item.images)[0]; } catch (e) { firstImage = item.images; }
                    }
                  }
                  return (
                    <tr key={item.id || item._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        {firstImage ? (
                          <img src={firstImage} alt={item.title} className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 text-sm">{item.title || `Item ${item.id || item._id}`}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {Array.isArray(item.images) ? `${item.images.length} image(s)` : ''}
                          {item.order_index !== undefined ? ` • Order: ${item.order_index}` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button onClick={() => openModal(item)} className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" title="Edit">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(item.id || item._id)} className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer" title="Delete">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Index</label>
                  <input
                    type="number"
                    value={formData.order_index || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_index: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">Images</label>
                    <button type="button" onClick={handleAddImage} className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer">
                      + Add Image
                    </button>
                  </div>

                  {Array.isArray(formData.images) && formData.images.map((img, idx) => (
                    <div key={idx} className="flex items-start gap-3 mb-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      {/* Preview */}
                      <div className="shrink-0">
                        {(img.preview || img.url) ? (
                          <img
                            src={img.preview || img.url}
                            alt={`Image ${idx + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>

                      {/* Upload trigger */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 mb-1">
                          {img.preview && img.preview !== img.url ? 'New image selected' : (img.url ? 'Current image' : 'No image yet')}
                        </p>
                        <label className="flex items-center gap-2 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors w-fit">
                          {uploadingIndex === idx ? (
                            <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                          ) : (
                            <><Upload size={14} /> {img.url ? 'Change Image' : 'Upload Image'}</>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageFileChange(idx, e.target.files[0])}
                            disabled={uploadingIndex !== null}
                          />
                        </label>
                      </div>

                      {/* Remove */}
                      <button type="button" onClick={() => handleRemoveImage(idx)} className="text-red-400 hover:text-red-600 p-1 cursor-pointer shrink-0">
                        <X size={18} />
                      </button>
                    </div>
                  ))}

                  {(!formData.images || formData.images.length === 0) && (
                    <p className="text-sm text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-xl">
                      No images added. Click + Add Image to start.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm cursor-pointer">
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
