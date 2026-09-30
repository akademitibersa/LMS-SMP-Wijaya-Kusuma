import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject, MeetingModule, Exam, Question, ScheduleItem, LKPDSubmission, ExamAttempt, StudentAnswer, Jenjang } from '../../types';
import { compressImageFile } from '../../lib/imageCompressor';
import {
  Calendar,
  BookOpen,
  FileCheck2,
  HelpCircle,
  Plus,
  Clock,
  MapPin,
  Users,
  Sparkles,
  Search,
  CheckCircle,
  Edit3,
  Award,
  Trash2,
  Eye,
  FileText,
  Send,
  Download,
  ChevronDown,
  GraduationCap,
  Save,
  User as UserIcon,
  Check,
  ShieldCheck,
  Megaphone,
  Radio,
  Languages,
} from 'lucide-react';

export interface TeacherDashboardProps {
  onSelectSubject?: (sbj: Subject) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onSelectSubject }) => {
  const {
    currentUser,
    subjects,
    addSubject,
    schedules,
    exams,
    examAttempts,
    lkpdSubmissions,
    getMeetingsForSubject,
    updateMeetingModule,
    addExam,
    updateExam,
    deleteExam,
    gradeExamEssay,
    gradeLKPD,
    addScheduleItem,
    deleteScheduleItem,
    updateUserProfile,
    changePassword,
    broadcasts,
    addBroadcast,
    deleteBroadcast,
  } = useApp();

  const [activeTeacherView, setActiveTeacherView] = useState<'schedule' | 'curriculum' | 'examBuilder' | 'grading' | 'broadcast' | 'profile'>('schedule');

  // Teacher Broadcast state
  const [teacherBcTitle, setTeacherBcTitle] = useState('');
  const [teacherBcMessage, setTeacherBcMessage] = useState('');
  const [teacherBcTarget, setTeacherBcTarget] = useState<'SEMUA' | 'Kelas 7' | 'Kelas 8' | 'Kelas 9'>('SEMUA');
  const [teacherBcPriority, setTeacherBcPriority] = useState<'normal' | 'urgent'>('normal');
  const [bcSuccessToast, setBcSuccessToast] = useState<string | null>(null);

  // Filter subjects taught by this teacher
  const teacherSubjects = subjects.filter(
    (s) => s.teacherEmail.toLowerCase() === currentUser?.email.toLowerCase()
  );
  const currentSubjectList = teacherSubjects.length > 0 ? teacherSubjects : subjects;

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    currentSubjectList[0]?.id || subjects[0]?.id || ''
  );

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0] || {
    id: 'sbj-sunda',
    name: 'Bahasa Sunda (Muatan Lokal)',
    code: 'MULOK-SND',
    jurusan: 'Umum' as const,
    jenjang: '7' as const,
    teacherName: 'Tarsoni',
    teacherEmail: 'tarsoni@smpwk.sch.id',
    targetClasses: ['Kelas 7', 'Kelas 8', 'Kelas 9'],
    icon: 'BookOpen',
    color: 'blue',
    totalMeetings: 30,
  };

  const meetings = activeSubject?.id ? getMeetingsForSubject(activeSubject.id) : [];

  // Schedules for this teacher
  const teacherSchedules = schedules.filter(
    (sch) => sch.teacherEmail.toLowerCase() === currentUser?.email.toLowerCase()
  );
  const [selectedDay, setSelectedDay] = useState<'Semua' | 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'>('Semua');

  const displayedSchedules = (teacherSchedules.length > 0 ? teacherSchedules : schedules).filter(
    (s) => selectedDay === 'Semua' || s.day === selectedDay
  );

  // Search & Filters
  const [meetingSearch, setMeetingSearch] = useState('');
  const [selectedMeetingDetail, setSelectedMeetingDetail] = useState<MeetingModule | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<MeetingModule | null>(null);

  // Exam Builder
  const [isCreatingExam, setIsCreatingExam] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examScopeFilter, setExamScopeFilter] = useState<'mine' | 'all'>('mine');
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamSubjectId, setNewExamSubjectId] = useState(activeSubject?.id || '');
  const [newExamTargetClasses, setNewExamTargetClasses] = useState(activeSubject?.targetClasses?.join(', ') || 'Kelas 7');
  const [newExamDuration, setNewExamDuration] = useState(45);
  const [newExamPassingGrade, setNewExamPassingGrade] = useState(75);
  const [newExamQuestions, setNewExamQuestions] = useState<Question[]>([
    {
      id: `q-${Date.now()}-1`,
      number: 1,
      type: 'pg',
      questionText: 'Jelaskan konsep dasar materi pembelajaran ini...',
      options: [
        { key: 'A', text: 'Pilihan Jawaban A' },
        { key: 'B', text: 'Pilihan Jawaban B' },
        { key: 'C', text: 'Pilihan Jawaban C' },
        { key: 'D', text: 'Pilihan Jawaban D' },
      ],
      correctAnswer: 'A',
      explanation: 'Penjelasan kunci jawaban',
      scoreWeight: 20,
    },
  ]);

  const isExamOwner = (ex: Exam) => {
    if (currentUser?.role === 'admin') return true;
    const emailMatches = ex.teacherEmail?.toLowerCase() === currentUser?.email?.toLowerCase();
    const nameMatches = currentUser?.name && ex.teacherName?.toLowerCase() === currentUser.name.toLowerCase();
    return emailMatches || nameMatches;
  };

  // Exam Grading Modal
  const [gradingAttempt, setGradingAttempt] = useState<ExamAttempt | null>(null);

  // LKPD Grading Modal
  const [gradingLKPDItem, setGradingLKPDItem] = useState<LKPDSubmission | null>(null);
  const [lkpdScoreInput, setLkpdScoreInput] = useState<number>(85);
  const [lkpdFeedbackInput, setLkpdFeedbackInput] = useState<string>('Pengerjaan sangat baik dan tuntas.');

  // Teacher Profile Form State
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileTitle, setProfileTitle] = useState(currentUser?.title || 'Dewan Guru SMP Wijaya Kusuma');
  const [profileNip, setProfileNip] = useState(currentUser?.nisn || '19850214 201103 1 010');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '0812-3456-7801');
  const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatar || '');
  const [profileBio, setProfileBio] = useState('Mendidik dan membimbing peserta didik SMP Wijaya Kusuma berkarakter dan berwawasan luas.');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Change Password Form State
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState<string | null>(null);
  const [passSuccessMsg, setPassSuccessMsg] = useState<string | null>(null);

  // Add Schedule Modal
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [newSchDay, setNewSchDay] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'>('Senin');
  const [newSchClass, setNewSchClass] = useState(activeSubject?.targetClasses?.[0] || 'Kelas 7');
  const [newSchTimeStart, setNewSchTimeStart] = useState('07:30');
  const [newSchTimeEnd, setNewSchTimeEnd] = useState('09:30');
  const [newSchRoom, setNewSchRoom] = useState('Ruang Teori 7-A');
  const [newSchTopic, setNewSchTopic] = useState('Pembahasan Modul Teori & Praktik LKPD');

  // Teacher Add Subject Modal State
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjJenjang, setNewSubjJenjang] = useState<Jenjang>('7');
  const [newSubjClasses, setNewSubjClasses] = useState('Kelas 7, Kelas 8');
  const [newSubjCategory, setNewSubjCategory] = useState<'Umum' | 'Muatan Lokal' | 'Pilihan / Mulok'>('Umum');
  const [newSubjDescription, setNewSubjDescription] = useState('');

  const photoFileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAddSubjectTeacher = () => {
    setNewSubjName('');
    setNewSubjJenjang('7');
    setNewSubjCategory('Umum');
    setNewSubjCode(`SMPWK-${Date.now().toString().slice(-3)}`);
    setNewSubjClasses('Kelas 7, Kelas 8');
    setNewSubjDescription('');
    setShowAddSubjectModal(true);
  };

  const handleSaveSubjectTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;
    const classesArray = newSubjClasses
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const res = addSubject({
      id: `sbj-${Date.now()}`,
      name: newSubjName.trim(),
      code: newSubjCode.trim() || `SMPWK-${Date.now().toString().slice(-3)}`,
      jurusan: 'Umum',
      jenjang: newSubjJenjang,
      category: newSubjCategory,
      teacherName: currentUser?.name || 'Dewan Guru SMP Wijaya Kusuma',
      teacherEmail: currentUser?.email || 'guru@smpwk.sch.id',
      targetClasses: classesArray.length > 0 ? classesArray : ['Kelas 7', 'Kelas 8', 'Kelas 9'],
      description: newSubjDescription.trim(),
      totalMeetings: 30,
      icon: newSubjName.toLowerCase().includes('sunda') ? 'Languages' : 'BookOpen',
      color: 'blue',
    });
    if (res?.subject?.id) {
      setSelectedSubjectId(res.subject.id);
    }
    setShowAddSubjectModal(false);
  };

  const handleOpenEditExam = (ex: Exam) => {
    if (!isExamOwner(ex)) {
      alert(`Hanya guru pengampu yang berhak mengedit butir soal.`);
      return;
    }
    setEditingExamId(ex.id);
    setNewExamTitle(ex.title);
    setNewExamSubjectId(ex.subjectId);
    setNewExamTargetClasses(ex.targetClasses ? ex.targetClasses.join(', ') : 'Kelas 7');
    setNewExamDuration(ex.durationMinutes);
    setNewExamPassingGrade(ex.passingGrade);
    setNewExamQuestions(ex.questions && ex.questions.length > 0 ? ex.questions : []);
    setIsCreatingExam(true);
  };

  const handleAddQuestion = (type: 'pg' | 'essay' | 'true_false') => {
    const nextNum = newExamQuestions.length + 1;
    const newQ: Question = {
      id: `q-${Date.now()}-${nextNum}`,
      number: nextNum,
      type,
      questionText: type === 'pg' ? 'Tuliskan pertanyaan pilihan ganda di sini...' : type === 'essay' ? 'Tuliskan instruksi pertanyaan esai di sini...' : 'Tuliskan pernyataan benar atau salah di sini...',
      options:
        type === 'pg'
          ? [
              { key: 'A', text: 'Pilihan A' },
              { key: 'B', text: 'Pilihan B' },
              { key: 'C', text: 'Pilihan C' },
              { key: 'D', text: 'Pilihan D' },
            ]
          : type === 'true_false'
          ? [
              { key: 'BENAR', text: 'Benar' },
              { key: 'SALAH', text: 'Salah' },
            ]
          : undefined,
      correctAnswer: type === 'pg' ? 'A' : type === 'true_false' ? 'BENAR' : '',
      explanation: 'Penjelasan rubrik penilaian',
      scoreWeight: 20,
    };
    setNewExamQuestions([...newExamQuestions, newQ]);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim()) return;
    const sbj = subjects.find((s) => s.id === newExamSubjectId) || activeSubject;

    if (editingExamId) {
      updateExam(editingExamId, {
        title: newExamTitle,
        subjectId: sbj.id,
        subjectName: sbj.name,
        targetClasses: newExamTargetClasses.split(',').map((c) => c.trim()),
        durationMinutes: Number(newExamDuration),
        passingGrade: Number(newExamPassingGrade),
        totalQuestions: newExamQuestions.length,
        questions: newExamQuestions,
      });
    } else {
      const newExam: Exam = {
        id: `exam-${Date.now()}`,
        code: `CBT-${sbj.code}-${Date.now().toString().slice(-3)}`,
        title: newExamTitle,
        subjectId: sbj.id,
        subjectName: sbj.name,
        teacherEmail: currentUser?.email || sbj.teacherEmail,
        teacherName: currentUser?.name || sbj.teacherName,
        jurusan: sbj.jurusan,
        jenjang: sbj.jenjang,
        targetClasses: newExamTargetClasses.split(',').map((c) => c.trim()),
        durationMinutes: Number(newExamDuration),
        passingGrade: Number(newExamPassingGrade),
        totalQuestions: newExamQuestions.length,
        instructions: [
          'Kerjakan soal secara mandiri dan jujur.',
          'Waktu akan dihitung mundur secara otomatis.',
          'Klik tombol selesai jika telah menyelesaikan semua soal.',
        ],
        isActive: true,
        questions: newExamQuestions,
        createdAt: new Date().toISOString().split('T')[0],
      };
      addExam(newExam);
    }
    setIsCreatingExam(false);
    setEditingExamId(null);
    setNewExamTitle('');
    setNewExamQuestions([]);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: profileName,
      title: profileTitle,
      nisn: profileNip,
      phone: profilePhone,
      avatar: profileAvatar,
    });
    setProfileSuccessMsg('Profil dan data guru Anda berhasil diperbarui di LMS SMP WK.');
    setTimeout(() => setProfileSuccessMsg(null), 4000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrorMsg(null);
    setPassSuccessMsg(null);
    if (newPass.length < 5) {
      setPassErrorMsg('Kata sandi baru minimal 5 karakter.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }
    const res = changePassword(oldPass, newPass);
    if (res.success) {
      setPassSuccessMsg(res.message);
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      setPassErrorMsg(res.message);
    }
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const newSch: ScheduleItem = {
      id: `sch-${Date.now()}`,
      teacherEmail: currentUser?.email || activeSubject.teacherEmail,
      teacherName: currentUser?.name || activeSubject.teacherName,
      subjectName: activeSubject.name,
      className: newSchClass,
      day: newSchDay,
      timeStart: newSchTimeStart,
      timeEnd: newSchTimeEnd,
      room: newSchRoom,
      topic: newSchTopic,
      meetingNumber: 1,
    };
    addScheduleItem(newSch);
    setIsAddingSchedule(false);
  };

  const handleTeacherSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherBcTitle.trim() || !teacherBcMessage.trim()) return;
    addBroadcast({
      senderRole: 'teacher',
      senderName: currentUser?.name || 'Dewan Guru SMP Wijaya Kusuma',
      title: teacherBcTitle.trim(),
      message: teacherBcMessage.trim(),
      target: teacherBcTarget,
      priority: teacherBcPriority,
    });
    setTeacherBcTitle('');
    setTeacherBcMessage('');
    setBcSuccessToast('Pengumuman broadcast berhasil disiarkan kepada peserta didik!');
    setTimeout(() => setBcSuccessToast(null), 3500);
  };

  const scopedExamAttempts = currentUser?.role === 'admin'
    ? examAttempts
    : examAttempts;

  const scopedLkpdSubmissions = currentUser?.role === 'admin'
    ? lkpdSubmissions
    : lkpdSubmissions;

  const filteredExams = exams.filter((ex) => {
    if (examScopeFilter === 'mine') {
      return isExamOwner(ex);
    }
    return true;
  });

  return (
    <div id="teacher-dashboard-view" className="space-y-4 pb-12 animate-in fade-in">
      {/* Teacher Profile Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden border border-blue-600/50">
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-medium backdrop-blur-xs mb-1.5 text-blue-100">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Portal Dewan Guru SMP Wijaya Kusuma</span>
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">{currentUser?.name}</h2>
            <p className="text-xs text-blue-100 font-mono mt-0.5">{currentUser?.email}</p>
            <p className="text-[11px] text-blue-200 mt-1">
              SMP Wijaya Kusuma • {currentUser?.title || 'Dewan Guru'}
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-amber-400 border-2 border-white/30 overflow-hidden shrink-0 shadow-md flex items-center justify-center text-slate-950 font-black text-lg">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <Users className="w-6 h-6 text-slate-900" />
            )}
          </div>
        </div>

        {/* Classes Taught Badges */}
        <div className="mt-3 pt-3 border-t border-white/15 flex flex-wrap gap-1.5 items-center text-[11px]">
          <span className="text-blue-200 font-semibold">Mapel & Kelas Diampu:</span>
          {currentSubjectList.slice(0, 4).map((s) => (
            <span key={s.id} className="bg-white/15 px-2 py-0.5 rounded-md text-white font-medium">
              {s.name} ({s.targetClasses.join(', ')})
            </span>
          ))}
        </div>
      </div>

      {/* Navigation Sub-tabs for Teacher */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTeacherView('schedule')}
          className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTeacherView === 'schedule'
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-[10px] leading-tight">Jadwal Ngajar</span>
        </button>
        <button
          onClick={() => setActiveTeacherView('curriculum')}
          className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTeacherView === 'curriculum'
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="text-[10px] leading-tight">30 Modul</span>
        </button>
        <button
          onClick={() => setActiveTeacherView('examBuilder')}
          className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTeacherView === 'examBuilder'
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="text-[10px] leading-tight">Bank Soal</span>
        </button>
        <button
          onClick={() => setActiveTeacherView('grading')}
          className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTeacherView === 'grading'
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span className="text-[10px] leading-tight">Koreksi Nilai</span>
        </button>
        <button
          onClick={() => setActiveTeacherView('broadcast')}
          className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTeacherView === 'broadcast'
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span className="text-[10px] leading-tight">Broadcast</span>
        </button>
        <button
          onClick={() => setActiveTeacherView('profile')}
          className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTeacherView === 'profile'
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span className="text-[10px] leading-tight">Profil Guru</span>
        </button>
      </div>

      {/* VIEW 1: KALENDER MENGAJAR */}
      {activeTeacherView === 'schedule' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Jadwal Mengajar Harian</span>
            </h3>
            <button
              onClick={() => setIsAddingSchedule(true)}
              className="text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Jadwal</span>
            </button>
          </div>

          <div className="flex overflow-x-auto gap-1 pb-1 text-xs">
            {(['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const).map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-colors cursor-pointer ${
                  selectedDay === day
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {displayedSchedules.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium">Tidak ada jadwal mengajar pada hari {selectedDay}.</p>
              </div>
            ) : (
              displayedSchedules.map((sch) => (
                <div
                  key={sch.id}
                  className="p-3.5 bg-white rounded-3xl border border-slate-200 hover:border-blue-400 transition-all shadow-xs flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                        {sch.day}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                        {sch.className || sch.classGroup}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{sch.startTime || sch.timeStart} - {sch.endTime || sch.timeEnd}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{sch.subjectName}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{sch.room}</span>
                    </p>
                  </div>

                  {sch.topic && (
                    <div className="p-2 bg-slate-50 rounded-xl text-[11px] text-slate-700 border border-slate-100 flex items-start gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800">Topik: </span>
                        <span>{sch.topic}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500">Guru: {sch.teacherName}</span>
                    <button
                      onClick={() => deleteScheduleItem(sch.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: 30 MODUL PERTEMUAN & LKPD */}
      {activeTeacherView === 'curriculum' && (
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-3xl border border-slate-200 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">Pilih Mata Pelajaran Diampu:</label>
              <button
                type="button"
                onClick={handleOpenAddSubjectTeacher}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Tambah Mapel</span>
              </button>
            </div>
            <div className="relative">
              <select
                id="select-subject-teacher"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 pr-8 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {currentSubjectList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name} ({s.targetClasses.join(', ')})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              value={meetingSearch}
              onChange={(e) => setMeetingSearch(e.target.value)}
              placeholder="Cari topik atau nomor pertemuan (1-30)..."
              className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-hidden shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="space-y-2">
            {meetings
              .filter(
                (m) =>
                  m.title.toLowerCase().includes(meetingSearch.toLowerCase()) ||
                  m.meetingNumber.toString().includes(meetingSearch) ||
                  m.theme.toLowerCase().includes(meetingSearch.toLowerCase())
              )
              .map((m) => (
                <div
                  key={m.meetingNumber}
                  className="p-3.5 bg-white rounded-3xl border border-slate-200 hover:border-blue-400 transition-all shadow-xs flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {m.meetingNumber}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                          Pertemuan {m.meetingNumber} • {m.theme}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{m.title}</h4>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {m.learningObjective}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>LKPD Tersedia</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedMeetingDetail(m)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Buka</span>
                      </button>
                      <button
                        onClick={() => setEditingMeeting(m)}
                        className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* VIEW 3: BANK SOAL */}
      {activeTeacherView === 'examBuilder' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Bank Soal CBT SMP Wijaya Kusuma</span>
            </h3>
            {!isCreatingExam && (
              <button
                onClick={() => {
                  setIsCreatingExam(true);
                  setNewExamTitle(`Penilaian Harian ${activeSubject.name}`);
                  setNewExamSubjectId(activeSubject.id);
                  setNewExamTargetClasses(activeSubject.targetClasses.join(', '));
                  setNewExamQuestions([
                    {
                      id: `q-${Date.now()}-1`,
                      number: 1,
                      type: 'pg',
                      questionText: 'Pertanyaan pilihan ganda butir 1...',
                      options: [
                        { key: 'A', text: 'Opsi Jawaban A' },
                        { key: 'B', text: 'Opsi Jawaban B' },
                        { key: 'C', text: 'Opsi Jawaban C' },
                        { key: 'D', text: 'Opsi Jawaban D' },
                      ],
                      correctAnswer: 'A',
                      explanation: 'Kunci jawaban A karena...',
                      scoreWeight: 20,
                    },
                  ]);
                }}
                className="text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Buat Ujian Baru</span>
              </button>
            )}
          </div>

          {/* List of existing exams */}
          <div className="space-y-2.5">
            {filteredExams.map((ex) => (
              <div
                key={ex.id}
                className="p-3.5 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                      {ex.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Aktif CBT
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{ex.title}</h4>
                  <p className="text-[11px] text-slate-600">{ex.subjectName} • {ex.durationMinutes} Menit</p>
                </div>
                <div className="pt-1.5 flex items-center justify-between text-xs border-t border-slate-100">
                  <span className="text-[10px] text-slate-500">Guru: {ex.teacherName}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditExam(ex)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Soal</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: KOREKSI NILAI & LKPD */}
      {activeTeacherView === 'grading' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>Koreksi Ujian & Penilaian LKPD Siswa</span>
            </h3>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Hasil Pengerjaan Ujian Siswa</span>
            </h4>
            {scopedExamAttempts.length === 0 ? (
              <div className="p-6 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
                Belum ada data pengerjaan ujian masuk.
              </div>
            ) : (
              scopedExamAttempts.map((att) => (
                <div
                  key={att.id}
                  className="p-3.5 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{att.studentName}</h5>
                      <p className="text-[10px] text-slate-500">
                        {att.studentClass} • {att.examTitle}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        Nilai: {att.totalScore} / {att.maxScore}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Pengumpulan Lembar Kerja Siswa (LKPD)</span>
            </h4>
            {scopedLkpdSubmissions.length === 0 ? (
              <div className="p-6 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
                Belum ada pengumpulan LKPD masuk.
              </div>
            ) : (
              scopedLkpdSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{sub.studentName}</h5>
                      <p className="text-[10px] text-slate-500">
                        {sub.studentClass} • Pertemuan {sub.meetingNumber} ({sub.subjectName})
                      </p>
                    </div>
                    {sub.score !== undefined ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Skor: {sub.score}/100
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Menunggu Nilai
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 leading-relaxed">
                    "{sub.content}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 5: BROADCAST */}
      {activeTeacherView === 'broadcast' && (
        <div className="space-y-4">
          {bcSuccessToast && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bcSuccessToast}</span>
            </div>
          )}

          <form
            onSubmit={handleTeacherSendBroadcast}
            className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3.5 text-xs"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Kirim Broadcast / Pengumuman Guru</h3>
                <p className="text-[11px] text-slate-500">Pesan instruksi materi, tugas LKPD, atau jadwal ke siswa</p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Judul Siaran:</label>
              <input
                type="text"
                value={teacherBcTitle}
                onChange={(e) => setTeacherBcTitle(e.target.value)}
                placeholder="Contoh: Pengumpulan LKPD Basa Sunda Lawungan 4"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Isi Pesan Guru:</label>
              <textarea
                rows={3}
                value={teacherBcMessage}
                onChange={(e) => setTeacherBcMessage(e.target.value)}
                placeholder="Tuliskan petunjuk, pengingat tugas, atau informasi penting untuk siswa..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Broadcast Sekarang</span>
            </button>
          </form>
        </div>
      )}

      {/* VIEW 6: PROFIL GURU */}
      {activeTeacherView === 'profile' && (
        <div className="space-y-4">
          {profileSuccessMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          <form
            onSubmit={handleSaveProfile}
            className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs"
          >
            <h4 className="font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-blue-600" />
              <span>Biodata & Data Pendidik SMP Wijaya Kusuma</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar:</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jabatan / Gelar Profesi:</label>
                <input
                  type="text"
                  value={profileTitle}
                  onChange={(e) => setProfileTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
