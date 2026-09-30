import { SiteSettings, User, MeetingModule } from '../types';

export interface PilihanJawaban {
  key: string;
  text: string;
}

export interface BankSoalDoc {
  id: string;
  pertanyaan: string;
  pilihanJawaban: PilihanJawaban[];
  jawabanBenar: string;
  kategori: string;
  bobotNilai: number;
  status: 'aktif' | 'nonaktif';
  orderIndex: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface PendaftarDoc {
  id: string;
  nama: string;
  nisn: string;
  asalSekolah: string;
  jurusan: string;
  email?: string;
  phone?: string;
  statusVerifikasi: 'pending' | 'terverifikasi' | 'ditolak';
  createdAt: any;
}

export interface HasilUjianDoc {
  id: string;
  idPendaftar: string;
  namaSiswa: string;
  jurusan?: string;
  jawaban: Record<string, string>;
  skorAkhir: number;
  totalSoal: number;
  status: 'mengerjakan' | 'selesai';
  waktuMulai: string;
  waktuSelesai?: string;
  updatedAt?: any;
}

// In-memory & LocalStorage state handlers with cross-tab BroadcastChannel
const STORAGE_PREFIX = 'smpwk_db_';
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('smpwk_channel');
  }
} catch {}

const getLocalItem = <T>(key: string, defaultVal: T): T => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setLocalItem = (key: string, val: any) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
    broadcastChannel?.postMessage({ type: 'SYNC', key, val });
  } catch (e) {
    console.warn('Storage set notice:', e);
  }
};

export const subscribeSiteSettings = (
  onData: (settings: Partial<SiteSettings>) => void,
  _onError?: (error: Error) => void
): (() => void) => {
  const current = getLocalItem<Partial<SiteSettings>>('site_settings', {});
  onData(current);

  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_PREFIX + 'site_settings' && e.newValue) {
      try {
        onData(JSON.parse(e.newValue));
      } catch {}
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
};

export const saveSiteSettingsToFirestore = async (
  settings: Partial<SiteSettings>
): Promise<void> => {
  setLocalItem('site_settings', settings);
};

export const subscribeAppState = <T>(
  key: string,
  onData: (data: T) => void,
  _onError?: (error: Error) => void
): (() => void) => {
  const current = getLocalItem<T>(`app_state_${key}`, null as any);
  if (current !== null) {
    onData(current);
  }

  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_PREFIX + `app_state_${key}` && e.newValue) {
      try {
        onData(JSON.parse(e.newValue));
      } catch {}
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
};

export const saveAppStateToFirestore = async (
  key: string,
  data: any
): Promise<void> => {
  setLocalItem(`app_state_${key}`, data);
};

export const saveUserProfileToFirestore = async (user: User): Promise<void> => {
  setLocalItem(`user_${user.id}`, user);
};

export const subscribeSubjectMeetings = (
  subjectId: string,
  onData: (meetings: MeetingModule[]) => void,
  _onError?: (error: Error) => void
): (() => void) => {
  const current = getLocalItem<MeetingModule[]>(`meetings_${subjectId}`, []);
  if (current.length > 0) onData(current);

  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_PREFIX + `meetings_${subjectId}` && e.newValue) {
      try {
        onData(JSON.parse(e.newValue));
      } catch {}
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
};

export const saveSubjectMeetingsToFirestore = async (
  subjectId: string,
  meetings: MeetingModule[]
): Promise<void> => {
  setLocalItem(`meetings_${subjectId}`, meetings);
};

export const deleteSubjectMeetingsFromFirestore = async (subjectId: string): Promise<void> => {
  try {
    localStorage.removeItem(STORAGE_PREFIX + `meetings_${subjectId}`);
  } catch {}
};

export const validateSoalInput = (
  pertanyaan: string,
  pilihanJawaban: PilihanJawaban[],
  jawabanBenar: string
): { isValid: boolean; message: string } => {
  if (!pertanyaan || !pertanyaan.trim()) {
    return { isValid: false, message: 'Pertanyaan tidak boleh kosong.' };
  }
  if (!Array.isArray(pilihanJawaban) || pilihanJawaban.length < 2) {
    return { isValid: false, message: 'Pilihan jawaban minimal harus terdiri dari 2 opsi.' };
  }
  const hasEmptyOption = pilihanJawaban.some((opt) => !opt.text || !opt.text.trim());
  if (hasEmptyOption) {
    return { isValid: false, message: 'Semua teks opsi pilihan jawaban wajib diisi.' };
  }
  const keys = pilihanJawaban.map((opt) => opt.key);
  if (!keys.includes(jawabanBenar)) {
    return { isValid: false, message: `Kunci jawaban (${jawabanBenar}) harus sesuai salah satu opsi.` };
  }
  return { isValid: true, message: '' };
};

