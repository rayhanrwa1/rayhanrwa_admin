const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    files.forEach(function (file) {
        if(file === 'login.jsx' || file === 'dashboard.jsx' || file === 'lightroom.jsx' || file === 'apple-gallery.jsx') return;
        const filePath = path.join(directoryPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (!content.includes('import Layout')) {
            content = content.replace("import api from '../utils/api';", "import api from '../utils/api';\nimport Layout from '../components/layout';");
            content = content.replace("return (\n    <div className=\"space-y-6\">", "return (\n    <Layout>\n      <div className=\"space-y-6\">");
            content = content.replace("    </div>\n  );\n}", "      </div>\n    </Layout>\n  );\n}");
            fs.writeFileSync(filePath, content);
            console.log('Fixed layout for: ' + file);
        }
    });
});
