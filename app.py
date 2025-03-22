from flask import Flask, render_template, request, jsonify
import requests
import json

app = Flask(__name__)

# Configure Google Gemini API
API_KEY = "-- YOUR API KEY --------"  # Replace with your actual API key
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


def get_mcq(topic):
    """Fetch MCQs using Gemini 2 Flash API."""
    prompt = f"Generate 10 multiple-choice questions on {topic}. Format: JSON array of objects with 'question', 'options', 'answer'."

    headers = {"Content-Type": "application/json"}
    data = {"contents": [{"parts": [{"text": prompt}]}]}

    response = requests.post(f"{API_URL}?key={API_KEY}", headers=headers, json=data)
    print(response)
    if response.status_code == 200:
        try:
            response_data = response.json()
            mcq_text = response_data["candidates"][0]["content"]["parts"][0]["text"]

            # ✅ Remove ```json ... ``` formatting if present
            if mcq_text.startswith("```json"):
                mcq_text = mcq_text.replace("```json", "").replace("```", "").strip()

            mcq_data = json.loads(mcq_text)  # Convert string response to JSON
            return mcq_data
        
        except (KeyError, json.JSONDecodeError):
            print( response_data)
            print (KeyError)
            return [{"question": "Failed to parse MCQs. Try again.", "options": [], "answer": ""}]
    else:
        return [{"question": "Error fetching MCQs. Try again later.", "options": [], "answer": ""}]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_mcqs", methods=["POST"])
def get_questions():
    topic = request.json.get("topic", "")
    if not topic:
        return jsonify({"error": "Please enter a valid topic."})

    mcqs = get_mcq(topic)
    return jsonify({"mcqs": mcqs})

if __name__ == "__main__":
    app.run(debug=True)
