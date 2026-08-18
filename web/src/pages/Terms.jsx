import React from "react";
import { Scale } from "lucide-react";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

const A = "#E8473F";

const SECTIONS = [
  {
    id: "overview",
    title: "1. Overview",
    body: [
      "EthioStays connects hosts who want to rent out properties with guests looking for short-term accommodation. We don't own, manage or inspect any listed property — we provide the platform that connects both parties and facilitates payment verification between them.",
      "By creating an account, listing a property, or making a booking, you agree to the terms below.",
    ],
  },
  {
    id: "host",
    title: "2. Host Responsibilities & Rights",
    subsections: [
      {
        heading: "As a host, you agree to:",
        items: [
          "Provide accurate, honest information about your property (location, price, description, photos)",
          "Honor confirmed bookings — cancelling without a valid reason may result in account restrictions",
          "Respond to booking requests and guest communication in a timely manner",
          "Keep your listing up to date, including marking it inactive if it's no longer available",
        ],
      },
      {
        heading: "As a host, you have the right to:",
        items: [
          "Set your own price per night",
          "Edit or remove your listing at any time",
          "Receive payout for completed, verified bookings",
          "Report a guest for violating these terms",
        ],
      },
    ],
  },
  {
    id: "guest",
    title: "3. Guest Responsibilities & Rights",
    subsections: [
      {
        heading: "As a guest, you agree to:",
        items: [
          "Provide accurate payment proof for any booking you make",
          "Respect the property and any rules set by the host during your stay",
          "Complete payment within the required timeframe for a booking to remain valid",
          "Not attempt to submit fraudulent or falsified payment proof",
        ],
      },
      {
        heading: "As a guest, you have the right to:",
        items: [
          "Cancel a booking within the 24-hour hold window for a full refund",
          "Expect the property to reasonably match its listing description",
          "Leave a review after a completed stay",
          "Report a host for violating these terms",
        ],
      },
    ],
  },
  {
    id: "payments",
    title: "4. Payments & Cancellations",
    body: [
      "EthioStays uses a manual, verified payment process. When you confirm a booking, you'll be shown the platform's payment account details, the exact amount due, and a unique reference code.",
      "After transferring payment externally, you upload proof — a screenshot or transaction reference. Your booking status becomes Awaiting Confirmation while an admin reviews it, which typically takes about an hour.",
      "Once approved, the booking becomes Confirmed and a 24-hour cancellation window begins — the only point at which cancellation is possible. Cancelling within this window gives you a full refund, since the platform is still holding your payment.",
      "Once the window closes, the booking can no longer be cancelled, and it becomes eligible for host payout. Every payment and payout is logged with a reference number, timestamp, and the admin who verified it.",
    ],
  },
  {
    id: "prohibited",
    title: "5. Prohibited Conduct",
    body: ["The following are not allowed on EthioStays, by either hosts or guests:"],
    items: [
      "Creating fake listings or fake bookings",
      "Submitting falsified or altered payment proof",
      "Harassment, discrimination, or abusive communication toward another user",
      "Attempting to bypass the platform's payment and verification process",
      "Misrepresenting your identity or the property being listed",
    ],
    footer: "Violations may result in booking cancellation, listing removal, or account suspension.",
  },
  {
    id: "liability",
    title: "6. Platform's Role & Liability",
    body: [
      "EthioStays facilitates connections and payment verification between hosts and guests, but is not responsible for the condition, safety or legality of any listed property, disputes about a guest's conduct beyond what's covered here, or delays caused by incorrect or unclear payment information submitted by a user.",
      "EthioStays will act in good faith to review disputes and payment issues fairly, using the transaction records described in Section 4.",
    ],
  },
  {
    id: "acknowledgment",
    title: "7. Agreement Acknowledgment",
    body: [
      "By using EthioStays, you confirm that you have read and understood this document, and agree to the responsibilities and rights described above for your role — host or guest — on EthioStays.",
    ],
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#f7f6f4] text-gray-900">
      <Navbar />

      <section className="pt-24 pb-8 px-6 max-w-[1100px] mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#fdf2f2", color: A }}>
            <Scale size={20} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900">Terms & Conditions</h1>
            <p className="text-[12.5px] text-gray-400">Last updated August 2026 · Version 1.1</p>
          </div>
        </div>
        <p className="text-[14px] text-gray-500 max-w-2xl">
          This applies to everyone using EthioStays — whether you're listing a property as a host or booking a stay as a guest. Both parties agree to the same terms, so each side knows exactly what the other has committed to.
        </p>
      </section>

      <section className="pb-16 px-6 max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        {/* Sticky sidebar TOC */}
        <nav className="hidden lg:block sticky top-24 self-start">
          <p className="text-[11px] font-bold text-gray-400 tracking-[0.14em] uppercase mb-3">On this page</p>
          <ul className="space-y-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-[13px] text-gray-400 hover:text-[#E8473F] transition-colors">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 scroll-mt-24 shadow-sm"
            >
              <h2 className="text-lg md:text-xl font-bold font-display text-gray-900 mb-4">{section.title}</h2>

              {section.body?.map((p, i) => (
                <p key={i} className="text-[14px] text-gray-500 leading-relaxed mb-3 last:mb-0">{p}</p>
              ))}

              {section.items && (
                <ul className="mt-3 space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[14px] text-gray-500 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: A }} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {section.footer && (
                <p className="text-[13px] text-gray-400 italic mt-4">{section.footer}</p>
              )}

              {section.subsections?.map((sub) => (
                <div key={sub.heading} className="mt-5">
                  <h3 className="text-[13.5px] font-bold text-gray-900 mb-2.5">{sub.heading}</h3>
                  <ul className="space-y-2">
                    {sub.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[14px] text-gray-500 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: A }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
