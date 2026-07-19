// Konfigurasi dasar URL Backend Flask lu
const API_URL = '';

const api = {
    // Fungsi untuk ngambil, nyimpen, dan hapus token dari LocalStorage browser
    getToken: () => localStorage.getItem('token'),
    setToken: (token) => localStorage.setItem('token', token),
    removeToken: () => localStorage.removeItem('token'),

    // Fungsi fetch custom yang super pinter
    fetch: async (endpoint, options = {}) => {
        const token = api.getToken();
        
        // Siapkan headers bawaan
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Kalau token ada, selipin ke header Authorization
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            // Nembak ke Flask backend
            const response = await window.fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers
            });

            // PROTEKSI KRITIS: Kalau backend bilang 401 (Unauthorized) / Token Expired
            // dan lu lagi gak di halaman login, langsung tendang balik ke login!
            if (response.status === 401 && !window.location.href.includes('login.html')) {
                console.warn("[SECURITY] Token tidak valid atau kadaluarsa. Menendang ke login...");
                api.removeToken();
                window.location.href = 'login.html';
                return null; 
            }

            return response;
        } catch (error) {
            console.error("[API FETCH ERROR]", error);
            throw error;
        }
    },
    
    // Fungsi logout global
    logout: async () => {
        try {
            // Kasih tau backend buat hapus session (opsional karena kita pakai JWT di client)
            await api.fetch('/logout', { method: 'POST' });
        } catch (e) {
            console.error("Gagal menghubungi server saat logout", e);
        } finally {
            // Yang paling penting: hancurkan token di frontend
            api.removeToken();
            window.location.href = 'login.html';
        }
    }
};

// Global Custom Confirm Box
window.cyberConfirm = function(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('sysConfirmModal');
        const msgEl = document.getElementById('sysConfirmMsg');
        const btnOk = document.getElementById('sysConfirmOk');
        const btnCancel = document.getElementById('sysConfirmCancel');

        if (!modal) {
            console.error("Modal konfirmasi tidak ditemukan di HTML!");
            resolve(false);
            return;
        }

        // Set pesan
        msgEl.textContent = message;
        
        // Tampilkan modal
        modal.classList.add('active');

        // Bersihkan event listener lama biar gak kepanggil dobel
        const cleanup = () => {
            modal.classList.remove('active');
            btnOk.replaceWith(btnOk.cloneNode(true));
            btnCancel.replaceWith(btnCancel.cloneNode(true));
        };

        // Pasang event listener baru
        document.getElementById('sysConfirmOk').addEventListener('click', () => {
            cleanup();
            resolve(true); // Return TRUE kayak klik OK di pop-up asli
        });

        document.getElementById('sysConfirmCancel').addEventListener('click', () => {
            cleanup();
            resolve(false); // Return FALSE
        });
    });
};

// Global function untuk tombol logout di base.html
window.handleLogout = () => {
    api.logout();
};