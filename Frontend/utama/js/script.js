document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Scroll Spy buat Navbar
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        let current = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
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

    // Load Data Utama
    await loadPublicData();

    // Handle Form Kontak
    setupContactForm();

    // Hamburger Menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if(hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
});

async function loadPublicData() {
    try {
        const response = await fetch('http://localhost:5000/api/portfolio');
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        
        const res = await response.json();
        
        if (!res.success || !res.data) {
            showError('No data available.');
            return;
        }

        const { profile, skills, experiences, projects } = res.data;

        if (!profile || !profile.nama_lengkap) {
            showError('No profile data available.');
            return;
        }

        renderHero(profile);
        renderAbout(profile);
        renderSkills(skills || []);
        renderExperiences(experiences || []);
        renderProjects(projects || []);
        renderContact(profile);

    } catch (error) {
        console.error('Fetch Error:', error);
        showError('Failed to fetch data.');
    }
}

function showError(msg) {
    const heroContent = document.getElementById('hero-content');
    if (heroContent) {
        heroContent.innerHTML = `<div class="error-state"><i class="fas fa-exclamation-circle"></i> ${msg}</div>`;
    }
}

function renderHero(p) {
    const hero = document.getElementById('hero-content');
    if (!hero) return;

    // Pakai struktur HTML khusus untuk gaya terminal
    hero.innerHTML = `
        <div class="terminal-box">
            <h4 class="cmd-prompt"><span class="neon-text">$</span> whoami</h4>
            <h1>${escapeHtml(p.nama_lengkap)}</h1>
            <div class="typewriter">
                <p>>_ Backend Developer & Database Enthusiast.</p>
            </div>
            <a href="#projects" class="btn-neon">[ EXECUTE: VIEW_PROJECTS ]</a>
        </div>
    `;
}

function renderAbout(p) {
    const img = document.getElementById('profile-photo');
    const placeholder = document.getElementById('photo-placeholder');
    
    if (img && placeholder) {
        if (p.foto_url) {
            img.src = p.foto_url;
            img.style.display = 'block';
            placeholder.style.display = 'none';
        } else {
            img.style.display = 'none';
            placeholder.style.display = 'flex';
        }
    }

    const aboutText = document.getElementById('about-text');
    if (aboutText) {
        aboutText.innerHTML = `
            <h3>[ IDENTITY_VERIFIED ] : ${escapeHtml(p.nama_lengkap)}</h3>
            
            <p>Saya adalah mahasiswa semester ${escapeHtml(p.semester)} di program studi ${escapeHtml(p.prodi)}, ${escapeHtml(p.fakultas)} - ${escapeHtml(p.universitas)}.</p>
            
            <p>Saat ini beroperasi dari ${escapeHtml(p.alamat)}.</p>
            
            <a href="#contact" class="btn-neon">[ INITIATE_CONTACT ]</a>
        `;
    }
}

function renderSkills(skills) {
    const container = document.getElementById('skills-container');
    if (!container) return;

    if (!skills.length) {
        container.innerHTML = '<p class="empty-state">No skill data available.</p>';
        return;
    }
    
    container.innerHTML = skills.map(s => `
        <div class="skill-card">
            <i class="${escapeHtml(s.icon_class || 'fas fa-code')}"></i>
            <h4>${escapeHtml(s.nama_skill)}</h4>
        </div>
    `).join('');
}

function renderExperiences(exps) {
    const container = document.getElementById('experience-container');
    if (!container) return;

    if (!exps.length) {
        container.innerHTML = '<p class="empty-state">No experience data available.</p>';
        return;
    }

    container.innerHTML = exps.map(e => `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <span class="timeline-date">${escapeHtml(e.durasi)}</span>
                <h3>${escapeHtml(e.posisi)}</h3>
                <h4>${escapeHtml(e.perusahaan)}</h4>
                <p>${escapeHtml(e.deskripsi)}</p>
            </div>
        </div>
    `).join('');
}

function renderProjects(projs) {
    const container = document.getElementById('projects-container');
    if (!container) return;

    if (!projs.length) {
        container.innerHTML = '<p class="empty-state">No project data available.</p>';
        return;
    }

    container.innerHTML = projs.map(p => `
        <div class="project-card">
            <div class="project-img-wrapper">
                ${p.gambar_url 
                    ? `<img src="${escapeHtml(p.gambar_url)}" alt="${escapeHtml(p.judul)}" class="project-img" loading="lazy">` 
                    : '<div class="project-img" style="display:flex;align-items:center;justify-content:center;background:#eee;"><i class="fas fa-box-open"></i></div>'}
                
                <div class="project-overlay">
                    <h3 class="project-title-overlay">${escapeHtml(p.judul)}</h3>
                </div>
            </div>
            
            <div class="project-info">
                <p>${escapeHtml(p.deskripsi?.substring(0, 120))}${p.deskripsi?.length > 120 ? '...' : ''}</p>
                <div class="project-links">
                    ${p.link_project ? `<a href="${escapeHtml(p.link_project)}" target="_blank"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function renderContact(p) {
    const emailDisplay = document.getElementById('contact-email-display');
    if (emailDisplay && p.email) {
        emailDisplay.innerHTML = `> CONNECTION ESTABLISHED. Siap untuk berdiskusi atau sekadar bertukar pikiran? Ping server saya melalui form di bawah atau secara langsung melalui node <strong>${escapeHtml(p.email)}</strong>.`;
    }
}

function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const btn = document.getElementById('sendBtn');
        const originalText = btn.textContent;
        
        btn.disabled = true;
        btn.textContent = 'Sending...';
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Ini yang lu benerin kemaren
                    nama: document.getElementById('contactName').value,
                    email: document.getElementById('contactEmail').value,
                    pesan: document.getElementById('contactMessage').value
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Ganti alert bawaan jadi cyberAlert
                await window.cyberAlert('TRANSMISSION_SUCCESS', result.message);
                contactForm.reset();
            } else {
                // Ganti alert bawaan jadi cyberAlert
                await window.cyberAlert('TRANSMISSION_FAILED', result.error || 'Failed to send message.');
            }
        } catch (error) {
            // Ganti alert bawaan jadi cyberAlert
            await window.cyberAlert('SYSTEM_ERROR', 'An error occurred while sending the message.');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

// Custom Alert Box
window.cyberAlert = function(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('sysAlertModal');
        const titleEl = document.getElementById('sysAlertTitle');
        const msgEl = document.getElementById('sysAlertMsg');
        const btnOk = document.getElementById('sysAlertOk');

        if (!modal) {
            // Fallback aman kalau lu lupa pasang HTML-nya
            alert(title + ": " + message);
            resolve();
            return;
        }

        // Set pesan dan judul
        titleEl.textContent = '> _ ' + title;
        msgEl.textContent = message;
        
        // Tampilkan modal
        modal.classList.add('active');

        // Bersihkan listener biar ga numpuk
        const cleanup = () => {
            modal.classList.remove('active');
            btnOk.replaceWith(btnOk.cloneNode(true));
            resolve();
        };

        // Pasang event ke tombol OK
        document.getElementById('sysAlertOk').addEventListener('click', cleanup);
    });
};

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}