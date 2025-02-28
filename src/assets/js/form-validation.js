document.addEventListener("DOMContentLoaded", function() {
    const formConfig = {
        formspreeEndpoint: 'https://formspree.io/f/mbldypgk',
        recaptchaSiteKey: '6Ldp8MoqAAAAAPE58l1o8tghOXFVKA1JkH-KqerW'
    };

    const form = document.getElementById("contact-form");
    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner-border');
    const buttonText = submitButton.querySelector('.button-text');
    const formResponse = form.querySelector('.form-response');

    // Helper Functions
    const showError = (input, message) => {
        const formControl = input.parentElement;
        const errorDiv = formControl.querySelector('.error-message') || 
                        document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerText = message;
        if (!formControl.querySelector('.error-message')) {
            formControl.appendChild(errorDiv);
        }
        input.classList.add('is-invalid');
    };

    const removeError = (input) => {
        const formControl = input.parentElement;
        const errorDiv = formControl.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.classList.remove('is-invalid');
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const setLoading = (isLoading) => {
        submitButton.disabled = isLoading;
        spinner.classList.toggle('d-none', !isLoading);
        buttonText.textContent = isLoading ? 'Enviando...' : 'Enviar Mensaje';
    };

    const showResponse = (message, isError = false) => {
        formResponse.textContent = message;
        formResponse.className = `form-response alert ${isError ? 'alert-danger' : 'alert-success'} mt-3`;
        formResponse.style.opacity = '1';
        
        setTimeout(() => {
            formResponse.style.opacity = '0';
            setTimeout(() => {
                if (formResponse.parentNode) {
                    formResponse.remove();
                }
            }, 300);
        }, 3000);
    };

    // Form validation
    const validateForm = () => {
        let isValid = true;
        const fields = {
            name: {
                element: form.querySelector('[name="name"]'),
                message: "Por favor ingrese su nombre"
            },
            email: {
                element: form.querySelector('[name="email"]'),
                message: "Por favor ingrese un email válido",
                validator: validateEmail
            },
            message: {
                element: form.querySelector('[name="message"]'),
                message: "Por favor ingrese un mensaje"
            }
        };

        // Clear previous errors
        Object.values(fields).forEach(field => removeError(field.element));

        // Validate each field
        Object.entries(fields).forEach(([key, field]) => {
            const value = field.element.value.trim();
            if (!value || (field.validator && !field.validator(value))) {
                showError(field.element, field.message);
                isValid = false;
            }
        });

        return isValid;
    };

    // Form submission handler
    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        if (!validateForm()) return;

        // Verify reCAPTCHA
        try {
            const recaptchaResponse = grecaptcha.getResponse();
            if (!recaptchaResponse) {
                showResponse('Por favor complete el captcha', true);
                return;
            }

            setLoading(true);
            const formData = new FormData(form);
            formData.append('g-recaptcha-response', recaptchaResponse);

            const response = await fetch(formConfig.formspreeEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                form.reset();
                grecaptcha.reset();
                showResponse('¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.');
            } else {
                throw new Error('Error en el servidor');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showResponse('Error al enviar el mensaje. Por favor intente nuevamente.', true);
        } finally {
            setLoading(false);
        }
    });

    // Add lazy loading for reCAPTCHA
    const loadRecaptcha = () => {
        if (typeof grecaptcha === 'undefined') {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const script = document.createElement('script');
                        script.src = 'https://www.google.com/recaptcha/api.js';
                        script.async = true;
                        script.defer = true;
                        document.head.appendChild(script);
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.1 });

            const form = document.getElementById('contact-form');
            if (form) observer.observe(form);
        }
    };

    // Initialize reCAPTCHA lazily
    loadRecaptcha();
});