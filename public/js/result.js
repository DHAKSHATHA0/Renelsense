// Result Page JavaScript

let currentTestResults = null;

async function initResultPage() {
    // Wait for serverConfig to be available
    let attempts = 0;
    while (typeof serverConfig === 'undefined' && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    console.log('Result page loaded');
    console.log('Using server:', serverConfig.getAPIURL());
    
    // Initialize result data (in real app, this would come from backend)
    initializeResultData();
    animateResultCards();
}

document.addEventListener('DOMContentLoaded', initResultPage);

function initializeResultData() {
    // Simulate getting result from test
    const testResults = {
        eGFR: 78,
        heartRate: 72,
        temperature: 36.8,
        quality: 98,
        confidence: 94,
        riskLevel: 'Low',
        status: 'Normal Function',
        stage: 'Normal Function'
    };
    
    // Store current results for chatbot
    currentTestResults = testResults;
    
    // Save to sessionStorage for chatbot access
    sessionStorage.setItem('patientResults', JSON.stringify(testResults));
    
    // Display eGFR
    displayEGFR(testResults.eGFR);
    
    // Update metrics
    document.getElementById('resultHR').textContent = testResults.heartRate + ' BPM';
    document.getElementById('resultTemp').textContent = testResults.temperature + '°C';
    document.getElementById('dataQuality').textContent = testResults.quality + '%';
    document.getElementById('confidence').textContent = testResults.confidence + '%';
    document.getElementById('riskLevel').textContent = testResults.riskLevel;
    document.getElementById('ckdStage').textContent = testResults.stage;
}

function displayEGFR(value) {
    const element = document.getElementById('eGFRValue');
    const interpretationElement = document.getElementById('eGFRInterpretation');
    
    // Animate number counting
    animateCounter(element, 0, value, 2000);
    
    // Determine interpretation
    let interpretation = '';
    let statusClass = '';
    
    if (value >= 60) {
        interpretation = 'Your kidney function is <strong>normal</strong>. Continue healthy lifestyle habits and regular monitoring.';
        statusClass = 'status-normal';
    } else if (value >= 45) {
        interpretation = 'Your kidney function shows <strong>mild decline</strong>. Consult with your healthcare provider for personalized recommendations.';
        statusClass = 'status-warning';
    } else if (value >= 30) {
        interpretation = 'Your kidney function shows <strong>moderate decline (CKD Stage 3)</strong>. Professional medical supervision is recommended.';
        statusClass = 'status-warning';
    } else {
        interpretation = 'Your kidney function requires <strong>immediate medical attention (CKD Stage 4-5)</strong>. Seek professional help urgently.';
        statusClass = 'status-critical';
    }
    
    interpretationElement.innerHTML = `<p class="interpretation-text">${interpretation}</p>`;
}

function animateCounter(element, start, end, duration) {
    const increment = (end - start) / (duration / 50);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 50);
}

function animateResultCards() {
    const cards = document.querySelectorAll('.result-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease-out';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

/**
 * Open chatbot with current patient results
 */
function openChatbot() {
    // Save current test results to sessionStorage
    if (currentTestResults) {
        sessionStorage.setItem('patientResults', JSON.stringify(currentTestResults));
    }
    
    // Navigate to chatbot page
    window.location.href = 'chatbot.html';
// Add scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.recommendation-card, .feature-item').forEach(el => {
    observer.observe(el);
});
}
