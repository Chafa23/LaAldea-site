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
        setTimeout(() => {
            formResponse.classList.add('fade');
            setTimeout(() => formResponse.remove(), 500);
        }, 3000);
    };

    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        let isValid = true;

        // Clear previous errors and response
        form.querySelectorAll('input, textarea').forEach(input => removeError(input));
        formResponse.textContent = '';

        // Validate name
        const name = form.querySelector('[name="name"]');
        if (name.value.trim() === "") {
            showError(name, "Por favor ingrese su nombre");
            isValid = false;
        }

        // Validate email
        const email = form.querySelector('[name="email"]');
        if (!validateEmail(email.value.trim())) {
            showError(email, "Por favor ingrese un email válido");
            isValid = false;
        }

        // Validate message
        const message = form.querySelector('[name="message"]');
        if (message.value.trim() === "") {
            showError(message, "Por favor ingrese un mensaje");
            isValid = false;
        }

        // Verify reCAPTCHA
        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            showResponse('Por favor complete el captcha', true);
            return;
        }

        if (isValid) {
            setLoading(true);
            const formData = new FormData(form);
            formData.append('g-recaptcha-response', recaptchaResponse);
            try {
                const response = await fetch(formConfig.formspreeEndpoint, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    form.reset();
                    showResponse('¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.');
                } else {
                    throw new Error('Error al enviar el mensaje');
                }
            } catch (error) {
                showResponse('Error al enviar el mensaje. Por favor intente nuevamente.', true);
            } finally {
                setLoading(false);
            }
        }
    });
});