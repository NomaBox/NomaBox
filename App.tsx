
import React, { useState, useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { AdminPanel } from './components/AdminPanel';
import { UserDashboard } from './components/UserDashboard';
import { CookieConsent } from './components/CookieConsent';
import { PixelUser, Pixel, GRID_SIZE } from './types';
import { Lock, Search, Instagram, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const [view, setView] = useState<'canvas' | 'admin'>('canvas');
  const [users, setUsers] = useState<PixelUser[]>([]);
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [highlightedOwner, setHighlightedOwner] = useState<string | null>(null);
  const [targetPixel, setTargetPixel] = useState<{ x: number, y: number } | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize with empty data
  useEffect(() => {
    setUsers([]);
    setPixels([]);

    // Hidden admin access: Press 'Alt + A' to show login
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'a') {
        setShowAdminLogin(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddUser = (username: string, pixelCount: number, color: string, shape: any = 'square') => {
    // Constraint: Only one pixel per person
    const cleanUsername = username.trim().toLowerCase().startsWith('@') ? username.trim() : `@${username.trim()}`;
    if (users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return;
    }

    const newUser: PixelUser = {
      id: Math.random().toString(36).substr(2, 9),
      username: cleanUsername,
      pixelCount: 1, // Force 1 pixel
      color,
      shape,
      rewards: [],
      lastUpdated: Date.now(),
    };
    setUsers([...users, newUser]);
    
    // Add exactly one pixel
    const newPixel: Pixel = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
      color: newUser.color,
      shape: newUser.shape,
      ownerId: newUser.id,
      ownerName: newUser.username,
    };
    setPixels([...pixels, newPixel]);
  };

  const handleUpdateUser = (updatedUser: PixelUser) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setPixels(pixels.map(p => p.ownerId === updatedUser.id ? { ...p, color: updatedUser.color, shape: updatedUser.shape, ownerName: updatedUser.username } : p));
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    setPixels(pixels.filter(p => p.ownerId !== userId));
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'noma2026') {
      setIsAdminLoggedIn(true);
      setView('admin');
      setAdminPassword('');
      setShowAdminLogin(false);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleSearch = (username: string | null) => {
    setHighlightedOwner(username);
  };

  return (
    <div className="fixed inset-0 bg-white overflow-hidden font-sans selection:bg-brand/20">
      {/* Full Screen Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas 
          pixels={pixels} 
          onPixelClick={() => {}} 
          highlightedOwner={highlightedOwner}
          targetPixel={targetPixel}
          fullScreen
        />
      </div>

      {/* Floating UI Elements */}
      <AnimatePresence>
        {view === 'canvas' && (
          <div className="absolute inset-0 pointer-events-none z-10" key="canvas-ui">
            {/* Minimalist Logo */}
            <div className="absolute top-8 left-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h1 className="font-black text-2xl tracking-tighter text-brand select-none">
                  NOMA.BOX
                </h1>
              </motion.div>
            </div>

            {/* Locator UI */}
            <div className="absolute top-8 right-8 flex flex-col items-end gap-4">
              <div className="pointer-events-auto flex flex-col items-end gap-2">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-brand transition-colors" />
                  <span className="absolute left-9 top-1/2 -translate-y-1/2 text-brand font-bold text-sm pointer-events-none">@</span>
                  <input 
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/90 backdrop-blur pl-14 pr-4 py-2 rounded-2xl shadow-lg border border-zinc-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 w-40 sm:w-64 transition-all"
                  />
                </div>

                <AnimatePresence>
                  {searchTerm && (
                    <motion.div 
                      key="search-results-dropdown"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-white/90 backdrop-blur rounded-[1.5rem] shadow-xl border border-zinc-100 w-40 sm:w-64 max-h-60 overflow-y-auto p-2 space-y-1"
                    >
                      {pixels
                        .filter(p => p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setHighlightedOwner(p.ownerName);
                              setTargetPixel({ x: p.x, y: p.y });
                              setSearchTerm('');
                            }}
                            className="w-full text-left px-4 py-2 rounded-xl hover:bg-brand/10 transition-colors flex items-center justify-between group"
                          >
                            <span className="text-sm font-bold text-zinc-700 group-hover:text-brand">{p.ownerName}</span>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                          </button>
                        ))
                      }
                      {pixels.filter(p => p.ownerName.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                        <div className="px-4 py-3 text-xs text-zinc-400 text-center font-medium italic">
                          No se encontraron usuarios
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Clear Filter Button */}
              {highlightedOwner && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    setHighlightedOwner(null);
                    setTargetPixel(null);
                  }}
                  className="pointer-events-auto bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-zinc-100 text-xs font-bold text-brand uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  Limpiar Filtro
                </motion.button>
              )}
            </div>

            {/* Footer Branding & Socials */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 bg-white/80 backdrop-blur px-4 py-2 rounded-2xl border border-zinc-100 shadow-sm"
              >
                <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">noma.box</span>
                <div className="w-px h-3 bg-zinc-200" />
                <div className="flex items-center gap-3 text-zinc-400">
                  <a href="#" className="hover:text-brand transition-colors">
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                  <a href="#" className="hover:text-brand transition-colors">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
                    </svg>
                  </a>
                  <a href="#" className="hover:text-brand transition-colors">
                    <Youtube className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Admin Login Modal (Hidden) */}
        {showAdminLogin && !isAdminLoggedIn && (
          <motion.div 
            key="admin-login-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center space-y-6"
            >
              <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto text-brand">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black">Admin Access</h2>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input
                  autoFocus
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all text-center font-bold"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdminLogin(false)}
                    className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl hover:bg-zinc-200 transition-all font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-brand text-white rounded-2xl hover:bg-brand-dark transition-all font-black shadow-xl shadow-brand/20"
                  >
                    Login
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Admin Panel View */}
        {view === 'admin' && isAdminLoggedIn && (
          <motion.div 
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-white overflow-y-auto"
          >
            <AdminPanel 
              users={users} 
              onAddUser={handleAddUser} 
              onUpdateUser={handleUpdateUser} 
              onDeleteUser={handleDeleteUser} 
              onLogout={() => { setIsAdminLoggedIn(false); setView('canvas'); }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <CookieConsent />
    </div>
  );
};

export default App;
