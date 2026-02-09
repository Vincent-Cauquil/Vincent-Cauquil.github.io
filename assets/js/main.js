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

// ========== LIGHTBOX AMÉLIORÉE AVEC NAVIGATION ==========
let currentLightboxSlider = null;
let currentLightboxIndex = 0;

// Fonction pour ouvrir la lightbox
function openLightbox(imgElement) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    
    // Détecter si l'image est dans un slider
    const slider = imgElement.closest('.evidence-slider');
    
    if (slider) {
        currentLightboxSlider = slider;
        const slides = Array.from(slider.querySelectorAll('.slide'));
        const activeSlide = slider.querySelector('.slide.active');
        currentLightboxIndex = slides.indexOf(activeSlide);
        
        // Afficher les flèches
        document.querySelector('.lightbox-prev').style.display = 'flex';
        document.querySelector('.lightbox-next').style.display = 'flex';
    } else {
        currentLightboxSlider = null;
        // Cacher les flèches pour image seule
        document.querySelector('.lightbox-prev').style.display = 'none';
        document.querySelector('.lightbox-next').style.display = 'none';
    }
    
    lightboxImg.src = imgElement.src;
    lightboxImg.alt = imgElement.alt;
    
    // Récupérer la caption active
    const caption = imgElement.nextElementSibling;
    if (caption && caption.classList.contains('caption')) {
        const activeCaption = caption.querySelector('.lang-text:not([style*="display: none"])') || caption;
        lightboxCaption.textContent = activeCaption.textContent;
    } else {
        lightboxCaption.textContent = '';
    }
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fonction pour fermer la lightbox
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    currentLightboxSlider = null;
}

// ========== NAVIGATION DANS LA LIGHTBOX ==========
function navigateLightbox(direction) {
    if (!currentLightboxSlider) return;

    const sliderId = currentLightboxSlider.id;
    const slides = currentLightboxSlider.querySelectorAll('.slide');

    // Mettre à jour l'index
    currentLightboxIndex += direction;

    if (currentLightboxIndex >= slides.length) {
        currentLightboxIndex = 0;
    }
    if (currentLightboxIndex < 0) {
        currentLightboxIndex = slides.length - 1;
    }

    // Mettre à jour le slider en arrière-plan
    slideIndices[sliderId] = currentLightboxIndex + 1;
    showSlides(slideIndices[sliderId], sliderId);

    // Mettre à jour l'image dans la lightbox
    const activeSlide = slides[currentLightboxIndex];
    const img = activeSlide.querySelector('img');
    
    // Gérer les images traduisibles
    let imgSrc = img.src;
    let imgAlt = img.alt;

    if (img.classList.contains('img-translatable')) {
        const currentLang = document.querySelector('.lang-btn.active').dataset.lang;
        imgSrc = img.dataset[`src${currentLang.charAt(0).toUpperCase() + currentLang.slice(1)}`] || img.src;
        imgAlt = img.dataset[`alt${currentLang.charAt(0).toUpperCase() + currentLang.slice(1)}`] || img.alt;
    }

    // Récupérer la légende dans la bonne langue
    const captions = activeSlide.querySelectorAll('.caption.lang-text, .caption .lang-text');
    let captionText = '';

    captions.forEach(caption => {
        if (caption.style.display !== 'none') {
            captionText = caption.textContent;
        }
    });

    // Fallback sur l'alt si pas de légende
    if (!captionText) {
        captionText = imgAlt || '';
    }

    // Mise à jour de la lightbox
    document.getElementById('lightbox-img').src = imgSrc;
    document.getElementById('lightbox-img').alt = imgAlt;
    document.getElementById('lightbox-caption').textContent = captionText;
}

// Event listeners pour la lightbox
document.addEventListener('DOMContentLoaded', function() {
    // Créer la lightbox si elle n'existe pas
    if (!document.getElementById('lightbox')) {
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <span class="lightbox-close" onclick="closeLightbox()">×</span>
            <span class="lightbox-prev" onclick="navigateLightbox(-1)">❮</span>
            <span class="lightbox-next" onclick="navigateLightbox(1)">❯</span>
            <div class="lightbox-content">
                <img id="lightbox-img" src="" alt="">
            </div>
            <div id="lightbox-caption" class="lightbox-caption"></div>
        `;
        document.body.appendChild(lightbox);
    }
    
    // Click sur l'image pour ouvrir
    document.addEventListener('click', function(e) {
        if (e.target.matches('.evidence-image img, .evidence-slider img')) {
            openLightbox(e.target);
        }
    });
    
    // Clic en dehors de l'image pour fermer
    document.getElementById('lightbox')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeLightbox();
        }
    });
    
    // Touche Échap pour fermer
    document.addEventListener('keydown', function(e) {
        const lightbox = document.getElementById('lightbox');
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft' && currentLightboxSlider) {
                navigateLightbox(-1);
            } else if (e.key === 'ArrowRight' && currentLightboxSlider) {
                navigateLightbox(1);
            }
        }
    });
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

    // 1. EVENT LISTENERS LIGHTBOX (lightbox déjà dans le HTML)
    // Click sur l'image pour ouvrir
    document.addEventListener('click', function(e) {
        if (e.target.matches('.evidence-image img, .evidence-slider img')) {
            openLightbox(e.target);
        }
    });

    // Clic en dehors de l'image pour fermer
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === this) {
                closeLightbox();
            }
        });
    }

    // Touche Échap pour fermer
    document.addEventListener('keydown', function(e) {
        const lightbox = document.getElementById('lightbox');
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft' && currentLightboxSlider) {
                navigateLightbox(-1);
            } else if (e.key === 'ArrowRight' && currentLightboxSlider) {
                navigateLightbox(1);
            }
        }
    });

    // 2. Détection de langue
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
        setLanguage(savedLang);
    } else {
        const detectedLang = await detectCountry();
        setLanguage(detectedLang);
    }

    // 3. Boutons langue
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });

    // 4. Charger les projets
    await loadProjects();

    // 5. Smooth scroll
    initSmoothScroll();

    console.log('✅ Tout est chargé');
});

