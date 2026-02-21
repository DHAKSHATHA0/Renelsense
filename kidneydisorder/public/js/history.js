// History Management System
class TestHistory {
    constructor() {
        this.storageKey = 'kidneyTestHistory';
        this.initializeStorage();
    }

    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }

    // Get all tests
    getAllTests() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }

    // Add new test result
    addTest(testData) {
        const tests = this.getAllTests();
        const newTest = {
            id: `TEST-${Date.now()}`,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            ...testData
        };
        tests.unshift(newTest); // Add to beginning (newest first)
        localStorage.setItem(this.storageKey, JSON.stringify(tests));
        return newTest;
    }

    // Get test by ID
    getTestById(testId) {
        const tests = this.getAllTests();
        return tests.find(test => test.id === testId);
    }

    // Clear all tests
    clearAllTests() {
        localStorage.setItem(this.storageKey, JSON.stringify([]));
    }

    // Export all tests as JSON
    exportAsJSON() {
        const tests = this.getAllTests();
        const data = {
            exportDate: new Date().toISOString(),
            totalTests: tests.length,
            tests: tests
        };
        return JSON.stringify(data, null, 2);
    }

    // Export as CSV
    exportAsCSV() {
        const tests = this.getAllTests();
        if (tests.length === 0) return '';

        const headers = ['Test ID', 'Date', 'Time', 'eGFR', 'Status', 'Risk Level', 'Confidence', 'Heart Rate', 'Temperature', 'Stage'];
        const rows = tests.map(test => [
            test.id || '',
            test.date || '',
            test.time || '',
            test.eGFR || '--',
            test.status || '--',
            test.riskLevel || '--',
            test.confidence || '--',
            test.heartRate || '--',
            test.temperature || '--',
            test.stage || '--'
        ]);

        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        return csv;
    }
}

// Initialize history manager
const testHistory = new TestHistory();

// Page initialization
document.addEventListener('DOMContentLoaded', async function() {
    console.log('History Page Loaded');
    
    // Initialize event listeners
    setupEventListeners();
    
    // Load and display history
    displayHistory();
    
    // Initialize chart
    initializeProgressChart();
});

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterAndDisplayTests(this.value);
        });
    }

    // Sort functionality
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortTests(this.value);
        });
    }

    // Export button
    const exportBtn = document.getElementById('exportAllBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', showExportOptions);
    }

    // Clear history button
    const clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all test history? This action cannot be undone.')) {
                testHistory.clearAllTests();
                displayHistory();
            }
        });
    }
}

