/* =====================================================
   DATA - SUMBER KEBENARAN TUNGGAL
   FIX BUG: nama dokter sebelumnya ditulis dua kali dengan format berbeda
   (dataDokter vs <option> select), jadi pilihan dokter tidak pernah
   cocok. Sekarang <select> dibangun otomatis dari data ini.
   ===================================================== */

const dataDokter = {
    anak: {
        nama: 'Dr. Budi Santoso, Sp.A (K)',
        spesialis: 'Spesialis Kesehatan Anak / Pediatri',
        foto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
        deskripsi: 'Pakar tumbuh kembang anak dan imunisasi dengan pengalaman lebih dari 15 tahun.',
        inisial: 'BS',
        gradient: ['#3a86ff', '#1d4ed8'],
        hargaTele: 150000
    },
    bedah: {
        nama: 'Dr. Sarah Wijaya, Sp.B, FINACS',
        spesialis: 'Spesialis Bedah Umum & Laparoskopi',
        foto: 'https://images.unsplash.com/photo-1594824813566-78a94640191c?auto=format&fit=crop&w=600&q=80',
        deskripsi: 'Pakar tindakan bedah invasif minimal (laparoskopi) lulusan Universitas Indonesia.',
        inisial: 'SW',
        gradient: ['#ff6b8b', '#e64968'],
        hargaTele: 200000
    },
    jantung: {
        nama: 'Dr. Hendra Kusuma, Sp.JP (K)',
        spesialis: 'Spesialis Jantung & Pembuluh Darah',
        foto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
        deskripsi: 'Ahli kardiologi intervensi berpengalaman dalam penanganan serangan jantung.',
        inisial: 'HK',
        gradient: ['#e64968', '#1d4ed8'],
        hargaTele: 250000
    },
    gigi: {
        nama: 'Drg. Maya Putri, Sp.BM',
        spesialis: 'Spesialis Bedah Mulut & Gigi',
        foto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
        deskripsi: 'Spesialis implantologi gigi, rekonstruksi rahang, dan estetika gigi.',
        inisial: 'MP',
        gradient: ['#3a86ff', '#ff6b8b'],
        hargaTele: 175000
    },
    saraf: {
        nama: 'Dr. Rian Arisandi, Sp.N',
        spesialis: 'Spesialis Saraf / Neurologi',
        foto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
        deskripsi: 'Fokus pada penanganan stroke, migrain akut, dan gangguan sistem saraf.',
        inisial: 'RA',
        gradient: ['#1d4ed8', '#3a86ff'],
        hargaTele: 225000
    },
    mata: {
        nama: 'Dr. Amanda Soraya, Sp.M',
        spesialis: 'Spesialis Mata & Operasi Katarak',
        foto: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&q=80',
        deskripsi: 'Ahli operasi katarak modern dengan metode Phacoemulsification.',
        inisial: 'AS',
        gradient: ['#ff6b8b', '#3a86ff'],
        hargaTele: 200000
    },
    jiwa: {
        nama: 'Dr. Fajar Pratama, Sp.KJ',
        spesialis: 'Spesialis Kedokteran Jiwa / Psikiater',
        foto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
        deskripsi: 'Menangani kesehatan mental, kecemasan, dan konsultasi psikoterapi.',
        inisial: 'FP',
        gradient: ['#6366f1', '#8b5cf6'],
        hargaTele: 200000
    },
    kulit: {
        nama: 'Dr. Nadia Utama, Sp.DVE',
        spesialis: 'Spesialis Kulit & Kelamin',
        foto: 'https://images.unsplash.com/photo-1594824813566-78a94640191c?auto=format&fit=crop&w=600&q=80',
        deskripsi: 'Pakar perawatan kulit, kecantikan wajah, dan penanganan alergi kulit.',
        inisial: 'NU',
        gradient: ['#10b981', '#059669'],
        hargaTele: 175000
    }
};

/* Kategori spesialis yang tampil di grid utama (urutan tampilan) */
const DAFTAR_SPESIALIS = [
    { key: 'anak', label: 'Spesialis Anak', iconClass: 'fas fa-child' },
    { key: 'bedah', label: 'Spesialis Bedah', iconClass: 'fa-solid fa-scissors' },
    { key: 'jantung', label: 'Jantung & Pembuluh', iconClass: 'fas fa-heart-pulse' },
    { key: 'gigi', label: 'Spesialis Gigi', iconClass: 'fas fa-tooth' },
    { key: 'saraf', label: 'Spesialis Saraf', iconClass: 'fas fa-brain' },
    { key: 'mata', label: 'Spesialis Mata', iconClass: 'fas fa-eye' },
    { key: 'jiwa', label: 'Kedokteran Jiwa', iconClass: 'fas fa-head-side-virus' },
    { key: 'kulit', label: 'Kulit & Kelamin', iconClass: 'fas fa-hand-dots' }
];

/* Semua dokter yang bisa dipilih untuk janji temu / telemedicine.
   PENTING: pakai .map(), bukan Object.keys() - karena DAFTAR_SPESIALIS
   adalah array, Object.keys() akan menghasilkan index ("0","1",...) bukan
   nama key dokter, sehingga <select> jadi kosong semua. */
const DAFTAR_DOKTER = DAFTAR_SPESIALIS.map(function (item) { return item.key; });
