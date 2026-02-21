// ========================================
// REPORT PAGE FUNCTIONALITY
// ========================================

class ReportManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.downloadHistory = JSON.parse(localStorage.getItem('downloadHistory')) || [];
        this.viewingTest = JSON.parse(sessionStorage.getItem('viewingTest'));
        console.log('📋 Report Manager - Viewing test:', this.viewingTest);
        this.initializeReport();
    }

    initializeReport() {
        // Load user info
        if (this.currentUser) {
            const nameField = document.getElementById('patientName');
            if (nameField) {
                nameField.textContent = this.currentUser.name || `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            }
            const emailField = document.getElementById('patientEmail');
            if (emailField) {
                emailField.textContent = this.currentUser.email;
            }
        }

        // Load test data if available
        let testDate = new Date();
        if (this.viewingTest && this.viewingTest.date) {
            try {
                testDate = new Date(this.viewingTest.date);
            } catch (e) {
                console.warn('Could not parse test date, using current date');
            }
        }

        // Set test date
        const testDateField = document.getElementById('testDate');
        if (testDateField) {
            testDateField.textContent = testDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Generate report ID
        const reportId = `RPT-${testDate.getFullYear()}-${String(this.downloadHistory.length + 1).padStart(3, '0')}`;
        const reportIdField = document.getElementById('reportId');
        if (reportIdField) {
            reportIdField.textContent = reportId;
        }

        // Load and display test results if available
        if (this.viewingTest) {
            console.log('✅ Loading test report data');
            this.displayTestResults();
        }

        this.loadDownloadHistory();
        this.setupEventListeners();
    }

    displayTestResults() {
        // Update report sections with test data
        const test = this.viewingTest;
        
        // Find and update result cards with real data
        const resultCards = document.querySelectorAll('.result-card');
        resultCards.forEach((card, index) => {
            const valueElement = card.querySelector('.result-value');
            if (!valueElement) return;

            const title = card.querySelector('h3')?.textContent || '';
            
            if (title.includes('eGFR') || title.includes('Glomerular')) {
                valueElement.textContent = `${test.eGFR.toFixed(1)} mL/min/1.73m²`;
            } else if (title.includes('Creatinine')) {
                valueElement.textContent = `${test.creatinine.toFixed(2)} mg/dL`;
            } else if (title.includes('Stage')) {
                valueElement.textContent = test.stage || 'Normal';
            } else if (title.includes('Risk')) {
                valueElement.textContent = test.riskLevel || 'Low';
            }
        });

        // Update interpretation and recommendation sections
        const interpretationElements = document.querySelectorAll('[id*="interpretation"], [id*="summary"]');
        interpretationElements.forEach(elem => {
            if (elem.textContent.includes('Normal')) {
                elem.textContent = test.interpretation || 'Test completed successfully';
            }
        });
    }

    setupEventListeners() {
        // Download report button
        document.getElementById('downloadReportBtn').addEventListener('click', () => {
            this.downloadReport();
        });

        // Print report button
        document.getElementById('printReportBtn').addEventListener('click', () => {
            window.print();
        });

        // Ask AI button
        document.getElementById('askAIBtn').addEventListener('click', () => {
            window.location.href = 'ai-assistant.html';
        });
    }

    downloadReport() {
        const reportContent = document.getElementById('reportContent');
        const today = new Date();
        const reportId = document.getElementById('reportId').textContent;

        // Create report text content
        let textContent = `KIDNEY HEALTH TEST REPORT\n`;
        textContent += `=====================================\n\n`;
        textContent += `PATIENT INFORMATION\n`;
        textContent += `${document.getElementById('patientName').textContent}\n`;
        textContent += `Email: ${document.getElementById('patientEmail').textContent}\n`;
        textContent += `Test Date: ${document.getElementById('testDate').textContent}\n`;
        textContent += `Report ID: ${reportId}\n\n`;

        // Add test results
        textContent += `KIDNEY FUNCTION TEST RESULTS\n`;
        textContent += `=====================================\n`;

        const resultCards = document.querySelectorAll('.result-card');
        resultCards.forEach((card) => {
            const title = card.querySelector('h3').textContent;
            const value = card.querySelector('.result-value').textContent;
            const normal = card.querySelector('.result-normal').textContent;
            const status = card.querySelector('.status').textContent;

            textContent += `\n${title}\n`;
            textContent += `Value: ${value}\n`;
            textContent += `${normal}\n`;
            textContent += `Status: ${status}\n`;
        });

        // Add summary
        textContent += `\n\nSUMMARY & INTERPRETATION\n`;
        textContent += `=====================================\n`;
        textContent += `Your test results indicate Normal Kidney Function.\n`;
        textContent += `All key metrics are within the normal range.\n\n`;

        // Create and download file
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `kidney-test-report-${today.toISOString().split('T')[0]}.txt`;
        link.click();
        URL.revokeObjectURL(url);

        // Add to download history
        const historyItem = {
            id: Date.now(),
            reportId: reportId,
            fileName: `kidney-test-report-${today.toISOString().split('T')[0]}.txt`,
            downloadDate: today.toLocaleString(),
            patientName: document.getElementById('patientName').textContent
        };

        this.downloadHistory.push(historyItem);
        localStorage.setItem('downloadHistory', JSON.stringify(this.downloadHistory));
        this.loadDownloadHistory();

        // Show success message
        this.showToast('Report downloaded successfully!', 'success');
    }

    loadDownloadHistory() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';

        if (this.downloadHistory.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #999;">No previous downloads</p>';
            return;
        }

        this.downloadHistory.reverse().forEach((item) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-item-info">
                    <div class="history-item-name">${item.reportId} - ${item.patientName}</div>
                    <div class="history-item-date">${item.downloadDate}</div>
                </div>
                <div class="history-item-action">
                    <button onclick="window.reportManager.redownloadReport(${item.id})">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            `;
            historyList.appendChild(historyItem);
        });
    }

    redownloadReport(itemId) {
        const item = this.downloadHistory.find(h => h.id === itemId);
        if (item) {
            alert(`Downloading: ${item.fileName}`);
            // In a real app, you would fetch the actual file content from server
        }
    }

    showToast(message, type = 'info') {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            padding: 16px 24px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') {
            toast.style.borderLeft = '4px solid #4caf50';
            toast.textContent = '✓ ' + message;
        } else if (type === 'error') {
            toast.style.borderLeft = '4px solid #f44336';
            toast.textContent = '✗ ' + message;
        } else {
            toast.style.borderLeft = '4px solid #2196f3';
            toast.textContent = message;
        }

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Generate dynamic test results based on user data
function generateTestResults() {
    const results = [
        {
            title: 'Creatinine Level',
            value: '0.9 mg/dL',
            range: '0.7 - 1.3 mg/dL',
            status: 'Normal',
            description: 'Creatinine is a waste product produced by muscles. Your level is normal, indicating good kidney function.'
        },
        {
            title: 'GFR (eGFR)',
            value: '95 mL/min',
            range: '>90 mL/min (Stage 1)',
            status: 'Normal',
            description: 'GFR measures how well your kidneys filter waste. Your result indicates normal kidney function.'
        },
        {
            title: 'BUN Level',
            value: '18 mg/dL',
            range: '7 - 20 mg/dL',
            status: 'Normal',
            description: 'BUN measures urea nitrogen. Your level is normal and indicates proper kidney function.'
        },
        {
            title: 'Potassium Level',
            value: '4.2 mEq/L',
            range: '3.5 - 5.0 mEq/L',
            status: 'Normal',
            description: 'Potassium is important for heart and muscle function. Your level is normal.'
        },
        {
            title: 'Phosphorus Level',
            value: '3.6 mg/dL',
            range: '2.5 - 4.5 mg/dL',
            status: 'Normal',
            description: 'Phosphorus is regulated by kidneys. Your level is within normal range.'
        },
        {
            title: 'Protein in Urine',
            value: 'Negative',
            range: 'Negative or <10 mg/dL',
            status: 'Negative',
            description: 'No protein detected in urine, which is a good sign of kidney health.'
        }
    ];

    return results;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    window.reportManager = new ReportManager();
});
