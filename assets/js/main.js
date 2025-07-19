// ===== MAIN JAVASCRIPT FILE =====
// AJAS Services Homepage - Interactive Functionality

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== NAVIGATION FUNCTIONALITY =====
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    
    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', function() {
            navbarMenu.classList.toggle('active');
            
            // Animate hamburger to X
            const spans = navbarToggle.querySelectorAll('span');
            spans.forEach(span => span.classList.toggle('active'));
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navbarToggle.contains(e.target) && !navbarMenu.contains(e.target)) {
                navbarMenu.classList.remove('active');
                const spans = navbarToggle.querySelectorAll('span');
                spans.forEach(span => span.classList.remove('active'));
            }
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navbarMenu.classList.remove('active');
                const spans = navbarToggle.querySelectorAll('span');
                spans.forEach(span => span.classList.remove('active'));
            });
        });
    }
    
    // ===== SMOOTH SCROLLING FOR NAVIGATION =====
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ===== SCROLL TO TOP BUTTON =====
    const scrollTopBtn = document.getElementById('scrollTop');
    
    function toggleScrollTop() {
        if (!scrollTopBtn) return;
        if (window.pageYOffset > 400) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    }
    
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    window.addEventListener('scroll', toggleScrollTop);
    
    // ===== COUNTER ANIMATION =====
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        }
        
        updateCounter();
    }
    
    // ===== INTERSECTION OBSERVER FOR COUNTER =====
    const statsNumber = document.querySelector('.stats-number');
    if (statsNumber) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(statsNumber.getAttribute('data-count'));
                    animateCounter(statsNumber, target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(statsNumber);
    }
    
    // ===== FORM VALIDATION =====
    const enquiryForm = document.getElementById('enquiryForm');
    
    if (enquiryForm) {
        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        const emailInput = document.getElementById('email');
        
        const nameError = document.getElementById('nameError');
        const phoneError = document.getElementById('phoneError');
        const emailError = document.getElementById('emailError');
        
        // Validation patterns
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phonePattern = /^\d{10}$/;
        
        // Real-time validation
        function validateName() {
            const name = nameInput.value.trim();
            if (name.length < 2) {
                showError(nameError, 'Name must be at least 2 characters long');
                return false;
            } else {
                hideError(nameError);
                return true;
            }
        }
        
        function validatePhone() {
            const phone = phoneInput.value.replace(/\D/g, '');
            if (!phonePattern.test(phone)) {
                showError(phoneError, 'Please enter a valid 10-digit phone number');
                return false;
            } else {
                hideError(phoneError);
                return true;
            }
        }
        
        function validateEmail() {
            const email = emailInput.value.trim();
            if (!emailPattern.test(email)) {
                showError(emailError, 'Please enter a valid email address');
                return false;
            } else {
                hideError(emailError);
                return true;
            }
        }
        
        function showError(errorElement, message) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        
        function hideError(errorElement) {
            errorElement.classList.remove('show');
        }
        
        // Add event listeners for real-time validation
        nameInput.addEventListener('blur', validateName);
        phoneInput.addEventListener('blur', validatePhone);
        emailInput.addEventListener('blur', validateEmail);
        
        // Phone number formatting
        phoneInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            this.value = value;
        });
        
        // Form submission
        enquiryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const isNameValid = validateName();
            const isPhoneValid = validatePhone();
            const isEmailValid = validateEmail();
            
            if (isNameValid && isPhoneValid && isEmailValid) {
                // Simulate form submission
                const submitBtn = this.querySelector('.submit-btn');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.innerHTML = '<span>Sending...</span>';
                submitBtn.disabled = true;
                
                // Simulate API call
                setTimeout(() => {
                    showSuccessMessage();
                    enquiryForm.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 2000);
            }
        });
    }
    
    // ===== SUCCESS MESSAGE =====
    function showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <div style="
                background: #d4edda;
                color: #155724;
                padding: 1rem;
                border-radius: var(--radius);
                margin-top: 1rem;
                border: 1px solid #c3e6cb;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
                Thank you! Your enquiry has been sent successfully. We'll get back to you soon.
            </div>
        `;
        
        enquiryForm.appendChild(successDiv);
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }
    
    // ===== ACTIVE NAVIGATION HIGHLIGHTING =====
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNavLink);
    
    // ===== LAZY LOADING FOR IMAGES =====
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    
    // ===== ACCESSIBILITY IMPROVEMENTS =====
    // Add keyboard navigation for dropdown menus
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            navbarMenu.classList.remove('active');
            const spans = navbarToggle.querySelectorAll('span');
            spans.forEach(span => span.classList.remove('active'));
        }
    });
    
    // ===== PERFORMANCE OPTIMIZATION =====
    // Debounce scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    const debouncedScrollHandler = debounce(toggleScrollTop, 10);
    window.addEventListener('scroll', debouncedScrollHandler);
    
    // ===== INITIALIZE AOS (ANIMATE ON SCROLL) =====
    if (typeof AOS !== 'undefined') {
        AOS.init({
            once: true,
            duration: 700,
            easing: 'ease-out-cubic',
            offset: 100
        });
    }
    
    // ===== SERVICE WORKER REGISTRATION (PWA) =====
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful');
                })
                .catch(function(err) {
                    console.log('ServiceWorker registration failed');
                });
        });
    }
    
    // ===== CONSOLE WELCOME MESSAGE =====
    console.log(`
    🚀 AJAS Services Website Loaded Successfully!
    
    Features:
    ✅ Responsive Navigation
    ✅ Form Validation
    ✅ Scroll Animations
    ✅ Counter Animations
    ✅ Accessibility Features
    ✅ Performance Optimized
    
    Built with modern web standards and best practices.
    `);
    
});

// ===== UTILITY FUNCTIONS =====

// Format phone number with dashes
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 6) {
        value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
    } else if (value.length >= 3) {
        value = value.slice(0, 3) + '-' + value.slice(3);
    }
    input.value = value;
}

// Validate form field
function validateField(field, pattern, errorMessage) {
    const value = field.value.trim();
    const isValid = pattern.test(value);
    
    if (!isValid) {
        field.classList.add('error');
        return false;
    } else {
        field.classList.remove('error');
        return true;
    }
}

// Smooth scroll to element
function smoothScrollTo(element, offset = 0) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
    });
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
} 

// ===== OBJECTIVES & SERVICES HEIGHT MATCHING =====
function matchServicesCardHeight() {
  if (window.innerWidth >= 1024) {
    const objCard = document.querySelector('.objectives-card');
    const servCard = document.querySelector('.services-card');
    if (objCard && servCard) {
      const objHeight = objCard.offsetHeight;
      servCard.style.setProperty('--services-match-height', objHeight + 'px');
    }
  } else {
    const servCard = document.querySelector('.services-card');
    if (servCard) {
      servCard.style.removeProperty('--services-match-height');
    }
  }
}
window.addEventListener('DOMContentLoaded', matchServicesCardHeight);
window.addEventListener('resize', matchServicesCardHeight); 