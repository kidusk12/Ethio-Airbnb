import React, { useState, useMemo } from "react";
import { Search as SearchIcon, ChevronDown, ShieldCheck, CalendarClock, UserCog, Mail } from "lucide-react";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import ContactModal from "../components/modals/ContactModal";

const A = "#E8473F";

const TOPICS = [
  {
    id: "safety",
    icon: ShieldCheck,
    title: "Safety information",
    items: [
      {
        q: "How does EthioStays verify payments?",
        a: "Every booking uses a manual, verified payment process. After you confirm a booking, you'll see the platform's payment details and a unique reference code. Once you upload proof of payment, an admin reviews it — usually within about an hour — before the booking is confirmed.",
      },
      {
        q: "Is my payment protected before a host is paid?",
        a: "Yes. The platform holds your payment until the 24-hour cancellation window closes. Hosts are only paid out after that window passes, and every payment and payout is logged with a reference number, timestamp, and the admin who verified it.",
      },
      {
        q: "What should I do if a listing doesn't match its description?",
        a: "Guests can expect a property to reasonably match its listing. If it doesn't, report it through your booking or contact admin support below so we can look into it.",
      },
    ],
  },
  {
    id: "cancellations",
    icon: CalendarClock,
    title: "Cancellation options",
    items: [
      {
        q: "Can I cancel a booking after it's confirmed?",
        a: "Yes, but only within the 24-hour window after confirmation. Cancelling during this window gives you a full refund, since the platform is still holding your payment and hasn't paid the host yet.",
      },
      {
        q: "What happens after the 24-hour window closes?",
        a: "Once the window closes, the booking can no longer be cancelled. It becomes eligible for host payout, and the platform transfers the host's share directly.",
      },
      {
        q: "Can hosts cancel a confirmed booking?",
        a: "Hosts are expected to honor confirmed bookings. Cancelling without a valid reason may lead to account restrictions.",
      },
    ],
  },
  {
    id: "account",
    icon: UserCog,
    title: "Account & bookings",
    items: [
      {
        q: "How do I update my listing?",
        a: "Hosts can edit or remove a listing at any time from their dashboard, including marking it inactive when it's no longer available.",
      },
      {
        q: "How do I leave a review?",
        a: "Guests can leave a review once a stay is completed, from the booking's details page.",
      },
      {
        q: "How do I report another user?",
        a: "Both hosts and guests can report the other party for violating platform terms directly from a booking, or by contacting admin support below.",
      },
    ],
  },
];

export default function HelpCenter() {
  const [query, setQuery]       = useState("");
  const [openId, setOpenId]     = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredTopics = useMemo(() => {
    if (!query.trim()) return TOPICS;
    const q = query.toLowerCase();
    return TOPICS.map((topic) => ({
      ...topic,
      items: topic.items.filter(
        (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      ),
    })).filter((topic) => topic.items.length > 0);
  }, [query]);

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-gray-900">
      <Navbar />

      {/* Page header */}
      <section className="pt-28 pb-10 px-6 max-w-[900px] mx-auto text-center">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-3" style={{ color: A }}>Help center</p>
        <h1 className="text-3xl md:text-[44px] font-bold font-display text-gray-900 mb-4 leading-tight">
          How can we help?
        </h1>
        <p className="text-[15px] text-gray-500 max-w-lg mx-auto mb-8">
          Search safety guidelines, cancellation rules and account help — or message admin support directly.
        </p>
        <div className="relative max-w-lg mx-auto">
          <SearchIcon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help topics..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-[14px] shadow-sm focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": A + "40" }}
          />
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="pb-16 px-6 max-w-[760px] mx-auto">
        {filteredTopics.length === 0 ? (
          <p className="text-center text-[14px] text-gray-400 py-12">
            No help topics match "{query}". Try another search, or message admin support below.
          </p>
        ) : (
          <div className="space-y-8">
            {filteredTopics.map((topic) => (
              <div key={topic.id}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#fdf2f2", color: A }}>
                    <topic.icon size={16} />
                  </div>
                  <h2 className="text-[15px] font-bold text-gray-900">{topic.title}</h2>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden divide-y divide-gray-100 shadow-sm">
                  {topic.items.map((item) => {
                    const id = `${topic.id}-${item.q}`;
                    const isOpen = openId === id;
                    return (
                      <div key={id}>
                        <button
                          type="button"
                          onClick={() => setOpenId(isOpen ? null : id)}
                          className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 hover:bg-gray-50 transition-colors"
                          aria-expanded={isOpen}
                        >
                          <span className="text-[14px] font-semibold text-gray-900">{item.q}</span>
                          <ChevronDown
                            size={16}
                            className={`flex-shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 text-[13.5px] text-gray-500 leading-relaxed">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact CTA */}
      <section className="pb-16 px-6 max-w-[760px] mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "#fdf2f2", color: A }}>
            <Mail size={20} />
          </div>
          <h3 className="text-lg font-bold font-display text-gray-900 mb-2">Still need help?</h3>
          <p className="text-[14px] text-gray-500 mb-6 max-w-sm mx-auto">
            If you couldn't find an answer above, send a message directly to admin support.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-7 py-3 rounded-xl text-[14px] font-bold text-white shadow-md transition-opacity hover:opacity-90"
            style={{ background: A }}
          >
            Contact admin support
          </button>
        </div>
      </section>

      <Footer />

      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultSubject="Help center inquiry"
      />
    </div>
  );
}
