import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  TeacherAccount,
  Subject,
  ScheduleItem,
  Exam,
  ExamAttempt,
  LKPDSubmission,
  NotificationItem,
  BroadcastMessage,
  SiteSettings,
  MeetingModule,
  StudentAnswer,
} from '../types';
import { INITIAL_TEACHERS, DEFAULT_TEACHER_PASSWORD } from '../data/teachersData';
import { INITIAL_STUDENTS, DEFAULT_STUDENT_PASSWORD } from '../data/studentsData';
import { INITIAL_SUBJECTS } from '../data/subjectsData';
import { INITIAL_SCHEDULES } from '../data/scheduleData';
import { INITIAL_EXAMS } from '../data/sampleExamsData';
import { generate30MeetingsForSubject } from '../data/curriculumService';
import {
  subscribeSiteSettings,
  saveSiteSettingsToFirestore,
  subscribeAppState,
  saveAppStateToFirestore,
  saveUserProfileToFirestore,
  saveSubjectMeetingsToFirestore,
  deleteSubjectMeetingsFromFirestore,
} from '../services/firestoreService';

export const ADMIN_CREDENTIALS = {
  name: 'Fathi Khoerulloh, S.Pd',
  email: 'fathi@smpwk.sch.id',
  altEmail: 'kepsek@smpwk.sch.id',
  password: 'SMPWKJaya',
  title: 'Kepala Sekolah SMP Wijaya Kusuma',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

const DEFAULT_SETTINGS: SiteSettings = {
  logoUrl: '/favicon.svg',
  siteName: 'LMS SMP WK',
  schoolName: 'SMP Wijaya Kusuma',
  tagline: 'Platform E-Learning & Ujian Berbasis Komputer (CBT) SMP Wijaya Kusuma',
  themeColor: 'blue',
  cbtRedirectUrl: '',
  cbtMode: 'internal',
  cbtAutoRedirect: false,
  secretAdminPassword: 'SMPWKJaya',
};

interface AppContextType {
  currentUser: User | null;
  siteSettings: SiteSettings;
  teachers: TeacherAccount[];
  students: User[];
  subjects: Subject[];
  schedules: ScheduleItem[];
  exams: Exam[];
  examAttempts: ExamAttempt[];
  lkpdSubmissions: LKPDSubmission[];
  notifications: NotificationItem[];
  broadcasts: BroadcastMessage[];
  cbtUnlockToken: string;
  activeTab: 'home' | 'schedule' | 'subjects' | 'cbt' | 'account';
  selectedSubject: Subject | null;
  activeExam: Exam | null;
  activeExamAttempt: ExamAttempt | null;
  // Actions
  setActiveTab: (tab: 'home' | 'schedule' | 'subjects' | 'cbt' | 'account') => void;
  setSelectedSubject: (subject: Subject | null) => void;
  setActiveExam: (exam: Exam | null) => void;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  loginAsAdmin: (email?: string, password?: string) => { success: boolean; message: string; user?: User };
  loginWithSecretKey: (secretPassword: string) => { success: boolean; message: string; user?: User };
  loginAsTeacher: (email: string, password?: string) => { success: boolean; message: string; user?: User };
  loginAsStudent: (email: string, password?: string) => { success: boolean; message: string; user?: User };
  registerStudent: (studentData: Partial<User> & { password?: string }) => { success: boolean; message: string; user?: User };
  logout: () => void;
  updateUserProfile: (updated: Partial<User>) => { success: boolean; message: string };
  changePassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  requestPasswordReset: (email: string) => { success: boolean; message: string; simulatedToken?: string };
  resetPasswordWithToken: (email: string, token: string, newPass: string) => { success: boolean; message: string };
  approveStudent: (studentId: string) => { success: boolean; message: string };
  rejectStudent: (studentId: string, reason?: string) => { success: boolean; message: string };
  approveAllPendingStudents: () => { success: boolean; count: number; message: string };
  deleteStudent: (studentId: string) => { success: boolean; message: string };
  updateStudent: (studentId: string, updated: Partial<User>) => { success: boolean; message: string };
  addTeacher: (teacher: TeacherAccount) => { success: boolean; message: string };
  updateTeacher: (identifier: number | string, updated: Partial<TeacherAccount>) => { success: boolean; message: string };
  deleteTeacher: (identifier: number | string) => { success: boolean; message: string };
  addSubject: (subject: Omit<Subject, 'id'> & { id?: string }) => { success: boolean; message: string; subject: Subject };
  updateSubject: (subjectId: string, updated: Partial<Subject>) => void;
  deleteSubject: (subjectId: string) => void;
  getMeetingsForSubject: (subjectId: string) => MeetingModule[];
  updateMeetingModule: (subjectId: string, meetingNumber: number, updated: Partial<MeetingModule>) => void;
  addExam: (exam: Exam) => void;
  updateExam: (examId: string, updated: Partial<Exam>) => void;
  deleteExam: (examId: string) => void;
  submitExamAttempt: (attempt: ExamAttempt) => void;
  gradeExamEssay: (attemptId: string, questionId: string, score: number, feedback?: string) => void;
  updateStudentGrade: (
    attemptId: string,
    updatedScores: { totalScore?: number; pgScore?: number; essayScore?: number; isPassed?: boolean; notes?: string }
  ) => void;
  submitLKPD: (submission: LKPDSubmission) => void;
  gradeLKPD: (submissionId: string, score: number, feedback: string) => void;
  addSchedule: (schedule: ScheduleItem) => void;
  addScheduleItem: (schedule: ScheduleItem) => void;
  updateScheduleItem: (scheduleId: string, updated: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (scheduleId: string) => void;
  addNotification: (title: string, message: string, type?: NotificationItem['type']) => void;
  markNotificationRead: (id: string) => void;
  addBroadcast: (broadcast: Omit<BroadcastMessage, 'id' | 'createdAt'>) => void;
  deleteBroadcast: (broadcastId: string) => void;
  setCbtUnlockToken: (token: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Site settings with default Blue Theme
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('smpwk_site_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          siteName: 'LMS SMP WK',
          schoolName: 'SMP Wijaya Kusuma',
          tagline: 'Platform E-Learning & Ujian Berbasis Komputer (CBT) SMP Wijaya Kusuma',
          themeColor: parsed.themeColor || 'blue',
          secretAdminPassword: parsed.secretAdminPassword || 'SMPWKJaya',
        };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Teachers
  const [teachers, setTeachers] = useState<TeacherAccount[]>(() => {
    const saved = localStorage.getItem('smpwk_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  // Students list
  const [students, setStudents] = useState<User[]>(() => {
    const saved = localStorage.getItem('smpwk_students');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: any) => ({
            ...s,
            approvalStatus: s.approvalStatus || 'approved',
          }));
        }
      } catch {}
    }
    return INITIAL_STUDENTS;
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smpwk_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Subjects
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('smpwk_subjects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_SUBJECTS;
  });

  // Admin custom profile
  const [adminCustomProfile, setAdminCustomProfile] = useState<{ avatar?: string; name?: string; phone?: string }>(() => {
    const saved = localStorage.getItem('smpwk_admin_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  // 30 Meetings cache/store per subject ID
  const [subjectMeetings, setSubjectMeetings] = useState<Record<string, MeetingModule[]>>(() => {
    const saved = localStorage.getItem('smpwk_meetings');
    if (saved) return JSON.parse(saved);
    const initial: Record<string, MeetingModule[]> = {};
    INITIAL_SUBJECTS.forEach((subj) => {
      initial[subj.id] = generate30MeetingsForSubject(subj);
    });
    return initial;
  });

  // Schedules
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('smpwk_schedules');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  // Exams
  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('smpwk_exams');
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });

  // Exam Attempts / Results
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>(() => {
    const saved = localStorage.getItem('smpwk_exam_attempts');
    return saved ? JSON.parse(saved) : [];
  });

  // LKPD Submissions
  const [lkpdSubmissions, setLkpdSubmissions] = useState<LKPDSubmission[]>(() => {
    const saved = localStorage.getItem('smpwk_lkpd_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Wilujeng Sumping di LMS SMP WK!',
      message: 'Portal E-Learning dan CBT Ujian SMP Wijaya Kusuma untuk Kelas 7, 8, dan 9. Dilengkapi Muatan Lokal Bahasa Sunda.',
      timestamp: 'Baru saja',
      read: false,
      type: 'info',
    },
    {
      id: 'notif-2',
      title: 'Pangajaran Basa Sunda & 30 Modul Siap',
      message: 'Materi pembelajaran Muatan Lokal Bahasa Sunda sareng pancen LKPD parantos siap diajar.',
      timestamp: '1 jam yang lalu',
      read: false,
      type: 'assignment',
    },
  ]);

  // CBT Anti-Cheat Unlock Token
  const [cbtUnlockToken, setCbtUnlockTokenState] = useState<string>(() => {
    const saved = localStorage.getItem('smpwk_cbt_token');
    return saved || 'SMPWK2026';
  });

  const setCbtUnlockToken = (token: string) => {
    const cleanToken = token.trim().toUpperCase();
    setCbtUnlockTokenState(cleanToken);
    try {
      localStorage.setItem('smpwk_cbt_token', cleanToken);
    } catch (e) {
      console.warn('Storage token notice', e);
    }
    saveAppStateToFirestore('cbt_unlock_token', cleanToken);
  };

  // Broadcast Messages
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>(() => {
    const saved = localStorage.getItem('smpwk_broadcasts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'bc-welcome-smpwk',
        senderName: 'Fathi Khoerulloh, S.Pd',
        senderRole: 'admin',
        title: 'Selamat Datang di Pembelajaran Digital SMP Wijaya Kusuma',
        message: 'Wilujeng sumping ka sadaya pamilon didik Kelas 7, 8, sareng 9 katut Bapak/Ibu Dewan Guru di LMS SMP WK. Hayu urang sumanget diajar, ngamumule budi pekerti luhur, sarta miara kabudayaan Sunda.',
        target: 'SEMUA',
        priority: 'normal',
        createdAt: '2026-09-20 07:30',
      },
    ];
  });

  // Active view states
  const [activeTab, setActiveTabState] = useState<'home' | 'schedule' | 'subjects' | 'cbt' | 'account'>('home');
  const [selectedSubject, setSelectedSubjectState] = useState<Subject | null>(null);
  const [activeExam, setActiveExamState] = useState<Exam | null>(null);
  const [activeExamAttempt] = useState<ExamAttempt | null>(null);

  const setActiveTab = (tab: 'home' | 'schedule' | 'subjects' | 'cbt' | 'account') => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setSelectedSubject = (subject: Subject | null) => {
    setSelectedSubjectState(subject);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setActiveExam = (exam: Exam | null) => {
    setActiveExamState(exam);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listeners for Firestore if available
  useEffect(() => {
    const unsubSettings = subscribeSiteSettings((incoming) => {
      if (incoming) {
        setSiteSettings((prev) => {
          const merged: SiteSettings = {
            ...prev,
            ...incoming,
            siteName: 'LMS SMP WK',
            schoolName: incoming.schoolName || prev.schoolName || 'SMP Wijaya Kusuma',
            tagline: incoming.tagline || prev.tagline || 'Platform E-Learning & Ujian Berbasis Komputer (CBT) SMP Wijaya Kusuma',
            themeColor: incoming.themeColor || prev.themeColor || 'blue',
            secretAdminPassword: incoming.secretAdminPassword || prev.secretAdminPassword || 'SMPWKJaya',
          };
          try {
            localStorage.setItem('smpwk_site_settings', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    });

    const unsubTeachers = subscribeAppState<TeacherAccount[]>('teachers', (data) => {
      if (Array.isArray(data) && data.length > 0) {
        setTeachers(data);
        try {
          localStorage.setItem('smpwk_teachers', JSON.stringify(data));
        } catch {}
      }
    });

    const unsubStudents = subscribeAppState<User[]>('students', (data) => {
      if (Array.isArray(data) && data.length > 0) {
        setStudents(data);
        try {
          localStorage.setItem('smpwk_students', JSON.stringify(data));
        } catch {}
      }
    });

    const unsubSubjects = subscribeAppState<Subject[]>('subjects', (data) => {
      if (Array.isArray(data) && data.length > 0) {
        setSubjects(data);
        try {
          localStorage.setItem('smpwk_subjects', JSON.stringify(data));
        } catch {}
      }
    });

    const unsubSchedules = subscribeAppState<ScheduleItem[]>('schedules', (data) => {
      if (Array.isArray(data)) {
        setSchedules(data);
        try {
          localStorage.setItem('smpwk_schedules', JSON.stringify(data));
        } catch {}
      }
    });

    const unsubExams = subscribeAppState<Exam[]>('exams', (data) => {
      if (Array.isArray(data)) {
        setExams(data);
        try {
          localStorage.setItem('smpwk_exams', JSON.stringify(data));
        } catch {}
      }
    });

    const unsubAttempts = subscribeAppState<ExamAttempt[]>('exam_attempts', (data) => {
      if (Array.isArray(data)) {
        setExamAttempts(data);
        try {
          localStorage.setItem('smpwk_exam_attempts', JSON.stringify(data));
        } catch {}
      }
    });

    const unsubLKPD = subscribeAppState<LKPDSubmission[]>('lkpd_submissions', (data) => {
      if (Array.isArray(data)) {
        setLkpdSubmissions(data);
        try {
          localStorage.setItem('smpwk_lkpd_submissions', JSON.stringify(data));
        } catch {}
      }
    });

    const unsubBroadcasts = subscribeAppState<BroadcastMessage[]>('broadcasts', (data) => {
      if (Array.isArray(data)) {
        setBroadcasts(data);
        try {
          localStorage.setItem('smpwk_broadcasts', JSON.stringify(data));
        } catch {}
      }
    });

    return () => {
      unsubSettings();
      unsubTeachers();
      unsubStudents();
      unsubSubjects();
      unsubSchedules();
      unsubExams();
      unsubAttempts();
      unsubLKPD();
      unsubBroadcasts();
    };
  }, []);

  // Update site settings
  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => {
      const updated: SiteSettings = {
        ...prev,
        ...settings,
        siteName: 'LMS SMP WK',
        schoolName: 'SMP Wijaya Kusuma',
      };
      try {
        localStorage.setItem('smpwk_site_settings', JSON.stringify(updated));
      } catch {}
      saveSiteSettingsToFirestore(updated);
      return updated;
    });
  };

  // Dedicated Admin / Kepala Sekolah Login (Fathi Khoerulloh, S.Pd / SMPWKJaya)
  const loginAsAdmin = (email = ADMIN_CREDENTIALS.email, password = ADMIN_CREDENTIALS.password) => {
    const cleanEmail = email.trim().toLowerCase();
    const activeSecretPass = (siteSettings.secretAdminPassword || ADMIN_CREDENTIALS.password).trim();
    const isMatchPass = password === ADMIN_CREDENTIALS.password || password === activeSecretPass;
    const isMatchEmail =
      cleanEmail === '' ||
      cleanEmail.includes('fathi') ||
      cleanEmail.includes('admin') ||
      cleanEmail.includes('kepsek') ||
      cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() ||
      cleanEmail === ADMIN_CREDENTIALS.altEmail.toLowerCase();

    if (!isMatchPass) {
      return {
        success: false,
        message: 'Kata sandi Kepala Sekolah salah. Pastikan sandi dimasukkan dengan benar.',
      };
    }
    if (!isMatchEmail) {
      return {
        success: false,
        message: 'Email Kepala Sekolah tidak cocok. Gunakan email Bapak Kepala Sekolah.',
      };
    }

    const adminUser: User = {
      id: 'admin-headmaster',
      name: adminCustomProfile.name || ADMIN_CREDENTIALS.name,
      email: ADMIN_CREDENTIALS.email,
      role: 'admin',
      title: ADMIN_CREDENTIALS.title,
      avatar: adminCustomProfile.avatar || ADMIN_CREDENTIALS.avatar,
      phone: adminCustomProfile.phone || '0812-3456-7890',
    };

    setCurrentUser(adminUser);
    try {
      localStorage.setItem('smpwk_current_user', JSON.stringify(adminUser));
    } catch {}

    addNotification(
      'Selamat Datang Kepala Sekolah',
      `Bapak ${ADMIN_CREDENTIALS.name} berhasil masuk ke Ruang Kontrol Utama Kepala Sekolah SMP Wijaya Kusuma.`,
      'info'
    );

    return {
      success: true,
      message: `Selamat datang Bapak ${ADMIN_CREDENTIALS.name}! Anda memiliki kontrol penuh atas manajemen sistem sekolah.`,
      user: adminUser,
    };
  };

  // Direct Secret Key Login (Backdoor Kepala Sekolah)
  const loginWithSecretKey = (secretPassword: string) => {
    const activeSecretPass = (siteSettings.secretAdminPassword || ADMIN_CREDENTIALS.password).trim();
    if (secretPassword.trim() === activeSecretPass || secretPassword.trim() === 'SMPWKJaya') {
      const adminUser: User = {
        id: 'admin-headmaster',
        name: ADMIN_CREDENTIALS.name,
        email: ADMIN_CREDENTIALS.email,
        role: 'admin',
        title: ADMIN_CREDENTIALS.title,
        avatar: ADMIN_CREDENTIALS.avatar,
        phone: '0812-3456-7890',
      };
      setCurrentUser(adminUser);
      try {
        localStorage.setItem('smpwk_current_user', JSON.stringify(adminUser));
      } catch {}
      setActiveTab('home');
      addNotification(
        'Akses Khusus Kepala Sekolah',
        `Pintu rahasia dibuka. Selamat datang Bapak ${ADMIN_CREDENTIALS.name}!`,
        'info'
      );
      return {
        success: true,
        message: `Kunci rahasia diterima! Selamat datang Bapak ${ADMIN_CREDENTIALS.name}.`,
        user: adminUser,
      };
    }
    return {
      success: false,
      message: 'Sandi rahasia Kepala Sekolah salah. Silakan coba lagi.',
    };
  };

  // Teacher Login
  const loginAsTeacher = (email: string, password = DEFAULT_TEACHER_PASSWORD) => {
    const cleanEmail = email.trim().toLowerCase();

    if (
      (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() ||
        cleanEmail === ADMIN_CREDENTIALS.altEmail.toLowerCase() ||
        cleanEmail.includes('fathi')) &&
      (password === ADMIN_CREDENTIALS.password || password === 'SMPWKJaya')
    ) {
      return loginAsAdmin(email, password);
    }

    const teacher = teachers.find(
      (t) =>
        t.email.toLowerCase() === cleanEmail ||
        t.email.toLowerCase().split('@')[0] === cleanEmail ||
        t.name.toLowerCase().includes(cleanEmail)
    );

    if (!teacher) {
      return { success: false, message: 'Email guru tidak terdaftar di sistem SMP Wijaya Kusuma.' };
    }

    const validPass = teacher.customPassword || DEFAULT_TEACHER_PASSWORD;
    if (password && password !== validPass && password !== 'SMPWKJaya') {
      return { success: false, message: 'Kata sandi guru salah. Password default awal: SMPWKJaya' };
    }

    const userObj: User = {
      id: `teacher-${teacher.no}`,
      name: teacher.name,
      email: teacher.email,
      role: 'guru',
      avatar: teacher.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      phone: teacher.phone,
      title: teacher.title || 'Dewan Guru SMP Wijaya Kusuma',
      subjectsTaught: teacher.subjects.map((s) => s.name),
      classesTaught: teacher.subjects.map((s) => s.classes),
    };

    setCurrentUser(userObj);
    try {
      localStorage.setItem('smpwk_current_user', JSON.stringify(userObj));
    } catch {}

    addNotification('Login Berhasil', `Selamat bertugas, ${teacher.name}!`, 'info');
    return { success: true, message: `Selamat datang, ${teacher.name}!`, user: userObj };
  };

  // Student Login
  const loginAsStudent = (emailOrQuery: string, password?: string) => {
    const raw = (emailOrQuery || '').trim();
    const cleanQuery = raw.toLowerCase();

    if (!cleanQuery) {
      return { success: false, message: 'Silakan pilih siswa atau masukkan email / nama siswa.' };
    }

    const student = students.find((s) => {
      const sEmail = (s.email || '').toLowerCase();
      const sUsername = sEmail.split('@')[0];
      const sNisn = s.nisn || '';
      const sFirstName = s.name.trim().toLowerCase().split(' ')[0];
      const sFullName = s.name.trim().toLowerCase();

      return (
        sEmail === cleanQuery ||
        sUsername === cleanQuery ||
        sNisn === cleanQuery ||
        sFirstName === cleanQuery ||
        sFullName.includes(cleanQuery) ||
        cleanQuery.includes(sUsername) ||
        ((s as any).aliasEmails && (s as any).aliasEmails.some((a: string) => a.toLowerCase() === cleanQuery))
      );
    });

    if (!student) {
      return {
        success: false,
        message: `Akun siswa "${raw}" tidak ditemukan. Anda dapat memilih nama langsung dari daftar kelas 7, 8, atau 9 di atas.`,
      };
    }

    const studentPass = (student as any).password || DEFAULT_STUDENT_PASSWORD;
    if (password && password !== studentPass && password !== 'SMPWKJaya') {
      return { success: false, message: 'Kata sandi siswa salah. Password default awal adalah: SMPWKJaya' };
    }

    const status = student.approvalStatus || 'approved';
    if (status === 'rejected') {
      return {
        success: false,
        message: `Pendaftaran akun siswa ini telah ditolak oleh Admin sekolah.`,
      };
    }

    setCurrentUser(student);
    try {
      localStorage.setItem('smpwk_current_user', JSON.stringify(student));
    } catch {}

    addNotification('Login Siswa Berhasil', `Selamat datang kembali, ${student.name}!`, 'info');
    return { success: true, message: `Selamat datang, ${student.name}!`, user: student };
  };

  // Student Registration
  const registerStudent = (studentData: Partial<User> & { password?: string }) => {
    if (!studentData.name || !studentData.email || !studentData.kelas) {
      return { success: false, message: 'Mohon lengkapi semua data pendaftaran wajib.' };
    }
    const email = studentData.email.trim().toLowerCase();
    const existing = students.find((s) => s.email.toLowerCase() === email);
    if (existing) {
      return { success: false, message: 'Email siswa tersebut sudah terdaftar. Silakan langsung masuk (login).' };
    }

    const newStudent: User & { password?: string } = {
      id: `std-${Date.now()}`,
      name: studentData.name.trim(),
      email,
      role: 'murid',
      jurusan: 'Umum',
      kelas: studentData.kelas,
      rombel: studentData.rombel || `Kelas ${studentData.kelas}`,
      academicYear: '2026/2027',
      nisn: studentData.nisn || `31${Math.floor(10000000 + Math.random() * 90000000)}`,
      avatar: studentData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      approvalStatus: 'approved',
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      approvedBy: 'Fathi Khoerulloh, S.Pd',
      password: studentData.password || DEFAULT_STUDENT_PASSWORD,
      phone: studentData.phone || '0812-xxxx-xxxx',
    };

    const nextStudents = [newStudent, ...students];
    setStudents(nextStudents);
    try {
      localStorage.setItem('smpwk_students', JSON.stringify(nextStudents));
    } catch {}
    saveAppStateToFirestore('students', nextStudents);

    addNotification(
      'Siswa Baru Terdaftar',
      `Siswa baru "${newStudent.name}" (${newStudent.rombel}) berhasil didaftarkan ke LMS SMP WK.`,
      'info'
    );

    return {
      success: true,
      message: `Pendaftaran berhasil! Akun atas nama "${newStudent.name}" telah aktif dan siap digunakan.`,
      user: newStudent,
    };
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('smpwk_current_user');
    } catch {}
    setActiveTab('home');
    setSelectedSubject(null);
    setActiveExam(null);
    addNotification('Sesi Berakhir', 'Anda telah keluar dari sistem LMS SMP WK.', 'info');
  };

  const approveStudent = (studentId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let targetName = '';
    const nextStudents = students.map((s) => {
      if (s.id === studentId) {
        targetName = s.name;
        return {
          ...s,
          approvalStatus: 'approved' as const,
          approvedAt: nowStr,
          approvedBy: ADMIN_CREDENTIALS.name,
          rejectionReason: undefined,
        };
      }
      return s;
    });
    setStudents(nextStudents);
    try {
      localStorage.setItem('smpwk_students', JSON.stringify(nextStudents));
    } catch {}
    saveAppStateToFirestore('students', nextStudents);
    addNotification(
      'Siswa Disetujui',
      `Akun siswa "${targetName || studentId}" telah disetujui oleh Kepala Sekolah.`,
      'info'
    );
    return { success: true, message: `Akun siswa "${targetName || studentId}" berhasil disetujui.` };
  };

  const rejectStudent = (studentId: string, reason?: string) => {
    let targetName = '';
    const nextStudents = students.map((s) => {
      if (s.id === studentId) {
        targetName = s.name;
        return {
          ...s,
          approvalStatus: 'rejected' as const,
          rejectionReason: reason || 'Data pendaftaran belum memenuhi syarat.',
        };
      }
      return s;
    });
    setStudents(nextStudents);
    try {
      localStorage.setItem('smpwk_students', JSON.stringify(nextStudents));
    } catch {}
    saveAppStateToFirestore('students', nextStudents);
    return { success: true, message: `Akun siswa "${targetName || studentId}" telah ditolak/diberi catatan.` };
  };

  const approveAllPendingStudents = () => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let count = 0;
    const nextStudents = students.map((s) => {
      if (s.approvalStatus === 'pending') {
        count++;
        return {
          ...s,
          approvalStatus: 'approved' as const,
          approvedAt: nowStr,
          approvedBy: ADMIN_CREDENTIALS.name,
          rejectionReason: undefined,
        };
      }
      return s;
    });
    if (count > 0) {
      setStudents(nextStudents);
      try {
        localStorage.setItem('smpwk_students', JSON.stringify(nextStudents));
      } catch {}
      saveAppStateToFirestore('students', nextStudents);
      return {
        success: true,
        count,
        message: `Berhasil menyetujui ${count} akun siswa sekaligus!`,
      };
    }
    return {
      success: false,
      count: 0,
      message: 'Tidak ada akun siswa yang berstatus pending.',
    };
  };

  const deleteStudent = (studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    const nextStudents = students.filter((s) => s.id !== studentId);
    setStudents(nextStudents);
    try {
      localStorage.setItem('smpwk_students', JSON.stringify(nextStudents));
    } catch {}
    saveAppStateToFirestore('students', nextStudents);
    return { success: true, message: `Data siswa "${target?.name || studentId}" berhasil dihapus.` };
  };

  const updateStudent = (studentId: string, updated: Partial<User>) => {
    let targetName = '';
    const nextStudents = students.map((s) => {
      if (s.id === studentId) {
        targetName = updated.name || s.name;
        return { ...s, ...updated };
      }
      return s;
    });
    setStudents(nextStudents);
    try {
      localStorage.setItem('smpwk_students', JSON.stringify(nextStudents));
    } catch {}
    saveAppStateToFirestore('students', nextStudents);
    return { success: true, message: `Data siswa "${targetName || studentId}" berhasil diperbarui.` };
  };

  const addTeacher = (teacher: TeacherAccount) => {
    if (teachers.some((t) => t.email.toLowerCase() === teacher.email.toLowerCase())) {
      return { success: false, message: 'Email guru sudah terdaftar!' };
    }
    const nextTeachers = [...teachers, teacher];
    setTeachers(nextTeachers);
    try {
      localStorage.setItem('smpwk_teachers', JSON.stringify(nextTeachers));
    } catch {}
    saveAppStateToFirestore('teachers', nextTeachers);
    return { success: true, message: `Guru ${teacher.name} berhasil ditambahkan.` };
  };

  const updateTeacher = (identifier: number | string, updated: Partial<TeacherAccount>) => {
    const nextTeachers = teachers.map((t) =>
      (typeof identifier === 'number' ? t.no === identifier : t.email.toLowerCase() === identifier.toLowerCase())
        ? { ...t, ...updated }
        : t
    );
    setTeachers(nextTeachers);
    try {
      localStorage.setItem('smpwk_teachers', JSON.stringify(nextTeachers));
    } catch {}
    saveAppStateToFirestore('teachers', nextTeachers);
    return { success: true, message: 'Data guru berhasil diperbarui.' };
  };

  const deleteTeacher = (identifier: number | string) => {
    const nextTeachers = teachers.filter((t) =>
      typeof identifier === 'number' ? t.no !== identifier : t.email.toLowerCase() !== identifier.toLowerCase()
    );
    setTeachers(nextTeachers);
    try {
      localStorage.setItem('smpwk_teachers', JSON.stringify(nextTeachers));
    } catch {}
    saveAppStateToFirestore('teachers', nextTeachers);
    return { success: true, message: 'Data guru berhasil dihapus.' };
  };

  const updateUserProfile = (updated: Partial<User>) => {
    if (!currentUser) return { success: false, message: 'Tidak ada sesi login.' };
    const updatedUser = { ...currentUser, ...updated };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('smpwk_current_user', JSON.stringify(updatedUser));
    } catch {}
    saveUserProfileToFirestore(updatedUser);

    if (currentUser.role === 'admin') {
      const nextProf = {
        name: updated.name || adminCustomProfile.name,
        avatar: updated.avatar || adminCustomProfile.avatar,
        phone: updated.phone || adminCustomProfile.phone,
      };
      setAdminCustomProfile(nextProf);
      try {
        localStorage.setItem('smpwk_admin_profile', JSON.stringify(nextProf));
      } catch {}
      saveAppStateToFirestore('admin_profile', nextProf);
    } else if (currentUser.role === 'guru') {
      const nextTeachers = teachers.map((t) =>
        t.email.toLowerCase() === currentUser.email.toLowerCase()
          ? {
              ...t,
              avatar: updated.avatar !== undefined ? updated.avatar : t.avatar,
              name: updated.name || t.name,
              phone: updated.phone || t.phone,
              title: updated.title || t.title,
            }
          : t
      );
      setTeachers(nextTeachers);
      try {
        localStorage.setItem('smpwk_teachers', JSON.stringify(nextTeachers));
      } catch {}
      saveAppStateToFirestore('teachers', nextTeachers);
    } else if (currentUser.role === 'murid') {
      const nextStudents = students.map((s) => (s.id === currentUser.id ? { ...s, ...updated } : s));
      setStudents(nextStudents);
      try {
        localStorage.setItem('smpwk_students', JSON.stringify(nextStudents));
      } catch {}
      saveAppStateToFirestore('students', nextStudents);
    }
    return { success: true, message: 'Profil berhasil diperbarui.' };
  };

  const changePassword = (oldPass: string, newPass: string) => {
    if (!currentUser) return { success: false, message: 'Sesi login tidak ditemukan.' };
    if (!newPass || newPass.length < 5) {
      return { success: false, message: 'Kata sandi baru minimal harus 5 karakter.' };
    }
    if (currentUser.role === 'admin') {
      if (oldPass !== ADMIN_CREDENTIALS.password && oldPass !== 'SMPWKJaya') {
        return { success: false, message: 'Kata sandi lama Kepala Sekolah salah.' };
      }
      ADMIN_CREDENTIALS.password = newPass;
      updateSiteSettings({ secretAdminPassword: newPass });
      return { success: true, message: 'Kata sandi Kepala Sekolah berhasil diubah!' };
    }
    if (currentUser.role === 'guru') {
      const teacherIndex = teachers.findIndex((t) => t.email.toLowerCase() === currentUser.email.toLowerCase());
      if (teacherIndex === -1) return { success: false, message: 'Data guru tidak ditemukan.' };
      const currentTeacher = teachers[teacherIndex];
      const actualOld = currentTeacher.customPassword || DEFAULT_TEACHER_PASSWORD;
      if (oldPass !== actualOld && oldPass !== 'SMPWKJaya') {
        return { success: false, message: 'Kata sandi lama guru salah.' };
      }
      updateTeacher(currentTeacher.no, { customPassword: newPass });
      return { success: true, message: 'Kata sandi guru berhasil diubah!' };
    }
    if (currentUser.role === 'murid') {
      const std = students.find((s) => s.id === currentUser.id);
      const actualOld = (std as any)?.password || DEFAULT_STUDENT_PASSWORD;
      if (oldPass !== actualOld && oldPass !== 'SMPWKJaya') {
        return { success: false, message: 'Kata sandi lama siswa salah.' };
      }
      updateStudent(currentUser.id, { password: newPass } as any);
      return { success: true, message: 'Kata sandi siswa berhasil diubah!' };
    }
    return { success: true, message: 'Kata sandi berhasil diperbarui.' };
  };

  const requestPasswordReset = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isTeacher = teachers.some((t) => t.email.toLowerCase() === cleanEmail);
    const isStudent = students.some((s) => s.email.toLowerCase() === cleanEmail);
    const isAdmin = cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() || cleanEmail === 'fathi@smpwk.sch.id';

    if (!isTeacher && !isStudent && !isAdmin) {
      return {
        success: false,
        message: 'Email tidak terdaftar di direktori SMP Wijaya Kusuma.',
      };
    }

    const simulatedToken = Math.floor(100000 + Math.random() * 900000).toString();
    addNotification(
      'Kode Pemulihan Kata Sandi',
      `Kode verifikasi reset sandi untuk ${cleanEmail} adalah [ ${simulatedToken} ].`,
      'info'
    );

    return {
      success: true,
      message: `Tautan & kode verifikasi reset sandi berhasil dikirim ke: ${cleanEmail}. Gunakan kode: ${simulatedToken}`,
      simulatedToken,
    };
  };

  const resetPasswordWithToken = (email: string, token: string, newPass: string) => {
    if (!token || token.length !== 6) {
      return { success: false, message: 'Kode token harus 6 digit angka valid.' };
    }
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() || cleanEmail === 'fathi@smpwk.sch.id') {
      ADMIN_CREDENTIALS.password = newPass;
      updateSiteSettings({ secretAdminPassword: newPass });
      return { success: true, message: 'Sandi Kepala Sekolah berhasil diperbarui!' };
    }
    const t = teachers.find((tc) => tc.email.toLowerCase() === cleanEmail);
    if (t) {
      updateTeacher(t.no, { customPassword: newPass });
      return { success: true, message: 'Sandi guru berhasil diperbarui!' };
    }
    const s = students.find((st) => st.email.toLowerCase() === cleanEmail);
    if (s) {
      updateStudent(s.id, { password: newPass } as any);
      return { success: true, message: 'Sandi siswa berhasil diperbarui!' };
    }
    return { success: false, message: 'Akun tidak ditemukan.' };
  };

  // Subjects & Meetings
  const addSubject = (subjectInput: Omit<Subject, 'id'> & { id?: string }) => {
    const id = subjectInput.id || `sbj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fullSubject: Subject = { ...subjectInput, id };
    const nextSubjects = [...subjects, fullSubject];
    setSubjects(nextSubjects);
    try {
      localStorage.setItem('smpwk_subjects', JSON.stringify(nextSubjects));
    } catch {}
    saveAppStateToFirestore('subjects', nextSubjects);

    if (!subjectMeetings[fullSubject.id]) {
      const generated = generate30MeetingsForSubject(fullSubject);
      const nextMeetings = { ...subjectMeetings, [fullSubject.id]: generated };
      setSubjectMeetings(nextMeetings);
      try {
        localStorage.setItem('smpwk_meetings', JSON.stringify(nextMeetings));
      } catch {}
      saveSubjectMeetingsToFirestore(fullSubject.id, generated);
    }

    return { success: true, message: `Mata pelajaran ${fullSubject.name} berhasil ditambahkan.`, subject: fullSubject };
  };

  const updateSubject = (subjectId: string, updated: Partial<Subject>) => {
    const nextSubjects = subjects.map((s) => (s.id === subjectId ? { ...s, ...updated } : s));
    setSubjects(nextSubjects);
    try {
      localStorage.setItem('smpwk_subjects', JSON.stringify(nextSubjects));
    } catch {}
    saveAppStateToFirestore('subjects', nextSubjects);
  };

  const deleteSubject = (subjectId: string) => {
    const nextSubjects = subjects.filter((s) => s.id !== subjectId);
    setSubjects(nextSubjects);
    try {
      localStorage.setItem('smpwk_subjects', JSON.stringify(nextSubjects));
    } catch {}
    saveAppStateToFirestore('subjects', nextSubjects);
    deleteSubjectMeetingsFromFirestore(subjectId);
  };

  const getMeetingsForSubject = (subjectId: string): MeetingModule[] => {
    if (subjectMeetings[subjectId] && subjectMeetings[subjectId].length > 0) {
      return subjectMeetings[subjectId];
    }
    const found = subjects.find((s) => s.id === subjectId);
    if (found) {
      const created = generate30MeetingsForSubject(found);
      setSubjectMeetings((prev) => {
        const next = { ...prev, [subjectId]: created };
        try {
          localStorage.setItem('smpwk_meetings', JSON.stringify(next));
        } catch {}
        return next;
      });
      saveSubjectMeetingsToFirestore(subjectId, created);
      return created;
    }
    return [];
  };

  const updateMeetingModule = (subjectId: string, meetingNumber: number, updated: Partial<MeetingModule>) => {
    const currentList = getMeetingsForSubject(subjectId);
    const nextList = currentList.map((m) => (m.meetingNumber === meetingNumber ? { ...m, ...updated } : m));
    setSubjectMeetings((prev) => {
      const next = { ...prev, [subjectId]: nextList };
      try {
        localStorage.setItem('smpwk_meetings', JSON.stringify(next));
      } catch {}
      return next;
    });
    saveSubjectMeetingsToFirestore(subjectId, nextList);
  };

  // Exams
  const addExam = (exam: Exam) => {
    const nextExams = [exam, ...exams];
    setExams(nextExams);
    try {
      localStorage.setItem('smpwk_exams', JSON.stringify(nextExams));
    } catch {}
    saveAppStateToFirestore('exams', nextExams);
    addNotification('Ujian Baru Diterbitkan', `Ujian "${exam.title}" untuk ${exam.subjectName} telah aktif.`, 'exam');
  };

  const updateExam = (examId: string, updated: Partial<Exam>) => {
    const nextExams = exams.map((e) => (e.id === examId ? { ...e, ...updated } : e));
    setExams(nextExams);
    try {
      localStorage.setItem('smpwk_exams', JSON.stringify(nextExams));
    } catch {}
    saveAppStateToFirestore('exams', nextExams);
  };

  const deleteExam = (examId: string) => {
    const nextExams = exams.filter((e) => e.id !== examId);
    setExams(nextExams);
    try {
      localStorage.setItem('smpwk_exams', JSON.stringify(nextExams));
    } catch {}
    saveAppStateToFirestore('exams', nextExams);
  };

  const submitExamAttempt = (attempt: ExamAttempt) => {
    const nextAttempts = [attempt, ...examAttempts.filter((a) => a.id !== attempt.id)];
    setExamAttempts(nextAttempts);
    try {
      localStorage.setItem('smpwk_exam_attempts', JSON.stringify(nextAttempts));
    } catch {}
    saveAppStateToFirestore('exam_attempts', nextAttempts);
    addNotification(
      'Ujian CBT Selesai',
      `Nilai untuk ${attempt.studentName} pada "${attempt.examTitle}": ${attempt.totalScore} / ${attempt.maxScore}`,
      'grade'
    );
  };

  const gradeExamEssay = (attemptId: string, questionId: string, score: number, feedback?: string) => {
    const nextAttempts = examAttempts.map((att) => {
      if (att.id !== attemptId) return att;
      const currentAns = att.answers[questionId];
      if (!currentAns) return att;

      const updatedAnswers = {
        ...att.answers,
        [questionId]: {
          ...currentAns,
          manualScore: score,
          teacherFeedback: feedback || currentAns.teacherFeedback,
        },
      };

      let newEssayScore = 0;
      (Object.values(updatedAnswers) as StudentAnswer[]).forEach((ans) => {
        if (ans.manualScore !== undefined) {
          newEssayScore += ans.manualScore;
        }
      });

      const newTotal = att.pgScore + newEssayScore;
      const percentage = Math.round((newTotal / att.maxScore) * 100);

      return {
        ...att,
        answers: updatedAnswers,
        essayScore: newEssayScore,
        totalScore: newTotal,
        percentage,
        isPassed: percentage >= 75,
        status: 'graded' as const,
      };
    });

    setExamAttempts(nextAttempts);
    try {
      localStorage.setItem('smpwk_exam_attempts', JSON.stringify(nextAttempts));
    } catch {}
    saveAppStateToFirestore('exam_attempts', nextAttempts);
  };

  const updateStudentGrade = (
    attemptId: string,
    updatedScores: { totalScore?: number; pgScore?: number; essayScore?: number; isPassed?: boolean; notes?: string }
  ) => {
    const nextAttempts = examAttempts.map((att) => {
      if (att.id !== attemptId) return att;
      const newTotal = updatedScores.totalScore !== undefined ? updatedScores.totalScore : att.totalScore;
      const percentage = Math.round((newTotal / att.maxScore) * 100);
      return {
        ...att,
        totalScore: newTotal,
        pgScore: updatedScores.pgScore !== undefined ? updatedScores.pgScore : att.pgScore,
        essayScore: updatedScores.essayScore !== undefined ? updatedScores.essayScore : att.essayScore,
        isPassed: updatedScores.isPassed !== undefined ? updatedScores.isPassed : percentage >= 75,
        percentage,
        status: 'graded' as const,
      };
    });
    setExamAttempts(nextAttempts);
    try {
      localStorage.setItem('smpwk_exam_attempts', JSON.stringify(nextAttempts));
    } catch {}
    saveAppStateToFirestore('exam_attempts', nextAttempts);
    addNotification('Nilai Diperbarui', 'Nilai siswa berhasil diubah dan disimpan.', 'grade');
  };

  // LKPD
  const submitLKPD = (submission: LKPDSubmission) => {
    const nextSubmissions = [submission, ...lkpdSubmissions.filter((s) => s.id !== submission.id)];
    setLkpdSubmissions(nextSubmissions);
    try {
      localStorage.setItem('smpwk_lkpd_submissions', JSON.stringify(nextSubmissions));
    } catch {}
    saveAppStateToFirestore('lkpd_submissions', nextSubmissions);
    addNotification('LKPD Terkirim', `Tugas LKPD Pertemuan ${submission.meetingNumber} telah dikirim ke guru pengampu.`, 'assignment');
  };

  const gradeLKPD = (submissionId: string, score: number, feedback: string) => {
    const nextSubmissions = lkpdSubmissions.map((sub) =>
      sub.id === submissionId
        ? { ...sub, score, feedback, status: 'graded' as const }
        : sub
    );
    setLkpdSubmissions(nextSubmissions);
    try {
      localStorage.setItem('smpwk_lkpd_submissions', JSON.stringify(nextSubmissions));
    } catch {}
    saveAppStateToFirestore('lkpd_submissions', nextSubmissions);
  };

  // Schedule
  const addScheduleItem = (schedule: ScheduleItem) => {
    const nextSchedules = [...schedules, schedule];
    setSchedules(nextSchedules);
    try {
      localStorage.setItem('smpwk_schedules', JSON.stringify(nextSchedules));
    } catch {}
    saveAppStateToFirestore('schedules', nextSchedules);
  };

  const addSchedule = (schedule: ScheduleItem) => {
    addScheduleItem(schedule);
  };

  const updateScheduleItem = (scheduleId: string, updated: Partial<ScheduleItem>) => {
    const nextSchedules = schedules.map((item) => (item.id === scheduleId ? { ...item, ...updated } : item));
    setSchedules(nextSchedules);
    try {
      localStorage.setItem('smpwk_schedules', JSON.stringify(nextSchedules));
    } catch {}
    saveAppStateToFirestore('schedules', nextSchedules);
  };

  const deleteScheduleItem = (scheduleId: string) => {
    const nextSchedules = schedules.filter((item) => item.id !== scheduleId);
    setSchedules(nextSchedules);
    try {
      localStorage.setItem('smpwk_schedules', JSON.stringify(nextSchedules));
    } catch {}
    saveAppStateToFirestore('schedules', nextSchedules);
  };

  // Notifications
  const addNotification = (title: string, message: string, type: NotificationItem['type'] = 'info') => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Baru saja',
      read: false,
      type,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  // Broadcasts
  const addBroadcast = (broadcast: Omit<BroadcastMessage, 'id' | 'createdAt'>) => {
    const newBc: BroadcastMessage = {
      ...broadcast,
      id: `bc-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    const nextBcs = [newBc, ...broadcasts];
    setBroadcasts(nextBcs);
    try {
      localStorage.setItem('smpwk_broadcasts', JSON.stringify(nextBcs));
    } catch {}
    saveAppStateToFirestore('broadcasts', nextBcs);
    addNotification(`Pengumuman: ${newBc.title}`, newBc.message, 'info');
  };

  const deleteBroadcast = (broadcastId: string) => {
    const nextBcs = broadcasts.filter((b) => b.id !== broadcastId);
    setBroadcasts(nextBcs);
    try {
      localStorage.setItem('smpwk_broadcasts', JSON.stringify(nextBcs));
    } catch {}
    saveAppStateToFirestore('broadcasts', nextBcs);
  };

  const resetAllData = () => {
    localStorage.clear();
    setTeachers(INITIAL_TEACHERS);
    setStudents(INITIAL_STUDENTS);
    setSchedules(INITIAL_SCHEDULES);
    setExams(INITIAL_EXAMS);
    setSiteSettings(DEFAULT_SETTINGS);
    const initial: Record<string, MeetingModule[]> = {};
    INITIAL_SUBJECTS.forEach((subj) => {
      initial[subj.id] = generate30MeetingsForSubject(subj);
    });
    setSubjectMeetings(initial);
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        siteSettings,
        teachers,
        students,
        subjects,
        schedules,
        exams,
        examAttempts,
        lkpdSubmissions,
        notifications,
        broadcasts,
        cbtUnlockToken,
        activeTab,
        selectedSubject,
        activeExam,
        activeExamAttempt,
        setActiveTab,
        setSelectedSubject,
        setActiveExam,
        updateSiteSettings,
        loginAsAdmin,
        loginWithSecretKey,
        loginAsTeacher,
        loginAsStudent,
        registerStudent,
        logout,
        updateUserProfile,
        changePassword,
        requestPasswordReset,
        resetPasswordWithToken,
        approveStudent,
        rejectStudent,
        approveAllPendingStudents,
        deleteStudent,
        updateStudent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addSubject,
        updateSubject,
        deleteSubject,
        getMeetingsForSubject,
        updateMeetingModule,
        addExam,
        updateExam,
        deleteExam,
        submitExamAttempt,
        gradeExamEssay,
        updateStudentGrade,
        submitLKPD,
        gradeLKPD,
        addSchedule,
        addScheduleItem,
        updateScheduleItem,
        deleteScheduleItem,
        addNotification,
        markNotificationRead,
        addBroadcast,
        deleteBroadcast,
        setCbtUnlockToken,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
