// Live Test Page JavaScript - Real-Time Medical Monitoring

let hrChart, spo2Chart;
let testActive = false;
let packetCount = 0;
const TOTAL_PACKETS = 180;
let elapsedTime = 0;
let elapsedInterval = null;
let selectedGender = null;
let patientAge = null;

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
        alert('Please select gender before starting the test');
        return;
    }

    patientAge = parseInt(document.getElementById('ageInput').value);
    if (!patientAge || patientAge < 1 || patientAge > 120) {
        alert('Please enter a valid age (1-120)');
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
        console.error('Error sending demographics:', error);
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
        
        // Update progress stages
        if (percentage > 33 && percentage <= 66) {
            document.querySelectorAll('.stage').forEach((stage, idx) => {
                stage.classList.remove('active');
                if (idx < 3) {
                    const icon = stage.querySelector('i');
                    if (icon && idx < 2) icon.className = 'fas fa-circle-check';
                }
                if (idx === 3) {
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

function generateMockMLResults() {
    const demographics = JSON.parse(sessionStorage.getItem('patientDemographics') || '{"gender":"male","age":35}');
    const age = demographics.age || 35;
    // Age-adjusted eGFR mock: younger = higher eGFR
    const baseEGFR = Math.max(30, 110 - (age * 0.3) + (Math.random() * 20 - 10));
    const eGFR = parseFloat(baseEGFR.toFixed(1));
    const heartRate = Math.floor(62 + Math.random() * 20);
    const temperature = parseFloat((36.4 + Math.random() * 0.8).toFixed(1));
    const spo2 = parseFloat((96 + Math.random() * 3).toFixed(1));
    const creatinine = parseFloat((0.6 + Math.random() * 0.8).toFixed(2));
    const ureaLevel = parseFloat((10 + Math.random() * 12).toFixed(1));
    const potassium = parseFloat((3.5 + Math.random() * 1.2).toFixed(1));
    const confidence = parseFloat((88 + Math.random() * 11).toFixed(1));
    const dataQualityVal = parseFloat((90 + Math.random() * 9).toFixed(1));

    let riskLevel, status, stage;
    if (eGFR >= 90) { riskLevel = 'Low'; status = 'Normal Function'; stage = 'Stage 1 - Normal'; }
    else if (eGFR >= 60) { riskLevel = 'Low'; status = 'Mildly Reduced'; stage = 'Stage 2 - Mild'; }
    else if (eGFR >= 45) { riskLevel = 'Medium'; status = 'Mild-Moderate Reduction'; stage = 'Stage 3a'; }
    else if (eGFR >= 30) { riskLevel = 'High'; status = 'Moderate-Severe Reduction'; stage = 'Stage 3b'; }
    else { riskLevel = 'Critical'; status = 'Severe Reduction'; stage = 'Stage 4-5'; }

    const testId = 'TEST-' + String(Math.floor(Math.random() * 100000)).padStart(5, '0');
    const now = new Date();

    return {
        testId,
        timestamp: now.toISOString(),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        eGFR, heartRate, temperature, spo2,
        creatinine, ureaLevel, potassium,
        confidence, quality: dataQualityVal,
        riskLevel, status, stage,
        gender: demographics.gender,
        age
    };
}

async function saveTestResultsToDB(results) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;

        const serverURL = (typeof serverConfig !== 'undefined') ? serverConfig.getAPIURL() : window.location.origin;

        await fetch(`${serverURL}/api/tests/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                testData: {
                    type: 'kidney_function',
                    gender: results.gender,
                    age: results.age,
                    parameters: { spo2: results.spo2, creatinine: results.creatinine }
                },
                resultsData: {
                    eGFR: results.eGFR,
                    creatinine: results.creatinine,
                    ureaLevel: results.ureaLevel,
                    potassium: results.potassium,
                    heartRate: results.heartRate,
                    spo2: results.spo2,
                    temperature: results.temperature,
                    analysis: results.status,
                    riskLevel: results.riskLevel
                }
            })
        });
        console.log('✅ Test results saved to DB');
    } catch (err) {
        console.error('Failed to save test to DB:', err);
    }
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
    if (statusText) statusText.textContent = 'Complete';
    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge) {
        statusBadge.classList.remove('running');
        statusBadge.classList.add('complete');
    }
    
    // Update progress to 100%
    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('progressPercent').textContent = '100%';

    // Generate mock ML results and persist
    const mlResults = generateMockMLResults();
    sessionStorage.setItem('lastTestResults', JSON.stringify(mlResults));
    sessionStorage.setItem('patientResults', JSON.stringify(mlResults));
    saveTestResultsToDB(mlResults);
    
    // Show completion buttons
    setTimeout(() => {
        document.getElementById('viewResultBtn').style.display = 'inline-flex';
        document.getElementById('newTestBtn').style.display = 'inline-flex';
        
        // Update final progress stage
        document.querySelectorAll('.stage').forEach((stage) => {
            stage.classList.remove('active');
            const icon = stage.querySelector('i');
            if (icon) icon.className = 'fas fa-circle-check';
        });
    }, 500);
}

function viewResults() {
    window.location.href = 'result.html';
}

function startNewTest() {
    startTest();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initLiveTest);
