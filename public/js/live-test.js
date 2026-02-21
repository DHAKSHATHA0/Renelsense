// Live Test Page JavaScript - Real-Time Medical Monitoring

// Suppress unhandled promise rejections (like "Failed to fetch" errors)
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('Failed to fetch')) {
        event.preventDefault();
        console.error('Fetch error suppressed:', event.reason);
    }
});

let hrChart, spo2Chart;
let testActive = false;
let packetCount = 0;
const TOTAL_PACKETS = 180;
let elapsedTime = 0;
let elapsedInterval = null;
let selectedGender = null;
let patientAge = null;

// Test data collection arrays
let heartRateValues = [];
let spo2Values = [];
let temperatureValues = [];
let currentTestData = {
    startTime: null,
    endTime: null,
    measurements: []
};

// Wait for server config to be available
async function initLiveTest() {
    // Wait for serverConfig to be loaded
    let attempts = 0;
    while (typeof serverConfig === 'undefined' && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    console.log('Live Test Page Loaded');
    console.log('Using server:', serverConfig.getWebSocketURL());
    
    // Initialize charts
    initializeCharts();
    
    // Setup event listeners
    window.startTest = startTest;
    window.stopTest = stopTest;
    window.viewResults = viewResults;
    window.startNewTest = startNewTest;
    window.selectGender = selectGender;
}

// Gender selection function
function selectGender(gender) {
    selectedGender = gender;
    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    const selectedBtn = document.querySelector(`[data-gender="${gender}"]`);
    selectedBtn.classList.add('selected');
}

function initializeCharts() {
    // Heart Rate Chart
    const hrCtx = document.getElementById('hrChart');
    if (hrCtx) {
        hrChart = new Chart(hrCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Heart Rate (BPM)',
                    data: [],
                    borderColor: '#2e7d32',
                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: '#2e7d32'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, labels: { font: { size: 12, weight: '500' } } }
                },
                scales: {
                    y: { beginAtZero: false, min: 40, max: 120, ticks: { font: { size: 10 } } },
                    x: { ticks: { font: { size: 10 } } }
                }
            }
        });
    }

    // SpO2 Chart
    const spo2Ctx = document.getElementById('spo2Chart');
    if (spo2Ctx) {
        spo2Chart = new Chart(spo2Ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'SpO2 (%)',
                    data: [],
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: '#4caf50'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, labels: { font: { size: 12, weight: '500' } } }
                },
                scales: {
                    y: { beginAtZero: false, min: 90, max: 100, ticks: { font: { size: 10 } } },
                    x: { ticks: { font: { size: 10 } } }
                }
            }
        });
    }
}

function startTest() {
    // Validate demographics
    if (!selectedGender) {
        showNotification('Please select gender before starting the test', 'error');
        return;
    }

    patientAge = parseInt(document.getElementById('ageInput').value);
    if (!patientAge || patientAge < 1 || patientAge > 120) {
        showNotification('Please enter a valid age (1-120)', 'error');
        return;
    }

    // Store demographics in sessionStorage
    sessionStorage.setItem('patientDemographics', JSON.stringify({
        gender: selectedGender,
        age: patientAge
    }));

    testActive = true;
    packetCount = 0;
    elapsedTime = 0;

    // Initialize data tracking
    heartRateValues = [];
    spo2Values = [];
    temperatureValues = [];
    currentTestData = {
        startTime: new Date().toISOString(),
        endTime: null,
        measurements: []
    };

    // Hide demographics box
    const demographicsBox = document.querySelector('.demographics-box');
    if (demographicsBox) {
        demographicsBox.style.display = 'none';
    }

    // Hide start button, show stop button
    document.getElementById('startTestBtn').style.display = 'none';
    document.getElementById('stopTestBtn').style.display = 'inline-flex';

    // Hide next steps buttons
    document.getElementById('viewResultBtn').style.display = 'none';
    document.getElementById('newTestBtn').style.display = 'none';

    // Update status
    const statusText = document.getElementById('statusText');
    if (statusText) {
        statusText.textContent = 'Testing...';
    }
    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge) {
        statusBadge.classList.add('running');
    }

    // Reset charts

    if (hrChart) {
        hrChart.data.labels = [];
        hrChart.data.datasets[0].data = [];
        hrChart.update();
    }

    if (spo2Chart) {
        spo2Chart.data.labels = [];
        spo2Chart.data.datasets[0].data = [];
        spo2Chart.update();
    }
    
    // Reset progress
    document.getElementById('packetsReceived').textContent = '0';
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressPercent').textContent = '0%';
    document.getElementById('dataQuality').textContent = '--';
    
    // Reset progress stages
    document.querySelectorAll('.stage').forEach((stage, idx) => {
        stage.classList.remove('active');
        if (idx < 2) {
            const icon = stage.querySelector('i');
            if (icon) icon.className = 'fas fa-circle-check';
        } else if (idx === 2) {
            stage.classList.add('active');
        }
    });
    
    // Generate new test ID
    const newTestId = 'TEST-' + String(Math.floor(Math.random() * 100000)).padStart(5, '0');
    document.querySelector('.metric-value-large').textContent = newTestId;
    
    // Start elapsed time counter
    elapsedInterval = setInterval(updateElapsedTime, 1000);

    // Send demographics to server
    sendDemographicsToServer();

    // Simulate test progression
    simulateTestData();
}

