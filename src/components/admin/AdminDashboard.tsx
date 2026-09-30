import React, { useState, useRef, useEffect } from 'react';
import { useApp, ADMIN_CREDENTIALS } from '../../context/AppContext';
import { ThemeColor, TeacherAccount, ExamAttempt, Subject, BroadcastMessage, User, Jenjang } from '../../types';
import {
  ShieldCheck,
  Palette,
  Image as ImageIcon,
  Users,
  Award,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Upload,
  RotateCcw,
  Search,
  KeyRound,
  Sparkles,
  Server,
  Megaphone,
  Radio,
  Copy,
  Send,
  Check,
  UserCheck,
  UserX,
  UserPlus,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Camera,
} from 'lucide-react';
import { compressImageFile } from '../../lib/imageCompressor';

export const THEME_OPTIONS: {
  id: ThemeColor;
  name: string;
  desc: string;
  previewColors: string[];
}[] = [
  {
    id: 'blue',
    name: 'Biru Prestasi (Tema Utama SMP Wijaya Kusuma)',
    desc: 'Warna kebanggaan SMP Wijaya Kusuma bernuansa cerdas, modern, dan profesional.',
    previewColors: ['#1d4ed8', '#1e40af', '#38bdf8'],
  },
  {
    id: 'emerald',
    name: 'Zamrud Harapan',
    desc: 'Nuansa hijau sejuk melambangkan pertumbuhan, integritas & keasrian.',
    previewColors: ['#047857', '#0f766e', '#6ee7b7'],
  },
  {
    id: 'indigo',
    name: 'Indigo Digital',
    desc: 'Nuansa teknologi tinggi yang modern untuk era Kurikulum Merdeka.',
    previewColors: ['#3730a3', '#1e3a8a', '#67e8f9'],
  },
  {
    id: 'purple',
    name: 'Ungu Merdeka Unggul',
    desc: 'Nuansa kreatif dan inovatif untuk seni dan komunikasi.',
    previewColors: ['#6b21a8', '#5b21b6', '#f472b6'],
  },
  {
    id: 'rose',
    name: 'Marun Kejayaan',
    desc: 'Nuansa merah marun berani mencerminkan semangat juang & ketangguhan.',
    previewColors: ['#9f1239', '#991b1b', '#fde047'],
  },
  {
    id: 'darkGold',
    name: 'Midnight Gold Luxury',
    desc: 'Palet gelap eksklusif beraksen emas mulia untuk sentuhan eksekutif.',
    previewColors: ['#0f172a', '#18181b', '#f59e0b'],
  },
];

