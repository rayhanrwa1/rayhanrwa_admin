const fs = require('fs');
const path = require('path');

const pages = [
  {
    name: 'Projects',
    endpoint: 'projects',
    fields: [
      { name: 'number', type: 'text', label: 'Number' },
      { name: 'category', type: 'text', label: 'Category' },
      { name: 'title', type: 'text', label: 'Title' },
      { name: 'desc', type: 'textarea', label: 'Description (ID)' },
      { name: 'desc_en', type: 'textarea', label: 'Description (EN)' },
      { name: 'desc_id', type: 'textarea', label: 'Description (ID 2)' },
      { name: 'tags', type: 'text', label: 'Tags (comma separated)' },
      { name: 'image', type: 'file', label: 'Image' },
      { name: 'link', type: 'text', label: 'Link' },
    ]
  },
  {
    name: 'Profile',
    endpoint: 'profile',
    fields: [
      { name: 'name', type: 'text', label: 'Name' },
      { name: 'role', type: 'text', label: 'Role' },
      { name: 'tagline', type: 'text', label: 'Tagline' },
      { name: 'bio', type: 'textarea', label: 'Bio (newline separated)' },
      { name: 'email', type: 'text', label: 'Email' },
      { name: 'phone', type: 'text', label: 'Phone' },
      { name: 'bio_en', type: 'textarea', label: 'Bio EN (newline separated)' },
      { name: 'bio_id', type: 'textarea', label: 'Bio ID (newline separated)' },
    ]
  },
  {
    name: 'Stats',
    endpoint: 'stats',
    fields: [
      { name: 'label', type: 'text', label: 'Label' },
      { name: 'value', type: 'text', label: 'Value' },
      { name: 'desc', type: 'text', label: 'Description' },
    ]
  },
  {
    name: 'CoreStack',
    endpoint: 'core_stack',
    fields: [
      { name: 'name', type: 'text', label: 'Name' },
      { name: 'size', type: 'text', label: 'Size (sm/md/lg)' },
    ]
  },
  {
    name: 'Certifications',
    endpoint: 'certifications',
    fields: [
      { name: 'title', type: 'text', label: 'Title' },
      { name: 'issuer', type: 'text', label: 'Issuer' },
      { name: 'date', type: 'text', label: 'Date (YYYY-MM-DD)' },
      { name: 'score', type: 'text', label: 'Score' },
    ]
  },
  {
    name: 'Socials',
    endpoint: 'socials',
    fields: [
      { name: 'name', type: 'text', label: 'Name' },
      { name: 'url', type: 'text', label: 'URL' },
    ]
  },
  {
    name: 'NavLinks',
    endpoint: 'nav_links',
    fields: [
      { name: 'label', type: 'text', label: 'Label' },
      { name: 'path', type: 'text', label: 'Path' },
    ]
  },
  {
    name: 'Journal',
    endpoint: 'journal',
    fields: [
      { name: 'slug', type: 'text', label: 'Slug' },
      { name: 'is_active', type: 'checkbox', label: 'Is Active' },
      { name: 'title_en', type: 'text', label: 'Title EN' },
      { name: 'title_id', type: 'text', label: 'Title ID' },
      { name: 'date', type: 'text', label: 'Date (YYYY-MM-DD)' },
      { name: 'excerpt_en', type: 'textarea', label: 'Excerpt EN' },
      { name: 'excerpt_id', type: 'textarea', label: 'Excerpt ID' },
      { name: 'content_en', type: 'textarea', label: 'Content EN' },
      { name: 'content_id', type: 'textarea', label: 'Content ID' },
      { name: 'link', type: 'text', label: 'Link' },
      { name: 'authors', type: 'text', label: 'Authors' },
      { name: 'publisher', type: 'text', label: 'Publisher' },
      { name: 'tags', type: 'text', label: 'Tags (comma separated)' },
    ]
  },
  {
    name: 'ArchiveTracks',
    endpoint: 'archive_tracks',
    fields: [
      { name: 'title', type: 'text', label: 'Title' },
      { name: 'artist', type: 'text', label: 'Artist' },
      { name: 'photo', type: 'file', label: 'Photo' },
      { name: 'audio', type: 'file', label: 'Audio' },
      { name: 'type', type: 'text', label: 'Type' },
      { name: 'url', type: 'text', label: 'URL' },
      { name: 'text_id', type: 'text', label: 'Text ID' },
      { name: 'text_en', type: 'text', label: 'Text EN' },
      { name: 'order_index', type: 'number', label: 'Order Index' },
    ]
  },
  {
    name: 'ArchiveQuotes',
    endpoint: 'archive_quotes',
    fields: [
      { name: 'quote_id', type: 'text', label: 'Quote ID (text)' },
      { name: 'quote_en', type: 'text', label: 'Quote EN' },
      { name: 'author', type: 'text', label: 'Author' },
      { name: 'style_type', type: 'text', label: 'Style Type' },
      { name: 'order_index', type: 'number', label: 'Order Index' },
    ]
  },
  {
    name: 'UIProjects',
    endpoint: 'ui_projects',
    fields: [
      { name: 'title', type: 'text', label: 'Title' },
      { name: 'images', type: 'text', label: 'Images (URLs, comma separated)' },
      { name: 'order_index', type: 'number', label: 'Order Index' },
    ]
  },
  {
    name: 'Questions',
    endpoint: 'questions',
    fields: [
      { name: 'level', type: 'number', label: 'Level' },
      { name: 'mission_brief', type: 'textarea', label: 'Mission Brief' },
      { name: 'mission_brief_en', type: 'textarea', label: 'Mission Brief EN' },
      { name: 'filesystem', type: 'textarea', label: 'Filesystem (JSON/Text)' },
      { name: 'hint', type: 'textarea', label: 'Hint' },
      { name: 'hint_en', type: 'textarea', label: 'Hint EN' },
      { name: 'answer', type: 'text', label: 'Answer' },
      { name: 'answer_en', type: 'text', label: 'Answer EN' },
    ]
  },
  {
    name: 'Winners',
    endpoint: 'winners',
    fields: [
      { name: 'name', type: 'text', label: 'Name' },
      { name: 'completed_at', type: 'text', label: 'Completed At' },
    ]
  },
  {
    name: 'SocialPosts',
    endpoint: 'social_posts',
    fields: [
      { name: 'type', type: 'text', label: 'Type' },
      { name: 'nama', type: 'text', label: 'Nama' },
      { name: 'username', type: 'text', label: 'Username' },
      { name: 'foto_profile', type: 'file', label: 'Foto Profile' },
      { name: 'kutipan', type: 'textarea', label: 'Kutipan' },
      { name: 'kutipan_en', type: 'textarea', label: 'Kutipan EN' },
      { name: 'tanggal', type: 'text', label: 'Tanggal' },
      { name: 'link', type: 'text', label: 'Link' },
    ]
  },
  {
    name: 'MagangkuItems',
    endpoint: 'magangku_items',
    fields: [
      { name: 'title', type: 'text', label: 'Title' },
      { name: 'subtitle', type: 'text', label: 'Subtitle' },
      { name: 'preview_type', type: 'text', label: 'Preview Type' },
      { name: 'preview_title', type: 'text', label: 'Preview Title' },
      { name: 'link', type: 'text', label: 'Link' },
      { name: 'order_index', type: 'number', label: 'Order Index' },
      { name: 'content', type: 'textarea', label: 'Content' },
      { name: 'image_url', type: 'file', label: 'Image' },
    ]
  },
  {
    name: 'MagangkuMessages',
    endpoint: 'magangku_messages',
    fields: [
      { name: 'name', type: 'text', label: 'Name' },
      { name: 'message', type: 'textarea', label: 'Message' },
      { name: 'message_en', type: 'textarea', label: 'Message EN' },
      { name: 'photo', type: 'file', label: 'Photo' },
      { name: 'link', type: 'text', label: 'Link' },
      { name: 'preview_type', type: 'text', label: 'Preview Type' },
      { name: 'preview_title', type: 'text', label: 'Preview Title' },
    ]
  },
  {
    name: 'ShareBackgrounds',
    endpoint: 'share_backgrounds',
    fields: [
      { name: 'image_url', type: 'file', label: 'Image' },
      { name: 'bg_color', type: 'text', label: 'Background Color' },
    ]
  },
  {
    name: 'VideoEdits',
    endpoint: 'video_edits',
    fields: [
      { name: 'title_en', type: 'text', label: 'Title EN' },
      { name: 'title_id', type: 'text', label: 'Title ID' },
      { name: 'video_url', type: 'file', label: 'Video' },
      { name: 'thumbnail_url', type: 'file', label: 'Thumbnail' },
      { name: 'duration', type: 'text', label: 'Duration' },
      { name: 'order_index', type: 'number', label: 'Order Index' },
    ]
  },
];

