// Report Page JavaScript - Medical-Grade Report Display

async function initReportPage() {
    // Wait for serverConfig to be available
    let attempts = 0;
    while (typeof serverConfig === 'undefined' && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    console.log('Report Page Loaded');
    console.log('Using server:', serverConfig.getAPIURL());
    
    // Load report data from backend
    loadReportData();
    
    // Initialize charts for advanced analytics
    initializeTrendChart();
    initializeFeatureChart();
    
    // Setup action button listeners
    setupActionButtons();
    
    // Animate report sections on scroll
    revealOnScroll();
}

document.addEventListener('DOMContentLoaded', initReportPage);

function loadReportData() {
    // Simulate loading report data from backend
    const testData = generateRealisticTestData();
    
    // Update report header
    document.getElementById('patientId').textContent = 'TEST-' + String(Math.floor(Math.random() * 10000)).padStart(5, '0');
    document.getElementById('testDate').textContent = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('testDuration').textContent = '3 minutes 42 seconds';
    document.getElementById('dataQuality').textContent = testData.dataQuality + '%';
    
    // Update executive summary
    updateExecutiveSummary(testData);
    
    // Update raw data analysis
    updateRawDataAnalysis(testData);
    
    // Update extracted features
    updateExtractedFeatures(testData);
    
    // Update AI model analysis
    updateAIAnalysis(testData);
    
    // Update clinical notes
    updateClinicalNotes(testData);
}

function generateRealisticTestData() {
    const eGFR = 85 + Math.random() * 20; // 85-105 (normal range)
    const confidence = 92 + Math.random() * 8; // 92-100% confidence
    
    return {
        eGFR: eGFR.toFixed(1),
        kidneyStage: eGFR >= 90 ? 'Normal' : eGFR >= 60 ? 'Stage 2' : 'Stage 3',
        interpretation: eGFR >= 90 ? 'Normal kidney function' : 'Mildly reduced kidney function',
        dataQuality: Math.floor(93 + Math.random() * 7),
        confidence: confidence.toFixed(1),
        bioimpedance: (320 + Math.random() * 40).toFixed(1),
        heartRate: Math.floor(65 + Math.random() * 20),
        temperature: (36.8 + (Math.random() - 0.5) * 0.4).toFixed(1),
        opticalSignal: (2500 + Math.random() * 500).toFixed(0),
        dataPackets: 180 + Math.floor(Math.random() * 30),
        signalQuality: Math.floor(85 + Math.random() * 15)
    };
}

function updateExecutiveSummary(data) {
    document.getElementById('summaryStatus').textContent = data.kidneyStage;
    document.getElementById('summaryEGFR').textContent = data.eGFR;
    document.getElementById('summaryInterpretation').textContent = data.interpretation;
    document.getElementById('summaryRecommendation').textContent = data.kidneyStage === 'Normal' 
        ? 'Excellent kidney function. Continue regular monitoring every 12 months.'
        : 'Schedule follow-up with nephrologist within 3 months.';
    
    // Update summary stats
    document.getElementById('statTest').textContent = data.eGFR;
    document.getElementById('statConfidence').textContent = data.confidence + '%';
    document.getElementById('statDuration').textContent = '3m 42s';
}

function updateRawDataAnalysis(data) {
    // Bioimpedance section
    document.getElementById('bioimpedanceValue').textContent = data.bioimpedance;
    
    // Vital Signs section
    document.getElementById('heartRateValue').textContent = data.heartRate;
    document.getElementById('temperatureValue').textContent = data.temperature;
    
    // Optical Signals section
    document.getElementById('opticalValue').textContent = data.opticalSignal;
    document.getElementById('dataQualityValue').textContent = data.dataQuality + '%';
}

function updateExtractedFeatures(data) {
    const features = [
        { name: 'Bioimpedance Ratio', value: (data.bioimpedance / 100).toFixed(2), unit: 'unitless', status: 'normal' },
        { name: 'HR Variability', value: (8 + Math.random() * 4).toFixed(1), unit: 'ms', status: 'normal' },
        { name: 'Thermal Gradient', value: (0.3 + Math.random() * 0.2).toFixed(2), unit: '°C', status: 'normal' },
        { name: 'Optical Phase', value: (145 + Math.random() * 30).toFixed(1), unit: 'deg', status: 'normal' },
        { name: 'Signal Integrity', value: data.signalQuality, unit: '%', status: 'normal' }
    ];
    
    const featuresTable = document.getElementById('featuresTable');
    if (featuresTable) {
        featuresTable.innerHTML = features.map(f => `
            <tr class="table-row-item">
                <td class="feature-name">${f.name}</td>
                <td class="feature-value">${f.value}</td>
                <td class="feature-unit">${f.unit}</td>
                <td class="feature-status">
                    <span class="status-badge ${f.status}">
                        <i class="fas fa-check-circle"></i>
                        ${f.status === 'normal' ? 'Normal' : 'Warning'}
                    </span>
                </td>
            </tr>
        `).join('');
    }
}

function updateAIAnalysis(data) {
    // Model performance
    document.getElementById('modelAccuracy').textContent = (95.2 + Math.random() * 3).toFixed(1) + '%';
    
    // Confidence meter
    document.getElementById('confidenceValue').textContent = data.confidence + '%';
    const confidenceBar = document.getElementById('confidenceBar');
    if (confidenceBar) {
        confidenceBar.style.width = data.confidence + '%';
        confidenceBar.className = data.confidence >= 90 ? 'confidence-high' : 'confidence-medium';
    }
    
    // Feature importance
    const importanceItems = document.querySelectorAll('.importance-item');
    if (importanceItems.length > 0) {
        const importance = [
            { name: 'Bioimpedance', score: 28 },
            { name: 'Heart Rate', score: 22 },
            { name: 'Temperature', score: 18 },
            { name: 'Optical Signal', score: 16 },
            { name: 'Data Quality', score: 16 }
        ];
        
        importanceItems.forEach((item, idx) => {
            if (importance[idx]) {
                item.innerHTML = `
                    <span class="importance-label">${importance[idx].name}</span>
                    <div class="importance-bar">
                        <div class="importance-fill" style="width: ${importance[idx].score}%"></div>
                    </div>
                    <span class="importance-value">${importance[idx].score}%</span>
                `;
            }
        });
    }
}

function updateClinicalNotes(data) {
    // Update observations
    const observationsText = data.kidneyStage === 'Normal'
        ? 'Patient demonstrates excellent kidney function markers. All vital signs within normal range. Data quality excellent, indicating reliable measurement.'
        : 'Patient shows mildly reduced kidney function. Recommend monitoring trends over time. No acute concerns noted at this time.';
    document.getElementById('observationsText').textContent = observationsText;
    
    // Update recommendations
    const recommendationsText = data.kidneyStage === 'Normal'
        ? 'Continue regular monitoring schedule. Maintain healthy hydration. Next test recommended in 12 months.'
        : 'Schedule follow-up testing in 6 months. Consider nephrology consultation. Monitor fluid intake and dietary sodium.';
    document.getElementById('recommendationsText').textContent = recommendationsText;
    
    // Update cautions
    const cautionsText = data.kidneyStage === 'Normal'
        ? 'No contraindications noted. Patient may continue normal activities.'
        : 'Monitor for any changes in urinary output or fatigue. Report symptoms to healthcare provider immediately.';
    document.getElementById('cautionsText').textContent = cautionsText;
}

function initializeTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    // Generate 12 month trend data
    const labels = [];
    const eGFRData = [];
    for (let i = 11; i >= 0; i--) {
        labels.unshift('Month ' + (12 - i));
        eGFRData.unshift(85 + Math.random() * 20 - (12 - i) * 0.5);
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'eGFR Trend',
                data: eGFRData,
                borderColor: '#1a5db0',
                backgroundColor: 'rgba(26, 93, 176, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#1a5db0',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: { font: { size: 12, weight: '500' } }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 40,
                    max: 120,
                    ticks: { font: { size: 11 } }
                },
                x: {
                    ticks: { font: { size: 11 } }
                }
            }
        }
    });
}

