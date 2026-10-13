/* =====================================================
   CONFIG - PENGATURAN SITERUMAH SAKIT KONGSI
   Ubah nilai di sini, tidak perlu menyentuh file lain.
   ===================================================== */

const CONFIG = {
    /* FIX BUG: sebelumnya nomor WhatsApp 6281234567890 dipatok langsung di
       HTML. Nomor itu milik orang sungguhan, jadi link wa.me-nya mengarah ke
       stranger. Sekarang dikosongkan -> tombol WhatsApp disembunyikan sampai
       nomor resmi RS diisi. Format internasional tanpa "+", contoh: 6281234567890 */
    whatsappNumber: '',

    rsName: 'RS Kongsi',
    rsPhone: '(021) 555-0199',
    rsAddress: 'Jl. Kesehatan No. 88, Jakarta',
    careline: 'Careline 24 Jam',

    /* Biaya default bila dokter tidak punya nilai `hargaTele` */
    defaultTeleFee: 150000,

    /* Umur minimum password (validasi register) */
    minPasswordLength: 6
};
