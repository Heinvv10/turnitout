"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  institution: string;
  studentCount: string;
  message: string;
}

export function InquiryForm() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    institution: "",
    studentCount: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/institutional-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <CheckCircle className="h-12 w-12 text-primary" />
          <h3 className="text-xl font-bold">Thank you for your inquiry!</h3>
          <p className="text-muted-foreground max-w-md">
            We&apos;ll be in touch within 48 hours to discuss how TurnItOut can
            support your institution.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Request a Quote
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              required
              placeholder="Dr. Jane Smith"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="j.smith@university.ac.za"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              required
              placeholder="University of Cape Town"
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentCount">Number of Students</Label>
            <Input
              id="studentCount"
              type="number"
              min="1"
              required
              placeholder="500"
              value={form.studentCount}
              onChange={(e) => setForm({ ...form, studentCount: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              rows={4}
              placeholder="Tell us about your needs, timeline, or any questions..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          {status === "error" && (
            <p className="text-sm text-destructive sm:col-span-2">{errorMessage}</p>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" disabled={status === "sending"} className="w-full sm:w-auto">
              {status === "sending" ? "Sending..." : "Submit Inquiry"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
