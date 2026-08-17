# Ethio-Airbnb

A short-term property rental platform connecting hosts who want to rent out properties with guests searching for temporary accommodation in Ethiopia — built as a web application and a Flutter mobile app, sharing one backend API.

Developed as part of the INSA Cyber Talent Center, 5th Batch Summer Camp (Development Department).

## Team

| Name             | ID          |
| ---------------- | ----------- |
| Kidus Kidanewold | ctc-6808-26 |
| Hemen Solomon    | ctc-1248-26 |
| Makda Solomon    | ctc-867-26  |
| Melat Worku      | ctc-875-26  |
| Kenzo Stacy      | ctc-4900-26 |

## About the Project

Finding reliable short-term accommodation in Ethiopia is difficult due to the lack of a centralized platform that lets people easily search, compare, and book available properties. Property owners also struggle to reach potential guests and manage bookings efficiently.

Ethio-Airbnb addresses this by giving hosts a simple way to list and manage properties, and giving guests a simple way to search, view, and book them — all through a shared backend used by both a web app and a mobile app.

## Key Features

- User registration and login (Guest / Host roles)
- Hosts can create, edit, and delete property listings
- Guests can search and filter listings by location, price, and date availability
- Booking system with double-booking prevention
- Guest reviews and star ratings on listings
- Simulated/mock payment confirmation (no real payment gateway)
- Basic admin moderation of listings and reviews

## Tech Stack

- **Backend:** Node.js, Express, PostgreSQL
- **Web:** React (Vite)
- **Mobile:** Flutter
- **Auth:** JWT-based authentication, bcrypt password hashing
- **Project Management:** Jira (sprint-based Agile)

## Project Structure

```
Ethio-Airbnb/
├── backend/     # Express REST API + PostgreSQL schema
├── web/         # React (Vite) web application
└── mobile/      # Flutter mobile application
```

Each folder has its own README with setup instructions specific to that part of the project.

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your local Postgres credentials
psql -U postgres -d ethio_airbnb -f sql/schema.sql
node server.js
```

### Web

```bash
cd web
npm install
npm run dev
```

### Mobile

```bash
cd mobile
flutter pub get
flutter run
```

## Development Methodology

Built using Agile, sprint-based development, tracked in Jira. Work is organized into feature branches (`backend/...`, `web/...`, `mobile/...`) merged into `dev`/`main` via reviewed pull requests.

## Scope

**In scope for this development cycle:** authentication, listing management, search/browse, booking with conflict prevention, reviews and ratings, simulated payment, basic admin moderation.

**Explicitly out of scope:** real payment gateway integration, in-app messaging, host financial analytics, multi-language support, push notifications.

## License

Educational project — developed for the INSA Cyber Talent Center Summer Camp program.
