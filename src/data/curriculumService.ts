import { MeetingModule, Subject } from '../types';

// SMP WIJAYA KUSUMA - 30 Meetings Curricula per Subject

const SUNDA_TOPICS = [
  'Pangjejeg Pangajaran: Tatakrama Basa Sunda jeung Undak Usuk Basa',
  'Paguneman (Percakapan Sehari-hari): Nyarita ka Sasama jeung ka Saluhureun',
  'Praktik Paguneman Nepangkeun Diri jeung Kulawarga dina Basa Sunda',
  'Kaulinan Barudak Lembur: Oray-orayan, Boy-boyan, Congklak, sarta Egrang',
  'Rumpaka Kawih Sunda: Ngahariringkeun Kawih Klasik jeung Modern',
  'Ngaregepkeun jeung Nganalisis Eusi Kawih Es Lilin & Manuk Dadali',
  'Dongeng Sasakala (Legenda): Dongeng Asal-Usul Tempat di Jawa Barat',
  'Dongeng Fabel: Carita Kuya jeung Monyet, Peucang Rucit, sarta Amanat Moral',
  'Praktik Nulis jeung Nyaritakeun Deui Dongeng Sunda ku Basa Sorangan',
  'Pupuh Kinanti: Guru Lagu, Guru Wilangan, sarta Watek Sedih jeung Ngarep-ngarep',
  'Pupuh Asmarandana jeung Sinom: Nembangkeun Pupuh kalawan Wirahma Luyu',
  'Praktik Ngarang Pupuh Sederhana ngeunaan Sosobatan jeung Sakola',
  'Asesmen Sumatif Tengah Semester (STS) Basa Sunda jeung Refleksi',
  'Carita Pondok (Carpon): Unsur Intrinsik Tema, Tokoh, Alur, jeung Latar',
  'Nganalisis Basa Panganteur jeung Kecap Panganteb dina Carpon Sunda',
  'Praktik Nulis Carpon Pangalaman Pribadi anu Pikaseurieun / Pikasediheun',
  'Sisindiran: Mengenal Paparikan, Rarakitan, jeung Wawangsalan',
  'Struktur Sisindiran: Cangkang jeung Eusi, Rima Sora sarta Maksudna',
  'Praktik Nulis Sisindiran Piwuruk (Nasehat) jeung Silih Tempas Sisindiran',
  'Warta Basa Sunda: Cara Nulis jeung Maca Warta Sakola SMP Wijaya Kusuma',
  'Surat Pribadi dina Basa Sunda ka Babaturan atawa ka Rerencangan',
  'Pakeman Basa: Babasan jeung Paribasa Sunda anu Ilahar Dipake',
  'Nerapkeun Paribasa dina Kalimah Paguneman Sapopoe',
  'Aksara Sunda Kaganga: Ngenal Huruf Ngalagena, Swara, jeung Rarangkén',
  'Latihan Nulis Ngaran Pribadi jeung Ngaran Sakola ku Aksara Sunda',
  'Nyunting jeung Maca Kalimah Parondok dina Aksara Sunda Tradisional',
  'Tradisi Sunda: Seren Taun, Hajat Lembur, sarta Kadaharan Tradisional',
  'Praktik Biantara (Pidato) Basa Sunda Tema Miara Lingkungan Sakola',
  'Pintonan Pasanggiri Drama Pondok atawa Maca Sajak Sunda Siswa SMPWK',
  'Pameran Budaya Sunda: Nyusun Portofolio Karya Sastra Basa Sunda',
];

