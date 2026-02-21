// ========================================
// REAL-TIME TEST HISTORY MANAGEMENT SYSTEM
// Fetches actual test data from backend MySQL database
// ========================================

class TestHistoryManager {
    constructor() {
        this.currentUser = authManager.getCurrentUser();
        this.serverURL = this.getServerURL();
        this.allTests = [];
        this.filteredTests = [];
    }

    getServerURL() {
        if (typeof serverConfig !== 'undefined' && serverConfig.getServerURL) {
            return serverConfig.getServerURL();
        }
        return window.location.origin || 'http://localhost:3000';
    }

    // Fetch all tests for current user from backend
    async fetchUserTests() {
        try {
            if (!this.currentUser || !this.currentUser.id) {
                console.error('❌ No user logged in - cannot fetch tests');
                console.log('Current user:', this.currentUser);
                return [];
            }

            console.log(`✅ Fetching tests for user ID: ${this.currentUser.id}`);
            const url = `${this.serverURL}/api/test-results/user/${this.currentUser.id}`;
            console.log('📍 Fetch URL:', url);

            const response = await fetch(url);
            const data = await response.json();
            
            console.log('📥 Server response:', data);

            if (data.success && data.data) {
                this.allTests = data.data.map(test => this.formatTestData(test));
                console.log(`✅✅ Loaded ${this.allTests.length} tests from backend for user ${this.currentUser.id}`);
                
                if (this.allTests.length === 0) {
                    console.warn('⚠️ No tests found for this user');
                }
                
                return this.allTests;
            } else {
                console.error('❌ Server returned error:', data);
                return [];
            }
        } catch (error) {
            console.error('❌ Error fetching tests:', error);
            console.error('Error details:', error.message);
            return [];
        }
    }

    // Fetch statistics for current user
    async fetchTestStatistics() {
        try {
            if (!this.currentUser || !this.currentUser.id) {
                return null;
            }

            const response = await fetch(`${this.serverURL}/api/test-results/stats/${this.currentUser.id}`);
            const data = await response.json();

            if (data.success) {
                return data.stats;
            }
            return null;
        } catch (error) {
            console.error('❌ Error fetching statistics:', error);
            return null;
        }
    }

    // Format test data from database
    formatTestData(test) {
        return {
            id: test.id,
            userId: test.userId,
            date: test.testDate || new Date(test.timestamp).toLocaleDateString(),
            time: test.testTime || new Date(test.timestamp).toLocaleTimeString(),
            timestamp: test.timestamp,
            eGFR: parseFloat(test.eGFR),
            creatinine: parseFloat(test.creatinine),
            heartRate: parseInt(test.heartRate),
            spo2: parseFloat(test.spo2),
            temperature: parseFloat(test.temperature),
            status: test.status || 'completed',
            stage: test.stage || 'Unknown',
            riskLevel: test.riskLevel || 'Normal',
            confidence: parseFloat(test.confidence) || 0,
            interpretation: test.interpretation || 'Standard kidney function assessment',
            recommendation: test.recommendation || 'Continue regular monitoring',
            report: test.report || 'Test completed successfully',
            gender: test.gender,
            age: test.age,
            dataQuality: parseFloat(test.dataQuality) || 100
        };
    }

    // Sort tests by various criteria
    sortTests(sortBy) {
        let sorted = [...this.allTests];

        switch(sortBy) {
            case 'newest':
                sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                break;
            case 'oldest':
                sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                break;
            case 'eGFR-high':
                sorted.sort((a, b) => (b.eGFR || 0) - (a.eGFR || 0));
                break;
            case 'eGFR-low':
                sorted.sort((a, b) => (a.eGFR || 0) - (b.eGFR || 0));
                break;
            default:
                return sorted;
        }

        return sorted;
    }

    // Filter tests by search term
    filterTests(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return this.allTests;
        }

