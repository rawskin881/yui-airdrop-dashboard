import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, KeyRound, User, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import yuiLoginImg from '../assets/yui_login.png';

interface OTPLoginProps {
  requestOTP: (telegramId: string) => Promise<boolean>;
  verifyOTP: (telegramId: string, otp: string) => Promise<boolean>;
  verifyBotOTP: (otp: string) => Promise<boolean>;
  error: string | null;
  loading: boolean;
}

type LoginTab = 'web' | 'bot';

export const OTPLogin: React.FC<OTPLoginProps> = ({
  requestOTP,
  verifyOTP,
  verifyBotOTP,
  error: authError,
  loading
}) => {
  const [tab, setTab] = useState<LoginTab>('web');
  const [telegramId, setTelegramId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [botOtp, setBotOtp] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const error = localError || authError;

  // Handle requesting 6-digit OTP via Telegram ID
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramId.trim()) {
      setLocalError('Mohon masukkan ID Telegram Anda (T_T)');
      return;
    }
    setLocalError(null);
    setSuccessMsg(null);
    const ok = await requestOTP(telegramId);
    if (ok) {
      setOtpSent(true);
      setSuccessMsg('OTP berhasil dikirim! Silakan periksa bot Telegram Anda.');
    }
  };

  // Handle verifying 6-digit OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length !== 6) {
      setLocalError('Mohon masukkan 6 digit kode OTP yang benar.');
      return;
    }
    setLocalError(null);
    await verifyOTP(telegramId, otpCode);
  };

  // Handle verifying 8-character Bot-generated OTP
  const handleVerifyBotOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botOtp.trim() || botOtp.length !== 8) {
      setLocalError('Mohon masukkan 8 karakter kode OTP bot yang benar.');
      return;
    }
    setLocalError(null);
    await verifyBotOTP(botOtp.toUpperCase());
  };

  return (
    <div className="w-full max-w-4xl glass glass-card rounded-[32px] overflow-hidden flex flex-col md:flex-row bg-white/30 dark:bg-slate-900/20 border border-white/30 dark:border-white/5 shadow-2xl">
      
      {/* Left Character Illustration Pane */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-between items-center bg-gradient-to-br from-yui-pink/60 via-yui-purple/50 to-yui-blue/30 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-sky-950/10 border-b md:border-b-0 md:border-r border-white/20">
        
        {/* Yui Bubble */}
        <div className="relative w-full p-4 text-xs leading-relaxed text-slate-700 dark:text-slate-200 bg-white/95 dark:bg-slate-800/95 rounded-2xl border border-pink-200/50 dark:border-pink-900/20 shadow-md">
          <div className="font-bold mb-1 text-yui-pink-dark flex items-center gap-1">
            <Sparkles size={12} />
            <span>Yui (Dashboard Guide)</span>
          </div>
          <p className="italic">
            {tab === 'web' 
              ? '🌸 "Halo Kakak! Selamat datang kembali! Masukkan ID Telegram Kakak di sini biar Yui bisa kirimkan kode OTP login ya! Supaya airdrop-nya aman sentosa~"' 
              : '🌸 "Sudah punya kode login 8-karakter dari bot? Waaah praktis banget! Tinggal masukkan kodenya di kolom sebelah ya, nanti langsung Yui bukain pintu dashboard-nya!"'
            }
          </p>
          <div className="absolute -bottom-1.5 left-1/2 md:left-12 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-pink-200/50 dark:border-pink-900/20 rotate-45"></div>
        </div>

        {/* Illustration */}
        <div className="w-48 h-48 md:w-64 md:h-64 my-6 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-300/20 to-purple-300/20 dark:from-pink-950/10 dark:to-purple-950/10 rounded-full blur-2xl"></div>
          <img 
            src={yuiLoginImg} 
            alt="Yui Login Character" 
            className="object-contain w-full h-full relative z-10 drop-shadow-[0_8px_16px_rgba(244,114,182,0.3)] animate-float" 
          />
        </div>

        {/* Brand Caption */}
        <div className="text-center space-y-1">
          <h2 className="font-extrabold text-xl text-slate-800 dark:text-slate-100 bg-gradient-to-r from-yui-pink-dark to-yui-purple-dark bg-clip-text text-transparent">
            YUI CRYPTO AIRDROP
          </h2>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-widest uppercase">
            Semua Airdrop dalam Genggamanmu
          </p>
        </div>
      </div>

      {/* Right Login Form Pane */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
        
        {/* Tabs selector */}
        <div className="flex bg-slate-100/50 dark:bg-slate-900/40 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 mb-6">
          <button
            onClick={() => {
              setTab('web');
              setLocalError(null);
            }}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'web' 
                ? 'bg-white dark:bg-slate-800 text-yui-pink-dark shadow-sm border border-slate-200/10' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Minta OTP (Telegram ID)
          </button>
          <button
            onClick={() => {
              setTab('bot');
              setLocalError(null);
            }}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'bot' 
                ? 'bg-white dark:bg-slate-800 text-yui-pink-dark shadow-sm border border-slate-200/10' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Input Kode Bot (8 Karakter)
          </button>
        </div>

        {/* Form Container */}
        <div className="min-h-[260px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            
            {/* Tab 1: Request and verify 6-digit OTP */}
            {tab === 'web' && (
              <motion.div
                key="web-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    Login via ID Telegram
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Dapatkan kode OTP 6-digit dikirim ke chat bot Telegram Anda.
                  </p>
                </div>

                {!otpSent ? (
                  /* Form Request OTP */
                  <form onSubmit={handleRequestOTP} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                        ID Telegram
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                          <User size={16} />
                        </span>
                        <input
                          type="text"
                          placeholder="Contoh: 123456789"
                          value={telegramId}
                          onChange={(e) => setTelegramId(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-yui-pink-dark/40 focus:border-yui-pink-dark transition-all"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                        *Pastikan Anda sudah memulai chat dengan bot Yui terlebih dahulu.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-yui-pink-dark to-yui-purple-dark text-white py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:shadow-md active:scale-98 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Kirim OTP via Telegram</span>
                          <Send size={15} />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Form Verify OTP */
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                        Kode OTP 6-Digit (Dikirim ke Telegram ID: {telegramId})
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                          <KeyRound size={16} />
                        </span>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Masukkan 6 digit kode"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-slate-900 dark:text-slate-100 font-extrabold tracking-[0.4em] text-lg focus:outline-none focus:ring-2 focus:ring-yui-pink-dark/40 focus:border-yui-pink-dark focus:tracking-[0.4em] transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode('');
                          setLocalError(null);
                        }}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-98"
                      >
                        Kembali
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] bg-gradient-to-r from-yui-pink-dark to-yui-purple-dark text-white py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:shadow-md active:scale-98 transition-all disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span>Verifikasi & Masuk</span>
                            <ArrowRight size={15} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {/* Tab 2: Input 8-char bot-generated code directly */}
            {tab === 'bot' && (
              <motion.div
                key="bot-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    Masukkan Kode Login Bot
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Ketik perintah <strong>/login</strong> di Telegram bot Yui untuk mendapatkan kode 8-karakter.
                  </p>
                </div>

                <form onSubmit={handleVerifyBotOTP} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                      Kode Login Bot (8 Karakter Alfanumerik)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <KeyRound size={16} />
                      </span>
                      <input
                        type="text"
                        maxLength={8}
                        placeholder="Contoh: A7B9F2CD"
                        value={botOtp}
                        onChange={(e) => setBotOtp(e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase())}
                        className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-slate-900 dark:text-slate-100 font-extrabold tracking-[0.4em] text-lg uppercase focus:outline-none focus:ring-2 focus:ring-yui-pink-dark/40 focus:border-yui-pink-dark focus:tracking-[0.4em] transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yui-pink-dark to-yui-purple-dark text-white py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:shadow-md active:scale-98 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Verifikasi & Masuk</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback Messages */}
          <div className="mt-4 min-h-[40px] flex items-center justify-center">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-bold text-red-500 bg-red-100/60 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 px-4 py-2.5 rounded-2xl w-full text-center"
              >
                {error}
              </motion.div>
            )}
            
            {successMsg && !error && (
              <motion.div 
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 px-4 py-2.5 rounded-2xl w-full flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
export default OTPLogin;
