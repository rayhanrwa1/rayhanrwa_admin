const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/pages/video-edits.jsx');
let content = fs.readFileSync(file, 'utf8');

// Update formData state
content = content.replace(
    /const \[formData, setFormData\] = useState\(\{[\s\S]*?\}\);/,
    `const [formData, setFormData] = useState({
    title: "",
    youtube_url: "",
    thumbnail_url: ""
  });`
);

// Update openModal reset
content = content.replace(
    /setFormData\(\{[\s\S]*?order_index: ""\n\s*\}\);/g,
    `setFormData({
        title: "",
        youtube_url: "",
        thumbnail_url: ""
      });`
);

// In openModal item binding
content = content.replace(
    /editableData\.video_url = '';/g,
    `editableData.youtube_url = item.youtube_url || '';`
);
content = content.replace(
    /const currentVid = item\.video_url \|\| item\.url \|\| '';/g,
    `const currentVid = item.youtube_url || item.url || '';`
);

// Replace form inputs
content = content.replace(
    /<div className="grid grid-cols-1 md:grid-cols-2 gap-5">[\s\S]*?(?=<div className="mt-8 pt-6)/,
    `<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

              `
);

// Update table rows rendering
content = content.replace(
    /\{item\.title_en \|\| item\.title_id \|\| \`Video \$\{item\.id \|\| item\._id\}\`\}/g,
    `{item.title || \`Video \$\{item.id || item._id\}\`}`
);
content = content.replace(
    /\{item\.title_id \? \`ID: \$\{item\.title_id\}\` : ''\} \{item\.duration \? \`• Duration: \$\{item\.duration\}\` : ''\}/g,
    `{item.youtube_url ? \`YouTube: \$\{item.youtube_url\}\` : ''}`
);

fs.writeFileSync(file, content);
console.log('Video edits updated');
