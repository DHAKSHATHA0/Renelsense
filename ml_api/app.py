from flask import Flask, request, jsonify
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

app = Flask(__name__)

# Global model variable
model = None

# Load or create a model
def load_or_create_model():
    global model
    model_path = 'egfr_model.pkl'
    
    if os.path.exists(model_path):
        # Load existing model
        model = joblib.load(model_path)
        print("Model loaded successfully")
    else:
        # Create and train a simple model for demonstration
        print("Creating demonstration model...")
        create_demo_model()
        
def create_demo_model():
    global model
    # Create a simple Random Forest model for demonstration
    # In a real scenario, this would be trained on actual kidney function data

    # Generate synthetic training data
    np.random.seed(42)
    n_samples = 1000

    # Features: heart_rate, temperature, spo2, age, gender (5 features)
    X = np.random.rand(n_samples, 5)
    X[:, 0] = X[:, 0] * 100 + 50   # heart rate (50-150 bpm)
    X[:, 1] = X[:, 1] * 5 + 35     # temperature (35-40 Celsius)
    X[:, 2] = X[:, 2] * 10 + 90    # SpO2 (90-100%)
    X[:, 3] = X[:, 3] * 80 + 20    # age (20-100 years)
    X[:, 4] = np.random.randint(0, 2, n_samples)  # gender (0=male, 1=female)

    # Target: eGFR values (5-120 mL/min/1.73m²)
    # Create a realistic relationship between features and eGFR
    y = (
        120 -
        (X[:, 0] - 75) * 0.3 -   # Higher heart rate correlates with lower eGFR
        (X[:, 1] - 37) * 5 -     # Higher temperature correlates with lower eGFR
        (100 - X[:, 2]) * 2 -    # Lower SpO2 correlates with lower eGFR
        (X[:, 3] - 50) * 0.5 -   # Older age correlates with lower eGFR
        X[:, 4] * 5 +            # Gender adjustment (females typically have slightly lower eGFR)
        np.random.normal(0, 5, n_samples)  # Add some noise
    )

    # Ensure eGFR values are within realistic range
    y = np.clip(y, 5, 120)

    # Train the model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    # Save the model
    joblib.dump(model, 'egfr_model.pkl')
    print("Demonstration model created and saved with new features: HR, Temp, SpO2, Age, Gender")

# Health check endpoint
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "eGFR Prediction API",
        "version": "1.0.0"
    })

# Prediction endpoint
@app.route('/predict', methods=['POST'])
def predict_egfr():
    global model

    try:
        # Get the JSON data from the request
        data = request.get_json()

        # Validate required fields
        required_fields = ['heart_rate', 'temperature', 'spo2', 'age', 'gender']

        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing required field: {field}"
                }), 400

        # Convert gender to numeric (male=0, female=1)
        gender_numeric = 1 if data['gender'].lower() == 'female' else 0

        # Extract features
        features = np.array([[
            float(data['heart_rate']),
            float(data['temperature']),
            float(data['spo2']),
            float(data['age']),
            float(gender_numeric)
        ]])
        
        # Make prediction
        predicted_egfr = model.predict(features)[0]
        
        # Determine kidney status based on eGFR
        if predicted_egfr >= 90:
            kidney_status = "Normal"
            risk_level = "Low"
        elif predicted_egfr >= 60:
            kidney_status = "Mildly Reduced"
            risk_level = "Low"
        elif predicted_egfr >= 30:
            kidney_status = "Moderately Reduced"
            risk_level = "Medium"
        elif predicted_egfr >= 15:
            kidney_status = "Severely Reduced"
            risk_level = "High"
        else:
            kidney_status = "Kidney Failure"
            risk_level = "Very High"
        
        # Confidence score (simplified for demo)
        confidence_score = 92.5  # In a real model, this would be calculated properly
        
        # Return prediction results
        return jsonify({
            "success": True,
            "prediction": {
                "egfr": round(predicted_egfr, 2),
                "kidney_status": kidney_status,
                "confidence_score": confidence_score,
                "risk_level": risk_level
            },
            "recommendations": {
                "primary": get_primary_recommendation(kidney_status),
                "secondary": get_secondary_recommendations(kidney_status),
                "next_test_schedule": get_next_test_schedule(kidney_status)
            }
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Prediction failed: {str(e)}"
        }), 500

def get_primary_recommendation(kidney_status):
    recommendations = {
        "Normal": "Continue with regular monitoring. Maintain healthy hydration levels and follow prescribed medication regimen.",
        "Mildly Reduced": "Monitor kidney function regularly. Consider dietary modifications to reduce sodium intake.",
        "Moderately Reduced": "Consult with a nephrologist. Implement stricter dietary controls and monitor blood pressure closely.",
        "Severely Reduced": "Immediate consultation with a nephrologist required. Prepare for potential dialysis planning.",
        "Kidney Failure": "Emergency consultation with a nephrologist. Dialysis or transplant evaluation needed immediately."
    }
    return recommendations.get(kidney_status, "Consult with a healthcare professional for personalized advice.")

def get_secondary_recommendations(kidney_status):
    base_recommendations = [
        "Maintain blood pressure below 130/80 mmHg",
        "Follow a low-phosphorus diet",
        "Stay adequately hydrated",
        "Avoid NSAIDs (ibuprofen, naproxen)",
        "Exercise regularly as tolerated"
    ]
    
    if kidney_status in ["Moderately Reduced", "Severely Reduced", "Kidney Failure"]:
        base_recommendations.extend([
            "Limit protein intake as advised by dietitian",
            "Monitor potassium levels",
            "Take prescribed phosphate binders with meals"
        ])
    
    if kidney_status == "Kidney Failure":
        base_recommendations.extend([
            "Prepare for renal replacement therapy",
            "Consider vascular access placement",
            "Review medications with pharmacist"
        ])
    
    return base_recommendations

def get_next_test_schedule(kidney_status):
    schedules = {
        "Normal": "12 months",
        "Mildly Reduced": "6 months",
        "Moderately Reduced": "3 months",
        "Severely Reduced": "1 month",
        "Kidney Failure": "Immediate specialist consultation"
    }
    return schedules.get(kidney_status, "3 months")

# Endpoint to retrain the model (for demonstration)
@app.route('/retrain', methods=['POST'])
def retrain_model():
    try:
        create_demo_model()
        return jsonify({
            "success": True,
            "message": "Model retrained successfully"
        })
    except Exception as e:
        return jsonify({
            "error": f"Retraining failed: {str(e)}"
        }), 500

if __name__ == '__main__':
    # Load or create the model when the app starts
    load_or_create_model()
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)