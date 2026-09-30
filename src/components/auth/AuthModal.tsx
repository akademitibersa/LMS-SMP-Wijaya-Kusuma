import React, { useState, useEffect } from 'react';
import { useApp, ADMIN_CREDENTIALS } from '../../context/AppContext';
import {
  GraduationCap,
  LogIn,
  UserCheck,
  UserPlus,
  Mail,
  Lock,
  ChevronDown,
  Info,
  CheckCircle2,
  Crown,
  Sparkles,
  Search,
  Check,
  School,
  KeyRound,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'admin' | 'teacher' | 'student' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'student',
}) => {
  const {
    teachers,
    students,
    loginAsAdmin,
    loginAsTeacher,
    loginAsStudent,
    registerStudent,
    requestPasswordReset,
    resetPasswordWithToken,
  } = useApp();

  const [mode, setMode] = useState<'admin' | 'teacher' | 'student' | 'register' | 'forgot' | 'resetConfirm'>(initialMode);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Admin Form State (Fathi Khoerulloh, S.Pd / SMPWKJaya)
  const [adminEmail, setAdminEmail] = useState(ADMIN_CREDENTIALS.email);
  const [adminPassword, setAdminPassword] = useState(ADMIN_CREDENTIALS.password);

  // Teacher Form State
  const [teacherEmail, setTeacherEmail] = useState(teachers[0]?.email || 'tarsoni@smpwk.sch.id');
  const [teacherPassword, setTeacherPassword] = useState('SMPWKJaya');

  // Student Login Form State
  const defaultStudent = students.find((s) => s.email.startsWith('dya')) || students[0];
  const [studentEmail, setStudentEmail] = useState(defaultStudent ? defaultStudent.email : 'dya@smpwk.sch.id');
  const [studentPassword, setStudentPassword] = useState('SMPWKJaya');
  const [selectedStudentClass, setSelectedStudentClass] = useState<'all' | '7' | '8' | '9'>('all');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(defaultStudent?.id || '');

  // Student Register State
  const [regName, setRegName] = useState('');
  const [regNisn, setRegNisn] = useState('');
  const [regKelas, setRegKelas] = useState<'7' | '8' | '9'>('7');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('SMPWKJaya');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (teachers.length > 0 && !teacherEmail) {
      setTeacherEmail(teachers[0].email);
    }
  }, [teachers, teacherEmail]);

  if (!isOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const res = loginAsAdmin(adminEmail, adminPassword);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => onClose(), 600);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const res = loginAsTeacher(teacherEmail, teacherPassword);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => onClose(), 600);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleStudentLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const res = loginAsStudent(studentEmail, studentPassword);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => onClose(), 600);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleSelectStudent = (student: typeof students[0]) => {
    setSelectedStudentId(student.id);
    setStudentEmail(student.email);
    setStudentPassword('SMPWKJaya');
    setErrorMessage('');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const res = registerStudent({
      name: regName,
      nisn: regNisn || `31${Math.floor(10000000 + Math.random() * 90000000)}`,
      jurusan: 'Umum',
      kelas: regKelas,
      rombel: `Kelas ${regKelas}`,
      email: regEmail || `${regName.toLowerCase().split(' ')[0]}@smpwk.sch.id`,
      password: regPass || 'SMPWKJaya',
    });
    if (res.success) {
      setSuccessMessage(res.message);
      setStudentEmail(regEmail || `${regName.toLowerCase().split(' ')[0]}@smpwk.sch.id`);
      setStudentPassword(regPass || 'SMPWKJaya');
      setTimeout(() => {
        setMode('student');
      }, 1200);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const res = requestPasswordReset(forgotEmail);
    if (res.success) {
      setSuccessMessage(res.message);
      if (res.simulatedToken) {
        setResetToken(res.simulatedToken);
        setMode('resetConfirm');
      }
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleResetConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const res = resetPasswordWithToken(forgotEmail, resetToken, newPassword);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        setMode('student');
      }, 1200);
    } else {
      setErrorMessage(res.message);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesClass =
      selectedStudentClass === 'all' || s.kelas === selectedStudentClass;
    const q = studentSearchQuery.toLowerCase().trim();
    if (!q) return matchesClass;
    return (
      matchesClass &&
      (s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.nisn && s.nisn.includes(q)))
    );
  });

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
      <div id="auth-modal-card" className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-4 sm:p-5 text-white relative">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 p-1.5 backdrop-blur-xs border border-white/30 flex items-center justify-center shrink-0">
              <School className="w-7 h-7 text-amber-300" />
            </div>
            <div className="flex flex-col items-start justify-center text-left">
              <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight">LMS SMP WK</h2>
              <p className="text-xs text-blue-100 font-medium leading-tight">
                SMP Wijaya Kusuma • Kelas 7, 8, dan 9
              </p>
            </div>
          </div>
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Top Role Selection Buttons */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-3 gap-1.5">
            <button
              id="btn-switch-to-student-auth"
              type="button"
              onClick={() => {
                setMode('student');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 px-1 rounded-xl transition-all text-[11px] font-extrabold flex flex-col items-center justify-center gap-1 border ${
                mode === 'student' || mode === 'register'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Murid (Siswa)</span>
            </button>
            <button
              id="btn-switch-to-teacher-auth"
              type="button"
              onClick={() => {
                setMode('teacher');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 px-1 rounded-xl transition-all text-[11px] font-extrabold flex flex-col items-center justify-center gap-1 border ${
                mode === 'teacher'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Dewan Guru</span>
            </button>
            <button
              id="btn-switch-to-admin-auth"
              type="button"
              onClick={() => {
                setMode('admin');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 px-1 rounded-xl transition-all text-[11px] font-extrabold flex flex-col items-center justify-center gap-1 border ${
                mode === 'admin'
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-700" />
              <span>Kepala Sekolah</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* DEDICATED STUDENT LOGIN (AUTO-FILL & OPEN ACCESS) */}
          {mode === 'student' && (
            <form onSubmit={handleStudentLogin} className="space-y-3.5">
              {/* Auto-Fill Banner & Quick Selector */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold flex items-center gap-1.5 text-blue-900">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Pilih Siswa (Auto-Fill Otomatis):</span>
                  </span>
                  <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-bold">
                    38 Siswa Terdaftar
                  </span>
                </div>
                <p className="text-[11px] text-blue-800 leading-snug">
                  Pilih nama di bawah untuk mengisi otomatis email & kata sandi (<strong className="font-mono">SMPWKJaya</strong>), atau Anda juga dapat mengetik manual di kolom bawah.
                </p>

                {/* Class Tabs */}
                <div className="flex items-center gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentClass('all')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      selectedStudentClass === 'all'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentClass('7')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      selectedStudentClass === '7'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    Kelas 7 (12)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentClass('8')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      selectedStudentClass === '8'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    Kelas 8 (15)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentClass('9')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      selectedStudentClass === '9'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    Kelas 9 (11)
                  </button>
                </div>

                {/* Quick Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder="Cari nama atau NISN siswa..."
                    className="w-full text-[11px] bg-white border border-blue-200 rounded-xl pl-8 pr-3 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                  <Search className="w-3.5 h-3.5 text-blue-600 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>

                {/* Scrollable Students Grid / Chip List */}
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 bg-white/70 p-1.5 rounded-xl border border-blue-200">
                  {filteredStudents.map((std) => {
                    const isSelected = selectedStudentId === std.id || studentEmail.toLowerCase() === std.email.toLowerCase();
                    return (
                      <button
                        key={std.id}
                        type="button"
                        onClick={() => handleSelectStudent(std)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'bg-white hover:bg-blue-50 text-slate-800 border border-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                            isSelected ? 'bg-white text-blue-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {std.kelas}
                          </span>
                          <div className="truncate">
                            <span className="block truncate">{std.name}</span>
                            <span className={`text-[10px] block ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                              {std.email} • NISN: {std.nisn}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <div className="p-2 text-center text-[11px] text-slate-400">
                      Tidak ada siswa yang cocok dengan pencarian.
                    </div>
                  )}
                </div>
              </div>

              {/* Editable Credentials Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email / Username Siswa (@smpwk.sch.id):
                </label>
                <div className="relative">
                  <input
                    id="student-email-input"
                    type="text"
                    value={studentEmail}
                    onChange={(e) => {
                      setStudentEmail(e.target.value);
                      setSelectedStudentId('');
                    }}
                    placeholder="Contoh: dya@smpwk.sch.id atau dya"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Bisa menggunakan email lengkap (<span className="font-mono">dya@smpwk.sch.id</span>) atau nama depan saja (<span className="font-mono">dya</span>).
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Kata Sandi Siswa:</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(studentEmail);
                      setMode('forgot');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Lupa Sandi?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="student-password-input"
                    type="password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Masukkan sandi (bawaan: SMPWKJaya)"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                  <span>Sandi otomatis: <strong className="font-mono text-blue-700 font-bold">SMPWKJaya</strong></span>
                  <button
                    type="button"
                    onClick={() => setStudentPassword('SMPWKJaya')}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Isi SMPWKJaya
                  </button>
                </div>
              </div>

              <button
                id="btn-submit-student-login"
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Ruang Belajar Siswa SMPWK</span>
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-600">
                  Belum punya akun siswa?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-blue-700 font-bold hover:underline"
                  >
                    Daftar Siswa Baru Sekarang
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* DEDICATED TEACHER LOGIN */}
          {mode === 'teacher' && (
            <form onSubmit={handleTeacherSubmit} className="space-y-3.5">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-900 leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-blue-950">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Akses Khusus Dewan Guru SMP Wijaya Kusuma</span>
                </p>
                <p className="text-[11px] text-blue-800">
                  Pilih nama guru pengampu atau ketik email sekolah. Sandi default: <strong className="font-mono bg-blue-200/70 px-1 py-0.5 rounded text-blue-900 font-bold">SMPWKJaya</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Guru Terdaftar ({teachers.length} Guru Pengampu):
                </label>
                <div className="relative">
                  <select
                    id="teacher-email-select"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 pr-8 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {teachers.map((t) => (
                      <option key={t.email} value={t.email}>
                        {t.name} • {t.title || 'Guru'} ({t.email})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Kata Sandi Guru:</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(teacherEmail);
                      setMode('forgot');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Lupa Sandi?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="teacher-password-input"
                    type="password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="Masukkan sandi guru"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                id="btn-submit-teacher-login"
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Portal Dewan Guru SMPWK</span>
              </button>
            </form>
          )}

          {/* DEDICATED KEPALA SEKOLAH / ADMIN LOGIN */}
          {mode === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-3.5">
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-xs text-amber-950 leading-relaxed space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-200 border-2 border-amber-400 shrink-0 shadow-xs flex items-center justify-center">
                    <Crown className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <span className="font-extrabold text-amber-950 block text-xs">
                      {ADMIN_CREDENTIALS.name}
                    </span>
                    <span className="text-[11px] text-amber-800 font-medium">Kepala Sekolah SMP Wijaya Kusuma</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-900 border-t border-amber-200/60 pt-1.5 leading-snug">
                  Ruang Kontrol Kepala Sekolah: Manajemen konfigurasi LMS SMP WK, dewan guru, jadwal pelajaran, persetujuan siswa, dan bank soal CBT.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Kepala Sekolah:
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="fathi@smpwk.sch.id"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Khusus:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="SMPWKJaya"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Sandi bawaan Kepala Sekolah: <strong className="font-mono text-amber-600 font-bold">SMPWKJaya</strong>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Ruang Kontrol Kepala Sekolah</span>
              </button>
            </form>
          )}

          {/* STUDENT REGISTRATION */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-blue-950">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Pendaftaran Siswa Baru SMP Wijaya Kusuma</span>
                </p>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Daftarkan nama Anda. Akun langsung aktif dan dapat digunakan untuk masuk LMS SMP WK.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Siswa:</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => {
                    setRegName(e.target.value);
                    if (!regEmail && e.target.value) {
                      setRegEmail(`${e.target.value.toLowerCase().split(' ')[0]}@smpwk.sch.id`);
                    }
                  }}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NISN:</label>
                  <input
                    type="text"
                    value={regNisn}
                    onChange={(e) => setRegNisn(e.target.value)}
                    placeholder="0012345678"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Kelas:</label>
                  <select
                    value={regKelas}
                    onChange={(e) => setRegKelas(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                  >
                    <option value="7">Kelas 7 (VII)</option>
                    <option value="8">Kelas 8 (VIII)</option>
                    <option value="9">Kelas 9 (IX)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Siswa (@smpwk.sch.id):</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="budi@smpwk.sch.id"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi:</label>
                <input
                  type="text"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  placeholder="SMPWKJaya"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('student')}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Kembali ke Login
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  Daftar Sekarang
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-3.5">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Pemulihan Kata Sandi Akun LMS SMP WK</span>
                </p>
                <p className="text-[11px] text-amber-900 leading-snug">
                  Masukkan email terdaftar Anda (siswa atau guru). Sistem akan menerbitkan kode verifikasi reset sandi.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Terdaftar:</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="contoh: dya@smpwk.sch.id"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-semibold"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('student')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  Kirim Kode Reset
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD CONFIRM */}
          {mode === 'resetConfirm' && (
            <form onSubmit={handleResetConfirmSubmit} className="space-y-3.5">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 space-y-1">
                <p className="font-bold">Masukkan Kode & Sandi Baru</p>
                <p className="text-[11px] text-blue-800">
                  Kode verifikasi 6-digit telah dikirimkan ke kotak notifikasi LMS Anda.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kode Verifikasi (6-Digit):</label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full text-center text-sm font-mono tracking-widest bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi Baru:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 5 karakter"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
              >
                Simpan Kata Sandi Baru
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
