/* =====================================================
   UI - MODAL CONTROLLER, NAVIGASI, GRID SPESIALIS, INISIALISASI
   ===================================================== */

const Modal = {
    open: function (id) {
        const overlay = byId(id);
        if (!overlay) return;

        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        /* Fokus ke input pertama supaya bisa langsung mengetik (perbaikan UX). */
        const focusTarget = overlay.querySelector('input:not([type="hidden"]), select, textarea, button');
        if (focusTarget) {
            window.setTimeout(function () { focusTarget.focus(); }, 40);
        }
    },

    close: function (id) {
        const overlay = byId(id);
        if (!overlay) return;

        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');

        const stillOpen = document.querySelector('.modal-overlay[style*="flex"]');
        if (!stillOpen) {
            document.body.classList.remove('modal-open');
        }
    },

    closeAll: function () {
        document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
            overlay.style.display = 'none';
            overlay.setAttribute('aria-hidden', 'true');
        });
        document.body.classList.remove('modal-open');
    }
};

/* =====================================================
   NAVIGASI MOBILE
   FIX BUG: .nav-menu disembunyikan di <768px tanpa ada tombol pengganti,
   sehingga navigasi mati total di HP. Sekarang ada hamburger.
   ===================================================== */
function initNavToggle() {
    const toggle = byId('navToggle');
    const menu = byId('navMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
        const isOpen = menu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi');
        toggle.innerHTML = isOpen
            ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
            : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    });

    menu.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
            menu.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Buka menu navigasi');
            toggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
        }
    });
}

/* =====================================================
   GRID DOKTER SPESIALIS
   FIX: sebelumnya 8 kartu ditulis manual di HTML dengan onclick inline.
   Sekarang dibangun dari DAFTAR_SPESIALIS.
   ===================================================== */
function renderSpesialisGrid() {
    const grid = byId('specialistGrid');
    if (!grid) return;

    clear(grid);

    DAFTAR_SPESIALIS.forEach(function (item) {
        const doc = dataDokter[item.key];
        if (!doc) return;

        const card = el('button', 'specialist-card');
        card.type = 'button';
        card.setAttribute('data-dokter', item.key);
        card.setAttribute('aria-label', 'Lihat profil ' + doc.nama + ', ' + item.label);

        const iconBox = el('span', 'specialist-icon');
        iconBox.appendChild(icon(item.iconClass));

        card.appendChild(iconBox);
        card.appendChild(el('span', 'specialist-name', item.label));

        grid.appendChild(card);
    });
}

function initSpesialisGrid() {
    const grid = byId('specialistGrid');
    if (!grid) return;

    /* Delegasi event: hanya satu listener, aman untuk kartu dinamis. */
    grid.addEventListener('click', function (e) {
        const card = e.target.closest('.specialist-card');
        if (card) showDoctorDetail(card.dataset.dokter);
    });
}

/* =====================================================
   WHATSAPP
   FIX BUG: nomor wa.me dipatok langsung di HTML ke 6281234567890 yang
   merupakan nomor milik orang sungguhan. Sekarang diambil dari CONFIG
   dan tombol disembunyikan selama nomor resmi belum diisi.
   ===================================================== */
function initWhatsapp() {
    const btn = byId('whatsappBtn');
    if (!btn) return;

    const nomor = (CONFIG.whatsappNumber || '').replace(/[^0-9]/g, '');

    if (!nomor) {
        btn.hidden = true;
        btn.setAttribute('aria-hidden', 'true');
        return;
    }

    btn.addEventListener('click', function () {
        const pesan = encodeURIComponent('Halo ' + CONFIG.rsName + ', saya ingin bertanya tentang layanan.');
        window.open('https://wa.me/' + nomor + '?text=' + pesan, '_blank', 'noopener');
    });
}

/* =====================================================
   MODAL GENERIK (tombol dengan data-modal)
   ===================================================== */
