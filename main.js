import * as THREE from 'three';

// ============================================
// UTILITY FUNCTIONS
// ============================================

function lerp(start, end, t) {
    return start + (end - start) * t;
}

function scrollTo(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function handleNewsletter(e) {
    e.preventDefault();
    alert('Thank you for subscribing!');
    e.target.reset();
}

// ============================================
// DEVICE DETECTION
// ============================================

const isMobile = () => window.innerWidth <= 768;
const isTablet = () => window.innerWidth > 768 && window.innerWidth <= 1024;
const isDesktop = () => window.innerWidth > 1024;

// ============================================
// CUSTOM CURSOR
// ============================================

const cursor = document.getElementById('custom-cursor');
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    cursorX = lerp(cursorX, mouseX, 0.15);
    cursorY = lerp(cursorY, mouseY, 0.15);
    
    cursor.style.left = (cursorX - 10) + 'px';
    cursor.style.top = (cursorY - 10) + 'px';
    
    requestAnimationFrame(animateCursor);
}

// Only animate cursor on desktop
if (!isMobile()) {
    animateCursor();
    cursor.style.opacity = '1';
}

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================

const navbar = document.querySelector('.navbar');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    lastScrollY = window.scrollY;
});

// ============================================
// CART FUNCTIONALITY
// ============================================

const cartBtn = document.querySelector('.cart-btn');
const cartDrawer = document.querySelector('.cart-drawer');
const closeCartBtn = document.querySelector('.close-cart');
let cartCount = parseInt(localStorage.getItem('cartCount')) || 0;

function updateCartBadge() {
    document.querySelector('.cart-badge').textContent = cartCount;
}

cartBtn.addEventListener('click', () => {
    cartDrawer.classList.add('open');
});

closeCartBtn.addEventListener('click', () => {
    cartDrawer.classList.remove('open');
});

document.querySelectorAll('.quick-add, .add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
        cartCount++;
        localStorage.setItem('cartCount', cartCount);
        updateCartBadge();
        
        if (btn.classList.contains('add-to-cart')) {
            cartDrawer.classList.add('open');
        }
    });
});

updateCartBadge();

// ============================================
// FILTER FUNCTIONALITY
// ============================================

const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        
        productCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// ============================================
// INTERSECTION OBSERVER FOR SCROLL ANIMATIONS
// ============================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// ============================================
// THREE.JS SCENE 1 - HERO
// ============================================

function initHeroScene() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    
    const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
    });
    
    const width = window.innerWidth;
    const height = window.innerHeight - 70; // Account for navbar
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x0a0a0a, 0);
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    camera.position.z = 5;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xc8a96e, 1);
    pointLight.position.set(-5, 5, 3);
    scene.add(pointLight);
    
    // Main mesh - TorusKnot
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 16);
    const material = new THREE.MeshStandardMaterial({
        color: 0xc8a96e,
        metalness: 1,
        roughness: 0.2
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);
    
    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 300;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 20;
        positions[i + 2] = (Math.random() - 0.5) * 20;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        sizeAttenuation: true
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // Mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Animation loop
    let animationId;
    
    function animate() {
        animationId = requestAnimationFrame(animate);
        
        torusKnot.rotation.x += 0.005;
        torusKnot.rotation.y += 0.008;
        
        torusKnot.rotation.x += mouseY * 0.3;
        torusKnot.rotation.y += mouseX * 0.3;
        
        particles.rotation.x += 0.001;
        particles.rotation.y += 0.002;
        
        renderer.render(scene, camera);
    }
    animate();
    
    // Handle resize
    function onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight - 70;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    
    window.addEventListener('resize', onWindowResize);
    
    // Touch support for mobile (parallax effect)
    let touchX = 0;
    let touchY = 0;
    
    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        touchX = (touch.clientX / window.innerWidth) * 2 - 1;
        touchY = -(touch.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });
    
    document.addEventListener('touchstart', () => {
        mouseX = touchX;
        mouseY = touchY;
    }, { passive: true });
    
    return { scene, camera, renderer, torusKnot, particles, animate: () => animationId };
}

// ============================================
// THREE.JS SCENE 2 - PRODUCT 3D VIEWER
// ============================================

function initProductScene() {
    const canvas = document.getElementById('product-canvas');
    if (!canvas) return;
    
    // Adjust canvas size for mobile
    let canvasSize = 400;
    if (isMobile()) {
        canvasSize = Math.min(window.innerWidth - 40, 300);
    } else if (isTablet()) {
        canvasSize = 350;
    }
    
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    canvas.style.width = canvasSize + 'px';
    canvas.style.height = canvasSize + 'px';
    
    const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(canvasSize, canvasSize);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a0a, 0);
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 3;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Create texture for the box
    const canvas2d = document.createElement('canvas');
    canvas2d.width = 256;
    canvas2d.height = 256;
    const ctx = canvas2d.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#c8a96e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    ctx.fillStyle = '#c8a96e';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('JACKET', 128, 128);
    
    const texture = new THREE.CanvasTexture(canvas2d);
    
    // Create box
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.5,
        roughness: 0.5
    });
    const box = new THREE.Mesh(geometry, material);
    scene.add(box);
    
    // Mouse & Touch interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    const handleStart = (e) => {
        isDragging = true;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        previousMousePosition = { x: clientX, y: clientY };
    };
    
    const handleMove = (e) => {
        if (!isDragging) return;
        
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        const deltaX = clientX - previousMousePosition.x;
        const deltaY = clientY - previousMousePosition.y;
        
        box.rotation.y += deltaX * 0.01;
        box.rotation.x += deltaY * 0.01;
        
        previousMousePosition = { x: clientX, y: clientY };
    };
    
    const handleEnd = () => {
        isDragging = false;
    };
    
    canvas.addEventListener('mousedown', handleStart, false);
    canvas.addEventListener('touchstart', handleStart, false);
    
    document.addEventListener('mousemove', handleMove, false);
    document.addEventListener('touchmove', handleMove, { passive: true });
    
    document.addEventListener('mouseup', handleEnd, false);
    document.addEventListener('touchend', handleEnd, false);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        if (!isDragging) {
            box.rotation.x += 0.001;
            box.rotation.y += 0.005;
        }
        
        renderer.render(scene, camera);
    }
    animate();
    
    return { scene, camera, renderer, box };
}