function initializeFeatureChart() {
    const ctx = document.getElementById('featureChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Bioimpedance', 'Heart Rate', 'Temperature', 'Optical Signal', 'Data Quality'],
            datasets: [{
                label: 'Feature Scores',
                data: [85, 78, 92, 88, 95],
                borderColor: '#1a5db0',
                backgroundColor: 'rgba(26, 93, 176, 0.2)',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#1a5db0'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: { font: { size: 12, weight: '500' } }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { font: { size: 11 } }
                }
            }
        }
    });
}


function setupActionButtons() {
    const downloadBtn = document.getElementById('downloadPDFBtn');
    const shareBtn = document.getElementById('shareReportBtn');
    const historyBtn = document.getElementById('viewHistoryBtn');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadPDF);
    }
    if (shareBtn) {
        shareBtn.addEventListener('click', shareReport);
    }
    if (historyBtn) {
        historyBtn.addEventListener('click', () => window.location.href = 'history.html');
    }
}

function downloadPDF() {
    alert('In a real implementation, this would generate and download a professional PDF report.');
    // Real implementation would use jsPDF or similar library
}

function shareReport() {
    if (navigator.share) {
        navigator.share({
            title: 'Kidney Function Report',
            text: 'Check out my kidney function test results',
            url: window.location.href
        });
    } else {
        alert('Copy this link to share: ' + window.location.href);
    }
}

function revealOnScroll() {
    const reportSections = document.querySelectorAll('.report-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    reportSections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}