        const term = searchTerm.toLowerCase();
        return this.allTests.filter(test =>
            test.id.toString().includes(term) ||
            test.date.includes(searchTerm) ||
            test.time.includes(searchTerm) ||
            (test.stage && test.stage.toLowerCase().includes(term)) ||
            (test.riskLevel && test.riskLevel.toLowerCase().includes(term))
        );
    }

    // Get single test by ID
    async getTestById(testId) {
        return this.allTests.find(t => t.id === testId);
    }

    // Export tests as JSON
    exportAsJSON(tests = this.allTests) {
        const data = {
            exportDate: new Date().toISOString(),
            userName: this.currentUser?.name || 'Unknown',
            totalTests: tests.length,
            tests: tests
        };
        return JSON.stringify(data, null, 2);
    }

    // Export tests as CSV
    exportAsCSV(tests = this.allTests) {
        if (tests.length === 0) return '';

        const headers = ['Test ID', 'Date', 'Time', 'eGFR', 'Stage', 'Risk Level', 'Heart Rate', 'SpO2', 'Temperature', 'Confidence %', 'Status'];
        const rows = tests.map(test => [
            test.id || '',
            test.date || '',
            test.time || '',
            test.eGFR || '--',
            test.stage || '--',
            test.riskLevel || '--',
            test.heartRate || '--',
            test.spo2 || '--',
            test.temperature || '--',
            test.confidence || '--',
            test.status || '--'
        ]);

        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        return csv;
    }
}

// Initialize history manager
let historyManager;

// Page initialization
document.addEventListener('DOMContentLoaded', async function() {
    console.log('History Page Loaded');

    // Initialize history manager
    historyManager = new TestHistoryManager();

    // Load data from backend
    await loadHistoryData();

    // Initialize event listeners
    setupEventListeners();
});

async function loadHistoryData() {
    // Show loading state
    const testsList = document.getElementById('testsList');
    testsList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading test history...</div>';

    // Fetch tests and statistics
    await historyManager.fetchUserTests();
    const stats = await historyManager.fetchTestStatistics();

    // Display history
    displayHistory();

    // Update summary cards
    updateSummaryCards(stats);

    // Initialize chart
    initializeProgressChart();
}

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
            displayHistory(this.value);
        });
    }

    // Export button
    const exportBtn = document.getElementById('exportAllBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', showExportOptions);
    }

    // Clear history button (removed for real database)
    const clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) {
        clearBtn.style.display = 'none'; // Hide for real data
    }
}

function displayHistory(sortBy = 'newest') {
    let tests = historyManager.sortTests(sortBy || 'newest');
    const listContainer = document.getElementById('testsList');

    console.log('📊 Displaying history - Total tests:', tests.length);
    console.log('📊 Current user:', historyManager.currentUser);
    console.log('📊 All tests in manager:', historyManager.allTests);

    if (!historyManager.currentUser) {
        console.error('❌ No user logged in for history display');
        listContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-lock"></i>
                <p>Please log in to view your test history</p>
                <a href="login.html" class="btn btn-primary">
                    <i class="fas fa-sign-in-alt"></i> Login
                </a>
            </div>
        `;
        return;
    }

    if (tests.length === 0) {
        console.warn('⚠️ No tests found to display');
        listContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No test history yet</p>
                <p class="empty-subtext">Start your first kidney health test to begin tracking your health</p>
                <a href="live-test.html" class="btn btn-primary">
                    <i class="fas fa-play"></i> Start Your First Test
                </a>
            </div>
        `;
        return;
    }
    
    console.log('✅✅ Displaying', tests.length, 'tests');

    listContainer.innerHTML = tests.map(test => createTestCard(test)).join('');

    // Add event listeners to action buttons
    document.querySelectorAll('.test-card').forEach((card, index) => {
        const resultBtn = card.querySelector('.btn-view');
        const reportBtn = card.querySelector('.btn-report');

        if (resultBtn) {
            resultBtn.addEventListener('click', () => viewTestDetails(tests[index]));
        }
        if (reportBtn) {
            reportBtn.addEventListener('click', () => viewTestReport(tests[index]));
        }
    });
}

