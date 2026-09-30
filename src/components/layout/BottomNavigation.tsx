import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Calendar, BookOpen, Award, User, Crown, UserCheck } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setSelectedSubject,
    setActiveExam,
    currentUser,
    exams,
    subjects,
  } = useApp();

  const handleNavClick = (tab: 'home' | 'schedule' | 'subjects' | 'cbt' | 'account') => {
    setActiveTab(tab);
    setSelectedSubject(null);
    setActiveExam(null);
  };

  const activeExamsCount = exams.filter((e) => e.isActive !== false).length;

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Navigasi Utama Bawah"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-blue-200/80 shadow-[0_-4px_24px_rgba(29,78,216,0.12)] transition-all"
    >
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-1.5 flex items-center justify-around gap-1">
        {/* TAB 1: BERANDA */}
        <button
          id="btn-bottom-nav-home"
          type="button"
          onClick={() => handleNavClick('home')}
          className={`flex-1 py-1 px-1.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group ${
            activeTab === 'home'
              ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/30 scale-[1.02]'
              : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/70'
          }`}
        >
          <div className="relative">
            <Home
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                activeTab === 'home' ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'
              }`}
            />
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight ${
              activeTab === 'home' ? 'font-black text-white' : 'font-semibold text-slate-600'
            }`}
          >
            Beranda
          </span>
        </button>

        {/* TAB 2: JADWAL */}
        <button
          id="btn-bottom-nav-schedule"
          type="button"
          onClick={() => handleNavClick('schedule')}
          className={`flex-1 py-1 px-1.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group ${
            activeTab === 'schedule'
              ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/30 scale-[1.02]'
              : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/70'
          }`}
        >
          <div className="relative">
            <Calendar
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                activeTab === 'schedule' ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'
              }`}
            />
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight ${
              activeTab === 'schedule' ? 'font-black text-white' : 'font-semibold text-slate-600'
            }`}
          >
            Jadwal
          </span>
        </button>

        {/* TAB 3: MATA PELAJARAN */}
        <button
          id="btn-bottom-nav-subjects"
          type="button"
          onClick={() => handleNavClick('subjects')}
          className={`flex-1 py-1 px-1.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group ${
            activeTab === 'subjects'
              ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/30 scale-[1.02]'
              : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/70'
          }`}
        >
          <div className="relative">
            <BookOpen
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                activeTab === 'subjects' ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'
              }`}
            />
            {subjects.length > 0 && (
              <span
                className={`absolute -top-1 -right-2 px-1 text-[8px] font-black rounded-full ${
                  activeTab === 'subjects'
                    ? 'bg-amber-400 text-blue-950'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {subjects.length}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight ${
              activeTab === 'subjects' ? 'font-black text-white' : 'font-semibold text-slate-600'
            }`}
          >
            Mapel
          </span>
        </button>

        {/* TAB 4: CBT ONLINE */}
        <button
          id="btn-bottom-nav-cbt"
          type="button"
          onClick={() => handleNavClick('cbt')}
          className={`flex-1 py-1 px-1.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group relative ${
            activeTab === 'cbt'
              ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/30 scale-[1.02]'
              : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/70'
          }`}
        >
          <div className="relative">
            <Award
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                activeTab === 'cbt' ? 'text-amber-300' : 'text-amber-500 group-hover:text-amber-600'
              }`}
            />
            {activeExamsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 bg-amber-400 text-slate-950 text-[8px] font-black rounded-full animate-pulse">
                {activeExamsCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight ${
              activeTab === 'cbt' ? 'font-black text-white' : 'font-semibold text-slate-600'
            }`}
          >
            CBT Online
          </span>
        </button>

        {/* TAB 5: AKUN / PROFIL */}
        <button
          id="btn-bottom-nav-account"
          type="button"
          onClick={() => handleNavClick('account')}
          className={`flex-1 py-1 px-1.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group ${
            activeTab === 'account'
              ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/30 scale-[1.02]'
              : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/70'
          }`}
        >
          <div className="relative">
            {currentUser?.avatar ? (
              <div
                className={`w-5 h-5 rounded-full overflow-hidden border ${
                  activeTab === 'account' ? 'border-white' : 'border-blue-600'
                }`}
              >
                <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            ) : currentUser?.role === 'admin' ? (
              <Crown
                className={`w-5 h-5 ${
                  activeTab === 'account' ? 'text-amber-300' : 'text-amber-500'
                }`}
              />
            ) : currentUser?.role === 'guru' ? (
              <UserCheck
                className={`w-5 h-5 ${
                  activeTab === 'account' ? 'text-white' : 'text-blue-600'
                }`}
              />
            ) : (
              <User
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  activeTab === 'account' ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'
                }`}
              />
            )}
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight truncate max-w-[56px] ${
              activeTab === 'account' ? 'font-black text-white' : 'font-semibold text-slate-600'
            }`}
          >
            {currentUser
              ? currentUser.role === 'admin'
                ? 'Kepsek'
                : currentUser.role === 'guru'
                ? 'Guru'
                : 'Siswa'
              : 'Akun'}
          </span>
        </button>
      </div>
    </nav>
  );
};
