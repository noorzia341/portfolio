'use strict';

/**
 * ============================================
 * MODERN PORTFOLIO WEBSITE - ENHANCED SCRIPT
 * ============================================
 * Features:
 * - ES6+ Classes & Modules
 * - Smooth animations
 * - LocalStorage theme persistence
 * - Touch-friendly interactions
 * - Performance optimized
 */

// ========== APP STATE MANAGEMENT ==========
const AppState = {
  currentPage: 'about',
  currentFilter: 'all',
  theme: localStorage.getItem('theme') || 'light',
  isSidebarOpen: false,
  isModalOpen: false
};

// ========== UTILITY FUNCTIONS ==========
const utils = {
  toggleElement(elem, force) {
    if (force !== undefined) {
      elem.classList.toggle('active', force);
      return;
    }
    elem.classList.toggle('active');
  },
  
  smoothScrollTo(element, offset = 0) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  },
  
  debounce(func, wait) {
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
};

// ========== THEME MANAGER CLASS ==========
class ThemeManager {
  constructor() {
    this.root = document.documentElement;
    this.init();
  }
  
  init() {
    this.setTheme(AppState.theme);
    this.createThemeToggle();
  }
  
  setTheme(theme) {
    AppState.theme = theme;
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      this.root.classList.add('dark-theme');
    } else {
      this.root.classList.remove('dark-theme');
    }
  }
  
  toggleTheme() {
    const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    this.updateToggleButton();
  }
  
  createThemeToggle() {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-toggle';
    toggleBtn.setAttribute('aria-label', 'Toggle theme');
    toggleBtn.innerHTML = '<span class="theme-icon">🌞</span>';
    toggleBtn.addEventListener('click', () => this.toggleTheme());
    document.body.appendChild(toggleBtn);
    this.updateToggleButton();
  }
  
  updateToggleButton() {
    const btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.innerHTML = AppState.theme === 'light' 
        ? '<span class="theme-icon">🌙</span>' 
        : '<span class="theme-icon">🌞</span>';
    }
  }
}

// ========== SIDEBAR MANAGER CLASS ==========
class SidebarManager {
  constructor() {
    this.sidebar = document.querySelector('[data-sidebar]');
    this.sidebarBtn = document.querySelector('[data-sidebar-btn]');
    this.init();
  }
  
  init() {
    if (!this.sidebarBtn) return;
    
    this.sidebarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });
    
    // Close sidebar when clicking outside (mobile)
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && this.sidebar?.classList.contains('active')) {
        if (!this.sidebar.contains(e.target) && !this.sidebarBtn.contains(e.target)) {
          this.close();
        }
      }
    });
    
    // Handle resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.sidebar?.classList.contains('active')) {
        this.close();
      }
    });
  }
  
  toggle() {
    AppState.isSidebarOpen = !AppState.isSidebarOpen;
    utils.toggleElement(this.sidebar, AppState.isSidebarOpen);
  }
  
  close() {
    AppState.isSidebarOpen = false;
    this.sidebar?.classList.remove('active');
  }
}

// ========== MODAL MANAGER CLASS ==========
class ModalManager {
  constructor() {
    this.modal = document.querySelector('[data-modal-container]');
    this.overlay = document.querySelector('[data-overlay]');
    this.closeBtn = document.querySelector('[data-modal-close-btn]');
    this.modalImg = document.querySelector('[data-modal-img]');
    this.modalTitle = document.querySelector('[data-modal-title]');
    this.modalText = document.querySelector('[data-modal-text]');
    this.init();
  }
  
  init() {
    this.attachTestimonialEvents();
    this.closeBtn?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', () => this.close());
    
    // Close with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && AppState.isModalOpen) {
        this.close();
      }
    });
  }
  
  attachTestimonialEvents() {
    const testimonialItems = document.querySelectorAll('[data-testimonials-item]');
    
    testimonialItems.forEach(item => {
      item.addEventListener('click', () => {
        const avatar = item.querySelector('[data-testimonials-avatar]');
        const title = item.querySelector('[data-testimonials-title]');
        const text = item.querySelector('[data-testimonials-text]');
        
        if (avatar) this.modalImg.src = avatar.src;
        if (avatar) this.modalImg.alt = avatar.alt;
        if (title) this.modalTitle.innerHTML = title.innerHTML;
        if (text) this.modalText.innerHTML = text.innerHTML;
        
        this.open();
      });
    });
  }
  
  open() {
    AppState.isModalOpen = true;
    utils.toggleElement(this.modal, true);
    utils.toggleElement(this.overlay, true);
    document.body.style.overflow = 'hidden';
  }
  
  close() {
    AppState.isModalOpen = false;
    utils.toggleElement(this.modal, false);
    utils.toggleElement(this.overlay, false);
    document.body.style.overflow = '';
  }
}

// ========== FILTER SYSTEM CLASS ==========
class FilterSystem {
  constructor() {
    this.select = document.querySelector('[data-select]');
    this.selectValue = document.querySelector('[data-selecct-value]');
    this.filterBtns = document.querySelectorAll('[data-filter-btn]');
    this.filterItems = document.querySelectorAll('[data-filter-item]');
    this.init();
  }
  
  init() {
    this.attachSelectEvents();
    this.attachFilterButtonEvents();
  }
  
