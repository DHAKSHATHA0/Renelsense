// About Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('About Page Loaded');
    
    // Add any about page specific functionality here
    
    // For example, we could add animations or interactive elements
    initializeAnimations();
});

function initializeAnimations() {
    // Add fade-in animations to sections when they come into view
    const sections = document.querySelectorAll('.about-content > div');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        section.style.opacity = 0;
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(section);
    });
}