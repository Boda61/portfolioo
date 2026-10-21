document.addEventListener("DOMContentLoaded", () => {
    // ======================
    // TYPING EFFECT FOR JOBS
    // ======================
    let jobs = ["Frontend Developer", "UI Designer", "Web Developer", "Freelancer"];
    let jobIndex = 0;
    let charIndex = 0;
    let currentJob = "";
    let isDeleting = false;

    function typeEffect() {
        currentJob = jobs[jobIndex];
        const typingElement = document.getElementById("typing-job");

        if (!typingElement) return;

        if (isDeleting) {
            charIndex--;
        } else {
            charIndex++;
        }

        typingElement.textContent = currentJob.substring(0, charIndex);

        let speed = 100;

        if (isDeleting) {
            speed = 50;
        }

        if (!isDeleting && charIndex === currentJob.length) {
            speed = 1500; // Pause before deleting
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            jobIndex++;
            if (jobIndex === jobs.length) {
                jobIndex = 0;
            }
        }

        setTimeout(typeEffect, speed);
    }

    typeEffect();

    // --- LOADING SCREEN ---
    const loader = document.getElementById("loader");

    // Simulate loading time for effect, or wait for window load
    window.addEventListener("load", () => {
        setTimeout(() => {
            loader.classList.add("hidden");
            // Optional: completely remove from DOM after transition
            setTimeout(() => loader.remove(), 800);
        }, 500); // Small artificial delay for the 'initializing' feel
    });

    // --- SITE HEADER & ANNOUNCEMENT SCROLL EFFECT ---
    const siteHeader = document.querySelector(".site-header");
    function handleHeaderScroll() {
        if (!siteHeader) return;
        if (window.scrollY > 35) {
            siteHeader.classList.add("scrolled");
        } else {
            siteHeader.classList.remove("scrolled");
        }
    }
    window.addEventListener("scroll", handleHeaderScroll, { passive: true });
    handleHeaderScroll();

    // --- MOBILE MENU TOGGLE ---
    const hamburger = document.querySelector(".hamburger");
    const navStepperWrap = document.querySelector(".nav-stepper-wrap");

    if (hamburger && navStepperWrap) {
        hamburger.addEventListener("click", () => {
            navStepperWrap.classList.toggle("active");
            const spans = hamburger.querySelectorAll("span");
            if (navStepperWrap.classList.contains("active")) {
                spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
                spans[1].style.opacity = "0";
                spans[2].style.transform = "rotate(-45deg) translate(5px, -5px)";
            } else {
                spans[0].style.transform = "none";
                spans[1].style.opacity = "1";
                spans[2].style.transform = "none";
            }
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll(".nav-step a").forEach(link => {
        link.addEventListener("click", () => {
            if (navStepperWrap) {
                navStepperWrap.classList.remove("active");
            }
            if (hamburger) {
                const spans = hamburger.querySelectorAll("span");
                spans[0].style.transform = "none";
                spans[1].style.opacity = "1";
                spans[2].style.transform = "none";
            }
        });
    });

    // --- CONTINUOUS TIMELINE STEPPER RAIL & INDICATOR ---
    const stepperRailProgress = document.querySelector(".stepper-rail-progress");
    const stepperIndicator = document.querySelector(".stepper-indicator");
    const navStepItems = document.querySelectorAll(".nav-step");
    const sectionIds = ["hero", "about", "projects", "skills", "contact"];
    const sectionElements = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    // Cache step horizontal centers relative to .nav-stepper-wrap
    let stepCenters = [];

    function updateStepCoordinates() {
        if (!navStepperWrap) return;
        const wrapRect = navStepperWrap.getBoundingClientRect();
        stepCenters = Array.from(navStepItems).map(item => {
            const itemRect = item.getBoundingClientRect();
            return (itemRect.left + itemRect.width / 2) - wrapRect.left;
        });
        updateStepperIndicator();
    }

    let isTicking = false;

    function updateStepperIndicator() {
        if (!navStepperWrap || stepCenters.length < 2) return;

        const scrollY = window.scrollY;
        const headerOffset = siteHeader ? siteHeader.offsetHeight + 10 : 90;
        const currentScroll = scrollY + headerOffset;

        // Check if user reached near the bottom of the page
        const isBottom = (window.innerHeight + scrollY) >= (document.documentElement.scrollHeight - 60);

        let targetX = stepCenters[0];
        let activeIndex = 0;

        if (isBottom) {
            activeIndex = stepCenters.length - 1;
            targetX = stepCenters[activeIndex];
        } else {
            for (let i = 0; i < sectionElements.length; i++) {
                const sec = sectionElements[i];
                const secTop = sec.offsetTop;
                const nextSec = sectionElements[i + 1];
                const secNextTop = nextSec ? nextSec.offsetTop : (secTop + sec.offsetHeight);

                if (currentScroll >= secTop && currentScroll < secNextTop) {
                    const secRange = secNextTop - secTop;
                    const progress = secRange > 0 ? (currentScroll - secTop) / secRange : 0;
                    const clampedProgress = Math.min(Math.max(progress, 0), 1);

                    const startX = stepCenters[i];
                    const endX = (i + 1 < stepCenters.length) ? stepCenters[i + 1] : startX;

                    targetX = startX + (endX - startX) * clampedProgress;
                    activeIndex = clampedProgress >= 0.5 && (i + 1 < stepCenters.length) ? i + 1 : i;
                    break;
                } else if (currentScroll < sectionElements[0].offsetTop) {
                    targetX = stepCenters[0];
                    activeIndex = 0;
                    break;
                }
            }
        }

        if (stepperIndicator) {
            stepperIndicator.style.transform = `translateX(${targetX}px)`;
        }
        if (stepperRailProgress) {
            stepperRailProgress.style.width = `${targetX}px`;
        }

        navStepItems.forEach((item, idx) => {
            if (idx === activeIndex) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });
    }

    function onScrollStepper() {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                updateStepperIndicator();
                isTicking = false;
            });
            isTicking = true;
        }
    }

    window.addEventListener("scroll", onScrollStepper, { passive: true });
    window.addEventListener("resize", updateStepCoordinates);
    window.addEventListener("orientationchange", () => setTimeout(updateStepCoordinates, 150));

    // Initial calculation after fonts and layout render
    setTimeout(updateStepCoordinates, 150);
    setTimeout(updateStepCoordinates, 600);

    // --- SCROLL ANIMATIONS (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target); // Run once
            }
        });
    }, observerOptions);

    // Select all elements with animation classes
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-up, .slide-in-left, .slide-in-right');
    animatedElements.forEach(el => observer.observe(el));

    // --- CANVAS BACKGROUND ANIMATION ---
    const canvas = document.getElementById("bg-canvas");
    const ctx = canvas.getContext("2d");
    let width, height;
    let particles = [];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    window.addEventListener("resize", resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            // Use CSS variables colors loosely for particles
            const colors = ['rgba(138, 43, 226, 0.4)', 'rgba(0, 210, 255, 0.4)', 'rgba(255, 255, 255, 0.1)'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > width) this.x = 0;
            if (this.x < 0) this.x = width;
            if (this.y > height) this.y = 0;
            if (this.y < 0) this.y = height;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const numParticles = Math.min(Math.floor(window.innerWidth / 10), 100);
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);

        // Optional subtle gradient base for canvas
        const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
        gradient.addColorStop(0, 'rgba(10, 10, 15, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connecting lines if close enough
        for (let i = 0; i < particles.length; i++) {
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(138, 43, 226, ${0.1 - distance / 1200})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    // --- 3D PROFILE IMAGE TILT EFFECT ---
    const profileContainer = document.querySelector('.profile-image-container');
    const heroVisual = document.querySelector('.hero-visual');

    if (heroVisual && profileContainer) {
        heroVisual.addEventListener('mousemove', (e) => {
            const rect = heroVisual.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -15; // Max 15 deg tilt
            const rotateY = ((x - centerX) / centerX) * 15;

            profileContainer.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            profileContainer.style.transition = 'none';
        });

        heroVisual.addEventListener('mouseleave', () => {
            profileContainer.style.transform = `rotateX(5deg) rotateY(-5deg)`;
            profileContainer.style.transition = 'transform 0.5s ease-out';
        });
    }

    // --- CONTACT FORM AJAX SUBMISSION ---
    const contactForm = document.getElementById("contactForm");
    const submitBtn = document.getElementById("submitBtn");
    const formStatus = document.getElementById("formStatus");

    if (contactForm) {
        // Clear form on page load in case browser cached it
        contactForm.reset();

        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();

            // Update button state
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = "Sending...";
            submitBtn.disabled = true;
            formStatus.innerHTML = "";
            formStatus.className = "form-status";

            const formData = new FormData(contactForm);

            let actionUrl = contactForm.getAttribute("action");
            if (actionUrl.includes("formsubmit.co") && !actionUrl.includes("/ajax/")) {
                actionUrl = actionUrl.replace("formsubmit.co/", "formsubmit.co/ajax/");
            }

            fetch(actionUrl, {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        formStatus.innerHTML = "Message sent successfully!";
                        formStatus.classList.add("success");
                        contactForm.reset(); // Clear the form
                    } else {
                        formStatus.innerHTML = "Failed to send message. Please try again.";
                        formStatus.classList.add("error");
                    }
                })
                .catch(error => {
                    formStatus.innerHTML = "An error occurred. Please try again.";
                    formStatus.classList.add("error");
                    console.error(error);
                })
                .finally(() => {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;

                    // Remove status message after 5 seconds
                    setTimeout(() => {
                        formStatus.innerHTML = "";
                        formStatus.className = "form-status";
                    }, 5000);
                });
        });
    }

    // ========================================
    // DYNAMIC PROJECTS FROM SUPABASE
    // ========================================
    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    async function loadDynamicProjects() {
        const client = window.supabaseClient || (typeof supabaseClient !== "undefined" ? supabaseClient : null);
        if (!client) {
            return;
        }

        try {
            const { data: projects, error } = await client
                .from("portfolio_projects")
                .select("*")
                .order("order_index", { ascending: true })
                .order("created_at", { ascending: true });

            if (error) {
                console.info("Using static portfolio projects fallback (Supabase info: " + error.message + ")");
                return;
            }

            if (!projects) {
                return;
            }

            const projectsGrid = document.querySelector(".projects-grid");
            if (!projectsGrid) return;

            // Render dynamic projects
            projectsGrid.innerHTML = "";

            projects.forEach((project, index) => {
                const card = document.createElement("div");
                card.className = "project-card glass-card fade-up";
                const delay = (index % 3) * 0.1;
                if (delay > 0) {
                    card.style.transitionDelay = `${delay}s`;
                }

                const techList = Array.isArray(project.tech_stack)
                    ? project.tech_stack
                    : (typeof project.tech_stack === "string" ? project.tech_stack.split(",") : []);

                const techSpans = techList
                    .map(t => `<span>${escapeHtml(t.trim())}</span>`)
                    .join("");

                const linkMarkup = project.live_url
                    ? `<div class="project-links"><a href="${escapeHtml(project.live_url)}" target="_blank" rel="noopener noreferrer" class="project-link">Live Demo ↗</a></div>`
                    : "";

                card.innerHTML = `
                    <div class="project-img-wrapper">
                        <img src="${escapeHtml(project.image_url)}" alt="${escapeHtml(project.title)}" class="project-image" loading="lazy">
                        ${linkMarkup}
                    </div>
                    <div class="project-info">
                        <span class="project-category">${escapeHtml(project.category || "Project")}</span>
                        <h3 class="project-title">${escapeHtml(project.title)}</h3>
                        <p class="project-desc">${escapeHtml(project.description || "")}</p>
                        <div class="tech-stack">
                            ${techSpans}
                        </div>
                    </div>
                `;

                projectsGrid.appendChild(card);
                if (typeof observer !== "undefined" && observer.observe) {
                    observer.observe(card);
                }
            });
        } catch (err) {
            console.error("Dynamic projects error:", err);
        }
    }

    loadDynamicProjects();

    // ========================================
    // DYNAMIC SETTINGS & CONTENT FROM SUPABASE
    // ========================================
    async function loadDynamicSettings() {
        const client = window.supabaseClient || (typeof supabaseClient !== "undefined" ? supabaseClient : null);
        if (!client) return;

        try {
            const { data, error } = await client
                .from("portfolio_settings")
                .select("*");

            if (error || !data || data.length === 0) return;

            const settings = {};
            data.forEach(item => {
                if (item.key && item.value) {
                    settings[item.key] = item.value;
                }
            });

            // 1. HERO UPDATE
            if (settings.hero) {
                const h = settings.hero;
                const badge = document.querySelector(".hero-content .badge");
                if (badge && h.badge) badge.textContent = h.badge;

                const heroTitle = document.querySelector(".hero-title");
                if (heroTitle && (h.firstName || h.lastName)) {
                    const fn = h.firstName || "Apdallah";
                    const ln = h.lastName || "Mohamed";
                    heroTitle.innerHTML = `Hi, I'm <span class="text-gradient">${escapeHtml(fn)}</span><br>${escapeHtml(ln)}.`;
                }

                if (h.typingJobs) {
                    const parsedJobs = h.typingJobs.split(",").map(j => j.trim()).filter(Boolean);
                    if (parsedJobs.length > 0) {
                        jobs = parsedJobs;
                        jobIndex = 0;
                        charIndex = 0;
                        isDeleting = false;
                    }
                }

                if (h.profileImage) {
                    const profileImg = document.getElementById("profile3d");
                    if (profileImg) profileImg.src = h.profileImage;
                }

                const ctaPrimary = document.querySelector(".hero-cta .btn-primary");
                if (ctaPrimary && h.ctaPrimary) ctaPrimary.textContent = h.ctaPrimary;

                const ctaSecondary = document.querySelector(".hero-cta .btn-secondary");
                if (ctaSecondary && h.ctaSecondary) ctaSecondary.textContent = h.ctaSecondary;
            }

            // 2. ABOUT UPDATE
            if (settings.about) {
                const a = settings.about;
                const aboutTextParagraphs = document.querySelectorAll(".about-text p");
                if (aboutTextParagraphs.length >= 2) {
                    if (a.paragraph1) aboutTextParagraphs[0].textContent = a.paragraph1;
                    if (a.paragraph2) aboutTextParagraphs[1].textContent = a.paragraph2;
                }

                const statNums = document.querySelectorAll(".about-text .stat-num");
                if (statNums.length >= 2) {
                    if (a.statYears) statNums[0].textContent = a.statYears;
                    if (a.statProjects) statNums[1].textContent = a.statProjects;
                }
            }

            // 3. SKILLS UPDATE
            if (settings.skills) {
                const s = settings.skills;
                const skillCategories = document.querySelectorAll(".skills-wrapper .skill-category");
                if (skillCategories.length >= 3) {
                    const updateList = (catIndex, commaStr) => {
                        if (!commaStr) return;
                        const ul = skillCategories[catIndex].querySelector(".skill-list");
                        if (!ul) return;
                        const items = commaStr.split(",").map(t => t.trim()).filter(Boolean);
                        ul.innerHTML = items.map(t => `<li>${escapeHtml(t)}</li>`).join("");
                    };
                    updateList(0, s.core);
                    updateList(1, s.frameworks);
                    updateList(2, s.design);
                }
            }

            // 4. CONTACT & SOCIALS UPDATE
            if (settings.contact) {
                const c = settings.contact;
                const contactTitle = document.querySelector(".contact-title");
                if (contactTitle && c.heading) contactTitle.textContent = c.heading;

                const contactDesc = document.querySelector(".contact-desc");
                if (contactDesc && c.desc) contactDesc.textContent = c.desc;

                const emailLink = document.querySelector(".contact-item a[href^='mailto']");
                if (emailLink && c.email) {
                    emailLink.href = `mailto:${c.email}`;
                    emailLink.textContent = c.email;
                }

                const locationSpan = document.querySelector(".contact-item:last-child span:not(.contact-icon)");
                if (locationSpan && c.location) {
                    locationSpan.textContent = c.location;
                }

                const updateSocial = (selector, url) => {
                    if (!url) return;
                    document.querySelectorAll(selector).forEach(a => {
                        a.href = url;
                    });
                };
                updateSocial("a[title='GitHub']", c.github);
                updateSocial("a[title='LinkedIn']", c.linkedin);
                updateSocial("a[title='Facebook']", c.facebook);
                updateSocial("a[title='Instagram']", c.instagram);
            }
        } catch (err) {
            console.warn("Could not apply dynamic settings to portfolio:", err);
        }
    }

    loadDynamicSettings();
});
