// Product Interest Tracking
function trackProductInterest(product) {
    gtag('event', 'product_view', {
        'product_name': product,
        'event_category': 'Products',
        'event_label': 'Product Interest'
    });
}

// Contact Interactions
function trackContactInteraction(method, label) {
    gtag('event', 'contact_initiated', {
        'contact_method': method,
        'event_category': 'Contact',
        'event_label': label || method
    });
}

// Service Area Interest
function trackLocationInterest(area, label) {
    gtag('event', 'location_interest', {
        'area': area,
        'event_category': 'Geographic',
        'event_label': label || area
    });
}

// GA4 Configuration
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-K06VE6W4MY', {
    'page_title': document.title,
    'page_location': 'https://www.laaldeatala.com.uy'
});

// Scroll Depth Tracking
function trackScrollDepth() {
    let scrollDepths = [25, 50, 75, 100];
    let markers = new Set();
    
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
        
        scrollDepths.forEach(depth => {
            if (scrollPercent >= depth && !markers.has(depth)) {
                markers.add(depth);
                gtag('event', 'scroll_depth', {
                    'depth': depth,
                    'event_category': 'Engagement',
                    'non_interaction': true
                });
            }
        });
    });
}

// Time on Page Tracking
function trackTimeOnPage() {
    const timeIntervals = [30, 60, 180, 300]; // seconds
    timeIntervals.forEach(time => {
        setTimeout(() => {
            gtag('event', 'time_on_page', {
                'time': time,
                'event_category': 'Engagement',
                'non_interaction': true
            });
        }, time * 1000);
    });
}

// Section Visibility Tracking
function trackSectionVisibility() {
    const sections = ['#about', '#services', '#products', '#contact'];
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                gtag('event', 'section_view', {
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

// Document Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Track WhatsApp clicks
    document.querySelectorAll('a[href*="wa.me"], .whatsapp-link').forEach(link => {
        link.addEventListener('click', () => {
            trackContactInteraction('WhatsApp', 'WhatsApp Button');
        });
    });

    // Track phone calls
    document.querySelectorAll('a[href*="tel:"]').forEach(link => {
        link.addEventListener('click', () => {
            trackContactInteraction('Phone');
        });
    });

    // Track email interactions
    document.querySelectorAll('form, #contact-form').forEach(form => {
        form.addEventListener('submit', () => {
            trackContactInteraction('Email', 'Email Form');
        });
    });

    // Track product modal opens
    document.querySelectorAll('[data-bs-toggle="modal"]').forEach(button => {
        button.addEventListener('click', () => {
            const productName = button.closest('.product-card').querySelector('h3').textContent;
            trackProductInterest(productName);
        });
    });

    // Track map interactions
    document.querySelector('.map-container, [href*="maps"]')?.addEventListener('click', () => {
        trackLocationInterest('Map View', 'Directions');
    });

    trackScrollDepth();
    trackTimeOnPage();
    trackSectionVisibility();
});