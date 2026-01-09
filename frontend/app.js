const WORKER_URL = "http://127.0.0.1:8787";

/* Application state */
let incidents = JSON.parse(localStorage.getItem("incidents")) || ["demo"];
let activeSession =
  localStorage.getItem("activeSession") || incidents[0] || null;

/* DOM references */
const messagesEl = document.getElementById("messages");
const sendBtn = document.getElementById("send");
const newIncidentBtn = document.getElementById("newIncident");
const savedChatsEl = document.getElementById("savedChats");
const resetBtn = document.getElementById("resetIncident");

const modal = document.getElementById("incidentModal");
const nameInput = document.getElementById("incidentNameInput");
const cancelBtn = document.getElementById("cancelIncident");
const confirmBtn = document.getElementById("confirmIncident");

/* Persistence */
function saveIncidents() {
  localStorage.setItem("incidents", JSON.stringify(incidents));
}

function saveActiveSession() {
  localStorage.setItem("activeSession", activeSession);
}

/* Message rendering */
function clearMessages() {
  messagesEl.innerHTML = "";
}

function addMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const label = document.createElement("div");
  label.className = "role";
  label.textContent = role === "user" ? "You" : "Assistant";

  const content = document.createElement("div");
  content.className = "content";

if (role === "assistant") {
  let cleaned = text;

  cleaned = cleaned
    .replace(/\*\*/g, "")
    .replace(/•/g, "")
    .replace(/\n\s*\*\s+/g, "\n")
    .replace(/\*\s+/g, "");

  cleaned = cleaned.replace(
    /(please provide the following details:|questions to consider:)/i,
    "$1\n\n"
  );

  cleaned = cleaned.replace(
    /([A-Z][^?\n]*\?)/g,
    "$1\n"
  );

  cleaned = cleaned.replace(
    /\?\n{2,}(?=[A-Z])/g,
    "?\n"
  );

  cleaned = cleaned.replace(/\n[ \t]+/g, "\n");

  cleaned = cleaned
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  content.textContent = cleaned;
} else {
  content.textContent = text;
}


  wrapper.appendChild(label);
  wrapper.appendChild(content);
  messagesEl.appendChild(wrapper);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showThinking() {
  const wrapper = document.createElement("div");
  wrapper.className = "message assistant thinking";
  wrapper.id = "thinking";

  const label = document.createElement("div");
  label.className = "role";
  label.textContent = "Assistant";

  const content = document.createElement("div");
  content.className = "content";
  content.textContent = "Thinking…";

  wrapper.appendChild(label);
  wrapper.appendChild(content);
  messagesEl.appendChild(wrapper);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideThinking() {
  const el = document.getElementById("thinking");
  if (el) el.remove();
}

/* History loading */
async function loadHistory(session) {
  clearMessages();

  try {
    const response = await fetch(
      WORKER_URL + "/chat?session=" + encodeURIComponent(session)
    );
    const data = await response.json();

    if (Array.isArray(data.history)) {
      data.history.forEach((msg) => {
        if (msg.role === "user" || msg.role === "assistant") {
          addMessage(msg.role, msg.content);
        }
      });
    }
  } catch {
    addMessage("assistant", "Failed to load chat history.");
  }
}

/* Sidebar rendering */
function renderSavedChats() {
  savedChatsEl.innerHTML = "";

  incidents.forEach((id) => {
    const li = document.createElement("li");
    li.textContent = id;

    if (id === activeSession) {
      li.classList.add("active");
    }

    li.onclick = () => {
      activeSession = id;
      saveActiveSession();
      renderSavedChats();
      loadHistory(id);
    };

    const del = document.createElement("span");
    del.textContent = "✕";

    del.onclick = (e) => {
      e.stopPropagation();
      incidents = incidents.filter((x) => x !== id);

      if (activeSession === id) {
        activeSession = incidents[0] || null;
        clearMessages();
      }

      saveIncidents();
      saveActiveSession();
      renderSavedChats();

      if (activeSession) {
        loadHistory(activeSession);
      }
    };

    li.appendChild(del);
    savedChatsEl.appendChild(li);
  });
}

/* Incident creation */
newIncidentBtn.onclick = () => {
  nameInput.value = "";
  modal.classList.remove("hidden");
  nameInput.focus();
};

cancelBtn.onclick = () => {
  modal.classList.add("hidden");
};

confirmBtn.onclick = () => {
  const name = nameInput.value.trim();
  if (!name) return;

  incidents.unshift(name);
  activeSession = name;

  saveIncidents();
  saveActiveSession();

  renderSavedChats();
  clearMessages();
  modal.classList.add("hidden");
};

/* Clear chat history */
resetBtn.onclick = async () => {
  if (!activeSession) return;

  await fetch(
    WORKER_URL + "/chat?session=" + encodeURIComponent(activeSession),
    { method: "DELETE" }
  );

  clearMessages();
  addMessage("assistant", "Chat history cleared.");
};

/* Send message */
sendBtn.onclick = async () => {
  const textarea = document.getElementById("message");
  const text = textarea.value.trim();
  if (!text || !activeSession) return;

  textarea.value = "";
  addMessage("user", text);

  showThinking();

  try {
    const response = await fetch(
      WORKER_URL + "/chat?session=" + encodeURIComponent(activeSession),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      }
    );

    const data = await response.json();
    hideThinking();
    addMessage("assistant", data.reply || "No response.");
  } catch {
    hideThinking();
    addMessage("assistant", "Failed to contact incident service.");
  }
};

/* Initial render */
renderSavedChats();
if (activeSession) {
  loadHistory(activeSession);
}