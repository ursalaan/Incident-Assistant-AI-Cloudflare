# Cloudflare AI Incident Assistant

An AI-powered incident analysis assistant built on **Cloudflare Workers**, **Workers AI**, and **Durable Objects**.  
This project simulates how engineering teams triage incidents during outages, regressions, or post-deployment issues.

---

## 🚀 What This Project Does

The AI Incident Assistant helps engineers:
- Describe an incident in plain language
- Receive **structured, actionable guidance** instead of generic answers
- Maintain **conversation memory per incident/session**
- Focus on diagnosis, next steps, and clarifying questions

The assistant responds using a fixed incident-response structure:
- **Summary**
- **Likely Causes**
- **Next Steps**
- **Questions to Ask**

---

## 🧠 Key Features

- **LLM-powered reasoning** using Cloudflare Workers AI (Llama)
- **Durable Objects** for session-based memory
- **Serverless API** built with Cloudflare Workers
- **CORS-safe design** for browser-based usage
- Support for multiple concurrent incident sessions (e.g. `demo`, `demo2`)

---

## 🏗 Architecture Overview

The application is split into three main components:

### 1. Frontend (Static HTML)
- Simple HTML + JavaScript UI
- Allows users to submit incident descriptions
- Sends requests to the Worker API via `POST /chat`
- Uses a session name to maintain incident-specific memory

The frontend is intentionally minimal to keep focus on backend architecture and Cloudflare primitives.

### 2. Cloudflare Worker (Backend API)
- Exposes a `/chat` endpoint
- Handles request validation and CORS
- Routes each request to a Durable Object based on session name

### 3. Durable Object (ChatSession)
- Stores conversation history per incident
- Preserves short-term memory across messages
- Enables parallel investigations without shared state conflicts

### 4. Workers AI
- Uses Cloudflare Workers AI (Llama model)
- Receives structured prompts including conversation context
- Generates practical, incident-focused responses

---

## ☁️ Why Cloudflare?

This project was intentionally built on Cloudflare to demonstrate how AI-powered developer tools can run globally at the edge without managing servers.

- **Workers** provide fast, serverless request handling close to users
- **Workers AI** enables native LLM inference on Cloudflare’s platform
- **Durable Objects** allow stateful workflows without external databases

Cloudflare’s architecture makes it well-suited for scalable, low-latency, AI-driven internal tools used by engineering teams.

---

## ▶️ How It Works (Quick Overview)

1. A user submits an incident description via the frontend
2. The request is sent to the Cloudflare Worker
3. The Worker routes the request to a session-specific Durable Object
4. Conversation context is retrieved and passed to Workers AI
5. A structured response is returned as JSON and displayed in the UI

---

## 🔮 Future Improvements

- Authentication for team-based usage
- Incident severity classification
- Integration with logs or metrics APIs
- Streaming responses (SSE)
- Richer frontend UI and formatting
