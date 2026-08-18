import React, { useState } from "react";
import { X, Mail, Send, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const A = "#E8473F";
const ADMIN_EMAIL = "support@ethiostays.com";

export default function ContactModal({ isOpen, onClose, defaultSubject = "" }) {
  const { user } = useAuth();
  const [email,   setEmail]   = useState(user?.email || "");
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");
  const [status,  setStatus]  = useState("idle"); // idle | sending | sent | error

  if (!isOpen) return null;

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) handleClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !message) return;
    setStatus("sending");
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      console.log("Message to admin:", { to: ADMIN_EMAIL, from: email, subject, message });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  function handleClose() {
    setStatus("idle");
    setMessage("");
    onClose();
  }

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors bg-white";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      style={{ backdropFilter: "blur(4px)" }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-7 md:p-8">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <X size={18} />
        </button>

        {status === "sent" ? (
          <div className="py-6 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#fdf2f2", color: A }}>
              <CheckCircle2 size={26} />
            </div>
            <h3 className="text-xl font-bold font-display text-gray-900 mb-2">Message sent</h3>
            <p className="text-[14px] text-gray-500 mb-6">Thanks — our support team will reply to {email} soon.</p>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: A }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "#fdf2f2", color: A }}>
              <Mail size={20} />
            </div>
            <h3 id="contact-modal-title" className="text-xl font-bold font-display text-gray-900 mb-1">
              Contact admin support
            </h3>
            <p className="text-[13px] text-gray-400 mb-6">
              Send a message to {ADMIN_EMAIL} — we usually reply within a day.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-email" className="block text-[12px] font-semibold text-gray-700 mb-1.5">Your email</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-[12px] font-semibold text-gray-700 mb-1.5">Subject</label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What's this about?"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-[12px] font-semibold text-gray-700 mb-1.5">Message</label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's going on..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              {status === "error" && (
                <p className="text-[12px] text-red-500">Something went wrong — please try again.</p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: A }}
              >
                <Send size={15} />
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
