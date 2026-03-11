
import React, { useState } from 'react';
import { PixelUser, PixelShape, PALETTE } from '../types';
import { Search, Trophy, Box, Star, MapPin, Palette, Shapes, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserDashboardProps {
  users: PixelUser[];
  onSearch: (username: string | null) => void;
  onAddUser: (username: string, color: string, shape: PixelShape) => void;
  onUpdateUser: (user: PixelUser) => void;
  compact?: boolean;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ users, onSearch, onAddUser, onUpdateUser, compact }) => {
  const [search, setSearch] = useState('');
  const [foundUser, setFoundUser] = useState<PixelUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editColor, setEditColor] = useState('#FF6B00');
  const [editShape, setEditShape] = useState<PixelShape>('square');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSearch = search.trim().toLowerCase();
    const username = cleanSearch.startsWith('@') ? cleanSearch : `@${cleanSearch}`;
    const user = users.find(u => u.username.toLowerCase() === username);
    
    setFoundUser(user || null);
    onSearch(user ? user.username : null);
    if (user) {
      setEditColor(user.color);
      setEditShape(user.shape);
    }
  };

  const handleSave = () => {
    if (foundUser) {
      onUpdateUser({
        ...foundUser,
        color: editColor,
        shape: editShape,
        lastUpdated: Date.now()
      });
      setFoundUser({ ...foundUser, color: editColor, shape: editShape });
    } else {
      const username = search.trim().toLowerCase().startsWith('@') ? search.trim() : `@${search.trim()}`;
      onAddUser(username, editColor, editShape);
      // After adding, we need to find the user again or just reset
      setSearch('');
      setFoundUser(null);
    }
    setIsEditing(false);
  };

  if (compact) {
    return (
      <div className="w-full">
        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Localizar @usuario..."
            className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur border border-zinc-200 rounded-2xl shadow-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all text-lg font-bold"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 group-focus-within:text-brand transition-colors" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-brand text-white rounded-xl hover:bg-brand-dark transition-all font-bold shadow-lg shadow-brand/20 active:scale-95"
          >
            Localizar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <section className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          Localiza tu <span className="text-brand">Legado</span>
        </h2>
        <p className="text-zinc-500">Introduce tu @usuario para resaltar tus píxeles en el mosaico de Noma.box.</p>
        
        <form onSubmit={handleSearch} className="relative max-w-md mx-auto group">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tu @usuario..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all text-lg font-medium"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 group-focus-within:text-brand transition-colors" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-brand text-white rounded-xl hover:bg-brand-dark transition-all font-bold shadow-lg shadow-brand/20 active:scale-95"
          >
            Localizar
          </button>
        </form>
      </section>

      <AnimatePresence mode="wait">
        {foundUser ? (
          <motion.div
            key={foundUser.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-8 rounded-3xl border border-brand/20 shadow-2xl shadow-brand/5 space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <MapPin className="w-24 h-24 text-brand" />
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-zinc-900">{foundUser.username}</h3>
                <p className="text-zinc-500 text-sm font-medium">Miembro exclusivo de Noma.box</p>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all"
              >
                {isEditing ? 'Cancelar' : 'Personalizar'}
              </button>
            </div>

            <AnimatePresence>
              {isEditing && (
                <motion.div
                  key="edit-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Palette className="w-4 h-4 text-brand" />
                      Color del Píxel
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PALETTE.map(color => (
                        <button
                          key={color}
                          onClick={() => setEditColor(color)}
                          className={`w-8 h-8 rounded-lg border-2 transition-all ${editColor === color ? 'border-brand scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Shapes className="w-4 h-4 text-brand" />
                      Forma del Píxel
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['square', 'circle', 'diamond', 'triangle'] as PixelShape[]).map(shape => (
                        <button
                          key={shape}
                          onClick={() => setEditShape(shape)}
                          className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center ${editShape === shape ? 'border-brand bg-brand/5 text-brand' : 'border-zinc-100 text-zinc-400 hover:bg-zinc-50'}`}
                        >
                          <div className={`w-4 h-4 bg-current ${
                            shape === 'circle' ? 'rounded-full' : 
                            shape === 'diamond' ? 'rotate-45 scale-75' : 
                            shape === 'triangle' ? 'clip-triangle' : ''
                          }`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    className="w-full py-4 bg-brand text-white rounded-2xl font-black shadow-xl shadow-brand/20 hover:bg-brand-dark transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Guardar Cambios
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-1 group hover:border-brand/30 transition-colors">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                  <Box className="w-3.5 h-3.5 text-brand" />
                  Saldo Píxeles
                </div>
                <div className="text-3xl font-black text-zinc-900">{foundUser.pixelCount}</div>
              </div>
              <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-1 group hover:border-brand/30 transition-colors">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                  <Trophy className="w-3.5 h-3.5 text-brand" />
                  Rango
                </div>
                <div className="text-3xl font-black text-zinc-900">
                  {foundUser.pixelCount > 100 ? 'Élite' : foundUser.pixelCount > 50 ? 'Pro' : 'Fan'}
                </div>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Star className="w-4 h-4 text-brand" />
                Recompensas Activas
              </h4>
              <div className="grid gap-2">
                {foundUser.rewards.length > 0 ? (
                  foundUser.rewards.map((reward, i) => (
                    <div key={i} className="p-4 bg-white border border-zinc-100 rounded-xl flex items-center justify-between group hover:border-brand/50 hover:bg-brand/5 transition-all cursor-pointer">
                      <span className="font-bold text-zinc-700">{reward}</span>
                      <span className="text-[10px] font-black text-brand uppercase tracking-tighter bg-brand/10 px-2 py-1 rounded-md">Canjear</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-zinc-50/50 border border-dashed border-zinc-200 rounded-xl text-center">
                    <p className="text-zinc-400 italic text-sm">Sigue apoyando para desbloquear premios.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : search && (
           <motion.div
             key="user-not-found"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="text-center p-12 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200 space-y-6"
           >
             <div className="space-y-2">
               <p className="text-zinc-400 font-medium">No se encontró ningún usuario con ese nombre.</p>
               <p className="text-zinc-500 text-sm">¿Quieres unirte al mosaico y reclamar tu píxel?</p>
             </div>
             
             <div className="max-w-xs mx-auto space-y-6 text-left">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Palette className="w-4 h-4 text-brand" />
                    Elige tu Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PALETTE.map(color => (
                      <button
                        key={color}
                        onClick={() => setEditColor(color)}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${editColor === color ? 'border-brand scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Shapes className="w-4 h-4 text-brand" />
                    Elige tu Forma
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['square', 'circle', 'diamond', 'triangle'] as PixelShape[]).map(shape => (
                      <button
                        key={shape}
                        onClick={() => setEditShape(shape)}
                        className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center ${editShape === shape ? 'border-brand bg-brand/5 text-brand' : 'border-zinc-100 text-zinc-400 hover:bg-zinc-50'}`}
                      >
                        <div className={`w-4 h-4 bg-current ${
                          shape === 'circle' ? 'rounded-full' : 
                          shape === 'diamond' ? 'rotate-45 scale-75' : 
                          shape === 'triangle' ? 'clip-triangle' : ''
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleSave}
                  className="w-full py-4 bg-brand text-white rounded-2xl font-black shadow-xl shadow-brand/20 hover:bg-brand-dark transition-all"
                >
                  Unirse al Mosaico
                </button>
             </div>

             <button 
               onClick={() => { setSearch(''); onSearch(null); }}
               className="block mx-auto text-zinc-400 font-bold text-sm hover:underline"
             >
               Cancelar
             </button>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
