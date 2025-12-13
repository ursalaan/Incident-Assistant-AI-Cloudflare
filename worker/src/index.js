export class ChatSession {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    if (request.method !== "POST") {
      return new Response("Use POST", {
        status: 405,
        headers: corsHeaders(),
      });
    }

    const { message } = await request.json();

    // Load memory
    const history = (await this.state.storage.get("history")) || [];
    const recentHistory = history.slice(-8);

    const systemPrompt = {
      role: "system",
      content:
        "You are an Incident Assistant for an engineering team. " +
        "Respond clearly and practically. Structure responses as: " +
        "Summary, Likely Causes, Next Steps, and Questions to Ask."
    };

    const messages = [
      systemPrompt,
      ...recentHistory,
      { role: "user", content: message }
    ];

    const aiResult = await this.env.AI.run(
      "@cf/meta/llama-3-8b-instruct",
      { messages }
    );    

    const reply = aiResult.response || "No response returned.";

    // Save memory
    recentHistory.push({ role: "user", content: message });
    recentHistory.push({ role: "assistant", content: reply });
    await this.state.storage.put("history", recentHistory);

    return new Response(JSON.stringify({ reply }), {
      headers: {
        ...corsHeaders(),
        "Content-Type": "application/json",
      },
    });
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight at top level
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    if (url.pathname !== "/chat") {
      return new Response("Use POST /chat", {
        status: 404,
        headers: corsHeaders(),
      });
    }

    const sessionId = url.searchParams.get("session") || "default";
    const id = env.CHAT.idFromName(sessionId);
    const stub = env.CHAT.get(id);

    return stub.fetch(request);
  }
};