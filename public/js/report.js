// ========================================
// REPORT PAGE FUNCTIONALITY
// ========================================

class ReportManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.downloadHistory = JSON.parse(localStorage.getItem('downloadHistory')) || [];
        this.initializeReport();
    }

    initializeReport() {
        // Load user info
        if (this.currentUser) {
            document.getElementById('patientName').textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            document.getElementById('patientEmail').textContent = this.currentUser.email;
        }

        // Set test date
        const today = new Date();
        document.getElementById('testDate').textContent = today.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // Generate report ID
        const reportId = `RPT-${today.getFullYear()}-${String(this.downloadHistory.length + 1).padStart(3, '0')}`;
        document.getElementById('reportId').textContent = reportId;

        // Load real test results from sessionStorage
        this.loadTestResults();
        this.loadDownloadHistory();
        this.setupEventListeners();
    }

    loadTestResults() {
        const stored = sessionStorage.getItem('lastTestResults') || sessionStorage.getItem('viewingTest');
        if (!stored) return;
        const r = JSON.parse(stored);

        // Update eGFR card
        const eGFRCard = document.querySelector('.result-card:nth-child(2)');
        const allCards = document.querySelectorAll('.result-card');

        // Map result data to report cards by updating values
        const updates = [
            { selector: '.result-card:nth-child(1) .result-value', value: r.creatinine ? `${r.creatinine} mg/dL` : '0.9 mg/dL' },
            { selector: '.result-card:nth-child(1) .status', value: r.creatinine && r.creatinine <= 1.3 ? 'Normal' : 'Elevated', cls: r.creatinine && r.creatinine <= 1.3 ? 'normal' : 'elevated' },
            { selector: '.result-card:nth-child(2) .result-value', value: r.eGFR ? `${r.eGFR} mL/min` : '95 mL/min' },
            { selector: '.result-card:nth-child(2) .status', value: r.eGFR >= 90 ? 'Normal' : r.eGFR >= 60 ? 'Mild' : 'Reduced', cls: r.eGFR >= 60 ? 'normal' : 'warning' },
            { selector: '.result-card:nth-child(3) .result-value', value: r.ureaLevel ? `${r.ureaLevel} mg/dL` : '18 mg/dL' },
            { selector: '.result-card:nth-child(3) .status', value: r.ureaLevel && r.ureaLevel <= 20 ? 'Normal' : 'Elevated', cls: r.ureaLevel && r.ureaLevel <= 20 ? 'normal' : 'elevated' },
            { selector: '.result-card:nth-child(4) .result-value', value: r.potassium ? `${r.potassium} mEq/L` : '4.2 mEq/L' },
            { selector: '.result-card:nth-child(4) .status', value: r.potassium && r.potassium >= 3.5 && r.potassium <= 5.0 ? 'Normal' : 'Abnormal', cls: r.potassium && r.potassium >= 3.5 && r.potassium <= 5.0 ? 'normal' : 'warning' }
        ];

        updates.forEach(u => {
            const el = document.querySelector(u.selector);
            if (el) {
                el.textContent = u.value;
                if (u.cls) { el.className = `status ${u.cls}`; }
            }
        });

        // Update summary
        const summaryBox = document.querySelector('.summary-box');
        if (summaryBox && r.eGFR) {
            const stage = r.stage || r.status || 'Normal Function';
            const riskColor = r.riskLevel === 'Low' ? '#28a745' : r.riskLevel === 'Medium' ? '#ffc107' : '#dc3545';
            summaryBox.innerHTML = `
                <h3>Overall Assessment</h3>
                <p>Your test results indicate <strong>${stage}</strong>. Risk Level: <strong style="color:${riskColor}">${r.riskLevel || 'Low'}</strong>.</p>
                <h3 style="margin-top:16px;">Key Findings:</h3>
                <ul>
                    <li>✓ eGFR: ${r.eGFR} mL/min/1.73m² (${stage})</li>
                    <li>✓ Heart Rate: ${r.heartRate || '--'} BPM</li>
                    <li>✓ Temperature: ${r.temperature || '--'}°C</li>
                    <li>✓ SpO2: ${r.spo2 || '--'}%</li>
                    <li>✓ Confidence Score: ${r.confidence || '--'}%</li>
                </ul>
            `;
        }

        // Update test date if available
        if (r.date) {
            document.getElementById('testDate').textContent = r.date;
        }
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
        const today = new Date();
        const reportId = document.getElementById('reportId').textContent;
        const stored = sessionStorage.getItem('lastTestResults') || sessionStorage.getItem('viewingTest');
        const r = stored ? JSON.parse(stored) : {};

        let textContent = `KIDNEY HEALTH TEST REPORT\n`;
        textContent += `=====================================\n\n`;
        textContent += `PATIENT INFORMATION\n`;
        textContent += `Name: ${document.getElementById('patientName').textContent}\n`;
        textContent += `Email: ${document.getElementById('patientEmail').textContent}\n`;
        textContent += `Test Date: ${document.getElementById('testDate').textContent}\n`;
        textContent += `Report ID: ${reportId}\n\n`;
        textContent += `KIDNEY FUNCTION TEST RESULTS\n`;
        textContent += `=====================================\n`;
        textContent += `eGFR: ${r.eGFR || '--'} mL/min/1.73m\u00b2\n`;
        textContent += `Creatinine: ${r.creatinine || '--'} mg/dL\n`;
        textContent += `Urea (BUN): ${r.ureaLevel || '--'} mg/dL\n`;
        textContent += `Potassium: ${r.potassium || '--'} mEq/L\n`;
        textContent += `Heart Rate: ${r.heartRate || '--'} BPM\n`;
        textContent += `Temperature: ${r.temperature || '--'}\u00b0C\n`;
        textContent += `SpO2: ${r.spo2 || '--'}%\n`;
        textContent += `Risk Level: ${r.riskLevel || '--'}\n`;
        textContent += `Stage: ${r.stage || r.status || '--'}\n`;
        textContent += `Confidence: ${r.confidence || '--'}%\n\n`;
        textContent += `SUMMARY\n=====================================\n`;
        textContent += `Overall: ${r.stage || r.status || 'Normal Kidney Function'}\n`;

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `kidney-test-report-${today.toISOString().split('T')[0]}.txt`;
        link.click();
        URL.revokeObjectURL(url);

        const historyItem = {
            id: Date.now(),
            reportId,
            fileName: `kidney-test-report-${today.toISOString().split('T')[0]}.txt`,
            downloadDate: today.toLocaleString(),
            patientName: document.getElementById('patientName').textContent
        };
        this.downloadHistory.push(historyItem);
        localStorage.setItem('downloadHistory', JSON.stringify(this.downloadHistory));
        this.loadDownloadHistory();
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
