import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Coins, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  X, 
  Save, 
  Trash, 
  Download, 
  RotateCcw
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { StatCard } from '../components/StatCard';
import { AirdropList } from '../components/AirdropList';
import type { Airdrop, Task } from '../components/AirdropItem';
import ProgressBar from '../components/ProgressBar';
import api from '../services/api';

interface DashboardProps {
  user: { id: string; name: string } | null;
  logout: () => void;
}

interface DashboardSummary {
  totalAirdrops: number;
  completed: number;
  pending: number;
  nextDeadline: string | null;
  upcomingReminders: Array<{
    name: string;
    daysLeft: number;
    reminderStatus: string;
  }>;
}

interface DashboardData {
  userId: string;
  mood: { level: number; message: string };
  summary: DashboardSummary;
  airdrops: Airdrop[];
}

export const Dashboard: React.FC<DashboardProps> = ({ user, logout }) => {
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalAirdrops: 0,
    completed: 0,
    pending: 0,
    nextDeadline: null,
    upcomingReminders: []
  });
  const [mood, setMood] = useState<{ level: number; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAirdrop, setEditingAirdrop] = useState<Airdrop | null>(null);
  
  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formStatus, setFormStatus] = useState<Airdrop['status']>('pending');
  const [formSkor, setFormSkor] = useState(5);
  const [formNotes, setFormNotes] = useState('');
  const [formTasks, setFormTasks] = useState<Task[]>([]);
  const [formLink, setFormLink] = useState('');
  const [formRepeatType, setFormRepeatType] = useState<Airdrop['repeatType']>('once');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Fetch all data from backend
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/dashboard/data');
      const data: DashboardData = response.data;
      
      setAirdrops(data.airdrops);
      setSummary(data.summary);
      setMood(data.mood);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.response?.data?.error || 'Gagal memuat data dashboard (T_T)');
      showToast('Gagal memuat data dari server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Toast triggering helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Sync airdrops with server
  const saveAirdropsList = async (updatedList: Airdrop[]) => {
    try {
      await api.post('/api/airdrops', updatedList);
      
      // Re-fetch dashboard data to sync stats & Yui's mood!
      const response = await api.get('/api/dashboard/data');
      const data: DashboardData = response.data;
      setAirdrops(data.airdrops);
      setSummary(data.summary);
      setMood(data.mood);
      
      return true;
    } catch (err: any) {
      console.error('Failed to save airdrops:', err);
      showToast(err.response?.data?.error || 'Gagal menyinkronkan data ke server.', 'error');
      return false;
    }
  };

  // Toggle Subtask done status
  const handleToggleTask = async (airdropId: string, taskId: string) => {
    const updatedAirdrops = airdrops.map(airdrop => {
      if (airdrop.id === airdropId) {
        const updatedTasks = airdrop.tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, done: !task.done };
          }
          return task;
        });
        return { ...airdrop, tasks: updatedTasks };
      }
      return airdrop;
    });

    setAirdrops(updatedAirdrops);
    const ok = await saveAirdropsList(updatedAirdrops);
    if (ok) {
      showToast('Tugas diperbarui! 🌸', 'success');
    }
  };

  // Reset/repeat all checklist tasks under a repeat category
  const handleResetRepeatType = async (type: 'daily' | 'weekly') => {
    const label = type === 'daily' ? 'Harian' : 'Mingguan';
    if (window.confirm(`Apakah Kakak yakin ingin mereset/mengulang semua tugas ${label}? Semua checklist tugas di kategori ini akan dikosongkan kembali! 🔄`)) {
      const updatedAirdrops = airdrops.map(airdrop => {
        if (airdrop.repeatType === type) {
          const resetTasks = (airdrop.tasks || []).map(task => ({
            ...task,
            done: false
          }));
          return {
            ...airdrop,
            tasks: resetTasks,
            status: 'pending' as const
          };
        }
        return airdrop;
      });

      setAirdrops(updatedAirdrops);
      const ok = await saveAirdropsList(updatedAirdrops);
      if (ok) {
        showToast(`Semua tugas ${label} berhasil direset untuk diulang! 🔄🌸`, 'success');
      }
    }
  };

  // Reset checklist tasks of a single airdrop
  const handleResetTasksSingle = async (airdropId: string) => {
    const updatedAirdrops = airdrops.map(airdrop => {
      if (airdrop.id === airdropId) {
        const resetTasks = (airdrop.tasks || []).map(task => ({
          ...task,
          done: false
        }));
        return {
          ...airdrop,
          tasks: resetTasks,
          status: 'pending' as const
        };
      }
      return airdrop;
    });

    setAirdrops(updatedAirdrops);
    const ok = await saveAirdropsList(updatedAirdrops);
    if (ok) {
      showToast('Checklist tugas berhasil direset! 🔄🌸', 'success');
    }
  };

  // Delete an airdrop
  const handleDeleteAirdrop = async (airdropId: string) => {
    if (window.confirm('Apakah Kakak yakin ingin menghapus airdrop ini? Yui sedih lho... 🥺')) {
      const updatedAirdrops = airdrops.filter(a => a.id !== airdropId);
      setAirdrops(updatedAirdrops);
      const ok = await saveAirdropsList(updatedAirdrops);
      if (ok) {
        showToast('Airdrop berhasil dihapus! 💔', 'success');
      }
    }
  };

  // Open modal for Adding
  const handleAddClick = () => {
    setEditingAirdrop(null);
    setFormName('');
    // Default deadline to 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setFormDeadline(nextWeek.toISOString().split('T')[0]);
    setFormStatus('pending');
    setFormSkor(5);
    setFormNotes('');
    setFormTasks([]);
    setFormLink('');
    setFormRepeatType('once');
    setNewTaskTitle('');
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleEditClick = (airdrop: Airdrop) => {
    setEditingAirdrop(airdrop);
    setFormName(airdrop.name || airdrop.nama || '');
    setFormDeadline(airdrop.deadline);
    setFormStatus(airdrop.status);
    setFormSkor(airdrop.skor);
    setFormNotes(airdrop.notes || '');
    setFormTasks(airdrop.tasks || []);
    setFormLink(airdrop.link || '');
    setFormRepeatType(airdrop.repeatType || 'once');
    setNewTaskTitle('');
    setIsModalOpen(true);
  };

  // Add Task to list inside modal
  const handleAddTaskInModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title: newTaskTitle.trim(),
      done: false
    };

    setFormTasks([...formTasks, newTask]);
    setNewTaskTitle('');
  };

  // Remove Task from list inside modal
  const handleRemoveTaskInModal = (taskId: string) => {
    setFormTasks(formTasks.filter(t => t.id !== taskId));
  };

  // Save Modal Form (Create / Update)
  const handleSaveAirdrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Nama airdrop tidak boleh kosong!', 'error');
      return;
    }
    if (!formDeadline) {
      showToast('Deadline harus diisi!', 'error');
      return;
    }

    let updatedAirdrops = [...airdrops];

    if (editingAirdrop) {
      // Edit mode
      updatedAirdrops = airdrops.map(item => {
        if (item.id === editingAirdrop.id) {
          return {
            ...item,
            name: formName.trim(),
            nama: formName.trim(), // sync double key
            deadline: formDeadline,
            status: formStatus,
            skor: formSkor,
            notes: formNotes.trim(),
            tasks: formTasks,
            link: formLink.trim(),
            repeatType: formRepeatType,
          };
        }
        return item;
      });
    } else {
      // Add mode
      const newAirdrop: Airdrop = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9) + '-' + Math.random().toString(36).substring(2, 9),
        userId: user?.id || 'unknown',
        name: formName.trim(),
        nama: formName.trim(),
        deadline: formDeadline,
        status: formStatus,
        skor: formSkor,
        notes: formNotes.trim(),
        tasks: formTasks,
        createdAt: new Date().toISOString(),
        link: formLink.trim(),
        repeatType: formRepeatType,
      };
      updatedAirdrops.push(newAirdrop);
    }

    setAirdrops(updatedAirdrops);
    const ok = await saveAirdropsList(updatedAirdrops);
    if (ok) {
      showToast(
        editingAirdrop ? 'Airdrop berhasil diperbarui! 🌸' : 'Airdrop baru berhasil ditambahkan! 🌸', 
        'success'
      );
      setIsModalOpen(false);
    }
  };

  // Export airdrops to CSV file
  const handleExportCSV = () => {
    if (airdrops.length === 0) {
      showToast('Tidak ada data airdrop untuk di-ekspor.', 'error');
      return;
    }

    const headers = ['Nama Airdrop', 'Deadline', 'Status', 'Skor Potensi', 'Tasks Selesai', 'Total Tasks', 'Catatan', 'Tanggal Dibuat'];
    
    const rows = airdrops.map(item => {
      const name = item.name || item.nama || 'Unnamed';
      const total = item.tasks?.length || 0;
      const completed = item.tasks?.filter(t => t.done).length || 0;
      const noteClean = (item.notes || '').replace(/"/g, '""'); // escape double quotes
      
      return [
        `"${name}"`,
        item.deadline,
        item.status,
        item.skor,
        completed,
        total,
        `"${noteClean}"`,
        item.createdAt
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `yui_airdrops_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Data berhasil diekspor ke CSV! 📄', 'success');
  };

  // Dynamic AI Insight by Yui inside Modal
  const getYuiInsight = () => {
    if (formStatus === 'gagal') {
      return 'Yah... airdrop ini sudah gagal. Nggak apa-apa ya Kakak, yuk move on dan fokus ke airdrop potensial lainnya! Yui selalu dukung Kakak kok! ✨';
    }
    if (formStatus === 'claim') {
      return 'HOREEE! Saatnya gajian! 🎉 Buruan di-claim ya Kak sebelum masa claim-nya hangus! Jangan lupa traktir Yui es krim rasa stroberi ya! 🍦💖';
    }
    if (formStatus === 'done') {
      return 'Kerja bagus, Kak! Semua tugas airdrop ini sudah selesai. Sekarang kita tinggal pantau pengumumannya ya! Yui catat dulu! 🌸';
    }
    
    // Status pending, check deadline & score
    const now = new Date();
    const deadline = new Date(formDeadline);
    const timeDiff = deadline.getTime() - now.getTime();
    
    if (timeDiff <= 0 && formDeadline) {
      return 'Kakak... ini tenggat waktunya sudah terlewat lho! Sebaiknya ubah statusnya ke "Gagal" atau "Selesai" jika sudah selesai. Hati-hati ya, lain kali jangan ditunda! ⚠️';
    }

    if (formSkor >= 8) {
      return `Airdrop ini potensinya GEDE BANGET (Skor: ${formSkor})! 🎯 Harus diprioritaskan utama ya, Kak! Jangan malas, ayo selesaikan task-nya sekarang biar kita cepat kaya! Yui temani! 💢`;
    }
    if (formSkor >= 5) {
      return `Potensinya lumayan oke nih (Skor: ${formSkor}). Yuk dicicil tugasnya satu-satu biar tidak menumpuk pas mepet deadline. Kakak pasti bisa! 🌸`;
    }
    return `Potensinya biasa aja sih (Skor: ${formSkor}), tapi lumayan buat nambah portofolio crypto Kakak. Kerjakan kalau ada waktu senggang aja ya, santai aja! 😊`;
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-tr from-yui-pink/30 via-yui-purple/20 to-yui-blue/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      
      {/* Sidebar Panel */}
      <Sidebar user={user} logout={logout} mood={mood} />

      {/* Main Content Pane */}
      <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto max-h-screen">
        
        {/* Header Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="text-yui-pink-dark animate-pulse" size={24} />
              <span>Halo, {user?.name || 'Kakak'}!</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="flex gap-2">
            {/* Reset Harian */}
            {airdrops.some(a => a.repeatType === 'daily') && (
              <button
                onClick={() => handleResetRepeatType('daily')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200/20 dark:border-blue-900/30 shadow-sm transition-all active:scale-95 animate-pulse"
                title="Reset semua tugas dengan kategori Harian"
              >
                <RotateCcw size={14} />
                <span>Reset Harian</span>
              </button>
            )}

            {/* Reset Mingguan */}
            {airdrops.some(a => a.repeatType === 'weekly') && (
              <button
                onClick={() => handleResetRepeatType('weekly')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-200/20 dark:border-violet-900/30 shadow-sm transition-all active:scale-95 animate-pulse"
                title="Reset semua tugas dengan kategori Mingguan"
              >
                <RotateCcw size={14} />
                <span>Reset Mingguan</span>
              </button>
            )}

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all active:scale-95"
            >
              <Download size={14} />
              <span>Ekspor CSV</span>
            </button>
            
            {/* Reload Data */}
            <button
              onClick={fetchDashboardData}
              className="p-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm transition-all active:rotate-45"
              title="Refresh Data"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Dashboard Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Total Airdrop"
            value={summary.totalAirdrops}
            icon={<Coins size={22} />}
            color="pink"
            description="Total dipantau"
          />
          <StatCard
            title="Pending Airdrop"
            value={summary.pending}
            icon={<Clock size={22} />}
            color="purple"
            description="Perlu diselesaikan"
          />
          <StatCard
            title="Airdrop Selesai"
            value={summary.completed}
            icon={<CheckCircle size={22} />}
            color="blue"
            description="Done & Claimed"
          />
          <StatCard
            title="Tenggat Terdekat"
            value={summary.nextDeadline ? Math.max(0, Math.ceil((new Date(summary.nextDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0}
            icon={<AlertCircle size={22} />}
            color={summary.nextDeadline && Math.ceil((new Date(summary.nextDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 2 ? 'red' : 'green'}
            description={summary.nextDeadline ? `H-${Math.max(0, Math.ceil((new Date(summary.nextDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}: ${summary.nextDeadline}` : 'Tidak ada tenggat'}
          />
        </div>

        {/* Loading and error state wrappers */}
        {loading ? (
          <div className="w-full min-h-[350px] glass rounded-[32px] border border-white/20 dark:border-white/5 flex flex-col items-center justify-center p-12 bg-white/20 dark:bg-slate-900/10 shadow-sm">
            <div className="w-12 h-12 border-4 border-yui-pink-dark border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 italic animate-bounce">
              🌸 Yui sedang merapikan berkas-berkas airdrop Anda... Tunggu sebentar ya!
            </p>
          </div>
        ) : error ? (
          <div className="w-full min-h-[300px] glass rounded-[32px] border border-red-200/20 dark:border-red-950/10 flex flex-col items-center justify-center p-8 bg-red-500/5 text-center shadow-sm">
            <AlertCircle size={36} className="text-red-500 mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-1">Gagal Sinkronisasi</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-sm"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          /* Airdrop Filters & List Panel */
          <AirdropList
            airdrops={airdrops}
            onEdit={handleEditClick}
            onDelete={handleDeleteAirdrop}
            onToggleTask={handleToggleTask}
            onAddClick={handleAddClick}
            onResetTasks={handleResetTasksSingle}
          />
        )}
      </main>

      {/* Detail & Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="glass glass-panel rounded-[32px] border border-white/30 dark:border-white/10 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-float-none">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/30">
              <div>
                <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">
                  {editingAirdrop ? 'Detail & Edit Airdrop' : 'Tambah Airdrop Baru'}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {editingAirdrop ? 'Ubah parameter dan checklist airdrop Anda.' : 'Tambahkan airdrop baru ke daftar pantau Yui.'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <form onSubmit={handleSaveAirdrop} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Row 1: Name and Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Nama Airdrop
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Scroll Mainnet"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-300 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yui-pink-dark/40 focus:border-yui-pink-dark transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Deadline (Tenggat Waktu)
                  </label>
                  <input
                    type="date"
                    required
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-300 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yui-pink-dark/40 focus:border-yui-pink-dark transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Status and Potential Score */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as Airdrop['status'])}
                    className="w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-300 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold outline-none focus:outline-none focus:ring-2 focus:ring-yui-pink-dark/40 focus:border-yui-pink-dark transition-all"
                  >
                    <option value="pending" className="dark:bg-slate-900">Pending</option>
                    <option value="done" className="dark:bg-slate-900">Done</option>
                    <option value="claim" className="dark:bg-slate-900">Claimable (Gajian!)</option>
                    <option value="gagal" className="dark:bg-slate-900">Gagal</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Skor Potensi Airdrop
                    </label>
                    <span className="text-xs font-bold text-yui-pink-dark bg-pink-100 dark:bg-pink-950/40 px-2 py-0.5 rounded-lg border border-pink-200/40">
                      {formSkor} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formSkor}
                    onChange={(e) => setFormSkor(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500 mt-2"
                  />
                </div>
              </div>

              {/* Row 3: Notes / Catatan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Catatan / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Perlu modal gas fee $10, garap tiap akhir pekan..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-300 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yui-pink-dark/40 focus:border-yui-pink-dark transition-all"
                />
              </div>

              {/* Row 3.5: Link and Repeat Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Link Airdrop / Website
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: https://scroll.io/bridge"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-300 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yui-pink-dark/40 focus:border-yui-pink-dark transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Kategori Perulangan
                  </label>
                  <select
                     value={formRepeatType}
                     onChange={(e) => setFormRepeatType(e.target.value as Airdrop['repeatType'])}
                     className="w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-300 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold outline-none focus:outline-none focus:ring-2 focus:ring-yui-pink-dark/40 focus:border-yui-pink-dark transition-all"
                  >
                    <option value="once" className="dark:bg-slate-900">Sekali Saja (No Repeat)</option>
                    <option value="daily" className="dark:bg-slate-900">Tugas Harian (Daily Repeat)</option>
                    <option value="weekly" className="dark:bg-slate-900">Tugas Mingguan (Weekly Repeat)</option>
                  </select>
                </div>
              </div>

              {/* Yui Dynamic AI Advice Bubble */}
              <div className="relative p-4 rounded-3xl bg-pink-100/50 dark:bg-pink-950/20 border border-pink-200/50 dark:border-pink-900/30 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-yui-pink flex items-center justify-center text-sm font-extrabold shadow-inner shrink-0 text-yui-pink-dark">
                  🌸
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-yui-pink-dark flex items-center gap-1">
                    Yui AI Insight:
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed italic">
                    "{getYuiInsight()}"
                  </p>
                </div>
              </div>

              {/* Row 4: Tasks Checklist Builder */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Checklist Tugas ({formTasks.filter(t => t.done).length} / {formTasks.length})
                </label>

                {/* Subtask adding input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tambah tugas baru... (contoh: Swap volume $100)"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-xs rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yui-pink-dark/40 focus:border-yui-pink-dark transition-all"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTaskInModal(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTaskInModal}
                    className="bg-white/60 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-4 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 active:scale-95 transition-all"
                  >
                    Tambah
                  </button>
                </div>

                {/* Subtask listing with checks */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {formTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-white/30 dark:bg-slate-900/30 border border-white/20 dark:border-white/5"
                    >
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => {
                            setFormTasks(
                              formTasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t)
                            );
                          }}
                          className="w-4 h-4 rounded text-yui-pink-dark border-slate-300 dark:border-slate-700 focus:ring-yui-pink-dark/50 accent-pink-500"
                        />
                        <span className={`text-xs font-semibold text-slate-700 dark:text-slate-200 ${task.done ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                          {task.title}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveTaskInModal(task.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  ))}
                  {formTasks.length === 0 && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4 bg-white/25 dark:bg-slate-800/10 rounded-2xl border border-dashed border-slate-300/50 dark:border-slate-800/50">
                      Belum ada subtask. Masukkan tugas di atas untuk melacak detail pekerjaan!
                    </p>
                  )}
                </div>

                {formTasks.length > 0 && (
                  <div className="pt-1">
                    <ProgressBar 
                      value={formTasks.length > 0 ? (formTasks.filter(t => t.done).length / formTasks.length) * 100 : 0} 
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/30 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAirdrop}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-yui-pink-dark to-yui-purple-dark text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 active:scale-95 transition-all"
              >
                <Save size={14} />
                <span>Simpan Airdrop</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Toast popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-5 py-3 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2 border ${
            toast.type === 'success' 
              ? 'bg-emerald-500 text-white border-emerald-400' 
              : (toast.type === 'error' ? 'bg-red-500 text-white border-red-400' : 'bg-slate-800 text-white border-slate-700')
          }`}>
            <span>🌸</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
};
export default Dashboard;
