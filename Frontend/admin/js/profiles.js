document.addEventListener('DOMContentLoaded', () => {
    if (!api.getToken()) return window.location.href = 'login.html';
    loadProfile();
    document.getElementById('profileForm').addEventListener('submit', handleProfileSubmit);
});

const fields = ['nama_lengkap', 'nama_panggilan', 'email', 'telepon', 'tempat_lahir', 'tanggal_lahir', 'universitas', 'fakultas', 'prodi', 'semester', 'alamat', 'foto_url'];

async function loadProfile() {
    try {
        const res = await api.fetch('/profiles');
        const result = await res.json();
        
        if (res.ok && result.success && Object.keys(result.data).length > 0) {
            const data = result.data;
            fields.forEach(f => {
                if(data[f]) {
                    if (f === 'tanggal_lahir') {
                        // Bikin objek Date Javascript dari string server
                        const dateObj = new Date(data[f]);
                        
                        // Ekstrak tahun, bulan, dan hari. Tambahin '0' di depan kalau angkanya di bawah 10
                        const year = dateObj.getFullYear();
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        
                        // Gabungin jadi format yyyy-MM-dd
                        document.getElementById(f).value = `${year}-${month}-${day}`;
                    } else {
                        document.getElementById(f).value = data[f];
                    }
                }
            });
        }
    } catch (e) {
        console.error("Gagal narik profil.");
    }
}

async function handleProfileSubmit(e) {
    e.preventDefault();
    const saveBtn = document.getElementById('saveBtn');
    const statusMsg = document.getElementById('status-msg');
    
    saveBtn.textContent = '[ UPLOADING... ]';
    saveBtn.disabled = true;
    statusMsg.style.display = 'none';

    let body = {};
    fields.forEach(f => body[f] = document.getElementById(f).value);

    try {
        const res = await api.fetch('/profiles', {
            method: 'POST', // Backend lu handle POST/PUT sekaligus untuk upsert
            body: JSON.stringify(body)
        });
        const result = await res.json();

        if (res.ok && result.success) {
            statusMsg.style.display = 'block';
            setTimeout(() => statusMsg.style.display = 'none', 3000);
        } else {
            alert(`> ERROR: ${result.error}`);
        }
    } catch (error) {
        alert("> FATAL ERROR: Gagal menyimpan data profil.");
    } finally {
        saveBtn.textContent = '[ UPLOAD DATA ]';
        saveBtn.disabled = false;
    }
}