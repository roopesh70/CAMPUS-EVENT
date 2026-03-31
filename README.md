<p align="center">
  <img src="sharp/src/app/favicon.ico" alt="SHARP Logo" width="80" />
</p>

<h1 align="center">SHARP — Campus Event Management System</h1>

<p align="center">
  A centralized digital platform for managing the complete lifecycle of campus events — from proposal to certificates.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zustand-5-443E38" alt="Zustand" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [Firebase Configuration](#-firebase-configuration)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**SHARP** is a full-featured Campus Event Management System designed for educational institutions. It streamlines event creation, discovery, registration, attendance tracking, certificate generation, and analytics — all in one place. The platform serves three distinct user roles with tailored dashboards and workflows, wrapped in a bold **Neobrutalist** UI design.

---

## ✨ Features

### 🏠 Public
- **Event Discovery** — Browse and explore all campus events with advanced filters
- **Campus Calendar** — Unified calendar view (monthly / weekly / daily) of all approved events
- **Announcements** — Institution-wide announcements and updates

### 🎓 Student
- **Personalized Dashboard** — Upcoming events, quick stats, and recommendations
- **Event Registration** — One-click registration with capacity management and waitlisting
- **My Registrations** — Track confirmed, waitlisted, and past registrations
- **Certificates** — View and download participation certificates (PDF)
- **Feedback** — Submit post-event ratings and reviews

### 🎪 Organizer
- **Event Creation** — Multi-step event proposal wizard with draft support
- **My Events** — Manage drafted, pending, approved, and completed events
- **Participant Management** — View registrants, export lists
- **QR Attendance** — Generate event QR codes and scan for real-time attendance
- **Certificate Generation** — Bulk-generate personalized certificates from templates
- **Task Management** — Assign and track event-day volunteer tasks
- **Feedback Insights** — Aggregated ratings and comments for your events
- **Event Updates** — Post updates and changes to registered participants
- **Analytics** — Registration vs. attendance metrics, performance charts

### 🛡️ Administrator
- **Admin Dashboard** — System health, pending approvals, key metrics at a glance
- **Event Approvals** — Review, approve, reject, or request revisions on proposals
- **Venue Management** — CRUD for campus venues with capacity and facility tracking
- **User Management** — View and manage all platform users and roles
- **Certificate Templates** — Create and customize certificate templates (layouts, colors, logos, signatures)
- **System Notifications** — Send institution-wide announcements
- **Analytics & Reports** — Campus-wide event statistics and engagement trends
- **System Settings** — Maintenance mode, academic year, event categories, social links, legal content
- **Data Management** — Archive, backup, and manage event data
- **Activity Logs** — Immutable audit trail of all system actions

