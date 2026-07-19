document.addEventListener('DOMContentLoaded', () => {
    // Cek dulu, kalau udah punya token ngapain nongkrong di halaman login?
    const token = api.getToken();
    if (token) {
        // Verifikasi tokennya masih hidup atau nggak ke backend
        api.fetch('/auth/check')
            .then(res => {
                if (res && res.ok) {
                    window.location.href = 'dashboard.html';
                } else {
                    api.removeToken(); // Token busuk, hapus aja
                }
            })
            .catch(() => api.removeToken());
    }

    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const errorMsg = document.getElementById('error-msg');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Cegah halaman reload otomatis
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Ubah teks tombol biar ada efek loading ala terminal
            const originalBtnText = loginBtn.textContent;
            loginBtn.textContent = '[ AUTHENTICATING... ]';
            loginBtn.disabled = true;
            errorMsg.style.display = 'none';

            try {
                // Tembak endpoint login di backend Flask lu
                const response = await api.fetch('/login', {
                    method: 'POST',
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (response.ok) {
                    // BERHASIL: Simpan token ke brankas browser
                    api.setToken(result.token);
                    
                    // Ganti teks tombol jadi sukses, lalu lempar ke dashboard
                    loginBtn.textContent = '[ ACCESS GRANTED ]';
                    loginBtn.style.color = '#00ff00';
                    loginBtn.style.borderColor = '#00ff00';
                    
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500); // Jeda 0.5 detik biar efeknya kelihatan keren
                    
                } else {
                    // GAGAL: Tampilkan pesan error dari backend
                    errorMsg.textContent = `> ERROR: ${result.error || 'Autentikasi ditolak.'}`;
                    errorMsg.style.display = 'block';
                    loginBtn.textContent = originalBtnText;
                    loginBtn.disabled = false;
                }
            } catch (error) {
                // GAGAL TOTAL: Server Flask mati atau gak ke-reach
                errorMsg.textContent = '> FATAL ERROR: Server tidak merespon. Cek terminal lu!';
                errorMsg.style.display = 'block';
                loginBtn.textContent = originalBtnText;
                loginBtn.disabled = false;
            }
        });
    }
});