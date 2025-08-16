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
        
@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    try:
        data = request.get_json()
        transport = data.get('transport', '')
        diet = data.get('diet', '')

        # Simple rule-based suggestions (replace with OpenAI if desired)
        suggestions = []
        if transport == 'car':
            suggestions.append("Try carpooling or using public transport twice a week.")
            suggestions.append("Consider switching to an electric vehicle.")
        elif transport == 'electric':
            suggestions.append("Charge your vehicle during off-peak hours.")
            suggestions.append("Use renewable energy sources if possible.")
        elif transport == 'public':
            suggestions.append("Combine trips to reduce frequency.")
            suggestions.append("Walk or bike for short distances.")
        elif transport == 'bike':
            suggestions.append("Maintain your bike regularly for efficiency.")
            suggestions.append("Encourage others to bike or walk.")

        if diet == 'meat-heavy':
            suggestions.append("Try 'Meatless Mondays' to reduce your carbon footprint.")
            suggestions.append("Incorporate more plant-based meals.")
        elif diet == 'balanced':
            suggestions.append("Increase your intake of plant-based foods.")
        elif diet == 'vegetarian':
            suggestions.append("Explore vegan options for even lower impact.")
        elif diet == 'vegan':
            suggestions.append("Great job! Consider sharing your recipes with friends.")

        if not suggestions:
            suggestions.append("You're already making eco-friendly choices!")

        return jsonify({"suggestions": suggestions})
    except Exception as e:
        print(f"Suggestions API Error: {str(e)}")
        return jsonify({"suggestions": ["Could not generate suggestions at this time."]}), 200        