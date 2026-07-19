document.addEventListener('DOMContentLoaded', () => {
    // Pastikan user udah login sebelum render dashboard
    if (!api.getToken()) {
        window.location.href = 'login.html';
        return;
    }

    loadDashboardStats();
    loadRecentActivity();
});

async function loadDashboardStats() {
    try {
        const response = await api.fetch('/dashboard/stats');
        const result = await response.json();

        if (response.ok && result.success) {
            document.getElementById('stat-projects').textContent = result.data.projects_count;
            document.getElementById('stat-skills').textContent = result.data.skills_count;
            document.getElementById('stat-experiences').textContent = result.data.experiences_count;
            
            // Tampilin nama admin di topbar
            document.getElementById('admin-name').textContent = `User: ${result.data.admin_name}`;
        }
    } catch (error) {
        console.error("Gagal memuat statistik dashboard:", error);
        document.getElementById('admin-name').textContent = "User: UNKNOWN";
    }
}

async function loadRecentActivity() {
    try {
        const response = await api.fetch('/dashboard/recent');
        const result = await response.json();
        const activityList = document.getElementById('recent-activity');

        if (response.ok && result.success) {
            if (result.data.length === 0) {
                activityList.innerHTML = `<li><span class="type">[ NO LOGS FOUND IN DATABASE ]</span></li>`;
                return;
            }

            // Render daftar aktivitas
            activityList.innerHTML = result.data.map(item => {
                const title = item.type === 'project' ? item.judul : item.posisi;
                const date = new Date(item.created_at).toLocaleDateString('id-ID');
                
                return `
                    <li>
                        <span>> ${title}</span>
                        <span class="type">[${item.type.toUpperCase()}] - ${date}</span>
                    </li>
                `;
            }).join('');
        }
    } catch (error) {
        console.error("Gagal memuat aktivitas:", error);
        document.getElementById('recent-activity').innerHTML = `<li><span class="type" style="color: #ef4444;">[ SYSTEM ERROR FETCHING LOGS ]</span></li>`;
    }
}