function initModalTriggers() {
    document.querySelectorAll('[data-modal]').forEach(function (trigger) {
        trigger.addEventListener('click', function () {
            Modal.open(trigger.dataset.modal);
        });
    });

    document.querySelectorAll('[data-close-modal]').forEach(function (trigger) {
        trigger.addEventListener('click', function () {
            Modal.close(trigger.dataset.closeModal);
        });
    });

    /* FIX: versi lama tidak bisa ditutup dengan klik area gelap / tombol ESC. */
    document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
        overlay.addEventListener('mousedown', function (e) {
            if (e.target === overlay) {
                Modal.close(overlay.id);
            }
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            Modal.closeAll();
        }
    });

    /* Tombol aksi yang butuh logika modul lain */
    const btnJanji = byId('btnJanji');
    if (btnJanji) btnJanji.addEventListener('click', function () { Janji.open(); });

    const btnTele = byId('btnTele');
    if (btnTele) btnTele.addEventListener('click', function () { Telemedicine.open(); });

    const btnBuatJanji = byId('btnBuatJanji');
    if (btnBuatJanji) btnBuatJanji.addEventListener('click', pilihDokterJanji);

    const btnKonsulOnline = byId('btnKonsulOnline');
    if (btnKonsulOnline) btnKonsulOnline.addEventListener('click', pilihDokterTele);
}

/* =====================================================
   PROFIL DOKTER
   FIX BUG: pilihDokterJanji() & pilihDokterTele() dulu hanya membuka
   modal tanpa mengirim dokter mana yang dipilih, jadi form selalu kosong.
   Sekarang nama dokter diteruskan lewat preselectDokter().
   ===================================================== */
let activeDoctorKey = null;

function showDoctorDetail(kategori) {
    const doc = dataDokter[kategori];
    if (!doc) return;

    activeDoctorKey = kategori;

    byId('docImg').src = doc.foto;
    byId('docImg').alt = 'Foto ' + doc.nama;
    byId('docName').textContent = doc.nama;
    byId('docSpec').textContent = doc.spesialis;
    byId('docDesc').textContent = doc.deskripsi;

    Modal.open('doctorModal');
}

function pilihDokterJanji() {
    preselectDokter('dokterPilihan');
    Janji.open();
}

function pilihDokterTele() {
    preselectDokter('teleDokter');
    Telemedicine.open();
}

/* Mengisi <select> dokter lalu memilih dokter yang sedang dilihat */
function preselectDokter(selectId) {
    const select = byId(selectId);
    if (!select || !activeDoctorKey) return;

    const doc = dataDokter[activeDoctorKey];
    if (!doc) return;

    select.value = doc.nama;
}

/* =====================================================
   ISI <select> DOKTER DARI DATA (single source of truth)
   ===================================================== */
function isiOpsiDokter(selectId, withPrice) {
    const select = byId(selectId);
    if (!select) return;

    while (select.options.length > 0) {
        select.remove(0);
    }

    const placeholder = new Option('-- Pilih Dokter --', '');
    select.add(placeholder);

    DAFTAR_DOKTER.forEach(function (key) {
        const doc = dataDokter[key];
        if (!doc) return;

        const label = withPrice
            ? doc.nama + ' (' + doc.spesialis.split('/')[0].trim() + ') - ' + formatRupiah(doc.hargaTele || CONFIG.defaultTeleFee)
            : doc.nama + ' - ' + doc.spesialis;

        /* FIX BUG: sebelumnya harga dipisah dengan karakter "|" di dalam
           value lalu di-split manual. Sekarang cukup value = nama dokter. */
        select.add(new Option(label, doc.nama));
    });
}

/* =====================================================
   PERSISTENSI PER-USER
   FIX BUG: daftar janji & telemedicine disimpan di satu key global,
   sehingga semua user bisa melihat janji milik user lain (bug privasi).
   Sekarang key-nya dikunci per username.
   ===================================================== */
function storageKeyPerUser(baseKey) {
    const user = getActiveUser();
    return user ? baseKey + ':' + user : baseKey + ':tamu';
}

/* =====================================================
   GATE LOGIN
   FIX BUG: janji temu & telemedicine bisa dibuka tanpa login sama sekali.
   ===================================================== */
function requireLogin(aksi) {
    if (getActiveUser()) {
        aksi();
        return true;
    }
    Toast.info('Silakan login terlebih dahulu.');
    Modal.open('authModal');
    return false;
}

/* =====================================================
   INIT
   ===================================================== */
document.addEventListener('DOMContentLoaded', function () {
    Toast.stack();

    renderSpesialisGrid();
    initSpesialisGrid();
    initNavToggle();
    initModalTriggers();
    initWhatsapp();
    initAuth();

    Auth.updateUserUI();
    Janji.init();
    Telemedicine.init();
});
