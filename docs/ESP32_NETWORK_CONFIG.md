# ESP32 Hardware Device Configuration Guide

This guide shows how to configure your ESP32 device to send sensor data to the website server running on a network IP address.

## Getting the Server IP

When you start the website server, it displays the network IP:

```
========================================
Server running on http://192.168.x.x:3000
WebSocket server running on ws://192.168.x.x:3000
Local: http://localhost:3000
ML API: http://192.168.x.x:5000
========================================
```

**Use the IP address shown** (e.g., `192.168.1.100`)

## ESP32 Configuration

### Step 1: Open the ESP32 Sketch

Edit `ESP32_WiFi_Sketch.ino` and find the configuration section.

### Step 2: Set Network IP Address

Replace `localhost` with the actual IP address from server output:

```cpp
// ============= CONFIGURATION =============

// WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Website Server Configuration
const char* serverIP = "192.168.1.100";      // ← Set to your server IP
const int serverPort = 3000;
const char* serverEndpoint = "/api/sensor-data";

// ML API Configuration (if needed)
const char* mlApiIP = "192.168.1.100";       // ← Or different IP if on separate machine
const int mlApiPort = 5000;
const char* mlApiEndpoint = "/api/predict";

// ========================================
```

### Step 3: Example Configuration

#### Example 1: Website and ML on Same Machine
```cpp
const char* serverIP = "192.168.1.100";
const int serverPort = 3000;

const char* mlApiIP = "192.168.1.100";       // Same as server
const int mlApiPort = 5000;
```

#### Example 2: Website and ML on Different Machines
```cpp
const char* serverIP = "192.168.1.100";      // Website server
const int serverPort = 3000;

const char* mlApiIP = "192.168.1.101";       // ML API server
const int mlApiPort = 5000;
```

## Testing Connectivity

### Test 1: WiFi Connection
The ESP32 should print:
```
Connecting to WiFi...
Connected! IP address: 192.168.x.x
```

### Test 2: Server Connectivity
The ESP32 should successfully POST to:
```
http://192.168.1.100:3000/api/sensor-data
```

The website server should show:
```
Received sensor data: { bioimpedance: {...}, ... }
```

### Test 3: Data in Website

1. Open `http://192.168.1.100:3000`
2. Go to "Live Test"
3. Click "Start Test"
4. Sensor data should appear if ESP32 is sending

## Sensor Data Format

The ESP32 sends data in this format:

```json
{
  "bioimpedance": {
    "1khz": 400,
    "10khz": 370,
    "100khz": 330,
    "200khz": 300
  },
  "optical": {
    "red": 650,
    "ir": 950,
    "green": 520
  },
  "temperature": 36.8,
  "heartRate": 72,
  "motion": 25,
  "pressure": 101.3,
  "battery": 85
}
```

## Network Requirements

✅ **Same WiFi Network** - ESP32 and server must be on same network  
✅ **IP Address Known** - Know your server's IP address  
✅ **Port 3000 Open** - Firewall must allow traffic on port 3000  
✅ **Stable Connection** - WiFi should be stable  

## Troubleshooting

### ESP32 Cannot Connect to WiFi
```cpp
// Check WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";        // Verify exact spelling
const char* password = "YOUR_WIFI_PASSWORD"; // Verify exact password
```

### ESP32 Cannot Reach Server
```cpp
// Verify server IP address (check server output)
const char* serverIP = "192.168.1.100";

// Or try using server hostname if DHCP has it
const char* serverIP = "kidney-monitor.local";  // If available
```

### Data Not Appearing in Website
1. Check server shows "Received sensor data" message
2. Verify ESP32 is connected to WiFi
3. Check firewall allows port 3000
4. Restart ESP32 and try again

### HTTP POST Fails
```cpp
// Add error handling to see what's wrong
if (http.POST("{...}") != 200) {
    Serial.println("POST failed!");
    Serial.println("Error: " + String(http.errorToString(http.getLastError())));
}
```

## Advanced Configuration

### Using Hostname Instead of IP

If your network supports mDNS:
```cpp
// Try this instead of IP address
const char* serverIP = "kidney-monitor.local";
```

### Dynamic IP Discovery

For ESP32 to find server automatically (requires server to broadcast):
```cpp
// Implement mDNS discovery
#include <ESPmDNS.h>

const char* serverHostname = "kidney-monitor";
IPAddress serverAddr = MDNS.queryHost(serverHostname);
```

### Retry Logic

Add retry logic for network failures:
```cpp
int retries = 3;
while (retries > 0 && http.POST(payload) != 200) {
    delay(1000);
    retries--;
}
```

## LED Indicators (Optional)

Add visual feedback:

```cpp
const int LED_WIFI = 4;      // LED for WiFi
const int LED_SERVER = 5;    // LED for server connection

void setup() {
    pinMode(LED_WIFI, OUTPUT);
    pinMode(LED_SERVER, OUTPUT);
}

void loop() {
    // WiFi connected
    digitalWrite(LED_WIFI, WiFi.status() == WL_CONNECTED ? HIGH : LOW);
    
    // Server connected
    digitalWrite(LED_SERVER, serverConnected ? HIGH : LOW);
}
```

## Serial Monitor Output

Successful startup should show:
```
Starting Smart Kidney Monitoring System...
WiFi SSID: MyNetwork
Connecting to WiFi...
Connected! IP address: 192.168.1.105

Server Configuration:
  Server IP: 192.168.1.100
  Server Port: 3000
  ML API IP: 192.168.1.100
  ML API Port: 5000

Starting sensor data collection...
Sending data to: http://192.168.1.100:3000/api/sensor-data
```

## Integration Checklist

- [ ] Found server IP from startup output
- [ ] Updated ESP32 sketch with correct IP
- [ ] Set WiFi SSID and password
- [ ] Compiled and uploaded sketch
- [ ] ESP32 connected to WiFi
- [ ] Server shows "Received sensor data"
- [ ] Data appears in website Live Test
- [ ] Hardware icon shows in top navigation

## Debugging Commands

### Check WiFi Connection
```cpp
Serial.println(WiFi.status());    // 3 = connected
Serial.println(WiFi.localIP());   // Shows ESP32's IP
Serial.println(WiFi.RSSI());      // Signal strength
```

### Check HTTP Response
```cpp
http.begin("http://192.168.1.100:3000/api/sensor-data");
int httpCode = http.POST(payload);
Serial.println("HTTP Code: " + String(httpCode));
Serial.println("Response: " + http.getString());
```

### Verify Server IP Reachability
```cpp
if (Ping.ping("192.168.1.100")) {
    Serial.println("Server is reachable!");
} else {
    Serial.println("Cannot reach server!");
}
```

## File Reference

- `ESP32_WiFi_Sketch.ino` - Main ESP32 firmware
- `server.js` - Website server (sends data)
- `public/js/live-test.js` - Displays sensor data

## See Also

- [NETWORK_SETUP_QUICK.md](NETWORK_SETUP_QUICK.md) - Quick setup guide
- [IP_ADDRESS_SETUP.md](IP_ADDRESS_SETUP.md) - Full documentation
- [README.md](README.md) - General project info

---

**ESP32 is now configured to work with the website on network IP!**
