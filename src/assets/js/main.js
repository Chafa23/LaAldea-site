document.addEventListener("DOMContentLoaded", function() {
    // Add preloader
    const loader = document.querySelector('.preloader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }, 500);
    }

    // Initialize AOS
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });

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

    // Initialize cookie consent
    cookieConsent.init();

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

    // Enhanced navbar functionality
    const navbar = document.querySelector("nav");
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add/remove scrolled class
        if (currentScroll > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

        // Hide/show navbar on scroll
        if (currentScroll > lastScroll && currentScroll > 500) {
            navbar.style.transform = "translateY(-100%)";
        } else {
            navbar.style.transform = "translateY(0)";
        }

        lastScroll = currentScroll;
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

    // Replace viewport height calculation
    function setInitialHeight() {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            // Set initial height
            heroSection.style.height = `${window.innerHeight}px`;
        }
    }

    // Set initial height
    setInitialHeight();

    // Only update on orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(setInitialHeight, 100);
    });

    function setHeroHeight() {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        // Only set JS height on mobile
        if (window.innerWidth <= 768) {
            heroSection.style.height = `${window.innerHeight}px`;
        } else {
            heroSection.style.height = '100vh'; // Reset to CSS value on desktop
        }
    }

    // Initial height set
    setHeroHeight();

    // Update on orientation change (mobile)
    window.addEventListener('orientationchange', () => {
        setTimeout(setHeroHeight, 100);
    });

    // Handle window resize for responsive switches
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setHeroHeight, 250);
    });

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