const BINDO_TOPICS = [
  'Pengenalan Teks Deskripsi: Menentukan Ciri, Tujuan, dan Jenis Objek',
  'Menentukan Isi dan Struktur Teks Deskripsi (Identifikasi, Deskripsi Bagian, Simpulan)',
  'Kaidah Kebahasaan Teks Deskripsi: Kata Khusus, Majas Asosiasi, Kata Depan',
  'Praktik Menulis Deskripsi Objek Wisata Lingkungan Sekitar SMPWK',
  'Menelaah Cerita Fantasi: Karakteristik, Unsur Intrinsik, dan Tokoh Sakti',
  'Pola Pengembangan Alur Cerita Fantasi dan Dialog Naratif',
  'Praktik Menyusun Cerpen Fantasi Bertema Sains Fiksi / Petualangan',
  'Teks Prosedur: Ciri Bahasa, Langkah-langkah, dan Penggunaan Pelesapan',
  'Menyusun Petunjuk Kerja & Cara Penggunaan Alat Laboratorium / Gadget',
  'Teks Laporan Hasil Observasi (LHO): Ciri Objektif dan Fakta Ilmiah',
  'Struktur Teks LHO: Pernyataan Umum, Deskripsi Bagian, dan Manfaat',
  'Praktik Observasi Flora dan Fauna di Kebun Sekolah SMP Wijaya Kusuma',
  'Evaluasi Tengah Semester: Uji Literasi dan Analisis Teks Naratif',
  'Puisi Rakyat: Mengenal Pantun, Gurindam, dan Syair Nusantara',
  'Menelaah Struktur Rima, Sampiran, dan Amanat dalam Pantun Berbalas',
  'Praktik Menulis Pantun Nasehat Pendidikan dan Budi Pekerti Luhur',
  'Teks Berita Aktual: Unsur 5W+1H (Adiksimba) dan Kepala Berita',
  'Menulis Teks Berita Kegiatan Prestasi dan Ekstrakurikuler Sekolah',
  'Surat Pribadi dan Surat Dinas: Format Baku, Kop, dan Bahasa Santun',
  'Menelaah Buku Fiksi dan Nonfiksi: Peta Pikiran (Mind Map) Rangkuman Bab',
  'Membaca Kritis: Membedakan Fakta dan Opini dalam Artikel Populer',
  'Teks Iklan, Slogan, dan Poster: Daya Tarik Komunikasi Visual dan Slogan',
  'Merancang Poster Edukasi Anti Perundungan (Bullying) di Lingkungan Sekolah',
  'Teks Eksposisi: Argumen Logis, Tesis, dan Rekomendasi Berimbang',
  'Studi Teks Pidato Persuasif: Teknik Orasi Pembuka, Inti, dan Salam Penutup',
  'Praktik Pidato Singkat Menjaga Kebersihan dan Kedisiplinan Siswa',
  'Teks Ulasan (Resensi): Menilai Kelebihan dan Kekurangan Novel Remaja',
  'Pementasan Drama Pendek: Menghayati Dialog, Mimik, dan Gesture Karakter',
  'Penyusunan Portofolio Literasi Karya Tulis Siswa SMP Wijaya Kusuma',
  'Pameran Literasi Siswa: Apresiasi Membaca dan Karya Tulis Terbaik',
];