const DEFAULT_BANK_SOAL: BankSoalDoc[] = [
  {
    id: 'soal-1',
    pertanyaan: 'Paguneman dina kahirupan sapopoe anu make tatakrama basa Sunda lemes ka saluhureun ngagunakeun kecap...',
    pilihanJawaban: [
      { key: 'A', text: 'Tuang' },
      { key: 'B', text: 'Dahar' },
      { key: 'C', text: 'Hakan' },
      { key: 'D', text: 'Nyatu' },
    ],
    jawabanBenar: 'A',
    kategori: 'Bahasa Sunda (Muatan Lokal)',
    bobotNilai: 20,
    status: 'aktif',
    orderIndex: 1,
  },
  {
    id: 'soal-2',
    pertanyaan: 'Organel sel yang berfungsi sebagai pusat pembangkit energi ATP melalui respirasi seluler adalah...',
    pilihanJawaban: [
      { key: 'A', text: 'Ribosom' },
      { key: 'B', text: 'Mitokondria' },
      { key: 'C', text: 'Badan Golgi' },
      { key: 'D', text: 'Sentriol' },
    ],
    jawabanBenar: 'B',
    kategori: 'IPA Terpadu',
    bobotNilai: 20,
    status: 'aktif',
    orderIndex: 2,
  },
  {
    id: 'soal-3',
    pertanyaan: 'Bentuk sederhana dari operasi aljabar 4(2x - 3) + 5x adalah...',
    pilihanJawaban: [
      { key: 'A', text: '13x - 12' },
      { key: 'B', text: '8x - 12' },
      { key: 'C', text: '13x + 12' },
      { key: 'D', text: '11x - 7' },
    ],
    jawabanBenar: 'A',
    kategori: 'Matematika SMP',
    bobotNilai: 20,
    status: 'aktif',
    orderIndex: 3,
  },
  {
    id: 'soal-4',
    pertanyaan: 'Langkah berpikir komputasional yang memecah masalah besar menjadi bagian-bagian lebih kecil disebut...',
    pilihanJawaban: [
      { key: 'A', text: 'Abstraksi' },
      { key: 'B', text: 'Dekomposisi' },
      { key: 'C', text: 'Pengenalan Pola' },
      { key: 'D', text: 'Algoritma' },
    ],
    jawabanBenar: 'B',
    kategori: 'Informatika (TIK)',
    bobotNilai: 20,
    status: 'aktif',
    orderIndex: 4,
  },
  {
    id: 'soal-5',
    pertanyaan: 'Teks yang menggambarkan objek secara rinci sehingga pembaca seolah-olah melihat dan merasakan langsung disebut teks...',
    pilihanJawaban: [
      { key: 'A', text: 'Teks Deskripsi' },
      { key: 'B', text: 'Teks Prosedur' },
      { key: 'C', text: 'Teks Laporan Hasil Observasi' },
      { key: 'D', text: 'Teks Narasi' },
    ],
    jawabanBenar: 'A',
    kategori: 'Bahasa Indonesia',
    bobotNilai: 20,
    status: 'aktif',
    orderIndex: 5,
  },
];

export const subscribeBankSoal = (
  onData: (soalList: BankSoalDoc[]) => void,
  _onError: (error: Error) => void
) => {
  const current = getLocalItem<BankSoalDoc[]>('bank_soal', DEFAULT_BANK_SOAL);
  onData(current);

  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_PREFIX + 'bank_soal' && e.newValue) {
      try {
        onData(JSON.parse(e.newValue));
      } catch {}
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
};

export const subscribeActiveBankSoal = (
  onData: (soalList: BankSoalDoc[]) => void,
  onError?: (error: Error) => void
) => {
  return subscribeBankSoal(
    (list) => {
      onData(list.filter((s) => s.status === 'aktif'));
    },
    (err) => {
      if (onError) onError(err);
    }
  );
};

