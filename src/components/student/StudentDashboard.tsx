import React, { useState } from 'react';
import { Subject } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Calendar,
  Award,
  ChevronRight,
  Sparkles,
  Search,
  Clock,
  User,
  GraduationCap,
  LogIn,
  School,
  Languages,
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

interface StudentDashboardProps {
  onSelectSubject: (subject: Subject) => void;
  onGoToCbt: () => void;
  onGoToSchedule: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onSelectSubject,
  onGoToCbt,
  onGoToSchedule,
}) => {
  const { currentUser, students, subjects, exams, broadcasts, loginAsStudent } = useApp();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'admin' | 'teacher' | 'student' | 'register'>('student');
  const [quickClassFilter, setQuickClassFilter] = useState<'all' | '7' | '8' | '9'>('7');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | 'Umum' | 'Muatan Lokal' | 'Pilihan / Mulok'>('Semua');

  // Filter subjects based on query & category
  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Semua' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Students for Quick Auto-Login Bar
  const quickStudents = students.filter(
    (s) => quickClassFilter === 'all' || s.kelas === quickClassFilter
  );

  return (
    <div id="student-dashboard" className="space-y-4 pb-6 animate-in fade-in">
      {/* OPEN ACCESS & QUICK AUTO-LOGIN BANNER (If not logged in, or allows quick switch) */}
      {!currentUser ? (
        <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-blue-700/40 relative overflow-hidden space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                <School className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-wide text-white">
                  LMS SMP WK
                </h2>
                <p className="text-xs text-blue-200">
                  SMP Wijaya Kusuma • Kelas 7, 8, dan 9
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setAuthMode('student');
                setIsAuthOpen(true);
              }}
              className="px-3.5 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all self-start sm:self-auto"
            >
              <LogIn className="w-4 h-4" />
              <span>Login Mandiri / Guru</span>
            </button>
          </div>

          {/* Quick Student Auto-Fill Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="text-xs font-bold text-blue-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Pilih Siswa & Langsung Masuk:</span>
              </span>
              <span className="text-[11px] text-blue-200 font-semibold">
                Sandi: <strong className="font-mono text-amber-300">SMPWKJaya</strong>
              </span>
            </div>

            {/* Class Filter Tabs */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setQuickClassFilter('7')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  quickClassFilter === '7'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                    : 'bg-white/10 text-blue-100 hover:bg-white/20'
                }`}
              >
                Kelas 7 (12 Siswa)
              </button>
              <button
                type="button"
                onClick={() => setQuickClassFilter('8')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  quickClassFilter === '8'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                    : 'bg-white/10 text-blue-100 hover:bg-white/20'
                }`}
              >
                Kelas 8 (15 Siswa)
              </button>
              <button
                type="button"
                onClick={() => setQuickClassFilter('9')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  quickClassFilter === '9'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                    : 'bg-white/10 text-blue-100 hover:bg-white/20'
                }`}
              >
                Kelas 9 (11 Siswa)
              </button>
              <button
                type="button"
                onClick={() => setQuickClassFilter('all')}
                className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  quickClassFilter === 'all'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                    : 'bg-white/10 text-blue-100 hover:bg-white/20'
                }`}
              >
                Semua
              </button>
            </div>

            {/* Quick Chips Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-1">
              {quickStudents.map((std) => (
                <button
                  key={std.id}
                  type="button"
                  onClick={() => {
                    loginAsStudent(std.email, 'SMPWKJaya');
                  }}
                  className="bg-white/10 hover:bg-white/25 active:bg-amber-400 active:text-slate-950 p-2 rounded-xl text-left border border-white/15 transition-all text-xs flex items-center justify-between group cursor-pointer"
                  title={`Klik untuk masuk sebagai ${std.name} (${std.email})`}
                >
                  <div className="truncate">
                    <span className="font-bold text-white group-hover:text-amber-300 block truncate text-[11px]">
                      {std.name}
                    </span>
                    <span className="text-[10px] text-blue-200/80 block truncate font-mono">
                      {std.email}
                    </span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-blue-500/30 text-blue-200 group-hover:bg-amber-400 group-hover:text-slate-950 flex items-center justify-center text-[10px] font-bold shrink-0 ml-1">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Logged-in Student Hero Card */
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-5 text-white shadow-xl border border-blue-600/50 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-13 h-13 rounded-2xl bg-amber-400 overflow-hidden shrink-0 border-2 border-white/30 shadow-md flex items-center justify-center text-slate-950 font-black text-lg">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt="Foto Profil" className="w-full h-full object-cover" />
                ) : (
                  currentUser?.name ? currentUser.name.charAt(0) : 'S'
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-blue-200 font-semibold">Selamat Belajar,</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                    {currentUser.role === 'admin' ? 'Kepala Sekolah' : currentUser.role === 'guru' ? 'Guru' : `${currentUser.rombel || 'Siswa'}`}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {currentUser?.name || 'Peserta Didik SMPWK'}
                </h2>
                <p className="text-xs text-blue-100 font-mono">
                  {currentUser?.email || 'siswa@smpwk.sch.id'} • SMP Wijaya Kusuma
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthMode('student');
                  setIsAuthOpen(true);
                }}
                className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
              >
                Ganti Akun Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Announcements */}
      {broadcasts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span className="font-extrabold text-amber-900">{broadcasts[0].title}</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">{broadcasts[0].message}</p>
          <span className="text-[10px] text-amber-700/80 font-medium block">
            Pengirim: {broadcasts[0].senderName} • {broadcasts[0].createdAt}
          </span>
        </div>
      )}

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={onGoToCbt}
          className="p-3 bg-white hover:bg-amber-50 rounded-2xl border border-slate-200 hover:border-amber-300 shadow-xs text-left transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-slate-800 block">Ujian CBT Online</span>
          <span className="text-[10px] text-slate-500">{exams.length} Paket Ujian Aktif</span>
        </button>

        <button
          onClick={onGoToSchedule}
          className="p-3 bg-white hover:bg-blue-50 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs text-left transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-slate-800 block">Jadwal Pelajaran</span>
          <span className="text-[10px] text-slate-500">Kelas 7, 8, dan 9</span>
        </button>

        <button
          onClick={() => {
            const defaultSbj = subjects.find((s) => s.id === 'sbj-sunda') || subjects[0];
            if (defaultSbj) onSelectSubject(defaultSbj);
          }}
          className="p-3 bg-white hover:bg-blue-50 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs text-left transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-slate-800 block">30 Modul & LKPD</span>
          <span className="text-[10px] text-slate-500">{subjects.length} Mapel Termasuk Basa Sunda</span>
        </button>

        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs text-left">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-2">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-slate-800 block">38 Peserta Didik</span>
          <span className="text-[10px] text-slate-500">Dewan Guru SMPWK</span>
        </div>
      </div>

      {/* Featured Muatan Lokal Bahasa Sunda Card */}
      {subjects.find((s) => s.id === 'sbj-sunda') && (
        <div
          onClick={() => {
            const sundaSbj = subjects.find((s) => s.id === 'sbj-sunda');
            if (sundaSbj) onSelectSubject(sundaSbj);
          }}
          className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-3xl border border-blue-400/40 shadow-lg cursor-pointer hover:border-blue-300 transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
              <Languages className="w-3.5 h-3.5" />
              <span>Muatan Lokal Unggulan</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
              Pangajaran Basa jeung Sastra Sunda
            </h3>
            <p className="text-xs text-blue-200 leading-snug">
              Tatakrama basa, Paguneman, Kaulinan Barudak, Pupuh Kinanti & Asmarandana, Carpon, Sisindiran, sarta Aksara Sunda Kaganga.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black shrink-0 group-hover:scale-105 transition-transform shadow-md">
            <span>Buka 30 Modul</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Subjects Header & Search Filter */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Mata Pelajaran SMP Wijaya Kusuma
            </h3>
            <p className="text-[11px] text-slate-500">
              Pilih mata pelajaran untuk melihat 30 modul pertemuan & tugas LKPD
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedCategory('Semua')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                selectedCategory === 'Semua' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Mapel
            </button>
            <button
              onClick={() => setSelectedCategory('Umum')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                selectedCategory === 'Umum' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Umum
            </button>
            <button
              onClick={() => setSelectedCategory('Muatan Lokal')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                selectedCategory === 'Muatan Lokal' ? 'bg-white text-blue-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Muatan Lokal (Sunda)
            </button>
            <button
              onClick={() => setSelectedCategory('Pilihan / Mulok')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                selectedCategory === 'Pilihan / Mulok' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prakarya & Seni
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari mata pelajaran atau nama guru pengampu..."
            className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredSubjects.map((sbj) => {
          const isMulok = sbj.category === 'Muatan Lokal';
          return (
            <div
              key={sbj.id}
              onClick={() => onSelectSubject(sbj)}
              className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer group flex flex-col justify-between hover:shadow-md ${
                isMulok
                  ? 'border-blue-300 ring-1 ring-blue-200 hover:border-blue-500'
                  : 'border-slate-200 hover:border-blue-400'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold group-hover:scale-105 transition-transform ${
                    isMulok
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                    {isMulok ? <Languages className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  </div>
                  <div className="flex items-center gap-1">
                    {isMulok && (
                      <span className="text-[9px] font-black text-blue-900 bg-amber-400 px-1.5 py-0.5 rounded uppercase">
                        Mulok
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                      30 Pertemuan
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {sbj.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {sbj.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="truncate">
                  <span className="text-slate-400 block text-[10px]">Guru Pengampu:</span>
                  <span className="font-semibold text-slate-700 truncate block">
                    {sbj.teacherName}
                  </span>
                </div>
                <div className="flex items-center text-blue-700 font-bold gap-1 shrink-0">
                  <span>Buka Modul</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};