const MAT_TOPICS = [
  'Bilangan Bulat: Operasi Hitung Campuran dan Garis Bilangan',
  'Operasi Pecahan: Penjumlahan, Pengurangan, Perkalian, dan Pembagian',
  'Bilangan Berpangkat Bulat Positif dan Sifat-sifat Eksponen Dasar',
  'Bentuk Akar dan Operasi Penyerhanaan Bentuk Aljabar Sederhana',
  'Himpunan: Notasi, Anggota, Diagram Venn, Irisan dan Gabungan',
  'Bentuk Aljabar: Koefisien, Variabel, Konstanta, dan Suku Sejenis',
  'Operasi Bentuk Aljabar: Penjumlahan, Pengurangan, dan Perkalian Binomial',
  'Faktorisasi Bentuk Aljabar: Selisih Dua Kuadrat dan Trinom Kuadrat',
  'Persamaan Linier Satu Variabel (PLSV): Konsep Kesetaraan & Penyelesaian',
  'Pertidaksamaan Linier Satu Variabel (PtLSV) dan Garis Bilangan Himpunan',
  'Aritmetika Sosial: Untung, Rugi, Persentase, dan Harga Penjualan',
  'Aritmetika Sosial: Bruto, Netto, Tara, Diskon, dan Bunga Tunggal',
  'Evaluasi Tengah Semester: Uji Pemahaman Aljabar & Perhitungan Riil',
  'Perbandingan Senilai dan Berbalik Nilai dalam Kehidupan Nyata',
  'Garis dan Sudut: Sudut Berpelurus, Berpenyiku, dan Bertolak Belakang',
  'Hubungan Antarsudut Dua Garis Sejajar yang Dipotong Garis Transversal',
  'Segitiga: Jenis Segitiga, Sifat Sudut, Keliling, dan Luas Daerah',
  'Segiempat: Persegi, Persegi Panjang, Jajargenjang, Belah Ketupat, Layang-layang',
  'Teorema Pythagoras: Menemukan Rumus dan Triple Pythagoras Sederhana',
  'Penerapan Teorema Pythagoras dalam Pemecahan Masalah Ruang Bangun',
  'Lingkaran: Unsur-unsur Lingkaran, Keliling, Luas, Panjang Busur, dan Juring',
  'Sudut Pusat dan Sudut Keliling pada Lingkaran',
  'Bangun Ruang Sisi Datar: Jaring-jaring dan Luas Permukaan Kubus & Balok',
  'Volume Kubus, Balok, Prisma Tegak, dan Limas Segiempat',
  'Statistika Deskriptif: Pengumpulan Data, Tabel Distribusi Frekuensi',
  'Penyajian Data: Diagram Batang, Diagram Garis, dan Diagram Lingkaran',
  'Ukuran Pemusatan Data: Menghitung Mean (Rata-rata), Median, dan Modus',
  'Peluang Teoritis dan Peluang Empiris pada Pelemparan Koin dan Dadu',
  'Proyek Matematika Terapan: Menghitung Estimasi Biaya & Kebutuhan Ruang Kelas',
  'Review Komprehensif & Simulasi Ujian Akhir Matematika SMPWK',
];

const IPA_TOPICS = [
  'Hakikat Sains, Metode Ilmiah, dan Keselamatan Kerja di Laboratorium IPA',
  'Pengukuran Besaran Pokok dan Turunan Menggunakan Jangka Sorong & Neraca',
  'Klasifikasi Makhluk Hidup: Karakteristik Organisme dan Kunci Determinasi',
  'Sistem Lima Kingdom: Monera, Protista, Fungi, Plantae, dan Animalia',
  'Mikroskop: Bagian-bagian, Fungsi, dan Teknik Pengamatan Sel Tumbuhan',
  'Struktur dan Fungsi Sel: Membran, Sitoplasma, Nukleus, Mitokondria, Kloroplas',
  'Tingkat Organisasi Kehidupan: Sel, Jaringan, Organ, Sistem Organ, Organisme',
  'Wujud Zat dan Perubahannya: Sifat Fisika, Sifat Kimia, Perubahan Wujud',
  'Suhu, Alat Ukur Termometer, dan Konversi Skala (Celcius, Reamur, Fahrenheit, Kelvin)',
  'Kalor dan Pengaruhnya: Perpindahan Panas (Konduksi, Konveksi, Radiasi)',
  'Pemuaian Zat Padat, Cair, dan Gas dalam Teknologi Sehari-hari',
  'Energi dalam Sistem Kehidupan: Fotosintesis, Respirasi, dan Sumber Energi Terbarukan',
  'Evaluasi Tengah Semester: Uji Konsep Fisika Dasar & Biologi Sel',
  'Ekosistem: Komponen Biotik, Abiotik, Rantai Makanan, dan Jaring Makanan',
  'Interaksi Makhluk Hidup: Simbiosis Mutualisme, Komensalisme, Parasitisme',
  'Pencemaran Lingkungan: Polusi Air, Udara, dan Tanah serta Upaya Remediasi',
  'Perubahan Iklim Global: Efek Rumah Kaca dan Penipisan Lapisan Ozon',
  'Lapisan Bumi dan Dinamikanya: Litosfer, Gempa Bumi, Vulkanisme, dan Mitigasi Bencana',
  'Tata Surya: Karakteristik Planet, Satelit, Asteroid, Rotasi dan Revolusi Bumi',
  'Sistem Gerak pada Manusia: Struktur Tulang, Rangka, Otot, dan Sendi',
  'Kelainan pada Sistem Gerak dan Pembiasaan Sikap Tubuh Ergonomis',
  'Gerak Lurus: GLB (Gerak Lurus Beraturan) dan GLBB (Beraturan Dipercepat)',
  'Hukum Newton tentang Gerak: Hukum I, II, dan III serta Penerapannya',
  'Pesawat Sederhana: Tuas (Pengungkit), Bidang Miring, Katrol, dan Roda Berporos',
  'Sistem Pencernaan Manusia: Organ, Enzim Pencernaan, dan Pola Nutrisi Gizi Seimbang',
  'Zat Aditif dan Zat Adiktif pada Makanan: Pewarna, Pengawet, Pemanis, dan Bahaya Narkoba',
  'Sistem Peredaran Darah: Jantung, Pembuluh Darah, Komposisi Darah, dan Golongan Darah',
  'Tekanan Zat Padat, Cair (Tekanan Hidrostatis, Hukum Pascal, Archimedes) dan Gas',
  'Proyek Sains Ramah Lingkungan: Pembuatan Pupuk Kompos / Alat Penjernih Air Sederhana',
  'Gelar Karya Eksperimen Sains SMP Wijaya Kusuma',
];

