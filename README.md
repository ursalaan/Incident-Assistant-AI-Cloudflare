Cloudflare Incident Triage Assistant

A lightweight incident triage tool built on Cloudflare Workers, Durable Objects, and Workers AI.
It models how engineering teams perform early-stage incident investigation in a structured, repeatable way.

The focus of this project is not on automated resolution, but on supporting human reasoning during incidents: clarifying what’s happening, what to check next, and what questions still need answering.

Overview

This tool supports the initial triage phase of an incident.

Rather than returning generic chatbot responses, it maintains short-lived context per incident and guides engineers through investigation in a deliberate, conversational way.

Engineers can:

Describe an incident in plain language

Continue the investigation across multiple messages

Keep context isolated per incident

Focus on diagnosis, follow-up questions, and next steps

The assistant is designed to support investigation, not replace existing monitoring, alerting, or debugging tools.

Key Capabilities

Stateful incident conversations using Durable Objects

Session-based isolation per incident

Serverless API built on Cloudflare Workers

On-platform model inference via Workers AI

Clean, minimal UI focused on readability and workflow

Multiple incidents can be investigated in parallel, each maintaining its own short-term context.

Architecture

The application is intentionally split into clear, production-style components.

Frontend

Static HTML and vanilla JavaScript

Sends messages to the backend via POST /chat

Uses a session identifier to scope each incident

The frontend is deliberately minimal. The emphasis is on interaction flow and state management rather than visual complexity.

Worker (API Layer)

Exposes a single /chat endpoint

Handles request validation and CORS

Routes requests to the appropriate Durable Object based on session

Durable Object (ChatSession)

Stores recent conversation history for one incident

Preserves context across multiple turns

Ensures isolation between concurrent investigations

Workers AI

Receives the current message along with recent context

Produces a structured, conversational response focused on:

understanding the issue

identifying likely causes

suggesting investigation steps

asking relevant follow-up questions

Why Cloudflare

This project was built on Cloudflare to explore how internal engineering tools can be implemented with minimal operational overhead.

Cloudflare provides:

Globally distributed execution with Workers

Stateful workflows without an external database using Durable Objects

Integrated model inference without managing separate infrastructure

This makes the platform well-suited for small, focused internal tools that need to be responsive, simple to operate, and easy to evolve.

Request Flow (High Level)

An engineer describes an incident in the UI

The frontend sends a POST /chat request with the session identifier

The Worker routes the request to the corresponding Durable Object

Recent context is loaded and passed to Workers AI

The response is returned and displayed in the conversation view

Deliberate Limitations

This project intentionally avoids:

automated remediation

deep system integrations

long-term incident storage

complex UI frameworks

Those choices are deliberate. The goal is to demonstrate clear system design, state management, and judgement, not feature completeness.

Possible Extensions

Authentication and access control

Incident severity tagging (e.g. P0–P3)

Integration with logs or metrics

Streaming responses

Exportable incident summaries
