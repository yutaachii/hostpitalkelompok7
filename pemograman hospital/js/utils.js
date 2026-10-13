/* =====================================================
   UTILS - HELPER YANG DIPAKAI SEMUA MODUL
   ===================================================== */

/* =====================================================
   AMAN LOCALSTORAGE
   FIX BUG: JSON.parse tanpa try/catch. Kalau data di localStorage rusak
   (diedit manual / versi lama), seluruh halaman crash. Sekarang ada
   fallback aman.
   ===================================================== */
const Store = {
    get(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (raw === null) return fallback;
            return JSON.parse(raw);
        } catch (err) {
            console.warn('localStorage rusak untuk key "' + key + '", memakai nilai default.', err);
            return fallback;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (err) {
            console.warn('Gagal menyimpan ke localStorage.', err);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (err) {
            console.warn('Gagal menghapus key "' + key + '" dari localStorage.', err);
        }
    }
};

/* =====================================================
   TOAST - PENGGANTI alert() YANG MENGGANGGU
   ===================================================== */
const Toast = {
    _stackEl: null,

    stack() {
        if (this._stackEl && this._stackEl.isConnected !== false) {
            return this._stackEl;
        }
        const el = document.createElement('div');
        el.id = 'toastStack';
        el.className = 'toast-stack';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        document.body.appendChild(el);
        this._stackEl = el;
        return el;
    },

    show(message, type) {
        const kind = type || 'info';
        const icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };

        const toast = document.createElement('div');
        toast.className = 'toast toast--' + kind;

        const icon = document.createElement('i');
        icon.className = 'fa-solid ' + (icons[kind] || icons.info);
        icon.setAttribute('aria-hidden', 'true');

        /* FIX BUG XSS: pesan disisipkan via textContent, bukan innerHTML */
        const text = document.createElement('span');
        text.textContent = message;

        toast.appendChild(icon);
        toast.appendChild(text);
        this.stack().appendChild(toast);

        window.setTimeout(() => {
            toast.classList.add('is-hiding');
            window.setTimeout(() => toast.remove(), 250);
        }, 3200);
    },

    success(message) { this.show(message, 'success'); },
    error(message) { this.show(message, 'error'); },
    info(message) { this.show(message, 'info'); }
};

/* =====================================================
   DOM BUILDER
   FIX BUG XSS: seluruh user input (nama pasien, username, tanggal)
   sebelumnya masuk lewat innerHTML. Sekarang teks selalu lewat
   textContent sehingga tidak bisa disisipkan HTML/script.
   ===================================================== */
function el(tag, className, textContent) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (textContent !== undefined && textContent !== null) {
        node.textContent = String(textContent);
    }
    return node;
}

function icon(name) {
    const i = document.createElement('i');
    i.className = name;
    i.setAttribute('aria-hidden', 'true');
    return i;
}

function clear(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function byId(id) {
    return document.getElementById(id);
}

/* =====================================================
   FORMAT TANGGAL
   FIX BUG: tanggal janji ditampilkan mentah ("2026-09-30") sedangkan
   telemedicine memakai toLocaleString. Sekarang konsisten.
   ===================================================== */
function formatTanggal(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatTanggalWaktu(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatRupiah(angka) {
    const nilai = parseInt(angka, 10);
    if (isNaN(nilai)) return 'Rp 0';
    return 'Rp ' + nilai.toLocaleString('id-ID');
}

/* =====================================================
   TANGGAL
   FIX BUG: input tanggal/waktu tidak punya batas minimum, jadi pengguna
   bisa booking di masa lalu. Sekarang divalidasi.
   ===================================================== */
function hariIniISO() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function nowLocalISO() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

/* =====================================================
   HASH PASSWORD
   FIX BUG: password disimpan polos (plaintext) di localStorage sehingga
   siapa pun yang buka DevTools bisa membacanya. Sekarang di-hash + salt.
   CATATAN: untuk produksi sungguhan, ini masih TIDAK cukup - hashing
   password dan sesi harus dilakukan di server.
   ===================================================== */
function subtleTersedia() {
    return typeof crypto !== 'undefined' &&
           crypto.subtle &&
           typeof crypto.subtle.digest === 'function';
}

/* Fallback untuk file:// (bukan secure context, crypto.subtle tidak ada).
   Jauh lebih baik daripada menyimpan password polos, tapi tetap lemah. */
function hashSimple(teks) {
    let h1 = 0x811c9dc5;
    let h2 = 0x01000193;
    for (let i = 0; i < teks.length; i++) {
        const c = teks.charCodeAt(i);
        h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
        h2 = Math.imul(h2 + c, 0x85ebca6b) >>> 0;
    }
    return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

async function hashPassword(password, salt, algo) {
    const payload = salt + '::' + password;

    /* Algo ikut disimpan per akun, supaya akun yang dibuat saat file dibuka
       lewat file:// (hash cadangan) tetap bisa login setelah dijalankan
       lewat http://localhost (SHA-256), dan sebaliknya. */
    if (algo === 'weak' || !subtleTersedia()) {
        if (algo !== 'weak') {
            console.warn('crypto.subtle tidak tersedia (bukankah secure context). '
                + 'Memakai hash cadangan yang lemah - jalankan lewat http://localhost untuk SHA-256.');
        }
        return 'weak:' + hashSimple(payload);
    }

    const data = new TextEncoder().encode(payload);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function makeSalt() {
    if (window.crypto && crypto.getRandomValues) {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return String(Date.now()) + Math.random().toString(16).slice(2);
}
