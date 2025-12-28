/*
 * Smart Kidney Monitoring System - ESP32 WiFi Configuration
 * 
 * This sketch demonstrates how to connect an ESP32 to the WiFi network
 * and send sensor data to the Node.js server.
 * 
 * Prerequisites:
 * - ESP32 development board
 * - Arduino IDE with ESP32 support installed
 * - Required libraries: WiFi.h, HTTPClient.h
 * 
 * Configuration:
 * - Update SERVER_IP with the IP address from the WiFi setup page
 * - Update WIFI_SSID and WIFI_PASSWORD with your network credentials
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ============================================
// NETWORK CONFIGURATION - IMPORTANT!
// Update these values for your network
// ============================================

// WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";        // Your WiFi network name
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // Your WiFi password

// Server Configuration
// Get the SERVER_IP from the WiFi Setup Page (http://localhost:3000/wifi-setup)
const char* SERVER_IP = "192.168.1.100";         // Replace with your server IP
const int SERVER_PORT = 3000;

// API Endpoints
String SENSOR_DATA_URL = "http://" + String(SERVER_IP) + ":" + String(SERVER_PORT) + "/api/sensor-data";

// ============================================
// SENSOR SIMULATION CONFIGURATION
// ============================================

// In a real application, these would be read from actual sensors
// For demo purposes, we simulate realistic biomedical data

struct SensorData {
    // Bioimpedance measurements (in Ohms)
    float bio_1khz;
    float bio_10khz;
    float bio_100khz;
    float bio_200khz;
    
    // Optical signals
    float optical_red;
    float optical_ir;
    float optical_green;
    
    // Vital Signs
    float temperature;  // Celsius
    float heart_rate;   // BPM
    float motion;       // mg
    float pressure;     // kPa
};

// Global variables
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 1000; // Send data every 1 second
int packet_count = 0;

void setup() {
    // Initialize serial communication
    Serial.begin(115200);
    delay(100);
    
    Serial.println("\n\n========================================");
    Serial.println("Smart Kidney Monitoring System");
    Serial.println("ESP32 WiFi Configuration");
    Serial.println("========================================\n");
    
    // Display configuration
    Serial.println("Configuration:");
    Serial.print("  WiFi SSID: ");
    Serial.println(WIFI_SSID);
    Serial.print("  Server IP: ");
    Serial.println(SERVER_IP);
    Serial.print("  Server Port: ");
    Serial.println(SERVER_PORT);
    Serial.print("  API URL: ");
    Serial.println(SENSOR_DATA_URL);
    Serial.println();
    
    // Connect to WiFi
    connectToWiFi();
}

void loop() {
    // Check if device is still connected to WiFi
    if (WiFi.status() == WL_CONNECTED) {
        // Check if it's time to send data
        unsigned long currentTime = millis();
        if (currentTime - lastSendTime >= SEND_INTERVAL) {
            lastSendTime = currentTime;
            
            // Generate simulated sensor data
            SensorData sensorData = generateSensorData();
            
            // Send data to server
            sendSensorData(sensorData);
            
            packet_count++;
        }
    } else {
        // Try to reconnect if WiFi is disconnected
        Serial.println("WiFi disconnected. Attempting to reconnect...");
        connectToWiFi();
    }
    
    delay(100);
}

/*
 * Connect to WiFi network
 */
void connectToWiFi() {
    Serial.print("Connecting to WiFi: ");
    Serial.println(WIFI_SSID);
    
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    int attempts = 0;
    const int MAX_ATTEMPTS = 20;
    
    while (WiFi.status() != WL_CONNECTED && attempts < MAX_ATTEMPTS) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    Serial.println();
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("WiFi connected successfully!");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
        Serial.print("Signal Strength: ");
        Serial.print(WiFi.RSSI());
        Serial.println(" dBm");
    } else {
        Serial.println("Failed to connect to WiFi");
        Serial.println("Please check:");
        Serial.println("  1. WIFI_SSID is correct");
        Serial.println("  2. WIFI_PASSWORD is correct");
        Serial.println("  3. WiFi network is active");
    }
    Serial.println();
}

/*
 * Generate simulated sensor data
 * In a real application, replace this with actual sensor readings
 */
