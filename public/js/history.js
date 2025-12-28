// History Page JavaScript - Clinical Records

let trendChart;
let historyData = [];

async function initHistoryPage() {
    // Wait for serverConfig to be available
    let attempts = 0;
    while (typeof serverConfig === 'undefined' && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    console.log('History Page Loaded');
    console.log('Using server:', serverConfig.getAPIURL());
    
    // Initialize trend chart
    initializeTrendChart();
    
    // Load and display history data
    loadHistoryData();
    
    // Setup export functions
    window.downloadHistory = downloadHistory;
    window.shareHistory = shareHistory;
}

document.addEventListener('DOMContentLoaded', initHistoryPage);

function initializeTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    // Generate sample 12-month eGFR trend
    const months = [];
    const eGFRValues = [];
    
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        
        // Generate realistic downward trend with variations
        eGFRValues.push(85 - (11 - i) * 0.3 + (Math.random() - 0.5) * 5);
    }
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'eGFR (mL/min/1.73m²)',
                    data: eGFRValues,
                    borderColor: '#1a5db0',
                    backgroundColor: 'rgba(26, 93, 176, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: '#1a5db0',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Normal Range (90+)',
                    data: Array(12).fill(90),
                    borderColor: '#2e7d32',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: 'Risk Threshold (60)',
                    data: Array(12).fill(60),
                    borderColor: '#f57c00',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { size: 12, weight: '500' },
                        padding: 15
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 30,
                    max: 120,
                    title: {
                        display: true,
                        text: 'eGFR (mL/min/1.73m²)',
                        font: { size: 12, weight: '600' }
                    },
                    ticks: { font: { size: 11 } }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date',
                        font: { size: 12, weight: '600' }
                    },
                    ticks: { font: { size: 11 } }
                }
            }
        }
    });
}

function loadHistoryData() {
    // Generate realistic sample history data
    historyData = generateSampleHistoryData();
    
    // Update summary stats
    updateSummaryStats();
    
    // Populate table
    populateHistoryTable();
}

function generateSampleHistoryData() {
    const data = [];
    const baseDate = new Date();
    
    for (let i = 0; i < 12; i++) {
        const testDate = new Date(baseDate);
        testDate.setDate(testDate.getDate() - (i * 7)); // Weekly tests
        
        const eGFR = 85 - (i * 0.25) + (Math.random() - 0.5) * 5;
        
        data.push({
            date: testDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            testId: 'TEST-' + String(1000 + i).padStart(5, '0'),
            eGFR: eGFR.toFixed(1),
            stage: getKidneyStage(eGFR),
            status: getStatus(eGFR),
            confidence: (92 + Math.random() * 8).toFixed(1),
            details: getStageDetails(getKidneyStage(eGFR))
        });
    }
    
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getKidneyStage(eGFR) {
    if (eGFR >= 90) return 'Normal';
    if (eGFR >= 60) return 'Stage 2';
    if (eGFR >= 45) return 'Stage 3a';
    if (eGFR >= 30) return 'Stage 3b';
    if (eGFR >= 15) return 'Stage 4';
    return 'Stage 5';
}

function getStatus(eGFR) {
    if (eGFR >= 90) return 'normal';
    if (eGFR >= 60) return 'warning';
    return 'critical';
}

function getStageDetails(stage) {
    const details = {
        'Normal': 'Excellent kidney function. Continue regular monitoring.',
        'Stage 2': 'Mildly reduced function. Monitor annually.',
        'Stage 3a': 'Moderate reduction. See nephrologist.',
        'Stage 3b': 'Moderate reduction. Specialist care recommended.',
        'Stage 4': 'Severe reduction. Immediate specialist consultation.',
        'Stage 5': 'Critical. Requires active treatment planning.'
    };
    return details[stage] || 'Contact your healthcare provider';
}

function updateSummaryStats() {
    document.getElementById('totalTests').textContent = historyData.length;
    document.getElementById('lastEGFR').textContent = historyData[0].eGFR;
    
    // Calculate trend
    if (historyData.length >= 3) {
        const recent = parseFloat(historyData[0].eGFR);
        const older = parseFloat(historyData[2].eGFR);
        
        if (recent > older) {
            document.getElementById('trend').innerHTML = '<i class="fas fa-arrow-up" style="color: #2e7d32;"></i> Improving';
        } else if (recent < older) {
            document.getElementById('trend').innerHTML = '<i class="fas fa-arrow-down" style="color: #f57c00;"></i> Declining';
        } else {
            document.getElementById('trend').innerHTML = '<i class="fas fa-arrow-right" style="color: #666;"></i> Stable';
        }
    }
    
    // Last test date
    const lastTestDate = new Date(historyData[0].date);
    const today = new Date();
    const daysAgo = Math.floor((today - lastTestDate) / (1000 * 60 * 60 * 24));
    
    if (daysAgo === 0) {
        document.getElementById('lastTest').textContent = 'Today';
    } else if (daysAgo === 1) {
        document.getElementById('lastTest').textContent = 'Yesterday';
    } else {
        document.getElementById('lastTest').textContent = `${daysAgo} days ago`;
    }
}

function populateHistoryTable() {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = historyData.map((test, idx) => `
        <tr>
            <td>${test.date}</td>
            <td><strong>${test.testId}</strong></td>
            <td>${test.eGFR}</td>
            <td><strong>${test.stage}</strong></td>
            <td><span class="status-${test.status}">${test.status.charAt(0).toUpperCase() + test.status.slice(1)}</span></td>
            <td><span class="confidence-badge">${test.confidence}%</span></td>
            <td>
                <button class="btn-details" onclick="viewTestDetails('${test.testId}')">
                    <i class="fas fa-file-medical"></i> View
                </button>
            </td>
        </tr>
    `).join('');
}

function viewTestDetails(testId) {
    alert(`Viewing details for ${testId}. In a real implementation, this would load the detailed report.`);
    // In production, redirect to report page with test ID
    // window.location.href = `report.html?testId=${testId}`;
}

function downloadHistory() {
    // In production, generate PDF or CSV
    alert('Downloading history as PDF... In a real implementation, this would generate a professional PDF report.');
    
    // Example CSV generation
    let csv = 'Date,Test ID,eGFR,Stage,Status,Confidence\n';
    historyData.forEach(test => {
        csv += `${test.date},${test.testId},${test.eGFR},${test.stage},${test.status},${test.confidence}%\n`;
    });
    
    // Download CSV
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', 'kidney-history.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function shareHistory() {
    if (navigator.share) {
        navigator.share({
            title: 'My Kidney Function History',
            text: 'Check out my kidney function monitoring history',
            url: window.location.href
        });
    } else {
        alert('Share link: ' + window.location.href);
    }
}