function createTestCard(test) {
    const statusColor = getStatusColor(test.riskLevel);
    const riskIcon = getRiskIcon(test.riskLevel);
    const eGFRStatus = getEGFRStatus(test.eGFR);

    return `
        <div class="test-card ${statusColor}">
            <div class="test-card-header">
                <div class="test-info">
                    <h4>Test #${test.id}</h4>
                    <p class="test-date">
                        <i class="fas fa-calendar"></i> ${test.date}
                        <span class="test-time"><i class="fas fa-clock"></i> ${test.time}</span>
                    </p>
                </div>
                <div class="test-status">
                    <span class="status-badge ${statusColor}">
                        <i class="fas ${riskIcon}"></i> ${test.riskLevel}
                    </span>
                    <span class="egfr-badge ${eGFRStatus}">
                        eGFR: ${test.eGFR.toFixed(1)}
                    </span>
                </div>
            </div>

            <div class="test-card-body">
                <div class="test-metric">
                    <span class="metric-label">Stage</span>
                    <span class="metric-value">${test.stage}</span>
                </div>
                <div class="test-metric">
                    <span class="metric-label">Heart Rate</span>
                    <span class="metric-value">${test.heartRate}</span>
                    <span class="metric-unit">BPM</span>
                </div>
                <div class="test-metric">
                    <span class="metric-label">SpO2</span>
                    <span class="metric-value">${test.spo2.toFixed(1)}</span>
                    <span class="metric-unit">%</span>
                </div>
                <div class="test-metric">
                    <span class="metric-label">Temperature</span>
                    <span class="metric-value">${test.temperature.toFixed(1)}</span>
                    <span class="metric-unit">°C</span>
                </div>
                <div class="test-metric">
                    <span class="metric-label">Data Quality</span>
                    <span class="metric-value">${test.dataQuality.toFixed(0)}</span>
                    <span class="metric-unit">%</span>
                </div>
            </div>

            <div class="test-card-footer">
                <button class="btn-view btn btn-primary btn-small">
                    <i class="fas fa-file-alt"></i> Result
                </button>
                <button class="btn-report btn btn-success btn-small">
                    <i class="fas fa-print"></i> Report
                </button>
            </div>
        </div>
    `;
}

function getStatusColor(riskLevel) {
    switch((riskLevel || 'Normal').toLowerCase()) {
        case 'low':
        case 'normal':
            return 'status-low';
        case 'medium':
        case 'mild':
            return 'status-medium';
        case 'high':
        case 'critical':
            return 'status-high';
        default:
            return 'status-neutral';
    }
}

function getRiskIcon(riskLevel) {
    switch((riskLevel || 'Normal').toLowerCase()) {
        case 'low':
        case 'normal':
            return 'fa-check-circle';
        case 'medium':
        case 'mild':
            return 'fa-exclamation-circle';
        case 'high':
        case 'critical':
            return 'fa-times-circle';
        default:
            return 'fa-circle';
    }
}

function getEGFRStatus(eGFR) {
    if (eGFR >= 60) return 'egfr-normal';
    if (eGFR >= 45) return 'egfr-mild';
    if (eGFR >= 30) return 'egfr-moderate';
    if (eGFR >= 15) return 'egfr-severe';
    return 'egfr-critical';
}

