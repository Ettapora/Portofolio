document.addEventListener('DOMContentLoaded', () => {
    if (!api.getToken()) {
        window.location.href = 'login.html';
        return;
    }
    loadSkills();

    // Event listener buat submit form
    document.getElementById('skillForm').addEventListener('submit', handleFormSubmit);

    // Scroll Spy buat Navbar
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        let current = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            // Kurangi sedikit offset biar pas nyentuh bagian atas langsung pindah
            if (pageYOffset >= sectionTop - 150) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href").includes(current)) {
                link.classList.add("active");
            }
        });
    });
});

// READ: Ambil data skills dari backend
async function loadSkills() {
    const tbody = document.getElementById('skills-tbody');
    try {
        const response = await api.fetch('/skills');
        const result = await response.json();

        if (response.ok && result.success) {
            if (result.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #888;">[ NO SKILLS FOUND IN DATABASE ]</td></tr>`;
                return;
            }

            tbody.innerHTML = result.data.map(skill => `
                <tr>
                    <td>#${skill.id}</td>
                    <td><i class="${skill.icon_class}"></i></td>
                    <td>${skill.nama_skill}</td>
                    <td>
                        <button class="btn-neon" style="padding: 5px 10px; font-size: 0.8rem;" 
                                onclick="editSkill(${skill.id}, '${skill.nama_skill}', '${skill.icon_class}')">
                            [ EDIT ]
                        </button>
                        <button class="btn-neon btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" 
                                onclick="deleteSkill(${skill.id})">
                            [ DEL ]
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error("Gagal memuat skills:", error);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ef4444;">[ SYSTEM ERROR FETCHING DATA ]</td></tr>`;
    }
}

// CREATE / UPDATE: Proses pas tombol EXECUTE ditekan
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('skillId').value;
    const nama_skill = document.getElementById('nama_skill').value;
    const icon_class = document.getElementById('icon_class').value;
    const saveBtn = document.getElementById('saveBtn');

    saveBtn.textContent = '[ EXECUTING... ]';
    saveBtn.disabled = true;

    try {
        const isUpdate = id !== '';
        const endpoint = isUpdate ? `/skills/${id}` : '/skills';
        const method = isUpdate ? 'PUT' : 'POST';

        const response = await api.fetch(endpoint, {
            method: method,
            body: JSON.stringify({ nama_skill, icon_class })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            closeModal();
            loadSkills(); // Refresh tabel setelah berhasil
        } else {
            alert(`> ERROR: ${result.error}`);
        }
    } catch (error) {
        alert("> FATAL ERROR: Gagal menyimpan data ke server.");
    } finally {
        saveBtn.textContent = '[ EXECUTE ]';
        saveBtn.disabled = false;
    }
}

// Buka form untuk EDIT data
function editSkill(id, nama, icon) {
    document.getElementById('modalTitle').textContent = '> _ Edit Skill';
    document.getElementById('skillId').value = id;
    document.getElementById('nama_skill').value = nama;
    document.getElementById('icon_class').value = icon;
    
    document.getElementById('skillModal').classList.add('active');
}

// DELETE: Hapus data (pakai konfirmasi dulu biar ga asal kepencet)
async function deleteSkill(id) {
    const isConfirmed = await window.cyberConfirm("Are you sure you want to delete this skill data? This action is irreversible.");
    if (isConfirmed) {
        try {
            const response = await api.fetch(`/skills/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (response.ok && result.success) {
                loadSkills();
            } else {
                alert(`> ERROR: ${result.error}`);
            }
        } catch (error) {
            alert("> FATAL ERROR: Gagal menghapus data.");
        }
    }
}

// Utility Modal
function openModal() {
    document.getElementById('modalTitle').textContent = '> _ Add New Skill';
    document.getElementById('skillId').value = '';
    document.getElementById('skillForm').reset();
    document.getElementById('skillModal').classList.add('active');
}

function closeModal() {
    document.getElementById('skillModal').classList.remove('active');
}