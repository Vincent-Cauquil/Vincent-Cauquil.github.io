// Animation au scroll pour les éléments de la timeline
document.addEventListener('DOMContentLoaded', () => {
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

  // Smooth scroll pour les ancres
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
});

// === GESTION DES LANGUES ===
let currentLang = 'en';

// Au chargement
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
});

async function initLanguage() {
    currentLang = await detectLanguage();
    console.log('Langue détectée:', currentLang); // Debug
    setLanguage(currentLang);
}

async function detectLanguage() {
    // 1. Vérifier si l'utilisateur a déjà choisi
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
        console.log('Langue sauvegardée:', savedLang);
        return savedLang;
    }
    
    // 2. Langue du navigateur (simple et fiable)
    const browserLang = navigator.language || navigator.userLanguage;
    console.log('Langue navigateur:', browserLang);
    
    if (browserLang.toLowerCase().startsWith('fr')) {
        console.log('→ Français détecté');
        return 'fr';
    }
    
    console.log('→ Anglais par défaut');
    return 'en';
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    
    // Mettre à jour les boutons
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Afficher/cacher les textes
    const langTexts = document.querySelectorAll('.lang-text');
    console.log('Nombre de textes trouvés:', langTexts.length); // Debug
    
    langTexts.forEach(el => {
        if (el.dataset.lang === lang) {
            el.style.display = '';
        } else {
            el.style.display = 'none';
        }
    });
}

// Écouteurs sur les boutons
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        setLanguage(btn.dataset.lang);
    });
});

