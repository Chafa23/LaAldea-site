// Cache DOM elements
const DOMElements = {
    loader: document.querySelector('.preloader'),
    navbar: document.querySelector("nav"),
    scrollToTop: document.getElementById("scrollToTop"),
    cookieBanner: document.getElementById("cookieConsent"),
    sections: document.querySelectorAll("section"),
    hero: document.getElementById('hero'),
    lazyImages: document.querySelectorAll('[data-src]'),
    lazyBackgrounds: document.querySelectorAll('[data-bg]')
};

// Enhanced utility functions
const utils = {
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    logWarning(message, error = null) {
        console.warn(`[La Aldea]: ${message}`, error ? error : '');
        if (error && error.stack) {
            console.debug('[La Aldea Debug]:', error.stack);
        }
    },

    safeExecute(fn, errorMessage) {
        try {
            return fn();
        } catch (error) {
            this.logWarning(errorMessage, error);
            return null;
        }
    }
};

// Enhanced lazy loading with separate observers
const lazyLoading = {
    imageObserver: new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.handleImageLoad(img);
            }
        });
    }, { threshold: 0.1 }),

    backgroundObserver: new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                this.handleBackgroundLoad(el);
            }
        });
    }, { threshold: 0.1 }),

    handleImageLoad(img) {
        utils.safeExecute(() => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                this.imageObserver.unobserve(img);
            }
        }, `Failed to load image: ${img.dataset.src}`);
    },

    handleBackgroundLoad(element) {
        utils.safeExecute(() => {
            if (element.dataset.bg) {
                element.style.backgroundImage = `url(${element.dataset.bg})`;
                this.backgroundObserver.unobserve(element);
            }
        }, `Failed to load background: ${element.dataset.bg}`);
    },

    init() {
        if (!('loading' in HTMLImageElement.prototype)) {
            DOMElements.lazyImages.forEach(img => this.imageObserver.observe(img));
        }
        DOMElements.lazyBackgrounds.forEach(el => this.backgroundObserver.observe(el));
    },

    cleanup() {
        this.imageObserver.disconnect();
        this.backgroundObserver.disconnect();
    }
};

// Scroll management
const scrollManager = {
    lastScroll: 0,
    ticking: false,

    init() {
        if (!DOMElements.navbar || !DOMElements.scrollToTop) {
            utils.logWarning("Required scroll elements not found");
            return;
        }

        window.addEventListener('scroll', () => {
            if (!this.ticking) {
                requestAnimationFrame(() => this.handleScroll());
                this.ticking = true;
            }
        });

        DOMElements.scrollToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    },

    handleScroll() {
        const currentScroll = window.pageYOffset;
            
        // Update navbar
        DOMElements.navbar.classList.toggle("scrolled", currentScroll > 50);
        DOMElements.navbar.style.transform = currentScroll > this.lastScroll && currentScroll > 500 
            ? "translateY(-100%)" 
            : "translateY(0)";
        
        // Update scroll-to-top button with fade effect
        if (currentScroll > 300) {
            DOMElements.scrollToTop.style.display = "flex";
            setTimeout(() => DOMElements.scrollToTop.style.opacity = "1", 10);
        } else {
            DOMElements.scrollToTop.style.opacity = "0";
            setTimeout(() => DOMElements.scrollToTop.style.display = "none", 200);
        }
        
        this.lastScroll = currentScroll;
        this.ticking = false;
    }
};

// Height management
const heightManager = {
    setPageHeights() {
        const height = window.innerHeight;
        
        DOMElements.sections.forEach(section => {
            if (section.id === 'hero') {
                if (!section.hasAttribute('data-height-set')) {
                    section.style.height = `${height}px`;
                    section.setAttribute('data-height-set', 'true');
                }
            } else if (window.innerWidth <= 768) {
                section.style.minHeight = `${height}px`;
            } else {
                section.style.minHeight = '';
            }
        });
    },

    handleOrientationChange: utils.debounce(() => {
        if (DOMElements.hero) {
            DOMElements.hero.removeAttribute('data-height-set');
            setTimeout(() => heightManager.setPageHeights(), 100);
        }
    }, 250)
};

// Main initialization with enhanced error handling
document.addEventListener("DOMContentLoaded", function() {
    // Critical initialization
    const criticalInit = () => {
        utils.safeExecute(() => {
            if (DOMElements.loader) {
                setTimeout(() => {
                    DOMElements.loader.style.opacity = '0';
                    setTimeout(() => DOMElements.loader.style.display = 'none', 500);
                }, 500);
            }

            heightManager.setPageHeights();
            scrollManager.init();
        }, "Critical initialization failed");
    };

    // Non-critical initialization
    const deferredInit = () => {
        utils.safeExecute(() => {
            lazyLoading.init();
            
            if (typeof AOS !== 'undefined') {
                AOS.init({
                    duration: 800,
                    once: true,
                    offset: 100
                });
            }

            // Initialize smooth scrolling
            initializeSmoothScroll();
            initializeCookieConsent();
        }, "Deferred initialization failed");
    };

    // Execute critical operations immediately
    criticalInit();

    // Defer non-critical operations
    if (window.requestIdleCallback) {
        requestIdleCallback(deferredInit);
    } else {
        setTimeout(deferredInit, 1000);
    }

    // Event listeners
    window.addEventListener('orientationchange', heightManager.handleOrientationChange);

    // Enhanced cleanup
    return () => {
        utils.safeExecute(() => {
            lazyLoading.cleanup();
            // Add other cleanup tasks here
        }, "Cleanup failed");
    };
});

// Utility functions remain unchanged
function openContactForm(product) {
    document.querySelector('#message').value = `Consulta sobre: ${product}`;
    document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
}

function closeModalAndScroll(modalId) {
    const modal = document.getElementById(modalId);
    const bsModal = bootstrap.Modal.getInstance(modal);
    const navHeight = document.querySelector('nav').offsetHeight;
    
    bsModal.hide();
    
    // Wait for modal animation to complete before scrolling
    setTimeout(() => {
        const contactSection = document.querySelector('#contact');
        const targetPosition = contactSection.offsetTop - navHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
        });
    }, 300); // Match Bootstrap's modal transition time
}

function initializeSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            const targetElement = document.querySelector(targetId);
            const navHeight = document.querySelector('nav').offsetHeight;
            const targetPosition = targetElement.offsetTop - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });
        });
    });
}

function initializeCookieConsent() {
    if (cookieConsent && typeof cookieConsent.init === "function") {
        cookieConsent.init();
    }
}

const cookieConsent = {
    banner: DOMElements.cookieBanner,
    
    init() {
        if (!localStorage.getItem('cookiesAccepted') && this.banner) {
            this.banner.style.display = 'block';
            this.banner.querySelector('button')?.addEventListener('click', () => this.accept());
        }
    },

    accept() {
        localStorage.setItem('cookiesAccepted', 'true');
        if (this.banner) {
            this.banner.style.opacity = '0';
            setTimeout(() => {
                this.banner.style.display = 'none';
            }, 300);
        }
    }
};
