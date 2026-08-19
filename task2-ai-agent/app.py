import os
import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "openai/gpt-oss-20b:free"

SYSTEM_PROMPT = """You are EduBot, an enthusiastic and knowledgeable AI Study Assistant designed for university students.

Your role is to help students learn and understand academic concepts clearly and effectively.

You can help with:
1. Explaining complex concepts in simple, easy-to-understand language
2. Answering subject-specific questions (Math, Physics, CS, Biology, History, etc.)
3. Creating summaries of topics the student provides
4. Generating practice quiz questions on any topic
5. Helping students understand their mistakes and misconceptions
6. Providing step-by-step problem solving guidance
7. Recommending study strategies and techniques

Personality:
- Friendly, encouraging, and patient
- Use analogies and real-world examples to explain concepts
- Break down complex ideas into digestible steps
- Celebrate student curiosity and effort
- Never give up on a student who is confused — try a different explanation approach

Formatting:
- Use clear headings and bullet points when listing things
- For math or code, format it clearly with proper structure
- Keep responses concise but thorough — avoid unnecessary padding
- End with a follow-up question or encouragement when appropriate

You are NOT a homework-completing machine. If a student asks you to just "do their assignment," 
guide them through it step by step instead of handing them the answer directly."""


def ask_openrouter(conversation_history):
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "EduBot Study Assistant"
    }

    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + conversation_history

    payload = {
        "model": MODEL,
        "messages": messages,
        "max_tokens": 1024,
        "temperature": 0.7,
    }

    response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "No message provided"}), 400

    conversation_history = data.get("history", [])
    user_message = data["message"].strip()

    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    if not conversation_history:
        conversation_history = [{"role": "user", "content": user_message}]
    else:
        conversation_history.append({"role": "user", "content": user_message})

    try:
        reply = ask_openrouter(conversation_history)
        return jsonify({"reply": reply, "status": "ok"})
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 401:
            return jsonify({"error": "Invalid API key. Please check your OPENROUTER_API_KEY in .env"}), 401
        return jsonify({"error": f"API error: {str(e)}"}), 500
    except requests.exceptions.Timeout:
        return jsonify({"error": "Request timed out. Please try again."}), 504
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


@app.route("/health")
def health():
    return jsonify({"status": "running", "model": MODEL})


if __name__ == "__main__":
    if not OPENROUTER_API_KEY:
        print("WARNING: OPENROUTER_API_KEY not set. Add your key to .env file.")
    app.run(debug=True, port=5000)
