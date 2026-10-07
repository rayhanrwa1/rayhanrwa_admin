const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');
const targetStr = "{item.title || item.name || item.label || item.slug || item.quote_id || `Item ${item.id}`}";
const newStr = "{item.title || item.name || item.nama || item.label || item.title_en || item.slug || item.mission_brief || item.quote_id || `Item ${item.id}`}";

fs.readdirSync(directoryPath).forEach(file => {
    if(file.endsWith('.jsx')) {
        const filePath = path.join(directoryPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(targetStr)) {
            content = content.replace(targetStr, newStr);
            fs.writeFileSync(filePath, content);
            console.log('Fixed titles for: ' + file);
        }
    }
});
