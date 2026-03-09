"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEntries } from "@/lib/firebase";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "ai";
  content: string;
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm your Worklog AI. Ask me anything about your logged tasks, time spent, or to generate quick reports." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const entries = await getEntries();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage, entries }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Sorry, I ran into an error processing that request." },
      ]);
    }

    setLoading(false);
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setOpen(!open)}
          className={`h-14 w-14 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 hover:scale-110 ${
            open ? "bg-zinc-800 hover:bg-zinc-700" : "bg-indigo-600 hover:bg-indigo-500"
          }`}
        >
          {open ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <MessageSquare className="h-6 w-6 text-white" />
          )}
        </Button>
      </div>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[350px] sm:w-[400px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/80 shadow-2xl backdrop-blur-3xl animate-in slide-in-from-bottom-5 fade-in zoom-in-95">
          <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/50">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Worklog AI</h3>
              <p className="text-xs text-zinc-400">Context-Aware Assistant</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={scrollRef}>
            <div className="flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white shadow-md rounded-br-sm"
                        : "bg-white/10 text-zinc-200 border border-white/5 rounded-bl-sm prose prose-sm prose-invert prose-p:leading-snug prose-p:last:mb-0"
                    }`}
                  >
                    {msg.role === "ai" ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-white/5 bg-white/10 px-4 py-3">
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0.4s]" />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 p-4 bg-white/5">
            <div className="relative flex items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about your worklog..."
                className="h-12 w-full rounded-2xl border-white/10 bg-black/40 pr-12 text-zinc-200 placeholder:text-zinc-600 focus-visible:border-indigo-500/50 focus-visible:ring-1 focus-visible:ring-indigo-500/50"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-1.5 h-9 w-9 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:opacity-50 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
