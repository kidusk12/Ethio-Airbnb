import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  WalletCards,
  Building2,
  Star,
  ArrowUpRight,
  List,
  Banknote,
  MessageSquare,
  Home,
} from "lucide-react";
import Navbar1 from "../components/NavBar1";
import NavBar1 from "../components/NavBar1";

const getStoredArray = (keys) => {
  for (const key of keys) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      if (Array.isArray(value)) return value;
    } catch {
      // Ignore invalid localStorage values.
    }
  }
  return [];
};

const getFirstName = () => {
  const possibleUsers = [
    "user",
    "currentUser",
    "authUser",
    "loggedInUser",
    "userData",
    "profile",
  ];

  for (const key of possibleUsers) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const value = JSON.parse(raw);

      if (typeof value === "string" && value.trim()) {
        return value.trim().split(" ")[0];
      }

      if (value && typeof value === "object") {
        const firstName =
          value.firstName ||
          value.firstname ||
          value.first_name ||
          value.name ||
          value.fullName ||
          value.full_name;

        if (firstName) {
          return String(firstName).trim().split(" ")[0];
        }
      }
    } catch {
      const raw = localStorage.getItem(key);
      if (raw?.trim()) return raw.trim().split(" ")[0];
    }
  }

  // Common fallback keys used by simple registration forms.
  const directFirstName =
    localStorage.getItem("firstName") ||
    localStorage.getItem("firstname") ||
    localStorage.getItem("first_name");

  return directFirstName?.trim().split(" ")[0] || "there";
};

const getNumber = (keys, fallback = 0) => {
  for (const key of keys) {
    const value = Number(localStorage.getItem(key));
    if (!Number.isNaN(value) && localStorage.getItem(key) !== null) {
      return value;
    }
  }
  return fallback;
};

function StatCard({ label, value, helper, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-border bg-white px-6 py-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between">
        <p className="text-[16px] text-muted-foreground">{label}</p>
        <Icon size={21} strokeWidth={1.8} className="text-primary" />
      </div>

      <p className="mt-5 font-serif text-[34px] font-semibold leading-none text-foreground">
        {value}
      </p>

      {helper && (
        <p className="mt-2 text-[14px] text-muted-foreground">{helper}</p>
      )}
    </div>
  );
}

