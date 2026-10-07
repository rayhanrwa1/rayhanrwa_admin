const fs = require('fs');
const path = require('path');

const pages = [
  { name: 'archive-quotes', getEndpoint: 'archive_quotes', title: 'Archive Quotes' },
  { name: 'certifications', getEndpoint: 'certifications', title: 'Certifications' },
  { name: 'archive-tracks', getEndpoint: 'archive_tracks', title: 'Archive Tracks' },
  { name: 'core-stack', getEndpoint: 'core_stack', title: 'Core Stack' },
  { name: 'journal', getEndpoint: 'journal', title: 'Journal' },
  { name: 'nav-links', getEndpoint: 'nav_links', title: 'Nav Links' },
  { name: 'projects', getEndpoint: 'projects', title: 'Projects' },
  { name: 'ui-projects', getEndpoint: 'ui_projects', title: 'UI Projects' },
  { name: 'video-edits', getEndpoint: 'video_edits', title: 'Video Edits' },
  { name: 'stats', getEndpoint: 'stats', title: 'Stats' },
  { name: 'socials', getEndpoint: 'socials', title: 'Socials' },
  { name: 'profile', getEndpoint: 'profile', title: 'Profile' },
];

const template = (name, endpoint, title) => `import React, { useState, useEffect } from 'react';
import Layout from '../components/layout';
import api from '../utils/api';
import { Plus, Edit2, Trash2, Loader2, X } from 'lucide-react';

export default function ${title.replace(/\s+/g, '')}() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/${endpoint}');
      const fetchedData = res.data?.data || res.data;
      setItems(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (error) {
      console.error('Error fetching ${title}:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      // Assuming delete endpoint follows standard naming
      await api.delete(\`/\${'${endpoint}'.replace('_', '-')}/\${id}\`);
      fetchItems();
    } catch (error) {
      console.error('Delete failed', error);
      alert('Failed to delete data');
    }
  };

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">${title}</h1>
          <p className="text-sm text-gray-500 mt-2">Manage your ${title} data.</p>
        </div>
        <button
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all font-medium shadow-md hover:shadow-lg"
        >
          <Plus size={18} />
          <span>Add New</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Data Found</h3>
          <p className="text-gray-500">You haven't uploaded any data yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                <th className="p-4">ID</th>
                <th className="p-4">Name/Title</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id || index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm text-gray-500">{item.id || index + 1}</td>
                  <td className="p-4 text-sm font-medium text-gray-900">{item.title || item.name || item.title_en || item.label || item.platform || 'Item'}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
`;

pages.forEach(page => {
  const filePath = path.join(__dirname, 'src', 'pages', page.name + '.jsx');
  fs.writeFileSync(filePath, template(page.name, page.getEndpoint, page.title));
  console.log('Generated ' + page.name + '.jsx');
});
