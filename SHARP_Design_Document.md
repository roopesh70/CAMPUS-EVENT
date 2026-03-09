# SHARP — Campus Event Management System
## Complete UI/UX Design Document

**Version:** 1.0  
**Date:** March 9, 2026  
**App Name:** SHARP  
**Product:** Campus Event Management System  
**Document Type:** Design & UI Specification  

---

## Table of Contents

1. [Design Overview](#1-design-overview)
2. [Design Language — Neo-Brutalism](#2-design-language--neo-brutalism)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Core UI Components](#5-core-ui-components)
6. [Layout & Navigation Architecture](#6-layout--navigation-architecture)
7. [Role-Based Access & Views](#7-role-based-access--views)
8. [Page-by-Page Screen Specifications](#8-page-by-page-screen-specifications)
   - 8.1 [Public Views](#81-public-views)
   - 8.2 [Student Views](#82-student-views)
   - 8.3 [Event Organizer Views](#83-event-organizer-views)
   - 8.4 [Administrator Views](#84-administrator-views)
9. [Component Library Reference](#9-component-library-reference)
10. [Interaction & Animation Patterns](#10-interaction--animation-patterns)
11. [Responsive Design](#11-responsive-design)
12. [Footer](#12-footer)
13. [Icon System](#13-icon-system)
14. [Design Checklist](#14-design-checklist)

---

## 1. Design Overview

SHARP is a campus event management web application built with **React + Next.js** and **Firebase** as the backend. It serves four distinct user roles — Public, Student, Event Organizer, and Administrator — each with a dedicated, role-appropriate interface.

The application is a **single-page app** with a persistent left sidebar navigation and a fixed top bar. Content changes dynamically based on the active role and selected tab, using smooth fade/slide-in transitions.

### Design Goals
- Bold, opinionated visual identity that stands out from generic campus apps
- High information density without cluttering the UI
- Role-specific navigation and functionality with zero ambiguity
- Accessible, keyboard-navigable layouts
- Mobile-responsive with sidebar collapse support

---

## 2. Design Language — Neo-Brutalism

SHARP uses a **Neo-Brutalist** design style — a modern evolution of brutalism applied to digital UI. This is the most important design principle in the app and must be applied consistently.

### Core Neo-Brutalist Rules

| Principle | Implementation |
|-----------|----------------|
| **Bold borders** | All cards, buttons, and inputs use `border: 2.5px solid black` |
| **Hard drop shadows** | Elements have `box-shadow: 4px 4px 0px 0px rgba(0,0,0,1)` — no blur, solid offset |
| **Uppercase typography** | Labels, headings, and buttons are ALL CAPS |
| **Italic + monospace font** | `font-family: monospace` throughout; headings often italic |
| **High contrast** | Black borders on vivid solid-color backgrounds |
| **Interactive shadow collapse** | On hover/click, shadow collapses and element shifts 1-2px — simulating a button press |
| **Thick bottom borders** | Cards use `border-bottom: 5-8px solid black` for a "stamp" look |
| **Rounded but chunky corners** | `border-radius: 1.25rem` (20px) for cards; `border-radius: 0.75rem` (12px) for buttons/inputs |

### What to Avoid
- Soft gradients or glass morphism effects
- Thin or absent borders
- Drop shadows with blur radius
- Pastel washes or muted tones as backgrounds
- Generic sans-serif without weight contrast

---

## 3. Color System

### Primary Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Yellow** | `#FACC15` | Primary CTA buttons, active nav items, highlights, organizer accents |
| **Teal** | `#2DD4BF` | Secondary actions, admin stat cards, calendar highlights, filter buttons |
| **Pink** | `#F472B6` | Alert badges, register buttons, cultural event tags, admin pending cards |
| **Lavender** | `#A78BFA` | Student dashboard header, admin conflict cards, history event sections |
| **Red** | `#EF4444` | LIVE badges, reject buttons, notification dots, error states |
| **Green** | `#4ADE80` | Approve buttons, success states |
| **Background** | `#FFFBEB` | Warm off-white — main app background (cream/lemon tint) |
| **Black** | `#000000` | All borders, shadows, text on colored backgrounds |
| **White** | `#FFFFFF` | Card backgrounds, input fields, sidebar background |
| **Slate-50** | `#F8FAFC` | Hover states on white surfaces |

### Color-to-Role Mapping

| Role/Context | Accent Color |
|---|---|
| Student Dashboard header | Lavender (`#A78BFA`) |
| Event Organizer — Active Events | Teal (`#2DD4BF`) |
| Event Organizer — Drafts | Yellow (`#FACC15`) |
| Event Organizer — History | Lavender (`#A78BFA`) |
| Event Organizer — Reviews | Pink (`#F472B6`) |
| Admin — Total Students stat | Teal |
| Admin — Active Events stat | Yellow |
| Admin — Pending stat | Pink |
| Admin — Conflicts stat | Lavender |
| Calendar — Past Events: Success | Green / Teal |
| Calendar — Past Events: Failed | Red |
| Live badge | Red |
| Popular badge | Yellow |
| Academic badge | Teal |
| Cultural badge | Pink |
| Sports badge | Yellow |

---

## 4. Typography

### Font Stack
```
font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, 'Courier New', monospace;
```

All text in SHARP uses a monospace font to reinforce the tech/brutalist aesthetic.

### Type Scale

| Element | Size | Weight | Style | Tracking |
|---------|------|--------|-------|----------|
| Hero heading | 36-48px | 900 (Black) | Italic, Uppercase | Tight (-0.05em) |
| Page title | 28-32px | 900 | Italic, Uppercase | Tight |
| Section heading | 20-24px | 900 | Italic, Uppercase | Tight |
| Card title | 14-18px | 900 | Italic, Uppercase | Normal |
| Body / Description | 10-12px | 700 | Normal, Uppercase | Wide |
| Labels / Metadata | 7-9px | 900 | Uppercase, Italic | Extra wide (0.1–0.15em) |
| Badge text | 8-9px | 900 | Uppercase | Wide |
| Nav item | 9-10px | 900 | Uppercase | Tight |
| Button text | 10-11px | 900 | Uppercase | Normal |

### Key Typography Rules
- Headings always **ALL CAPS + italic + font-black**
- Section labels use `opacity: 0.4` faded uppercase for de-emphasis
- Underline decorations on section titles use vivid color (pink/teal), 5px thickness, with `underline-offset`
- Monospace keeps consistent column alignment throughout the app

---

## 5. Core UI Components

### 5.1 BrutalCard
The primary container component for all content blocks.

```
Style:
  - border: 2.5px solid black
  - box-shadow: 4px 4px 0px 0px rgba(0,0,0,1)
  - border-radius: 1.25rem (20px)
  - background: configurable (white default, or any accent color)
  - padding: 1rem (16px)
  
Hover state:
  - shadow collapses to none
  - element shifts +1px X, +1px Y (simulates press)
  - transition: all 0.15s ease

Variants:
  - Default (white background)
  - Colored (accent color passed as prop)
  - Heavy bottom border (border-bottom: 5-8px solid black) for "stamp" look
```

### 5.2 BrutalButton
All interactive call-to-action elements.

```
Style:
  - border: 2.5px solid black
  - box-shadow: 3px 3px 0px 0px rgba(0,0,0,1)
  - border-radius: 0.75rem (12px)
  - padding: 8px 16px
  - font: 900 weight, 11px, uppercase
  - background: configurable (yellow default)

Hover state:
  - translateY(-1px) — lifts slightly

Active/Click state:
  - shadow: none
  - translate(+1px, +1px) — presses down

Common color variants:
  - Primary: Yellow (#FACC15)
  - Secondary: White (#FFFFFF) with black border
  - Teal: Filter buttons, join buttons
  - Pink: Register / Enter buttons
  - Green: Approve actions
  - Red: Reject actions
```

### 5.3 BrutalInput
Text input and search fields.

```
Style:
  - border: 2.5px solid black
  - border-radius: 0.75rem
  - box-shadow: 3px 3px 0px 0px rgba(0,0,0,1)
  - padding: 10px 16px (or 10px 44px when icon present)
  - font: 700 weight, 12px, monospace
  - background: white

Focus state:
  - shadow: none
  - transition: all 0.15s ease

With icon:
  - Icon positioned absolutely at left: 16px
  - Input left-padding: 44px
```

### 5.4 Badge
Small status/category indicator pill.

```
Style:
  - border: 1.5px solid black
  - border-radius: 9999px (full round)
  - padding: 2px 8px
  - font: 900 weight, 8-9px, uppercase
  - background: configurable accent color

Pulsing variant (for LIVE / active states):
  - CSS: animate-pulse
  - Includes a small white filled circle (●) to the left of text
```

### 5.5 Stat Card
Used in Admin and Student dashboards for key metrics.

```
Structure:
  - BrutalCard with accent background
  - border-bottom: 5px solid black
  - Left side: label (7px, uppercase, 0.6 opacity) + value (24px, font-black)
  - Right side: icon in white bordered box with shadow

Colors cycle: Teal → Yellow → Pink → Lavender
```

### 5.6 Event Card (Discover/Explore)
Used in event listing grids.

```
Structure:
  - BrutalCard with p-0, border-bottom: 5px solid black
  - Top: image container (h-36 to h-40) with:
    - Grayscale filter default, color on hover
    - Scale 1.05 on hover (zoom)
    - Badge overlaid top-left (Popular / category)
  - Bottom: padding 16-20px with:
    - Event title (font-black, uppercase, italic)
    - Date + venue (8px, uppercase, 40% opacity)
    - CTA button (pink/yellow) aligned right
```

### 5.7 Timeline Event Row
Used in Student dashboard upcoming events list.

```
Structure:
  - BrutalCard with border-left: 8px solid black
  - Left: date box (yellow, 48x48px, border, shadow) showing day + month
  - Middle: event name + location/time
  - Right: View/Join button (teal)
  
Hover: background shifts to slate-50
```

### 5.8 Alert / Notification Row
Used in dashboard alert panels.

```
Structure:
  - List item with border-bottom: 2px solid black
  - Badge (top-left): category (Alert/System)
  - Timestamp (top-right): faded, 7.5px italic
  - Message: 10px bold, with underlined event name link
  
Hover: background shifts to yellow-50
```

### 5.9 Step Indicator (Create Event Flow)
Multi-step form progress bar.

```
Structure:
  - Horizontal line (3px black) behind all steps
  - 5 circular steps (w-10 h-10, border: 3px solid black, rounded-2xl)
  - Active/completed: yellow background + 3px shadow
  - Inactive: white background
  - Clickable (each step navigable)
```

---

## 6. Layout & Navigation Architecture

### 6.1 Overall Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  TOPBAR (h-14, border-bottom: 3px black, white bg)              │
│  [≡ Menu] [Quick search...    ] .............. [Role] [🔔] [👤] │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                   │
│   SIDEBAR    │           MAIN CONTENT AREA                      │
│   (w-60)     │     (flex-1, overflow-y-auto, p-4 md:p-6)       │
│              │                                                   │
│  Logo        │     max-w-6xl centered content                   │
│  ─────────   │                                                   │
│  Nav items   │     [Role-specific page content]                 │
│  (role-      │                                                   │
│  dependent)  │                                                   │
│              │                                                   │
│  ─────────   │                                                   │
│  SIMULATOR   │     ────────────────────────────────────         │
│  mode switch │     FOOTER (black bg, rounded-top-2xl)           │
│              │                                                   │
└──────────────┴──────────────────────────────────────────────────┘
```

### 6.2 Topbar

```
Left side:
  - Hamburger menu button (border, yellow hover, shadow)
  - Quick search input (hidden on mobile sm:flex, max-w-xs)

Right side:
  - Role label (tiny, faded, uppercase)
  - Username (e.g. CAMPUS_ADMIN) in bold italic
  - Notification bell button (teal hover, red dot badge for unread)
  - Avatar (DiceBear generated, 34x34px, border: 2.5px, rounded-xl, pink bg)
```

### 6.3 Sidebar

```
Header section:
  - SHARP logo: red circle with Compass icon + "SHARP" italic wordmark
  - Close button (mobile only)
  - border-bottom: 3px solid black

Nav section:
  - Scrollable, max-height: calc(100vh - 140px)
  - Each nav item: full-width button, icon + label
  - Active state: bg-black, text-white, border-black, 
    translate-x-1, shadow: 2.5px 2.5px 0 yellow (#FACC15)
  - Inactive hover: border-black, bg-slate-50

Simulator section (development tool):
  - Section label "SIMULATOR" in tiny faded caps
  - Role switcher buttons: PUBLIC / STUDENT / ORGANIZER / ADMIN
  - Active role: yellow bg, black border, shadow

Collapsed state (w-20):
  - Only icons visible, no labels
  - Logo shrinks to icon only
```

### 6.4 Sidebar Widths

| State | Desktop Width | Mobile Behavior |
|-------|--------------|-----------------|
| Expanded | 240px (w-60) | Full screen overlay |
| Collapsed | 80px (w-20) | Hidden (translate-x-full) |

---

## 7. Role-Based Access & Views

The app has 4 roles, each with its own complete navigation set.

### Role Summary

| Role | Navigation Tabs | Dashboard Style |
|------|----------------|-----------------|
| **Public** | 6 tabs | Landing / marketing homepage |
| **Student** | 8 tabs | Personal upcoming events + alerts |
| **Event Organizer** | 11 tabs | Event center + task management |
| **Administrator** | 11 tabs | System metrics + approval queue |

---

## 8. Page-by-Page Screen Specifications

---

### 8.1 Public Views

#### 8.1.1 Home (Public)

**Layout:** Two-column hero grid + Top Picks section

**Hero Section (grid-cols-2 on desktop):**

Left Card — Yellow (#FACC15):
- LIVE badge (red, pulsing) — top-left
- Large headline: "MILLIONS OF SHOWS. MORE WAYS TO LISTEN." (font-black, italic, 36-48px)
- CTA button: "EXPLORE EVENTS →" (white, rounded-full)
- Decorative white circle (bottom-right, semi-transparent, scales on hover)

Right Card — Teal (#2DD4BF):
- Centered white rounded-square icon box with ⚡ (Zap) icon in yellow
  - border: 3px black, shadow: 5px 5px, rotate-3, straightens on hover
- Heading: "MEANINGFUL DESIGN." (underlined)
- Subtext: "The professional event platform for students."
- Progress bar + "NEXT: OCT 24" label

**Top Picks Section:**
- Section heading: "TOP PICKS" with pink 5px underline decoration
- "VIEW ALL" button (white, right-aligned)
- 4-column event card grid (responsive: 1→2→4 cols)
- Each card:
  - Grayscale image (color on hover) with category badge
  - Event name + date/venue
  - "DETAIL" button (white)

**Footer:** Full black footer (see Section 12)

---

#### 8.1.2 Explore Events (Public)

**Layout:** Full-width search + filter + event grid

**Top:**
- Search input with search icon ("Search campus events...")
- FILTERS button (teal, with filter icon)

**Category Pills (horizontal scroll):**
- ALL / WORKSHOPS / CONCERTS / SPORTS / HACKATHONS
- Style: white, border-black, rounded-xl, hover: yellow-400
- Active state: yellow bg

**Event Grid (3-column on desktop):**
- Cards with grayscale images (color on hover), POPULAR badge (yellow, pulsing)
- Each card: title, date, venue, REGISTER button (pink)

---

#### 8.1.3 Campus Calendar (Public)

**Layout:** Full-width monthly calendar

**Header:**
- "MARCH 2026" — large font-black italic, teal underline
- ← → navigation buttons (white BrutalButton, square)

**Calendar Grid:**
- 7-column grid (Sun–Sat)
- Header row: black bg, white text, italic, all-caps day names
- Day cells: min-h-100px, hover: yellow-50 tint
- Date number: font-black large, turns pink on hover
- Events shown as colored pills inside cells:
  - Pink: Arts/Cultural events
  - Yellow: Tech events  
  - Teal: Music events
  - **Past events show status:** Green pill = ✅ Success, Red pill = ❌ Failed

---

#### 8.1.4 Login / Register (Public)

**Purpose:** Authentication entry point  
**Tabs:** Login | Register | Forgot Password  
**Style:** Centered card, white background, BrutalCard container

---

### 8.2 Student Views

#### 8.2.1 Dashboard (Student)

**Layout:** Header banner + 2-column content grid

**Welcome Banner (Lavender):**
- "HELLO ALEX!" — 36px, font-black, italic
- Subtext: "You're registered for [4 upcoming events]. Keep it up!"
- 3 stat boxes (white, bordered, shadow):
  - **04** COMING
  - **12** REGS  
  - **05** CERT

**Main Grid (2/3 + 1/3):**

Left — Upcoming Schedule:
- Section heading with 📅 calendar icon
- List of event rows (Timeline Event Row component):
  - Yellow date box (day + month)
  - Event name + location/time
  - VIEW button (teal)

Right — Recent Alerts:
- Bordered list container (border: 2.5px, shadow: 3px)
- Each alert: ALERT badge (pink) + timestamp + message
- Event name in alerts is underlined (link)

---

#### 8.2.2 Discover Events (Student)

**Same layout as Public Explore Events**, but:
- Tab label: "DISCOVER EVENTS"
- Additional tabs inside: Trending / Recommended / Saved Events
- REGISTER button replaces "Enter" in authenticated context

---

#### 8.2.3 Calendar (Student)

**Same calendar UI as Public**, but with personal event layer:
- Additional tab bar: Campus Calendar | My Registered Events | Upcoming | Past
- Registered events shown in a distinct highlight color
- Past events show Success (✅) / Failed (❌) status

---

#### 8.2.4 My Registrations (Student)

**Sub-tabs:** Registered Events | Waitlist | Cancel Registration | Attendance Status

**Registered list:**
- Event rows with registration ID, date, venue
- Status badge (Confirmed / Waitlisted / Attended / Absent)
- Cancel button per row

---

#### 8.2.5 Certificates (Student)

**Sub-tabs:** Download | Verify | Participation History

**Certificate list:**
- Event name + date + type (Participation / Volunteer / Winner)
- DOWNLOAD button (yellow)
- Verification code shown below

---

#### 8.2.6 Feedback (Student)

**Sub-tabs:** Submit Feedback | My Feedback

**Feedback form:**
- Event selector
- 5-star rating per dimension (Content, Organization, Venue, Overall)
- Text area for comments
- Anonymous toggle
- SUBMIT button (yellow)

---

#### 8.2.7 Notifications (Student)

**Sub-tabs:** All | Event Updates | Reminders

**Notification list:**
- Each row: badge type (SYSTEM/ALERT/REMINDER) + timestamp
- Message with linked event name
- Unread indicator (bold, yellow left border)

---

#### 8.2.8 Profile (Student)

**Sub-tabs:** Personal Info | Preferences | Participation History | Settings

**Layout:** Avatar + name/role + editable form fields

---

### 8.3 Event Organizer Views

#### 8.3.1 Dashboard (Organizer) — "Event Center"

**Layout:** Title + CTA | 2-col grid (event status cards + performance) | Right sidebar (tasks)

**Header:**
- "EVENT CENTER" — large italic underlined (yellow 4px decoration)
- "+ NEW PROPOSAL" button (yellow, right-aligned)

**Event Status Cards (2x2 grid):**

| Card | Number | Badge | Color |
|------|--------|-------|-------|
| Active Events | 02 | ACTIVE | Teal |
| Drafts Events | 03 | DRAFTS | Yellow |
| History Events | 04 | HISTORY | Lavender |
| Review Events | 05 | REVIEWS | Pink |

Each card:
- Large faint number (opacity: 0.1) top-left
- Status badge top-right
- Event type label bottom-left
- Black arrow button bottom-right (turns white on hover)
- border-bottom: 6px solid black

**Performance Flow (below cards):**
- Section heading: "PERFORMANCE FLOW"
- Bar chart: 9 black bars of varying heights
  - Hover: bar turns yellow, tooltip shows percentage
  - border: 1.5px white, rounded top

**Pending Tasks (right sidebar):**
- Section heading: "PENDING TASKS"
- Task cards (BrutalCard with border-left: 10px black):
  - Event name label (faded, 7.5px)
  - Due badge (TODAY/TOMORROW/2 DAYS in yellow)
  - Task name (font-black, italic)
  - VERIFY button (white) + ⋮ menu button

---

#### 8.3.2 My Events (Organizer)

**Sub-tabs:** Draft Events | Pending Approval | Approved Events | Completed Events

**List view per tab:**
- Event row: thumbnail + category badge + title + date + status
- Action buttons: Edit / View / Delete depending on status

---

#### 8.3.3 Create Event (Organizer) — 5-Step Flow

**Step Indicator:**
- Horizontal line (3px black) across full width
- 5 circles (numbered 1–5), yellow when active/complete, white when pending
- Each step is clickable

**Step 1 — Event Details:**
- TITLE input (placeholder: "e.g. Winter Code Sprint")
- CATEGORY dropdown: Technical Workshop / Cultural Festival / Sports Tournament / etc.
- BRIEF DESCRIPTION textarea (h-24)
- CONTINUE button (yellow, right-aligned)

**Step 2 — Venue:**
- Venue selector (searchable)
- Date picker
- Time picker (start/end)
- Capacity input
- CONTINUE button

**Step 3 — Resources:**
- Checkboxes: AV Equipment / Catering / Seating / etc.
- Notes textarea

**Step 4 — Upload Poster:**
- Drag-and-drop file upload zone (dashed border)
- Supported formats: JPG, PNG, PDF

**Step 5 — Submit Proposal:**
- Summary of all fields
- CONFIRM button (yellow)
- Previous step: underlined back link (←)

---

#### 8.3.4 Participants (Organizer)

**Sub-tabs:** Registered | Waitlist | Export | Attendance Status

**Table view:**
- Columns: Name, Student ID, Department, Registered At, Status
- Export buttons: CSV / Excel / PDF (top right)
- Bulk actions: Approve, Reject, Move to Waitlist

---

#### 8.3.5 Attendance (Organizer)

**Sub-tabs:** QR Scan | Manual Entry | Upload CSV

**QR Scan tab:**
- Camera viewport (web QR scanner)
- Last scanned student shown below
- Live count: X / Total checked in

**Manual Entry tab:**
- Student ID input + MARK button (teal)
- Recent entries list

---

#### 8.3.6 Certificates (Organizer)

**Sub-tabs:** Generate | Upload | Templates

**Generate tab:**
- Event selector
- Filter by attendance status (attended only)
- Template selector
- GENERATE ALL button (yellow)
- Preview panel (sample certificate with name/event)

---

#### 8.3.7 Tasks (Organizer)

**Sub-tabs:** Task List | Assign Tasks | Task Status

**Task list:**
- Event filter
- Each task: name, assigned to, due, status (Pending/In Progress/Done)
- Status toggle (click to cycle)

---

#### 8.3.8 Event Updates (Organizer)

**Sub-tabs:** Announcements | Event Changes | Notify Participants

**Form:**
- Event selector
- Update type: Venue Change / Time Change / Cancellation / General
- Message text area
- Send to: All Registered / Waitlist / Volunteers
- SEND NOTIFICATION button (yellow)

---

#### 8.3.9 Analytics (Organizer)

**Sub-tabs:** Registration Stats | Attendance Rate | Feedback Results

**Charts:**
- Bar chart: registrations over time
- Donut chart: attendance rate (attended vs no-show)
- Star rating breakdown per feedback dimension

---

### 8.4 Administrator Views

#### 8.4.1 Dashboard (Administrator)

**Layout:** 4 stat cards + 2-col grid (pending queue + engagement chart)

**Stat Cards (4 across, responsive):**

| Label | Value | Color |
|-------|-------|-------|
| Total Students | 4.2k | Teal |
| Active Events | 38 | Yellow |
| Approvals (Pending) | 12 | Pink |
| Conflicts | 0 | Lavender |

Each card: label + large value + icon in white bordered box (shadow)

**Pending Approvals / Queue (left, 60%):**
- Section heading: "PENDING APPROVALS" on black bg, NEEDS ACTION badge (pink, pulsing)
- Table: Proposal | Venue | Actions
- Actions: ✓ (green) / ✗ (red) buttons per row
- Sample rows: Quantum Hackathon / Neo-Jazz Night / Startup Pitch

**Category Engagement (right, 40%):**
- Section heading: "CATEGORY ENGAGEMENT" — underlined italic
- Donut chart (CSS clip-path based):
  - Teal = Academic segment
  - Pink = Cultural segment
  - Yellow = Social/Athletic segment
  - White inner circle: "86% GROWTH"
- Legend: ● ACADEMIC ● CULTURAL ● SOCIAL

---

#### 8.4.2 Event Approvals (Administrator)

**Layout:** Tab bar + vertical card list

**Tab bar:**
- PENDING (active — yellow, raised tab style)
- HISTORY (faded, inactive)

**Approval Cards (vertical list):**
- Thumbnail (100x100px, grayscale, border: 2px black, rounded)
- Badge: category (e.g. ACADEMIC in teal) + "SUBMITTED 2H AGO" (faded)
- Title: "AI Ethics Symposium 2026" (font-black, italic)
- Description (2-line clamp, 60% opacity)
- Actions: APPROVE (green) / REJECT (red) — stacked vertically on right

**History tab:**
- Same card layout with outcome badge: APPROVED (green) / REJECTED (red)

---

#### 8.4.3 Campus Calendar (Administrator)

**Same calendar UI** as Public view, with additions:
- Sub-tabs: All Events | Conflict Detection | Venue Schedule | Past Events
- Conflicts highlighted in red on calendar cells
- Past events labeled with Success (green) / Failed (red) outcome status
- Admin can click past event to update outcome status

---

#### 8.4.4 Venue Management (Administrator)

**Sub-tabs:** Venue List | Add Venue | Availability Calendar | Maintenance Schedule

**Venue list:**
- Cards: venue name, capacity, facilities tags, availability status (green/red badge)
- Edit / View Schedule / Blackout buttons

---

#### 8.4.5 User Management (Administrator)

**Sub-tabs:** Students | Organizers | Role Assignment | User Activity

**Table view:**
- Name, ID, Department, Role, Status (Active/Inactive)
- Role assignment dropdown per row
- Activity link (opens log filtered by user)

---

#### 8.4.6 Analytics & Reports (Administrator)

**Sub-tabs:** Event Performance | Student Engagement | Department Reports | Venue Usage

**Charts:**
- Line chart: event attendance trends over semester
- Bar chart: events per department
- Donut: engagement by category
- Export buttons: PDF / Excel / CSV / PowerPoint

---

#### 8.4.7 System Notifications (Administrator)

**Sub-tabs:** Send Announcement | Email Notifications | SMS Alerts

**Compose panel:**
- Recipient: All Students / All Organizers / Specific Department / Everyone
- Subject + message body
- Channel: In-app / Email / SMS / All
- Schedule (immediate or pick date/time)
- SEND button (yellow)

---

#### 8.4.8 System Settings (Administrator)

**Sub-tabs:** Event Categories | Academic Calendar | Notification Templates | Security Settings

**Event Categories:**
- List of categories with edit/delete
- Add new category button

**Academic Calendar:**
- Semester start/end date pickers
- Holiday blackout dates

**Security Settings:**
- MFA enforcement toggle per role
- Session timeout value
- Failed login threshold

---

#### 8.4.9 Data Management (Administrator)

**Sub-tabs:** Database Backup | Data Export | Data Retention

**Backup:**
- Last backup timestamp
- Manual backup trigger button
- Backup history list

**Export:**
- Select entity: Users / Events / Registrations / Certificates
- Format: JSON / CSV / Excel
- Date range picker
- EXPORT button

---

#### 8.4.10 Activity Logs (Administrator)

**Sub-tabs:** User Activity | Event Action Logs | System Audit Logs

**Log table:**
- Timestamp | Actor (user ID) | Action | Entity | IP Address
- Filterable by role, date range, action type
- Infinite scroll or paginated

---

## 9. Component Library Reference

### Reusable Components (from App.jsx)

| Component | Props | Usage |
|-----------|-------|-------|
| `BrutalCard` | `color`, `className`, `onClick` | All content containers |
| `BrutalButton` | `color`, `className`, `onClick` | All interactive buttons |
| `BrutalInput` | `placeholder`, `icon`, `className` | Search, form inputs |
| `Badge` | `text`, `color`, `pulsing` | Status indicators, categories |
| `BrutalFooter` | — | Shared footer across all views |
| `PlaceholderSection` | `title` | Unbuilt sections placeholder |

### Icon Library
**Source:** `lucide-react` (v0.263.1)

| Icon | Usage |
|------|-------|
| `Home` | Public home nav |
| `Compass` | Explore events, logo icon |
| `Calendar` | Calendar nav |
| `Bell` | Notifications, announcements |
| `Info` | About page |
| `LogIn` | Login/Register |
| `LayoutDashboard` | Dashboard nav |
| `CheckSquare` | Registrations, tasks |
| `Award` | Certificates |
| `MessageSquare` | Feedback |
| `User` | Profile |
| `PlusCircle` | Create event |
| `Users` | Participants, user management |
| `CheckCircle` | Attendance |
| `FileText` | My Events |
| `BarChart2` | Analytics |
| `ShieldCheck` | Event Approvals |
| `MapPin` | Venue Management |
| `Settings` | System Settings |
| `Database` | Data Management |
| `Activity` | Activity Logs |
| `Menu` | Sidebar toggle |
| `X` | Close/Reject |
| `ChevronRight` | Navigate forward |
| `Filter` | Filter button |
| `Download` | Export/Download |
| `MoreVertical` | Overflow menu |
| `Check` | Approve |
| `AlertCircle` | Conflicts |
| `Twitter`, `Instagram`, `Github`, `Youtube` | Footer social links |
| `Send` | Send notification |
| `Zap` | Hero lightning icon |

---

## 10. Interaction & Animation Patterns

### Page/Tab Transitions
```
On tab change:
  1. Content fades out (opacity: 0) + slides down (translateY: 16px)
  2. 50ms delay
  3. Content fades in (opacity: 100) + slides up (translateY: 0)
  
CSS: transition-all duration-300 ease-out
Trigger: useEffect on activeTab / role change
```

### Button Press
```
On hover:  translateY(-1px)  — slight lift
On active: shadow: none + translate(+1px, +1px) — press simulation
Transition: all 0.1s ease
```

### Card Hover
```
On hover: shadow: none + translate(+1px, +1px)
Transition: all 0.15s ease
```

### Image Hover (Event Cards)
```
Default: grayscale(1) — black and white
On hover: grayscale(0) + scale(1.05)
Transition: all 0.5-0.7s duration
```

### Performance Bar Hover (Organizer Dashboard)
```
Default: black bar
On hover: yellow bar + tooltip appears above showing percentage
Tooltip: absolute positioned, black bg, white text, 7px font
```

### Live/Pulsing Badge
```
CSS: animate-pulse on the badge container
White dot inside the badge also pulses
Used for: LIVE event, NEEDS ACTION, notification dots
```

### Sidebar Transition
```
Expand → Collapse:
  - Width transitions: w-60 → w-20 (desktop) or translate-x off-screen (mobile)
  - Labels fade out, only icons remain
  - Transition: duration-300
```

---

## 11. Responsive Design

### Breakpoints (Tailwind defaults)

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Default (mobile) | < 640px | Single column, sidebar hidden |
| `sm` | ≥ 640px | Some multi-column layouts, search shown |
| `md` | ≥ 768px | Sidebar becomes persistent, 2-col grids |
| `lg` | ≥ 1024px | Full 3-4 col grids, all features visible |

### Key Responsive Adaptations

**Sidebar:**
- Mobile: hidden by default, hamburger menu toggles full-screen overlay
- Desktop: persistent left sidebar (w-60 or w-20 collapsed)

**Event Grid:**
- Mobile: 1 column
- Tablet (sm): 2 columns
- Desktop (lg): 3–4 columns

**Dashboard Stats:**
- Mobile: 1 column stacked
- Tablet (sm): 2x2 grid
- Desktop (lg): 4 across

**Hero Section:**
- Mobile: 1 column (stacked cards)
- Desktop (lg): 2 columns side by side

**Timeline rows:**
- Mobile: VIEW button hidden (`hidden sm:flex`)
- Desktop: button visible

**Footer:**
- Mobile: 1 column stacked
- Desktop: 3-column grid

---

## 12. Footer

**Shared across all views, all roles.**

```
Background: #000000 (black)
Text: white
Border-top: 3px solid black
Border-radius: top corners 2rem (32px)
Margin-top: 3rem (48px)
Padding: 2rem to 2.5rem

Layout: 3 columns (responsive → 1 column on mobile)

Column 1 — Brand:
  - SHARP logo (red circle + Compass icon + wordmark)
  - Links: Privacy Policy / Cookies Settings / Terms of Use
  - Font: 8px uppercase, 60% opacity, hover → yellow

Column 2 — Newsletter:
  - Heading: "NEWSLETTER" (xs, font-black, uppercase, tracked)
  - Email input (white bg, rounded-xl, focus: yellow ring)
  - JOIN button (yellow, border: 2px white)

Column 3 — Connect:
  - Heading: "CONNECT"
  - Social icons (Twitter, Instagram, GitHub, YouTube)
  - Each: 32x32px circle, border: 2px white
  - Hover: yellow bg, black text, black border

Copyright line:
  "© Sharp Campus 2026. Experience the Edge."
  Font: 8px, uppercase, 30% opacity, centered, italic
```

---

## 13. Icon System

**Library:** `lucide-react` v0.263.1  
**Default size:** `w-4 h-4` (16px) in nav; `w-4.5 h-4.5` in topbar; `w-5 h-5` in section headings  
**Behavior:** Icons scale 1.1x on nav item hover (`group-hover:scale-110`)

Social icons in footer are from `lucide-react`: `Twitter`, `Instagram`, `Github`, `Youtube`

---

## 14. Design Checklist

Use this to verify any new screen or component before shipping:

- [ ] Uses monospace font consistently
- [ ] All text is uppercase (headings, buttons, labels, nav)
- [ ] All interactive elements have `border: 2.5px solid black`
- [ ] Cards have hard shadow (`box-shadow: 4px 4px 0 rgba(0,0,0,1)`)
- [ ] Buttons have hard shadow (`box-shadow: 3px 3px 0 rgba(0,0,0,1)`)
- [ ] Hover state collapses shadow + shifts element 1-2px
- [ ] Active/clicked state shows full press simulation
- [ ] Colors used match the defined palette (no arbitrary color choices)
- [ ] Event cards have grayscale image that colorizes on hover
- [ ] Badges are rounded-full with 1.5px black border
- [ ] Navigation active state is black bg, white text, yellow shadow
- [ ] Section headings use underline decoration with accent color
- [ ] Italic is used on all major headings
- [ ] Footer is present on all public and authenticated pages
- [ ] Responsive: content readable and usable at 320px minimum width
- [ ] Transitions are smooth (300ms ease-out for page changes)

---

*This document is based on the SHARP PRD v1.1, TECH.md architecture specification, TABS-1.md navigation structure, and App.jsx component implementation.*

*Last updated: March 9, 2026*
