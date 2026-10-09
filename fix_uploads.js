const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src/pages');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(srcDir, file), 'utf8');
    let originalContent = content;

    if (!content.includes('handleInputChange') || !content.includes("type === 'file'")) return;

    // We will replace handleInputChange with an async version
    // First, find the handleInputChange function
    const handleInputRegex = /const handleInputChange = \(e\) => \{[\s\S]*?(?=\n  const |  const openModal)/;
    const match = content.match(handleInputRegex);
    
    if (match) {
        let replacement = match[0].replace('const handleInputChange = (e) => {', 'const handleInputChange = async (e) => {');
        replacement = replacement.replace(
            /if \(type === 'file'\) \{[\s\S]*?\} else if/g,
            `if (type === 'file') {
      const file = files[0];
      if (!file) return;
      
      // Local preview if exists
      if (typeof setThumbPreview === 'function' && file.type.startsWith('image/')) setThumbPreview(URL.createObjectURL(file));
      if (typeof setImagePreview === 'function' && file.type.startsWith('image/')) setImagePreview(URL.createObjectURL(file));

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
    } else if`
        );
        content = content.replace(match[0], replacement);
    }
    
    // Now remove the file upload logic from handleSubmit
    // Look for lines like: if (processedData.something && processedData.something instanceof File)
    // We will just replace `instanceof File` blocks with empty
    
    content = content.replace(/if \([^)]*instanceof File[^}]*\} else if \([^\)]*\) \{[^}]*\}/g, '');
    content = content.replace(/if \([^)]*instanceof File[^}]*\}/g, '');

    // Add uploadFile import if not exists
    if (!content.includes('uploadFile')) {
        content = content.replace("import api from '../utils/api';", "import api from '../utils/api';\nimport { uploadFile } from '../utils/upload';");
    }

    if (content !== originalContent) {
        fs.writeFileSync(path.join(srcDir, file), content);
        console.log(`Modified ${file}`);
    }
});