const generatePage = (page) => {
  const fileName = page.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + '.jsx';
  const filePath = path.join(__dirname, 'src', 'pages', fileName);
  
  const initialState = page.fields.reduce((acc, field) => {
    if (field.type === 'checkbox') {
      acc[field.name] = false;
    } else {
      acc[field.name] = '';
    }
    return acc;
  }, {});

  const stateStr = JSON.stringify(initialState, null, 2).replace(/"([^"]+)":/g, '$1:');

  const content = `import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Layout from '../components/layout';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';

export default function ${page.name}() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(${stateStr});
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
      const res = await api.get('/${page.endpoint}');
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

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const openModal = (item = null) => {
    if (item) {
      let editableData = { ...item };
      ${page.fields.filter(f => f.name === 'tags' || f.name.startsWith('bio')).map(f => `
      if (Array.isArray(editableData.${f.name})) {
        editableData.${f.name} = editableData.${f.name}.join(${f.name === 'tags' ? "', '" : "'\\\\n'"});
      }
      `).join('')}
      
      ${page.fields.filter(f => f.type === 'file').map(f => `
      editableData.${f.name} = '';
      `).join('')}
      
      setFormData(editableData);
      setEditingId(item.id || item._id);
    } else {
      setFormData(${stateStr});
      setEditingId(null);
    }
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(${stateStr});
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      let processedData = { ...formData };
      
      ${page.fields.filter(f => f.type === 'file').map(f => `
      if (processedData.${f.name} && processedData.${f.name} instanceof File) {
        const uploadForm = new FormData();
        uploadForm.append('file', processedData.${f.name});
        const uploadRes = await api.post('/upload', uploadForm, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        processedData.${f.name} = uploadRes.data.url || uploadRes.data?.data?.url;
      }
      `).join('')}

      ${page.fields.filter(f => f.name === 'tags' || f.name.startsWith('bio')).map(f => `
      if (typeof processedData.${f.name} === 'string' && processedData.${f.name}) {
        processedData.${f.name} = processedData.${f.name}.split(${f.name === 'tags' ? "','" : "'\\\\n'"}).map(s => s.trim()).filter(Boolean);
      }
      `).join('')}

      if (editingId) {
        await api.put(\`/${page.endpoint}/\${editingId}\`, processedData);
      } else {
        await api.post('/${page.endpoint}', processedData);
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
        await api.delete(\`/${page.endpoint}/\${id}\`);
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
          <h1 className="text-2xl font-bold text-gray-900">${page.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your ${page.name.toLowerCase()} data.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
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
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4 w-32 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id || item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 text-sm">
                        {item.title || item.name || item.nama || item.label || item.title_en || item.slug || item.mission_brief || item.quote_id || \`Item \${item.id || item._id}\`}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-md">
                        {item.desc || item.subtitle || item.category || item.email || item.url || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openModal(item)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id || item._id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Item' : 'New Item'}</h2>
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
                ${page.fields.map(field => {
                  if (field.type === 'textarea') {
                    return `
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">${field.label}</label>
                  <textarea
                    name="${field.name}"
                    value={formData.${field.name} || ''}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-y text-sm"
                  ></textarea>
                </div>`;
                  } else if (field.type === 'checkbox') {
                    return `
                <div className="flex items-center space-x-3 py-2">
                  <input
                    type="checkbox"
                    name="${field.name}"
                    checked={formData.${field.name} || false}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label className="text-sm font-medium text-gray-700">${field.label}</label>
                </div>`;
                  } else if (field.type === 'file') {
                    return `
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">${field.label} {editingId && <span className="text-gray-400 font-normal">(Leave empty to keep current)</span>}</label>
                  <input
                    type="file"
                    name="${field.name}"
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all text-sm"
                  />
                </div>`;
                  } else {
                    return `
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">${field.label}</label>
                  <input
                    type="${field.type}"
                    name="${field.name}"
                    value={formData.${field.name} || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>`;
                  }
                }).join('')}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium text-sm"
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
`;
  fs.writeFileSync(filePath, content);
  console.log(`Generated Modal UI for ${fileName}`);
};

pages.forEach(generatePage);
