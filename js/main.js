/**
 * Quantivision Landing Page - Main JavaScript
 * Advanced interactions, animations, and accessibility features
 */

// Global variables
let scene, camera, renderer, animationId;
let isAnimating = false;

// Initialize application
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM Content Loaded - Starting initialization');

    try {
        initializeNavigation();
        console.log('✓ Navigation initialized');
    } catch (e) {
        console.error('Navigation error:', e);
    }

    try {
        initializeCounterAnimations();
        console.log('✓ Counters initialized');
    } catch (e) {
        console.error('Counter error:', e);
    }

    try {
        initializeThreeJS();
        console.log('✓ ThreeJS initialized');
    } catch (e) {
        console.error('ThreeJS error:', e);
    }

    try {
        initializeGSAP();
        console.log('✓ GSAP initialized');
    } catch (e) {
        console.error('GSAP error:', e);
    }

    try {
        initializeScrollEffects();
        console.log('✓ Scroll effects initialized');
    } catch (e) {
        console.error('Scroll effects error:', e);
    }

    try {
        initializeAccessibility();
        console.log('✓ Accessibility initialized');
    } catch (e) {
        console.error('Accessibility error:', e);
    }

    try {
        initializePerformanceOptimizations();
        console.log('✓ Performance optimizations initialized');
    } catch (e) {
        console.error('Performance error:', e);
    }
});

/**
 * Navigation functionality
 */
function initializeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Mobile navigation toggle
    if (navToggle) {
        navToggle.addEventListener('click', function () {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });
    }

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (navMenu.classList.contains('active')) {
                    navToggle.click();
                }

                // Update active state
                navLinks.forEach(l => l.removeAttribute('aria-current'));
                this.setAttribute('aria-current', 'page');
            }
        });
    });

    // Update navigation on scroll
    window.addEventListener('scroll', throttle(function () {
        updateActiveNavigation();
    }, 100));
}

/**
 * Update active navigation based on scroll position
 */
function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');
    let currentSection = '';

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.removeAttribute('aria-current');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.setAttribute('aria-current', 'page');
        }
    });
}

/**
 * Three.js 3D Background Animation
 */
function initializeThreeJS() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas || !window.THREE) return;

    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create animated particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.005,
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.8
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create floating geometric shapes
    const shapes = [];
    const shapeGeometries = [
        new THREE.BoxGeometry(0.1, 0.1, 0.1),
        new THREE.OctahedronGeometry(0.08),
        new THREE.TetrahedronGeometry(0.08)
    ];

    for (let i = 0; i < 20; i++) {
        const geometry = shapeGeometries[Math.floor(Math.random() * shapeGeometries.length)];
        const material = new THREE.MeshBasicMaterial({
            color: Math.random() > 0.5 ? 0x00d4ff : 0xffffff,
            transparent: true,
            opacity: 0.6
        });

        const shape = new THREE.Mesh(geometry, material);
        shape.position.set(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 4
        );

        shape.rotation.x = Math.random() * Math.PI;
        shape.rotation.y = Math.random() * Math.PI;

        shapes.push(shape);
        scene.add(shape);
    }

    // Camera position
    camera.position.z = 5;

    // Animation loop
    function animate() {
        if (!isAnimating) return;

        animationId = requestAnimationFrame(animate);

        // Rotate particles
        particlesMesh.rotation.x += 0.001;
        particlesMesh.rotation.y += 0.002;

        // Animate shapes
        shapes.forEach((shape, index) => {
            shape.rotation.x += 0.01;
            shape.rotation.y += 0.005;
            shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.001;
        });

        // Camera movement
        camera.position.x = Math.sin(Date.now() * 0.0005) * 0.5;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    // Start animation when page is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                isAnimating = true;
                animate();
            } else {
                isAnimating = false;
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
            }
        });
    });

    observer.observe(canvas);

    // Handle resize
    window.addEventListener('resize', debounce(function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, 250));

    // Start animation initially
    isAnimating = true;
    animate();
}

/**
 * GSAP Scroll Animations and Interactions
 */
