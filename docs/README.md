# Smart Kidney Function Monitoring System

A real-time medical dashboard for kidney function monitoring using AI predictions.

## Project Overview

This system continuously monitors physiological signals using a smart sensor device and predicts kidney function using machine learning. The dashboard displays real-time sensor data, test progress, and ML-based eGFR predictions in a clean, medical-grade user interface.

## Features

- Real-time sensor data visualization
- Live test progress tracking
- ML-powered eGFR predictions
- Comprehensive test history
- Detailed clinical reports
- Responsive medical-themed UI

## Tech Stack

### Frontend
- HTML5
- CSS3 (no frameworks)
- Vanilla JavaScript
- Chart.js for data visualization
- WebSocket client for real-time updates

### Backend
- Node.js + Express
- WebSocket server
- REST API endpoints

### Machine Learning (To be integrated later)
- Python Flask API
- Scikit-learn for eGFR prediction
- Feature engineering and data aggregation

## Project Structure

```
├── public/                 # Frontend files
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript files
│   ├── images/             # Image assets
│   ├── index.html          # Home page
│   ├── live-test.html      # Live test dashboard
│   ├── history.html        # Test history
│   ├── report.html         # Detailed report
│   └── about.html          # About page
├── utils/                  # Utility modules
├── ml_api/                 # ML API (Python Flask) (To be integrated later)
│   ├── app.py              # Flask application
│   └── requirements.txt    # Python dependencies
├── server.js               # Node.js backend server
├── package.json            # Node.js dependencies
└── README.md              # Project documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm (comes with Node.js)

### Installation

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Install Python dependencies for ML API (when ready):**
   ```bash
   cd ml_api
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the Node.js backend server:**
   ```bash
   npm start
   ```
   The server will run on http://localhost:3000

2. **Start the Python ML API (when ready):**
   ```bash
   cd ml_api
   python app.py
   ```
   The ML API will run on http://localhost:5000

3. **Access the application:**
   Open your browser and navigate to http://localhost:3000

## API Endpoints

### Node.js Backend (Port 3000)
- `GET /` - Serve the main page
- `POST /api/sensor-data` - Receive sensor data from ESP32
- `POST /api/start-test` - Start a new test
- `POST /api/stop-test` - Stop the current test
- WebSocket endpoint: `ws://localhost:3000` - Real-time communication

### Python ML API (Port 5000)
- `GET /` - Health check
- `POST /predict` - Get eGFR prediction based on sensor data
- `POST /retrain` - Retrain the ML model (demo purposes)

## Hardware Integration

The system is designed to work with an ESP32 microcontroller equipped with:
- Bioimpedance sensors (1kHz, 10kHz, 100kHz, 200kHz)
- Optical sensors (Red, IR, Green)
- Temperature sensor
- Heart rate monitor
- Motion sensor
- Pressure sensor
- Battery level monitor

## WebSocket Message Types

The frontend and backend communicate via WebSocket using these message types:

- `sensor_update` - Real-time sensor data
- `test_progress` - Test progress information
- `test_started` - Test initiation signal
- `test_completed` - Test completion with ML results
- `test_stopped` - Test termination signal

## Development

To modify the application:

1. Edit HTML files in the `public/` directory for frontend changes
2. Modify `server.js` for backend logic
3. Update `ml_api/app.py` for ML model changes
4. Adjust styles in `public/css/style.css`

## Deployment

For deployment to a local network:

1. Find your machine's IP address
2. Update the WebSocket URLs in the JavaScript files to use your IP
3. Configure your firewall to allow traffic on ports 3000 and 5000
4. Connect the ESP32 to the same network and configure it to send data to your IP

## License

This project is developed for educational and demonstration purposes.

## Acknowledgments

- Developed for HealthTech Innovation Challenge 2023
- Uses Chart.js for data visualization
- Implements scikit-learn for machine learning predictions