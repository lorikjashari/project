document.addEventListener('DOMContentLoaded', function() {
    // App state
    const state = {
        mode: 'car', // 'car' or 'public'
        isLoggedIn: false,
        currentLocation: 'Pristina Center',
        currentStep: 1,
        activeAuthTab: 'login'
    };

    // DOM Elements
    const modeButtons = document.querySelectorAll('.mode-button');
    const modeSelector = document.querySelector('.mode-selector');
    const authModal = document.getElementById('authModal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalClose = document.querySelector('.modal-close');
    const tabButtons = document.querySelectorAll('.tab-button');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const backButtons = document.querySelectorAll('.back-button');
    const nextButtons = document.querySelectorAll('.next-button');
    const completeButton = document.querySelector('.complete-button');
    const guestButtons = document.querySelectorAll('.guest-button, .guest-login-button');
    const userButton = document.getElementById('userButton');
    const profileLink = document.getElementById('profileLink');
    const savedLocationsSection = document.getElementById('savedLocationsSection');
    const guestPromptSection = document.getElementById('guestPromptSection');
    const transportOptions = document.querySelectorAll('.transport-option');
    const quickDestinations = document.querySelectorAll('.quick-destination');
    const mapLink = document.getElementById('mapLink');
    const newsLink = document.getElementById('newsLink');
    const footerMapLink = document.getElementById('footerMapLink');
    const footerRoutesLink = document.getElementById('footerRoutesLink');

    // Initialize the app
    function init() {
        updateAppMode(state.mode);
        updateAuthState(state.isLoggedIn);
        showToast('Live traffic updates active', 'You\'re receiving real-time traffic information');
        
        // Add event listeners
        addEventListeners();
    }

    // Add all event listeners
    function addEventListeners() {
        // Mode selector
        modeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const mode = this.getAttribute('data-mode');
                updateAppMode(mode);
            });
        });

        // Auth modal
        userButton.addEventListener('click', () => openAuthModal());
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthModal();
        });
        modalOverlay.addEventListener('click', () => closeAuthModal());
        modalClose.addEventListener('click', () => closeAuthModal());

        // Auth tabs
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tab = this.getAttribute('data-tab');
                switchAuthTab(tab);
            });
        });

        // Auth forms
        loginForm.addEventListener('submit', handleLogin);
        signupForm.addEventListener('submit', handleSignupStep1);
        backButtons.forEach(button => {
            button.addEventListener('click', handleBack);
        });
        nextButtons.forEach(button => {
            button.addEventListener('click', handleNext);
        });
        completeButton.addEventListener('click', completeSignup);
        guestButtons.forEach(button => {
            button.addEventListener('click', handleGuestLogin);
        });

        // Transport options
        transportOptions.forEach(option => {
            option.addEventListener('click', function() {
                const isCarOption = this.querySelector('.fa-car') !== null;
                updateAppMode(isCarOption ? 'car' : 'public');
                
                transportOptions.forEach(opt => {
                    opt.classList.remove('car-selected', 'public-selected');
                });
                
                this.classList.add(isCarOption ? 'car-selected' : 'public-selected');
            });
        });

        // Quick destinations
        quickDestinations.forEach(destination => {
            destination.addEventListener('click', function() {
                const location = this.getAttribute('data-location');
                handleDestinationClick(location);
            });
        });
    }

    // Update app mode (car or public transport)
    function updateAppMode(mode) {
        state.mode = mode;
        
        // Update mode selector
        modeSelector.setAttribute('data-mode', mode);
        modeButtons.forEach(button => {
            if (button.getAttribute('data-mode') === mode) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Update colors based on mode
        document.querySelectorAll('.car-mode, .public-mode').forEach(element => {
            element.classList.remove('car-mode', 'public-mode');
            element.classList.add(`${mode}-mode`);
        });
        
        // Update primary color variable
        document.documentElement.style.setProperty(
            '--primary-color', 
            mode === 'car' ? 'var(--color-blue-500)' : 'var(--color-emerald-500)'
        );
        document.documentElement.style.setProperty(
            '--primary-hover', 
            mode === 'car' ? 'var(--color-blue-600)' : 'var(--color-emerald-600)'
        );
        document.documentElement.style.setProperty(
            '--primary-bg', 
            mode === 'car' ? 'var(--color-blue-50)' : 'var(--color-emerald-50)'
        );
        document.documentElement.style.setProperty(
            '--primary-light', 
            mode === 'car' ? 'var(--color-blue-100)' : 'var(--color-emerald-100)'
        );
        
        // Update links
        updateLinks();
    }

    // Update links based on mode
    function updateLinks() {
        if (state.mode === 'car') {
            mapLink.href = 'car/traffic-map.html';
            newsLink.href = 'car/traffic-news.html';
            newsLink.querySelector('.feature-title').textContent = 'Traffic News';
            newsLink.querySelector('.feature-description').textContent = 'Latest traffic updates';
            footerMapLink.href = 'car/traffic-map.html';
            footerRoutesLink.href = 'car/routes.html';
        } else {
            mapLink.href = 'public/map.html';
            newsLink.href = 'public/schedule.html';
            newsLink.querySelector('.feature-title').textContent = 'Schedules';
            newsLink.querySelector('.feature-description').textContent = 'Transport timetables';
            footerMapLink.href = 'public/map.html';
            footerRoutesLink.href = 'public/routes.html';
        }
    }

    // Update authentication state
    function updateAuthState(isLoggedIn) {
        state.isLoggedIn = isLoggedIn;
        
        // Update welcome message
        const welcomeTitle = document.querySelector('.welcome-title');
        welcomeTitle.textContent = isLoggedIn ? 'Welcome back! 👋' : 'Hello there! 👋';
        
        // Show/hide sections based on login state
        if (isLoggedIn) {
            savedLocationsSection.style.display = 'block';
            guestPromptSection.style.display = 'none';
        } else {
            savedLocationsSection.style.display = 'none';
            guestPromptSection.style.display = 'block';
        }
    }

    // Open auth modal
    function openAuthModal() {
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close auth modal
    function closeAuthModal() {
        authModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form state
        state.currentStep = 1;
        state.activeAuthTab = 'login';
        updateSignupStep(1);
        switchAuthTab('login');
    }

    // Switch between login and signup tabs
    function switchAuthTab(tab) {
        state.activeAuthTab = tab;
        
        // Update tab buttons
        tabButtons.forEach(button => {
            if (button.getAttribute('data-tab') === tab) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Show active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tab}Tab`).classList.add('active');
    }

    // Handle login form submission
    function handleLogin(e) {
        e.preventDefault();
        
        // In a real app, you would validate and send the form data to a server
        // For this demo, we'll just simulate a successful login
        updateAuthState(true);
        closeAuthModal();
        showToast('Logged in successfully', 'Welcome to KosovoMove!');
    }

    // Handle signup step 1
    function handleSignupStep1(e) {
        e.preventDefault();
        state.currentStep = 2;
        updateSignupStep(2);
    }

    // Handle back button in signup flow
    function handleBack() {
        if (state.currentStep > 1) {
            state.currentStep--;
            updateSignupStep(state.currentStep);
        }
    }

    // Handle next button in signup flow
    function handleNext() {
        if (state.currentStep < 3) {
            state.currentStep++;
            updateSignupStep(state.currentStep);
        }
    }

    // Complete signup process
    function completeSignup() {
        // In a real app, you would validate and send all the form data to a server
        // For this demo, we'll just simulate a successful signup
        updateAuthState(true);
        closeAuthModal();
        showToast('Account created successfully', 'Welcome to KosovoMove!');
    }

    // Update the visible step in the signup flow
    function updateSignupStep(step) {
        document.querySelectorAll('.signup-step').forEach(stepEl => {
            stepEl.classList.remove('active');
        });
        document.querySelector(`.signup-step[data-step="${step}"]`).classList.add('active');
    }

    // Handle guest login
    function handleGuestLogin() {
        closeAuthModal();
        showToast('Continuing as guest', 'You can sign up anytime to save your preferences');
    }

    // Handle destination click
    function handleDestinationClick(location) {
        // In a real app, this would navigate to the route planning page with this destination
        showToast('Destination selected', `Planning route to ${location}`);
        
        // Update the search input with the selected destination
        document.querySelector('.search-input').value = location;
    }

    // Show toast notification
    function showToast(title, description) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-title">${title}</div>
            <div class="toast-description">${description}</div>
        `;
        
        document.querySelector('.toast-container').appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Initialize the app
    init();
});
