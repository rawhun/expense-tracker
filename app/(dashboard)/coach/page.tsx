"use client";

import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
};

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello again! I noticed you saved slightly more than last week. Have any questions about your budget or want to set a new goal today?"
    }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-120px)] w-full max-w-4xl mx-auto rounded-3xl border border-border/50 overflow-hidden shadow-sm glass">
        {/* Header */}
        <div className="flex items-center p-4 border-b bg-card/60 backdrop-blur-sm">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">HabitCoach Assistant</h2>
            <p className="text-xs text-muted-foreground">Always here to support your goals</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
               {msg.role === "assistant" && (
                  <div className="hidden sm:flex bg-primary/10 p-2 h-8 w-8 rounded-full items-center justify-center mr-3 flex-shrink-0 self-end mb-1">
                    <Bot className="w-4 h-4 text-primary" />
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
                  <Bot className="w-4 h-4 text-primary" />
                </div>
               <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-sm border border-border flex items-center gap-2">
                 <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                 <span className="text-sm text-muted-foreground">Coach is typing...</span>
               </div>
             </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2 relative">
            <Input 
              placeholder="Ask anything about your finances..." 
              className="flex-1 rounded-full px-6 bg-card"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              disabled={isTyping}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="rounded-full absolute right-1 top-1 h-8 w-8"
              disabled={!inputMsg.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