function displayHistory() {
    const tests = testHistory.getAllTests();
    const listContainer = document.getElementById('testsList');

    if (tests.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No test history yet</p>
                <a href="live-test.html" class="btn btn-primary">
                    <i class="fas fa-play"></i> Start Your First Test
                </a>
            </div>
        `;
        updateSummaryCards([]);
        return;
    }

    listContainer.innerHTML = tests.map(test => createTestCard(test)).join('');
    updateSummaryCards(tests);

    // Add event listeners to action buttons
    document.querySelectorAll('.test-card').forEach((card, index) => {
        const viewBtn = card.querySelector('.btn-view');
        const downloadBtn = card.querySelector('.btn-download');
        
        if (viewBtn) {
            viewBtn.addEventListener('click', () => viewTestDetails(tests[index]));
        }
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => downloadTestResult(tests[index]));
        }
    });
}

function createTestCard(test) {
    const statusColor = getStatusColor(test.riskLevel);
    const riskIcon = getRiskIcon(test.riskLevel);

    return `
        <div class="test-card ${statusColor}">
            <div class="test-card-header">
                <div class="test-info">
                    <h4>${test.id}</h4>
                    <p class="test-date">
                        <i class="fas fa-calendar"></i> ${test.date}
                        <span class="test-time"><i class="fas fa-clock"></i> ${test.time}</span>
                    </p>
                </div>
                <div class="test-status">
                    <span class="status-badge ${statusColor}">
                        <i class="fas ${riskIcon}"></i> ${test.riskLevel || '--'}
                    </span>
                </div>
            </div>

            <div class="test-card-body">
                <div class="test-metric">
                    <span class="metric-label">eGFR</span>
                    <span class="metric-value">${test.eGFR || '--'}</span>
                    <span class="metric-unit">mL/min</span>
                </div>
                <div class="test-metric">
                    <span class="metric-label">Status</span>
                    <span class="metric-value">${test.status || '--'}</span>
                </div>
                <div class="test-metric">
                    <span class="metric-label">Heart Rate</span>
                    <span class="metric-value">${test.heartRate || '--'}</span>
                    <span class="metric-unit">BPM</span>
                </div>
                <div class="test-metric">
                    <span class="metric-label">Temp</span>
                    <span class="metric-value">${test.temperature || '--'}</span>
                    <span class="metric-unit">°C</span>
                </div>
            </div>

            <div class="test-card-footer">
                <button class="btn-view btn btn-secondary btn-small">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="btn-download btn btn-primary btn-small">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        </div>
    `;
}

function getStatusColor(riskLevel) {
    switch(riskLevel?.toLowerCase()) {
        case 'low':
            return 'status-low';
        case 'medium':
            return 'status-medium';
        case 'high':
            return 'status-high';
        default:
            return 'status-neutral';
    }
}

function getRiskIcon(riskLevel) {
    switch(riskLevel?.toLowerCase()) {
        case 'low':
            return 'fa-check-circle';
        case 'medium':
            return 'fa-exclamation-circle';
        case 'high':
            return 'fa-times-circle';
        default:
            return 'fa-circle';
    }
}

function updateSummaryCards(tests) {
    const totalTestsEl = document.getElementById('totalTests');
    const avgEGFREl = document.getElementById('avgEGFR');
    const latestStatusEl = document.getElementById('latestStatus');
    const lastTestDateEl = document.getElementById('lastTestDate');

    totalTestsEl.textContent = tests.length;

    if (tests.length > 0) {
        // Calculate average eGFR
        const eGFRValues = tests
            .map(t => parseFloat(t.eGFR))
            .filter(v => !isNaN(v));
        
        if (eGFRValues.length > 0) {
            const avgEGFR = (eGFRValues.reduce((a, b) => a + b, 0) / eGFRValues.length).toFixed(1);
            avgEGFREl.textContent = avgEGFR;
        }

        // Latest status
        latestStatusEl.textContent = tests[0].status || '--';

        // Last test date
        lastTestDateEl.textContent = tests[0].date || '--';
    } else {
        avgEGFREl.textContent = '--';
        latestStatusEl.textContent = '--';
        lastTestDateEl.textContent = '--';
    }
}

function filterAndDisplayTests(searchTerm) {
    const tests = testHistory.getAllTests();
    const filtered = tests.filter(test => 
        test.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.date.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const listContainer = document.getElementById('testsList');
    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>No tests found matching "${searchTerm}"</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = filtered.map(test => createTestCard(test)).join('');
    attachTestCardListeners(filtered);
}

function sortTests(sortBy) {
    let tests = testHistory.getAllTests();

    switch(sortBy) {
        case 'newest':
            tests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            break;
        case 'oldest':
            tests.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            break;
        case 'eGFR-high':
            tests.sort((a, b) => parseFloat(b.eGFR || 0) - parseFloat(a.eGFR || 0));
            break;
        case 'eGFR-low':
            tests.sort((a, b) => parseFloat(a.eGFR || 0) - parseFloat(b.eGFR || 0));
            break;
    }

    const listContainer = document.getElementById('testsList');
    listContainer.innerHTML = tests.map(test => createTestCard(test)).join('');
    attachTestCardListeners(tests);
}

function attachTestCardListeners(tests) {
    document.querySelectorAll('.test-card').forEach((card, index) => {
        const viewBtn = card.querySelector('.btn-view');
        const downloadBtn = card.querySelector('.btn-download');
        
        if (viewBtn) {
            viewBtn.addEventListener('click', () => viewTestDetails(tests[index]));
        }
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => downloadTestResult(tests[index]));
        }
    });
}

function viewTestDetails(test) {
    // Store the test in session storage for viewing
    sessionStorage.setItem('viewingTest', JSON.stringify(test));
    window.location.href = 'result.html?testId=' + test.id;
}

function downloadTestResult(test) {
    const testData = JSON.stringify(test, null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(testData));
    element.setAttribute('download', `test-${test.id}-${test.date}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function showExportOptions() {
    const options = confirm('Choose export format:\n\nOK = JSON\nCancel = CSV');
    
    if (options) {
        // Export as JSON
        const jsonData = testHistory.exportAsJSON();
        const element = document.createElement('a');
        element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonData));
        element.setAttribute('download', `kidney-test-history-${new Date().toISOString().split('T')[0]}.json`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    } else {
        // Export as CSV
        const csvData = testHistory.exportAsCSV();
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData));
        element.setAttribute('download', `kidney-test-history-${new Date().toISOString().split('T')[0]}.csv`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
}

function initializeProgressChart() {
    const tests = testHistory.getAllTests().reverse(); // Reverse to show oldest first
    
    if (tests.length === 0) {
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = '<div class="empty-chart"><p>No data to display. Run your first test to see progress!</p></div>';
        }
        return;
    }

    const ctx = document.getElementById('progressChart');
    if (!ctx) return;

    const eGFRValues = tests.map(t => parseFloat(t.eGFR) || null);
    const dates = tests.map(t => t.date);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'eGFR Progress',
                data: eGFRValues,
                borderColor: '#0066cc',
                backgroundColor: 'rgba(0, 102, 204, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#0066cc',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                segment: {
                    borderColor: ctx => eGFRValues[ctx.p0DataIndex] >= 60 ? '#28a745' : '#dc3545'
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { size: 12 },
                        padding: 15
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 0,
                    max: 120,
                    ticks: {
                        stepSize: 20
                    },
                    title: {
                        display: true,
                        text: 'eGFR (mL/min/1.73m²)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Test Date'
                    }
                }
            }
        }
    });
}

// Function to save test from result page
window.saveTestToHistory = function(testData) {
    testHistory.addTest(testData);
    console.log('Test saved to history:', testData);
};
