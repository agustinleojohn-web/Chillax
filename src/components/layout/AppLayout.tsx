import React from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { Toaster } from 'sonner';

export function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#141414] text-[#FFFFFF] overflow-x-hidden selection:bg-[#E50914]/40 selection:text-white">
      <Navbar />
      <main className={`flex-1 w-full ${isHome ? 'pt-0' : 'pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      {/* New pages open at the top; back/forward restores the previous scroll position. */}
      <ScrollRestoration />
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#181818',
            border: '1px solid #333333',
            color: '#FFFFFF',
            borderRadius: '0.5rem',
            fontFamily: 'inherit',
          },
        }}
      />
    </div>
  );
}