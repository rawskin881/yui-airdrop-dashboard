import React, { useState, useEffect } from 'react';
import { LayoutDashboard, LogOut, Sun, Moon } from 'lucide-react';
import yuiSidebarImg from '../assets/yui_sidebar.png';

interface SidebarProps {
  user: { id: string; name: string } | null;
  logout: () => void;
  mood: { level: number; message: string } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, logout, mood }) => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Yui greetings based on mood
  const getMoodHeader = (level: number) => {
    if (level <= 20) return { title: 'Yui (💢 Marah)', color: 'text-red-500 dark:text-red-400' };
    if (level <= 50) return { title: 'Yui (🥺 Khawatir)', color: 'text-amber-500 dark:text-amber-400' };
    if (level <= 80) return { title: 'Yui (😊 Semangat)', color: 'text-pink-500 dark:text-pink-400' };
    return { title: 'Yui (💖 Bangga)', color: 'text-emerald-500 dark:text-emerald-400' };
  };

  const moodHeader = mood ? getMoodHeader(mood.level) : { title: 'Yui', color: 'text-pink-500' };

  return (
    <aside className="w-full lg:w-72 glass-panel lg:h-screen lg:sticky lg:top-0 flex flex-col p-6 z-10 border-b lg:border-b-0 lg:border-r border-white/20 transition-all duration-300">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yui-pink-dark to-yui-purple-dark flex items-center justify-center text-white font-bold text-xl shadow-md shadow-pink-500/20">
          Y
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-yui-pink-dark to-yui-purple-dark bg-clip-text text-transparent">
            Yui Airdrop
          </h1>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Crypto Dashboard</span>
        </div>
      </div>

      {/* Yui Character Area */}
      <div className="relative flex flex-col items-center p-4 rounded-3xl bg-white/30 dark:bg-slate-900/30 border border-white/20 dark:border-white/5 mb-8 transition-all duration-300">
        {/* Mood Bubble */}
        {mood && (
          <div className="relative w-full p-3 mb-3 text-xs leading-relaxed text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-pink-200/50 dark:border-pink-900/20 shadow-sm animate-float">
            <div className={`font-bold mb-1 ${moodHeader.color}`}>
              {moodHeader.title}
            </div>
            <p className="italic">{mood.message}</p>
            {/* Bubble arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/80 dark:bg-slate-800/80 border-r border-b border-pink-200/50 dark:border-pink-900/20 rotate-45"></div>
          </div>
        )}

        {/* Character Image */}
        <div className="relative w-36 h-36 mt-2 overflow-hidden flex items-center justify-center">
          <img 
            src={yuiSidebarImg} 
            alt="Yui Chibi Sidebar" 
            className="object-contain w-full h-full drop-shadow-[0_4px_12px_rgba(244,114,182,0.25)]" 
          />
        </div>

        {/* Mood percentage bar */}
        {mood && (
          <div className="w-full mt-3 px-2">
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-medium">
              <span>Mood Yui</span>
              <span>{mood.level}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  mood.level <= 20 ? 'bg-red-500' : (mood.level <= 50 ? 'bg-amber-400' : 'bg-pink-400')
                }`}
                style={{ width: `${mood.level}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-1.5">
        <a 
          href="#" 
          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl text-slate-800 dark:text-slate-200 bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-white/5 shadow-sm transition-all"
        >
          <LayoutDashboard size={18} className="text-yui-pink-dark" />
          <span>Dashboard</span>
        </a>
      </nav>

      {/* Footer Settings & Profile */}
      <div className="mt-auto pt-6 border-t border-slate-200/40 dark:border-slate-800/40 space-y-4">
        {/* User Badge */}
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-yui-pink/80 dark:bg-pink-950/40 border border-pink-300 dark:border-pink-900/40 flex items-center justify-center text-yui-pink-dark font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">ID: {user.id}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/20 dark:bg-slate-900/10 hover:bg-white/40 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-400 transition-all active:scale-95"
            title={darkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
          >
            {darkMode ? (
              <>
                <Sun size={16} className="text-amber-500 animate-spin-slow" />
                <span className="text-xs font-medium lg:hidden xl:inline">Terang</span>
              </>
            ) : (
              <>
                <Moon size={16} className="text-indigo-400" />
                <span className="text-xs font-medium lg:hidden xl:inline">Gelap</span>
              </>
            )}
          </button>

          {/* Logout Button */}
          <button 
            onClick={logout}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-red-200/20 dark:border-red-950/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all active:scale-95"
          >
            <LogOut size={16} />
            <span className="text-xs font-semibold lg:hidden xl:inline">Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
