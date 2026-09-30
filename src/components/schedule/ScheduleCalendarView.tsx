import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScheduleItem } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Plus,
  CheckCircle2,
  Edit2,
  Trash2,
  Sparkles,
  Bell,
  BellRing,
  Download,
  Smartphone,
  School,
  LogIn,
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

export const ScheduleCalendarView: React.FC = () => {
  const { currentUser, schedules, subjects, addSchedule, updateScheduleItem, deleteScheduleItem } = useApp();
  const [selectedDay, setSelectedDay] = useState<string>('Senin');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('Semua');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'admin' | 'teacher' | 'student' | 'register'>('student');

  // Notification State
  const [isNotificationEnabled, setIsNotificationEnabled] = useState<boolean>(() => {
    return localStorage.getItem('smpwk_notif_enabled') === 'true';
  });
  const [showCalendarSyncModal, setShowCalendarSyncModal] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Schedule form state
  const [formDay, setFormDay] = useState<string>('Senin');
  const [formSubjectName, setFormSubjectName] = useState<string>('');
  const [formStartTime, setFormStartTime] = useState<string>('07:30');
  const [formEndTime, setFormEndTime] = useState<string>('09:00');
  const [formClassGroup, setFormClassGroup] = useState<string>('Kelas 7');
  const [formRoom, setFormRoom] = useState<string>('Ruang Teori 7-A');
  const [formTeacherName, setFormTeacherName] = useState<string>('');

  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Filter schedules
  const filteredSchedules = schedules.filter((sch) => {
    const matchesDay = sch.day === selectedDay;
    if (currentUser?.role === 'guru') {
      const matchesTeacher = sch.teacherEmail === currentUser.email || sch.teacherName === currentUser.name;
      return matchesDay && matchesTeacher;
    }
    const matchesClass =
      selectedClassFilter === 'Semua' ||
      (sch.classGroup || sch.className || '').toLowerCase().includes(selectedClassFilter.toLowerCase());
    return matchesDay && matchesClass;
  });

  const openCreateModal = () => {
    if (!currentUser) {
      setAuthMode('teacher');
      setIsAuthOpen(true);
      return;
    }
    setEditingScheduleId(null);
    setFormDay(selectedDay);
    setFormSubjectName(subjects[0]?.name || 'Bahasa Sunda (Muatan Lokal)');
    setFormStartTime('07:30');
    setFormEndTime('09:00');
    setFormClassGroup(currentUser?.rombel || 'Kelas 7');
    setFormRoom('Ruang Teori 7-A');
    setFormTeacherName(currentUser?.name || 'Dewan Guru SMPWK');
    setShowModal(true);
  };

  const openEditModal = (sch: ScheduleItem) => {
    if (!currentUser) {
      setAuthMode('teacher');
      setIsAuthOpen(true);
      return;
    }
    setEditingScheduleId(sch.id);
    setFormDay(sch.day);
    setFormSubjectName(sch.subjectName);
    setFormStartTime(sch.startTime || sch.timeStart || '07:30');
    setFormEndTime(sch.endTime || sch.timeEnd || '09:00');
    setFormClassGroup(sch.classGroup || sch.className || 'Kelas 7');
    setFormRoom(sch.room);
    setFormTeacherName(sch.teacherName);
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingScheduleId) {
      updateScheduleItem(editingScheduleId, {
        day: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        subjectName: formSubjectName,
        classGroup: formClassGroup,
        room: formRoom,
        teacherName: formTeacherName,
      });
    } else {
      const newSch: ScheduleItem = {
        id: `sch-${Date.now()}`,
        day: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        subjectId: `sbj-custom-${Date.now()}`,
        subjectName: formSubjectName,
        classGroup: formClassGroup,
        room: formRoom,
        teacherName: formTeacherName || (currentUser?.role === 'guru' ? currentUser.name : 'Guru Pengampu'),
        teacherEmail: currentUser?.email || 'guru@smpwk.sch.id',
      };
      addSchedule(newSch);
    }
    setShowModal(false);
  };

  // Export .ICS file for Apple/Google/Android Calendars
  const downloadICSFile = () => {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//LMS SMP WK//Jadwal Pelajaran SMP Wijaya Kusuma//ID\nCALSCALE:GREGORIAN\n`;
    schedules.forEach((sch) => {
      const startClean = (sch.startTime || '07:30').replace(/:/g, '') + '00';
      const endClean = (sch.endTime || '09:00').replace(/:/g, '') + '00';
      icsContent += `BEGIN:VEVENT\n`;
      icsContent += `SUMMARY:[LMS SMP WK] ${sch.subjectName || 'Pelajaran'} (${sch.classGroup || 'Umum'})\n`;
      icsContent += `DESCRIPTION:Pengampu: ${sch.teacherName || '-'} | Ruang: ${sch.room || '-'}\n`;
      icsContent += `LOCATION:${sch.room || 'SMP Wijaya Kusuma'}, SMP Wijaya Kusuma\n`;
      icsContent += `DTSTART;TZID=Asia/Jakarta:20260901T${startClean}\n`;
      icsContent += `DTEND;TZID=Asia/Jakarta:20260901T${endClean}\n`;
      icsContent += `RRULE:FREQ=WEEKLY;BYDAY=${sch.day === 'Senin' ? 'MO' : sch.day === 'Selasa' ? 'TU' : sch.day === 'Rabu' ? 'WE' : sch.day === 'Kamis' ? 'TH' : sch.day === 'Jumat' ? 'FR' : 'SA'}\n`;
      icsContent += `BEGIN:VALARM\nTRIGGER:-PT15M\nACTION:DISPLAY\nDESCRIPTION:Pengingat Pelajaran ${sch.subjectName || 'Pelajaran'}\nEND:VALARM\n`;
      icsContent += `END:VEVENT\n`;
    });
    icsContent += `END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Jadwal_Pelajaran_SMPWK_${(currentUser?.name || 'Siswa').replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSyncToast('Berkas Kalender (.ics) berhasil diunduh! Buka berkas untuk menyinkronkan ke kalender ponsel.');
    setTimeout(() => setSyncToast(null), 4000);
  };

  const handleToggleNotification = async () => {
    if (!isNotificationEnabled) {
      if ('Notification' in window) {
        try {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') {
            setSyncToast('Izin notifikasi belum diaktifkan di browser Anda.');
            setTimeout(() => setSyncToast(null), 3000);
            return;
          }
        } catch {}
      }
      setIsNotificationEnabled(true);
      localStorage.setItem('smpwk_notif_enabled', 'true');
      setSyncToast('Pengingat jadwal pelajaran ponsel berhasil diaktifkan!');
      setTimeout(() => setSyncToast(null), 4000);
    } else {
      setIsNotificationEnabled(false);
      localStorage.setItem('smpwk_notif_enabled', 'false');
      setSyncToast('Pengingat dinonaktifkan.');
      setTimeout(() => setSyncToast(null), 3000);
    }
  };

  return (
    <div id="schedule-calendar-view" className="space-y-3.5 pb-12 animate-in fade-in">
      {/* Toast Notification */}
      {syncToast && (
        <div className="p-3 bg-blue-600 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in zoom-in-95">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncToast}</span>
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-4 sm:p-5 text-white shadow-xl space-y-2.5 border border-blue-600/50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/20">
              <CalendarIcon className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight">Jadwal Pelajaran Harian</h2>
              <p className="text-[11px] text-blue-100 font-medium">SMP Wijaya Kusuma • Kelas 7, 8, dan 9</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowCalendarSyncModal(true)}
              className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold flex items-center gap-1 backdrop-blur-xs transition-colors cursor-pointer border border-white/25"
              title="Sinkronisasi Kalender Ponsel"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-300" />
              <span>Sync Kalender</span>
            </button>
            {(currentUser?.role === 'guru' || currentUser?.role === 'admin') && (
              <button
                id="btn-add-schedule-item"
                onClick={openCreateModal}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1 shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Jadwal</span>
              </button>
            )}
          </div>
        </div>

        {/* Sync & Notification Quick Bar */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
          <button
            onClick={handleToggleNotification}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              isNotificationEnabled
                ? 'bg-blue-500/30 text-blue-200 border border-blue-400/40'
                : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/15'
            }`}
          >
            {isNotificationEnabled ? <BellRing className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> : <Bell className="w-3.5 h-3.5" />}
            <span>{isNotificationEnabled ? 'Pengingat Pelajaran: Aktif' : 'Aktifkan Pengingat Ponsel'}</span>
          </button>
          <span className="text-[10px] text-blue-200">
            {currentUser?.role === 'guru' ? 'Dewan Guru' : currentUser?.role === 'admin' ? 'Kepala Sekolah' : 'Peserta Didik'}
          </span>
        </div>
      </div>

      {/* Days Tabs */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-700">Pilih Hari Pelajaran:</span>
          <span className="text-[10px] text-blue-700 font-bold">{filteredSchedules.length} Mata Pelajaran</span>
        </div>
        <div className="grid grid-cols-6 gap-1 bg-slate-200/70 p-1 rounded-2xl">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              id={`tab-day-${day.toLowerCase()}`}
              onClick={() => setSelectedDay(day)}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                selectedDay === day
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/80 text-slate-700 hover:bg-white'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Class filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] font-bold text-slate-500 shrink-0">Filter Kelas:</span>
        {['Semua', 'Kelas 7', 'Kelas 8', 'Kelas 9'].map((cls) => (
          <button
            key={cls}
            onClick={() => setSelectedClassFilter(cls)}
            className={`px-3 py-1 rounded-xl font-bold shrink-0 text-[11px] transition-colors cursor-pointer ${
              selectedClassFilter === cls
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cls}
          </button>
        ))}
      </div>

      {/* Schedule Items List */}
      <div className="space-y-2.5">
        {filteredSchedules.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
            <CalendarIcon className="w-9 h-9 mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-700">Tidak ada jadwal pada hari {selectedDay} ({selectedClassFilter})</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Silakan pilih hari atau filter kelas yang lain untuk melihat jadwal pelajaran SMP Wijaya Kusuma.
            </p>
          </div>
        ) : (
          filteredSchedules.map((sch) => (
            <div
              key={sch.id}
              className="p-3.5 bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all space-y-2 relative group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-extrabold text-[10px] border border-blue-200">
                      {sch.classGroup || sch.className || 'Semua Kelas'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>{sch.startTime || sch.timeStart} - {sch.endTime || sch.timeEnd} WIB</span>
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 pt-0.5">{sch.subjectName}</h4>
                </div>

                {(currentUser?.role === 'guru' || currentUser?.role === 'admin') && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(sch)}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Edit Jadwal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteScheduleItem(sch.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {sch.topic && (
                <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-700">Materi Pokok: </span>
                  {sch.topic}
                </p>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{sch.teacherName}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 shrink-0 font-medium">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  <span>{sch.room}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SYNC CALENDAR MODAL */}
      {showCalendarSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white flex items-center justify-between">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-300" />
                <span>Sinkronisasi Kalender Ponsel Siswa & Guru</span>
              </h4>
              <button
                onClick={() => setShowCalendarSyncModal(false)}
                className="text-white/80 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3.5 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-1.5 text-slate-700">
                <p className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pengingat Jadwal Pelajaran Otomatis di Ponsel</span>
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Ponsel Anda akan otomatis memunculkan alarm/notifikasi sebelum jam mata pelajaran dimulai agar siswa dan guru tidak ketinggalan jadwal kelas SMP Wijaya Kusuma.
                </p>
              </div>

              {/* Push Notification Switch */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Notifikasi Browser / Ponsel</h5>
                  <p className="text-[10px] text-slate-500">Muncul di status bar ponsel sebelum mapel</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleNotification}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    isNotificationEnabled ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      isNotificationEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Download .ICS */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={downloadICSFile}
                  className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Download Kalender (.ICS File)</span>
                </button>
                <p className="text-[10px] text-slate-500 text-center">
                  Kompatibel dengan Google Calendar, Apple Calendar, Samsung Calendar & Outlook.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowCalendarSyncModal(false)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT SCHEDULE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white flex items-center justify-between">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4" />
                <span>{editingScheduleId ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}</span>
              </h4>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white font-bold p-1 cursor-pointer">
                ✕
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hari Pelajaran:</label>
                <select
                  value={formDay}
                  onChange={(e) => setFormDay(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold"
                >
                  {daysOfWeek.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Mata Pelajaran:</label>
                <input
                  type="text"
                  value={formSubjectName}
                  onChange={(e) => setFormSubjectName(e.target.value)}
                  placeholder="Contoh: Bahasa Sunda (Muatan Lokal)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Mulai:</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Selesai:</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rombel / Kelas:</label>
                  <select
                    value={formClassGroup}
                    onChange={(e) => setFormClassGroup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold"
                  >
                    <option value="Kelas 7">Kelas 7</option>
                    <option value="Kelas 8">Kelas 8</option>
                    <option value="Kelas 9">Kelas 9</option>
                    <option value="Semua Kelas">Semua Kelas</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ruangan / Lab:</label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="Contoh: Ruang Teori 7-A"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Guru Pengampu:</label>
                <input
                  type="text"
                  value={formTeacherName}
                  onChange={(e) => setFormTeacherName(e.target.value)}
                  placeholder="Nama guru mata pelajaran"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  required
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {editingScheduleId ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};
