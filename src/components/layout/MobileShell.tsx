import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  User,
  LogOut,
  KeyRound,
  ShieldCheck,
  Crown,
  ChevronRight,
  LogIn,
  ChevronDown,
  Eye,
  EyeOff,
  School,
  Sparkles,
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import { BottomNavigation } from './BottomNavigation';

interface MobileShellProps {
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  const {
    currentUser,
    notifications,
    activeTab,
    setActiveTab,
    setSelectedSubject,
    setActiveExam,
    logout,
    siteSettings,
    loginWithSecretKey,
  } = useApp();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'admin' | 'teacher' | 'student' | 'register' | 'forgot'>('student');
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);

  // Digital clock
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Secret Backdoor Kepsek State
  const [isSecretAdminModalOpen, setIsSecretAdminModalOpen] = useState(false);
  const [secretPassInput, setSecretPassInput] = useState('');
  const [secretPassError, setSecretPassError] = useState('');
  const [showSecretPass, setShowSecretPass] = useState(false);
  const logoClicksRef = useRef(0);
  const lastLogoClickTimeRef = useRef(0);

  // Handle Logo Click -> Return to Home Dashboard + Secret 5-Clicks Backdoor
  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastLogoClickTimeRef.current < 900) {
      logoClicksRef.current += 1;
    } else {
      logoClicksRef.current = 1;
    }
    lastLogoClickTimeRef.current = now;

    // Secret trigger: 5 rapid clicks on logo opens the secret Kepsek portal
    if (logoClicksRef.current >= 5) {
      logoClicksRef.current = 0;
      setIsSecretAdminModalOpen(true);
      setSecretPassInput('');
      setSecretPassError('');
      return;
    }

    setActiveTab('home');
    setSelectedSubject(null);
    setActiveExam(null);
  };

  const handleSecretLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSecretPassError('');
    const res = loginWithSecretKey(secretPassInput);
    if (res.success) {
      setIsSecretAdminModalOpen(false);
      setSecretPassInput('');
    } else {
      setSecretPassError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 font-sans">
      {/* Main Responsive Shell Container */}
      <div className="w-full max-w-5xl bg-slate-50 min-h-screen sm:min-h-[92vh] flex flex-col sm:rounded-3xl shadow-2xl overflow-hidden border border-blue-900/40 relative">
        {/* Top Header Bar */}
        <header className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0 z-30">
          {/* Logo & School Name - Exactly 1 line LMS SMP WK and bawahnya SMP Wijaya Kusuma */}
          <button
            id="btn-header-school-logo"
            onClick={handleLogoClick}
            className="flex items-center space-x-2.5 hover:opacity-95 transition-all text-left cursor-pointer group"
            title="Kembali ke Beranda (Klik 5x untuk Pintu Rahasia Kepala Sekolah)"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/15 p-1.5 backdrop-blur-xs border border-white/30 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <School className="w-6 h-6 text-amber-300" />
            </div>
            <div className="flex flex-col items-start justify-center text-left min-w-0">
              <h1 className="text-sm sm:text-base font-black tracking-wide text-white leading-tight">
                LMS SMP WK
              </h1>
              <p className="text-[11px] text-blue-100 font-semibold tracking-normal leading-tight">
                SMP Wijaya Kusuma
              </p>
            </div>
          </button>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-2">
            {/* Clock */}
            <div className="hidden sm:flex items-center text-[11px] text-blue-200 font-mono bg-white/10 px-2.5 py-1 rounded-xl">
              <span>{currentTime}</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="btn-open-notifications"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors relative cursor-pointer"
                aria-label="Notifikasi"
              >
                <Bell className="w-4 h-4 text-white" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-400 text-slate-950 text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotifOpen && (
                <div className="absolute right-0 top-10 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Notifikasi LMS SMP WK</span>
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-2 mt-2 max-h-56 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2 bg-slate-50 rounded-xl text-xs space-y-0.5 border border-slate-100">
                        <span className="font-bold text-blue-900 block">{n.title}</span>
                        <p className="text-[11px] text-slate-600 leading-snug">{n.message}</p>
                        <span className="text-[9px] text-slate-400 font-mono block">{n.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar / Login Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="btn-header-profile-avatar"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 p-1 pr-2.5 rounded-full border border-white/20 transition-all shadow-xs cursor-pointer"
                  title="Menu Profil"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-400 overflow-hidden shrink-0 border border-white/30 flex items-center justify-center text-slate-950 font-bold text-xs">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      currentUser.name.charAt(0)
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-white max-w-[85px] truncate">
                    {currentUser?.name ? currentUser.name.split(' ')[0] : 'Akun'}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-10 w-64 bg-white rounded-3xl shadow-2xl border border-slate-200 text-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 space-y-2">
                    <div className="flex items-center space-x-2.5 pb-2.5 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-2xl bg-amber-400 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center text-slate-950 font-bold">
                        {currentUser.avatar ? (
                          <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          currentUser.name.charAt(0)
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 uppercase inline-block">
                          {currentUser.role === 'admin'
                            ? 'Kepala Sekolah'
                            : currentUser.role === 'guru'
                            ? 'Guru'
                            : `${currentUser.rombel || 'Siswa'}`}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs font-semibold">
                      <button
                        onClick={() => {
                          setActiveTab('account');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span>Profil Akun Saya</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        onClick={() => {
                          setIsChangePassOpen(true);
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-indigo-600" />
                          <span>Ubah Kata Sandi</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar Akun (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  id="btn-mobile-login-dropdown"
                  onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-black rounded-xl text-xs shadow-sm flex items-center gap-1 cursor-pointer transition-all border border-blue-400/50"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk LMS</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isLoginDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLoginDropdownOpen && (
                  <div className="absolute right-0 top-10 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                      Pilih Portal Masuk
                    </div>
                    <button
                      onClick={() => {
                        setAuthMode('student');
                        setIsAuthOpen(true);
                        setIsLoginDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-blue-50 text-slate-800 transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                        🎓
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">Siswa (Kelas 7, 8, 9)</span>
                        <span className="text-[10px] text-slate-500 block">Auto-Fill & Masuk Langsung</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setAuthMode('teacher');
                        setIsAuthOpen(true);
                        setIsLoginDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-blue-50 text-slate-800 transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                        👨‍🏫
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">Dewan Guru</span>
                        <span className="text-[10px] text-slate-500 block">Guru Mapel & Muatan Lokal</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setAuthMode('admin');
                        setIsAuthOpen(true);
                        setIsLoginDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-50 text-slate-800 transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                        👑
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-700">Kepala Sekolah</span>
                        <span className="text-[10px] text-slate-500 block">Bapak Fathi Khoerulloh, S.Pd</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content Area with pb-24 padding to accommodate the beautiful bottom navigation */}
        <main className="flex-1 p-3.5 sm:p-5 pb-24 overflow-y-auto">
          {children}
        </main>

        {/* Dedicated Bottom Navigation Bar */}
        <BottomNavigation />
      </div>

      {/* Secret Backdoor Kepsek Modal (Unlocked by 5 clicks on LMS SMP WK logo) */}
      {isSecretAdminModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-blue-500/40 rounded-3xl p-5 shadow-2xl text-white relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white tracking-wide uppercase">Pintu Rahasia Kepala Sekolah</h3>
                  <p className="text-[10px] text-amber-300/80">Ruang Kontrol Utama SMP Wijaya Kusuma</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSecretAdminModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSecretLogin} className="space-y-3.5">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-[11px] text-blue-200/90 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Masukkan sandi rahasia Kepala Sekolah (<strong>Fathi Khoerulloh, S.Pd</strong>) untuk membuka akses penuh Ruang Kontrol Utama SMP Wijaya Kusuma.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Sandi Rahasia Kepala Sekolah:
                </label>
                <div className="relative">
                  <input
                    type={showSecretPass ? 'text' : 'password'}
                    value={secretPassInput}
                    onChange={(e) => setSecretPassInput(e.target.value)}
                    placeholder="Masukkan sandi..."
                    autoFocus
                    className="w-full text-xs bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 pr-10 text-white font-mono focus:ring-2 focus:ring-blue-500/40 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretPass(!showSecretPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showSecretPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {secretPassError && (
                  <p className="text-[11px] text-rose-400 font-medium mt-1.5 flex items-center gap-1">
                    <span>⚠</span>
                    <span>{secretPassError}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSecretAdminModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Buka Akses</span>
                </button>
              </div>

              <div className="text-center pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-500">
                  Tip: Sandi bawaan adalah <strong className="text-blue-400 font-mono">SMPWKJaya</strong>
                </span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal & Change Password Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
      <ChangePasswordModal
        isOpen={isChangePassOpen}
        onClose={() => setIsChangePassOpen(false)}
      />
    </div>
  );
};
