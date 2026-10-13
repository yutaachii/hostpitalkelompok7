/* =====================================================
   AUTH - LOGIN, REGISTRASI, LOGOUT
   ===================================================== */

const STORAGE_KEYS = {
    users: 'rs_registered_users',
    activeUser: 'rs_active_user'
};

let isLoginMode = true;

/* FIX BUG: tombol auth sebelumnya berada di luar <form>, jadi menekan
   Enter tidak melakukan submit. Sekarang form-nya sungguhan <form>. */
function initAuth() {
    const form = byId('authForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            handleAuthSubmit();
        });
    }

    const toggle = byId('authToggleBtn');
    if (toggle) {
        toggle.addEventListener('click', toggleAuthMode);
        toggle.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleAuthMode();
            }
        });
    }
}

function openAuthModal() {
    isLoginMode = true;
    /* FIX BUG: form auth tidak pernah di-reset, jadi username/password
       user sebelumnya masih tertinggal di kolom isian. */
    const form = byId('authForm');
    if (form) form.reset();
    updateAuthFormView();
    Modal.open('authModal');
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const form = byId('authForm');
    if (form) form.reset();
    updateAuthFormView();
}

function updateAuthFormView() {
    const title = byId('authTitle');
    const submitBtn = byId('authSubmitBtn');
    const toggleBtn = byId('authToggleBtn');
    const confirmGroup = byId('confirmPassGroup');
    const confirmInput = byId('authConfirmPassword');

    if (isLoginMode) {
        title.textContent = 'Login Akun';
        submitBtn.textContent = 'Login';
        toggleBtn.textContent = 'Belum punya akun? Daftar di sini.';
        confirmGroup.hidden = true;
        if (confirmInput) confirmInput.required = false;
        byId('authPassword').setAttribute('autocomplete', 'current-password');
    } else {
        title.textContent = 'Daftar Akun Baru';
        submitBtn.textContent = 'Daftar Akun';
        toggleBtn.textContent = 'Sudah punya akun? Login di sini.';
        confirmGroup.hidden = false;
        if (confirmInput) confirmInput.required = true;
        byId('authPassword').setAttribute('autocomplete', 'new-password');
    }
}

async function handleAuthSubmit() {
    const username = byId('authUsername').value.trim();
    const password = byId('authPassword').value;
    const konfirmasi = byId('authConfirmPassword').value;

    if (!username || !password) {
        Toast.error('Harap isi username dan password.');
        return;
    }

    const users = Store.get(STORAGE_KEYS.users, {});

    if (isLoginMode) {
        await prosesLogin(username, password, users);
    } else {
        await prosesRegister(username, password, konfirmasi, users);
    }
}

/* FIX BUG: ada backdoor hardcoded admin/123456 di kode lama. Sudah dihapus -
   sekarang satu-satunya cara masuk adalah akun yang benar-benar didaftarkan. */
async function prosesLogin(username, password, users) {
    const akun = users[username];

    if (!akun) {
        Toast.error('Username atau password salah.');
        return;
    }

    const hash = await hashPassword(password, akun.salt, akun.algo);
    if (hash !== akun.hash) {
        Toast.error('Username atau password salah.');
        return;
    }

    Store.set(STORAGE_KEYS.activeUser, username);
    Toast.success('Selamat datang kembali, ' + username + '!');
    Auth.updateUserUI();
    Modal.close('authModal');
}

async function prosesRegister(username, password, konfirmasi, users) {
    if (password.length < CONFIG.minPasswordLength) {
        Toast.error('Password minimal ' + CONFIG.minPasswordLength + ' karakter.');
        return;
    }

    if (password !== konfirmasi) {
        Toast.error('Konfirmasi password tidak cocok.');
        return;
    }

    if (users[username]) {
        Toast.error('Username sudah terdaftar. Gunakan username lain.');
        return;
    }

    /* FIX BUG: password dulu disimpan polos (plaintext). */
    const salt = makeSalt();
    const hash = await hashPassword(password, salt);
    const algo = hash.indexOf('weak:') === 0 ? 'weak' : 'sha256';

    users[username] = {
        hash: hash,
        salt: salt,
        algo: algo,
        dibuat: new Date().toISOString()
    };

    if (!Store.set(STORAGE_KEYS.users, users)) {
        Toast.error('Gagal menyimpan akun. Penyimpanan browser mungkin penuh.');
        return;
    }

    Toast.success('Registrasi berhasil. Silakan login.');
    isLoginMode = true;
    updateAuthFormView();
}

function getActiveUser() {
    return Store.get(STORAGE_KEYS.activeUser, null);
}

const Auth = {
    updateUserUI: function () {
        const user = getActiveUser();
        const sec = byId('userSection');
        if (!sec) return;

        clear(sec);

        if (user) {
            const wrapper = el('div', 'user-info');
            wrapper.appendChild(icon('fas fa-user-circle'));

            /* FIX BUG XSS: username dulu disisipkan lewat innerHTML, jadi
               akun dengan username "<img onerror=...>" bisa menjalankan
               script. Sekarang lewat textContent. */
            wrapper.appendChild(document.createTextNode('Halo, ' + user));

            const btn = el('button', 'logout-btn', 'Logout');
            btn.type = 'button';
            btn.addEventListener('click', this.logout);
            wrapper.appendChild(btn);

            sec.appendChild(wrapper);
        } else {
            const btn = el('button', 'login-btn', 'Login / Daftar');
            btn.type = 'button';
            btn.addEventListener('click', openAuthModal);
            sec.appendChild(btn);
        }
    },

    logout: function () {
        Store.remove(STORAGE_KEYS.activeUser);
        Auth.updateUserUI();
        Janji.render();
        Telemedicine.render();
        Toast.info('Anda telah logout.');
    }
};
