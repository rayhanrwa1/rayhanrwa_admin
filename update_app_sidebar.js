const fs = require('fs');

let appContent = fs.readFileSync('src/App.jsx', 'utf8');
const newImports = `
import Questions from './pages/questions';
import Winners from './pages/winners';
import SocialPosts from './pages/social-posts';
import MagangkuItems from './pages/magangku-items';
import MagangkuMessages from './pages/magangku-messages';
import ShareBackgrounds from './pages/share-backgrounds';
`;

appContent = appContent.replace("import VideoEdits from './pages/video-edits';", "import VideoEdits from './pages/video-edits';" + newImports);

const newRoutes = `
        <Route path="/questions" element={<Questions />} />
        <Route path="/winners" element={<Winners />} />
        <Route path="/social-posts" element={<SocialPosts />} />
        <Route path="/magangku-items" element={<MagangkuItems />} />
        <Route path="/magangku-messages" element={<MagangkuMessages />} />
        <Route path="/share-backgrounds" element={<ShareBackgrounds />} />
`;

appContent = appContent.replace("</Routes>", newRoutes + "</Routes>");
fs.writeFileSync('src/App.jsx', appContent);

let sidebarContent = fs.readFileSync('src/components/sidebar.jsx', 'utf8');

const newSidebarGroup = `
    {
      title: 'EXTRA',
      items: [
        { name: 'Questions', path: '/questions', icon: <Quotes size={18} /> },
        { name: 'Winners', path: '/winners', icon: <User size={18} /> },
        { name: 'Social Posts', path: '/social-posts', icon: <ShareNetwork size={18} /> },
        { name: 'Magangku Items', path: '/magangku-items', icon: <Article size={18} /> },
        { name: 'Magangku Messages', path: '/magangku-messages', icon: <Article size={18} /> },
        { name: 'Share BGs', path: '/share-backgrounds', icon: <Image size={18} /> }
      ]
    }
  ];
`;

sidebarContent = sidebarContent.replace("  ];", newSidebarGroup);

fs.writeFileSync('src/components/sidebar.jsx', sidebarContent);
console.log('App and Sidebar updated');
