document.addEventListener("DOMContentLoaded", () => {
    // ========================================
    // DOM ELEMENTS
    // ========================================
    const authSection = document.getElementById("auth-section");
    const dashboardSection = document.getElementById("dashboard-section");
    const loginForm = document.getElementById("login-form");
    const loginBtn = document.getElementById("login-btn");
    const signupToggleBtn = document.getElementById("signup-toggle-btn");
    const authEmailInput = document.getElementById("auth-email");
    const authPasswordInput = document.getElementById("auth-password");
    const authHint = document.getElementById("auth-hint");
    const logoutBtn = document.getElementById("logout-btn");
    const userEmailDisplay = document.getElementById("user-email-display");
    const userAvatarInitial = document.getElementById("user-avatar-initial");

    // Header & Navigation
    const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
    const tabPanes = document.querySelectorAll(".tab-pane");
    const currentTabTitle = document.getElementById("current-tab-title");
    const currentTabDesc = document.getElementById("current-tab-desc");
    const topbarActionsProjects = document.getElementById("topbar-actions-projects");

    // Projects elements
    const loadingSpinner = document.getElementById("loading-spinner");
    const projectsGrid = document.getElementById("projects-admin-grid");
    const emptyState = document.getElementById("empty-state");
    const statTotal = document.getElementById("stat-total-projects");
    const statCategories = document.getElementById("stat-total-categories");
    const statLinks = document.getElementById("stat-total-links");
    const seedProjectsBtn = document.getElementById("seed-projects-btn");
    const emptySeedBtn = document.getElementById("empty-seed-btn");
    const emptyAddBtn = document.getElementById("empty-add-btn");
    const openAddModalBtn = document.getElementById("open-add-modal-btn");

    // Project Modal
    const projectModal = document.getElementById("project-modal");
    const modalTitle = document.getElementById("modal-title");
    const projectForm = document.getElementById("project-form");
    const projectIdInput = document.getElementById("project-id");
    const titleInput = document.getElementById("project-title");
    const categoryInput = document.getElementById("project-category");
    const descriptionInput = document.getElementById("project-description");
    const techInput = document.getElementById("project-tech");
    const liveUrlInput = document.getElementById("project-live-url");
    const imageUrlInput = document.getElementById("project-image-url");
    const imageFileInput = document.getElementById("image-file-input");
    const uploadZone = document.getElementById("upload-zone");
    const imagePreviewContainer = document.getElementById("image-preview-container");
    const imagePreview = document.getElementById("image-preview");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const cancelModalBtn = document.getElementById("cancel-modal-btn");
    const saveBtn = document.getElementById("save-project-btn");

    // Settings Forms
    const heroForm = document.getElementById("hero-settings-form");
    const heroImageFileInput = document.getElementById("hero-image-file");
    const heroProfileImageInput = document.getElementById("hero-profile-image");
    const aboutForm = document.getElementById("about-settings-form");
    const skillsForm = document.getElementById("skills-settings-form");
    const contactForm = document.getElementById("contact-settings-form");

    let isSignupMode = false;
    let uploadedFileForSave = null;

    // ========================================
    // TOAST NOTIFICATIONS (Clean, Minimalist)
    // ========================================
    function showToast(message, type = "info") {
        const container = document.getElementById("toast-container");
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(-6px)";
            setTimeout(() => toast.remove(), 250);
        }, 3800);
    }

    // ========================================
    // TAB NAVIGATION
    // ========================================
    const tabMeta = {
        projects: {
            title: "Projects Management",
            desc: "Add, edit, reorder or delete portfolio projects."
        },
        hero: {
            title: "Hero & Introduction",
            desc: "Customize the introductory greeting, titles, and visual presence."
        },
        about: {
            title: "About Me & Statistics",
            desc: "Edit biography paragraphs and metric counter statistics."
        },
        skills: {
            title: "Technical Skills",
            desc: "Specify technologies and tools for each category."
        },
        contact: {
            title: "Contact & Social Profiles",
            desc: "Update public contact information, city, and social profiles."
        }
    };

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const targetTab = item.dataset.tab;

            navItems.forEach(btn => btn.classList.remove("active"));
            item.classList.add("active");

            tabPanes.forEach(pane => {
                pane.style.display = "none";
                pane.classList.remove("active");
            });

            const activePane = document.getElementById(`pane-${targetTab}`);
            if (activePane) {
                activePane.style.display = "block";
                activePane.classList.add("active");
            }

            if (tabMeta[targetTab]) {
                currentTabTitle.textContent = tabMeta[targetTab].title;
                currentTabDesc.textContent = tabMeta[targetTab].desc;
            }

            if (topbarActionsProjects) {
                topbarActionsProjects.style.display = targetTab === "projects" ? "flex" : "none";
            }
        });
    });

    // ========================================
    // AUTH: CHECK SESSION
    // ========================================
    async function checkSession() {
        if (!supabaseClient) {
            showToast("Supabase client is not loaded.", "error");
            return;
        }
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            showDashboard(session.user);
        } else {
            showAuth();
        }
    }

    function showDashboard(user) {
        authSection.style.display = "none";
        dashboardSection.style.display = "flex";
        if (userEmailDisplay) userEmailDisplay.textContent = user.email || "Admin";
        if (userAvatarInitial) {
            userAvatarInitial.textContent = (user.email || "A").charAt(0).toUpperCase();
        }
        loadProjects();
        loadAllSettings();
    }

    function showAuth() {
        authSection.style.display = "flex";
        dashboardSection.style.display = "none";
    }

    // Login / Signup Toggle
    signupToggleBtn.addEventListener("click", () => {
        isSignupMode = !isSignupMode;
        if (isSignupMode) {
            loginBtn.textContent = "Register Admin Account";
            signupToggleBtn.textContent = "Back to Sign In";
            authHint.textContent = "Enter your desired admin credentials to create your account.";
        } else {
            loginBtn.textContent = "Sign In";
            signupToggleBtn.textContent = "Create Admin Account";
            authHint.textContent = "First time? Click 'Create Admin Account' to register your email.";
        }
    });

    // Submit Auth Form
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = authEmailInput.value.trim();
        const password = authPasswordInput.value;

        loginBtn.disabled = true;
        loginBtn.textContent = isSignupMode ? "Registering..." : "Signing In...";

        try {
            if (isSignupMode) {
                const { data, error } = await supabaseClient.auth.signUp({ email, password });
                if (error) throw error;
                showToast("Account registered! Signing you in...", "success");
                const { data: loginData, error: loginErr } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (loginErr) throw loginErr;
                showDashboard(loginData.user);
            } else {
                const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
                showToast("Signed in successfully.", "success");
                showDashboard(data.user);
            }
        } catch (err) {
            showToast(err.message || "Authentication failed", "error");
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = isSignupMode ? "Register Admin Account" : "Sign In";
        }
    });

    // Logout
    logoutBtn.addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        showToast("Signed out.", "info");
        showAuth();
    });

    // ========================================
    // TAB 1: PROJECTS (CRUD)
    // ========================================
    async function loadProjects() {
        if (!loadingSpinner || !projectsGrid) return;
        loadingSpinner.style.display = "flex";
        projectsGrid.style.display = "none";
        emptyState.style.display = "none";

        const { data, error } = await supabaseClient
            .from("portfolio_projects")
            .select("*")
            .order("order_index", { ascending: true })
            .order("created_at", { ascending: true });

        loadingSpinner.style.display = "none";

        if (error) {
            showToast("Failed to fetch projects: " + error.message, "error");
            emptyState.style.display = "block";
            return;
        }

        if (!data || data.length === 0) {
            emptyState.style.display = "block";
            projectsGrid.style.display = "none";
            updateStats([]);
        } else {
            emptyState.style.display = "none";
            projectsGrid.style.display = "grid";
            renderProjectCards(data);
            updateStats(data);
        }
    }

    function updateStats(projects) {
        if (statTotal) statTotal.textContent = projects.length;
        if (statCategories) {
            const categories = new Set(projects.map(p => p.category).filter(Boolean));
            statCategories.textContent = categories.size;
        }
        if (statLinks) {
            const links = projects.filter(p => p.live_url && p.live_url.trim());
            statLinks.textContent = links.length;
        }
    }

    function renderProjectCards(projects) {
        projectsGrid.innerHTML = "";
        projects.forEach(project => {
            const card = document.createElement("div");
            card.className = "project-admin-card";
            const techList = Array.isArray(project.tech_stack)
                ? project.tech_stack
                : (typeof project.tech_stack === "string" ? project.tech_stack.split(",") : []);
            const techHtml = techList.map(t => `<span>${escapeHtml(t.trim())}</span>`).join("");
            const linkBtn = project.live_url
                ? `<a href="${escapeHtml(project.live_url)}" target="_blank" class="btn-card-link" title="Open Live Demo">Demo ↗</a>`
                : "";

            card.innerHTML = `
                <img src="${escapeHtml(project.image_url)}" alt="${escapeHtml(project.title)}" class="project-admin-img"
                     onerror="this.src='data:image/svg+xml;charset=utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22><rect fill=%22%23f1f5f9%22 width=%22400%22 height=%22200%22/><text x=%2250%25%22 y=%2250%25%22 fill=%22%2394a3b8%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2214%22>Thumbnail Unavailable</text></svg>';">
                <div class="project-admin-body">
                    <span class="project-admin-category">${escapeHtml(project.category)}</span>
                    <h3 class="project-admin-title">${escapeHtml(project.title)}</h3>
                    <p class="project-admin-desc">${escapeHtml(project.description)}</p>
                    <div class="project-admin-tech">${techHtml}</div>
                    <div class="project-admin-actions">
                        <button class="btn-card-edit" data-id="${project.id}">Edit</button>
                        ${linkBtn}
                        <button class="btn-card-delete" data-id="${project.id}">Delete</button>
                    </div>
                </div>
            `;
            projectsGrid.appendChild(card);
        });

        // Edit listener
        projectsGrid.querySelectorAll(".btn-card-edit").forEach(btn => {
            btn.addEventListener("click", () => openEditModal(btn.dataset.id));
        });

        // Safe Two-step Delete without popup
        projectsGrid.querySelectorAll(".btn-card-delete").forEach(btn => {
            let deleteTimeout;
            btn.addEventListener("click", () => {
                if (btn.dataset.confirming === "true") {
                    clearTimeout(deleteTimeout);
                    deleteProject(btn.dataset.id, btn);
                } else {
                    btn.dataset.confirming = "true";
                    btn.textContent = "Confirm Delete?";
                    btn.style.background = "#dc2626";
                    btn.style.color = "#ffffff";
                    btn.style.borderColor = "#dc2626";

                    deleteTimeout = setTimeout(() => {
                        btn.dataset.confirming = "false";
                        btn.textContent = "Delete";
                        btn.style.background = "";
                        btn.style.color = "";
                        btn.style.borderColor = "";
                    }, 3500);
                }
            });
        });
    }

    // Modal Operations
    function openAddModal() {
        modalTitle.textContent = "Add New Project";
        projectForm.reset();
        projectIdInput.value = "";
        uploadedFileForSave = null;
        imagePreviewContainer.style.display = "none";
        projectModal.style.display = "flex";
    }

    async function openEditModal(id) {
        const { data, error } = await supabaseClient
            .from("portfolio_projects")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) {
            showToast("Project not found.", "error");
            return;
        }

        modalTitle.textContent = "Edit Project";
        projectIdInput.value = data.id;
        titleInput.value = data.title || "";
        categoryInput.value = data.category || "";
        descriptionInput.value = data.description || "";
        const techStr = Array.isArray(data.tech_stack) ? data.tech_stack.join(", ") : (data.tech_stack || "");
        techInput.value = techStr;
        liveUrlInput.value = data.live_url || "";
        imageUrlInput.value = data.image_url || "";
        uploadedFileForSave = null;

        if (data.image_url) {
            imagePreview.src = data.image_url;
            imagePreviewContainer.style.display = "block";
        } else {
            imagePreviewContainer.style.display = "none";
        }

        projectModal.style.display = "flex";
    }

    function closeModal() {
        projectModal.style.display = "none";
    }

    if (openAddModalBtn) openAddModalBtn.addEventListener("click", openAddModal);
    if (emptyAddBtn) emptyAddBtn.addEventListener("click", openAddModal);
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);

    // Image Upload Zone
    if (uploadZone) {
        uploadZone.addEventListener("click", () => imageFileInput.click());
        uploadZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = "var(--primary-solid)";
        });
        uploadZone.addEventListener("dragleave", () => {
            uploadZone.style.borderColor = "";
        });
        uploadZone.addEventListener("drop", (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = "";
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleSelectedFile(e.dataTransfer.files[0]);
            }
        });
    }

    if (imageFileInput) {
        imageFileInput.addEventListener("change", () => {
            if (imageFileInput.files && imageFileInput.files[0]) {
                handleSelectedFile(imageFileInput.files[0]);
            }
        });
    }

    function handleSelectedFile(file) {
        uploadedFileForSave = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreviewContainer.style.display = "block";
        };
        reader.readAsDataURL(file);
        imageUrlInput.value = "";
    }

    if (imageUrlInput) {
        imageUrlInput.addEventListener("input", () => {
            const val = imageUrlInput.value.trim();
            if (val) {
                imagePreview.src = val;
                imagePreviewContainer.style.display = "block";
                uploadedFileForSave = null;
            } else if (!uploadedFileForSave) {
                imagePreviewContainer.style.display = "none";
            }
        });
    }

    // Save Project Form Submit
    projectForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        const isEditing = Boolean(projectIdInput.value);
        let imageUrl = imageUrlInput.value.trim();

        if (uploadedFileForSave) {
            const fileExt = uploadedFileForSave.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabaseClient.storage
                .from("portfolio-images")
                .upload(fileName, uploadedFileForSave, { cacheControl: "3600", upsert: true });

            if (uploadError) {
                showToast("Image upload failed: " + uploadError.message, "error");
                saveBtn.disabled = false;
                saveBtn.textContent = "Save Project";
                return;
            }

            const { data: urlData } = supabaseClient.storage
                .from("portfolio-images")
                .getPublicUrl(uploadData.path);
            imageUrl = urlData.publicUrl;
        }

        if (!imageUrl) {
            showToast("Please provide an image thumbnail.", "error");
            saveBtn.disabled = false;
            saveBtn.textContent = "Save Project";
            return;
        }

        const techStack = techInput.value.split(",").map(t => t.trim()).filter(Boolean);
        const projectData = {
            title: titleInput.value.trim(),
            category: categoryInput.value.trim(),
            description: descriptionInput.value.trim(),
            tech_stack: techStack,
            live_url: liveUrlInput.value.trim() || null,
            image_url: imageUrl
        };

        let result;
        if (isEditing) {
            result = await supabaseClient
                .from("portfolio_projects")
                .update(projectData)
                .eq("id", projectIdInput.value);
        } else {
            result = await supabaseClient
                .from("portfolio_projects")
                .insert([projectData]);
        }

        if (result.error) {
            showToast("Save failed: " + result.error.message, "error");
        } else {
            showToast(isEditing ? "Project updated successfully." : "Project created successfully.", "success");
            closeModal();
            loadProjects();
        }

        saveBtn.disabled = false;
        saveBtn.textContent = "Save Project";
    });

    // Delete Project
    async function deleteProject(id, btn) {
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Deleting...";
        }

        try {
            const { error } = await supabaseClient
                .from("portfolio_projects")
                .delete()
                .eq("id", id);

            if (error) {
                showToast("Delete failed: " + error.message, "error");
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = "Delete";
                }
            } else {
                showToast("Project deleted.", "info");
                await loadProjects();
            }
        } catch (err) {
            showToast("Delete error: " + err.message, "error");
            if (btn) {
                btn.disabled = false;
                btn.textContent = "Delete";
            }
        }
    }

    // Seed Initial Projects
    const initialProjects = [
        {
            title: "Food Lover",
            category: "Restaurant Website",
            description: "A complete restaurant website featuring a dynamic menu, beautiful galleries, and a table booking interface.",
            tech_stack: ["HTML5", "CSS3"],
            live_url: "https://boda61.github.io/food-lover/",
            image_url: "portfolio 1.png",
            order_index: 1
        },
        {
            title: "Auto Zone",
            category: "Automotive",
            description: "A platform to find your perfect ride. It includes listings, user accounts, and an interface to add car ads.",
            tech_stack: ["HTML5", "CSS3", "JavaScript"],
            live_url: "https://boda61.github.io/auto-zone/",
            image_url: "Portfolio 2.png",
            order_index: 2
        },
        {
            title: "MobiZone",
            category: "E-Commerce",
            description: "A specialized electronics store for smartphones and headphones, featuring advanced filtering and special offers.",
            tech_stack: ["HTML5", "CSS3", "JavaScript"],
            live_url: "https://boda61.github.io/mobi-zone/",
            image_url: "Portfolio 3.png",
            order_index: 3
        },
        {
            title: "Jewels",
            category: "Luxury E-Commerce",
            description: "An elegant jewelry shop showcasing premium necklaces, rings, and bracelets with a sophisticated layout.",
            tech_stack: ["HTML5", "CSS3", "JavaScript"],
            live_url: "https://boda61.github.io/jewels-jewellery/",
            image_url: "Portfolio 4.png",
            order_index: 4
        },
        {
            title: "Medfit Shop",
            category: "Medical Store",
            description: "A trusted online pharmacy and medical supplies store featuring product categories, carts, and responsive design.",
            tech_stack: ["HTML5", "CSS3", "JavaScript"],
            live_url: "https://boda61.github.io/Medfit-Shop/",
            image_url: "Portfolio 5.png",
            order_index: 5
        }
    ];

    async function seedProjects() {
        if (seedProjectsBtn) {
            seedProjectsBtn.disabled = true;
            seedProjectsBtn.textContent = "Loading...";
        }
        if (emptySeedBtn) {
            emptySeedBtn.disabled = true;
            emptySeedBtn.textContent = "Loading...";
        }

        try {
            const { data: existing } = await supabaseClient
                .from("portfolio_projects")
                .select("title");

            const existingTitles = new Set((existing || []).map(p => p.title));
            const toInsert = initialProjects.filter(p => !existingTitles.has(p.title));

            if (toInsert.length === 0) {
                showToast("All default projects exist in database.", "info");
                loadProjects();
                return;
            }

            const { error: insertError } = await supabaseClient
                .from("portfolio_projects")
                .insert(toInsert);

            if (insertError) throw insertError;

            showToast(`${toInsert.length} projects loaded successfully.`, "success");
            await loadProjects();
        } catch (err) {
            showToast("Seed failed: " + err.message, "error");
        } finally {
            if (seedProjectsBtn) {
                seedProjectsBtn.disabled = false;
                seedProjectsBtn.textContent = "Load Initial Projects";
            }
            if (emptySeedBtn) {
                emptySeedBtn.disabled = false;
                emptySeedBtn.textContent = "Load Initial Projects";
            }
        }
    }

    if (seedProjectsBtn) seedProjectsBtn.addEventListener("click", seedProjects);
    if (emptySeedBtn) emptySeedBtn.addEventListener("click", seedProjects);

    // ========================================
    // TABS 2-5: PORTFOLIO SETTINGS & CONTENT
    // ========================================
    const defaultSettings = {
        hero: {
            badge: "Available for new opportunities",
            firstName: "Apdallah",
            lastName: "Mohamed",
            typingJobs: "Frontend Developer, UI Designer, Web Developer, Freelancer",
            profileImage: "generation-f0f658ee-6474-489f-b072-ed21158cec54.png",
            ctaPrimary: "View Projects",
            ctaSecondary: "Let's Talk"
        },
        about: {
            paragraph1: "I am a passionate creative developer who bridges the gap between design and engineering. My focus is on building interfaces that are not just functional, but genuinely inspiring.",
            paragraph2: "With a background in UI/UX and deep expertise in modern web technologies, I create digital experiences that feel alive, intuitive, and ahead of the curve.",
            statYears: "2+",
            statProjects: "50+"
        },
        skills: {
            core: "JavaScript (ES6+), TypeScript, Python, HTML5 / CSS3",
            frameworks: "React / Next.js, Vue.js, Node.js",
            design: "Figma / UI Design, Framer Motion, Tailwind CSS, Responsive Design"
        },
        contact: {
            email: "apdallahm053@gmail.com",
            location: "Cairo, Egypt",
            heading: "Let's build the future together.",
            desc: "I'm currently open for new opportunities. Whether you have a question, a project idea, or just want to say hi, I'll try my best to get back to you!",
            github: "https://github.com/",
            linkedin: "https://www.linkedin.com/in/apdallah-mohamed-785a92384/",
            facebook: "https://www.facebook.com/abdullah.mohamed.506669?locale=ar_AR",
            instagram: "https://www.instagram.com/x_boda_xx30/"
        }
    };

    async function loadAllSettings() {
        try {
            const { data, error } = await supabaseClient
                .from("portfolio_settings")
                .select("*");

            if (error) {
                console.info("portfolio_settings table not created yet or inaccessible. Using default values.");
                populateSettingsForms(defaultSettings);
                return;
            }

            const current = { ...defaultSettings };
            (data || []).forEach(row => {
                if (row.key && row.value) {
                    current[row.key] = { ...current[row.key], ...row.value };
                }
            });

            populateSettingsForms(current);
        } catch (err) {
            console.warn("Could not load settings:", err);
            populateSettingsForms(defaultSettings);
        }
    }

    function populateSettingsForms(settings) {
        // Hero
        const h = settings.hero || defaultSettings.hero;
        document.getElementById("hero-badge").value = h.badge || "";
        document.getElementById("hero-first-name").value = h.firstName || "";
        document.getElementById("hero-last-name").value = h.lastName || "";
        document.getElementById("hero-typing-jobs").value = h.typingJobs || "";
        document.getElementById("hero-profile-image").value = h.profileImage || "";
        document.getElementById("hero-cta-primary").value = h.ctaPrimary || "";
        document.getElementById("hero-cta-secondary").value = h.ctaSecondary || "";

        // About
        const a = settings.about || defaultSettings.about;
        document.getElementById("about-paragraph-1").value = a.paragraph1 || "";
        document.getElementById("about-paragraph-2").value = a.paragraph2 || "";
        document.getElementById("about-stat-years").value = a.statYears || "";
        document.getElementById("about-stat-projects").value = a.statProjects || "";

        // Skills
        const s = settings.skills || defaultSettings.skills;
        document.getElementById("skills-core").value = s.core || "";
        document.getElementById("skills-frameworks").value = s.frameworks || "";
        document.getElementById("skills-design").value = s.design || "";

        // Contact
        const c = settings.contact || defaultSettings.contact;
        document.getElementById("contact-email").value = c.email || "";
        document.getElementById("contact-location").value = c.location || "";
        document.getElementById("contact-heading").value = c.heading || "";
        document.getElementById("contact-desc").value = c.desc || "";
        document.getElementById("social-github").value = c.github || "";
        document.getElementById("social-linkedin").value = c.linkedin || "";
        document.getElementById("social-facebook").value = c.facebook || "";
        document.getElementById("social-instagram").value = c.instagram || "";
    }

    async function saveSectionSettings(key, valueObj, btn) {
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Saving...";
        }

        try {
            const { error } = await supabaseClient
                .from("portfolio_settings")
                .upsert({
                    key: key,
                    value: valueObj,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                if (error.message.includes("does not exist") || error.code === "42P01" || error.code === "PGRST205") {
                    alert("Please run setup_settings.sql in Supabase SQL Editor first to enable the settings table!");
                    showToast("Table portfolio_settings missing in Supabase.", "error");
                } else {
                    showToast("Failed to save: " + error.message, "error");
                }
            } else {
                showToast("Settings saved successfully.", "success");
            }
        } catch (err) {
            showToast("Save error: " + err.message, "error");
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = "Save Changes";
            }
        }
    }

    // Hero Avatar Upload
    if (heroImageFileInput) {
        heroImageFileInput.addEventListener("change", async () => {
            const file = heroImageFileInput.files[0];
            if (!file) return;

            showToast("Uploading profile image...", "info");
            const fileExt = file.name.split(".").pop();
            const fileName = `profile-${Date.now()}.${fileExt}`;

            const { data, error } = await supabaseClient.storage
                .from("portfolio-images")
                .upload(fileName, file, { cacheControl: "3600", upsert: true });

            if (error) {
                showToast("Upload failed: " + error.message, "error");
                return;
            }

            const { data: urlData } = supabaseClient.storage
                .from("portfolio-images")
                .getPublicUrl(data.path);

            heroProfileImageInput.value = urlData.publicUrl;
            showToast("Profile image uploaded.", "success");
        });
    }

    // Save Hero
    if (heroForm) {
        heroForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const btn = document.getElementById("save-hero-btn");
            const heroData = {
                badge: document.getElementById("hero-badge").value.trim(),
                firstName: document.getElementById("hero-first-name").value.trim(),
                lastName: document.getElementById("hero-last-name").value.trim(),
                typingJobs: document.getElementById("hero-typing-jobs").value.trim(),
                profileImage: document.getElementById("hero-profile-image").value.trim(),
                ctaPrimary: document.getElementById("hero-cta-primary").value.trim(),
                ctaSecondary: document.getElementById("hero-cta-secondary").value.trim()
            };
            saveSectionSettings("hero", heroData, btn);
        });
    }

    // Save About
    if (aboutForm) {
        aboutForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const btn = document.getElementById("save-about-btn");
            const aboutData = {
                paragraph1: document.getElementById("about-paragraph-1").value.trim(),
                paragraph2: document.getElementById("about-paragraph-2").value.trim(),
                statYears: document.getElementById("about-stat-years").value.trim(),
                statProjects: document.getElementById("about-stat-projects").value.trim()
            };
            saveSectionSettings("about", aboutData, btn);
        });
    }

    // Save Skills
    if (skillsForm) {
        skillsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const btn = document.getElementById("save-skills-btn");
            const skillsData = {
                core: document.getElementById("skills-core").value.trim(),
                frameworks: document.getElementById("skills-frameworks").value.trim(),
                design: document.getElementById("skills-design").value.trim()
            };
            saveSectionSettings("skills", skillsData, btn);
        });
    }

    // Save Contact
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const btn = document.getElementById("save-contact-btn");
            const contactData = {
                email: document.getElementById("contact-email").value.trim(),
                location: document.getElementById("contact-location").value.trim(),
                heading: document.getElementById("contact-heading").value.trim(),
                desc: document.getElementById("contact-desc").value.trim(),
                github: document.getElementById("social-github").value.trim(),
                linkedin: document.getElementById("social-linkedin").value.trim(),
                facebook: document.getElementById("social-facebook").value.trim(),
                instagram: document.getElementById("social-instagram").value.trim()
            };
            saveSectionSettings("contact", contactData, btn);
        });
    }

    function escapeHtml(str) {
        if (!str) return "";
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    // Initialize
    checkSession();
});
