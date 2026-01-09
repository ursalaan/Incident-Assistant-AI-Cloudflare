# Cloudflare Incident Triage Assistant

A lightweight incident triage tool built with Cloudflare Workers, Durable Objects, and Workers AI.

It models how engineering teams handle early-stage incident investigation in a structured, repeatable way. The goal is not automated resolution, but helping engineers clarify what’s happening, what to check next, and what questions still need answering.

## Overview

This tool supports the initial triage phase of an incident.

Rather than returning generic chatbot responses, it maintains short-lived context per incident and guides engineers through investigation in a deliberate, conversational way.

Engineers can:

- Describe an incident in plain language
- Continue the investigation across multiple messages
- Keep context isolated per incident
- Focus on diagnosis, follow-up questions, and next steps

The assistant is designed to support investigation, not replace monitoring, alerting, or debugging tools.

## Key Capabilities

- Stateful incident conversations using Durable Objects
- Session-based isolation per incident
- Serverless API built on Cloudflare Workers
- On-platform model inference via Workers AI
- Clean, minimal UI focused on readability and workflow

Multiple incidents can be investigated in parallel, each maintaining its own short-term context.

## Architecture

The application is split into clear components.

### Frontend

- Static HTML and vanilla JavaScript
- Sends messages to the backend via `POST /chat`
- Uses a session identifier to scope each incident

The frontend is intentionally minimal. The focus is the workflow and state management.

### Worker (API Layer)

- Exposes a single `/chat` endpoint
- Handles request validation and CORS
- Routes requests to the correct Durable Object based on session

### Durable Object (`ChatSession`)

- Stores recent conversation history for one incident
- Preserves context across multiple turns
- Ensures isolation between concurrent investigations

### Workers AI

- Receives the current message along with recent context
- Produces a structured, conversational response focused on:
  - Understanding the issue
  - Identifying likely causes
  - Suggesting investigation steps
  - Asking relevant follow-up questions

## Why Cloudflare

This project uses Cloudflare to explore how small internal tools can be built with minimal operational overhead.

Cloudflare provides:

- Globally distributed execution with Workers
- Stateful workflows without an external database using Durable Objects
- Integrated model inference without managing separate infrastructure

This setup is well-suited for focused internal tools that need to be responsive, simple to operate, and easy to evolve.

## Request Flow

1. An engineer describes an incident in the UI.
2. The frontend sends a `POST /chat` request with a session identifier.
3. The Worker routes the request to the corresponding Durable Object.
4. Recent context is loaded and passed to Workers AI.
5. The response is returned and displayed in the conversation view.

## Deliberate Limitations

This project intentionally avoids:

- Automated remediation
- Deep system integrations
- Long-term incident storage
- Complex UI frameworks

These choices are deliberate. The aim is to demonstrate clear system design, state management, and judgement.

## Possible Extensions

- Authentication and access control
- Incident severity tagging (e.g. P0–P3)
- Integration with logs or metrics
- Streaming responses
- Exportable incident summaries

## Note

This project is best understood as a realistic internal tool rather than a product demo. Incident triage is conversational and iterative, with humans in the loop.