// ============================================
// THREE.JS SCENE 3 - AMBIENT SECTION
// ============================================

function initAmbientScene() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    
    const width = window.innerWidth;
    let height = 400;
    
    if (isMobile()) {
        height = 300;
    } else if (isTablet()) {
        height = 350;
    }
    
    const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a0a, 0);
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / 400,
        0.1,
        1000
    );
    camera.position.z = 5;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xc8a96e, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Create multiple torus shapes
    const toruses = [];
    for (let i = 0; i < 5; i++) {
        const geometry = new THREE.TorusGeometry(1 + i * 0.5, 0.2, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0xc8a96e,
            wireframe: false,
            metalness: 0.8,
            roughness: 0.3,
            transparent: true,
            opacity: 0.6 - i * 0.1
        });
        const torus = new THREE.Mesh(geometry, material);
        
        torus.position.x = (Math.random() - 0.5) * 10;
        torus.position.y = (Math.random() - 0.5) * 6;
        torus.position.z = -i * 2;
        
        torus.rotation.x = Math.random() * Math.PI;
        torus.rotation.y = Math.random() * Math.PI;
        
        scene.add(torus);
        toruses.push({
            mesh: torus,
            driftX: Math.random() * 0.002,
            driftY: Math.random() * 0.002,
            initialY: torus.position.y
        });
    }
    
    // Animation loop
    let startTime = Date.now();
    
    function animate() {
        requestAnimationFrame(animate);
        
        const time = (Date.now() - startTime) * 0.001;
        
        toruses.forEach((torus, i) => {
            torus.mesh.rotation.x += 0.001;
            torus.mesh.rotation.y += 0.002;
            
            torus.mesh.position.x += torus.driftX;
            torus.mesh.position.y = torus.initialY + Math.sin(time + i) * 0.5;
        });
        
        const scrollY = window.scrollY;
        const ambientSection = document.getElementById('ambient');
        if (ambientSection) {
            const rect = ambientSection.getBoundingClientRect();
            const parallaxOffset = -rect.top * 0.02;
            camera.position.y = parallaxOffset;
        }
        
        renderer.render(scene, camera);
    }
    animate();
    
    // Handle resize
    function onWindowResize() {
        const width = window.innerWidth;
        let height = 400;
        
        if (isMobile()) {
            height = 300;
        } else if (isTablet()) {
            height = 350;
        }
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    
    window.addEventListener('resize', onWindowResize);
    
    return { scene, camera, renderer, toruses };
}

// ============================================
// CATEGORY CARD 3D TILT
// ============================================

function initCategoryCardTilt() {
    const cards = document.querySelectorAll('.category-card');
    
    // Disable 3D tilt on mobile for better performance
    if (isMobile()) {
        cards.forEach(card => {
            card.style.perspective = 'none';
        });
        return;
    }
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const angleX = (e.clientY - centerY) / (rect.height / 2) * -10;
            const angleY = (e.clientX - centerX) / (rect.width / 2) * 10;
            
            card.style.transform = `
                perspective(1000px)
                rotateX(${angleX}deg)
                rotateY(${angleY}deg)
                translateZ(20px)
            `;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}

// ============================================
// SIZE SELECTOR
// ============================================

function initSizeSelector() {
    const sizeBtns = document.querySelectorAll('.size-btn');
    
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// ============================================
// PRODUCT CARDS - RESPONSIVE 3D EFFECT
// ============================================

function initProductCards() {
    const cards = document.querySelectorAll('.product-card');
    
    // Disable 3D effects on mobile
    if (isMobile()) {
        cards.forEach(card => {
            card.style.perspective = 'none';
            card.addEventListener('click', function() {
                this.style.transform = 'translateY(-5px)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 300);
            });
        });
        return;
    }
    
    // 3D tilt on desktop
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const angleX = (e.clientY - centerY) / (rect.height / 2) * -5;
            const angleY = (e.clientX - centerX) / (rect.width / 2) * 5;
            
            card.style.transform = `
                rotateX(${angleX}deg)
                rotateY(${angleY}deg)
                translateY(-10px)
            `;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Three.js scenes
    initHeroScene();
    setTimeout(() => initProductScene(), 500);
    setTimeout(() => initAmbientScene(), 1000);
    
    // Initialize interactions
    initCategoryCardTilt();
    initProductCards();
    initSizeSelector();
    
    // Expose functions to global scope for onclick handlers
    window.scrollTo = scrollTo;
    window.handleNewsletter = handleNewsletter;
});

// Handle device orientation changes
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        location.reload();
    }, 100);
});
