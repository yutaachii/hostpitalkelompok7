/* =====================================================
   JANJI TEMU TATAP MUKA
   ===================================================== */

const Janji = {
    init: function () {
        const form = byId('janjiForm');
        if (form) {
            form.addEventListener('submit', this.simpan);

            /* FIX BUG: tanggal tanpa batas minimum, user bisa memilih
               tanggal yang sudah lewat. */
            const tanggalInput = byId('tanggalJanji');
            if (tanggalInput) {
                tanggalInput.min = hariIniISO();
            }
        }

        isiOpsiDokter('dokterPilihan', false);
    },

    open: function () {
        requireLogin(function () {
            Janji.render();
            Modal.open('janjiModal');
        });
    },

    simpan: function (e) {
        e.preventDefault();

        const nama = byId('namaPasien').value.trim();
        const dokter = byId('dokterPilihan').value;
        const tanggal = byId('tanggalJanji').value;
        /* FIX BUG: field "Keluhan / Catatan" diisi user tapi TIDAK PERNAH
           disimpan. Sekarang ikut tersimpan & ditampilkan. */
        const catatan = byId('catatanJanji').value.trim();

        if (!nama || !dokter || !tanggal) {
            Toast.error('Lengkapi nama, dokter, dan tanggal kunjungan.');
            return;
        }

        if (tanggal < hariIniISO()) {
            Toast.error('Tanggal kunjungan tidak boleh di masa lalu.');
            return;
        }

        const list = Janji.ambilData();

        /* FIX: tidak ada pengecekan bentrok, satu dokter bisa punya
           banyak janji di tanggal yang sama. */
        const bentrok = list.some(function (item) {
            return item.dokter === dokter && item.tanggal === tanggal;
        });
        if (bentrok) {
            Toast.error('Anda sudah punya janji dengan dokter ini di tanggal yang sama.');
            return;
        }

        list.push({
            nama: nama,
            dokter: dokter,
            tanggal: tanggal,
            catatan: catatan,
            dibuat: new Date().toISOString()
        });

        if (!Janji.simpanData(list)) {
            Toast.error('Gagal menyimpan janji temu.');
            return;
        }

        byId('janjiForm').reset();
        Janji.render();
        Toast.success('Janji temu berhasil dibuat.');
    },

    ambilData: function () {
        return Store.get(storageKeyPerUser('rs_janji_list'), []);
    },

    simpanData: function (list) {
        return Store.set(storageKeyPerUser('rs_janji_list'), list);
    },

    render: function () {
        const container = byId('janjiContainer');
        if (!container) return;

        const list = Janji.ambilData();

        clear(container);

        if (!list.length) {
            container.appendChild(el('p', 'empty-state', 'Belum ada janji temu yang dibuat.'));
            return;
        }

        /* FIX BUG XSS: nama & catatan user sebelumnya masuk lewat
           innerHTML. Sekarang semua teks lewat textContent. */
        list.forEach(function (item) {
            const card = el('div', 'janji-item');

            card.appendChild(el('strong', null, item.dokter));

            const meta = el('span', 'janji-item-meta');
            meta.appendChild(icon('fas fa-user'));
            meta.appendChild(document.createTextNode(' ' + item.nama + '  |  '));
            meta.appendChild(icon('fas fa-calendar'));
            meta.appendChild(document.createTextNode(' ' + formatTanggal(item.tanggal)));
            card.appendChild(meta);

            if (item.catatan) {
                card.appendChild(el('span', 'janji-item-note', '"' + item.catatan + '"'));
            }

            container.appendChild(card);
        });
    }
};