  attachSelectEvents() {
    if (!this.select) return;
    
    this.select.addEventListener('click', () => utils.toggleElement(this.select));
    
    const selectItems = document.querySelectorAll('[data-select-item]');
    selectItems.forEach(item => {
      item.addEventListener('click', () => {
        const selectedValue = item.innerText.toLowerCase();
        if (this.selectValue) this.selectValue.innerText = item.innerText;
        utils.toggleElement(this.select);
        this.applyFilter(selectedValue);
      });
    });
  }
  
  attachFilterButtonEvents() {
    let lastActiveBtn = this.filterBtns[0];
    
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedValue = btn.innerText.toLowerCase();
        if (this.selectValue) this.selectValue.innerText = btn.innerText;
        this.applyFilter(selectedValue);
        
        lastActiveBtn?.classList.remove('active');
        btn.classList.add('active');
        lastActiveBtn = btn;
      });
    });
  }
  
  applyFilter(filterValue) {
    AppState.currentFilter = filterValue;
    
    this.filterItems.forEach(item => {
      const shouldShow = filterValue === 'all' || item.dataset.category === filterValue;
      
      if (shouldShow) {
        item.classList.add('active');
        // Add animation class
        item.style.animation = 'fadeInUp 0.4s ease forwards';
      } else {
        item.classList.remove('active');
      }
    });
  }
}

// ========== FORM HANDLER CLASS ==========
class FormHandler {
  constructor() {
    this.form = document.querySelector('[data-form]');
    this.inputs = document.querySelectorAll('[data-form-input]');
    this.submitBtn = document.querySelector('[data-form-btn]');
    this.init();
  }
  
  init() {
    if (!this.form) return;
    
    this.inputs.forEach(input => {
      input.addEventListener('input', () => this.validateForm());
      input.addEventListener('blur', () => this.showFieldError(input));
    });
    
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }
  
  validateForm() {
    const isValid = this.form.checkValidity();
    if (this.submitBtn) {
      if (isValid) {
        this.submitBtn.removeAttribute('disabled');
      } else {
        this.submitBtn.setAttribute('disabled', '');
      }
    }
    return isValid;
  }
  
  showFieldError(input) {
    const errorSpan = input.parentElement?.querySelector('.error-message');
    if (!input.checkValidity() && input.value !== '') {
      if (!errorSpan) {
        const span = document.createElement('span');
        span.className = 'error-message';
        span.textContent = `Please enter a valid ${input.name || 'value'}`;
        input.parentElement?.appendChild(span);
      }
    } else {
      errorSpan?.remove();
    }
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    if (!this.validateForm()) return;
    
    // Show loading state
    if (this.submitBtn) {
      const originalText = this.submitBtn.textContent;
      this.submitBtn.textContent = 'Sending...';
      this.submitBtn.disabled = true;
      
      // Simulate form submission (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success feedback
      this.showNotification('Message sent successfully! 🎉', 'success');
      this.form.reset();
      this.submitBtn.textContent = originalText;
      this.submitBtn.disabled = true;
    }
  }
  
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// ========== NAVIGATION MANAGER CLASS ==========
class NavigationManager {
  constructor() {
    this.navLinks = document.querySelectorAll('[data-nav-link]');
    this.pages = document.querySelectorAll('[data-page]');
    this.init();
  }
  
  init() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = link.innerHTML.toLowerCase();
        this.navigateTo(targetPage);
      });
    });
  }
  
  navigateTo(pageName) {
    AppState.currentPage = pageName;
    
    this.pages.forEach(page => {
      const shouldShow = page.dataset.page === pageName;
      
      if (shouldShow) {
        page.classList.add('active');
        // Trigger entrance animation
        page.style.animation = 'pageFadeIn 0.5s ease';
      } else {
        page.classList.remove('active');
      }
    });
    
    this.navLinks.forEach(link => {
      const isActive = link.innerHTML.toLowerCase() === pageName;
      if (isActive) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update URL hash without scrolling
    history.pushState(null, '', `#${pageName}`);
  }
}

// ========== ANIMATION MANAGER ==========
class AnimationManager {
  constructor() {
    this.initScrollAnimations();
    this.addHoverEffects();
  }
  
  initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => observer.observe(el));
  }
  
  addHoverEffects() {
    // Add magnetic effect to buttons (optional)
    const buttons = document.querySelectorAll('button, .project-item, .service-item');
    buttons.forEach(btn => {
      btn.addEventListener('mouseenter', function(e) {
        this.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
      });
    });
  }
}

// ========== INITIALIZE EVERYTHING ==========
class App {
  constructor() {
    this.init();
  }
  
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }
  
  setup() {
    // Initialize all modules
    new ThemeManager();
    new SidebarManager();
    new ModalManager();
    new FilterSystem();
    new FormHandler();
    new NavigationManager();
    new AnimationManager();
    
    // Handle initial page based on URL hash
    this.handleInitialPage();
    
    // Add loading complete class
    document.body.classList.add('app-loaded');
    
    console.log('🚀 Portfolio website enhanced successfully!');
  }
  
  handleInitialPage() {
    const hash = window.location.hash.slice(1);
    if (hash && ['about', 'resume', 'portfolio', 'blog', 'contact'].includes(hash)) {
      const nav = new NavigationManager();
      nav.navigateTo(hash);
    }
  }
}

// Start the application
const app = new App();

// Export for debugging (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { App, AppState };
}