const GENERAL_SMP_TOPICS = [
  'Fondasi dan Orientasi Pembelajaran Kurikulum Merdeka SMP Wijaya Kusuma',
  'Konsep Inti dan Pemetaan Tujuan Capaian Pembelajaran Bab 1',
  'Eksplorasi Teori, Prinsip Dasar, dan Terminologi Kunci',
  'Analisis Kasus Nyata dan Diskusi Interaktif Kelompok',
  'Lembar Kerja Peserta Didik (LKPD): Pengamatan dan Pengumpulan Data',
  'Pengolahan Data Hasil Temuan dan Diskusi Pemecahan Masalah',
  'Presentasi Gagasan Kelompok dan Sesi Umpan Balik Kelas',
  'Penguatan Konsep Lanjutan dan Latihan Mandiri Terbimbing',
  'Integrasi Teknologi Digital dan Literasi Sumber Belajar Terpercaya',
  'Penerapan Prinsip Kritis dalam Menilai Fenomena Sehari-hari',
  'Pendalaman Materi: Studi Refleksi dan Catatan Jurnal Belajar',
  'Simulasi Latihan Soal Mandiri dan Pembahasan Trik Penyelesaian Cepat',
  'Asesmen Sumatif Tengah Semester (STS) dan Refleksi Hasil Capaian',
  'Ulasan Hasil STS: Remedial Terarah dan Program Pengayaan Materi',
  'Masuk ke Blok Bab 2: Eksplorasi Tema Baru dan Peta Konsep',
  'Investigasi Lapangan / Observasi Terpadu SMP Wijaya Kusuma',
  'Pengolahan Temuan Menggunakan Diagram dan Tabel Rangkuman',
  'Penyusunan Lembar Solusi Inovatif dan Kolaborasi Siswa',
  'Simulasi Praktik Terapan dan Unjuk Kerja Keterampilan',
  'Kajian Studi Banding dan Kontekstualisasi Budaya Lokal',
  'Pemanfaatan Media Pembelajaran Interaktif dan Simulasi Digital',
  'Penguatan Karakter Pelajar Pancasila: Bernalar Kritis & Bergotong Royong',
  'Latihan Soal HOTS (Higher Order Thinking Skills) dan Diskusi Solusi',
  'Pengorganisasian Proyek Portofolio Semester Ganjil/Genap',
  'Bimbingan Terarah Proyek Karya Siswa SMP Wijaya Kusuma',
  'Penyempurnaan Akhir Produk / Makalah / Laporan Proyek',
  'Simulasi Ujian Asesmen Akhir Semester (SAS / CBT Digital)',
  'Refleksi Komprehensif: Evaluasi Diri dan Menentukan Target Akademik',
  'Pameran Hasil Karya (Exhibition) dan Apresiasi Antarsiswa',
  'Sidang Refleksi Pembelajaran Akhir dan Penyerahan Lembar Portofolio',
];

