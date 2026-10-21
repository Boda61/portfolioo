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

    // Dashboard elements
    const loadingSpinner = document.getElementById("loading-spinner");
    const projectsGrid = document.getElementById("projects-admin-grid");
    const emptyState = document.getElementById("empty-state");
    const statTotal = document.getElementById("stat-total-projects");
    const statCategories = document.getElementById("stat-total-categories");
    const statLinks = document.getElementById("stat-total-links");

    // Modal elements
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
    const saveBtn = document.getElementById("save-project-btn");

    // Buttons
    const openAddModalBtn = document.getElementById("open-add-modal-btn");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const cancelModalBtn = document.getElementById("cancel-modal-btn");
    const seedProjectsBtn = document.getElementById("seed-projects-btn");
    const emptySeedBtn = document.getElementById("empty-seed-btn");
    const emptyAddBtn = document.getElementById("empty-add-btn");

    let isSignupMode = false;
    let uploadedFileForSave = null; // Holds the File object selected for upload

    // ========================================
    // TOAST NOTIFICATIONS
    // ========================================
    function showToast(message, type = "info") {
        const container = document.getElementById("toast-container");
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        const icons = { success: "✅", error: "❌", info: "ℹ️" };
        toast.innerHTML = `<span>${icons[type] || ""}</span><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(50px)";
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ========================================
    // AUTH: CHECK SESSION ON LOAD
    // ========================================
    async function checkSession() {
        if (!supabaseClient) {
            showToast("Supabase client not initialized.", "error");
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
        dashboardSection.style.display = "block";
        userEmailDisplay.textContent = user.email;
        loadProjects();
    }

    function showAuth() {
        authSection.style.display = "flex";
        dashboardSection.style.display = "none";
    }

    // ========================================
    // AUTH: LOGIN / SIGNUP
    // ========================================
    signupToggleBtn.addEventListener("click", () => {
        isSignupMode = !isSignupMode;
        if (isSignupMode) {
            loginBtn.textContent = "Create Account";
            signupToggleBtn.textContent = "Back to Sign In";
            authHint.textContent = "Enter the email & password you want to use as Admin.";
        } else {
            loginBtn.textContent = "Sign In";
            signupToggleBtn.textContent = "Create Admin Account";
            authHint.textContent = 'First time? Click "Create Admin Account" to set up your admin email & password.';
        }
    });

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = authEmailInput.value.trim();
        const password = authPasswordInput.value.trim();

        if (!email || !password) {
            showToast("Please fill in email and password.", "error");
            return;
        }
        if (password.length < 6) {
            showToast("Password must be at least 6 characters.", "error");
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = isSignupMode ? "Creating..." : "Signing in...";

        try {
            let result;
            if (isSignupMode) {
                result = await supabaseClient.auth.signUp({ email, password });
            } else {
                result = await supabaseClient.auth.signInWithPassword({ email, password });
            }

            if (result.error) {
                showToast(result.error.message, "error");
            } else if (result.data.user) {
                if (isSignupMode && !result.data.session) {
                    showToast("Account created! Check your email to confirm, then sign in.", "success");
                    isSignupMode = false;
                    loginBtn.textContent = "Sign In";
                    signupToggleBtn.textContent = "Create Admin Account";
                } else {
                    showToast("Welcome back! 🚀", "success");
                    showDashboard(result.data.user);
                }
            }
        } catch (err) {
            showToast("Unexpected error. Please try again.", "error");
            console.error(err);
        } finally {
            loginBtn.disabled = false;
            if (!isSignupMode) loginBtn.textContent = "Sign In";
            else loginBtn.textContent = "Create Account";
        }
    });

    // ========================================
    // AUTH: LOGOUT
    // ========================================
    logoutBtn.addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        showAuth();
        showToast("Logged out successfully.", "info");
    });

    // ========================================
    // PROJECTS: LOAD & RENDER
    // ========================================
    async function loadProjects() {
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
            showToast("Error loading projects: " + error.message, "error");
            emptyState.style.display = "flex";
            return;
        }

        if (!data || data.length === 0) {
            emptyState.style.display = "flex";
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
        statTotal.textContent = projects.length;
        const categories = new Set(projects.map(p => p.category));
        statCategories.textContent = categories.size;
        const links = projects.filter(p => p.live_url && p.live_url.trim());
        statLinks.textContent = links.length;
    }

    function renderProjectCards(projects) {
        projectsGrid.innerHTML = "";
        projects.forEach(project => {
            const card = document.createElement("div");
            card.className = "project-admin-card glass-card";
            const techHtml = (project.tech_stack || []).map(t => `<span>${escapeHtml(t)}</span>`).join("");
            const linkBtn = project.live_url
                ? `<a href="${escapeHtml(project.live_url)}" target="_blank" class="btn-card-link" title="Open Live Demo">↗</a>`
                : "";

            card.innerHTML = `
                <img src="${escapeHtml(project.image_url)}" alt="${escapeHtml(project.title)}" class="project-admin-img"
                     onerror="this.src='data:image/svg+xml;charset=utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22><rect fill=%22%23111%22 width=%22400%22 height=%22200%22/><text x=%2250%25%22 y=%2250%25%22 fill=%22%23555%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2216%22>Image Not Found</text></svg>';">
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

        // Attach edit/delete event listeners
        projectsGrid.querySelectorAll(".btn-card-edit").forEach(btn => {
            btn.addEventListener("click", () => openEditModal(btn.dataset.id));
        });

        // Two-step safe delete without browser popups
        projectsGrid.querySelectorAll(".btn-card-delete").forEach(btn => {
            let deleteTimeout;
            btn.addEventListener("click", () => {
                if (btn.dataset.confirming === "true") {
                    clearTimeout(deleteTimeout);
                    deleteProject(btn.dataset.id, btn);
                } else {
                    btn.dataset.confirming = "true";
                    btn.textContent = "Sure? Delete";
                    btn.style.background = "#ff4757";
                    btn.style.color = "#ffffff";
                    btn.style.borderColor = "#ff4757";

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

    function escapeHtml(str) {
        if (!str) return "";
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    // ========================================
    // PROJECTS: ADD / EDIT MODAL
    // ========================================
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
            showToast("Could not load project details.", "error");
            return;
        }

        modalTitle.textContent = "Edit Project";
        projectIdInput.value = data.id;
        titleInput.value = data.title || "";
        categoryInput.value = data.category || "";
        descriptionInput.value = data.description || "";
        techInput.value = (data.tech_stack || []).join(", ");
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
        projectForm.reset();
        uploadedFileForSave = null;
        imagePreviewContainer.style.display = "none";
    }

    openAddModalBtn.addEventListener("click", openAddModal);
    closeModalBtn.addEventListener("click", closeModal);
    cancelModalBtn.addEventListener("click", closeModal);
    if (emptyAddBtn) emptyAddBtn.addEventListener("click", openAddModal);

    // Close modal on overlay click
    projectModal.addEventListener("click", (e) => {
        if (e.target === projectModal) closeModal();
    });

    // ========================================
    // IMAGE UPLOAD HANDLING
    // ========================================
    imageFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadedFileForSave = file;
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.src = event.target.result;
                imagePreviewContainer.style.display = "block";
            };
            reader.readAsDataURL(file);
            imageUrlInput.value = ""; // Clear URL input when file chosen
        }
    });

    // Drag & drop visual feedback
    uploadZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadZone.classList.add("dragover");
    });
    uploadZone.addEventListener("dragleave", () => {
        uploadZone.classList.remove("dragover");
    });
    uploadZone.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadZone.classList.remove("dragover");
        if (e.dataTransfer.files.length) {
            imageFileInput.files = e.dataTransfer.files;
            imageFileInput.dispatchEvent(new Event("change"));
        }
    });

    // Preview for URL input
    imageUrlInput.addEventListener("input", () => {
        const url = imageUrlInput.value.trim();
        if (url) {
            uploadedFileForSave = null;
            imagePreview.src = url;
            imagePreviewContainer.style.display = "block";
        } else {
            imagePreviewContainer.style.display = "none";
        }
    });

    // ========================================
    // PROJECTS: SAVE (CREATE / UPDATE)
    // ========================================
    projectForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        const isEditing = !!projectIdInput.value;
        let imageUrl = imageUrlInput.value.trim();

        // Upload file to Supabase Storage if one was selected
        if (uploadedFileForSave) {
            const fileName = `${Date.now()}-${uploadedFileForSave.name.replace(/\s+/g, "_")}`;
            const { data: uploadData, error: uploadError } = await supabaseClient.storage
                .from("portfolio-images")
                .upload(fileName, uploadedFileForSave, {
                    cacheControl: "3600",
                    upsert: false
                });

            if (uploadError) {
                showToast("Image upload failed: " + uploadError.message, "error");
                saveBtn.disabled = false;
                saveBtn.textContent = "Save Project";
                return;
            }

            // Get public URL
            const { data: urlData } = supabaseClient.storage
                .from("portfolio-images")
                .getPublicUrl(uploadData.path);
            imageUrl = urlData.publicUrl;
        }

        if (!imageUrl) {
            showToast("Please provide a project image (upload or URL).", "error");
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
            showToast(isEditing ? "Project updated! ✏️" : "Project added! 🎉", "success");
            closeModal();
            loadProjects();
        }

        saveBtn.disabled = false;
        saveBtn.textContent = "Save Project";
    });

    // ========================================
    // PROJECTS: DELETE
    // ========================================
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
                console.error("Delete error:", error);
                showToast("Delete failed: " + error.message, "error");
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = "Delete";
                }
            } else {
                showToast("Project deleted successfully! 🗑️", "info");
                await loadProjects();
            }
        } catch (err) {
            console.error("Delete exception:", err);
            showToast("Delete error: " + err.message, "error");
            if (btn) {
                btn.disabled = false;
                btn.textContent = "Delete";
            }
        }
    }

    // ========================================
    // SEED: LOAD INITIAL 6 PROJECTS
    // ========================================
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
        },
        {
            title: "Avatar Universe",
            category: "Movie Landing Page",
            description: "A visually stunning landing page dedicated to the Avatar movie universe, featuring integrated video content.",
            tech_stack: ["HTML5", "CSS3"],
            live_url: "https://boda61.github.io/avatar/",
            image_url: "Portfolio 6.png",
            order_index: 6
        }
    ];

    async function seedProjects() {
        console.log("⚡ Starting seedProjects...");

        // Update button states
        if (seedProjectsBtn) {
            seedProjectsBtn.disabled = true;
            seedProjectsBtn.textContent = "⏳ Adding projects...";
        }
        if (emptySeedBtn) {
            emptySeedBtn.disabled = true;
            emptySeedBtn.textContent = "⏳ Adding projects...";
        }

        try {
            if (!supabaseClient) {
                throw new Error("Supabase client is not initialized.");
            }

            // Check if projects already exist to prevent duplicates
            console.log("Checking existing projects in table 'portfolio_projects'...");
            const { data: existing, error: fetchError } = await supabaseClient
                .from("portfolio_projects")
                .select("title");

            if (fetchError) {
                console.error("Fetch existing error:", fetchError);
                throw new Error("Could not check existing projects: " + fetchError.message);
            }

            const existingTitles = new Set((existing || []).map(p => p.title));
            const toInsert = initialProjects.filter(p => !existingTitles.has(p.title));

            console.log(`Found ${existingTitles.size} existing projects. Inserting ${toInsert.length} new projects...`);

            if (toInsert.length === 0) {
                showToast("All 6 projects already exist in the database! ✨", "info");
                loadProjects();
                return;
            }

            const { data: insertedData, error: insertError } = await supabaseClient
                .from("portfolio_projects")
                .insert(toInsert)
                .select();

            if (insertError) {
                console.error("Insert error:", insertError);
                throw new Error("Insert failed: " + insertError.message);
            }

            console.log("Successfully inserted:", insertedData);
            showToast(`${toInsert.length} projects loaded successfully! 🎉`, "success");
            await loadProjects();
        } catch (err) {
            console.error("Seed failed with error:", err);
            showToast(err.message, "error");
            alert("Seed Notice: " + err.message);
        } finally {
            if (seedProjectsBtn) {
                seedProjectsBtn.disabled = false;
                seedProjectsBtn.textContent = "⚡ Load Initial 6 Projects";
            }
            if (emptySeedBtn) {
                emptySeedBtn.disabled = false;
                emptySeedBtn.textContent = "Load Initial 6 Projects";
            }
        }
    }

    if (seedProjectsBtn) seedProjectsBtn.addEventListener("click", seedProjects);
    if (emptySeedBtn) emptySeedBtn.addEventListener("click", seedProjects);

    // ========================================
    // INIT
    // ========================================
    checkSession();
});
