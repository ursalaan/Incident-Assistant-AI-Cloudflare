# Cloudflare Incident Triage Assistant

A lightweight, serverless incident triage tool built with Cloudflare Workers, Durable Objects, and Workers AI.

It models how engineering teams handle early-stage incident investigation in a structured and repeatable way. The assistant supports diagnosis and next steps rather than automated resolution, keeping humans firmly in control of decisions.


## Overview

This tool focuses on the initial triage phase of an incident.

Instead of returning generic chatbot responses, it maintains short-lived context per incident and guides engineers through investigation with deliberate, stateful conversations.

Engineers can:

- Describe an incident in plain language  
- Continue investigations across multiple messages  
- Keep context isolated per incident  
- Focus on diagnosis, follow-up questions, and next steps  

The assistant complements existing monitoring and debugging tools rather than replacing them.


## Architecture

The system is intentionally small and explicit.

### Frontend
- Static HTML and vanilla JavaScript  
- Sends requests via `POST /chat`  
- Uses a session identifier to scope each incident  

### Worker (API Layer)
- Single `/chat` endpoint  
- Request validation and routing  
- Dispatches traffic to the correct Durable Object  

### Durable Object (ChatSession)
- Stores short-term conversation history  
- Preserves context across turns  
- Ensures strict isolation between concurrent investigations  

### Workers AI
- Receives the current message and recent context  
- Produces structured, conversational responses focused on:
  - understanding the issue  
  - identifying likely causes  
  - suggesting investigation steps  
  - asking relevant follow-up questions  

Each incident runs in its own stateful session, allowing multiple investigations to proceed in parallel without interference.


## How It Works

1. An engineer describes an incident in the UI  
2. The frontend sends a `POST /chat` request with a session ID  
3. The Worker routes the request to the corresponding Durable Object  
4. Recent context is combined with the new message  
5. Workers AI generates a response  
6. The result is returned and displayed in the conversation  

The workflow is iterative and conversational, designed to clarify thinking rather than automate outcomes.


## Design Principles

- Server-side state only  
- Explicit session boundaries  
- Deterministic behaviour  
- Minimal UI  
- No hidden automation  

The interface stays intentionally simple so the focus remains on reasoning and workflow.


## Why This Stack

Cloudflare enables:

- globally distributed execution with Workers  
- strongly consistent state without an external database via Durable Objects  
- on-platform model inference with Workers AI  

This keeps the system operationally lightweight while still supporting stateful, real-time workflows. No servers or separate infrastructure are required.


## Scope & Trade-offs

Intentionally out of scope:

- automated remediation  
- deep system integrations  
- long-term storage  
- complex frontend frameworks  

These omissions are deliberate. The goal is to demonstrate clear system design, state management, and architectural judgement rather than feature breadth.


## What This Project Demonstrates

- serverless API design  
- stateful workflows at the edge  
- per-session isolation  
- practical AI assistance with bounded behaviour  
- building focused internal tools with minimal operational overhead  

This project is designed to be realistic, explainable, and easy to reason about.


## Possible Extensions

- authentication and access control  
- severity tagging (P0–P3)  
- integration with logs or metrics  
- streaming responses  
- exportable incident summaries  

These additions would build on the existing design without increasing complexity.