SensorData generateSensorData() {
    SensorData data;
    
    // Simulate realistic bioimpedance values (in Ohms)
    data.bio_1khz = 400 + random(-50, 50);      // 350-450 Ω
    data.bio_10khz = 370 + random(-50, 50);     // 320-420 Ω
    data.bio_100khz = 330 + random(-50, 50);    // 280-380 Ω
    data.bio_200khz = 300 + random(-50, 50);    // 250-350 Ω
    
    // Simulate optical signals
    data.optical_red = 650 + random(-100, 100);     // 550-750 mV
    data.optical_ir = 940 + random(-100, 100);      // 840-1040 mV
    data.optical_green = 520 + random(-50, 50);     // 470-570 mV
    
    // Simulate vital signs with realistic ranges
    data.temperature = 36.5 + (random(0, 30) / 100.0);  // 36.5-37.0°C
    data.heart_rate = 60 + random(0, 40);               // 60-100 BPM
    data.motion = random(0, 50);                         // 0-50 mg
    data.pressure = 100 + (random(0, 30) / 10.0);        // 100-103 kPa
    
    return data;
}

/*
 * Send sensor data to the server
 */
void sendSensorData(SensorData data) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi not connected. Skipping data send.");
        return;
    }
    
    HTTPClient http;
    
    // Create JSON payload
    StaticJsonDocument<256> jsonDoc;
    
    jsonDoc["bioimpedance"]["1khz"] = data.bio_1khz;
    jsonDoc["bioimpedance"]["10khz"] = data.bio_10khz;
    jsonDoc["bioimpedance"]["100khz"] = data.bio_100khz;
    jsonDoc["bioimpedance"]["200khz"] = data.bio_200khz;
    
    jsonDoc["optical"]["red"] = data.optical_red;
    jsonDoc["optical"]["ir"] = data.optical_ir;
    jsonDoc["optical"]["green"] = data.optical_green;
    
    jsonDoc["temperature"] = data.temperature;
    jsonDoc["heartRate"] = data.heart_rate;
    jsonDoc["motion"] = data.motion;
    jsonDoc["pressure"] = data.pressure;
    jsonDoc["battery"] = 85; // Simulated battery percentage
    
    String jsonString;
    serializeJson(jsonDoc, jsonString);
    
    // Send POST request
    http.begin(SENSOR_DATA_URL);
    http.addHeader("Content-Type", "application/json");
    
    int httpResponseCode = http.POST(jsonString);
    
    // Log the response
    if (httpResponseCode == 200) {
        Serial.print("[");
        Serial.print(packet_count);
        Serial.print("] Data sent successfully. ");
        Serial.print("HR: ");
        Serial.print(data.heart_rate);
        Serial.print(" BPM, Temp: ");
        Serial.print(data.temperature);
        Serial.println("°C");
    } else {
        Serial.print("Failed to send data. HTTP Code: ");
        Serial.println(httpResponseCode);
        
        if (httpResponseCode == -1) {
            Serial.println("Connection refused. Check if server is running:");
            Serial.print("  http://");
            Serial.print(SERVER_IP);
            Serial.print(":");
            Serial.println(SERVER_PORT);
        }
    }
    
    http.end();
}

/*
 * Debugging helper: Print sensor data
 */
void printSensorData(SensorData data) {
    Serial.println("=== Sensor Data ===");
    Serial.print("Bioimpedance (1kHz): ");
    Serial.print(data.bio_1khz);
    Serial.println(" Ω");
    Serial.print("Heart Rate: ");
    Serial.print(data.heart_rate);
    Serial.println(" BPM");
    Serial.print("Temperature: ");
    Serial.print(data.temperature);
    Serial.println("°C");
    Serial.println();
}

/*
 * Configuration Checklist
 * 
 * Before uploading this sketch:
 * 
 * [ ] Update WIFI_SSID with your WiFi network name
 * [ ] Update WIFI_PASSWORD with your WiFi password
 * [ ] Update SERVER_IP with the IP from http://localhost:3000/wifi-setup
 * [ ] Make sure Node.js server is running on the server machine
 * [ ] Ensure ESP32 and server are on the same WiFi network
 * [ ] Open Serial Monitor (115200 baud) to see connection status
 * 
 * Troubleshooting:
 * 
 * - If WiFi connection fails: Check SSID and password
 * - If server connection fails: Verify SERVER_IP is correct
 * - If no data appears on dashboard: Check firewall settings
 * - For detailed logs: Uncomment serial print statements
 */