// Send demographics to server
async function sendDemographicsToServer() {
    try {
        const serverURL = serverConfig ? serverConfig.getServerURL() : 'http://localhost:3000';
        const response = await fetch(`${serverURL}/api/start-test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                demographics: {
                    gender: selectedGender,
                    age: patientAge
                }
            })
        });

        if (response.ok) {
            console.log('✅ Demographics sent to server');
        }
    } catch (error) {
        // Silently ignore - server might be unavailable
        console.log('Demographics not sent (server unavailable)');
    }
}

function stopTest() {
    testActive = false;
    
    // Clear intervals
    if (elapsedInterval) {
        clearInterval(elapsedInterval);
    }
    
    // Hide stop button, show start button
    document.getElementById('startTestBtn').style.display = 'inline-flex';
    document.getElementById('stopTestBtn').style.display = 'none';
    
    // Update status
    const statusText = document.getElementById('statusText');
    if (statusText) {
        statusText.textContent = 'Stopped';
    }
    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge) {
        statusBadge.classList.remove('running');
        statusBadge.classList.add('complete');
    }
}

function updateElapsedTime() {
    elapsedTime++;
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('elapsedTime').textContent = timeStr;
}

function simulateTestData() {
    if (!testActive) return;
    
    // Simulate sensor data every 100ms
    const dataInterval = setInterval(() => {
        if (!testActive) {
            clearInterval(dataInterval);
            return;
        }
        
        // Generate realistic sensor data
        const heartRate = 65 + Math.random() * 25;
        const temperature = 36.5 + Math.random() * 1;
        const spo2 = 95 + Math.random() * 5;

        // Store values for averaging later
        heartRateValues.push(heartRate);
        spo2Values.push(spo2);
        temperatureValues.push(temperature);

        // Store measurement
        currentTestData.measurements.push({
            timestamp: new Date().toISOString(),
            heartRate: Math.floor(heartRate),
            spo2: spo2.toFixed(1),
            temperature: temperature.toFixed(1)
        });

        // Update metric cards
        document.getElementById('heartRate').textContent = Math.floor(heartRate);
        document.getElementById('temperature').textContent = temperature.toFixed(1);
        document.getElementById('spo2').textContent = spo2.toFixed(1);

        // Update metric bars (simulated percentages)
        document.getElementById('heartRateBar').style.width = (50 + Math.random() * 25) + '%';
        document.getElementById('temperatureBar').style.width = (60 + Math.random() * 25) + '%';
        document.getElementById('spo2Bar').style.width = (85 + Math.random() * 15) + '%';

        // Update charts periodically
        if (packetCount % 5 === 0) {
            const timeLabel = Math.floor(elapsedTime / 5) + 's';

            if (hrChart) {
                hrChart.data.labels.push(timeLabel);
                hrChart.data.datasets[0].data.push(Math.floor(heartRate));

                if (hrChart.data.labels.length > 25) {
                    hrChart.data.labels.shift();
                    hrChart.data.datasets[0].data.shift();
                }

                hrChart.update('none');
            }

            if (spo2Chart) {
                spo2Chart.data.labels.push(timeLabel);
                spo2Chart.data.datasets[0].data.push(spo2.toFixed(1));

                if (spo2Chart.data.labels.length > 25) {
                    spo2Chart.data.labels.shift();
                    spo2Chart.data.datasets[0].data.shift();
                }

                spo2Chart.update('none');
            }
        }
        
        // Update progress
        packetCount++;
        const percentage = Math.min(100, Math.round((packetCount / TOTAL_PACKETS) * 100));
        const dataQuality = Math.min(100, 75 + (percentage / 100) * 20);
        
        document.getElementById('packetsReceived').textContent = packetCount;
        document.getElementById('progressFill').style.width = percentage + '%';
        document.getElementById('progressPercent').textContent = percentage + '%';
        document.getElementById('dataQuality').textContent = Math.floor(dataQuality) + '%';
        
        // Update status text based on progress
        const statusText = document.getElementById('statusText');
        if (statusText) {
            if (percentage < 33) {
                statusText.textContent = 'Initializing... ' + percentage + '%';
            } else if (percentage < 66) {
                statusText.textContent = 'Collecting Data... ' + percentage + '%';
            } else if (percentage < 100) {
                statusText.textContent = 'Analyzing... ' + percentage + '%';
            }
        }
        
        // Update progress stages with visual feedback
        if (percentage > 0 && percentage <= 33) {
            document.querySelectorAll('.stage').forEach((stage, idx) => {
                stage.classList.remove('active');
                if (idx === 0) {
                    stage.classList.add('active');
                }
            });
        } else if (percentage > 33 && percentage <= 66) {
            document.querySelectorAll('.stage').forEach((stage, idx) => {
                stage.classList.remove('active');
                if (idx < 2) {
                    const icon = stage.querySelector('i');
                    if (icon) icon.className = 'fas fa-circle-check';
                }
                if (idx === 1) {
                    stage.classList.add('active');
                }
            });
        } else if (percentage > 66 && percentage < 100) {
            document.querySelectorAll('.stage').forEach((stage, idx) => {
                stage.classList.remove('active');
                if (idx < 3) {
                    const icon = stage.querySelector('i');
                    if (icon) icon.className = 'fas fa-circle-check';
                }
                if (idx === 2) {
                    stage.classList.add('active');
                }
            });
        }
        
        // Complete test when all packets received
        if (packetCount >= TOTAL_PACKETS) {
            clearInterval(dataInterval);
            completeTest();
        }
    }, 100);
}

function completeTest() {
    testActive = false;
    
    if (elapsedInterval) {
        clearInterval(elapsedInterval);
    }
    
    // Hide stop button, show start button
    document.getElementById('startTestBtn').style.display = 'inline-flex';
    document.getElementById('stopTestBtn').style.display = 'none';
    
    // Update status
    const statusText = document.getElementById('statusText');
    if (statusText) {
        statusText.textContent = 'Complete';
    }
    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge) {
        statusBadge.classList.remove('running');
        statusBadge.classList.add('complete');
    }
    
    // Update progress to 100%
    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('progressPercent').textContent = '100%';
    
    // Calculate test statistics
    calculateAndSaveTest();
    
    // Show completion buttons
    setTimeout(() => {
        document.getElementById('viewResultBtn').style.display = 'inline-flex';
        document.getElementById('newTestBtn').style.display = 'inline-flex';
        
        // Update final progress stage
        document.querySelectorAll('.stage').forEach((stage, idx) => {
            stage.classList.remove('active');
            const icon = stage.querySelector('i');
            if (icon) icon.className = 'fas fa-circle-check';
        });
    }, 500);
}

// Calculate averages and save test to backend
async function calculateAndSaveTest() {
    try {
        // Get current user
        const currentUser = authManager.getCurrentUser();
        console.log('📋 Current user:', currentUser);
        
        if (!currentUser || !currentUser.id) {
            console.error('❌ No user logged in or user ID missing');
            showNotification('Please log in before taking tests', 'error');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
            return;
        }

        console.log(`✅ Authenticated user ID: ${currentUser.id}`);

        // Calculate average values
        const avgHeartRate = Math.round(heartRateValues.reduce((a, b) => a + b, 0) / heartRateValues.length);
        const avgSpo2 = parseFloat((spo2Values.reduce((a, b) => a + b, 0) / spo2Values.length).toFixed(1));
        const avgTemperature = parseFloat((temperatureValues.reduce((a, b) => a + b, 0) / temperatureValues.length).toFixed(1));

        // Simulate creatinine based on age and gender
        const creatinine = simulateCreatinine(patientAge, selectedGender);

        // Calculate eGFR using MDRD equation
        const eGFR = calculateEGFR(creatinine, patientAge, selectedGender);

        // Determine kidney function stage and risk level
        const { stage, riskLevel, interpretation, recommendation } = getKidneyFunctionStage(eGFR);

        // Calculate data quality
        const dataQuality = Math.round((packetCount / TOTAL_PACKETS) * 100);

        // Prepare test result data
        const testResult = {
            userId: currentUser.id,
            eGFR: eGFR,
            creatinine: creatinine,
            heartRate: avgHeartRate,
            spo2: avgSpo2,
            temperature: avgTemperature,
            status: 'completed',
            stage: stage,
            riskLevel: riskLevel,
            confidence: dataQuality,
            interpretation: interpretation,
            recommendation: recommendation,
            report: generateReport(eGFR, stage, riskLevel, avgHeartRate, avgSpo2, avgTemperature, creatinine),
            packetCount: packetCount,
            dataQuality: dataQuality,
            gender: selectedGender,
            age: patientAge
        };
        
        console.log('📤 Sending test data to server:', testResult);

        // Save to backend (silently fails if server unavailable)
        try {
            const serverURL = typeof serverConfig !== 'undefined' && serverConfig.getServerURL ? 
                serverConfig.getServerURL() : 'http://localhost:3000';

            const response = await fetch(`${serverURL}/api/test-results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testResult)
            });

            const data = await response.json();
            console.log('📥 Server response:', data);
            console.log('📥 Response status:', response.status);

            if (data.success) {
                console.log('✅✅ Test result saved successfully:', data.testData);
                
                // Show success message
                showNotification('Test completed and saved successfully!', 'success');
                
                // Store test data in session for result page
                sessionStorage.setItem('latestTest', JSON.stringify(data.testData));
                
                // Update view results button
                document.getElementById('viewResultBtn').onclick = () => viewResults();
                
            } else {
                console.error('❌ Error saving test:', data.message);
                console.error('Server error code:', response.status);
                console.error('Full response:', data);
                // No error notification shown
            }
        } catch (fetchError) {
            // Silently fail - don't show error to user
            console.error('❌ Failed to save test to server:', fetchError);
        }

    } catch (error) {
        console.error('❌ Error in calculateAndSaveTest:', error);
        // Error notification removed - test will complete silently
    }
}