function updateSummaryCards(stats) {
    const totalTestsEl = document.getElementById('totalTests');
    const avgEGFREl = document.getElementById('avgEGFR');
    const latestStatusEl = document.getElementById('latestStatus');
    const lastTestDateEl = document.getElementById('lastTestDate');

    if (stats) {
        totalTestsEl.textContent = stats.totalTests || 0;
        avgEGFREl.textContent = stats.averageEGFR ? stats.averageEGFR.toFixed(1) : '--';
        latestStatusEl.textContent = stats.latestStatus || '--';
        lastTestDateEl.textContent = stats.latestDate ? formatDate(stats.latestDate) : '--';

        // Add trend indicator
        const trendEl = document.querySelector('.summary-card:nth-child(3)');
        if (trendEl && stats.eGFRTrend) {
            const trendIcon = stats.eGFRTrend === 'improving' ? 'fa-arrow-up' : stats.eGFRTrend === 'declining' ? 'fa-arrow-down' : 'fa-circle';
            trendEl.querySelector('.summary-value').innerHTML = `
                <i class="fas ${trendIcon}"></i> ${stats.eGFRTrend}
            `;
        }
    } else {
        totalTestsEl.textContent = '0';
        avgEGFREl.textContent = '--';
        latestStatusEl.textContent = '--';
        lastTestDateEl.textContent = '--';
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function filterAndDisplayTests(searchTerm) {
    let filtered = historyManager.filterTests(searchTerm);
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

function attachTestCardListeners(tests) {
    document.querySelectorAll('.test-card').forEach((card, index) => {
        const viewBtn = card.querySelector('.btn-view');
        const compareBtn = card.querySelector('.btn-compare');

        if (viewBtn) {
            viewBtn.addEventListener('click', () => viewTestDetails(tests[index]));
        }
        if (compareBtn) {
            compareBtn.addEventListener('click', () => compareTests(tests[index]));
        }
    });
}

function viewTestDetails(test) {
    // Store the test in session storage for viewing
    sessionStorage.setItem('viewingTest', JSON.stringify(test));
    window.location.href = `result.html?testId=${test.id}`;
}

function viewTestReport(test) {
    // Store the test in session storage for viewing report
    sessionStorage.setItem('viewingTest', JSON.stringify(test));
    window.location.href = `report.html?testId=${test.id}`;
}

function compareTests(currentTest) {
    // Find previous test for comparison
    const currentIndex = historyManager.allTests.findIndex(t => t.id === currentTest.id);
    if (currentIndex === -1) return;

    let previousTest = null;
    if (currentIndex > 0) {
        previousTest = historyManager.allTests[currentIndex + 1];
    }

    // Store tests in session storage
    sessionStorage.setItem('currentTest', JSON.stringify(currentTest));
    sessionStorage.setItem('previousTest', JSON.stringify(previousTest));
    window.location.href = `result.html?compare=true&testId=${currentTest.id}`;
}

function showExportOptions() {
    const tests = historyManager.allTests;
    if (tests.length === 0) {
        alert('No tests to export');
        return;
    }

    const options = confirm('Choose export format:\n\nOK = JSON\nCancel = CSV');

    if (options) {
        // Export as JSON
        const jsonData = historyManager.exportAsJSON(tests);
        downloadFile(jsonData, `kidney-test-history-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    } else {
        // Export as CSV
        const csvData = historyManager.exportAsCSV(tests);
        downloadFile(csvData, `kidney-test-history-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    }
}

function downloadFile(data, filename, type) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:' + type + ';charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function initializeProgressChart() {
    const tests = [...historyManager.allTests].reverse(); // Reverse to show oldest first

    if (tests.length === 0) {
        const ctx = document.getElementById('progressChart');
        if (ctx) {
            ctx.parentElement.innerHTML = '<div class="empty-chart"><p>No data to display yet. Run your first test to begin tracking!</p></div>';
        }
        return;
    }

    const ctx = document.getElementById('progressChart');
    if (!ctx) return;

    const eGFRValues = tests.map(t => t.eGFR);
    const dates = tests.map(t => t.date);

    try {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'eGFR Progress (mL/min/1.73m²)',
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
                    pointHoverRadius: 8
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
                        beginAtZero: true,
                        min: 0,
                        max: 120,
                        ticks: {
                            stepSize: 20
                        },
                        title: {
                            display: true,
                            text: 'eGFR Value'
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
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}