interface AdminDashboardProps {
  onSelectSubject?: (subject: Subject) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectSubject }) => {
  const {
    currentUser,
    siteSettings,
    updateSiteSettings,
    teachers,
    students,
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    exams,
    examAttempts,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    approveStudent,
    rejectStudent,
    approveAllPendingStudents,
    deleteStudent,
    updateStudent,
    registerStudent,
    updateStudentGrade,
    cbtUnlockToken,
    setCbtUnlockToken,
    broadcasts,
    addBroadcast,
    deleteBroadcast,
    updateUserProfile,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'approvals' | 'security' | 'broadcast' | 'identity' | 'theme' | 'teachers' | 'grades' | 'subjects'>('overview');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Student Approval & Management State
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [studentKelasFilter, setStudentKelasFilter] = useState<'Semua' | Jenjang>('Semua');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Reject Student Modal State
  const [rejectModalStudent, setRejectModalStudent] = useState<User | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('Data pendaftaran belum memenuhi syarat verifikasi sekolah.');

  // Edit / Add Student Modal State
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [formStudentName, setFormStudentName] = useState('');
  const [formStudentEmail, setFormStudentEmail] = useState('');
  const [formStudentKelas, setFormStudentKelas] = useState<Jenjang>('7');
  const [formStudentRombel, setFormStudentRombel] = useState('Kelas 7');
  const [formStudentPassword, setFormStudentPassword] = useState('SMPWKJaya');
  const [formStudentPhone, setFormStudentPhone] = useState('0812-1111-2222');
  const [formStudentStatus, setFormStudentStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');

  const pendingStudents = students.filter((s) => s.approvalStatus === 'pending');
  const approvedStudents = students.filter((s) => s.approvalStatus === 'approved' || !s.approvalStatus);
  const rejectedStudents = students.filter((s) => s.approvalStatus === 'rejected');

  // CBT Security & Token State
  const [tokenInput, setTokenInput] = useState(cbtUnlockToken || 'SMPWK2026');
  const [copiedToken, setCopiedToken] = useState(false);

  // Broadcast Message State
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcTarget, setBcTarget] = useState<'SEMUA' | 'Kelas 7' | 'Kelas 8' | 'Kelas 9'>('SEMUA');
  const [bcPriority, setBcPriority] = useState<'normal' | 'urgent'>('normal');

  // Identity Form State
  const [customLogoUrl, setCustomLogoUrl] = useState(siteSettings.logoUrl);
  const [customSiteName, setCustomSiteName] = useState(siteSettings.siteName || 'LMS SMP WK');
  const [customSchoolName, setCustomSchoolName] = useState(siteSettings.schoolName || 'SMP Wijaya Kusuma');
  const [customTagline, setCustomTagline] = useState(siteSettings.tagline);
  const fileLogoInputRef = useRef<HTMLInputElement>(null);

  // Teacher Management State
  const [teacherSearch, setTeacherSearch] = useState('');
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [editingTeacherEmail, setEditingTeacherEmail] = useState<string | null>(null);
  const [formTeacherName, setFormTeacherName] = useState('');
  const [formTeacherEmail, setFormTeacherEmail] = useState('');
  const [formTeacherSubject, setFormTeacherSubject] = useState('');
  const [formTeacherClasses, setFormTeacherClasses] = useState('Kelas 7, Kelas 8');
  const [formTeacherPassword, setFormTeacherPassword] = useState('SMPWKJaya');
  const [formTeacherPhone, setFormTeacherPhone] = useState('0812-3456-7890');
  const [formTeacherNip, setFormTeacherNip] = useState('-');

  // Gradebook State
  const [gradeSearch, setGradeSearch] = useState('');
  const [editingAttempt, setEditingAttempt] = useState<ExamAttempt | null>(null);
  const [editScoreTotal, setEditScoreTotal] = useState<number>(85);
  const [editScorePg, setEditScorePg] = useState<number>(40);
  const [editScoreEssay, setEditScoreEssay] = useState<number>(45);
  const [editIsPassed, setEditIsPassed] = useState<boolean>(true);

  // Subject Management State
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [formSubjectName, setFormSubjectName] = useState('');
  const [formSubjectCode, setFormSubjectCode] = useState('');
  const [formSubjectJenjang, setFormSubjectJenjang] = useState<Jenjang>('7');
  const [formSubjectCategory, setFormSubjectCategory] = useState<'Umum' | 'Muatan Lokal' | 'Pilihan / Mulok'>('Umum');
  const [formSubjectTeacherEmail, setFormSubjectTeacherEmail] = useState('');
  const [formSubjectTeacherName, setFormSubjectTeacherName] = useState('');
  const [formSubjectClasses, setFormSubjectClasses] = useState('Kelas 7, Kelas 8, Kelas 9');
  const [formSubjectDescription, setFormSubjectDescription] = useState('');

  const showNotificationToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
      logoUrl: customLogoUrl || '/favicon.svg',
      siteName: 'LMS SMP WK',
      schoolName: 'SMP Wijaya Kusuma',
      tagline: customTagline,
    });
    showNotificationToast('Identitas Website SMP Wijaya Kusuma berhasil disimpan!');
  };

  const handleTeacherFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeacherName || !formTeacherEmail) return;
    if (editingTeacherEmail) {
      updateTeacher(editingTeacherEmail, {
        name: formTeacherName,
        email: formTeacherEmail,
        phone: formTeacherPhone,
        nip: formTeacherNip,
        subjects: [{ name: formTeacherSubject || 'Mata Pelajaran SMP', classes: formTeacherClasses || 'Kelas 7, Kelas 8' }],
        customPassword: formTeacherPassword,
      });
      showNotificationToast(`Data guru ${formTeacherName} berhasil diperbarui.`);
    } else {
      const res = addTeacher({
        no: teachers.length + 1,
        name: formTeacherName,
        email: formTeacherEmail,
        phone: formTeacherPhone,
        nip: formTeacherNip,
        subjects: [{ name: formTeacherSubject || 'Mata Pelajaran SMP', classes: formTeacherClasses || 'Kelas 7, Kelas 8' }],
        customPassword: formTeacherPassword || 'SMPWKJaya',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });
      if (res?.success) {
        showNotificationToast(res.message);
      }
    }
    setShowAddTeacherModal(false);
    setEditingTeacherEmail(null);
  };

  const openEditTeacherModal = (t: TeacherAccount) => {
    setEditingTeacherEmail(t.email);
    setFormTeacherName(t.name);
    setFormTeacherEmail(t.email);
    setFormTeacherSubject(t.subjects[0]?.name || '');
    setFormTeacherClasses(t.subjects[0]?.classes || '');
    setFormTeacherPassword(t.customPassword || 'SMPWKJaya');
    setFormTeacherPhone(t.phone || '0812-3456-7890');
    setFormTeacherNip(t.nip || '-');
    setShowAddTeacherModal(true);
  };

  const openAddTeacherModal = () => {
    setEditingTeacherEmail(null);
    setFormTeacherName('');
    setFormTeacherEmail('');
    setFormTeacherSubject(subjects[0]?.name || 'Bahasa Sunda (Muatan Lokal)');
    setFormTeacherClasses('Kelas 7, Kelas 8, Kelas 9');
    setFormTeacherPassword('SMPWKJaya');
    setFormTeacherPhone('0812-3456-7890');
    setFormTeacherNip('-');
    setShowAddTeacherModal(true);
  };

  const handleSaveGradeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttempt) return;
    updateStudentGrade(editingAttempt.id, {
      totalScore: Number(editScoreTotal),
      pgScore: Number(editScorePg),
      essayScore: Number(editScoreEssay),
      isPassed: editIsPassed,
    });
    showNotificationToast(`Nilai siswa ${editingAttempt.studentName} berhasil diperbarui.`);
    setEditingAttempt(null);
  };

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    const clean = tokenInput.trim().toUpperCase();
    setCbtUnlockToken(clean);
    showNotificationToast(`Token Buka Kunci CBT berhasil disimpan: ${clean}`);
  };

  const handleCopyToken = () => {
    navigator.clipboard?.writeText(cbtUnlockToken || tokenInput);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
    showNotificationToast('Token berhasil disalin!');
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle.trim() || !bcMessage.trim()) return;
    const newBc: BroadcastMessage = {
      id: `bc-${Date.now()}`,
      senderRole: 'admin',
      senderName: ADMIN_CREDENTIALS.name,
      title: bcTitle.trim(),
      message: bcMessage.trim(),
      target: bcTarget,
      priority: bcPriority,
      createdAt: new Date().toISOString(),
    };
    addBroadcast(newBc);
    setBcTitle('');
    setBcMessage('');
    showNotificationToast(`Broadcast "${newBc.title}" berhasil disiarkan ke siswa!`);
  };

  const filteredStudents = students.filter((s) => {
    const status = s.approvalStatus || 'approved';
    const matchesStatus =
      studentStatusFilter === 'all' || status === studentStatusFilter;
    const matchesKelas =
      studentKelasFilter === 'Semua' || s.kelas === studentKelasFilter;
    const q = studentSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.rombel && s.rombel.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q));
    return matchesStatus && matchesKelas && matchesSearch;
  });

  const handleApproveStudent = (student: User) => {
    const res = approveStudent(student.id);
    showNotificationToast(res?.message || 'Siswa berhasil disetujui');
  };

  const handleOpenRejectModal = (student: User) => {
    setRejectModalStudent(student);
    setRejectReasonInput('Data pendaftaran belum memenuhi syarat verifikasi sekolah.');
  };

  const handleConfirmReject = () => {
    if (!rejectModalStudent) return;
    const res = rejectStudent(rejectModalStudent.id, rejectReasonInput.trim());
    showNotificationToast(res?.message || 'Status siswa diperbarui');
    setRejectModalStudent(null);
  };

  const handleApproveAll = () => {
    if (pendingStudents.length === 0) {
      alert('Tidak ada siswa baru yang berstatus pending.');
      return;
    }
    const res = approveAllPendingStudents();
    showNotificationToast(res?.message || 'Semua siswa disetujui');
  };

  const handleDeleteStudentAccount = (student: User) => {
    const confirm = window.confirm(`Hapus data akun siswa "${student.name}" (${student.email})? Tindakan ini tidak dapat dibatalkan.`);
    if (confirm) {
      const res = deleteStudent(student.id);
      showNotificationToast(res?.message || 'Siswa berhasil dihapus');
    }
  };

  const openAddStudentModal = () => {
    setEditingStudentId(null);
    setFormStudentName('');
    setFormStudentEmail('');
    setFormStudentKelas('7');
    setFormStudentRombel('Kelas 7');
    setFormStudentPassword('SMPWKJaya');
    setFormStudentPhone('');
    setFormStudentStatus('approved');
    setShowStudentModal(true);
  };

  const openEditStudentModal = (s: User) => {
    setEditingStudentId(s.id);
    setFormStudentName(s.name);
    setFormStudentEmail(s.email);
    setFormStudentKelas(s.kelas || '7');
    setFormStudentRombel(s.rombel || `Kelas ${s.kelas || '7'}`);
    setFormStudentPassword((s as any).password || 'SMPWKJaya');
    setFormStudentPhone(s.phone || '');
    setFormStudentStatus(s.approvalStatus || 'approved');
    setShowStudentModal(true);
  };

  const handleSaveStudentModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentName.trim() || !formStudentEmail.trim()) {
      alert('Nama dan email wajib diisi!');
      return;
    }
    if (editingStudentId) {
      const res = updateStudent(editingStudentId, {
        name: formStudentName.trim(),
        email: formStudentEmail.trim().toLowerCase(),
        kelas: formStudentKelas,
        rombel: formStudentRombel.trim(),
        phone: formStudentPhone.trim() || '-',
        password: formStudentPassword,
        approvalStatus: formStudentStatus,
      });
      showNotificationToast(res?.message || 'Data siswa berhasil diperbarui');
    } else {
      const res = registerStudent({
        name: formStudentName.trim(),
        email: formStudentEmail.trim().toLowerCase(),
        kelas: formStudentKelas,
        rombel: formStudentRombel.trim(),
        phone: formStudentPhone.trim() || '-',
        password: formStudentPassword,
      });
      if (res.success && res.user && formStudentStatus === 'approved') {
        approveStudent(res.user.id);
      }
      showNotificationToast(res.message);
    }
    setShowStudentModal(false);
    setEditingStudentId(null);
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.subjects.some((s) => s.name.toLowerCase().includes(teacherSearch.toLowerCase()))
  );

  const filteredAttempts = examAttempts.filter((att) => {
    const matchesSearch =
      att.studentName.toLowerCase().includes(gradeSearch.toLowerCase()) ||
      att.subjectName.toLowerCase().includes(gradeSearch.toLowerCase()) ||
      att.examTitle.toLowerCase().includes(gradeSearch.toLowerCase());
    return matchesSearch;
  });

  return (
    <div id="admin-dashboard-container" className="space-y-4 pb-16 text-slate-800 animate-in fade-in">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-14 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 p-3 bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-200" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-white/80 hover:text-white p-1">
            ✕
          </button>
        </div>
      )}

      {/* Admin Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden space-y-3 border border-blue-600/50">
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 overflow-hidden shrink-0 border-2 border-white/40 shadow-md flex items-center justify-center text-slate-950 font-black text-xl">
              <img
                src={currentUser?.avatar || ADMIN_CREDENTIALS.avatar}
                alt="Kepala Sekolah"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-200 text-[10px] font-black uppercase border border-blue-400/30">
                  KEPALA SEKOLAH
                </span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-semibold text-white">
                  Administrator
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                {ADMIN_CREDENTIALS.name}
              </h2>
              <p className="text-xs text-blue-100 font-medium">
                {ADMIN_CREDENTIALS.title}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/15 text-center">
          <div className="bg-white/10 rounded-2xl p-2 backdrop-blur-xs">
            <span className="text-[10px] text-blue-200 block">Guru</span>
            <strong className="text-xs sm:text-sm font-extrabold text-white">{teachers.length}</strong>
          </div>
          <div className="bg-white/10 rounded-2xl p-2 backdrop-blur-xs">
            <span className="text-[10px] text-blue-200 block">Murid Disetujui</span>
            <strong className="text-xs sm:text-sm font-extrabold text-white">
              {approvedStudents.length}
            </strong>
          </div>
          <div className="bg-white/10 rounded-2xl p-2 backdrop-blur-xs relative">
            <span className="text-[10px] text-blue-200 block">Pending</span>
            <strong className={`text-xs sm:text-sm font-extrabold ${pendingStudents.length > 0 ? 'text-amber-300 animate-pulse' : 'text-white'}`}>
              {pendingStudents.length}
            </strong>
          </div>
          <div className="bg-white/10 rounded-2xl p-2 backdrop-blur-xs">
            <span className="text-[10px] text-blue-200 block">Mapel & CBT</span>
            <strong className="text-xs sm:text-sm font-extrabold text-white">{subjects.length} / {exams.length}</strong>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-8 gap-1 bg-slate-200/80 p-1 rounded-2xl text-[11px] font-bold">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${
            activeAdminTab === 'overview'
              ? 'bg-blue-600 text-white shadow-md font-extrabold'
              : 'bg-white/70 text-slate-700 hover:bg-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ikhtisar</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('approvals')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 relative cursor-pointer ${
            activeAdminTab === 'approvals'
              ? 'bg-blue-600 text-white shadow-md font-extrabold'
              : 'bg-white/70 text-slate-700 hover:bg-white'
          }`}
        >
          <div className="relative">
            <UserCheck className="w-3.5 h-3.5" />
            {pendingStudents.length > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-rose-600 text-white rounded-full text-[8px] font-black animate-pulse">
                {pendingStudents.length}
              </span>
            )}
          </div>
          <span className="truncate max-w-full">Approval Siswa</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('teachers')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${
            activeAdminTab === 'teachers'
              ? 'bg-blue-600 text-white shadow-md font-extrabold'
              : 'bg-white/70 text-slate-700 hover:bg-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Dewan Guru</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('subjects')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${
            activeAdminTab === 'subjects'
              ? 'bg-blue-600 text-white shadow-md font-extrabold'
              : 'bg-white/70 text-slate-700 hover:bg-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="truncate max-w-full">Mata Pelajaran</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('security')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${
            activeAdminTab === 'security'
              ? 'bg-blue-600 text-white shadow-md font-extrabold'
              : 'bg-white/70 text-slate-700 hover:bg-white'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Token CBT</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('broadcast')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${
            activeAdminTab === 'broadcast'
              ? 'bg-blue-600 text-white shadow-md font-extrabold'
              : 'bg-white/70 text-slate-700 hover:bg-white'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Broadcast</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('grades')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${
            activeAdminTab === 'grades'
              ? 'bg-blue-600 text-white shadow-md font-extrabold'
              : 'bg-white/70 text-slate-700 hover:bg-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Nilai Murid</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('identity')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${
            activeAdminTab === 'identity'
              ? 'bg-blue-600 text-white shadow-md font-extrabold'
              : 'bg-white/70 text-slate-700 hover:bg-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Identitas</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-3">
          {pendingStudents.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-black">
                    Perhatian: {pendingStudents.length} Siswa Baru Menunggu Persetujuan
                  </h4>
                  <p className="text-[11px] text-blue-100 font-medium">
                    Murid yang mendaftar dapat masuk ke LMS SMP WK setelah Anda menyetujui pendaftarannya.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveAdminTab('approvals')}
                className="px-4 py-2 bg-amber-400 text-slate-950 rounded-xl font-black text-xs shadow-sm hover:bg-amber-300 transition-all shrink-0 cursor-pointer"
              >
                Tinjau & Setujui Sekarang ({pendingStudents.length})
              </button>
            </div>
          )}

          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Panel Kendali Utama Kepala Sekolah SMP Wijaya Kusuma</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sebagai Kepala Sekolah, Anda memiliki wewenang tertinggi untuk mengelola ekosistem <strong>LMS SMP WK</strong>, mulai dari persetujuan pendaftaran murid baru Kelas 7, 8, dan 9, kurikulum mata pelajaran (termasuk Muatan Lokal Bahasa Sunda), dewan guru, jadwal pelajaran harian, token keamanan anti-curang ujian CBT, hingga pemantauan seluruh nilai murid.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: APPROVALS */}
      {activeAdminTab === 'approvals' && (
        <div className="space-y-3.5">
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">
                    Persetujuan & Manajemen Akun Siswa SMPWK
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Verifikasi siswa Kelas 7, 8, dan 9 SMP Wijaya Kusuma.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {pendingStudents.length > 0 && (
                  <button
                    type="button"
                    onClick={handleApproveAll}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Setujui Semua ({pendingStudents.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={openAddStudentModal}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                >
                  + Tambah Siswa
                </button>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2">
              {filteredStudents.map((st) => (
                <div
                  key={st.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{st.name}</h4>
                    <p className="text-[11px] text-slate-500">{st.email} • {st.rombel || `Kelas ${st.kelas}`}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {st.approvalStatus === 'pending' ? (
                      <button
                        onClick={() => handleApproveStudent(st)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Setujui
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Aktif
                      </span>
                    )}
                    <button
                      onClick={() => openEditStudentModal(st)}
                      className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudentAccount(st)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEACHERS */}
      {activeAdminTab === 'teachers' && (
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Direktori Dewan Guru SMP Wijaya Kusuma ({teachers.length})</span>
              </h3>
              <button
                onClick={openAddTeacherModal}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Guru</span>
              </button>
            </div>

            <div className="space-y-2">
              {filteredTeachers.map((t) => (
                <div
                  key={t.email}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                    <p className="text-[11px] text-slate-500">{t.email} • {t.title}</p>
                    <p className="text-[10px] text-blue-700 font-medium">
                      Mapel: {t.subjects.map((s) => s.name).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditTeacherModal(t)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus data guru ${t.name}?`)) {
                          deleteTeacher(t.email);
                          showNotificationToast('Guru berhasil dihapus.');
                        }
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MATA PELAJARAN */}
      {activeAdminTab === 'subjects' && (
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Daftar Mata Pelajaran SMP Wijaya Kusuma</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Termasuk Muatan Lokal Bahasa Sunda dan mapel umum Kurikulum Merdeka.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {subjects.map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                        {s.code}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">{s.category}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{s.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Pengampu: {s.teacherName}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-blue-700 font-bold">30 Pertemuan & LKPD</span>
                    {onSelectSubject && (
                      <button
                        onClick={() => onSelectSubject(s)}
                        className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                      >
                        Buka Modul
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TOKEN CBT */}
      {activeAdminTab === 'security' && (
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Token Buka Kunci Anti-Curang CBT SMP Wijaya Kusuma</span>
            </h3>

            <div className="p-4 bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-blue-200 uppercase font-bold block">Token Buka Kunci Layar:</span>
                <span className="text-2xl font-black font-mono tracking-widest text-amber-400">
                  {cbtUnlockToken || 'SMPWK2026'}
                </span>
              </div>
              <button
                onClick={handleCopyToken}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedToken ? 'Tersalin!' : 'Salin Token'}</span>
              </button>
            </div>

            <form onSubmit={handleSaveToken} className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Atur Token Baru:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Simpan Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: BROADCAST */}
      {activeAdminTab === 'broadcast' && (
        <div className="space-y-4">
          <form onSubmit={handleSendBroadcast} className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Megaphone className="w-4 h-4 text-blue-600" />
              <span>Kirim Broadcast Pengumuman Kepala Sekolah</span>
            </h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Judul Pengumuman:</label>
              <input
                type="text"
                value={bcTitle}
                onChange={(e) => setBcTitle(e.target.value)}
                placeholder="Contoh: Jadwal Ujian Tengah Semester SMP Wijaya Kusuma"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Isi Pesan:</label>
              <textarea
                rows={3}
                value={bcMessage}
                onChange={(e) => setBcMessage(e.target.value)}
                placeholder="Tuliskan pengumuman untuk seluruh peserta didik..."
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
            >
              Kirim Broadcast Sekarang
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: GRADES */}
      {activeAdminTab === 'grades' && (
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Master Rekap Nilai Siswa SMP Wijaya Kusuma</span>
            </h3>

            <div className="space-y-2">
              {filteredAttempts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Belum ada rekapan nilai siswa yang tersimpan.
                </div>
              ) : (
                filteredAttempts.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{att.studentName}</h4>
                      <p className="text-[11px] text-slate-500">{att.examTitle} • {att.studentClass}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-700 font-mono">
                        {att.totalScore} / {att.maxScore}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: IDENTITY & THEME */}
      {activeAdminTab === 'identity' && (
        <form onSubmit={handleSaveIdentity} className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span>Pengaturan Identitas Portal SMP Wijaya Kusuma</span>
          </h3>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Aplikasi:</label>
            <input
              type="text"
              value={customSiteName}
              onChange={(e) => setCustomSiteName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Sekolah:</label>
            <input
              type="text"
              value={customSchoolName}
              onChange={(e) => setCustomSchoolName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Slogan / Tagline:</label>
            <input
              type="text"
              value={customTagline}
              onChange={(e) => setCustomTagline(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer"
          >
            Simpan Perubahan Identitas
          </button>
        </form>
      )}

      {/* ADD / EDIT STUDENT MODAL */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white flex items-center justify-between">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>{editingStudentId ? 'Edit Data Siswa' : 'Tambah Siswa Baru SMPWK'}</span>
              </h4>
              <button
                onClick={() => setShowStudentModal(false)}
                className="text-white/80 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveStudentModal} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Siswa:</label>
                <input
                  type="text"
                  value={formStudentName}
                  onChange={(e) => setFormStudentName(e.target.value)}
                  placeholder="Contoh: Reisyah Aulia Juliana"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Siswa:</label>
                <input
                  type="email"
                  value={formStudentEmail}
                  onChange={(e) => setFormStudentEmail(e.target.value)}
                  placeholder="reisyah@smpwk.sch.id"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat Kelas:</label>
                  <select
                    value={formStudentKelas}
                    onChange={(e) => {
                      const kls = e.target.value as any;
                      setFormStudentKelas(kls);
                      setFormStudentRombel(`Kelas ${kls}`);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  >
                    <option value="7">Kelas 7 (VII)</option>
                    <option value="8">Kelas 8 (VIII)</option>
                    <option value="9">Kelas 9 (IX)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rombel:</label>
                  <input
                    type="text"
                    value={formStudentRombel}
                    onChange={(e) => setFormStudentRombel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Sandi:</label>
                <input
                  type="text"
                  value={formStudentPassword}
                  onChange={(e) => setFormStudentPassword(e.target.value)}
                  placeholder="SMPWKJaya"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT TEACHER MODAL */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white flex items-center justify-between">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{editingTeacherEmail ? 'Edit Data Guru' : 'Tambah Guru Baru SMP Wijaya Kusuma'}</span>
              </h4>
              <button
                onClick={() => setShowAddTeacherModal(false)}
                className="text-white/80 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleTeacherFormSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar:</label>
                <input
                  type="text"
                  value={formTeacherName}
                  onChange={(e) => setFormTeacherName(e.target.value)}
                  placeholder="Contoh: Tarsoni, S.Pd."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Sekolah:</label>
                <input
                  type="email"
                  value={formTeacherEmail}
                  onChange={(e) => setFormTeacherEmail(e.target.value)}
                  placeholder="tarsoni@smpwk.sch.id"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran:</label>
                <input
                  type="text"
                  value={formTeacherSubject}
                  onChange={(e) => setFormTeacherSubject(e.target.value)}
                  placeholder="Contoh: Bahasa Sunda (Muatan Lokal)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
