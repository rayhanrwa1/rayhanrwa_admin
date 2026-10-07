import React from 'react';
import Sidebar from './sidebar';
import Header from './header';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-8 flex-1 overflow-auto bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}