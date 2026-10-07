import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Projects from './pages/projects';
import Profile from './pages/profile';
import Journal from './pages/journal';
import ArchiveTracks from './pages/archive-tracks';
import CoreStack from './pages/core-stack';
import Stats from './pages/stats';
import ArchiveQuotes from './pages/archive-quotes';
import Certifications from './pages/certifications';
import Lightroom from './pages/lightroom';
import AppleGallery from './pages/apple-gallery';
import Socials from './pages/socials';
import NavLinks from './pages/nav-links';
import UIProjects from './pages/ui-projects';
import VideoEdits from './pages/video-edits';
import Questions from './pages/questions';
import Winners from './pages/winners';
import SocialPosts from './pages/social-posts';
import MagangkuItems from './pages/magangku-items';
import MagangkuMessages from './pages/magangku-messages';
import ShareBackgrounds from './pages/share-backgrounds';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/archive-tracks" element={<ArchiveTracks />} />
        <Route path="/core-stack" element={<CoreStack />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/archive-quotes" element={<ArchiveQuotes />} />
        <Route path="/certifications" element={<Certifications />} />
        <Route path="/lightroom" element={<Lightroom />} />
        <Route path="/apple-gallery" element={<AppleGallery />} />
        <Route path="/socials" element={<Socials />} />
        <Route path="/nav-links" element={<NavLinks />} />
        <Route path="/ui-projects" element={<UIProjects />} />
        <Route path="/video-edits" element={<VideoEdits />} />
      
        <Route path="/questions" element={<Questions />} />
        <Route path="/winners" element={<Winners />} />
        <Route path="/social-posts" element={<SocialPosts />} />
        <Route path="/magangku-items" element={<MagangkuItems />} />
        <Route path="/magangku-messages" element={<MagangkuMessages />} />
        <Route path="/share-backgrounds" element={<ShareBackgrounds />} />
</Routes>
    </BrowserRouter>
  );
}

export default App;