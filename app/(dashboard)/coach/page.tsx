"use client";

import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, Loader2, Trash2 } from "lucide-react";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
};

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("habitcoach_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setMessages(parsed);
          setIsInitializing(false);
          return;
        }
      } catch {
        // parsing error, fallback to new chat
      }
    }
    
    // Fetch dynamic greeting if no history
    fetch("/api/ai/greeting")
      .then(res => res.json())
      .then(data => {
        if (data.greeting) {
          setMessages([{ id: Date.now().toString(), role: "assistant", content: data.greeting }]);
        }
      })
      .catch(() => {})
      .finally(() => setIsInitializing(false));
  }, []);

  useEffect(() => {
    if (!isInitializing && messages.length > 0) {
      localStorage.setItem("habitcoach_chat_history", JSON.stringify(messages));
    }
  }, [messages, isInitializing]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isInitializing]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: inputMsg };
    setMessages(prev => [...prev, newUserMsg]);
    setInputMsg("");
    setIsTyping(true);

    try {
      const currentHistory = [...messages, newUserMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentHistory })
      });
      const data = await res.json();
      
      const newAssistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || data.error || "I'm having trouble responding right now. Please try again in a moment."
      };
      setMessages(prev => [...prev, newAssistantMsg]);
    } catch {
      setMessages(prev => [...prev, { id: "error", role: "assistant", content: "Sorry, I had trouble connecting. Please check your internet and try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    localStorage.removeItem("habitcoach_chat_history");
    setIsInitializing(true);
    setMessages([]);
    fetch("/api/ai/greeting")
      .then(res => res.json())
      .then(data => {
        if (data.greeting) {
          setMessages([{ id: Date.now().toString(), role: "assistant", content: data.greeting }]);
        }
      })
      .catch(() => {})
      .finally(() => setIsInitializing(false));
  };

  const suggestions = [
    "How much did I spend this week?",
    "Log 200 for coffee today",
    "Help me create a savings goal",
  ];

  const handleSuggestion = (text: string) => {
    setInputMsg(text);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-120px)] w-full max-w-4xl mx-auto rounded-3xl border border-border/50 overflow-hidden shadow-sm glass relative">
        
        {isInitializing && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading conversation...</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card/60 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-full mr-3">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Coach</h2>
              <p className="text-xs text-muted-foreground">Ask about spending, goals, or budgets</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClearChat} className="text-muted-foreground hover:text-destructive" title="Clear Chat History">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
               {msg.role === "assistant" && (
                  <div className="hidden sm:flex bg-primary/10 p-2 h-8 w-8 rounded-full items-center justify-center mr-3 flex-shrink-0 self-end mb-1">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
               )}
               <div 
                 className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed ${
                   msg.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-br-sm shadow-md" 
                    : "bg-muted text-foreground rounded-bl-sm border border-border"
                 }`}
               >
                 {msg.content}
               </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
               <div className="hidden sm:flex bg-primary/10 p-2 h-8 w-8 rounded-full items-center justify-center mr-3 flex-shrink-0 self-end mb-1">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
               <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-sm border border-border flex items-center gap-2">
                 <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                 <span className="text-sm text-muted-foreground">Thinking...</span>
               </div>
             </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t">
          {!isInitializing && messages.length <= 1 && !isTyping && (
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestion(suggestion)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2 relative">
            <Input 
              placeholder="Ask anything about your finances..." 
              className="flex-1 rounded-full px-6 bg-card"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              disabled={isTyping || isInitializing}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="rounded-full absolute right-1 top-1 h-8 w-8"
              disabled={!inputMsg.trim() || isTyping || isInitializing}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
