export class ChatSession {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    // ---- CORS preflight ----
    if (request.method === "OPTIONS") {
      return this._response(null, 204);
    }

    /* ---------------------------
       GET: Load conversation history
    ---------------------------- */
    if (request.method === "GET") {
      const history = (await this.state.storage.get("history")) || [];
      return this._response({ history });
    }

    /* ---------------------------
       DELETE: Reset incident history
    ---------------------------- */
    if (request.method === "DELETE") {
      await this.state.storage.delete("history");
      return this._response({ ok: true });
    }

    /* ---------------------------
       POST: Add message + AI reply
    ---------------------------- */
    if (request.method !== "POST") {
      return this._response("Method Not Allowed", 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return this._response("Invalid JSON", 400);
    }

    if (!body || typeof body.message !== "string") {
      return this._response("Missing message", 400);
    }

    const storedHistory = await this.state.storage.get("history");
    const history = Array.isArray(storedHistory)
      ? storedHistory.slice(-8)
      : [];

    const messages = [
      {
        role: "system",
        content:
          "You are an Incident Triage Assistant helping engineers investigate a live incident. " +
          "Treat this as an ongoing conversation. " +
          "Respond clearly and practically. " +
          "When appropriate, ask follow-up questions. " +
          "Structure responses using sections when useful, but adapt naturally to the conversation."
      },
      ...history,
      { role: "user", content: body.message }
    ];

    let reply;

try {
  const result = await this.env.AI.run(
    "@cf/meta/llama-3-8b-instruct",
    { messages }
  );

  reply =
    result?.response ||
    result?.output_text ||
    result?.result?.response ||
    "AI returned no usable output.";

} catch (err) {
  return this._response("AI error", 500);
}

    const updatedHistory = history.concat([
      { role: "user", content: body.message },
      { role: "assistant", content: reply }
    ]);

    await this.state.storage.put("history", updatedHistory);

    return this._response({ reply });
  }

  _response(data, status = 200) {
    return new Response(
      data ? JSON.stringify(data) : null,
      {
        status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      }
    );
  }
}

/* ---------------------------
   Worker Router
---------------------------- */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (url.pathname !== "/chat") {
      return new Response("Not Found", { status: 404 });
    }

    const session = url.searchParams.get("session") || "default";
    const id = env.CHAT.idFromName(session);
    const stub = env.CHAT.get(id);

    return stub.fetch(request);
  }
};