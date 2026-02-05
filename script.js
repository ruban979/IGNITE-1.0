/**
 * IGNITE 1.0 Landing Page JavaScript
 * Jeppiaar Institute of Technology
 */

document.addEventListener('DOMContentLoaded', () => {
    initParticleSimulation();
    initCountdown();
    initNavigation();
    initScrollAnimations();
    initNavbarScroll();
});

/**
 * Interactive Particle Grain Simulation
 * Responds to cursor movement with organic floating particles
 */
function initParticleSimulation() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };

    // Configuration
    const config = {
        particleCount: 80,
        particleMinSize: 4,
        particleMaxSize: 10,
        particleSpeed: 0.4,
        particleColor: 'rgba(255, 69, 0, ',  // Flame orange base
        connectionDistance: 150,
        mouseInfluence: 0.12,
        friction: 0.97
    };

    // Resize handler
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * (config.particleMaxSize - config.particleMinSize) + config.particleMinSize;
            this.baseX = this.x;
            this.baseY = this.y;
            this.vx = (Math.random() - 0.5) * config.particleSpeed;
            this.vy = (Math.random() - 0.5) * config.particleSpeed;
            this.opacity = Math.random() * 0.6 + 0.4;
            this.pulseSpeed = Math.random() * 0.03 + 0.015;
            this.pulseOffset = Math.random() * Math.PI * 2;
            // Firefly color variation (orange to yellow-white)
            this.hue = 20 + Math.random() * 30; // 20-50 range for warm colors
            this.saturation = 80 + Math.random() * 20;
        }

        update(time) {
            // Natural floating movement
            this.x += this.vx;
            this.y += this.vy;

            // Firefly pulse effect - stronger and more noticeable
            const pulse = Math.sin(time * this.pulseSpeed + this.pulseOffset);
            // Creates a flickering on/off effect like real fireflies
            this.currentOpacity = this.opacity * (pulse * 0.5 + 0.5);
            this.currentSize = this.size * (pulse * 0.2 + 0.9);

            // Boundary wrapping
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;

            // Mouse interaction
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);

                    // Push particles away from cursor
                    this.vx -= Math.cos(angle) * force * config.mouseInfluence;
                    this.vy -= Math.sin(angle) * force * config.mouseInfluence;
                }
            }

            // Apply friction
            this.vx *= config.friction;
            this.vy *= config.friction;

            // Add slight random movement
            this.vx += (Math.random() - 0.5) * 0.03;
            this.vy += (Math.random() - 0.5) * 0.03;
        }

        draw() {
            // Create glowing firefly effect with radial gradient
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.currentSize * 3
            );

            // Inner bright core (white-yellow)
            gradient.addColorStop(0, `hsla(${this.hue + 20}, 100%, 90%, ${this.currentOpacity})`);
            // Middle glow (orange)
            gradient.addColorStop(0.3, `hsla(${this.hue}, ${this.saturation}%, 60%, ${this.currentOpacity * 0.7})`);
            // Outer soft glow
            gradient.addColorStop(0.6, `hsla(${this.hue}, ${this.saturation}%, 50%, ${this.currentOpacity * 0.3})`);
            // Fade out
            gradient.addColorStop(1, `hsla(${this.hue}, ${this.saturation}%, 50%, 0)`);

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.currentSize * 3, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Add bright center core
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.currentSize * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue + 30}, 100%, 95%, ${this.currentOpacity})`;
            ctx.fill();
        }
    }

    // Initialize particles
    function initParticles() {
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // Draw connections between nearby particles
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.connectionDistance) {
                    const opacity = (1 - distance / config.connectionDistance) * 0.15;
                    ctx.beginPath();
                    ctx.strokeStyle = config.particleColor + opacity + ')';
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Add grain noise overlay
    function drawGrain(time) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const grainIntensity = 8;

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * grainIntensity;
            data[i] += noise;     // Red
            data[i + 1] += noise; // Green
            data[i + 2] += noise; // Blue
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // Animation loop
    let animationId;
    function animate(time) {
        ctx.clearRect(0, 0, width, height);

        // Update and draw particles
        particles.forEach(particle => {
            particle.update(time * 0.001);
            particle.draw();
        });

        // Draw connections
        drawConnections();

        // Add subtle grain (every 3rd frame for performance)
        if (Math.floor(time / 50) % 3 === 0) {
            drawGrain(time);
        }

        animationId = requestAnimationFrame(animate);
    }

    // Event listeners
    window.addEventListener('resize', () => {
        resize();
        initParticles();
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Touch support
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    });

    window.addEventListener('touchend', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Initialize
    resize();
    initParticles();
    animate(0);
}

/**
 * Countdown Timer
 * Counts down to February 11, 2026 10:00 AM IST
 */
function initCountdown() {
    const eventDate = new Date('2026-02-11T10:00:00+05:30').getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = eventDate - now;

        if (distance < 0) {
            // Event has started
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    // Update immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

/**
 * Mobile Navigation Toggle
 */
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/**
 * Navbar Background on Scroll
 */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');

    function handleScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
}

/**
 * Scroll Animations using Intersection Observer
 */
function initScrollAnimations() {
    // Add directional animations to sections
    const sections = document.querySelectorAll('.section');

    sections.forEach((section, index) => {
        // Alternate between left and right
        if (index % 2 === 0) {
            section.classList.add('slide-in-left');
        } else {
            section.classList.add('slide-in-right');
        }
    });

    // Add stagger effect to grids
    const grids = document.querySelectorAll('.tracks-grid, .details-grid, .coordinator-cards');
    grids.forEach(grid => {
        grid.classList.add('stagger-children');
    });

    // Regular fade for smaller elements
    const fadeElements = document.querySelectorAll('.about-stats, .register-content');
    fadeElements.forEach(el => {
        el.classList.add('fade-in');
    });

    // Create observer with better settings for smoother animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class with a slight delay for better effect
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, 100);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    });

    // Observe all animated elements
    sections.forEach(section => observer.observe(section));
    grids.forEach(grid => observer.observe(grid));
    fadeElements.forEach(el => observer.observe(el));
}

/**
 * Smooth Scroll for anchor links (fallback for older browsers)
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