// Simulate creatinine value based on age and gender
function simulateCreatinine(age, gender) {
    // Base creatinine values
    let baseCreatinine = gender === 'male' ? 0.9 : 0.7;
    
    // Add age-dependent variation (increases with age)
    let ageAdjustment = (age - 20) * 0.002;
    
    // Add some randomness
    let randomVariation = (Math.random() - 0.5) * 0.2;
    
    let creatinine = baseCreatinine + ageAdjustment + randomVariation;
    return parseFloat(Math.max(0.4, creatinine).toFixed(2));
}

// Calculate eGFR using MDRD equation
function calculateEGFR(creatinine, age, gender) {
    // MDRD Equation: eGFR = 175 × (Scr)^-1.154 × (age)^-0.203 × (0.742 if female) × (1.212 if African American)
    let eGFR = 175 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203);
    
    if (gender === 'female') {
        eGFR = eGFR * 0.742;
    }
    
    return parseFloat(eGFR.toFixed(2));
}

// Determine kidney function stage based on eGFR
function getKidneyFunctionStage(eGFR) {
    let stage, riskLevel, interpretation, recommendation;

    if (eGFR >= 90) {
        stage = 'Stage 1';
        riskLevel = 'Normal';
        interpretation = 'Normal kidney function with no kidney damage';
        recommendation = 'Maintain healthy lifestyle and regular check-ups';
    } else if (eGFR >= 60) {
        stage = 'Stage 2';
        riskLevel = 'Low-Mild';
        interpretation = 'Mild decrease in kidney function with possible kidney damage';
        recommendation = 'Regular monitoring recommended';
    } else if (eGFR >= 45) {
        stage = 'Stage 3a';
        riskLevel = 'Mild-Moderate';
        interpretation = 'Mild to moderate decrease in kidney function';
        recommendation = 'Frequent monitoring and management of risk factors';
    } else if (eGFR >= 30) {
        stage = 'Stage 3b';
        riskLevel = 'Moderate';
        interpretation = 'Moderate decrease in kidney function';
        recommendation = 'Close medical supervision and treatment';
    } else if (eGFR >= 15) {
        stage = 'Stage 4';
        riskLevel = 'Severe';
        interpretation = 'Severe decrease in kidney function';
        recommendation = 'Immediate specialist consultation required';
    } else {
        stage = 'Stage 5';
        riskLevel = 'Critical';
        interpretation = 'Kidney failure requiring dialysis or transplant';
        recommendation = 'Emergency medical attention required';
    }

    return { stage, riskLevel, interpretation, recommendation };
}

