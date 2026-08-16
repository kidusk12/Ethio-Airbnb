/**
 * Mock data + shape definitions for the Guest Dashboard.
 *
 * The rest of this codebase is .jsx rather than .tsx, so these are written
 * as JSDoc typedefs instead of TypeScript interfaces — they give you the
 * same editor autocomplete / shape-checking without adding a TS toolchain.
 * If this project is ever migrated to TypeScript, each typedef below maps
 * 1:1 onto an `interface` of the same name.
 */

/**
 * @typedef {"upcoming"|"active"|"completed"|"cancelled"} BookingStatus
 *
 * @typedef {Object} Booking
 * @property {string} id
 * @property {string} propertySlug
 * @property {string} propertyName
 * @property {string} propertyType     e.g. "Apartment", "Villa", "Guesthouse"
 * @property {string} location
 * @property {string} image
 * @property {string} checkIn          ISO date string
 * @property {string} checkOut         ISO date string
 * @property {number} guests
 * @property {number} totalPriceETB
 * @property {BookingStatus} status
 * @property {string} hostName
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} hostName
 * @property {string} hostAvatar
 * @property {string} propertyName
 * @property {string} preview
 * @property {string} timestamp        e.g. "2h ago"
 * @property {boolean} unread
 */

/**
 * @typedef {Object} SavedStay
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {string} type
 * @property {string} location
 * @property {string} image
 * @property {number} rating
 * @property {number} reviews
 * @property {number} priceETB
 */

/**
 * @typedef {Object} PastTrip
 * @property {string} id
 * @property {string} propertyName
 * @property {string} location
 * @property {string} image
 * @property {string} stayedDates      display string, e.g. "12 - 15 Mar 2026"
 * @property {boolean} reviewed
 * @property {number} [myRating]
 */

// Reference photography — swap for your real asset imports
// (see src/pages/Home.jsx for the aaImg / hawaImg / etc. import pattern).
const IMG = {
  bole: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  hawassa: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80",
  lalibela: "https://images.unsplash.com/photo-1615887023544-9ea1c9b1c8e5?w=800&q=80",
  bahirdar: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  kazanchis: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  diredawa: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
};

/** @type {Booking[]} */
export const mockBookings = [
  {
    id: "bk_1001",
    propertySlug: "bole-skyline-suite",
    propertyName: "Bole Skyline Suite",
    propertyType: "Apartment",
    location: "Bole, Addis Ababa",
    image: IMG.bole,
    checkIn: "2026-08-22",
    checkOut: "2026-08-26",
    guests: 2,
    totalPriceETB: 19200,
    status: "upcoming",
    hostName: "Meron T.",
  },
  {
    id: "bk_1002",
    propertySlug: "hawassa-lake-villa",
    propertyName: "Hawassa Lake Villa",
    propertyType: "Villa",
    location: "Lake Hawassa, Hawassa",
    image: IMG.hawassa,
    checkIn: "2026-08-18",
    checkOut: "2026-08-21",
    guests: 4,
    totalPriceETB: 27600,
    status: "active",
    hostName: "Dawit A.",
  },
];

/** @type {Message[]} */
export const mockMessages = [
  {
    id: "msg_1",
    hostName: "Meron T.",
    hostAvatar: "https://i.pravatar.cc/80?img=32",
    propertyName: "Bole Skyline Suite",
    preview: "Sure! Check-in is anytime after 2pm, I'll send the gate code the morning of.",
    timestamp: "2h ago",
    unread: true,
  },
  {
    id: "msg_2",
    hostName: "Dawit A.",
    hostAvatar: "https://i.pravatar.cc/80?img=51",
    propertyName: "Hawassa Lake Villa",
    preview: "Hope you're enjoying the lake view! Let me know if you need anything.",
    timestamp: "1d ago",
    unread: true,
  },
  {
    id: "msg_3",
    hostName: "Selam K.",
    hostAvatar: "https://i.pravatar.cc/80?img=47",
    propertyName: "Lalibela Stone Guesthouse",
    preview: "Thank you for staying with us — safe travels back!",
    timestamp: "6d ago",
    unread: false,
  },
];

/** @type {SavedStay[]} */
export const mockSavedStays = [
  {
    id: "sv_1",
    slug: "lalibela-stone-guesthouse",
    name: "Lalibela Stone Guesthouse",
    type: "Guesthouse",
    location: "Old Town, Lalibela",
    image: IMG.lalibela,
    rating: 4.95,
    reviews: 212,
    priceETB: 3400,
  },
  {
    id: "sv_2",
    slug: "bahir-dar-garden-house",
    name: "Bahir Dar Garden House",
    type: "Hotel",
    location: "Tana Lakeside, Bahir Dar",
    image: IMG.bahirdar,
    rating: 4.78,
    reviews: 141,
    priceETB: 5600,
  },
  {
    id: "sv_3",
    slug: "kazanchis-loft",
    name: "Kazanchis Design Loft",
    type: "Private room",
    location: "Kazanchis, Addis Ababa",
    image: IMG.kazanchis,
    rating: 4.71,
    reviews: 63,
    priceETB: 2200,
  },
];

/** @type {PastTrip[]} */
export const mockPastTrips = [
  {
    id: "pt_1",
    propertyName: "Dire Dawa Courtyard Stay",
    location: "Kezira, Dire Dawa",
    image: IMG.diredawa,
    stayedDates: "3 - 6 Jun 2026",
    reviewed: true,
    myRating: 5,
  },
  {
    id: "pt_2",
    propertyName: "Lalibela Stone Guesthouse",
    location: "Old Town, Lalibela",
    image: IMG.lalibela,
    stayedDates: "12 - 15 Mar 2026",
    reviewed: false,
  },
];

export const mockGuest = {
  name: "Abebe",
  totalSpentETB: 46800,
};
