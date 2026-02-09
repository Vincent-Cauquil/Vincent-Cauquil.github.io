// ========== VARIABLES GLOBALES ==========
let currentLang = 'fr';
let slideIndices = {}; // Pour gérer les sliders

// ========== CHARGEMENT DES PROJETS ==========
const projects = [
    { id: 'project-parking', file: 'assets/projects/project-parking.html' },
    { id: 'project-AI', file: 'assets/projects/project-AI.html' },
    { id: 'project-A8', file: 'assets/projects/project-A8.html' },
];

async function loadProjects() {
    console.log('Chargement des projets...');

    for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        const container = document.getElementById(project.id);

        if (container) {
            try {
                const response = await fetch(project.file);
                if (response.ok) {
                    const html = await response.text();
                    container.innerHTML = html;

                    // 1. Attribution automatique gauche/droite
                    const timelineItem = container.querySelector('.timeline-item');
                    if (timelineItem) {
                        const side = (i % 2 === 0) ? 'left' : 'right';
                        timelineItem.classList.add(side);
                        console.log(`✅ Projet chargé: ${project.id} (${side})`);
                    }

                    // 2. INITIALISATION DU SLIDER
                    const sliders = container.querySelectorAll('.evidence-slider');
                    sliders.forEach(slider => {
                        const sliderId = slider.id;
                        if (sliderId) {
                            slideIndices[sliderId] = 1;
                            showSlides(1, sliderId);
                        }
                    });

                } else {
                    console.warn(`❌ Erreur HTTP ${response.status}: ${project.file}`);
                }
            } catch (error) {
                console.warn(`❌ Projet non trouvé: ${project.file}`, error);
            }
        } else {
            console.warn(`❌ Container non trouvé: ${project.id}`);
        }
    }

    // Réappliquer la langue après chargement complet
    setLanguage(currentLang);

    // ✨ NOUVEAU : Activer le zoom sur toutes les images chargées
    activateImageZoom();

    // Observer les nouveaux éléments
    initTimelineObserver();
    initCloseOnClickOutside();
}

// ========== GESTION DU SLIDER ==========
function plusSlides(n, sliderId) {
    showSlides(slideIndices[sliderId] += n, sliderId);
}

function showSlides(n, sliderId) {
    let i;
    let slider = document.getElementById(sliderId);

    if (!slider) return;

    let slides = slider.getElementsByClassName("slide");

    if (!slideIndices[sliderId]) { slideIndices[sliderId] = 1; }

    if (n > slides.length) { slideIndices[sliderId] = 1 }    
    if (n < 1) { slideIndices[sliderId] = slides.length }

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
        slides[i].classList.remove("active");
    }

    slides[slideIndices[sliderId]-1].style.display = "block";  
    slides[slideIndices[sliderId]-1].classList.add("active");
}

// ========== GESTION DES LANGUES ==========
async function detectCountry() {
    try {
        const response = await fetch('https://ipapi.co/country_code/');
        const country = await response.text();
        const frenchCountries = ['FR', 'BE', 'CA', 'LU', 'MC'];
        if (frenchCountries.includes(country)) {
            return 'fr';
        }
    } catch (e) {
        if (navigator.language.toLowerCase().startsWith('fr')) {
            return 'fr';
        }
    }
    return 'en';
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    document.querySelectorAll('.lang-text').forEach(el => {
        el.style.display = el.dataset.lang === lang ? '' : 'none';
    });

    // ✨ NOUVEAU : Mettre à jour les images traduisibles
    updateTranslatableImages(lang);
}

// ========== GESTION DES IMAGES BILINGUES (OPTIONNEL) ==========
function updateTranslatableImages(lang) {
    document.querySelectorAll('.img-translatable').forEach(img => {
        const newSrc = img.getAttribute(`data-src-${lang}`);
        const newAlt = img.getAttribute(`data-alt-${lang}`);
        
        // Change le SRC seulement si une version existe pour cette langue
        if (newSrc) {
            const currentSrc = img.getAttribute('src');
            if (currentSrc !== newSrc) {
                img.setAttribute('src', newSrc);
            }
        }
        
        // Change le ALT seulement si une version existe
        if (newAlt) {
            img.setAttribute('alt', newAlt);
        }
    });
}

