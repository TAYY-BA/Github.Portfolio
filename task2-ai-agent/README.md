# 🎓 EduBot – AI Study Assistant

An AI-powered web application that helps university students understand academic concepts across any subject. Built with Flask (Python) and powered by the Groq API (Llama 3 model).

---

## 📸 Features

- 💬 **Chat Interface** – Clean, responsive chat UI that works on desktop and mobile
- 🧠 **Smart System Prompt** – EduBot is designed specifically to explain, quiz, and guide students
- 📚 **Multi-subject Support** – Works for Math, Physics, CS, Biology, History, and more
- ⚡ **Quick Chips** – One-click example questions to get started instantly
- 🔄 **Conversation Memory** – Maintains context across the chat session
- 🛡️ **Error Handling** – Graceful error messages for API/network issues

---

## 🛠️ Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Backend  | Python 3, Flask                   |
| LLM API  | Groq (Llama 3 – 8B model)         |
| Frontend | HTML5, CSS3, Vanilla JavaScript   |
| Config   | python-dotenv (.env file)         |

---

## 🚀 Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/ai-assignment-1.git
cd ai-assignment-1/task2-ai-agent
```

### 2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up your API key
```bash
cp .env.example .env
```
Then open `.env` and replace `your_groq_api_key_here` with your actual key.

> **Get a FREE Groq API key** (no credit card needed):  
> 👉 https://console.groq.com → Sign up → API Keys → Create Key

### 5. Run the application
```bash
python app.py
```

Open your browser at: **http://localhost:5000**

---

## 📁 Project Structure

```
task2-ai-agent/
├── app.py               # Flask backend + Groq API integration
├── requirements.txt     # Python dependencies
├── .env.example         # API key template (safe to commit)
├── .env                 # Your actual keys (DO NOT commit this)
├── templates/
│   └── index.html       # Full frontend UI (HTML + CSS + JS)
└── screenshots/         # Demo screenshots
```

---

## 🤖 Agent Behavior (System Prompt)

EduBot is configured with a detailed system prompt that makes it:
- Explain concepts in simple language with analogies
- Provide step-by-step problem solving
- Generate practice quiz questions on any topic
- Summarize topics students provide
- Encourage learning rather than completing assignments for students

### Example Queries EduBot Handles Well:
1. *"Explain Big-O notation with examples"*
2. *"Give me a 5-question quiz on photosynthesis"*
3. *"What's the difference between supervised and unsupervised learning?"*
4. *"Explain Newton's Second Law like I'm 10 years old"*
5. *"Summarize the causes of World War I"*

---

## 📋 API Details

- **Provider**: [Groq](https://groq.com) – free tier, no credit card required
- **Model**: `llama3-8b-8192`
- **Endpoint**: `POST https://api.groq.com/openai/v1/chat/completions`

---

## 👨‍🎓 Submitted By

- **Name**: [Your Name]
- **Roll Number**: [Your Roll Number]
- **Course**: Artificial Intelligence – 5th Semester
- **Instructor**: Touqeer Abbas

---

## 📝 Notes

- API keys are loaded from `.env` using `python-dotenv` — never hardcoded
- Conversation history is kept in browser memory (resets on page refresh)
- History is capped at 20 messages to stay within token limits
