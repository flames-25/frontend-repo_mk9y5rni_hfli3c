import { useState, useRef } from "react";

export default function AIChatBox({ userId, backendBaseUrl }) {
  const [messages, setMessages] = useState([
    { role: "system", content: import.meta.env.VITE_SYSTEM_BRIEF || "You are SENS•AI, a helpful career coach." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const baseUrl = backendBaseUrl || import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: userId, message: userMsg.content })
      });
      const json = await res.json();
      const assistantText = json.reply || json.assistant || json.assistantMessage || "Sorry, no response.";
      const assistantMsg = { role: "assistant", content: assistantText };
      setMessages((m) => [...m, assistantMsg]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Error contacting server.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">SENS•AI — Career Assistant</h3>
          <button className="btn-accent" onClick={sendMessage} disabled={loading}>{loading ? 'Thinking…' : 'Ask AI'}</button>
        </div>

        <div className="h-96 overflow-y-auto p-3 rounded-md mb-3" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.01), transparent)' }}>
          {messages.filter(m => m.role !== "system").map((m, idx) => (
            <div key={idx} className={`mb-3 ${m.role === "user" ? "text-right" : ""}`}>
              <div className={`inline-block max-w-[85%] p-3 rounded-lg ${m.role === "user" ? "bg-slate-800" : "bg-gradient-to-r from-accent/10 to-transparent border border-gray-800"}`}>
                <div className="text-sm whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about career paths, resume improvements, or interview practice..."
            className="flex-1 p-3 rounded-md bg-bg-soft border border-gray-700 outline-none"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <button onClick={sendMessage} className="px-4 py-2 rounded-md bg-accent text-black" disabled={loading}>
            {loading ? "Thinking…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
