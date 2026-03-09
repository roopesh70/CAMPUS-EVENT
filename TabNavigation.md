
# Campus Event Management System — Detailed UI Navigation

Sources: Tabs.md and Tabss.md

---

# App Entry Points

The application supports four access flows:

1. Public User (without login)
2. Student
3. Event Organizer
4. Administrator

Navigation styles:

Mobile: Bottom navigation
Web: Sidebar navigation + top bar

---

# Public User (Without Login)

## Entry Flow

App Launch → Home → Explore Events → Login Required → Login/Register

---

## Home

Sections

- Featured Events
- Trending Events
- Upcoming Events
- Announcements

Quick Actions

- Explore Events
- Campus Calendar
- Login / Register

---

## Explore Events

Sections

- All Events
- Categories
- Departments
- Search & Filters

Filters

- Date
- Department
- Venue
- Category

Event Card

- Poster
- Title
- Date & Time
- Venue
- View Details

---

## Event Details

- Event Description
- Organizer
- Venue
- Date & Time
- Participant Limit
- Register Button (login required)

---

## Campus Calendar

Views

- Monthly View
- Weekly View
- Event List
- Past Events

Selecting an event opens Event Details.

---

## Announcements

Sections

- Event Updates
- Campus Notices
- Important Alerts

---

## About

- About Platform
- How It Works
- FAQ

---

## Authentication

- Login
- Register
- Forgot Password

After login users are redirected to their dashboard.

---

# Student Navigation

Bottom Navigation

- Dashboard
- Discover Events
- Calendar
- My Registrations
- Profile

---

## Dashboard

- Upcoming Registered Events
- Recommended Events
- Notifications Preview
- Participation Statistics

Actions

- Open Event
- View Registrations
- Open Notifications

---

## Discover Events

- All Events
- Trending Events
- Recommended Events
- Saved Events

Users can open event details and register.

---

## Calendar

- Campus Calendar
- My Registered Events
- Upcoming Events
- Past Events

---

## My Registrations

- Registered Events
- Waitlist
- Cancel Registration
- Attendance Status

---

## Certificates

- Download Certificates
- Verify Certificate
- Participation History

---

## Feedback

- Submit Feedback
- My Feedback

---

## Notifications

- Event Updates
- Reminders
- System Notifications

---

## Profile

- Personal Info
- Preferences
- Participation History
- Settings

---

# Event Organizer Navigation

Main bottom Navigation

- Dashboard
- My Events
- Create Event
- Participants
- Profile

---

## Dashboard

- My Events Overview
- Registration Statistics
- Pending Tasks
- Feedback Summary

---

## My Events

Categories

- Draft Events
- Pending Approval
- Approved Events
- Completed Events

Event Management (Tap Event)

- Participants
- Attendance
- Certificates
- Tasks
- Event Updates

---

## Create Event Flow

Steps

1. Event Details
2. Venue Selection
3. Resources Required
4. Upload Poster
5. Submit Proposal

Event Status (After submit)

- Pending
- Approved
- Revision Requested

---

## Participants

- Registered Participants
- Waitlist
- Export List
- Attendance Status

---

## Attendance

- QR Scan
- Manual Entry
- Upload CSV

---

## Certificates

- Generate Certificates
- Upload Certificates
- Certificate Templates

---

## Tasks

- Task List
- Assign Tasks
- Task Status

---

## Event Updates

- Announcements
- Event Changes
- Notify Participants

---

## Analytics

- Registration Statistics
- Attendance Rate
- Feedback Results

---

# Administrator Navigation

Sidebar Navigation

- Dashboard
- Event Approvals
- Campus Calendar
- Venue Management
- User Management
- Analytics & Reports
- System Notifications
- System Settings
- Data Management
- Activity Logs
- Profile

---

## Dashboard

- System Metrics
- Pending Approvals
- Calendar Overview
- Recent Activity

---

## Event Approvals

- Pending Proposals
- Approved Events
- Rejected Events
- Revision Requests

Admin Actions

- Approve
- Reject
- Request Changes

---

## Campus Calendar

- All Events
- Conflict Detection
- Venue Schedule
- Past Events

---

## Venue Management

- Venue List
- Add Venue
- Availability Calendar
- Maintenance Schedule

---

## User Management

- Students
- Organizers
- Role Assignment
- User Activity

---

## Analytics & Reports

- Event Performance
- Student Engagement
- Department Reports
- Venue Usage

---

## System Notifications

- Send Announcement
- Email Notifications
- SMS Alerts

---

## System Settings

- Event Categories
- Academic Calendar
- Notification Templates
- Security Settings

---

## Data Management

- Database Backup
- Data Export
- Data Retention

---

## Activity Logs

- User Activity Logs
- Event Action Logs
- System Audit Logs

---

# Overall Navigation Flow

App Launch
→ Public Home
→ Login/Register
→ Role Detection

Role Routing

Student → Student Dashboard  
Organizer → Organizer Dashboard  
Administrator → Admin Dashboard

---

# Recommended UI Pattern

## Mobile

Bottom Navigation

- Home / Dashboard
- Events
- Calendar
- My Events / Manage
- Profile

## Web

Sidebar Navigation with Topbar

Topbar includes

- Search
- Notifications
- Profile
