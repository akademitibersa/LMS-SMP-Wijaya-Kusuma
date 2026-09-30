import React, { useState } from 'react';
import { Subject, MeetingModule, LKPDSubmission } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  ChevronLeft,
  BookOpen,
  FileText,
  CheckCircle2,
  Clock,
  Send,
  Upload,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Award,
  Layers,
  School,
  Languages,
} from 'lucide-react';

interface SubjectDetailViewProps {
  subject: Subject;
  onBack: () => void;
}

export const SubjectDetailView: React.FC<SubjectDetailViewProps> = ({ subject, onBack }) => {
  const { currentUser, getMeetingsForSubject, submitLKPD, lkpdSubmissions } = useApp();
  const meetings = getMeetingsForSubject(subject.id);
  const [activeMeetingNumber, setActiveMeetingNumber] = useState<number>(1);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeMeeting: MeetingModule =
    meetings.find((m) => m.meetingNumber === activeMeetingNumber) || meetings[0];

  const currentLKPD = activeMeeting.lkpd;

  // Check if current user has already submitted this meeting's LKPD
  const existingSubmission: LKPDSubmission | undefined = lkpdSubmissions.find(
    (sub) =>
      sub.subjectId === subject.id &&
      sub.meetingNumber === activeMeetingNumber &&
      (sub.studentId === currentUser?.id || sub.studentEmail === currentUser?.email)
  );

  const isSunda = subject.id === 'sbj-sunda' || subject.name.toLowerCase().includes('sunda');

  const handleSubmitLKPD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText.trim()) return;

    const newSub: LKPDSubmission = {
      id: `sub-${Date.now()}`,
      subjectId: subject.id,
      subjectName: subject.name,
      meetingNumber: activeMeetingNumber,
      studentId: currentUser?.id || `guest-${Date.now()}`,
      studentName: currentUser?.name || 'Peserta Didik SMP Wijaya Kusuma',
      studentClass: currentUser?.rombel || 'Kelas 7',
      studentEmail: currentUser?.email || 'siswa@smpwk.sch.id',
      content: submissionText.trim(),
      fileName: submissionFileName || undefined,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'submitted',
    };

    submitLKPD(newSub);
    setSubmissionText('');
    setSubmissionFileName('');
    setToastMessage(
      isSunda
        ? `Pancén LKPD Lawungan ka-${activeMeetingNumber} parantos kasimpen sarta dikintunkeun ka guru pangampu!`
        : `Tugas LKPD Pertemuan ${activeMeetingNumber} berhasil diserahkan kepada guru pengampu!`
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div id="subject-detail-view" className="space-y-4 pb-12 animate-in fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in zoom-in-95">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </span>
        </div>
      )}

      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 border border-slate-200 shadow-xs cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Mapel</span>
        </button>

        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-xl">
          {subject.category} • {subject.targetClasses?.join(', ')}
        </span>
      </div>

      {/* Subject Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden space-y-3 border border-blue-600/50">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-blue-100 font-mono text-[10px] font-bold">
                {subject.code}
              </span>
              <span className="text-xs text-blue-200 font-medium">SMP Wijaya Kusuma</span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
              {subject.name}
            </h2>
            <p className="text-xs text-blue-100/90 leading-relaxed max-w-2xl">
              {subject.description}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/15 p-2 backdrop-blur-xs border border-white/25 flex items-center justify-center shrink-0">
            {isSunda ? <Languages className="w-7 h-7 text-amber-300" /> : <BookOpen className="w-7 h-7 text-amber-300" />}
          </div>
        </div>

        <div className="pt-2 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-blue-100">
            <span className="text-slate-300">Guru Pengampu:</span>
            <strong className="text-white font-bold">{subject.teacherName}</strong>
            <span className="text-blue-300 font-mono text-[10px]">({subject.teacherEmail})</span>
          </div>
          <span className="text-amber-300 font-bold bg-white/10 px-2.5 py-0.5 rounded-lg text-[11px]">
            30 Pertemuan Lengkap & LKPD
          </span>
        </div>
      </div>

      {/* Meeting Selector Bar (1 to 30) */}
      <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Pilih Nomor Pertemuan (1 - 30):</span>
          </span>
          <span className="text-[11px] font-bold text-blue-700 font-mono">
            Sedang Dibuka: Pertemuan {activeMeetingNumber}
          </span>
        </div>

        {/* Scrollable pill buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
          {meetings.map((m) => {
            const isSelected = m.meetingNumber === activeMeetingNumber;
            return (
              <button
                key={m.meetingNumber}
                type="button"
                onClick={() => setActiveMeetingNumber(m.meetingNumber)}
                className={`w-9 h-9 rounded-xl font-bold text-xs shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={`Pertemuan ${m.meetingNumber}: ${m.title}`}
              >
                {m.meetingNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Meeting Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Learning Objectives & Detailed Theory */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header Title */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {activeMeeting.theme}
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 mt-1">
                  {activeMeeting.title}
                </h3>
              </div>
            </div>

            {/* Learning Objective */}
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs space-y-1 text-slate-800 leading-relaxed">
              <span className="font-extrabold text-blue-900 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span>{isSunda ? 'Tujuan & Capaian Pangajaran:' : 'Tujuan & Capaian Pembelajaran:'}</span>
              </span>
              <p>{activeMeeting.learningObjective}</p>
            </div>

            {/* Theory Summary */}
            <div className="space-y-1.5 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isSunda ? 'Ringkesan Materi Lawungan:' : 'Ringkasan Materi Pertemuan:'}</span>
              </h4>
              <p className="whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200 text-slate-800">
                {activeMeeting.theorySummary}
              </p>
            </div>

            {/* Detailed Content */}
            <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-900">
                {isSunda ? 'Pedaran Lengkep Materi:' : 'Rincian Materi & Bahan Bacaan:'}
              </h4>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl whitespace-pre-line leading-relaxed text-slate-800 text-xs">
                {activeMeeting.detailedContent}
              </div>
            </div>

            {/* Reference Resources */}
            {activeMeeting.referenceResources && activeMeeting.referenceResources.length > 0 && (
              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-700 block">Sumber & Bahan Rujukan Belajar:</span>
                <div className="flex flex-wrap gap-2">
                  {activeMeeting.referenceResources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 border border-slate-200 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{res.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive LKPD Task Submission */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {currentLKPD.title}
                </h4>
                <span className="text-[10px] text-slate-400">
                  Bobot Nilai Maksimal: {currentLKPD.maxScore} Poin
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {currentLKPD.description}
            </p>

            {/* Instructions */}
            <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs space-y-1.5 text-slate-800">
              <span className="font-bold text-blue-950 block">
                {isSunda ? 'Pituduh Migawé Pancén:' : 'Petunjuk Pengerjaan LKPD:'}
              </span>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700">
                {currentLKPD.instructions.map((ins, idx) => (
                  <li key={idx} className="leading-snug">
                    {ins}
                  </li>
                ))}
              </ol>
            </div>

            {/* Existing Submission Status */}
            {existingSubmission ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tugas LKPD Telah Dikirim</span>
                  </span>
                  <span className="text-[10px] bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                    {existingSubmission.status === 'graded' ? `Nilai: ${existingSubmission.score}/100` : 'Menunggu Nilai'}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-100 text-slate-800 text-[11px]">
                  <strong>Jawaban Terkirim:</strong>
                  <p className="mt-1 leading-relaxed">"{existingSubmission.content}"</p>
                </div>
                {existingSubmission.feedback && (
                  <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-900">
                    <strong>Catatan / Umpan Balik Guru:</strong> {existingSubmission.feedback}
                  </div>
                )}
                <span className="text-[10px] text-slate-400 block font-mono">
                  Dikirim pada: {existingSubmission.submittedAt}
                </span>
              </div>
            ) : (
              /* Submission Form */
              <form onSubmit={handleSubmitLKPD} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isSunda ? 'Tuliskeun Waleran / Laporan Tugas:' : 'Tuliskan Jawaban / Laporan LKPD:'}
                  </label>
                  <textarea
                    rows={4}
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder={
                      isSunda
                        ? 'Ketikkeun waleran eksplorasi anjeun di dieu...'
                        : 'Ketikkan hasil analisis dan jawaban LKPD Anda di sini...'
                    }
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-2xl p-3 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Berkas Lampiran (Opsional):
                  </label>
                  <input
                    type="text"
                    value={submissionFileName}
                    onChange={(e) => setSubmissionFileName(e.target.value)}
                    placeholder="Contoh: LKPD-1-NamaSiswa.pdf / foto catatan"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirimkan Tugas LKPD Pertemuan {activeMeetingNumber}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
