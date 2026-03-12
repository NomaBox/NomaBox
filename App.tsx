
import React, { useState, useEffect, ErrorInfo, ReactNode } from 'react';
import { Canvas } from './components/Canvas';
import { AdminPanel } from './components/AdminPanel';
import { UserDashboard } from './components/UserDashboard';
import { CookieConsent } from './components/CookieConsent';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PixelUser, Pixel, GRID_SIZE } from './types';
import { Lock, Search, Instagram, Youtube, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, loginWithGoogle, loginAnonymously, logout, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string | null;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    (this as any).state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message || String(error) };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    const self = this as any;
    if (self.state.hasError) {
      return (
        <div className="fixed inset-0 bg-white flex items-center justify-center p-6 z-[999]">
          <div className="max-w-md w-full bg-red-50 p-8 rounded-[2rem] border border-red-100 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto text-red-600">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-red-900">Algo salió mal</h2>
            <p className="text-sm text-red-700 font-medium">
              Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
            </p>
            {self.state.errorInfo && (
              <pre className="text-[10px] bg-white/50 p-3 rounded-xl overflow-x-auto text-left font-mono text-red-500">
                {self.state.errorInfo}
              </pre>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return self.props.children;
  }
}

const AppContent: React.FC = () => {
  const [view, setView] = useState<'canvas' | 'admin'>('canvas');
  const [users, setUsers] = useState<PixelUser[]>([]);
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [highlightedOwner, setHighlightedOwner] = useState<string | null>(null);
  const [targetPixel, setTargetPixel] = useState<{ x: number, y: number } | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Sync with Firestore
  useEffect(() => {
    console.log('Attaching Firestore listeners...');
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as PixelUser);
      console.log('Users sync:', usersData.length, 'users found');
      setUsers(usersData);
    }, (error) => {
      console.error('Users sync error:', error);
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    const unsubPixels = onSnapshot(collection(db, 'pixels'), (snapshot) => {
      const pixelsData = snapshot.docs.map(doc => doc.data() as Pixel);
      console.log('Pixels sync:', pixelsData.length, 'pixels found');
      setPixels(pixelsData);
    }, (error) => {
      console.error('Pixels sync error:', error);
      handleFirestoreError(error, OperationType.LIST, 'pixels');
    });

    return () => {
      console.log('Detaching Firestore listeners...');
      unsubUsers();
      unsubPixels();
    };
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      const adminEmail = 'Jaabo.ay@gmail.com'.toLowerCase();
      
      if (user && (user.email?.toLowerCase() === adminEmail || user.isAnonymous)) {
        setIsAdminLoggedIn(true);
        setLoginError(null);
      } else {
        setIsAdminLoggedIn(false);
        if (user && view === 'admin') {
          setLoginError(`Acceso denegado: ${user.email} no tiene permisos de administrador.`);
          setView('canvas');
        } else if (!user && view === 'admin') {
          setView('canvas');
        }
      }
    });

    return () => unsubAuth();
  }, [view]);

  // Other effects
  useEffect(() => {
    // Initial load simulation
    const timer = setTimeout(() => setIsLoading(false), 2500);

    // Hidden admin access
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'a') {
        setShowAdminLogin(prev => !prev);
        setLoginError(null);
        setAccessCode('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, []);

  const handleAccessCodeLogin = async () => {
    if (accessCode === 'noma2026') {
      try {
        await loginAnonymously();
        setIsAdminLoggedIn(true);
        setShowAdminLogin(false);
        setView('admin');
        setLoginError(null);
      } catch (error: any) {
        if (error.code === 'auth/admin-restricted-operation') {
          setLoginError('Error: Debes habilitar "Anonymous Authentication" en tu consola de Firebase para usar el código de acceso.');
        } else {
          setLoginError('Error al iniciar sesión: ' + (error.message || 'Inténtalo de nuevo.'));
        }
      }
    } else {
      setLoginError('Código de acceso incorrecto.');
    }
  };

  const handleAddUser = async (username: string, pixelCount: number, color: string, shape: any = 'square') => {
    console.log('Attempting to add user:', username, { isAdminLoggedIn });
    if (!isAdminLoggedIn) {
      console.error('Add user failed: Not logged in as admin');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().startsWith('@') ? username.trim() : `@${username.trim()}`;
    if (users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      console.warn('User already exists:', cleanUsername);
      return;
    }

    const userId = Math.random().toString(36).substr(2, 9);
    const newUser: PixelUser = {
      id: userId,
      username: cleanUsername,
      pixelCount: pixelCount || 1,
      color,
      shape,
      rewards: [],
      lastUpdated: Date.now(),
    };

    const pixelId = Math.random().toString(36).substr(2, 9);
    const newPixel: Pixel = {
      id: pixelId,
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
      color: newUser.color,
      shape: newUser.shape,
      ownerId: newUser.id,
      ownerName: newUser.username,
    };

    try {
      console.log('Writing to Firestore...', { userId, pixelId });
      await setDoc(doc(db, 'users', userId), newUser);
      await setDoc(doc(db, 'pixels', pixelId), newPixel);
      console.log('Successfully added user and pixel');
    } catch (error) {
      console.error('Firestore write error:', error);
      handleFirestoreError(error, OperationType.WRITE, 'users/pixels');
    }
  };

  const handleUpdateUser = async (updatedUser: PixelUser) => {
    if (!isAdminLoggedIn) return;

    try {
      await setDoc(doc(db, 'users', updatedUser.id), updatedUser);
      
      // Update associated pixel
      const associatedPixel = pixels.find(p => p.ownerId === updatedUser.id);
      if (associatedPixel) {
        await setDoc(doc(db, 'pixels', associatedPixel.id), {
          ...associatedPixel,
          color: updatedUser.color,
          shape: updatedUser.shape,
          ownerName: updatedUser.username
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${updatedUser.id}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isAdminLoggedIn) return;

    try {
      await deleteDoc(doc(db, 'users', userId));
      const associatedPixel = pixels.find(p => p.ownerId === userId);
      if (associatedPixel) {
        await deleteDoc(doc(db, 'pixels', associatedPixel.id));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    }
  };

  const handleAdminLogin = async () => {
    setLoginError(null);
    try {
      const result = await loginWithGoogle();
      const adminEmail = 'Jaabo.ay@gmail.com'.toLowerCase();
      if (result.user.email?.toLowerCase() === adminEmail) {
        setShowAdminLogin(false);
        setView('admin');
      } else {
        setLoginError(`Acceso denegado: ${result.user.email} no tiene permisos de administrador.`);
      }
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === 'auth/popup-blocked') {
        setLoginError('El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes para este sitio.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setLoginError('Se canceló el inicio de sesión.');
      } else {
        setLoginError('Error al iniciar sesión: ' + (error.message || 'Inténtalo de nuevo.'));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-white overflow-hidden font-sans selection:bg-brand/20">
      <AnimatePresence mode="wait">
        {isLoading && <WelcomeScreen key="welcome" />}
      </AnimatePresence>

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
                <h1 
                  onClick={() => window.location.reload()}
                  className="font-black text-2xl tracking-tighter text-brand select-none cursor-pointer hover:opacity-80 transition-opacity"
                >
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
                onClick={() => window.location.reload()}
                className="flex items-center gap-4 bg-white/80 backdrop-blur px-4 py-2 rounded-2xl border border-zinc-100 shadow-sm cursor-pointer hover:bg-white transition-all"
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

        {/* Admin Login Modal */}
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
              <p className="text-zinc-500 text-sm font-medium">
                Usa el código de acceso o inicia sesión con Google.
              </p>
              
              <div className="space-y-3">
                <input 
                  type="password"
                  placeholder="Código de acceso"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAccessCodeLogin()}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-center font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
                <button
                  onClick={handleAccessCodeLogin}
                  className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
                >
                  Entrar con código
                </button>
              </div>

              <div className="flex items-center gap-3 py-2">
                <div className="h-px bg-zinc-100 flex-1" />
                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">O</span>
                <div className="h-px bg-zinc-100 flex-1" />
              </div>

              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 space-y-2"
                >
                  <p>{loginError}</p>
                  {currentUser && (
                    <button 
                      onClick={() => logout()}
                      className="text-red-700 underline hover:text-red-900 transition-colors"
                    >
                      Cerrar sesión para cambiar de cuenta
                    </button>
                  )}
                </motion.div>
              )}

              <button
                onClick={handleAdminLogin}
                className="w-full py-4 bg-brand text-white rounded-2xl hover:bg-brand-dark transition-all font-black shadow-xl shadow-brand/20 flex items-center justify-center gap-3 active:scale-95"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar con Google
              </button>
              <button
                onClick={() => setShowAdminLogin(false)}
                className="w-full py-2 text-zinc-400 text-xs font-bold hover:text-zinc-600 transition-colors"
              >
                Cancelar
              </button>
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
              onLogout={async () => { 
                await logout();
                setView('canvas'); 
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <CookieConsent />
    </div>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

export default App;
