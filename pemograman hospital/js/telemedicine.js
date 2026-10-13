/* =====================================================
   TELEMEDICINE (KONSULTASI ONLINE)
   ===================================================== */

const Telemedicine = {
    init: function () {
        const form = byId('teleForm');
        if (form) {
            form.addEventListener('submit', this.simpan);
        }

        const dokterSelect = byId('teleDokter');
        if (dokterSelect) {
            dokterSelect.addEventListener('change', this.updateBiaya);
        }

        /* FIX BUG: datetime-local tanpa batas minimum. */
        const waktuInput = byId('teleWaktu');
        if (waktuInput) {
            waktuInput.min = nowLocalISO();
        }

        isiOpsiDokter('teleDokter', true);
    },

    open: function () {
        requireLogin(function () {
            /* FIX BUG: tag harga tidak di-refresh saat modal dibuka, jadi
               kalau sebelumnya sudah ada dokter terpilih, nominalnya
               masih sisa sesi lalu. */
            Telemedicine.updateBiaya();
            Telemedicine.render();
            Modal.open('telemedicineModal');
        });
    },

    updateBiaya: function () {
        const select = byId('teleDokter');
        const tag = byId('teleTagHarga');
        if (!select || !tag) return;

        const doc = Telemedicine.cariDokter(select.value);
        if (!doc) {
            tag.textContent = 'Total Biaya: Rp 0';
            return;
        }

        tag.textContent = 'Total Biaya: ' + formatRupiah(doc.hargaTele || CONFIG.defaultTeleFee);
    },

    /* FIX BUG: harga dulu diserialisasi sebagai "nama|harga" lalu di-split
       dengan karakter "|" (rapuh). Sekarang lookup langsung dari dataDokter. */
    cariDokter: function (nama) {
        if (!nama) return null;
        const keys = Object.keys(dataDokter);
        for (let i = 0; i < keys.length; i++) {
            if (dataDokter[keys[i]].nama === nama) {
                return dataDokter[keys[i]];
            }
        }
        return null;
    },

    simpan: function (e) {
        e.preventDefault();

        const nama = byId('teleNamaPasien').value.trim();
        const namaDokter = byId('teleDokter').value;
        const metode = byId('teleMetode').value;
        const waktu = byId('teleWaktu').value;

        if (!nama || !namaDokter || !waktu) {
            Toast.error('Lengkapi nama, dokter, dan waktu konsultasi.');
            return;
        }

        if (waktu < nowLocalISO()) {
            Toast.error('Waktu konsultasi tidak boleh di masa lalu.');
            return;
        }

        const doc = Telemedicine.cariDokter(namaDokter);
        if (!doc) {
            Toast.error('Dokter tidak ditemukan.');
            return;
        }

        const harga = doc.hargaTele || CONFIG.defaultTeleFee;
        const list = Telemedicine.ambilData();

        const bentrok = list.some(function (item) {
            return item.dokter === namaDokter && item.waktu === waktu;
        });
        if (bentrok) {
            Toast.error('Sesi dengan dokter ini di waktu yang sama sudah ada.');
            return;
        }

        list.push({
            nama: nama,
            dokter: doc.nama,
            metode: metode,
            waktu: waktu,
            harga: harga,
            dibuat: new Date().toISOString()
        });

        if (!Telemedicine.simpanData(list)) {
            Toast.error('Gagal menyimpan sesi telemedicine.');
            return;
        }

        byId('teleForm').reset();
        byId('teleTagHarga').textContent = 'Total Biaya: Rp 0';
        Telemedicine.render();
        Toast.success('Sesi telemedicine berhasil dipesan.');
    },

    ambilData: function () {
        return Store.get(storageKeyPerUser('rs_tele_list'), []);
    },

    simpanData: function (list) {
        return Store.set(storageKeyPerUser('rs_tele_list'), list);
    },

    render: function () {
        const container = byId('teleContainer');
        if (!container) return;

        const list = Telemedicine.ambilData();

        clear(container);

        if (!list.length) {
            container.appendChild(el('p', 'empty-state', 'Belum ada sesi telemedicine yang dijadwalkan.'));
            return;
        }

        list.forEach(function (item) {
            const card = el('div', 'janji-item tele-item');

            const judul = el('strong');
            judul.appendChild(icon('fas fa-video'));
            judul.appendChild(document.createTextNode(' ' + item.dokter));
            card.appendChild(judul);

            const meta = el('span', 'janji-item-meta');
            meta.appendChild(document.createTextNode(item.metode + '  |  Pasien: ' + item.nama));
            card.appendChild(meta);

            const waktu = el('span', 'janji-item-meta');
            waktu.appendChild(icon('fas fa-clock'));
            waktu.appendChild(document.createTextNode(' ' + formatTanggalWaktu(item.waktu)));
            card.appendChild(waktu);

            card.appendChild(el('span', 'tele-price', formatRupiah(item.harga)));

            container.appendChild(card);
        });
    }
};
