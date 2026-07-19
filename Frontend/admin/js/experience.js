document.addEventListener('DOMContentLoaded', () => {
    if (!api.getToken()) return window.location.href = 'login.html';
    loadExperiences();
    document.getElementById('expForm').addEventListener('submit', handleFormSubmit);
});

async function loadExperiences() {
    const tbody = document.getElementById('exp-tbody');
    try {
        const response = await api.fetch('/experiences');
        const result = await response.json();
        if (response.ok && result.success) {
            if (result.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #888;">[ NO LOGS FOUND ]</td></tr>`;
                return;
            }
            tbody.innerHTML = result.data.map(exp => `
                <tr>
                    <td>#${exp.id}</td>
                    <td>${exp.posisi}</td>
                    <td>${exp.perusahaan}</td>
                    <td>${exp.durasi}</td>
                    <td>
                        <button class="btn-neon" style="padding: 5px 10px; font-size: 0.8rem;" 
                            onclick="editExperience(${exp.id})">[ EDIT ]</button>
                        <button class="btn-neon btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" 
                            onclick="deleteExperience(${exp.id})">[ DEL ]</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ef4444;">[ SYSTEM ERROR ]</td></tr>`;
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('expId').value;
    const body = {
        posisi: document.getElementById('posisi').value,
        perusahaan: document.getElementById('perusahaan').value,
        durasi: document.getElementById('durasi').value,
        deskripsi: document.getElementById('deskripsi').value
    };

    const saveBtn = document.getElementById('saveBtn');
    saveBtn.textContent = '[ EXECUTING... ]';
    saveBtn.disabled = true;

    try {
        const endpoint = id ? `/experiences/${id}` : '/experiences';
        const method = id ? 'PUT' : 'POST';
        const response = await api.fetch(endpoint, { method, body: JSON.stringify(body) });
        const result = await response.json();

        if (response.ok && result.success) {
            closeModal();
            loadExperiences();
        } else {
            alert(`> ERROR: ${result.error}`);
        }
    } catch (error) {
        alert("> FATAL ERROR: Koneksi terputus.");
    } finally {
        saveBtn.textContent = '[ EXECUTE ]';
        saveBtn.disabled = false;
    }
}

async function editExperience(id) {
    try {
        const response = await api.fetch(`/experiences/${id}`);
        const result = await response.json();
        if (response.ok && result.success) {
            const exp = result.data;
            document.getElementById('modalTitle').textContent = '> _ Edit Experience';
            document.getElementById('expId').value = exp.id;
            document.getElementById('posisi').value = exp.posisi;
            document.getElementById('perusahaan').value = exp.perusahaan;
            document.getElementById('durasi').value = exp.durasi;
            document.getElementById('deskripsi').value = exp.deskripsi;
            document.getElementById('expModal').classList.add('active');
        }
    } catch (e) {
        alert("> ERROR: Gagal mengambil data server.");
    }
}

async function deleteExperience(id) {
    const isConfirmed = await window.cyberConfirm("Confirm deletion of this experience log? It will be purged from the database.");
    if (isConfirmed) {
        try {
            const res = await api.fetch(`/experiences/${id}`, { method: 'DELETE' });
            if (res.ok) loadExperiences();
        } catch (e) { alert("> FATAL ERROR."); }
    }
}

function openModal() {
    document.getElementById('modalTitle').textContent = '> _ Add Experience';
    document.getElementById('expId').value = '';
    document.getElementById('expForm').reset();
    document.getElementById('expModal').classList.add('active');
}
function closeModal() { document.getElementById('expModal').classList.remove('active'); }