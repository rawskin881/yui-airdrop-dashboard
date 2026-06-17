import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Filter, ArrowUpDown, Plus, Sparkles } from 'lucide-react';
import { AirdropItem } from './AirdropItem';
import type { Airdrop } from './AirdropItem';

interface AirdropListProps {
  airdrops: Airdrop[];
  onEdit: (airdrop: Airdrop) => void;
  onDelete: (airdropId: string) => void;
  onToggleTask: (airdropId: string, taskId: string) => void;
  onAddClick: () => void;
}

type SortOption = 'deadline' | 'skor' | 'createdAt';
type FilterStatus = 'all' | 'pending' | 'done' | 'claim' | 'gagal';

export const AirdropList: React.FC<AirdropListProps> = ({
  airdrops,
  onEdit,
  onDelete,
  onToggleTask,
  onAddClick
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter and sort logic
  const filteredAndSortedAirdrops = useMemo(() => {
    let result = [...airdrops];

    // 1. Apply Search
    if (search.trim() !== '') {
      const query = search.toLowerCase();
      result = result.filter(
        item => 
          (item.name || item.nama || '').toLowerCase().includes(query) ||
          (item.notes || '').toLowerCase().includes(query)
      );
    }

    // 2. Apply Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }

    // 3. Apply Sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'deadline') {
        comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else if (sortBy === 'skor') {
        comparison = a.skor - b.skor;
      } else if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [airdrops, search, statusFilter, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-6">
      {/* Controls Panel */}
      <div className="glass p-5 rounded-3xl border border-white/20 dark:border-white/5 space-y-4 bg-white/25 dark:bg-slate-900/10 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative w-full lg:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari nama airdrop atau catatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-yui-pink-dark/40 focus:border-yui-pink-dark transition-all"
            />
          </div>

          {/* Action and Sort buttons */}
          <div className="flex flex-wrap w-full lg:w-auto items-center gap-3 justify-end">
            
            {/* Filter Status Selector */}
            <div className="flex items-center gap-1.5 bg-white/40 dark:bg-slate-800/40 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <span className="text-[11px] font-bold text-slate-500 pl-2 pr-1 uppercase tracking-wider flex items-center gap-1">
                <Filter size={11} /> Filter:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                className="text-xs font-semibold bg-transparent text-slate-700 dark:text-slate-200 border-none outline-none pr-6 pl-1 py-1 cursor-pointer focus:ring-0"
              >
                <option value="all" className="dark:bg-slate-900">Semua</option>
                <option value="pending" className="dark:bg-slate-900">Pending</option>
                <option value="done" className="dark:bg-slate-900">Done</option>
                <option value="claim" className="dark:bg-slate-900">Claimable</option>
                <option value="gagal" className="dark:bg-slate-900">Gagal</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white/40 dark:bg-slate-800/40 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <span className="text-[11px] font-bold text-slate-500 pl-2 pr-1 uppercase tracking-wider flex items-center gap-1">
                <ArrowUpDown size={11} /> Urutkan:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs font-semibold bg-transparent text-slate-700 dark:text-slate-200 border-none outline-none pr-6 pl-1 py-1 cursor-pointer focus:ring-0"
              >
                <option value="deadline" className="dark:bg-slate-900">Deadline</option>
                <option value="skor" className="dark:bg-slate-900">Skor Potensi</option>
                <option value="createdAt" className="dark:bg-slate-900">Tanggal Buat</option>
              </select>
              <button
                onClick={toggleSortOrder}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all text-xs font-bold"
                title={sortOrder === 'asc' ? 'Urutan Naik (A-Z)' : 'Urutan Turun (Z-A)'}
              >
                {sortOrder === 'asc' ? '▲' : '▼'}
              </button>
            </div>

            {/* Add Airdrop Button */}
            <button
              onClick={onAddClick}
              className="flex items-center gap-1.5 bg-gradient-to-r from-yui-pink-dark to-yui-purple-dark text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 active:scale-95 transition-all"
            >
              <Plus size={14} />
              <span>Tambah Airdrop</span>
            </button>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>Menampilkan: <strong className="text-slate-800 dark:text-slate-200">{filteredAndSortedAirdrops.length}</strong> dari <strong className="text-slate-700 dark:text-slate-300">{airdrops.length}</strong> airdrop</span>
          {search && (
            <span className="bg-pink-100 dark:bg-pink-950/40 text-yui-pink-dark px-2 py-0.5 rounded-lg border border-pink-200/50">
              Kata kunci: "{search}"
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="bg-purple-100 dark:bg-purple-950/40 text-yui-purple-dark px-2 py-0.5 rounded-lg border border-purple-200/50">
              Status: {statusFilter}
            </span>
          )}
        </div>
      </div>

      {/* Airdrops Grid */}
      <AnimatePresence mode="popLayout">
        {filteredAndSortedAirdrops.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {filteredAndSortedAirdrops.map((airdrop) => (
              <motion.div key={airdrop.id} layout>
                <AirdropItem
                  airdrop={airdrop}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleTask={onToggleTask}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass p-12 rounded-3xl border border-white/20 dark:border-white/5 flex flex-col items-center justify-center text-center space-y-4 bg-white/10 dark:bg-slate-900/5 min-h-[300px]"
          >
            <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-950/20 text-yui-pink-dark flex items-center justify-center shadow-inner">
              <Sparkles size={28} />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                Tidak ada airdrop ditemukan
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                🌸 Yui di sini! "Hmm, daftarnya masih kosong nih, Kak. Atau mungkin filternya kemanisan? Yuk tambahkan airdrop baru dengan menekan tombol ungu di kanan atas!"
              </p>
            </div>
            <button
              onClick={onAddClick}
              className="mt-2 bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 px-5 py-2 rounded-2xl text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              Tambah Sekarang
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AirdropList;