function initializeGSAP() {
    if (!window.gsap) return;

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Hero text animation
    gsap.from('.hero-title', {
        duration: 1,
        y: 100,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.5
    });

    gsap.from('.hero-description', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.8
    });

    gsap.from('.hero-actions', {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: 'power3.out',
        delay: 1.1
    });

    // Section animations
    gsap.utils.toArray('.service-card').forEach((card, index) => {
        gsap.from(card, {
            duration: 0.8,
            y: 100,
            opacity: 0,
            ease: 'power2.out',
            delay: index * 0.2,
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    gsap.utils.toArray('.platform-card').forEach((card, index) => {
        gsap.from(card, {
            duration: 0.8,
            y: 100,
            opacity: 0,
            ease: 'power2.out',
            delay: index * 0.15,
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Feature items animation
    gsap.utils.toArray('.feature-item').forEach((item, index) => {
        gsap.from(item, {
            duration: 0.6,
            x: -50,
            opacity: 0,
            ease: 'power2.out',
            delay: index * 0.1,
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Parallax effects
    gsap.utils.toArray('.about-visual').forEach(element => {
        gsap.to(element, {
            yPercent: -50,
            ease: 'none',
            scrollTrigger: {
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    });

    // CTA section animation
    gsap.from('.cta-content', {
        duration: 1,
        scale: 0.8,
        opacity: 0,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.cta-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });
}

/**
 * Scroll effects and performance optimizations
 */
function initializeScrollEffects() {
    // Custom scrollbar progress indicator
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', throttle(function () {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.transform = `scaleX(${scrollPercent / 100})`;
        progressBar.classList.add('active');
    }, 50));

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('loading');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

/**
 * Counter animations for hero stats
 */
function initializeCounterAnimations() {
    console.log('🔢 Initializing counter animations...');

    const counters = document.querySelectorAll('.stat-number[data-target]');
    console.log('📊 Found counters:', counters.length, counters);

    if (counters.length === 0) {
        console.warn('⚠️ No stat counters found with [data-target] attribute!');

        // Try alternate selector
        const allStatNumbers = document.querySelectorAll('.stat-number');
        console.log('Found .stat-number elements:', allStatNumbers.length, allStatNumbers);
        return;
    }

    // Log each counter's details
    counters.forEach((counter, i) => {
        console.log(`Counter ${i}:`, {
            element: counter,
            target: counter.dataset.target,
            currentText: counter.textContent,
            classList: counter.classList.toString()
        });
    });

    // Start animation after a short delay to ensure page is loaded
    setTimeout(() => {
        console.log('🚀 Starting counter animations now...');
        counters.forEach((counter, index) => {
            console.log(`Starting counter ${index} animation to ${counter.dataset.target}`);
            // Add staggered delay for each counter
            setTimeout(() => {
                animateCounter(counter);
            }, index * 200);
        });
    }, 1000);
}

/**
 * Animate counter numbers
 */
function animateCounter(element) {
    console.log('🎬 animateCounter called for:', element);

    const targetStr = element.getAttribute('data-target') || element.dataset.target;
    console.log('Target string:', targetStr);

    const target = parseInt(targetStr);
    console.log('Parsed target:', target);

    if (isNaN(target)) {
        console.error('❌ Invalid data-target value:', targetStr, 'for element:', element);
        return;
    }

    if (target === 0) {
        console.warn('⚠️ Target is 0, skipping animation');
        return;
    }

    console.log(`✨ Animating from 0 to ${target}`);

    const duration = 2000;
    const start = performance.now();
    let frameCount = 0;

    function updateCounter(currentTime) {
        frameCount++;
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(target * easeOutQuart);

        // Update the counter text
        element.textContent = current;

        if (frameCount % 30 === 0) {
            console.log(`Frame ${frameCount}: ${current}/${target} (${(progress * 100).toFixed(1)}%)`);
        }

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            // Ensure we end at the exact target
            element.textContent = target;
            console.log(`✅ Animation complete! Final value: ${target}`);
        }
    }

    requestAnimationFrame(updateCounter);
}

/**
 * Accessibility enhancements
 */
function initializeAccessibility() {
    // Focus management
    document.addEventListener('keydown', function (e) {
        // Tab navigation enhancement
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', function () {
        document.body.classList.remove('keyboard-navigation');
    });

    // Skip link functionality
    const skipLink = document.querySelector('a[href="#main-content"]');
    if (skipLink) {
        skipLink.addEventListener('click', function (e) {
            e.preventDefault();
            const main = document.getElementById('main-content');
            if (main) {
                main.focus();
                main.scrollIntoView();
            }
        });
    }

    // ARIA live regions for dynamic content
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);

    // Announce page changes
    window.addEventListener('hashchange', function () {
        const section = document.querySelector(window.location.hash);
        if (section) {
            const title = section.querySelector('h1, h2, h3');
            if (title) {
                announcer.textContent = `Navigated to ${title.textContent}`;
            }
        }
    });

    // Enhanced form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            // Add form validation logic here
            console.log('Form submitted');
        });
    });
}

/**
 * Performance optimizations
 */
function initializePerformanceOptimizations() {
    // Debounce function for performance
    function debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    // Throttle function for scroll events
    function throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Preload critical resources
    const criticalResources = [
        '/css/style.css',
        '/js/main.js'
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
    });

    // Service Worker registration (if available)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('/sw.js')
                .then(function (registration) {
                    console.log('SW registered: ', registration);
                })
                .catch(function (registrationError) {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

/**
 * Button interactions
 */
document.addEventListener('click', function (e) {
    if (e.target.closest('.btn-primary')) {
        // Add ripple effect
        const button = e.target.closest('.btn');
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);

        // Handle CTA button clicks
        if (button.textContent.includes('Start Trading') || button.textContent.includes('Start Free Trial')) {
            // Add analytics tracking here
            console.log('CTA clicked');
        }
    }
});

/**
 * Error handling
 */
window.addEventListener('error', function (e) {
    console.error('JavaScript error:', e.error);
    // Could send error to analytics service
});

/**
 * Performance monitoring
 */
window.addEventListener('load', function () {
    if ('performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log('Page load time:', loadTime + 'ms');
    }
});

/**
 * Utility functions
 */
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function getScrollPercent() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    return (scrollTop / scrollHeight) * 100;
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeNavigation,
        initializeThreeJS,
        initializeGSAP,
        isElementInViewport,
        getScrollPercent
    };
}