// ========== VARIABLES GLOBALES ==========
let currentLang = 'fr';
let slideIndices = {};
let currentLightboxSlider = null;  
let currentLightboxIndex = 0;      

// ========== CHARGEMENT DES PROJETS ==========
const projects = [
    { id: 'project-parking', file: 'assets/projects/project-parking.html' },
    { id: 'project-research', file: 'assets/projects/project-research.html' },
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

                    const timelineItem = container.querySelector('.timeline-item');
                    if (timelineItem) {
                        const side = (i % 2 === 0) ? 'left' : 'right';
                        timelineItem.classList.add(side);
                        console.log(`✅ Projet chargé: ${project.id} (${side})`);
                    }

                    // INITIALISATION DES SLIDERS
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

    setLanguage(currentLang);
    initTimelineObserver();
    initCloseOnClickOutside();
}

// ========== GESTION DU SLIDER ==========
function plusSlides(n, sliderId) {
    showSlides(slideIndices[sliderId] += n, sliderId);
}

function showSlides(n, sliderId) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;

    const slides = slider.getElementsByClassName("slide");
    if (!slides.length) return;

    if (!slideIndices[sliderId]) { slideIndices[sliderId] = 1; }
    if (n > slides.length) { slideIndices[sliderId] = 1; }
    if (n < 1) { slideIndices[sliderId] = slides.length; }

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        slides[i].classList.remove("active");
    }

    slides[slideIndices[sliderId] - 1].style.display = "block";
    slides[slideIndices[sliderId] - 1].classList.add("active");
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

    updateTranslatableImages(lang);
}

function updateTranslatableImages(lang) {
    document.querySelectorAll('.img-translatable').forEach(img => {
        const newSrc = img.getAttribute(`data-src-${lang}`);
        const newAlt = img.getAttribute(`data-alt-${lang}`);

        if (newSrc) {
            img.setAttribute('src', newSrc);
        }
        if (newAlt) {
            img.setAttribute('alt', newAlt);
        }
    });
}

// ========== LIGHTBOX ==========
function openLightbox(img) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');

    // ✅ Récupérer le bon src selon la langue
    let imgSrc = img.src;
    let imgAlt = img.alt;

    if (img.classList.contains('img-translatable')) {
        const langSrc = img.getAttribute(`data-src-${currentLang}`);
        const langAlt = img.getAttribute(`data-alt-${currentLang}`);
        if (langSrc) imgSrc = langSrc;
        if (langAlt) imgAlt = langAlt;
    }

    lightboxImg.src = imgSrc;
    lightboxImg.alt = imgAlt;

    // ✅ Récupérer la caption visible
    let captionText = '';
    const parent = img.closest('.evidence-image, .slide');

    if (parent) {
        const captions = parent.querySelectorAll('.caption.lang-text, .caption .lang-text');
        captions.forEach(caption => {
            if (caption.style.display !== 'none') {
                captionText = caption.textContent;
            }
        });

        // Fallback : caption sans lang-text
        if (!captionText) {
            const simpleCaption = parent.querySelector('.caption');
            if (simpleCaption && !simpleCaption.classList.contains('lang-text')) {
                captionText = simpleCaption.textContent;
            }
        }
    }

    if (!captionText) {
        captionText = imgAlt || '';
    }

    lightboxCaption.textContent = captionText;

    // ✅ Gestion slider dans la lightbox
    const slider = img.closest('.evidence-slider');
    if (slider) {
        currentLightboxSlider = slider;
        const slides = slider.querySelectorAll('.slide');
        slides.forEach((slide, index) => {
            if (slide.querySelector('img') === img) {
                currentLightboxIndex = index;
            }
        });
    } else {
        currentLightboxSlider = null;
    }

    lightbox.classList.add('active');
    document.body.classList.add('modal-open');

    console.log('🔍 Lightbox ouverte:', imgSrc); // ← Debug
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.classList.remove('modal-open');
    currentLightboxSlider = null;
}

function navigateLightbox(direction) {
    if (!currentLightboxSlider) return;

    const sliderId = currentLightboxSlider.id;
    const slides = currentLightboxSlider.querySelectorAll('.slide');

    currentLightboxIndex += direction;

    if (currentLightboxIndex >= slides.length) currentLightboxIndex = 0;
    if (currentLightboxIndex < 0) currentLightboxIndex = slides.length - 1;

    slideIndices[sliderId] = currentLightboxIndex + 1;
    showSlides(slideIndices[sliderId], sliderId);

    const activeSlide = slides[currentLightboxIndex];
    const img = activeSlide.querySelector('img');

    let imgSrc = img.src;
    let imgAlt = img.alt;

    if (img.classList.contains('img-translatable')) {
        const langSrc = img.getAttribute(`data-src-${currentLang}`);
        const langAlt = img.getAttribute(`data-alt-${currentLang}`);
        if (langSrc) imgSrc = langSrc;
        if (langAlt) imgAlt = langAlt;
    }

    let captionText = '';
    const captions = activeSlide.querySelectorAll('.caption.lang-text, .caption .lang-text');
    captions.forEach(caption => {
        if (caption.style.display !== 'none') {
            captionText = caption.textContent;
        }
    });

    if (!captionText) captionText = imgAlt || '';

    document.getElementById('lightbox-img').src = imgSrc;
    document.getElementById('lightbox-img').alt = imgAlt;
    document.getElementById('lightbox-caption').textContent = captionText;
}

// ========== OBSERVER TIMELINE ==========
function initTimelineObserver() {
    const timelineItems = document.querySelectorAll('.timeline-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.2 });

    timelineItems.forEach(item => observer.observe(item));
}

// ========== EXPANSION DES PROJETS ==========
function toggleProject(element) {
    const card = element.closest('.timeline-content');
    const item = card.closest('.timeline-item');
    const isExpanding = !item.classList.contains('expanded');

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

function initCloseOnClickOutside() {
    document.querySelectorAll('.timeline-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target === item && item.classList.contains('expanded')) {
                closeProject(item);
            }
        });
    });

    document.querySelectorAll('.btn-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = btn.closest('.timeline-item');
            closeProject(item);
        });
    });
}

function closeProject(item) {
    item.classList.remove('expanded');
    item.querySelector('.timeline-content').classList.remove('expanded');
    document.body.classList.remove('modal-open');
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ========== INITIALISATION UNIQUE ==========
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Portfolio initialisé');

    // ✅ UN SEUL listener pour les clicks sur images (délégation)
    document.addEventListener('click', function (e) {
        const img = e.target.closest('.evidence-image img, .evidence-slider .slide img');
        if (img) {
            e.stopPropagation();
            openLightbox(img);
        }
    });

    // Fermer lightbox en cliquant en dehors
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === this) closeLightbox();
        });
    }

    // Clavier
    document.addEventListener('keydown', function (e) {
        const lb = document.getElementById('lightbox');
        if (lb && lb.classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowLeft' && currentLightboxSlider) navigateLightbox(-1);
            else if (e.key === 'ArrowRight' && currentLightboxSlider) navigateLightbox(1);
        }
    });

    // Langue
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
        setLanguage(savedLang);
    } else {
        const detectedLang = await detectCountry();
        setLanguage(detectedLang);
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    // Charger les projets
    await loadProjects();

    // Smooth scroll
    initSmoothScroll();

    console.log('✅ Tout est chargé');
});
