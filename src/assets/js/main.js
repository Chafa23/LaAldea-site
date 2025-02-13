document.addEventListener("DOMContentLoaded", function() {
    // Add preloader
    const loader = document.querySelector('.preloader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }, 500);
    }

    // Set hero section height (critical)
    function setHeroHeight() {
        const heroSection = document.getElementById('hero');
        if (heroSection && !heroSection.hasAttribute('data-height-set')) {
            heroSection.style.height = window.innerHeight + 'px';
            heroSection.setAttribute('data-height-set', 'true');
        }
    }

    // Initialize navbar with optimized scroll handling (critical)
    function initializeNavbar() {
        let lastScroll = 0;
        let scrollTimeout;
        function handleScroll() {
            const currentScroll = window.pageYOffset;
            const navbar = document.querySelector("nav");
            // Update navbar classes
            if (currentScroll > 50) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
            // Show/hide navbar based on scroll direction
            if (currentScroll > lastScroll && currentScroll > 500) {
                navbar.style.transform = "translateY(-100%)";
            } else {
                navbar.style.transform = "translateY(0)";
            }
            lastScroll = currentScroll;
            // Update scroll-to-top button
            const scrollToTopBtn = document.getElementById("scrollToTop");
            if (scrollToTopBtn) {
                scrollToTopBtn.style.display = currentScroll > 300 ? "flex" : "none";
            }
        }
        window.addEventListener('scroll', () => {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    handleScroll();
                    scrollTimeout = null;
                }, 50);
            }
        });
    }

    // Optimized lazy loading using IntersectionObserver
    const optimizedLazyLoadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    optimizedLazyLoadObserver.unobserve(img);
                }
            }
        });
    }, { threshold: 0.1, rootMargin: "50px" });

    function initializeLazyLoading() {
        document.querySelectorAll('img[data-src]').forEach(img =>
            optimizedLazyLoadObserver.observe(img)
        );
    }

    // Defer non-critical feature initializations
    function initializeAOS() {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });
    }

    function initializeCookieConsent() {
        if (cookieConsent && typeof cookieConsent.init === "function") {
            cookieConsent.init();
        }
    }

    // Critical operations
    setHeroHeight();
    initializeNavbar();
    
    // Defer non-critical operations
    setTimeout(() => {
        initializeLazyLoading();
        initializeAOS();
        initializeCookieConsent();
    }, 1000);

    // Cookie Consent Management
    const cookieConsent = {
        banner: document.getElementById('cookieConsent'),
        
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

    // Smooth scrolling with offset
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

    // Lazy loading for images and background images
    const lazyLoadOptions = {
        threshold: 0.1,
        rootMargin: "50px"
    };

    // Separate observers for images and backgrounds for better performance
    const lazyLoadImages = () => {
        if (!('loading' in HTMLImageElement.prototype)) {
            const images = document.querySelectorAll('[data-src]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        imageObserver.unobserve(img);
                    }
                });
            }, lazyLoadOptions);
            images.forEach(img => imageObserver.observe(img));
        }
    };

    const lazyLoadBackgrounds = () => {
        const elements = document.querySelectorAll('[data-bg]');
        const bgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    element.style.backgroundImage = `url(${element.dataset.bg})`;
                    bgObserver.unobserve(element);
                }
            });
        }, lazyLoadOptions);
        elements.forEach(el => bgObserver.observe(el));
    };

    // Initialize both lazy loading types
    lazyLoadImages();
    lazyLoadBackgrounds();

    const observer = new IntersectionObserver(lazyLoad, lazyLoadOptions);
    document.querySelectorAll('[data-src], [data-bg]').forEach(el => observer.observe(el));

    // Image loading optimization
    function loadOptimizedImages() {
        if ('loading' in HTMLImageElement.prototype) {
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        } else {
            // Import lazy loading polyfill for older browsers
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/loading-attribute-polyfill/1.5.4/loading-attribute-polyfill.min.js';
            document.head.appendChild(script);
        }
    }

    // Initialize image optimization
    loadOptimizedImages();

    // Scroll to top button
    const scrollToTopBtn = document.getElementById("scrollToTop");

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = "flex";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    function setPageHeights() {
        const sections = document.querySelectorAll('section');
        // Get height once and lock it
        const height = window.innerHeight;
        
        sections.forEach(section => {
            if (section.id === 'hero') {
                // Only set height if not already set
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
    }
    
    // Set initial heights only once when DOM loads
    document.addEventListener('DOMContentLoaded', setPageHeights);
    
    // Update heights only on orientation change
    window.addEventListener('orientationchange', () => {
        // Remove the height lock
        const heroSection = document.querySelector('#hero');
        if (heroSection) {
            heroSection.removeAttribute('data-height-set');
        }
        // Update heights after a small delay
        setTimeout(setPageHeights, 100);
    });

    // Remove other height-related event listeners
    // Remove setHeroHeight function and its event listeners
});

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