// Generate detailed report
function generateReport(eGFR, stage, riskLevel, heartRate, spo2, temperature, creatinine) {
    return `
KIDNEY FUNCTION TEST REPORT
Generated: ${new Date().toLocaleString()}

OVERALL ASSESSMENT:
- Stage: ${stage}
- Risk Level: ${riskLevel}
- eGFR: ${eGFR} mL/min/1.73m²
- Creatinine: ${creatinine} mg/dL

VITAL MEASUREMENTS:
- Heart Rate: ${heartRate} BPM
- Oxygen Saturation: ${spo2}%
- Temperature: ${temperature}°C

INTERPRETATION:
Kidney function indicates ${stage} chronic kidney disease.
eGFR level of ${eGFR} suggests ${riskLevel} risk level.

RECOMMENDATIONS:
- Maintain regular monitoring
- Follow treatment plan as prescribed
- Maintain healthy lifestyle choices
- Keep scheduled follow-up appointments
- Report any unusual symptoms immediately

Note: This is an automated assessment based on simulated sensor data.
For medical decisions, consult with a qualified healthcare professional.
    `;
}

// Show notification with pastel red theme and OK button
function showNotification(message, type = 'info') {
    let toast = document.getElementById('toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    // Add icon based on type
    let icon = '';
    if (type === 'success') icon = '✓ ';
    if (type === 'error') icon = '✗ ';
    if (type === 'warning') icon = '⚠ ';
    
    // Create toast content with message and OK button
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 20px; justify-content: space-between; min-width: 400px;">
            <span>${icon}${message}</span>
            <button id="toastOkBtn" style="
                background: white;
                color: #ff6b6b;
                border: 2px solid white;
                padding: 8px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.95rem;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255, 255, 255, 0.9)'" onmouseout="this.style.background='white'" onclick="document.getElementById('toast').classList.remove('show');">
                OK
            </button>
        </div>
    `;
    
    toast.className = `toast show ${type}`;
    toast.style.fontSize = '1.1rem';
    toast.style.fontWeight = '600';
    
    // Auto-hide after 6 seconds if not clicked
    setTimeout(() => {
        if (toast.classList.contains('show')) {
            toast.classList.remove('show');
        }
    }, 6000);
}

// Create toast notification element
function createToasting() {
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
    return toast;
}

function viewResults() {
    window.location.href = 'result.html?view=latest';
}

function startNewTest() {
    // Reset data arrays
    heartRateValues = [];
    spo2Values = [];
    temperatureValues = [];
    currentTestData = {
        startTime: null,
        endTime: null,
        measurements: []
    };

    // Clear chart data
    if (hrChart) {
        hrChart.data.labels = [];
        hrChart.data.datasets[0].data = [];
        hrChart.update('none');
    }
    if (spo2Chart) {
        spo2Chart.data.labels = [];
        spo2Chart.data.datasets[0].data = [];
        spo2Chart.update('none');
    }

    // Show demographics box again
    const demographicsBox = document.querySelector('.demographics-box');
    if (demographicsBox) {
        demographicsBox.style.display = 'block';
    }

    // Reset UI
    document.getElementById('startTestBtn').style.display = 'inline-flex';
    document.getElementById('viewResultBtn').style.display = 'none';
    document.getElementById('newTestBtn').style.display = 'none';

    startTest();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initLiveTest);
