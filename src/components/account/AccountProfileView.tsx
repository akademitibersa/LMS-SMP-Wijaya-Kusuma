import React, { useState } from 'react';
import { useApp, ADMIN_CREDENTIALS } from '../../context/AppContext';
import {
  User,
  KeyRound,
  LogOut,
  GraduationCap,
  Mail,
  Shield,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Camera,
  Crown,
  School,
  Sparkles,
} from 'lucide-react';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import { AuthModal } from '../auth/AuthModal';
import { AdminDashboard } from '../admin/AdminDashboard';

export const AccountProfileView: React.FC = () => {
  const {
    currentUser,
    logout,
  } = useApp();

  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'admin' | 'teacher' | 'student' | 'register' | 'forgot'>('teacher');

  // If the logged in user is the Headmaster / Super Admin, render Admin Dashboard
  if (currentUser?.role === 'admin') {
    return (
      <div className="space-y-4 pb-12">
        <AdminDashboard />
        <ChangePasswordModal isOpen={isChangePassOpen} onClose={() => setIsChangePassOpen(false)} />
      </div>
    );
  }

  return (
    <div id="account-profile-view" className="space-y-3.5 pb-12 animate-in fade-in">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-950 rounded-3xl p-5 text-white shadow-xl space-y-3.5 relative overflow-hidden border border-blue-600/50">
        <div className="flex items-center space-x-3.5 relative z-10">
          <div className="relative group">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 border-2 border-white/40 p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-md text-slate-950 font-black text-xl">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover rounded-xl" />
              ) : (
                currentUser?.name ? currentUser.name.charAt(0) : 'U'
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                {currentUser?.role === 'guru' ? 'DEWAN GURU' : currentUser ? `SISWA ${currentUser.rombel || 'SMPWK'}` : 'TAMU'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black truncate leading-snug">
              {currentUser?.name || 'Pengguna LMS SMP WK'}
            </h2>
            <p className="text-xs text-blue-200 truncate mt-0.5 font-mono">{currentUser?.email || 'Belum masuk akun'}</p>
          </div>
        </div>

        {/* Real User Academic Info */}
        {currentUser && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <span className="text-[10px] text-blue-200 block font-medium">
                {currentUser?.role === 'guru' ? 'Status Kepegawaian' : 'Tingkat Kelas'}
              </span>
              <strong className="text-white text-[11px] truncate block font-bold">
                {currentUser?.role === 'guru' ? 'Guru SMP Wijaya Kusuma' : currentUser?.rombel || 'Kelas 7'}
              </strong>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <span className="text-[10px] text-blue-200 block font-medium">
                {currentUser?.role === 'guru' ? 'Mata Pelajaran' : 'Sekolah'}
              </span>
              <strong className="text-white text-[11px] truncate block font-bold">
                {currentUser?.role === 'guru'
                  ? currentUser.subjectsTaught?.join(', ') || 'Guru Mapel'
                  : 'SMP Wijaya Kusuma'}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* If Not Logged In: 3 Separate Login Cards (Kepala Sekolah, Guru, Siswa) */}
      {!currentUser && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <School className="w-4 h-4 text-blue-600" />
            <span>Pilih Portal Masuk LMS SMP WK</span>
          </h3>

          {/* Dedicated Super Admin Login Banner */}
          <button
            onClick={() => {
              setAuthMode('admin');
              setIsAuthOpen(true);
            }}
            className="w-full p-4 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl text-left shadow-lg shadow-amber-500/20 transition-all flex items-center justify-between border border-amber-400/40 cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-200 border-2 border-white overflow-hidden shrink-0 shadow-xs flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.2 rounded">
                    KEPALA SEKOLAH
                  </span>
                </div>
                <h4 className="text-xs font-black mt-0.5 leading-tight">
                  Login Kepala Sekolah (Fathi Khoerulloh, S.Pd)
                </h4>
                <p className="text-[10px] text-amber-100">Kontrol penuh guru, siswa, jadwal & soal ujian</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/80 shrink-0" />
          </button>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => {
                setAuthMode('teacher');
                setIsAuthOpen(true);
              }}
              className="p-3.5 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl text-left shadow-md shadow-blue-500/20 transition-all flex flex-col justify-between cursor-pointer"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded w-fit">
                Dewan Guru
              </span>
              <div className="mt-3">
                <h4 className="text-xs font-bold leading-tight">Login Guru</h4>
                <p className="text-[10px] text-blue-100 mt-0.5">Kelola Modul, Soal, & LKPD</p>
              </div>
            </button>

            <button
              onClick={() => {
                setAuthMode('student');
                setIsAuthOpen(true);
              }}
              className="p-3.5 bg-gradient-to-br from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white rounded-2xl text-left shadow-md shadow-sky-500/20 transition-all flex flex-col justify-between cursor-pointer"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded w-fit">
                Siswa SMPWK
              </span>
              <div className="mt-3">
                <h4 className="text-xs font-bold leading-tight">Login Siswa</h4>
                <p className="text-[10px] text-sky-100 mt-0.5">Kelas 7, 8, dan 9</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Security & Password Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 space-y-2.5">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>Keamanan & Sandi Akun</span>
        </h3>
        <div className="space-y-2 text-xs">
          {currentUser && (
            <button
              onClick={() => setIsChangePassOpen(true)}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between transition-colors text-slate-800 cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <KeyRound className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="text-left">
                  <span className="font-bold block">Ubah Kata Sandi Akun</span>
                  <span className="text-[10px] text-slate-500">Perbarui kata sandi bawaan SMPWKJaya</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          )}

          <button
            onClick={() => {
              setAuthMode('forgot');
              setIsAuthOpen(true);
            }}
            className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between transition-colors text-slate-800 cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="text-left">
                <span className="font-bold block">Reset Sandi via Email</span>
                <span className="text-[10px] text-slate-500">Kirim kode verifikasi reset ke email</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* Logout Button */}
      {currentUser && (
        <div className="space-y-2 pt-1">
          <button
            onClick={logout}
            className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun LMS SMP WK</span>
          </button>
        </div>
      )}

      {/* App Footer Info */}
      <div className="text-center text-[11px] text-slate-400 space-y-0.5 pt-3">
        <p className="font-bold text-slate-600">SMP Wijaya Kusuma</p>
        <p>LMS SMP WK • Learning Management System</p>
      </div>

      <ChangePasswordModal isOpen={isChangePassOpen} onClose={() => setIsChangePassOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialMode={authMode} />
    </div>
  );
};
