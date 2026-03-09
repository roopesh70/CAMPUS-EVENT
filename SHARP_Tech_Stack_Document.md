# SHARP — Campus Event Management System
## Complete Tech Stack Document

**Version:** 1.0  
**Date:** March 9, 2026  
**App Name:** SHARP  
**Product:** Campus Event Management System  
**Document Type:** Technical Stack Specification  
**References:** PRD v1.1 · TECH.md · SHARP Design Document v1.0  

---

## Table of Contents

1. [Stack Overview](#1-stack-overview)
2. [Frontend](#2-frontend)
3. [Backend — Serverless (Firebase)](#3-backend--serverless-firebase)
4. [Database — Firestore](#4-database--firestore)
5. [Authentication & Security](#5-authentication--security)
6. [Storage](#6-storage)
7. [Notifications](#7-notifications)
8. [QR Code System](#8-qr-code-system)
9. [Certificate Generation](#9-certificate-generation)
10. [Analytics & Reporting](#10-analytics--reporting)
11. [AI Layer (Phased)](#11-ai-layer-phased)
12. [Deployment & Infrastructure](#12-deployment--infrastructure)
13. [Third-Party Integrations](#13-third-party-integrations)
14. [Folder Structure](#14-folder-structure)
15. [Firestore Data Schema](#15-firestore-data-schema)
16. [Firestore Security Rules](#16-firestore-security-rules)
17. [Environment Variables](#17-environment-variables)
18. [Performance Targets & NFRs](#18-performance-targets--nfrs)
19. [Phase-wise Feature Rollout](#19-phase-wise-feature-rollout)
20. [Tech Stack Decision Log](#20-tech-stack-decision-log)

---

## 1. Stack Overview

SHARP is a **serverless, full-stack web application** built on a modern JavaScript/TypeScript ecosystem. The architecture is optimized for rapid development, low operational overhead, real-time data, and future AI extensibility.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SHARP TECH STACK                            │
├─────────────────────────────────────────────────────────────────────┤
│  FRONTEND                     │  BACKEND (SERVERLESS)               │
│  ─────────────────────────    │  ──────────────────────────────     │
│  Next.js 15 (App Router)      │  Firebase Authentication            │
│  React 18                     │  Firestore (NoSQL Database)         │
│  TypeScript                   │  Firebase Cloud Functions           │
│  Tailwind CSS                 │  Firebase Storage                   │
│  Shadcn/UI                    │  Firebase Cloud Messaging (FCM)     │
│  React Hook Form + Zod        │                                     │
│  Zustand                      │  THIRD-PARTY                        │
│  lucide-react                 │  ──────────────────────────────     │
│                               │  SendGrid / AWS SES (Email)         │
│  DEPLOYMENT                   │  Twilio / AWS SNS (SMS)             │
│  ─────────────────────────    │  Gemini API (Future AI)             │
│  Vercel (Frontend)            │                                     │
│  Firebase (Backend)           │                                     │
└───────────────────────────────┴─────────────────────────────────────┘
```

### Why This Stack?

| Decision | Reason |
|----------|--------|
| **Next.js** | App Router enables server components, nested layouts, and streaming — ideal for a role-based multi-view app |
| **Firebase** | Serverless, real-time, zero infrastructure management — perfect for a campus-scale app |
| **TypeScript** | Strict typing across the entire codebase reduces runtime errors in complex RBAC logic |
| **Tailwind CSS** | Utility-first CSS enables the Neo-Brutalist design system from the Design Document with exact control |
| **Zustand** | Lightweight global state for role, active tab, and notification state — no Redux overhead |
| **Vercel** | Native Next.js deployment, preview URLs per branch, Edge Functions support |

---

## 2. Frontend

### 2.1 Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 15.x | App Router, server components, routing, layouts |
| `react` | 18.x | Component rendering, hooks |
| `react-dom` | 18.x | DOM rendering |
| `typescript` | 5.x | Static typing throughout the app |

**Next.js App Router is mandatory.** Pages directory is not used. All routes live under `app/`.

Key Next.js features used:
- **Server Components** — static event listings, public calendar, SEO-friendly pages
- **Client Components** — dashboard, QR scanner, real-time notification panels
- **Route Groups** — `(auth)` for login/register, `(dashboard)` for authenticated views
- **Middleware** — role-based route protection before page render
- **API Routes** — thin wrapper for Firebase Admin SDK operations (certificate generation, bulk exports)

### 2.2 Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | 3.x | Utility-first CSS, Neo-Brutalist design system |
| `shadcn/ui` | latest | Accessible base components (Dialog, Select, Tabs, Tooltip) |
| `class-variance-authority` | latest | Component variant management |
| `clsx` | latest | Conditional class merging |
| `tailwind-merge` | latest | Tailwind class deduplication |

**Tailwind configuration must include:**
```js
// tailwind.config.ts
theme: {
  extend: {
    fontFamily: {
      mono: ['ui-monospace', 'Cascadia Code', 'Source Code Pro', 'Menlo', 'monospace'],
    },
    colors: {
      sharp: {
        yellow:   '#FACC15',
        teal:     '#2DD4BF',
        pink:     '#F472B6',
        lavender: '#A78BFA',
        red:      '#EF4444',
        green:    '#4ADE80',
        bg:       '#FFFBEB',
      }
    },
    boxShadow: {
      'brutal-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
      'brutal':    '3px 3px 0px 0px rgba(0,0,0,1)',
      'brutal-lg': '4px 4px 0px 0px rgba(0,0,0,1)',
      'brutal-xl': '5px 5px 0px 0px rgba(0,0,0,1)',
      'brutal-card':'8px 8px 0px 0px rgba(0,0,0,1)',
    }
  }
}
```

### 2.3 Forms & Validation

| Package | Version | Purpose |
|---------|---------|---------|
| `react-hook-form` | 7.x | Performant form state, minimal re-renders |
| `zod` | 3.x | Schema-based validation for all form inputs |
| `@hookform/resolvers` | latest | Connects Zod schemas to React Hook Form |

**Used for:**
- Create Event 5-step form (event details, venue, resources, poster upload, submit)
- Login / Register forms
- Feedback submission form
- Admin system settings forms

**Example Zod schema (Create Event Step 1):**
```ts
const eventDetailsSchema = z.object({
  title:       z.string().min(5, 'Title must be at least 5 characters'),
  category:    z.enum(['technical', 'cultural', 'sports', 'academic', 'workshop', 'seminar', 'competition', 'social']),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  department:  z.string().min(1, 'Department is required'),
});
```

### 2.4 State Management

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | 4.x | Global client state — role, activeTab, notifications |

**Stores defined:**
- `useAuthStore` — current user, role (`student | organizer | admin`), uid
- `useUIStore` — active sidebar tab, sidebar open/closed, loading states
- `useNotificationStore` — unread count, notification list, real-time listener flag
- `useEventStore` — cached event list, filters applied, selected event

**No Redux. No Context API for global state.** Zustand is used exclusively.

### 2.5 UI Icons

| Package | Version | Purpose |
|---------|---------|---------|
| `lucide-react` | 0.263.1 | All icons across the app |

Full icon map is defined in the Design Document (Section 13). Key icons: `Home`, `Compass`, `Calendar`, `Bell`, `LayoutDashboard`, `ShieldCheck`, `BarChart2`, `MapPin`, `Database`, `Activity`, `Settings`.

### 2.6 Calendar UI

| Package | Version | Purpose |
|---------|---------|---------|
| `react-big-calendar` | latest | Campus calendar (monthly/weekly/daily/list views) |
| `date-fns` | 3.x | Date arithmetic, formatting, iCal export helpers |

**Calendar requirements from PRD:**
- Monthly, weekly, daily, and list view modes
- Color-coded events by category
- Past events display `outcomeStatus`: ✅ Success (green) / ❌ Failed (red)
- Role-filtered views (student sees registered events, admin sees all)

### 2.7 QR Code (Frontend)

| Package | Version | Purpose |
|---------|---------|---------|
| `qrcode.react` | 3.x | QR code generation for event check-in |
| `html5-qrcode` | 2.x | Web-based QR code scanning (camera access) |

See Section 8 for full QR system specification.

### 2.8 Data Fetching

| Package | Version | Purpose |
|---------|---------|---------|
| `firebase` (client SDK) | 10.x | Firestore real-time listeners, Auth state |
| `swr` | 2.x | Client-side data fetching with stale-while-revalidate for non-realtime data |

**Pattern:**
- Real-time data (notifications, live event counts, attendance) → Firestore `onSnapshot` listeners via custom hooks
- Static/slow-changing data (venue list, categories, user profile) → SWR with Firebase fetch
- Mutations (create event, register, approve) → direct Firestore writes or Cloud Function calls

---

## 3. Backend — Serverless (Firebase)

SHARP has **no custom backend server.** All server-side logic runs as Firebase Cloud Functions (Node.js 20 runtime).

### 3.1 Firebase Cloud Functions

| Function File | Triggers | Responsibility |
|--------------|----------|----------------|
| `eventLogic.ts` | Firestore `onCreate` on `bookings/`, HTTP | Conflict detection, approval routing, event status updates |
| `notificationEngine.ts` | Firestore `onWrite` on `events/`, `registrations/`, scheduled | Push/email/SMS triggers for all notification types |
| `aiEngine.ts` | HTTP callable | Gemini API proxy, conflict scoring (Phase 2+) |
| `certificateEngine.ts` | HTTP callable, Firestore `onWrite` | Bulk PDF certificate generation and upload to Storage |
| `reportEngine.ts` | HTTP callable | PDF/Excel/CSV report generation for admin |
| `authTriggers.ts` | Firebase Auth `onCreate`, `onDelete` | Auto-create Firestore user document, cleanup on delete |

**Runtime:** Node.js 20  
**Region:** Deploy to the region closest to the institution (e.g., `asia-south1` for India)  
**Memory:** 256MB default; `certificateEngine` and `reportEngine` set to 1GB

### 3.2 Key Cloud Function Logic

#### Conflict Detection (eventLogic.ts)
```
Trigger: onCreate on events/ collection (status = "pending")
Logic:
  1. Query Firestore for events with overlapping time AND same venueId
  2. If conflict found → set conflict flag, notify admin
  3. Suggest 3 alternative time slots (next available)
  4. Log conflict to admin activity log
```

#### Approval Routing (eventLogic.ts)
```
Trigger: onUpdate on events/ where status changes
Logic:
  Organizer submits → status: "pending"
  Admin approves  → status: "approved" → trigger participant notification
  Admin rejects   → status: "rejected" → notify organizer with comments
  Admin requests revision → status: "revision" → notify organizer
```

#### Notification Engine (notificationEngine.ts)
```
Triggers:
  - Event approved/rejected → notify organizer
  - Registration confirmed → notify student
  - Event reminder → scheduled job: 24h, 3h, 30min before event
  - Event cancelled or updated → notify all registered participants
  - Certificate ready → notify student

Channels per trigger:
  - In-app: always (write to notifications/ collection)
  - Email: registration confirmation, approval/rejection, certificates
  - SMS: cancellations, venue changes (critical only)
```

---

## 4. Database — Firestore

### 4.1 Why Firestore

- Real-time listeners for live attendance count, notification badges, registration numbers
- NoSQL document model maps cleanly to event/user/registration entities
- Scales automatically to 50,000+ students (PRD §6.2)
- Offline support natively available (attendance taking in low-connectivity venues)
- Tight integration with Firebase Auth and Cloud Functions

### 4.2 Collections

#### `users/{uid}`
```ts
{
  name:        string,
  email:       string,
  phone:       string,
  role:        "student" | "organizer" | "admin",
  department:  string,
  year:        number | null,           // null for organizer/admin
  preferences: {
    categories:    string[],            // e.g. ["technical", "cultural"]
    notifications: {
      email: boolean,
      sms:   boolean,
      inApp: boolean,
    }
  },
  createdAt:   Timestamp,
  lastLogin:   Timestamp,
}
```

#### `events/{eventId}`
```ts
{
  title:          string,
  description:    string,
  category:       "technical" | "cultural" | "sports" | "academic" |
                  "workshop"  | "seminar"  | "competition" | "social",
  organizerId:    string,               // uid reference
  venueId:        string,               // venues/{venueId}
  department:     string,
  startTime:      Timestamp,
  endTime:        Timestamp,
  capacity:       number,
  registeredCount:number,               // denormalized for performance
  status:         "draft" | "pending" | "approved" | "rejected" |
                  "revision" | "completed",
  outcomeStatus:  "success" | "failed" | null,
  eligibility: {
    departments:  string[],
    years:        number[],
    prerequisites:string[],             // eventId refs
  },
  resources:      string[],             // ["AV", "Catering", ...]
  posterUrl:      string,               // Firebase Storage URL
  bannerUrl:      string,
  approvalComment:string,
  conflictFlag:   boolean,
  createdAt:      Timestamp,
  updatedAt:      Timestamp,
}
```

#### `venues/{venueId}`
```ts
{
  name:       string,
  location:   string,
  capacity:   number,
  facilities: string[],              // ["projector", "AC", "whiteboard"]
  isActive:   boolean,
  blackoutDates: Timestamp[],
}
```

#### `registrations/{registrationId}`
```ts
{
  eventId:          string,
  userId:           string,
  registrationTime: Timestamp,
  status:           "confirmed" | "waitlisted" | "cancelled",
  attendanceStatus: "present" | "absent" | "pending",
  feedbackSubmitted: boolean,
  registrationId:   string,          // human-readable unique ID
}
```

#### `certificates/{certificateId}`
```ts
{
  eventId:          string,
  userId:           string,
  type:             "participation" | "volunteer" | "winner" | "organizer",
  issueDate:        Timestamp,
  certificateUrl:   string,          // Firebase Storage PDF URL
  verificationCode: string,          // unique public verification token
}
```

#### `notifications/{notificationId}`
```ts
{
  userId:    string,
  title:     string,
  message:   string,
  type:      "approval" | "registration" | "reminder" | "update" |
             "cancellation" | "certificate" | "system",
  channel:   "inApp" | "email" | "sms",
  read:      boolean,
  eventId:   string | null,
  createdAt: Timestamp,
}
```

#### `tasks/{taskId}`
```ts
{
  eventId:    string,
  title:      string,
  category:   "registration_desk" | "logistics" | "technical" | "hospitality",
  assignedTo: string,                // name only (not uid; volunteer shares organizer login)
  shiftStart: Timestamp,
  shiftEnd:   Timestamp,
  status:     "pending" | "in_progress" | "completed",
  createdAt:  Timestamp,
}
```

#### `feedback/{feedbackId}`
```ts
{
  eventId:   string,
  userId:    string | null,          // null if anonymous
  ratings: {
    content:       number,           // 1–5
    organization:  number,
    venue:         number,
    speaker:       number,
    overall:       number,
  },
  comment:   string,
  anonymous: boolean,
  createdAt: Timestamp,
}
```

#### `activityLogs/{logId}`
```ts
{
  actorId:   string,                 // uid
  role:      string,
  action:    string,                 // e.g. "approved_event", "generated_certificates"
  entityId:  string,
  entityType:"event" | "user" | "venue" | "certificate",
  ipAddress: string,
  createdAt: Timestamp,
}
```

### 4.3 Indexing Strategy

Composite indexes required (define in `firestore.indexes.json`):

| Collection | Fields Indexed | Query Use |
|------------|---------------|-----------|
| `events` | `venueId ASC`, `startTime ASC` | Conflict detection |
| `events` | `status ASC`, `createdAt DESC` | Admin approval queue |
| `events` | `organizerId ASC`, `status ASC` | Organizer my-events |
| `events` | `category ASC`, `startTime ASC` | Filtered event discovery |
| `registrations` | `eventId ASC`, `status ASC` | Participant list per event |
| `registrations` | `userId ASC`, `status ASC` | Student's my registrations |
| `notifications` | `userId ASC`, `read ASC`, `createdAt DESC` | User notification panel |
| `certificates` | `userId ASC`, `eventId ASC` | Student certificate history |
| `feedback` | `eventId ASC`, `createdAt DESC` | Event feedback aggregation |
| `activityLogs` | `actorId ASC`, `createdAt DESC` | User activity audit |

### 4.4 Data Retention Policy

| Data Type | Retention | Action After |
|-----------|-----------|-------------|
| Active events | Indefinite | — |
| Historical events | 5 years | Archive to cold storage |
| User activity logs | 2 years | Auto-delete via scheduled function |
| System audit logs | 1 year | Auto-delete via scheduled function |
| Feedback | Indefinite | Anonymize userId after 2 years |
| Notifications | 90 days | Auto-delete read notifications |

---

## 5. Authentication & Security

### 5.1 Firebase Authentication

| Feature | Configuration |
|---------|--------------|
| **Primary method** | Email + Password (institutional email enforced) |
| **SSO** | Firebase SAML / OIDC provider for campus identity system |
| **MFA** | Enforced for `admin` and `organizer` roles via Firebase Multi-Factor Auth |
| **Password reset** | Firebase built-in reset email flow |
| **Session duration** | 7 days for students; 8 hours for admin (re-auth required) |

**Institutional email enforcement (Cloud Function):**
```ts
// authTriggers.ts — onCreate
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const domain = user.email?.split('@')[1];
  const allowedDomains = ['yourcampus.edu.in']; // configurable
  if (!allowedDomains.includes(domain)) {
    await admin.auth().deleteUser(user.uid);
    return;
  }
  // Create Firestore user document
  await db.collection('users').doc(user.uid).set({
    email: user.email,
    role: 'student', // default role
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});
```

### 5.2 Role-Based Access Control (RBAC)

**Three finalized roles:**

| Role | Firebase Custom Claim | Access Level |
|------|-----------------------|-------------|
| `student` | `role: "student"` | Read events, register, view own records |
| `organizer` | `role: "organizer"` | All student + create events, manage attendance, certificates |
| `admin` | `role: "admin"` | Full platform access, approve events, manage users/venues |

**Custom claims are set by admin via Cloud Function.** Never set client-side.

```ts
// setUserRole Cloud Function (admin only callable)
await admin.auth().setCustomUserClaims(uid, { role: 'organizer' });
```

**Volunteer Access Model:**
- Volunteers have no separate role or account
- They log in using the Event Organizer's credentials
- All actions taken under organizer session are audit-logged with timestamps
- Scope: attendance taking, task status updates, certificate generation only

### 5.3 Middleware (Next.js)

```ts
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('__session');
  const role  = decodeToken(token)?.role;
  const path  = request.nextUrl.pathname;

  if (path.startsWith('/dashboard/admin') && role !== 'admin')
    return NextResponse.redirect('/unauthorized');

  if (path.startsWith('/dashboard/organizer') && !['organizer','admin'].includes(role))
    return NextResponse.redirect('/unauthorized');

  if (path.startsWith('/dashboard') && !role)
    return NextResponse.redirect('/login');
}
```

### 5.4 Security Requirements (from PRD §6.4)

| Requirement | Implementation |
|-------------|---------------|
| SSL/TLS for data in transit | Enforced by Vercel + Firebase (HTTPS only) |
| AES-256 at rest | Firebase/Firestore default encryption |
| OWASP Top 10 protection | Input validation via Zod, CSP headers via Next.js config |
| RBAC enforcement | Firestore security rules + middleware + custom claims |
| XSS prevention | React's default escaping + DOMPurify for rich text |
| CSRF protection | Firebase ID token on every request (stateless, no cookies for mutations) |
| API rate limiting | Cloud Functions rate limiting + Firebase App Check |
| Audit logging | All admin/organizer actions written to `activityLogs/` collection |
| IP whitelisting (admin) | Cloud Function middleware checks IP for sensitive admin operations |

### 5.5 Firebase App Check

Enabled to prevent abuse of Firebase resources by unauthorized clients.

```ts
// app/layout.tsx
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_KEY),
  isTokenAutoRefreshEnabled: true,
});
```

---

## 6. Storage

### 6.1 Firebase Storage

Used for all binary assets. Direct upload from client with security rules.

| Asset Type | Storage Path | Max Size | Formats |
|------------|-------------|----------|---------|
| Event posters | `events/{eventId}/poster.{ext}` | 5 MB | JPG, PNG, WebP |
| Event banners | `events/{eventId}/banner.{ext}` | 5 MB | JPG, PNG, WebP |
| Certificates (PDF) | `certificates/{userId}/{certId}.pdf` | 2 MB | PDF only |
| Certificate templates | `templates/{templateId}.pdf` | 2 MB | PDF only |

### 6.2 Storage Security Rules

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /events/{eventId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role in ['organizer', 'admin']
                   && request.resource.size < 5 * 1024 * 1024;
    }
    match /certificates/{userId}/{certId} {
      allow read: if request.auth.uid == userId
                  || request.auth.token.role == 'admin';
      allow write: if request.auth.token.role in ['organizer', 'admin'];
    }
    match /templates/{templateId} {
      allow read: if request.auth.token.role in ['organizer', 'admin'];
      allow write: if request.auth.token.role == 'admin';
    }
  }
}
```

---

## 7. Notifications

### 7.1 Channels

| Channel | Service | When Used |
|---------|---------|-----------|
| **In-app** | Firestore `notifications/` + real-time listener | All notification types, always |
| **Email** | SendGrid (primary) / AWS SES (fallback) | Registration confirmation, approval/rejection, certificates, reminders |
| **SMS** | Twilio (primary) / AWS SNS (fallback) | Critical only: cancellations, venue/time changes |
| **Push (future)** | Firebase Cloud Messaging (FCM) | Phase 3 — mobile app |

### 7.2 Notification Types & Channels Matrix

| Event | In-App | Email | SMS |
|-------|--------|-------|-----|
| Registration confirmed | ✅ | ✅ | ❌ |
| Event approved | ✅ | ✅ | ❌ |
| Event rejected | ✅ | ✅ | ❌ |
| Revision requested | ✅ | ✅ | ❌ |
| Reminder (24h before) | ✅ | ✅ | ❌ |
| Reminder (3h before) | ✅ | ❌ | ❌ |
| Reminder (30min before) | ✅ | ❌ | ❌ |
| Venue/time change | ✅ | ✅ | ✅ |
| Event cancelled | ✅ | ✅ | ✅ |
| Certificate ready | ✅ | ✅ | ❌ |
| System announcement | ✅ | ✅ | ❌ |
| Task assigned (volunteer) | ✅ | ❌ | ❌ |

### 7.3 Email Setup (SendGrid)

```ts
// lib/notifications.ts
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(to: string, templateId: string, data: object) {
  await sgMail.send({
    to,
    from: 'noreply@sharp.campus',
    templateId,                    // SendGrid dynamic template IDs
    dynamicTemplateData: data,
  });
}
```

### 7.4 User Notification Preferences

Stored in `users/{uid}.preferences.notifications`. Users can configure:
- Enable/disable per channel (in-app, email, SMS)
- Frequency: immediate | daily digest | weekly summary
- Do Not Disturb schedule (time range)
- Per-event unsubscribe

---

## 8. QR Code System

### 8.1 Generation

| Package | `qrcode.react` |
|---------|---------------|
| When | After admin approves event, a unique QR code is generated |
| What | Encodes `eventId` + `timestamp` + signed HMAC for tamper prevention |
| Display | On event detail page, organizer attendance tab, downloadable PNG |

```ts
// components/events/EventQRCode.tsx
import { QRCodeSVG } from 'qrcode.react';

const payload = JSON.stringify({ eventId, token: generateHMAC(eventId) });
<QRCodeSVG value={payload} size={256} level="H" />
```

### 8.2 Scanning

| Package | `html5-qrcode` |
|---------|---------------|
| Access | Organizer Attendance tab → QR Scan sub-tab |
| Device | Any device with camera (laptop webcam, phone browser) |
| Flow | Scan → decode → verify HMAC → mark attendance in Firestore → show confirmation |

**Offline mode:** Scans are queued in `localStorage` when offline and synced to Firestore on reconnect via a Cloud Function HTTP call.

### 8.3 Attendance Flow

```
Student presents QR (from their registration confirmation email / app)
        ↓
Organizer/Volunteer opens Attendance tab → QR Scan sub-tab
        ↓
html5-qrcode reads camera → decodes payload
        ↓
Client verifies HMAC signature (prevents fake QRs)
        ↓
Checks registrations/{id} — is student registered? Not already marked?
        ↓
Updates registrations/{id}.attendanceStatus = "present"
Updates events/{id}.attendanceCount++ (Firestore increment)
        ↓
UI shows green checkmark + student name
```

**Duplicate scan prevention:** Check `attendanceStatus !== "present"` before marking. Cloud Function enforces idempotency server-side.

---

## 9. Certificate Generation

### 9.1 Flow

```
Admin/Organizer clicks "Generate Certificates" →
  Cloud Function (certificateEngine.ts) invoked →
    Query registrations where eventId = X AND attendanceStatus = "present" →
    For each student:
      - Fetch user profile
      - Fill PDF template (PDFKit or pdf-lib)
      - Add unique verificationCode (UUID v4)
      - Add digital signature metadata
      - Upload to Firebase Storage: certificates/{uid}/{certId}.pdf
      - Write record to certificates/ collection
      - Trigger email notification with PDF link
```

### 9.2 Libraries

| Library | Purpose |
|---------|---------|
| `pdf-lib` | PDF template filling, text insertion, image embedding |
| `@pdf-lib/fontkit` | Custom font support for institutional branding |
| `uuid` | Unique certificate ID and verification code generation |

### 9.3 Certificate Types

| Type | Who Receives |
|------|-------------|
| Participation | All students who attended (attendanceStatus = "present") |
| Volunteer | Logged volunteer participants (task records under organizer account) |
| Winner | Manually assigned by organizer post-event |
| Organizer | Auto-generated for event organizer on completion |

### 9.4 Public Verification Portal

Route: `/verify/[verificationCode]` (public, no auth required)

Looks up `certificates/` where `verificationCode == param` → returns certificate details (event, student name, type, date). Does not expose personal email or ID.

---

## 10. Analytics & Reporting

### 10.1 In-App Analytics

All charts and dashboards are built using:

| Library | Purpose |
|---------|---------|
| `recharts` | Bar charts (registration trends, performance bars), line charts (engagement over semester) |
| `react-circular-progressbar` | Donut/circular charts (attendance rate, category engagement) |
| `date-fns` | Date grouping for time-series data |

**Admin analytics data is aggregated on read** from Firestore (no separate analytics DB in v1.0).

### 10.2 Report Export

| Format | Library | Trigger |
|--------|---------|---------|
| PDF | `pdf-lib` via Cloud Function | Admin clicks "Export PDF" |
| Excel (.xlsx) | `exceljs` via Cloud Function | Admin clicks "Export Excel" |
| CSV | Native string generation | Client-side for small datasets |
| iCal | `ical-generator` | Calendar export button |

**Export flow:** Client calls HTTP Cloud Function → function queries Firestore → generates file → uploads to temporary Storage path → returns signed URL → client triggers download.

### 10.3 Future External Analytics (Phase 3)

- Google Analytics 4 via `@next/third-parties` — page views, session duration
- Mixpanel (optional) — event-specific funnel tracking

---

## 11. AI Layer (Phased)

All AI features are gated by release phase. The Gemini API is accessed via Cloud Functions only — never directly from the client.

```
Client → Next.js API Route → Firebase Cloud Function → Gemini API → Response
```

### Phase 1 — Conflict Detection (MVP)
- Rule-based via Firestore queries (no AI required)
- Cloud Function checks overlapping `venueId + timeRange` on event submission
- Suggests 3 alternative slots from venue availability calendar

### Phase 2 — AI Priority Scoring (Month 4–5)
- Gemini API scores event proposals by: event importance, department priority, historical attendance, peak hour patterns
- `priorityScore: number` stored on `events/` document
- Admin approval queue sorted by priority score

### Phase 3 — AI Assistant (Month 6–8)
- Natural language queries: "Is the auditorium free tomorrow?", "Suggest available slots for a 200-person event"
- Architecture: User input → Cloud Function → Gemini API with Firestore context injected → structured response
- Displayed in a chat-style widget in the admin/organizer sidebar

### Phase 4 — Predictive Analytics (Post v1.0)
- Peak booking hours prediction
- Underutilized venue identification
- At-risk student engagement alerts
- Automated scheduling suggestions

### AI Configuration

```ts
// lib/ai.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

export async function queryAI(prompt: string): Promise<string> {
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

---

## 12. Deployment & Infrastructure

### 12.1 Frontend — Vercel

| Setting | Value |
|---------|-------|
| Framework preset | Next.js |
| Node.js version | 20.x |
| Build command | `next build` |
| Output directory | `.next` |
| Environment | Production / Preview / Development |

**Branch strategy:**
- `main` → Production deployment (sharp.campus)
- `develop` → Preview deployment (auto-URL per commit)
- Feature branches → Preview URL per PR

**Vercel Edge Config** used for feature flags (AI feature gating by phase).

### 12.2 Backend — Firebase

| Service | Plan |
|---------|------|
| Firebase project | Blaze (pay-as-you-go) — required for Cloud Functions |
| Firestore mode | Native mode |
| Functions runtime | Node.js 20 |
| Functions region | `asia-south1` (or nearest to institution) |
| Storage bucket | Default Firebase Storage bucket |

### 12.3 CI/CD Pipeline

```
Developer pushes to feature branch
        ↓
GitHub Actions runs:
  - TypeScript type check (tsc --noEmit)
  - ESLint + Prettier check
  - Unit tests (Jest)
  - Build check (next build)
        ↓
PR opened → Vercel deploys preview URL
        ↓
PR merged to develop → Vercel preview + Firebase Functions deployed to staging
        ↓
develop merged to main → Vercel production deploy + Firebase Functions deployed to prod
```

**GitHub Actions workflow files:**
- `.github/workflows/ci.yml` — lint + test on every push
- `.github/workflows/deploy.yml` — deploy on merge to main/develop

### 12.4 Monitoring & Alerting

| Tool | Purpose |
|------|---------|
| Firebase Performance Monitoring | Page load times, network request latency |
| Firebase Crashlytics (web) | JavaScript error tracking |
| Vercel Analytics | Web vitals, page-level performance |
| Firebase Cloud Functions logs | Cloud Logging (Google Cloud Console) |
| Uptime monitoring | Better Uptime or UptimeRobot — alerts on 99.5% SLA breach |

---

## 13. Third-Party Integrations

### 13.1 Required (Phase 1)

| Service | Purpose | SDK/API |
|---------|---------|---------|
| **SendGrid** | Transactional email (registration, approval, certificates) | `@sendgrid/mail` |
| **Firebase Authentication** | Auth, MFA, SSO | Firebase client SDK |
| **Firestore** | Primary database | Firebase client + admin SDK |
| **Firebase Storage** | File storage | Firebase client + admin SDK |
| **Firebase Cloud Functions** | Serverless business logic | `firebase-functions` |
| **Firebase Cloud Messaging** | In-app + push notifications | Firebase client SDK |
| **Vercel** | Frontend hosting and deployment | CLI + GitHub integration |

### 13.2 Required (Phase 2)

| Service | Purpose | SDK/API |
|---------|---------|---------|
| **Twilio** | SMS for critical notifications | `twilio` npm package |
| **html5-qrcode** | QR scanning in browser | npm package |
| **pdf-lib** | Certificate PDF generation | npm package |

### 13.3 Optional / Future

| Service | Purpose | Phase |
|---------|---------|-------|
| **Gemini API** | AI assistant, conflict scoring, predictive analytics | 2–4 |
| **Google Analytics 4** | Usage tracking, funnel analytics | 3 |
| **LMS Integration** | Sync event attendance with learning records | Post v1.0 |
| **SIS Integration** | Student information system sync | Post v1.0 |
| **Google Calendar / Outlook** | External calendar export | Post v1.0 |
| **Zoom / MS Teams** | Hybrid/virtual event support | Post v1.0 |
| **Payment Gateway** | Paid event ticketing | Post v1.0 |

---

## 14. Folder Structure

```
sharp/
│
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Route group — no layout wrapper
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   │
│   ├── (public)/                     # Public pages — no auth required
│   │   ├── page.tsx                  # Home / landing
│   │   ├── explore/
│   │   │   └── page.tsx
│   │   ├── calendar/
│   │   │   └── page.tsx
│   │   ├── announcements/
│   │   │   └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── verify/
│   │       └── [code]/
│   │           └── page.tsx          # Public certificate verification
│   │
│   ├── dashboard/
│   │   ├── layout.tsx                # Shared sidebar + topbar layout
│   │   ├── student/
│   │   │   ├── page.tsx              # Student dashboard
│   │   │   ├── discover/page.tsx
│   │   │   ├── calendar/page.tsx
│   │   │   ├── registrations/page.tsx
│   │   │   ├── certificates/page.tsx
│   │   │   ├── feedback/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   └── profile/page.tsx
│   │   │
│   │   ├── organizer/
│   │   │   ├── page.tsx              # Organizer dashboard
│   │   │   ├── my-events/page.tsx
│   │   │   ├── create/page.tsx       # 5-step create event flow
│   │   │   ├── participants/page.tsx
│   │   │   ├── attendance/page.tsx
│   │   │   ├── certificates/page.tsx
│   │   │   ├── tasks/page.tsx
│   │   │   ├── updates/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   └── profile/page.tsx
│   │   │
│   │   └── admin/
│   │       ├── page.tsx              # Admin dashboard
│   │       ├── approvals/page.tsx
│   │       ├── calendar/page.tsx
│   │       ├── venues/page.tsx
│   │       ├── users/page.tsx
│   │       ├── analytics/page.tsx
│   │       ├── notifications/page.tsx
│   │       ├── settings/page.tsx
│   │       ├── data/page.tsx
│   │       ├── logs/page.tsx
│   │       └── profile/page.tsx
│   │
│   ├── api/                          # Next.js API routes (thin Firebase wrappers)
│   │   ├── certificates/route.ts
│   │   ├── reports/route.ts
│   │   └── export/route.ts
│   │
│   ├── layout.tsx                    # Root layout (font, providers)
│   └── globals.css
│
├── components/
│   ├── ui/                           # Neo-Brutalist base components
│   │   ├── BrutalCard.tsx
│   │   ├── BrutalButton.tsx
│   │   ├── BrutalInput.tsx
│   │   ├── Badge.tsx
│   │   └── StatCard.tsx
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── Footer.tsx
│   │
│   ├── calendar/
│   │   ├── CampusCalendar.tsx
│   │   └── EventPill.tsx             # Color-coded event markers
│   │
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── EventGrid.tsx
│   │   ├── EventDetail.tsx
│   │   ├── CreateEventForm.tsx       # 5-step wizard
│   │   └── EventQRCode.tsx
│   │
│   ├── attendance/
│   │   ├── QRScanner.tsx
│   │   └── ManualEntry.tsx
│   │
│   ├── certificates/
│   │   └── CertificateCard.tsx
│   │
│   ├── notifications/
│   │   └── NotificationPanel.tsx
│   │
│   └── analytics/
│       ├── BarChart.tsx
│       └── DonutChart.tsx
│
├── lib/
│   ├── firebase.ts                   # Firebase app initialization
│   ├── firebase-admin.ts             # Firebase Admin SDK (server-side only)
│   ├── auth.ts                       # Auth helpers (getSession, requireRole)
│   ├── firestore.ts                  # Firestore query helpers
│   ├── storage.ts                    # Storage upload/download helpers
│   ├── notifications.ts              # SendGrid + Twilio wrappers
│   └── ai.ts                         # Gemini API wrapper (Phase 2+)
│
├── hooks/
│   ├── useAuth.ts                    # Auth state + role
│   ├── useEvents.ts                  # Firestore event queries + listeners
│   ├── useNotifications.ts           # Real-time notification listener
│   ├── useAttendance.ts              # Attendance state + QR flow
│   └── useRegistration.ts            # Registration + waitlist logic
│
├── stores/
│   ├── authStore.ts                  # Zustand — user, role, uid
│   ├── uiStore.ts                    # Zustand — sidebar, active tab
│   └── notificationStore.ts          # Zustand — unread count, list
│
├── types/
│   ├── user.ts
│   ├── event.ts
│   ├── registration.ts
│   ├── certificate.ts
│   ├── notification.ts
│   └── venue.ts
│
├── utils/
│   ├── formatDate.ts
│   ├── generateHMAC.ts               # QR code signing
│   ├── exportCSV.ts
│   └── roleGuard.ts
│
├── middleware.ts                     # Route protection by role
│
├── functions/                        # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts                  # Function exports
│   │   ├── eventLogic.ts
│   │   ├── notificationEngine.ts
│   │   ├── certificateEngine.ts
│   │   ├── reportEngine.ts
│   │   ├── aiEngine.ts
│   │   └── authTriggers.ts
│   ├── package.json
│   └── tsconfig.json
│
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── firebase.json
├── .firebaserc
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.local
```

---

## 15. Firestore Data Schema

Full schema documented in Section 4.2. Quick reference:

| Collection | Key Fields | Relationships |
|------------|-----------|---------------|
| `users` | uid, role, department | Referenced by events, registrations, certificates |
| `events` | organizerId, venueId, status, outcomeStatus | Links to venues, users |
| `venues` | capacity, facilities, isActive | Referenced by events |
| `registrations` | eventId, userId, attendanceStatus | Links events to users |
| `certificates` | eventId, userId, verificationCode | Links events to users |
| `notifications` | userId, type, eventId | Per-user, per-event |
| `tasks` | eventId, status, shiftStart | Per-event organizer tasks |
| `feedback` | eventId, userId (nullable) | Per-event, optional anon |
| `activityLogs` | actorId, action, entityId | All admin/organizer actions |

---

## 16. Firestore Security Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function getRole() {
      return request.auth.token.role;
    }

    function isAdmin() {
      return getRole() == 'admin';
    }

    function isOrganizer() {
      return getRole() in ['organizer', 'admin'];
    }

    function isStudent() {
      return isAuthenticated();
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // USERS
    match /users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow write: if isAuthenticated() && isOwner(userId);
      allow update: if isAdmin(); // admin can update roles
    }

    // EVENTS
    match /events/{eventId} {
      allow read: if true; // public read for event discovery
      allow create: if isOrganizer();
      allow update: if isOrganizer() &&
        (resource.data.organizerId == request.auth.uid || isAdmin());
      allow delete: if isAdmin();
    }

    // VENUES
    match /venues/{venueId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // REGISTRATIONS
    match /registrations/{regId} {
      allow read: if isAuthenticated() &&
        (resource.data.userId == request.auth.uid || isOrganizer());
      allow create: if isAuthenticated();
      allow update: if isOrganizer(); // attendance marking
      allow delete: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
    }

    // CERTIFICATES
    match /certificates/{certId} {
      allow read: if isAuthenticated() &&
        (resource.data.userId == request.auth.uid || isAdmin());
      allow write: if isOrganizer();
    }

    // NOTIFICATIONS
    match /notifications/{notifId} {
      allow read: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow create: if isOrganizer(); // system creates via Cloud Functions
      allow update: if isAuthenticated() &&
        resource.data.userId == request.auth.uid; // mark as read
      allow delete: if isAdmin();
    }

    // TASKS
    match /tasks/{taskId} {
      allow read: if isOrganizer();
      allow write: if isOrganizer();
    }

    // FEEDBACK
    match /feedback/{feedbackId} {
      allow read: if isOrganizer();
      allow create: if isAuthenticated();
      allow delete: if isAdmin();
    }

    // ACTIVITY LOGS
    match /activityLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated(); // system writes
      allow update, delete: if false;    // immutable
    }
  }
}
```

---

## 17. Environment Variables

```bash
# .env.local

# Firebase (client-side — safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Firebase App Check
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=

# Firebase Admin (server-side only — never expose to client)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Email (server-side)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@sharp.campus

# SMS (server-side)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# AI (server-side, Phase 2+)
GEMINI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://sharp.campus
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=yourcampus.edu.in
```

---

## 18. Performance Targets & NFRs

From PRD §6 — all targets mapped to implementation:

| Requirement | Target | Implementation |
|-------------|--------|---------------|
| Page load time | < 2 seconds (95th percentile) | Next.js server components, Vercel Edge CDN, image optimization |
| Concurrent users | 5,000 without degradation | Firebase scales automatically; Vercel handles traffic spikes |
| QR scan response | < 1 second | Client-side decode + single Firestore write |
| Search results | < 500ms | Firestore composite index queries; SWR cache |
| Report generation | < 10 seconds | Cloud Function with 1GB memory for PDF/Excel export |
| System uptime | 99.5% SLA | Firebase + Vercel SLAs both exceed 99.9% |
| Data loss tolerance | RPO = 0 | Firestore real-time replication across regions |
| Disaster recovery | RTO = 4 hours | Firebase automated daily backups + point-in-time recovery |
| Browser support | Chrome, Firefox, Safari, Edge (last 2 versions) | Next.js + Tailwind — no IE support needed |
| Viewport support | 320px – 2560px | Tailwind responsive breakpoints (sm/md/lg/xl) |
| Accessibility | WCAG 2.1 Level AA | Shadcn/UI base components are ARIA-compliant |
| Certificate batch | < 5 min for 100 certificates | Parallel Promise.all in Cloud Function |

---

## 19. Phase-wise Feature Rollout

### Phase 1 — MVP (Month 1–3)

**Stack components active:**
- Next.js + React + TypeScript + Tailwind + Shadcn/UI
- Firebase Auth (email/password)
- Firestore (users, events, venues, registrations, notifications)
- Firebase Storage (posters only)
- Firebase Cloud Functions (eventLogic, notificationEngine, authTriggers)
- SendGrid (email only)
- Vercel deployment
- Manual attendance (no QR)
- Basic reporting (client-side CSV)

**Success criteria:** 100 students onboarded, 10 events hosted, 70% satisfaction

### Phase 2 — Enhanced (Month 4–5)

**Stack additions:**
- `html5-qrcode` — QR scanning
- `qrcode.react` — QR generation
- `pdf-lib` — certificate generation (certificateEngine Cloud Function)
- Twilio — SMS for critical notifications
- FCM — in-app push notifications
- Recharts — analytics dashboards
- AI Phase 1: Rule-based conflict detection (no Gemini yet)

**Success criteria:** 500+ students, 50+ events/month, 80% reduction in manual admin work

### Phase 3 — Full Platform (Month 6–8)

**Stack additions:**
- `react-big-calendar` — full calendar with advanced views
- Gemini API — AI assistant + priority scoring (aiEngine Cloud Function)
- `exceljs` — Excel report export
- `ical-generator` — iCal calendar export
- `pdf-lib` — PDF report export (reportEngine Cloud Function)
- Google Analytics 4 — usage analytics
- Advanced Zustand stores — event filter persistence, recommendations

**Success criteria:** 80% student body registered, 90% conflict reduction, 85% satisfaction

### Phase 4 — Post v1.0

- Native iOS/Android apps (React Native or Expo)
- Payment gateway integration
- Virtual/hybrid event support (Zoom/Teams embed)
- Multi-institution support (multi-tenancy)
- Advanced AI: predictive analytics, automated scheduling

---

## 20. Tech Stack Decision Log

| Decision | Chosen | Alternatives Considered | Reason |
|----------|--------|------------------------|--------|
| Frontend framework | Next.js 15 | Vite + React, Remix | App Router for role-based layouts, SSR for public pages, Vercel integration |
| Language | TypeScript | JavaScript | RBAC logic, Firestore schema, complex form validation — strict typing prevents runtime bugs |
| CSS framework | Tailwind CSS | CSS Modules, Styled Components | Neo-Brutalist design requires precise pixel-level control; utility classes are faster |
| Component library | Shadcn/UI | Material-UI, Ant Design, Chakra | Unstyled accessible base + fully customizable for brutalist aesthetic; not a black box |
| State management | Zustand | Redux Toolkit, Jotai, Context API | Lightweight, no boilerplate, simple for role + UI state, TypeScript-friendly |
| Database | Firestore | PostgreSQL, MySQL, Supabase | Real-time listeners for attendance/notifications, serverless, Firebase ecosystem lock-in is acceptable |
| Auth | Firebase Auth | NextAuth.js, Supabase Auth | Native Firebase integration, MFA support, SSO/SAML for campus systems |
| Backend | Firebase Cloud Functions | Node.js/Express server, Supabase Edge Functions | Serverless = no server management, scales with Firestore, same Firebase ecosystem |
| Hosting | Vercel | Netlify, AWS Amplify, Firebase Hosting | Native Next.js support, preview deployments, Edge Functions |
| Form handling | React Hook Form + Zod | Formik, native React state | Performance (uncontrolled inputs), Zod schema reuse between client and server |
| Email | SendGrid | Nodemailer, AWS SES, Resend | Reliable delivery, dynamic templates, good free tier |
| SMS | Twilio | AWS SNS, MSG91 | Industry standard, easy integration, reliable delivery |
| AI | Gemini API | OpenAI GPT-4, Anthropic Claude | Google ecosystem alignment with Firebase/GCP, Cloud Functions integration |
| QR scanning | html5-qrcode | ZXing, instascan | Actively maintained, web-only (no native app needed for v1.0) |
| Certificate PDF | pdf-lib | PDFKit, jsPDF | Works in both browser and Node.js (Cloud Functions), no native dependencies |

---

*This document covers the complete technical stack for SHARP v1.0 through Phase 3. It should be updated as stack decisions evolve through development.*

*Sources: PRD v1.1 · TECH.md · SHARP Design Document v1.0*  
*Last updated: March 9, 2026*
