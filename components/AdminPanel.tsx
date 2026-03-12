
import React, { useState } from 'react';
import { PixelUser, PixelShape, PALETTE } from '../types';
import { UserPlus, Hash, Trash2, LogOut, Settings, Shapes, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminPanelProps {
  users: PixelUser[];
  onAddUser: (username: string, pixelCount: number, color: string, shape: PixelShape) => void;
  onUpdateUser: (user: PixelUser) => void;
  onDeleteUser: (userId: string) => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser, onLogout }) => {
  const [newUsername, setNewUsername] = useState('');
  const [newShape, setNewShape] = useState<PixelShape>('square');
  const [bulkUsernames, setBulkUsernames] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim()) {
      // Pick a random color from the palette (excluding white if possible, or just random)
      const colors = PALETTE.filter(c => c !== '#FFFFFF');
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      onAddUser(newUsername.trim(), 1, randomColor, newShape);
      setNewUsername('');
    }
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usernames = bulkUsernames
      .split(/[\n,]/)
      .map(u => u.trim())
      .filter(u => u.length > 0);

    usernames.forEach(username => {
      const colors = PALETTE.filter(c => c !== '#FFFFFF' && c !== '#F8F9FA');
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const shapes: PixelShape[] = ['square', 'circle', 'diamond', 'triangle'];
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      onAddUser(username, 1, randomColor, randomShape);
    });

    setBulkUsernames('');
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.location.reload()}
          >
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform"
            >
              <Settings className="w-6 h-6" />
            </motion.div>
            <div>
              <h1 className="font-bold text-zinc-900 leading-none group-hover:text-brand transition-colors">Noma Admin</h1>
              <p className="text-xs text-zinc-500 mt-1">Panel de Control Independiente</p>
            </div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-zinc-600 hover:text-brand transition-colors font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6"
            >
              <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <UserPlus className="w-5 h-5 text-brand" />
                </motion.div>
                Asignar Píxeles
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Usuario (@)</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="@seguidor"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Shapes className="w-4 h-4 text-brand" />
                    Forma
                  </label>
                  <div className="grid grid-cols-4 gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    {(['square', 'circle', 'diamond', 'triangle'] as PixelShape[]).map(shape => (
                      <motion.button
                        key={shape}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setNewShape(shape)}
                        className={`p-2 rounded-lg border transition-all flex items-center justify-center ${newShape === shape ? 'border-brand bg-brand/5 text-brand ring-2 ring-brand/20' : 'border-zinc-200 text-zinc-400 hover:bg-zinc-100'}`}
                      >
                        <div className={`w-3 h-3 bg-current ${
                          shape === 'circle' ? 'rounded-full' : 
                          shape === 'diamond' ? 'rotate-45 scale-75' : 
                          shape === 'triangle' ? 'clip-triangle' : ''
                        }`} />
                      </motion.button>
                    ))}
                  </div>
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-brand text-white rounded-xl hover:bg-brand-dark transition-all font-bold shadow-lg shadow-brand/20"
                >
                  Confirmar Asignación
                </motion.button>
              </form>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6"
            >
              <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900">
                <Users className="w-5 h-5 text-brand" />
                Carga Masiva
              </h2>
              <p className="text-xs text-zinc-500">Añade varios usuarios a la vez (uno por línea o separados por comas). Se asignarán colores y formas aleatorias.</p>
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <textarea
                  value={bulkUsernames}
                  onChange={(e) => setBulkUsernames(e.target.value)}
                  placeholder="@usuario1, @usuario2, @usuario3..."
                  rows={5}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-sm font-mono"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!bulkUsernames.trim()}
                  className="w-full py-4 bg-zinc-900 text-white rounded-xl hover:bg-black transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Procesar Carga Masiva
                </motion.button>
              </form>
            </motion.div>
          </section>

          <section className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900">
                  <Hash className="w-5 h-5 text-brand" />
                  Comunidad Activa
                </h2>
                <span className="px-3 py-1 bg-brand/10 text-brand text-xs font-bold rounded-full">
                  {users.length} Seguidores
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50">
                      <th className="py-4 px-6 text-xs font-bold text-zinc-400 uppercase tracking-widest">Usuario</th>
                      <th className="py-4 px-6 text-xs font-bold text-zinc-400 uppercase tracking-widest">Píxeles</th>
                      <th className="py-4 px-6 text-xs font-bold text-zinc-400 uppercase tracking-widest">Estilo</th>
                      <th className="py-4 px-6 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <motion.tr 
                        key={user.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-zinc-50 hover:bg-zinc-50/30 transition-colors group"
                      >
                        <td className="py-4 px-6 font-bold text-zinc-900">{user.username}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={user.pixelCount}
                              onChange={(e) => onUpdateUser({ ...user, pixelCount: parseInt(e.target.value) })}
                              className="w-16 px-2 py-1 bg-transparent border-b border-transparent group-hover:border-zinc-200 focus:border-brand outline-none transition-all font-medium"
                            />
                            <span className="text-zinc-400 text-xs">px</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <motion.div 
                              whileHover={{ scale: 1.2, rotate: 5 }}
                              className="w-8 h-8 rounded-lg border border-zinc-200 shadow-sm" 
                              style={{ backgroundColor: user.color }} 
                            />
                            <motion.div 
                              whileHover={{ scale: 1.2, rotate: -5 }}
                              className={`w-6 h-6 bg-zinc-200 ${
                                user.shape === 'circle' ? 'rounded-full' : 
                                user.shape === 'diamond' ? 'rotate-45 scale-75' : 
                                user.shape === 'triangle' ? 'clip-triangle' : ''
                              }`} 
                            />
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <motion.button
                            whileHover={{ scale: 1.2, color: '#ef4444' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDeleteUser(user.id)}
                            className="p-2 text-zinc-300 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-zinc-400 italic">
                          No hay seguidores registrados todavía.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </section>
        </div>
      </main>
    </div>
  );
};