function Host_dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");

  const firstName = useMemo(() => getFirstName(), []);

  const listings = useMemo(
    () =>
      getStoredArray([
        "properties",
        "listings",
        "hostProperties",
        "hostListings",
      ]),
    []
  );

  const bookings = useMemo(
    () => getStoredArray(["bookings", "reservations", "hostBookings"]),
    []
  );

  const hasListings = listings.length > 0;

  const totalEarnings = getNumber(
    ["totalEarnings", "hostTotalEarnings", "earnings"],
    0
  );

  const reviewScore = getNumber(
    ["reviewScore", "hostReviewScore", "rating"],
    0
  );

  const goToNewProperty = () => {
    navigate("/host/list");
  };

  const tabs = [
    { label: "Overview", icon: Home },
    { label: "Listings", icon: List },
    { label: "Earnings", icon: Banknote },
    { label: "Reviews", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar1 />

      <main className="w-full px-6 py-14 md:px-10 lg:px-12">
        <div className="mx-auto max-w-[1545px]">
          {/* Header */}
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-[14px] font-semibold uppercase tracking-[0.18em] text-primary">
                Hosting
              </p>

              <h1 className="font-serif text-[38px] font-semibold leading-tight text-foreground md:text-[42px]">
                Welcome back, {firstName}
              </h1>
            </div>

            <button
              type="button"
              onClick={goToNewProperty}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-[16px] font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              <Plus size={20} />
              Add new property
            </button>
          </div>

          {/* Top statistics */}
          <div className="grid gap-5 md:grid-cols-3">
            <StatCard
              label="Total earnings"
              value={`ETB ${totalEarnings.toLocaleString()}`}
              helper={
                hasListings
                  ? "Your earnings from listed properties"
                  : "Start hosting to earn"
              }
              icon={WalletCards}
            />

            <StatCard
              label="Active listings"
              value={listings.length}
              helper={
                hasListings
                  ? `${listings.length} ${
                      listings.length === 1 ? "property" : "properties"
                    } listed`
                  : "No properties listed yet"
              }
              icon={Building2}
            />

            <StatCard
              label="Review score"
              value={reviewScore.toFixed(2)}
              helper={
                reviewScore > 0
                  ? "Based on your guest reviews"
                  : "No reviews yet"
              }
              icon={Star}
            />
          </div>

          {/* New-host empty state */}
          {!hasListings && (
            <section className="mt-10 rounded-2xl border border-border bg-white px-8 py-12 text-center shadow-[0_8px_30px_rgba(0,0,0,0.035)] md:px-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Building2 size={30} className="text-primary" />
              </div>

              <h2 className="mt-6 font-serif text-[28px] font-semibold text-foreground">
                Add your first listing
              </h2>

              <p className="mx-auto mt-3 max-w-[620px] text-[15px] leading-7 text-muted-foreground">
                Ready to start hosting? Add your first property and share a
                beautiful place with guests looking for stays in Ethiopia.
              </p>

              <button
                type="button"
                onClick={goToNewProperty}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[15px] font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Plus size={19} />
                Add your first property
              </button>
            </section>
          )}

          {/* Existing-host dashboard */}
          {hasListings && (
            <>
              {/* Tabs */}
              <div className="mt-12 inline-flex max-w-full flex-wrap items-center gap-1 rounded-2xl bg-[#f5f2ed] p-1.5">
                {tabs.map(({ label, icon: Icon }) => {
                  const active = activeTab === label;

                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setActiveTab(label)}
                      className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[15px] font-medium transition ${
                        active
                          ? "bg-white text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon size={17} strokeWidth={1.8} />
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Overview */}
              {activeTab === "Overview" && (
                <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.95fr]">
                  <section className="rounded-2xl border border-border bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.035)]">
                    <div className="mb-7 flex items-center justify-between">
                      <h2 className="font-serif text-[25px] font-semibold text-foreground">
                        Your listings
                      </h2>

                      <button
                        type="button"
                        onClick={() => setActiveTab("Listings")}
                        className="inline-flex items-center gap-1 text-[14px] font-medium text-primary hover:underline"
                      >
                        View all
                        <ArrowUpRight size={16} />
                      </button>
                    </div>

                    <div className="space-y-0">
                      {listings.slice(0, 4).map((listing, index) => {
                        const title =
                          listing.title ||
                          listing.name ||
                          listing.propertyName ||
                          `Property ${index + 1}`;

                        const location =
                          listing.location ||
                          listing.city ||
                          listing.address ||
                          "Ethiopia";

                        const price =
                          listing.price ||
                          listing.pricePerNight ||
                          listing.nightlyPrice;

                        return (
                          <div
                            key={listing.id || listing._id || index}
                            className="flex items-center justify-between gap-5 border-b border-border py-5 last:border-b-0"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-[16px] font-medium text-foreground">
                                {title}
                              </p>
                              <p className="mt-1 truncate text-[14px] text-muted-foreground">
                                {location}
                              </p>
                            </div>

                            <div className="shrink-0 text-right">
                              {price !== undefined && price !== null ? (
                                <p className="text-[15px] font-medium text-foreground">
                                  ETB {Number(price).toLocaleString()}
                                </p>
                              ) : (
                                <p className="text-[14px] text-muted-foreground">
                                  Active
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-border bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.035)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Star size={20} className="text-primary" />
                      </div>

                      <h2 className="font-serif text-[25px] font-semibold text-foreground">
                        Review score
                      </h2>
                    </div>

                    <p className="mt-7 font-serif text-[48px] font-semibold leading-none text-foreground">
                      {reviewScore.toFixed(2)}
                    </p>

                    <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-primary/15">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${Math.min(
                            Math.max((reviewScore / 5) * 100, 0),
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="mt-4 text-[14px] text-muted-foreground">
                      {reviewScore > 0
                        ? "Based on your guest reviews"
                        : "You have not received any reviews yet."}
                    </p>

                    <button
                      type="button"
                      onClick={() => setActiveTab("Reviews")}
                      className="mt-6 inline-flex items-center gap-1 text-[14px] font-medium text-primary hover:underline"
                    >
                      View reviews
                      <ArrowUpRight size={16} />
                    </button>
                  </section>
                </div>
              )}

              {/* Listings tab */}
              {activeTab === "Listings" && (
                <section className="mt-8 rounded-2xl border border-border bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.035)]">
                  <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="font-serif text-[28px] font-semibold text-foreground">
                        Your listings
                      </h2>
                      <p className="mt-1 text-[14px] text-muted-foreground">
                        Manage the properties you are currently hosting.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={goToNewProperty}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground"
                    >
                      <Plus size={18} />
                      Add property
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {listings.map((listing, index) => {
                      const title =
                        listing.title ||
                        listing.name ||
                        listing.propertyName ||
                        `Property ${index + 1}`;

                      const location =
                        listing.location ||
                        listing.city ||
                        listing.address ||
                        "Ethiopia";

                      return (
                        <div
                          key={listing.id || listing._id || index}
                          className="rounded-xl border border-border p-5"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                              <Building2 size={22} className="text-primary" />
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate text-[16px] font-semibold text-foreground">
                                {title}
                              </h3>
                              <p className="mt-1 text-[14px] text-muted-foreground">
                                {location}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Earnings tab - no chart */}
              {activeTab === "Earnings" && (
                <section className="mt-8 rounded-2xl border border-border bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.035)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <WalletCards size={20} className="text-primary" />
                    </div>

                    <div>
                      <h2 className="font-serif text-[27px] font-semibold text-foreground">
                        Earnings
                      </h2>
                      <p className="text-[14px] text-muted-foreground">
                        Your hosting earnings at a glance.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-xl bg-[#f8f6f2] p-6">
                    <p className="text-[14px] text-muted-foreground">
                      Total earnings
                    </p>
                    <p className="mt-2 font-serif text-[38px] font-semibold text-foreground">
                      ETB {totalEarnings.toLocaleString()}
                    </p>
                  </div>
                </section>
              )}

              {/* Reviews tab */}
              {activeTab === "Reviews" && (
                <section className="mt-8 rounded-2xl border border-border bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.035)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Star size={20} className="text-primary" />
                    </div>

                    <div>
                      <h2 className="font-serif text-[27px] font-semibold text-foreground">
                        Reviews
                      </h2>
                      <p className="text-[14px] text-muted-foreground">
                        See what guests think about your stays.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-xl border border-border p-6">
                    <p className="font-serif text-[42px] font-semibold text-foreground">
                      {reviewScore.toFixed(2)}
                    </p>
                    <p className="mt-1 text-[14px] text-muted-foreground">
                      {reviewScore > 0
                        ? "Overall review score"
                        : "No reviews yet"}
                    </p>
                  </div>
                </section>
              )}

              {/* Recent bookings - only when data exists */}
              {activeTab === "Overview" && bookings.length > 0 && (
                <section className="mt-8 rounded-2xl border border-border bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.035)]">
                  <h2 className="font-serif text-[25px] font-semibold text-foreground">
                    Recent bookings
                  </h2>

                  <div className="mt-5">
                    {bookings.slice(0, 5).map((booking, index) => (
                      <div
                        key={booking.id || booking._id || index}
                        className="flex items-center justify-between gap-5 border-b border-border py-5 last:border-b-0"
                      >
                        <div>
                          <p className="text-[15px] font-medium text-foreground">
                            {booking.guestName ||
                              booking.name ||
                              `Guest ${index + 1}`}
                          </p>
                          <p className="mt-1 text-[14px] text-muted-foreground">
                            {booking.propertyName ||
                              booking.listingName ||
                              "Property booking"}
                          </p>
                        </div>

                        <p className="text-[15px] font-medium text-foreground">
                          {booking.amount
                            ? `ETB ${Number(booking.amount).toLocaleString()}`
                            : "Booking"}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Host_dashboard;
