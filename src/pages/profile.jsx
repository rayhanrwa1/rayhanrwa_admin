import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { uploadFile } from '../utils/upload';
import Layout from '../components/layout';
import { Plus, ArrowLeft, Save, Trash2, Loader2, Image as ImageIcon, Upload, X, User, Mail, Phone, Briefcase, Sparkles, Images } from 'lucide-react';

const emptyForm = {
  name: "", role: "", tagline: "",
  bio: "", bio_en: "", bio_id: "",
  email: "", phone: "",
  photos: []
};

export default function Profile() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('en');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      const data = res.data?.data || res.data;
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Photo handlers ──────────────────────────────────────────────────────────
  const handleAddPhoto = () => {
    setFormData(prev => ({ ...prev, photos: [...(prev.photos || []), { url: '', title: '', location: '', preview: '' }] }));
  };

  const handlePhotoChange = (index, field, value) => {
    const newPhotos = [...formData.photos];
    newPhotos[index] = { ...newPhotos[index], [field]: value };
    setFormData(prev => ({ ...prev, photos: newPhotos }));
  };

  const handlePhotoFileChange = (index, file) => {
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    const newPhotos = [...formData.photos];
    newPhotos[index] = { ...newPhotos[index], preview: localPreview, file };
    setFormData(prev => ({ ...prev, photos: newPhotos }));
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = [...formData.photos];
    newPhotos.splice(index, 1);
    setFormData(prev => ({ ...prev, photos: newPhotos }));
  };

  // ── Open edit ───────────────────────────────────────────────────────────────
  const handleEdit = (item) => {
    let parsedPhotos = [];
    if (item.photos) {
      const raw = Array.isArray(item.photos) ? item.photos :
        (() => { try { return JSON.parse(item.photos); } catch { return []; } })();
      parsedPhotos = raw.map(p => ({
        url: p.url || (typeof p === 'string' ? p : ''),
        title: p.title || '',
        location: p.location || '',
        preview: p.url || (typeof p === 'string' ? p : ''),
      }));
    }

    const bioStr = (v) => Array.isArray(v) ? v.join('\n') : (v || '');

    setFormData({
      ...item,
      bio: bioStr(item.bio),
      bio_en: bioStr(item.bio_en),
      bio_id: bioStr(item.bio_id),
      photos: parsedPhotos,
    });
    setEditingId(item.id || item._id);
    setError('');
    setActiveTab('en');
    setIsEditing(true);
  };

  const handleAdd = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setError('');
    setActiveTab('en');
    setIsEditing(true);
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const processedData = { ...formData };

      // Upload photos
      if (Array.isArray(processedData.photos)) {
        processedData.photos = await Promise.all(
          processedData.photos.map(async (photo) => {
            if (photo.file) {
              const uploadedUrl = await uploadFile(photo.file);
              return { url: uploadedUrl, title: photo.title || '', location: photo.location || '' };
            }
            return { url: photo.url || '', title: photo.title || '', location: photo.location || '' };
          })
        );
      }

      // Process bio fields (newline → array)
      ['bio', 'bio_en', 'bio_id'].forEach(field => {
        if (typeof processedData[field] === 'string' && processedData[field]) {
          processedData[field] = processedData[field].split('\n').map(s => s.trim()).filter(Boolean);
        }
      });

      if (editingId) {
        await api.put(`/profile/${editingId}`, processedData);
      } else {
        await api.post('/profile', processedData);
      }
      setIsEditing(false);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this profile?')) return;
    try {
      await api.delete(`/profile/${id}`);
      fetchItems();
    } catch { alert('Failed to delete'); }
  };

  const f = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));

  // ── EDITOR VIEW ─────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <Layout>
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsEditing(false)} className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer">
              <ArrowLeft size={16} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Profile' : 'New Profile'}</h1>
              <p className="text-xs text-gray-400 mt-0.5">{editingId ? `Editing ID: ${editingId}` : 'Create a new profile entry'}</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors cursor-pointer">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {error && <div className="mb-5 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">{error}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* ── Main Content ── */}
          <div className="xl:col-span-3 space-y-5">
            {/* Identity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-5 flex items-center gap-2"><User size={12} /> Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Full Name</label>
                  <input type="text" value={formData.name || ''} onChange={e => f('name', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black" placeholder="Rayhan..." />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium items-center gap-1"><Briefcase size={11} /> Role</label>
                  <input type="text" value={formData.role || ''} onChange={e => f('role', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black" placeholder="Software Engineer" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium items-center gap-1"><Sparkles size={11} /> Tagline</label>
                  <input type="text" value={formData.tagline || ''} onChange={e => f('tagline', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black" placeholder="Building things that matter..." />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium items-center gap-1"><Mail size={11} /> Email</label>
                  <input type="email" value={formData.email || ''} onChange={e => f('email', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 font-medium flex items-center gap-1"><Phone size={11} /> Phone</label>
                  <input type="text" value={formData.phone || ''} onChange={e => f('phone', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black" placeholder="+62..." />
                </div>
              </div>
            </div>

            {/* Bio with tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                {[
                  { key: 'en', label: '🇬🇧 Bio (English)' },
                  { key: 'id', label: '🇮🇩 Bio (Indonesian)' },
                  { key: 'legacy', label: 'Legacy Bio' },
                ].map(tab => (
                  <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                    className={`px-5 py-3.5 text-sm font-semibold transition-colors cursor-pointer ${activeTab === tab.key ? 'text-gray-900 border-b-2 border-black -mb-px' : 'text-gray-400 hover:text-gray-600'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="p-6">
                {activeTab === 'en' && (
                  <textarea value={formData.bio_en || ''} onChange={e => f('bio_en', e.target.value)} rows={8}
                    className="w-full text-sm text-gray-700 leading-relaxed outline-none resize-none bg-transparent"
                    placeholder="Write your bio in English, one sentence per line..." />
                )}
                {activeTab === 'id' && (
                  <textarea value={formData.bio_id || ''} onChange={e => f('bio_id', e.target.value)} rows={8}
                    className="w-full text-sm leading-relaxed outline-none resize-none bg-transparent placeholder-gray-300"
                    placeholder="Tulis bio dalam Bahasa Indonesia, satu kalimat per baris..." />
                )}
                {activeTab === 'legacy' && (
                  <textarea value={formData.bio || ''} onChange={e => f('bio', e.target.value)} rows={8}
                    className="w-full text-sm leading-relaxed outline-none resize-none bg-transparent placeholder-gray-300"
                    placeholder="Legacy bio field..." />
                )}
              </div>
            </div>

            {/* Photos */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Images size={15} className="text-gray-400" /> Profile Photos</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Upload photos for your profile gallery</p>
                </div>
                <button type="button" onClick={handleAddPhoto} className="text-xs bg-black text-white px-3.5 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer">
                  + Add Photo
                </button>
              </div>

              {formData.photos && formData.photos.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {formData.photos.map((photo, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 border border-gray-100 bg-gray-50/50 rounded-xl">
                      {/* Preview */}
                      <div className="shrink-0">
                        {(photo.preview || photo.url) ? (
                          <img src={photo.preview || photo.url} alt={`Photo ${idx + 1}`} className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 border border-gray-200">
                            <ImageIcon size={24} />
                          </div>
                        )}
                      </div>
                      {/* Fields */}
                      <div className="flex-1 space-y-2.5">
                        <label className="flex items-center gap-2 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors w-fit font-medium text-gray-600">
                          <Upload size={13} />
                          {photo.url ? 'Change Photo' : 'Upload Photo'}
                          <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoFileChange(idx, e.target.files[0])} />
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" value={photo.title || ''} onChange={e => handlePhotoChange(idx, 'title', e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-black" placeholder="Photo Title" />
                          <input type="text" value={photo.location || ''} onChange={e => handlePhotoChange(idx, 'location', e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-black" placeholder="Location" />
                        </div>
                      </div>
                      {/* Remove */}
                      <button type="button" onClick={() => handleRemovePhoto(idx)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center">
                  <ImageIcon size={28} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No photos added yet.</p>
                  <button type="button" onClick={handleAddPhoto} className="mt-3 text-sm text-blue-600 font-medium hover:underline cursor-pointer">Add first photo</button>
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            {/* Quick Preview */}
            <div className="bg-linear-to-br from-gray-900 to-gray-700 rounded-2xl p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Preview</p>
              <p className="text-lg font-bold truncate">{formData.name || 'Your Name'}</p>
              <p className="text-sm text-gray-300 mt-0.5 truncate">{formData.role || 'Your Role'}</p>
              {formData.tagline && <p className="text-xs text-gray-400 mt-2 italic line-clamp-2">"{formData.tagline}"</p>}
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Contact Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate">{formData.email || <span className="text-gray-300 italic">No email</span>}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={14} className="text-gray-400 shrink-0" />
                  <span>{formData.phone || <span className="text-gray-300 italic">No phone</span>}</span>
                </div>
              </div>
            </div>

            {/* Photo count */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Gallery Stats</h3>
              <div className="text-center py-2">
                <p className="text-3xl font-bold text-gray-900">{formData.photos?.length || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Photos in gallery</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ── LIST VIEW ─────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage profile data.</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors font-semibold text-sm cursor-pointer shadow-sm">
          <Plus size={16} />
          Add Profile
        </button>
      </div>

      {loading ? (
        <div className="p-16 flex justify-center"><Loader2 size={28} className="animate-spin text-gray-300" /></div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <User size={32} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm">No profiles found.</p>
          <button onClick={handleAdd} className="mt-3 text-sm text-blue-600 font-medium hover:underline cursor-pointer">Create your profile</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map(item => {
            const firstPhoto = item.photos?.[0]?.url || (typeof item.photos?.[0] === 'string' ? item.photos[0] : null);
            return (
              <div key={item.id || item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Card header */}
                <div className="h-24 bg-linear-to-br from-gray-800 to-gray-600 relative">
                  {firstPhoto && <img src={firstPhoto} alt={item.name} className="w-full h-full object-cover opacity-30" />}
                  <div className="absolute -bottom-6 left-5">
                    <div className="w-14 h-14 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-gray-200">
                      {firstPhoto
                        ? <img src={firstPhoto} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><User size={22} className="text-gray-400" /></div>}
                    </div>
                  </div>
                </div>
                {/* Card body */}
                <div className="pt-9 px-5 pb-5">
                  <h3 className="font-bold text-gray-900">{item.name || 'Unnamed'}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.role || '—'}</p>
                  {item.tagline && <p className="text-xs text-gray-400 mt-2 italic line-clamp-2">"{item.tagline}"</p>}
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{item.photos?.length || 0} photos</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(item)} className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">Edit</button>
                      <span className="text-gray-200">|</span>
                      <button onClick={() => handleDelete(item.id || item._id)} className="text-xs text-red-500 font-semibold hover:underline cursor-pointer">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