// ========== LIGHTBOX ZOOM ==========
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.querySelector('.lightbox-close');

// Fonction pour ouvrir la lightbox
function openLightbox(img) {
    lightbox.classList.add('active');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    
    // Récupérer la caption visible (gère le bilinguisme)
    const parentContainer = img.closest('.evidence-image, .slide');
    if (parentContainer) {
        const visibleCaption = parentContainer.querySelector('.caption.lang-text:not([style*="display: none"])');
        if (visibleCaption) {
            lightboxCaption.textContent = visibleCaption.textContent;
        } else {
            lightboxCaption.textContent = img.alt;
        }
    } else {
        lightboxCaption.textContent = img.alt;
    }
    
    document.body.style.overflow = 'hidden';
}

// Fonction pour fermer la lightbox
function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// Activer le zoom sur toutes les images
function activateImageZoom() {
    document.querySelectorAll('.evidence-image img, .evidence-slider img').forEach(img => {
        // Éviter de créer plusieurs listeners
        img.removeEventListener('click', handleImageClick);
        img.addEventListener('click', handleImageClick);
    });
}

function handleImageClick(e) {
    openLightbox(e.target);
}

// Événements lightbox
if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
}

if (lightbox) {
    // Fermer en cliquant sur le fond noir
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

// Fermer avec la touche Échap (gère aussi la fermeture des projets)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Fermer lightbox si ouverte
        if (lightbox && lightbox.classList.contains('active')) {
            closeLightbox();
        }
        // Sinon fermer les projets expanded
        else {
            document.querySelectorAll('.timeline-item.expanded').forEach(item => {
                closeProject(item);
            });
        }
    }
});

// ========== OBSERVER TIMELINE ==========
function initTimelineObserver() {
    const timelineItems = document.querySelectorAll('.timeline-item');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    timelineItems.forEach(item => {
        observer.observe(item);
    });
}

// ========== EXPANSION DES PROJETS ==========
function toggleProject(element) {
    const card = element.closest('.timeline-content');
    const item = card.closest('.timeline-item');
    const isExpanding = !item.classList.contains('expanded');

    // Fermer tous les autres
    document.querySelectorAll('.timeline-item.expanded').forEach(i => {
        i.classList.remove('expanded');
        i.querySelector('.timeline-content').classList.remove('expanded');
    });

    if (isExpanding) {
        item.classList.add('expanded');
        card.classList.add('expanded');
        document.body.classList.add('modal-open');
        setTimeout(() => { item.scrollTop = 0; }, 100);
    } else {
        document.body.classList.remove('modal-open');
    }
}

// Fermer en cliquant en dehors
function initCloseOnClickOutside() {
    document.querySelectorAll('.timeline-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target === item && item.classList.contains('expanded')) {
                closeProject(item);
            }
        });
    });

    // Boutons close
    document.querySelectorAll('.btn-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = btn.closest('.timeline-item');
            closeProject(item);
        });
    });
}

// ========== FONCTION FERMETURE ==========
function closeProject(item) {
    item.classList.remove('expanded');
    item.querySelector('.timeline-content').classList.remove('expanded');
    document.body.classList.remove('modal-open');
}

// ========== SMOOTH SCROLL ==========
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========== INITIALISATION GÉNÉRALE ==========
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Portfolio initialisé');

    // 1. Détection de langue
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
        setLanguage(savedLang);
    } else {
        const detectedLang = await detectCountry();
        setLanguage(detectedLang);
    }

    // 2. Boutons langue
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });

    // 3. Charger les projets
    await loadProjects();

    // 4. Smooth scroll
    initSmoothScroll();

    console.log('✅ Tout est chargé');
});