### 🔐 Security
- **Firebase Authentication** with email/password
- **Role-Based Access Control (RBAC)** enforced at database level via Firestore Security Rules
- Maintenance mode and role-based access restrictions

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **State Management** | [Zustand 5](https://zustand-demo.pmnd.rs/) |
| **Auth & Database** | [Firebase 12](https://firebase.google.com/) (Auth, Firestore, Storage) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **QR Codes** | [qrcode](https://www.npmjs.com/package/qrcode) + [html5-qrcode](https://www.npmjs.com/package/html5-qrcode) |
| **PDF Generation** | [jsPDF](https://www.npmjs.com/package/jspdf) |
| **Sanitization** | [isomorphic-dompurify](https://www.npmjs.com/package/isomorphic-dompurify) |
| **Image Hosting** | [Cloudinary](https://cloudinary.com/) (via custom hook) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐ │
│  │  Zustand  │  │  React   │  │  Next.js App      │ │
│  │  Stores   │  │  Hooks   │  │  Router (page.tsx)│ │
│  └──────────┘  └──────────┘  └───────────────────┘ │
│         │            │               │              │
│  ┌──────┴────────────┴───────────────┴──────────┐  │
│  │              Component Layer                   │  │
│  │  Views · Layout · UI · Auth · Events · Notifs │  │
│  └───────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │ Firebase SDK
┌───────────────────────┴─────────────────────────────┐
│                  FIREBASE SERVICES                   │
│  ┌────────────┐ ┌────────────┐ ┌─────────────────┐ │
│  │    Auth     │ │  Firestore │ │  Cloud Storage  │ │
│  │ (Email/Pwd)│ │  (NoSQL)   │ │    (Posters)    │ │
│  └────────────┘ └────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Single-Page Architecture**: The app uses a tab-based navigation system driven by `uiStore` (Zustand) and `NAV_CONFIG` constants. A single `page.tsx` renders role-specific views (`PublicView`, `StudentView`, `OrganizerView`, `AdminView`) based on the authenticated user's role.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Firebase** project with Authentication, Firestore, and Storage enabled
- A **Cloudinary** account (for poster/image uploads)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/roopesh70/CAMPUS-EVENT.git
cd CAMPUS-EVENT/sharp

# 2. Install dependencies
npm install

# 3. Set up environment variables (see section below)
cp .env.local.example .env.local

# 4. Deploy Firestore rules & indexes
firebase deploy --only firestore:rules,firestore:indexes

# 5. Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**.

---

## 📁 Project Structure

```
CAMPUS-EVENT/
├── Campus_Event_Management_System_PRD.md   # Product Requirements Document
├── SHARP_Design_Document.md                # UI/UX Design Spec
├── SHARP_Tech_Stack_Document.md            # Technical Architecture Spec
│
└── sharp/                                  # Next.js Application
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx                  # Root layout (AuthProvider, Toasts)
    │   │   ├── page.tsx                    # Main SPA entry (role-based routing)
    │   │   ├── globals.css                 # Global styles
    │   │   └── api/                        # API routes
    │   │
    │   ├── components/
    │   │   ├── auth/                       # LoginForm, RegisterForm, AuthGuard
    │   │   ├── events/                     # EventDetailModal
    │   │   ├── layout/                     # Sidebar, Topbar, Footer
    │   │   ├── notifications/              # ToastNotifications
    │   │   ├── ui/                         # BrutalButton, BrutalCard, Badge, etc.
    │   │   └── views/                      # All page-level views
    │   │       ├── PublicHome.tsx
    │   │       ├── ExploreEvents.tsx
    │   │       ├── CalendarView.tsx
    │   │       ├── StudentDashboard.tsx
    │   │       ├── OrganizerViews.tsx       # Organizer Dashboard + Create Event
    │   │       ├── AdminViews.tsx           # Admin Dashboard + Approvals
    │   │       ├── AllViews.tsx             # 20+ feature pages (large barrel)
    │   │       └── AuthPageView.tsx
    │   │
    │   ├── hooks/                          # Custom React hooks
    │   │   ├── useAuth.ts                  # Authentication logic
    │   │   ├── useEvents.ts                # CRUD for events
    │   │   ├── useRegistrations.ts         # Registration & cancellation
    │   │   ├── useCertificates.ts          # Certificate generation
    │   │   ├── useFeedback.ts              # Feedback submission & queries
    │   │   ├── useNotifications.ts         # In-app notification system
    │   │   ├── useVenues.ts                # Venue data fetching
    │   │   ├── useCloudinary.ts            # Image upload to Cloudinary
    │   │   ├── useSettings.ts              # System settings management
    │   │   ├── useTasks.ts                 # Event task management
    │   │   └── useActivityLogs.ts          # Audit log queries
    │   │
    │   ├── stores/                         # Zustand state stores
    │   │   ├── authStore.ts                # Auth state (user, role, loading)
    │   │   └── uiStore.ts                  # UI state (activeTab, sidebarOpen)
    │   │
    │   ├── lib/                            # Utilities & configuration
    │   │   ├── firebase.ts                 # Firebase app initialization
    │   │   ├── firestore.ts                # Firestore helper functions
    │   │   ├── storage.ts                  # Firebase Storage helpers
    │   │   ├── constants.ts                # NAV_CONFIG, COLORS, roles
    │   │   ├── certificateRenderer.ts      # Canvas-based certificate PDF rendering
    │   │   └── utils.ts                    # General utility functions
    │   │
    │   └── types/
    │       └── index.ts                    # All TypeScript interfaces & types
    │
    ├── firestore.rules                     # Firestore security rules
    ├── firestore.indexes.json              # Firestore composite indexes
    ├── storage.rules                       # Firebase Storage security rules
    ├── firebase.json                       # Firebase project config
    ├── package.json
    ├── tsconfig.json
    └── next.config.ts
```

---

## 👥 User Roles

| Role | Access Level | Key Capabilities |
|------|-------------|-----------------|
| **Public** | Unauthenticated | Browse events, view calendar, read announcements |
| **Student** | Authenticated | Register for events, track participation, download certificates, give feedback |
| **Organizer** | Authenticated | Create & manage events, track attendance via QR, generate certificates, view analytics |
| **Admin** | Authenticated | Approve/reject events, manage venues & users, system settings, full analytics, audit logs |

---

## 🔥 Firebase Configuration

### Firestore Collections

| Collection | Description |
|-----------|------------|
| `users` | User profiles with roles and preferences |
| `events` | All events with status lifecycle tracking |
| `venues` | Campus venue database |
| `registrations` | Event registration records |
| `certificates` | Issued certificates with verification codes |
| `certificateTemplates` | Admin-managed certificate templates |
| `notifications` | In-app notification records |
| `tasks` | Event-day task assignments |
| `feedback` | Post-event ratings and comments |
| `activityLogs` | Immutable audit log (append-only) |
| `settings` | System-wide configuration |

### Security Rules Highlights
- Events are **publicly readable** for discovery
- Event creation requires valid time ranges; only admins can create pre-approved events
- Organizers cannot self-approve their own events
- Registration/attendance count updates are permitted for any authenticated user
- Activity logs are **append-only** (no updates or deletes)
- System settings are **admin-write only**

---

## 🔐 Environment Variables

Create a `.env.local` file inside the `sharp/` directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

---

## 📜 Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Create production build
npm run start    # Serve production build
npm run lint     # Run ESLint
```

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is developed as part of an academic semester project (S4).

---

<p align="center">
  Built with ❤️ using Next.js, React, Firebase & TypeScript
</p>
