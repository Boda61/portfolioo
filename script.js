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

    // ==========================================================================
    // CINEMATIC WELCOME INTRO OVERLAY (SUPERHERO OPENING)
    // ==========================================================================

    function isSessionStorageAvailable() {
        try {
            const key = "__test_session__";
            sessionStorage.setItem(key, key);
            sessionStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }

    function hasSeenIntro() {
        if (!isSessionStorageAvailable()) return false;
        try {
            return sessionStorage.getItem("portfolio_intro_seen") === "true";
        } catch (e) {
            return false;
        }
    }

    function markIntroSeen() {
        if (!isSessionStorageAvailable()) return;
        try {
            sessionStorage.setItem("portfolio_intro_seen", "true");
        } catch (e) {
            // Silently handle private browsing quota/security errors
        }
    }

    function initCinematicIntro() {
        const intro = document.getElementById("cinematicIntro");
        const canvas = document.getElementById("introEnergyCanvas");
        const skipBtn = document.getElementById("skipIntroBtn");
        const loader = document.getElementById("loader");

        function triggerCardDropSafe() {
            if (typeof window.__executeCardDrop === "function") {
                window.__executeCardDrop();
            } else {
                window.__portfolioIntroCompleted = true;
            }
        }

        let forceReplay = false;
        try {
            const urlParams = new URLSearchParams(window.location.search);
            forceReplay = urlParams.has("replay") || urlParams.has("intro");
            if (forceReplay) {
                sessionStorage.removeItem("portfolio_intro_seen");
            }
        } catch (e) {}

        const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const alreadySeen = hasSeenIntro() && !forceReplay;

        console.log("[Cinematic Intro]", { alreadySeen, prefersReducedMotion, forceReplay });

        // Bypass intro if already seen in this tab session or prefers reduced motion (unless forceReplay)
        if (!intro || (alreadySeen && !forceReplay) || (prefersReducedMotion && !forceReplay)) {
            if (intro) {
                intro.style.display = "none";
                intro.remove();
            }
            if (loader) {
                loader.classList.add("hidden");
                setTimeout(() => { if (loader && loader.parentNode) loader.remove(); }, 300);
            }
            document.body.style.overflow = "";
            window.__portfolioIntroCompleted = true;
            triggerCardDropSafe();
            return;
        }

        // Active intro session: lock body scroll and remove default loader
        document.body.style.overflow = "hidden";
        if (loader) {
            loader.style.display = "none";
            loader.remove();
        }

        let isCompleted = false;
        let timeouts = [];
        let rafId = null;

        function safeTimeout(fn, delay) {
            const t = setTimeout(fn, delay);
            timeouts.push(t);
            return t;
        }

        function finishIntro(instant = false) {
            if (isCompleted) return;
            isCompleted = true;
            window.__portfolioIntroCompleted = true;

            // Clear all pending timeouts
            timeouts.forEach(t => clearTimeout(t));
            timeouts = [];

            // Stop canvas loop immediately
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }

            // Mark session as seen
            markIntroSeen();

            // Restore scrolling
            document.body.style.overflow = "";

            // Trigger card falling physics right as the portfolio is revealed
            triggerCardDropSafe();

            // Transition out overlay
            if (intro) {
                intro.classList.remove("flash-active");
                if (instant) {
                    intro.classList.add("fade-out-fast");
                    setTimeout(() => {
                        if (intro.parentNode) intro.remove();
                    }, 260);
                } else {
                    intro.classList.add("fade-out");
                    setTimeout(() => {
                        if (intro.parentNode) intro.remove();
                    }, 700);
                }
            }
        }

        // Skip Button Click & Escape Key
        if (skipBtn) {
            skipBtn.addEventListener("click", () => finishIntro(true));
        }

        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !isCompleted) {
                finishIntro(true);
            }
        }, { once: true });

        // Safety Fallback: Never leave user stranded if anything stalls
        safeTimeout(() => {
            if (!isCompleted) finishIntro(false);
        }, 5500);

        // --- ELECTRIC BLUE PARTICLES CANVAS SYSTEM ---
        if (canvas) {
            const ctx = canvas.getContext("2d");
            let width = (canvas.width = window.innerWidth);
            let height = (canvas.height = window.innerHeight);

            // Responsive particle count (lightweight on mobile)
            const isMobile = window.innerWidth <= 768;
            const particleCount = isMobile ? 36 : 75;
            const particles = [];
            let centralPull = 0.0003;

            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * Math.max(width, height) * 0.7 + 60;
                particles.push({
                    x: width / 2 + Math.cos(angle) * dist,
                    y: height / 2 + Math.sin(angle) * dist,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: (Math.random() - 0.5) * 1.5,
                    size: Math.random() * 2 + 1,
                    alpha: Math.random() * 0.7 + 0.3,
                    color: Math.random() > 0.4 ? "0, 240, 255" : (Math.random() > 0.5 ? "0, 162, 255" : "255, 255, 255")
                });
            }

            function resizeCanvas() {
                if (isCompleted || !canvas) return;
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            }
            window.addEventListener("resize", resizeCanvas, { passive: true });

            function renderParticles() {
                if (isCompleted) return;

                ctx.fillStyle = "rgba(2, 2, 4, 0.28)";
                ctx.fillRect(0, 0, width, height);

                const cx = width / 2;
                const cy = height / 2;

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];

                    // Gentle gravity toward center
                    const dx = cx - p.x;
                    const dy = cy - p.y;
                    p.vx += dx * centralPull;
                    p.vy += dy * centralPull;

                    p.x += p.vx;
                    p.y += p.vy;

                    // Damping
                    p.vx *= 0.985;
                    p.vy *= 0.985;

                    // Draw glowing particle
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
                    ctx.shadowColor = `rgba(${p.color}, 0.8)`;
                    ctx.shadowBlur = p.size * 4;
                    ctx.fill();
                    ctx.restore();

                    // If particle passes very close to center, recirculate outward
                    const dCenter = Math.hypot(dx, dy);
                    if (dCenter < 30) {
                        const newAngle = Math.random() * Math.PI * 2;
                        const newDist = Math.max(width, height) * 0.65;
                        p.x = cx + Math.cos(newAngle) * newDist;
                        p.y = cy + Math.sin(newAngle) * newDist;
                        p.vx = (Math.random() - 0.5) * 2;
                        p.vy = (Math.random() - 0.5) * 2;
                    }
                }

                rafId = requestAnimationFrame(renderParticles);
            }

            renderParticles();
        }

        // --- CHOREOGRAPHED TIMELINE (Total ~4.0s) ---
        // 0.3s: Reveal Skip Button
        safeTimeout(() => {
            if (intro) intro.classList.add("show-skip");
        }, 300);

        // 0.8s: Reveal "WELCOME TO MY"
        safeTimeout(() => {
            if (intro) intro.classList.add("show-subtitle");
        }, 800);

        // 1.7s: Reveal "PORTFOLIO" with specular flare
        safeTimeout(() => {
            if (intro) intro.classList.add("show-title");
        }, 1700);

        // 2.1s: Specular Light Sweep flare passes across "PORTFOLIO"
        safeTimeout(() => {
            if (intro) intro.classList.add("sweep-light");
        }, 2100);

        // 2.9s: Converge energy ring & intensify central pull
        safeTimeout(() => {
            if (intro) {
                intro.classList.add("show-energy");
                intro.classList.add("stage-climax");
            }
        }, 2900);

        // 3.65s: Controlled Cinematic Flash blooms
        safeTimeout(() => {
            if (intro) intro.classList.add("flash-active");
        }, 3650);

        // 3.95s: Transition out, trigger card physics drop, restore scrolling
        safeTimeout(() => {
            finishIntro(false);
        }, 3950);
    }

    initCinematicIntro();

    // --- SITE HEADER & ANNOUNCEMENT SCROLL EFFECT ---
    const siteHeader = document.querySelector(".site-header");
    let wasScrolled = false;
    function handleHeaderScroll() {
        if (!siteHeader) return;
        const isScrolled = window.scrollY > 35;
        if (isScrolled) {
            siteHeader.classList.add("scrolled");
            if (!wasScrolled) {
                wasScrolled = true;
                setTimeout(updateStepCoordinates, 50);
                setTimeout(updateStepCoordinates, 200);
            }
        } else {
            siteHeader.classList.remove("scrolled");
            wasScrolled = false;
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
            setTimeout(updateStepCoordinates, 50);
            setTimeout(updateStepCoordinates, 200);
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
        if (wrapRect.width <= 0) return;
        stepCenters = Array.from(navStepItems).map(item => {
            const itemRect = item.getBoundingClientRect();
            return (itemRect.left + itemRect.width / 2) - wrapRect.left;
        });
        updateStepperIndicator();
    }

    let isTicking = false;

    function updateStepperIndicator() {
        const scrollY = window.scrollY;
        const headerOffset = siteHeader ? siteHeader.offsetHeight + 10 : 90;
        const currentScroll = scrollY + headerOffset;

        // Check if user reached near the bottom of the page
        const isBottom = (window.innerHeight + scrollY) >= (document.documentElement.scrollHeight - 60);

        let activeIndex = 0;

        if (isBottom) {
            activeIndex = sectionElements.length - 1;
        } else {
            for (let i = 0; i < sectionElements.length; i++) {
                const sec = sectionElements[i];
                const secTop = sec.offsetTop;
                const nextSec = sectionElements[i + 1];
                const secNextTop = nextSec ? nextSec.offsetTop : (secTop + sec.offsetHeight);

                if (currentScroll >= secTop && currentScroll < secNextTop) {
                    const secRange = secNextTop - secTop;
                    const progress = secRange > 0 ? (currentScroll - secTop) / secRange : 0;
                    activeIndex = progress >= 0.5 && (i + 1 < sectionElements.length) ? i + 1 : i;
                    break;
                } else if (currentScroll < sectionElements[0].offsetTop) {
                    activeIndex = 0;
                    break;
                }
            }
        }

        // Lazy-init step coordinates if not computed yet
        if (stepCenters.length < 2 && navStepperWrap && navStepperWrap.getBoundingClientRect().width > 0) {
            const wrapRect = navStepperWrap.getBoundingClientRect();
            stepCenters = Array.from(navStepItems).map(item => {
                const itemRect = item.getBoundingClientRect();
                return (itemRect.left + itemRect.width / 2) - wrapRect.left;
            });
        }

        // 1. Continuous rail & glowing indicator (exact laptop math)
        if (navStepperWrap && stepCenters.length >= 2) {
            let targetX = stepCenters[0];
            if (isBottom) {
                targetX = stepCenters[stepCenters.length - 1];
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
        }

        // 2. Nav items active state
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

    // ==========================================
    // HANGING 3D CARD PHYSICS & INTERACTION
    // Inspired by 3D_CARD (github.com/fattahmaulana/3D_CARD) & @pmndrs
    // Adapted into ultra-lightweight Vanilla JS physics engine
    // ==========================================
    function initHangingCard() {
        const stage = document.getElementById("hangingStage");
        const anchor = document.getElementById("hangingAnchor");
        const card = document.getElementById("hangingCard");
        const lanyardPath = document.getElementById("lanyardPath");
        const lanyardStitchLeft = document.getElementById("lanyardStitchLeft");
        const lanyardStitchRight = document.getElementById("lanyardStitchRight");

        if (!stage || !anchor || !card || !lanyardPath) return;

        let stageWidth = stage.offsetWidth;
        let anchorX = stageWidth / 2;
        let anchorY = window.innerWidth <= 992 ? 15 : 40;

        function getRestLength() {
            const vh = window.innerHeight;
            const vw = window.innerWidth;
            if (vw <= 480) {
                // Generous long suspended lanyard matching the reference screenshot
                return Math.max(135, Math.min(vh * 0.22, 175));
            }
            if (vw <= 992) {
                return Math.max(150, Math.min(vh * 0.24, 195));
            }
            return 175;
        }

        let restLength = getRestLength();
        let cardHalfWidth = card.offsetWidth / 2 || (window.innerWidth <= 480 ? 105 : (window.innerWidth <= 992 ? 115 : 130));

        function updateAnchor() {
            stageWidth = stage.offsetWidth;
            cardHalfWidth = card.offsetWidth / 2 || (window.innerWidth <= 480 ? 105 : (window.innerWidth <= 992 ? 115 : 130));
            restLength = getRestLength();
            if (anchor) {
                anchorX = anchor.offsetLeft + anchor.offsetWidth / 2;
                anchorY = anchor.offsetTop + anchor.offsetHeight / 2;
            } else {
                anchorX = stageWidth / 2;
                anchorY = window.innerWidth <= 992 ? 15 : 40;
            }
        }

        updateAnchor();

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // Simulation State
        // (x, y) = attachment point at card top-center in stage coordinates
        let x = anchorX;
        let y = anchorY + restLength;
        let vx = 0;
        let vy = 0;
        let angle = 0;
        let angleVelocity = 0;

        let isDragging = false;
        let dragPointerId = null;
        let dragStartPointerX = 0;
        let dragStartPointerY = 0;
        let dragStartCardX = 0;
        let dragStartCardY = 0;
        let lastPointerX = 0;
        let lastPointerY = 0;
        let lastPointerTime = 0;
        let pointerVx = 0;
        let pointerVy = 0;

        // 3D Hover Tilt State
        let hoverTiltX = 0;
        let hoverTiltY = 0;
        let hoverTiltActive = false;

        // Physics parameters (Spring-pendulum model)
        const gravity = 2000;       // px/s^2
        const cordStiffness = 380;  // Tension spring when dist > restLength
        const cordDamping = 18;     // Damping along the cord axis
        const airResistance = 0.65; // Pendulum lateral air drag
        const angularDamping = 4.5; // Damping for card rotation

        let isRunning = false;
        let lastFrameTime = performance.now();

        function render() {
            // 1. Render black fabric lanyard strap
            lanyardPath.setAttribute("d", `M ${anchorX.toFixed(1)} ${anchorY.toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)}`);

            // 2. Render edge stitch dashed lines
            if (lanyardStitchLeft && lanyardStitchRight) {
                const dx = x - anchorX;
                const dy = y - anchorY;
                const dist = Math.hypot(dx, dy) || 1;
                const nx = -dy / dist;
                const ny = dx / dist;
                const offset = 6.2;

                const ax1 = (anchorX + nx * offset).toFixed(1);
                const ay1 = (anchorY + ny * offset).toFixed(1);
                const x1 = (x + nx * offset).toFixed(1);
                const y1 = (y + ny * offset).toFixed(1);

                const ax2 = (anchorX - nx * offset).toFixed(1);
                const ay2 = (anchorY - ny * offset).toFixed(1);
                const x2 = (x - nx * offset).toFixed(1);
                const y2 = (y - ny * offset).toFixed(1);

                lanyardStitchLeft.setAttribute("d", `M ${ax1} ${ay1} L ${x1} ${y1}`);
                lanyardStitchRight.setAttribute("d", `M ${ax2} ${ay2} L ${x2} ${y2}`);
            }

            // 3. Card transform with 3D tilt
            const left = x - cardHalfWidth;
            const top = y;
            const angleDeg = (angle * (180 / Math.PI)).toFixed(2);

            let tiltX = 0;
            let tiltY = 0;

            if (isDragging) {
                tiltX = Math.max(-16, Math.min(16, -pointerVy * 0.012));
                tiltY = Math.max(-22, Math.min(22, pointerVx * 0.015));
            } else {
                tiltX = Math.max(-14, Math.min(14, (vy * 0.005) + (angle * -8)));
                tiltY = Math.max(-18, Math.min(18, (vx * 0.01) + (angle * 12)));
            }

            if (!isDragging && hoverTiltActive) {
                tiltX += hoverTiltX;
                tiltY += hoverTiltY;
            }

            card.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0) rotateZ(${angleDeg}deg) rotateX(${tiltX.toFixed(1)}deg) rotateY(${tiltY.toFixed(1)}deg)`;
        }

        function stepPhysics(dt) {
            if (isDragging) {
                const dx = x - anchorX;
                const dy = y - anchorY;
                const cordAngle = Math.atan2(dx, dy);
                const velocityTilt = Math.max(-0.35, Math.min(0.35, -pointerVx * 0.00035));
                angle = cordAngle + velocityTilt;
                angleVelocity = 0;
                return;
            }

            // Substepping for rock-solid stability and smoothness
            const subSteps = 4;
            const subDt = dt / subSteps;

            for (let s = 0; s < subSteps; s++) {
                const dx = x - anchorX;
                const dy = y - anchorY;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
                const nx = dx / dist;
                const ny = dy / dist;

                let fx = 0;
                let fy = gravity; // Gravity always pulls downwards

                // Cord tension engages when stretched beyond restLength
                if (dist > restLength) {
                    const stretch = dist - restLength;
                    const radialVel = vx * nx + vy * ny;
                    const tensionMag = cordStiffness * stretch + cordDamping * radialVel;
                    const clampedTension = Math.max(0, tensionMag);

                    fx -= clampedTension * nx;
                    fy -= clampedTension * ny;
                }

                // Air resistance
                fx -= airResistance * vx;
                fy -= airResistance * vy;

                // Numerical integration
                vx += fx * subDt;
                vy += fy * subDt;
                x += vx * subDt;
                y += vy * subDt;

                // Card rotation dynamic alignment
                const targetAngle = Math.atan2(dx, dy);
                let diff = targetAngle - angle;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;

                const angularSpring = 85;
                const angularAcc = diff * angularSpring - angularDamping * angleVelocity;
                angleVelocity += angularAcc * subDt;
                angle += angleVelocity * subDt;
            }

            // Boundary constraints so card stays on screen
            const boundLimit = Math.max(window.innerWidth * 0.45, 260);
            if (x < anchorX - boundLimit) { x = anchorX - boundLimit; vx = 0; }
            if (x > anchorX + boundLimit) { x = anchorX + boundLimit; vx = 0; }
            if (y < anchorY - 60) { y = anchorY - 60; vy = Math.max(0, vy); }

            // Sleep detection when motion settles completely
            const speedSq = vx * vx + vy * vy;
            const distFromRest = Math.hypot(x - anchorX, y - (anchorY + restLength));
            const angleSpeed = Math.abs(angleVelocity);
            const angleDiffRest = Math.abs(angle);

            if (speedSq < 0.05 && distFromRest < 0.5 && angleSpeed < 0.01 && angleDiffRest < 0.005) {
                x = anchorX;
                y = anchorY + restLength;
                vx = 0;
                vy = 0;
                angle = 0;
                angleVelocity = 0;
                isRunning = false;
            }
        }

        function loop(now) {
            if (!isRunning) return;

            const dt = Math.min((now - lastFrameTime) / 1000, 0.033);
            lastFrameTime = now;

            stepPhysics(dt);
            render();

            if (isRunning) {
                requestAnimationFrame(loop);
            }
        }

        function wakeLoop() {
            if (!isRunning) {
                isRunning = true;
                lastFrameTime = performance.now();
                requestAnimationFrame(loop);
            }
        }

        // --- POINTER INTERACTIONS (DRAGGING) ---
        card.addEventListener("pointerdown", (e) => {
            if (e.button !== 0 && e.pointerType === "mouse") return;
            e.preventDefault(); // Prevent scroll/pan interference on touch devices

            isDragging = true;
            dragPointerId = e.pointerId;
            card.setPointerCapture(e.pointerId);

            card.classList.add("is-interacting", "is-dragging");
            document.body.style.userSelect = "none";
            document.body.style.webkitUserSelect = "none";

            updateAnchor();

            dragStartPointerX = e.clientX;
            dragStartPointerY = e.clientY;
            dragStartCardX = x;
            dragStartCardY = y;

            lastPointerX = e.clientX;
            lastPointerY = e.clientY;
            lastPointerTime = performance.now();
            pointerVx = 0;
            pointerVy = 0;
            vx = 0;
            vy = 0;

            wakeLoop();
        });

        window.addEventListener("pointermove", (e) => {
            if (!isDragging || e.pointerId !== dragPointerId) return;

            const now = performance.now();
            const dt = (now - lastPointerTime) / 1000;

            const deltaX = e.clientX - dragStartPointerX;
            const deltaY = e.clientY - dragStartPointerY;

            let newX = dragStartCardX + deltaX;
            let newY = dragStartCardY + deltaY;

            // Clamping during drag
            const minY = anchorY + 30;
            const maxY = anchorY + restLength * 2.2;
            const maxRangeX = Math.max(window.innerWidth * 0.45, 260);

            newY = Math.max(minY, Math.min(maxY, newY));
            newX = Math.max(anchorX - maxRangeX, Math.min(anchorX + maxRangeX, newX));

            x = newX;
            y = newY;

            if (dt > 0.005) {
                const instVx = (e.clientX - lastPointerX) / dt;
                const instVy = (e.clientY - lastPointerY) / dt;
                pointerVx = pointerVx * 0.35 + instVx * 0.65;
                pointerVy = pointerVy * 0.35 + instVy * 0.65;
                lastPointerX = e.clientX;
                lastPointerY = e.clientY;
                lastPointerTime = now;
            }

            wakeLoop();
        });

        function endDrag(e) {
            if (!isDragging) return;
            if (e && dragPointerId !== null && e.pointerId !== dragPointerId) return;

            isDragging = false;
            if (dragPointerId !== null) {
                try { card.releasePointerCapture(dragPointerId); } catch (_) {}
                dragPointerId = null;
            }

            card.classList.remove("is-interacting", "is-dragging");
            document.body.style.userSelect = "";
            document.body.style.webkitUserSelect = "";

            // Seed release velocity with safety clamp
            const maxRelease = 1500;
            vx = Math.max(-maxRelease, Math.min(maxRelease, pointerVx));
            vy = Math.max(-maxRelease, Math.min(maxRelease, pointerVy));

            wakeLoop();
        }

        window.addEventListener("pointerup", endDrag);
        window.addEventListener("pointercancel", endDrag);

        // Subtle 3D hover micro-tilt on mouse move over the card
        card.addEventListener("pointerenter", () => {
            if (!isDragging) hoverTiltActive = true;
        });

        card.addEventListener("pointermove", (e) => {
            if (isDragging) return;
            hoverTiltActive = true;
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const rx = (e.clientY - cy) / (rect.height / 2);
            const ry = (e.clientX - cx) / (rect.width / 2);
            hoverTiltX = -rx * 9;
            hoverTiltY = ry * 9;
            if (!isRunning) {
                render();
            }
        });

        card.addEventListener("pointerleave", () => {
            hoverTiltActive = false;
            hoverTiltX = 0;
            hoverTiltY = 0;
            if (!isRunning) {
                render();
            }
        });

        // Resize & orientation handler to update geometry smoothly without jumps
        function handleResize() {
            const oldAnchorX = anchorX;
            const oldAnchorY = anchorY;
            updateAnchor();

            if (!isDragging) {
                if (!isRunning) {
                    x = anchorX;
                    y = anchorY + restLength;
                    angle = 0;
                    angleVelocity = 0;
                    vx = 0;
                    vy = 0;
                    render();
                } else {
                    // Maintain relative offset to prevent glitches during active physics
                    x += (anchorX - oldAnchorX);
                    y += (anchorY - oldAnchorY);
                    render();
                }
            }
        }

        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", () => {
            setTimeout(handleResize, 100);
            setTimeout(handleResize, 350);
        });

        // Trigger initial drop animation or set resting state
        function startDropAnimation() {
            updateAnchor();
            if (prefersReducedMotion) {
                x = anchorX;
                y = anchorY + restLength;
                vx = 0;
                vy = 0;
                angle = 0;
                render();
                return;
            }

            // Start card above visible viewport with an angular impulse
            x = anchorX + 60;
            y = -260;
            vx = -40;
            vy = 120;
            angle = 0.25;
            angleVelocity = 0;
            render();
            wakeLoop();
        }

        // Card Drop Coordinator: ensures physics drop happens exactly once
        let cardHasDropped = false;
        function executeCardDrop() {
            if (cardHasDropped) return;
            cardHasDropped = true;
            startDropAnimation();
        }

        window.__executeCardDrop = executeCardDrop;

        // If intro was already marked completed or bypassed, drop immediately
        if (window.__portfolioIntroCompleted) {
            setTimeout(executeCardDrop, 50);
        } else {
            // Safety fallback: drop after 5.5s maximum if not triggered by intro
            setTimeout(executeCardDrop, 5500);
        }
    }

    initHangingCard();


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
