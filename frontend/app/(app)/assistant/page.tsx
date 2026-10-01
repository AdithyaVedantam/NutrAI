"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { ChatMessage } from "@/types";
import { endOfDay, startOfDay } from "@/lib/dates";

const suggestions = ["What should I eat for dinner?", "How much protein do I have left?", "Suggest a high-protein snack", "Give me a snack under 300 calories"];

// The AI often replies with light markdown (**bold**, "* " bullets). Show it as clean text instead of raw symbols.
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? <strong key={i}>{part.slice(2, -2)}</strong> : part.replace(/\*/g, "")
  );
}

function ChatText({ text }: { text: string }) {
  return (
    <div className="space-y-1.5">
      {text.split("\n").map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} className="h-1" />;
        const bullet = t.match(/^[*\-•]\s+(.*)$/);
        if (bullet)
          return (
            <div key={i} className="flex gap-2">
              <span>•</span>
              <span>{inline(bullet[1])}</span>
            </div>
          );
        return <p key={i}>{inline(t)}</p>;
      })}
    </div>
  );
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || sending) return;
    const history = messages.slice(-8); // only send the last few messages as context
    setMessages([...messages, { role: "user", content: message }]);
    setInput("");
    setSending(true);
    setError("");
    try {
      const now = new Date();
      const data = await api<{ reply: string }>("/api/ai/chat", {
        method: "POST",
        body: { message, history, dayStart: startOfDay(now).toISOString(), dayEnd: endOfDay(now).toISOString() },
      });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not get a reply");
    }
    setSending(false);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-2xl flex-col md:h-[calc(100vh-4rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Nutrition Assistant</h1>
        <p className="text-slate-500">Knows your goal, targets and what you&apos;ve eaten today.</p>
      </div>

      <div className="card flex flex-1 flex-col overflow-hidden p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-4xl">💬</p>
              <p className="mt-2 font-medium">Ask me anything about your nutrition</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user" ? "rounded-br-md bg-emerald-600 text-white" : "rounded-bl-md bg-slate-100 text-slate-800"
              }`}>
                {m.role === "user" ? <span className="whitespace-pre-wrap">{m.content}</span> : <ChatText text={m.content} />}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-slate-100 px-4 py-2.5 text-sm text-slate-400">Thinking...</div>
            </div>
          )}
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t border-slate-100 p-3">
          <input className="input" maxLength={500} placeholder="Ask about meals, protein, snacks..." value={input} onChange={(e) => setInput(e.target.value)} />
          <button className="btn" disabled={sending || !input.trim()}>Send</button>
        </form>
      </div>
      <p className="mt-2 text-center text-xs text-slate-400">AI suggestions are estimates, not medical advice.</p>
    </div>
  );
}
