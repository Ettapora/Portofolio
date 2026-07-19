document.addEventListener('DOMContentLoaded', () => {
    if (!api.getToken()) return window.location.href = 'login.html';
    loadProjects();
    document.getElementById('projectForm').addEventListener('submit', handleFormSubmit);
    // Script buat nangkep nama file yang dipilih dan nampilin di teks
    const fileInput = document.getElementById('gambar_file');
    const fileNameDisplay = document.getElementById('file-name-display');

    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                fileNameDisplay.textContent = `> ${e.target.files[0].name}`;
                fileNameDisplay.style.color = '#e0e0e0';
            } else {
                fileNameDisplay.textContent = '> Awaiting file_';
                fileNameDisplay.style.color = '#888';
            }
        });
    }
});

async function loadProjects() {
    const tbody = document.getElementById('projects-tbody');
    try {
        const response = await api.fetch('/projects');
        const result = await response.json();
        
        if (response.ok && result.success) {
            if (result.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #888;">[ NO PROJECTS FOUND ]</td></tr>`;
                return;
            }
            
            tbody.innerHTML = result.data.map(p => `
                <tr>
                    <td>
                        ${p.gambar_url 
                            ? `<img src="${p.gambar_url}" class="img-preview-table" alt="Preview">` 
                            : `<div style="width: 80px; height: 50px; border: 1px dashed #333; display: flex; align-items: center; justify-content: center; color: #888; font-size: 0.7rem;">NO IMG</div>`
                        }
                    </td>
                    <td>${p.judul}</td>
                    <td>${p.deskripsi.substring(0, 50)}${p.deskripsi.length > 50 ? '...' : ''}</td>
                    <td>
                        <button class="btn-neon" style="padding: 5px 10px; font-size: 0.8rem;" onclick="editProject(${p.id})">[ EDIT ]</button>
                        <button class="btn-neon btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" onclick="deleteProject(${p.id})">[ DEL ]</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ef4444;">[ SYSTEM ERROR ]</td></tr>`;
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('projectId').value;
    const fileInput = document.getElementById('gambar_file');
    const saveBtn = document.getElementById('saveBtn');
    const uploadStatus = document.getElementById('upload-status');
    
    let finalGambarUrl = document.getElementById('gambar_url').value;

    saveBtn.textContent = '[ PROCESSING... ]';
    saveBtn.disabled = true;

    try {
        // Jika user memilih file gambar baru, upload ke Cloudinary dulu!
        if (fileInput.files.length > 0) {
            uploadStatus.style.display = 'block';
            uploadStatus.textContent = '> UPLOADING IMAGE TO CLOUD_ SERVER...';
            
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            
            // Bypass api.fetch() khusus untuk file upload supaya header multipart/form-data valid
            const token = api.getToken();
            const uploadRes = await fetch('/api/upload/image', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            
            const uploadResult = await uploadRes.json();
            
            if (uploadRes.ok && uploadResult.success) {
                finalGambarUrl = uploadResult.url;
                uploadStatus.textContent = '> IMAGE UPLOAD SUCCESS.';
            } else {
                throw new Error(uploadResult.error || "Gagal upload gambar.");
            }
        }

        // Setelah urusan gambar beres (atau di-skip), baru POST/PUT data teks ke TiDB
        const body = {
            judul: document.getElementById('judul').value,
            deskripsi: document.getElementById('deskripsi').value,
            link_project: document.getElementById('link_project').value,
            gambar_url: finalGambarUrl
        };

        const endpoint = id ? `/projects/${id}` : '/projects';
        const method = id ? 'PUT' : 'POST';
        
        const response = await api.fetch(endpoint, {
            method: method,
            body: JSON.stringify(body)
        });
        
        const result = await response.json();

        if (response.ok && result.success) {
            closeModal();
            loadProjects();
        } else {
            alert(`> ERROR: ${result.error}`);
        }
    } catch (error) {
        alert(`> FATAL ERROR: ${error.message}`);
    } finally {
        saveBtn.textContent = '[ EXECUTE ]';
        saveBtn.disabled = false;
        uploadStatus.style.display = 'none';
        fileInput.value = ''; // Reset file input
    }
}

async function editProject(id) {
    try {
        const response = await api.fetch(`/projects/${id}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            const p = result.data;
            document.getElementById('modalTitle').textContent = '> _ Edit Project';
            document.getElementById('projectId').value = p.id;
            document.getElementById('judul').value = p.judul;
            document.getElementById('deskripsi').value = p.deskripsi;
            document.getElementById('link_project').value = p.link_project || '';
            document.getElementById('gambar_url').value = p.gambar_url || '';
            
            // Selalu kosongkan input file dan kembalikan teks display ke default
            document.getElementById('gambar_file').value = ''; 
            const fileNameDisplay = document.getElementById('file-name-display');
            if (fileNameDisplay) {
                fileNameDisplay.textContent = '> Awaiting file_';
                fileNameDisplay.style.color = '#888';
            }
            
            document.getElementById('projectModal').classList.add('active');
        }
    } catch (e) {
        alert("> ERROR: Gagal mengambil data.");
    }
}

async function deleteProject(id) {
    const isConfirmed = await window.cyberConfirm("Are you sure you want to delete this project? Image links will also be unlinked.");
    if (isConfirmed) {
        try {
            const res = await api.fetch(`/projects/${id}`, { method: 'DELETE' });
            if (res.ok) loadProjects();
        } catch (e) {
            alert("> FATAL ERROR.");
        }
    }
}

function openModal() {
    document.getElementById('modalTitle').textContent = '> _ Add New Project';
    document.getElementById('projectId').value = '';
    document.getElementById('gambar_url').value = '';
    document.getElementById('projectForm').reset();
    
    // Kembalikan teks display ke default
    const fileNameDisplay = document.getElementById('file-name-display');
    if (fileNameDisplay) {
        fileNameDisplay.textContent = '> Awaiting file_';
        fileNameDisplay.style.color = '#888';
    }
    
    document.getElementById('projectModal').classList.add('active');
}

function closeModal() {
    document.getElementById('projectModal').classList.remove('active');
}