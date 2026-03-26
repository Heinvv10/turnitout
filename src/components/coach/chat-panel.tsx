"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildGreeting(
  analysisResults: ReturnType<typeof usePaperStore.getState>["analysisResults"],
  moduleCode: string,
): string {
  const grade = analysisResults.grading?.totalScore;
  const hasResults = analysisResults.aiRisk || analysisResults.grading || analysisResults.citations;

  if (!hasResults) {
    return `I see you're working on an essay for ${moduleCode}. Want me to help you think through your structure?`;
  }

  if (grade !== undefined && grade !== null) {
    if (grade > 70) {
      return `Your essay is looking strong at ${grade}%! Let's see if we can push it even higher.`;
    }

    if (grade >= 50) {
      // Find the lowest scoring category
      const scores: { name: string; value: number }[] = [];
      if (analysisResults.citations) scores.push({ name: "citations", value: analysisResults.citations.score });
      if (analysisResults.grammar) scores.push({ name: "grammar", value: analysisResults.grammar.score });
      if (analysisResults.aiRisk) scores.push({ name: "originality", value: 100 - analysisResults.aiRisk.overallScore });
      if (analysisResults.plagiarism) scores.push({ name: "similarity", value: 100 - analysisResults.plagiarism.overallSimilarity });

      const lowest = scores.sort((a, b) => a.value - b.value)[0];
      const area = lowest?.name || "structure";
      return `You've got a solid foundation. Your ${area} could use some work — want to focus there?`;
    }

    // grade < 50
    const issues: string[] = [];
    if (analysisResults.citations && analysisResults.citations.score < 50) issues.push("citations");
    if (analysisResults.grammar && analysisResults.grammar.score < 50) issues.push("grammar");
    if (analysisResults.aiRisk && analysisResults.aiRisk.overallScore > 50) issues.push("originality concerns");
    const biggestIssue = issues[0] || "structure";
    return `Let's work through this together. I noticed your ${biggestIssue} — can you tell me what you were trying to say in that section?`;
  }

  return `I see you're working on an essay for ${moduleCode}. Want me to help you think through your structure?`;
}

export function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [greetedModule, setGreetedModule] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { currentPaper, analysisResults } = usePaperStore();
  const { selectedModule, apiKey } = useSettingsStore();

  const hasAnalysis = !!(analysisResults.aiRisk || analysisResults.grading || analysisResults.citations);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Auto-greeting when opening for first time per module
  useEffect(() => {
    if (isOpen && (!hasGreeted || greetedModule !== selectedModule)) {
      const greeting = buildGreeting(analysisResults, selectedModule);
      setMessages([{ role: "assistant", content: greeting }]);
      setHasGreeted(true);
      setGreetedModule(selectedModule);
    }
  }, [isOpen, selectedModule, hasGreeted, greetedModule, analysisResults]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const newUserMessage: ChatMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const scores: Record<string, number | null> = {};
      if (analysisResults.grading) scores.grade = analysisResults.grading.totalScore;
      if (analysisResults.citations) scores.citations = analysisResults.citations.score;
      if (analysisResults.grammar) scores.grammar = analysisResults.grammar.score;
      if (analysisResults.aiRisk) scores.aiRisk = analysisResults.aiRisk.overallScore;
      if (analysisResults.plagiarism) scores.similarity = analysisResults.plagiarism.overallSimilarity;
      scores.overall = analysisResults.overall;

      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          essayContext: currentPaper?.plainText || "",
          moduleCode: selectedModule,
          analysisScores: scores,
          chatHistory: updatedMessages.slice(0, -1), // exclude the message we just sent
          apiKey,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Coach unavailable" }));
        throw new Error(errData.error || "Coach unavailable");
      }

      const text = await res.text();
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, I hit a snag: ${errMsg}. Try again?` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <div className="fixed bottom-20 right-4 z-40 lg:bottom-4">
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="relative h-12 w-12 rounded-full shadow-lg"
        >
          <MessageCircle className="h-5 w-5" />
          {hasAnalysis && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary-foreground" />
            </span>
          )}
          {!hasAnalysis && !isOpen && (
            <span className="absolute -top-1 -right-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Coach
            </span>
          )}
        </Button>
      </div>

      {/* Chat Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" showCloseButton={false} className="flex w-full flex-col p-0 sm:max-w-md">
          {/* Header */}
          <SheetHeader className="flex-row items-center justify-between border-b px-4 py-3">
            <SheetTitle className="text-base font-semibold">Writing Coach</SheetTitle>
            <Button variant="ghost" size="icon-sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-foreground/70 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-foreground/70 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-foreground/70 [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t px-4 py-3">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your essay..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon-sm"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
