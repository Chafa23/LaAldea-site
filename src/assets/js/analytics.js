const analyticsLoader = {
    init() {
        // Load analytics after user interaction or 3 seconds
        const loadAnalytics = () => {
            if (window.requestIdleCallback) {
                requestIdleCallback(() => this.loadScript());
            } else {
                this.loadScript();
            }

            // Cleanup after loading
            window.removeEventListener('scroll', loadTrigger);
            clearTimeout(timer);
        };

        const loadTrigger = this.debounce(loadAnalytics, 500);
        const timer = setTimeout(loadAnalytics, 3000);

        window.addEventListener('scroll', loadTrigger, { passive: true });
    },

    loadScript() {
        const script = document.createElement('script');
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-K06VE6W4MY';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-K06VE6W4MY', {
                'page_title': document.title,
                'send_page_view': false
            });
            this.initializeTracking();
        };
    },

    trackProductInterest(product) {
        if (!window.gtag) return;
        try {
            gtag('event', 'product_view', {
                'product_name': product,
                'event_category': 'Products',
                'event_label': 'Product Interest'
            });
        } catch (error) {
            console.debug('Analytics error:', error);
        }
    },

    trackContactInteraction(method, label) {
        if (!window.gtag) return;
        try {
            gtag('event', 'contact_initiated', {
                'contact_method': method,
                'event_category': 'Contact',
                'event_label': label || method
            });
        } catch (error) {
            console.debug('Analytics error:', error);
        }
    },

    trackLocationInterest(area, label) {
        if (!window.gtag) return;
        try {
            gtag('event', 'location_interest', {
                'area': area,
                'event_category': 'Geographic',
                'event_label': label || area
            });
        } catch (error) {
            console.debug('Analytics error:', error);
        }
    },

    trackScrollDepth() {
        if (!window.gtag) return;
        
        const scrollDepths = [25, 50, 75, 100];
        const markers = new Set();
        const scrollHandler = this.debounce(() => {
            const scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
            
            scrollDepths.forEach(depth => {
                if (scrollPercent >= depth && !markers.has(depth)) {
                    markers.add(depth);
                    this.trackEvent('scroll_depth', {
                        'depth': depth,
                        'event_category': 'Engagement',
                        'non_interaction': true
                    });
                }
            });
        }, 100);

        window.addEventListener('scroll', scrollHandler, { passive: true });
    },

    trackEvent(eventName, params) {
        if (!window.gtag) return;
        try {
            gtag('event', eventName, params);
        } catch (error) {
            console.debug('Analytics error:', error);
        }
    },

    initializeTracking() {
        // Event delegation for all interactions
        document.addEventListener('click', (e) => {
            // WhatsApp links
            if (e.target.closest('a[href*="wa.me"], .whatsapp-link')) {
                this.trackEvent('contact_initiated', {
                    'contact_method': 'WhatsApp',
                    'event_category': 'Contact'
                });
            }

            // Phone calls
            if (e.target.closest('a[href^="tel:"]')) {
                this.trackEvent('contact_initiated', {
                    'contact_method': 'Phone',
                    'event_category': 'Contact'
                });
            }

            // Product modals
            const productCard = e.target.closest('[data-bs-toggle="modal"]');
            if (productCard) {
                const productName = productCard.closest('.product-card')?.querySelector('h3')?.textContent;
                if (productName) this.trackProductInterest(productName);
            }

            // Map interactions
            if (e.target.closest('.map-container, [href*="maps"]')) {
                this.trackEvent('location_interest', {
                    'event_category': 'Geographic',
                    'event_label': 'Map View'
                });
            }
        });

        // Form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', () => {
                this.trackEvent('contact_initiated', {
                    'contact_method': 'Email',
                    'event_category': 'Contact'
                });
            });
        });

        // Initialize other tracking
        this.trackScrollDepth();
        this.initializeTimeTracking();
        this.initializeSectionTracking();
    },

    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    initializeTimeTracking() {
        const timeIntervals = [30, 60, 180, 300];
        timeIntervals.forEach(time => {
            setTimeout(() => {
                this.trackEvent('time_on_page', {
                    'time': time,
                    'event_category': 'Engagement',
                    'non_interaction': true
                });
            }, time * 1000);
        });
    },

    initializeSectionTracking() {
        const sections = ['#about', '#services', '#products', '#contact'];
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.trackEvent('section_view', {
                        'section': entry.target.id,
                        'event_category': 'Content',
                        'non_interaction': true
                    });
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => {
            const element = document.querySelector(section);
            if (element) observer.observe(element);
        });
    }
};

// Initialize when appropriate
if (document.readyState === 'complete') {
    analyticsLoader.init();
} else {
    window.addEventListener('load', () => analyticsLoader.init());
}