export const generate30MeetingsForSubject = (subject: Subject): MeetingModule[] => {
  let topicList = GENERAL_SMP_TOPICS;
  const lower = (subject.name + ' ' + subject.id).toLowerCase();

  if (lower.includes('sunda')) {
    topicList = SUNDA_TOPICS;
  } else if (lower.includes('indo') || lower.includes('bahasa indonesia')) {
    topicList = BINDO_TOPICS;
  } else if (lower.includes('matematika') || lower.includes('mat')) {
    topicList = MAT_TOPICS;
  } else if (lower.includes('alam') || lower.includes('ipa')) {
    topicList = IPA_TOPICS;
  }

  const isSunda = lower.includes('sunda');

  return Array.from({ length: 30 }, (_, i) => {
    const meetingNumber = i + 1;
    const topic = topicList[i] || `Materi Pertemuan ${meetingNumber}: Pembahasan Terstruktur ${subject.name}`;

    return {
      meetingNumber,
      title: `Pertemuan ${meetingNumber}: ${topic}`,
      theme: `Modul Pembelajaran ${subject.name} - Unit ${Math.ceil(meetingNumber / 5)}`,
      learningObjective: isSunda
        ? `Sabada diajar materi Pertemuan ${meetingNumber}, para pamilon didik SMP Wijaya Kusuma dipiharep tiasa paham, nganalisis, sarta ngalarapkeun materi "${topic}" kalawan tatakrama anu merenah sarta ngaronjatkeun ajén karakter luhur Sunda.`
        : `Setelah mempelajari materi Pertemuan ${meetingNumber}, peserta didik SMP Wijaya Kusuma mampu memahami, menganalisis, dan mempraktikkan konsep dasar "${topic}" dengan bernalar kritis dan berkarakter budi pekerti luhur.`,
      theorySummary: isSunda
        ? `Ringkesan Materi Pertemuan ${meetingNumber}:\n\nDina ieu lawungan, dibahas ngeunaan "${topic}". Murid diajak neuleuman dasar-dasar basa jeung sastra Sunda, larapna dina kahirupan sapopoe, sarta ngamumule budaya karuhun di lingkungan sakola SMP Wijaya Kusuma.`
        : `Ringkasan Materi Pertemuan ${meetingNumber}:\n\nPada sesi ini dibahas mengenai "${topic}". Peserta didik diajak memahami prinsip dasar, relevansi dalam kehidupan nyata, keterkaitan dengan capaian Kurikulum Merdeka SMP Wijaya Kusuma, serta contoh aplikasi praktis sehari-hari.`,
      detailedContent: isSunda
        ? `### Pedaran Materi Pertemuan ${meetingNumber} — ${subject.name}\n\n**A. Bubuka & Pedaran Konsep**\nDina pangajaran Kurikulum Merdeka di SMP Wijaya Kusuma, pedaran "${topic}" janten salah sahiji kompetensi penting pikeun ngamumule basa jeung sastra Sunda. Pamilon didik dipiharep henteu ngan saukur apal teorina, tapi oge tiasa nyarita sarta nulis luyu jeung undak-usuk basa Sunda.\n\n**B. Pokok-pokok Pedaran**\n1. Konsep dasar jeung wangenan perkawis materi ${topic}.\n2. Titikan basa, conto kalimah, atawa wangun sastra anu luyu.\n3. Conto larapna dina kahirupan kulawarga, babaturan, jeung masarakat sakola.\n\n**C. Kacindekan & Tugas LKPD**\nPigawé pancén Lembar Kerja Peserta Didik (LKPD) di handap kalawan daria jeung taliti. Kintunkeun waleran langsung dina formulir serahkeun teks atawa unggak berkas catetan anjeun.`
        : `### Rincian Materi Pertemuan ${meetingNumber} — ${subject.name}\n\n**A. Pengantar & Landasan Konsep**\nDalam pembelajaran Kurikulum Merdeka di SMP Wijaya Kusuma, topik "${topic}" menjadi salah satu pilar kompetensi. Peserta didik diharapkan tidak hanya menghafal konsep, namun menginternalisasi pemahaman ini ke dalam penalaran kontekstual.\n\n**B. Pembahasan Utama**\n1. Konsep inti: Pemetaan ruang lingkup materi secara terstruktur.\n2. Hubungan sebab-akibat dan prinsip ilmiah / logis yang berlaku.\n3. Contoh soal dan telaah studi kasus aplikatif di lingkungan sekolah dan rumah.\n\n**C. Kesimpulan & Penugasan LKPD**\nSelesaikan instruksi pada Lembar Kerja Peserta Didik (LKPD) berikut secara cermat dan teliti. Kirimkan laporan teks atau file dokumen sebelum batas waktu yang ditentukan.`,
      keyTerms: isSunda
        ? ['Basa Sunda', 'SMP Wijaya Kusuma', 'Tatakrama', 'Sastra Sunda', 'Pangajaran Merdeka']
        : ['Kurikulum Merdeka', 'SMP Wijaya Kusuma', 'Capaian Pembelajaran', 'Literasi & Numerasi', 'Karakter Pelajar Pancasila'],
      referenceResources: [
        {
          type: 'doc',
          title: `Buku Panduan Siswa ${subject.name} Kemendikbudristek`,
          url: 'https://buku.kemdikbud.go.id/',
        },
        {
          type: 'article',
          title: `Modul Ajar SMP Wijaya Kusuma - ${topic}`,
          url: '#',
        },
      ],
      lkpd: {
        id: `lkpd-${subject.id}-${meetingNumber}`,
        title: isSunda ? `Pancen LKPD Pertemuan ${meetingNumber}: ${topic}` : `LKPD Pertemuan ${meetingNumber}: ${topic}`,
        description: isSunda
          ? `Pigawé eksplorasi materi ${topic} pikeun ngalatih kaparigelan nulis jeung mikir kritis pamilon didik SMP Wijaya Kusuma.`
          : `Kerjakan tugas eksplorasi materi ${topic} untuk melatih kemampuan bernalar kritis dan kolaborasi peserta didik SMP Wijaya Kusuma.`,
        instructions: isSunda
          ? [
              'Baca pedaran materi di luhur kalawan daria.',
              'Catet minimal 3 poin penting tina konsép pangajaran ieu.',
              'Tuliskeun 1 conto nyata larapna materi ieu dina kahirupan sapopoé anjeun.',
              'Tuliskeun waleran langsung dina kolom penyerahan tugas atawa unggak catetan anjeun.',
            ]
          : [
              'Bacalah rangkuman materi di atas dengan seksama.',
              'Catat minimal 3 poin penting yang kamu temukan dari konsep pembelajaran ini.',
              'Berikan 1 contoh konkret penerapan materi ini dalam kehidupan sehari-hari di lingkungan sekolah atau rumah.',
              'Tuliskan jawaban langsung pada formulir penyerahan teks di bawah atau unggah berkas catatanmu.',
            ],
        submissionType: 'both',
        maxScore: 100,
        dueDate: '3 hari setelah sesi tatap muka',
      },
      isCompleted: meetingNumber <= 3,
    };
  });
};
