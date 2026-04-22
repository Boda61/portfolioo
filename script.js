document.addEventListener("DOMContentLoaded", () => {
    // ======================
    // TYPING EFFECT FOR JOBS
    // ======================
    const jobs = ["Frontend Developer", "UI Designer", "Web Developer", "Freelancer"];
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

    // --- NAVIGATION SCROLL EFFECT ---
    const navbar = document.querySelector(".navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // --- MOBILE MENU TOGGLE ---
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    if (hamburger) {
        hamburger.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            // Animate hamburger lines
            const spans = hamburger.querySelectorAll("span");
            if (navLinks.classList.contains("active")) {
                spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
                spans[1].style.opacity = "0";
                spans[2].style.transform = "rotate(-45deg) translate(7px, -6px)";
            } else {
                spans[0].style.transform = "none";
                spans[1].style.opacity = "1";
                spans[2].style.transform = "none";
            }
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            if (hamburger) {
                const spans = hamburger.querySelectorAll("span");
                spans[0].style.transform = "none";
                spans[1].style.opacity = "1";
                spans[2].style.transform = "none";
            }
        });
    });

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
});
