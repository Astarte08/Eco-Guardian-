from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

# Verify the API key is loaded before starting the app
API_KEY = os.getenv("OPENAI_API_KEY")
print(f"API Key loaded: {bool(API_KEY)}")  # Should print True if key loaded

app = Flask(__name__)
CORS(app)

# Initialize client with verification
try:
    client = OpenAI(api_key=API_KEY)
    print("OpenAI client initialized successfully")
except Exception as e:
    print(f"OpenAI client initialization failed: {str(e)}")
    client = None

@app.route('/api/predictions', methods=['POST'])
def get_predictions():
    try:
        # Verify API key
        if not os.getenv("OPENAI_API_KEY"):
            return jsonify({"error": "API key missing"}), 500
            
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            response_format={ "type": "json_object" },  # NEW: Force JSON output
            messages=[
                {
                    "role": "system", 
                    "content": """You MUST return valid JSON with: 
                    {
                        "aqi": [array of 5 numbers 0-300],
                        "water": "text description", 
                        "chart": [array of 5 numbers]
                    }"""
                },
                {"role": "user", "content": "Generate environmental data"}
            ],
            temperature=0.3  # Lower for more consistent results
        )
        
        content = json.loads(response.choices[0].message.content)
        return jsonify(content)
        
    except Exception as e:
        print(f"API Error: {str(e)}")
        return jsonify({
            "error": "AI Service Temporarily Unavailable",
            "fallback": {  # Provide default data if API fails
                "aqi": [45, 50, 55, 48, 52],
                "water": "Moderate purity - 7.2pH",
                "chart": [45, 50, 55, 48, 52]
            }
        }), 200