export const addSoalToFirestore = async (
  soal: Omit<BankSoalDoc, 'id' | 'createdAt' | 'updatedAt'>
) => {
  const current = getLocalItem<BankSoalDoc[]>('bank_soal', DEFAULT_BANK_SOAL);
  const newId = `soal-${Date.now()}`;
  const newDoc: BankSoalDoc = {
    ...soal,
    id: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const nextList = [...current, newDoc];
  setLocalItem('bank_soal', nextList);
  return newId;
};

export const updateSoalInFirestore = async (
  id: string,
  soal: Partial<Omit<BankSoalDoc, 'id' | 'createdAt'>>
) => {
  const current = getLocalItem<BankSoalDoc[]>('bank_soal', DEFAULT_BANK_SOAL);
  const nextList = current.map((s) => (s.id === id ? { ...s, ...soal, updatedAt: new Date().toISOString() } : s));
  setLocalItem('bank_soal', nextList);
};

export const deleteSoalFromFirestore = async (id: string) => {
  const current = getLocalItem<BankSoalDoc[]>('bank_soal', DEFAULT_BANK_SOAL);
  const nextList = current.filter((s) => s.id !== id);
  setLocalItem('bank_soal', nextList);
};

export const toggleStatusSoalInFirestore = async (id: string, currentStatus: 'aktif' | 'nonaktif') => {
  const nextStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif';
  await updateSoalInFirestore(id, { status: nextStatus });
  return nextStatus;
};

export const subscribePendaftar = (
  onData: (pendaftarList: PendaftarDoc[]) => void,
  _onError: (error: Error) => void
) => {
  const current = getLocalItem<PendaftarDoc[]>('pendaftar', []);
  onData(current);

  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_PREFIX + 'pendaftar' && e.newValue) {
      try {
        onData(JSON.parse(e.newValue));
      } catch {}
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
};

export const updateVerifikasiPendaftar = async (
  id: string,
  status: 'pending' | 'terverifikasi' | 'ditolak'
) => {
  const current = getLocalItem<PendaftarDoc[]>('pendaftar', []);
  const nextList = current.map((p) => (p.id === id ? { ...p, statusVerifikasi: status } : p));
  setLocalItem('pendaftar', nextList);
};

export const subscribeHasilUjian = (
  onData: (list: HasilUjianDoc[]) => void,
  _onError: (error: Error) => void
) => {
  const current = getLocalItem<HasilUjianDoc[]>('hasil_ujian', []);
  onData(current);

  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_PREFIX + 'hasil_ujian' && e.newValue) {
      try {
        onData(JSON.parse(e.newValue));
      } catch {}
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
};

export const initHasilUjianSession = async (
  idPendaftar: string,
  namaSiswa: string,
  totalSoal: number,
  jurusan?: string
): Promise<string> => {
  const newId = `hasil-${Date.now()}`;
  const current = getLocalItem<HasilUjianDoc[]>('hasil_ujian', []);
  const newSession: HasilUjianDoc = {
    id: newId,
    idPendaftar,
    namaSiswa,
    jurusan: jurusan || 'Umum',
    jawaban: {},
    skorAkhir: 0,
    totalSoal,
    status: 'mengerjakan',
    waktuMulai: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  setLocalItem('hasil_ujian', [newSession, ...current]);
  return newId;
};

export const autoSaveJawabanSoal = async (
  hasilUjianId: string,
  soalId: string,
  jawabanOptionKey: string
) => {
  const current = getLocalItem<HasilUjianDoc[]>('hasil_ujian', []);
  const nextList = current.map((h) => {
    if (h.id === hasilUjianId) {
      return {
        ...h,
        jawaban: { ...h.jawaban, [soalId]: jawabanOptionKey },
        updatedAt: new Date().toISOString(),
      };
    }
    return h;
  });
  setLocalItem('hasil_ujian', nextList);
};

export const finalizeHasilUjian = async (
  hasilUjianId: string,
  skorAkhir: number
) => {
  const current = getLocalItem<HasilUjianDoc[]>('hasil_ujian', []);
  const nextList = current.map((h) => {
    if (h.id === hasilUjianId) {
      return {
        ...h,
        skorAkhir,
        status: 'selesai' as const,
        waktuSelesai: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return h;
  });
  setLocalItem('hasil_ujian', nextList);
};

export const seedInitialBankSoalIfEmpty = async () => {
  setLocalItem('bank_soal', DEFAULT_BANK_SOAL);
};
