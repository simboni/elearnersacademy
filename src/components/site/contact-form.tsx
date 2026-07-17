"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // No backend needed — simulate a quick send.
    setTimeout(() => {
      setLoading(false);
      toast.success("Message sent! We'll reply within 24 hours.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 500);
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="label">
            Full name
          </label>
          <input
            id="cf-name"
            className="input"
            placeholder="Peter Simboni"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="cf-email" className="label">
            Email address
          </label>
          <input
            id="cf-email"
            type="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="cf-subject" className="label">
          Subject
        </label>
        <input
          id="cf-subject"
          className="input"
          placeholder="How can we help?"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>

      <div className="mt-5">
        <label htmlFor="cf-message" className="label">
          Message
        </label>
        <textarea
          id="cf-message"
          className="input min-h-[140px] resize-y"
          placeholder="Tell us a bit more about what you need..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary btn-lg mt-6 w-full sm:w-auto">
        {loading ? "Sending..." : "Send message"}
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
