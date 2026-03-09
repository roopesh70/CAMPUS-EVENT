# Campus Event Management System --- UI Navigation & Tab Structure

This document defines the **complete tab navigation structure** for the
Campus Event Management System. The system supports four access levels:

-   Public (Without Login)
-   Student
-   Event Organizer
-   Administrator

The tab structure is based on the provided app tab specification.

------------------------------------------------------------------------

# 🌐 Public (Without Login)

## Home

-   Featured Events
-   Trending Events
-   Upcoming Events
-   Announcements

## Explore Events

-   All Events
-   Categories
-   Departments
-   Search & Filters

## Campus Calendar

-   Monthly View
-   Weekly View
-   Event List
-   Past Events (Success / Failed)

## Announcements

-   Event Updates
-   Campus Notices

## About

-   About Platform
-   How It Works
-   FAQ

## Login / Register

-   Login
-   Register
-   Forgot Password

------------------------------------------------------------------------

# 🎓 Student

## Dashboard

-   Upcoming Registered Events
-   Recommended Events
-   Notifications
-   Participation Stats

## Discover Events

-   All Events
-   Trending Events
-   Recommended Events
-   Saved Events

## Calendar

-   Campus Calendar
-   My Registered Events
-   Upcoming Events
-   Past Events

## My Registrations

-   Registered Events
-   Waitlist
-   Cancel Registration
-   Attendance Status

## Certificates

-   Download Certificates
-   Verify Certificate
-   Participation History

## Feedback

-   Submit Feedback
-   My Feedback

## Notifications

-   All Notifications
-   Event Updates
-   Reminders

## Profile

-   Personal Info
-   Preferences
-   Participation History
-   Settings

------------------------------------------------------------------------

# 🎯 Event Organizer

## Dashboard

-   My Events Overview
-   Registration Stats
-   Pending Tasks
-   Feedback Summary

## My Events

-   Draft Events
-   Pending Approval
-   Approved Events
-   Completed Events

## Create Event

-   Event Details
-   Venue Selection
-   Resources Required
-   Upload Poster
-   Submit Proposal

## Participants

-   Registered Participants
-   Waitlist
-   Export List
-   Attendance Status

## Attendance

-   QR Scan
-   Manual Entry
-   Upload CSV

## Certificates

-   Generate Certificates
-   Upload Certificates
-   Certificate Templates

## Tasks

-   Task List
-   Assign Tasks
-   Task Status

## Event Updates

-   Announcements
-   Event Changes
-   Notifications to Participants

## Analytics

-   Registration Statistics
-   Attendance Rate
-   Feedback Results

## Notifications

-   Registration Alerts
-   Event Updates
-   System Notifications

## Profile

-   Organizer Info
-   Event History
-   Settings

------------------------------------------------------------------------

# 🛠 Administrator

## Dashboard

-   System Metrics
-   Pending Approvals
-   Calendar Overview
-   Recent Activity

## Event Approvals

-   Pending Proposals
-   Approved Events
-   Rejected Events
-   Revision Requests

## Campus Calendar

-   All Events
-   Conflict Detection
-   Venue Schedule
-   Past Events (Success / Failed)

## Venue Management

-   Venue List
-   Add Venue
-   Availability Calendar
-   Maintenance Schedule

## User Management

-   Students
-   Organizers
-   Role Assignment
-   User Activity

## Analytics & Reports

-   Event Performance
-   Student Engagement
-   Department Reports
-   Venue Usage

## System Notifications

-   Send Announcement
-   Email Notifications
-   SMS Alerts

## System Settings

-   Event Categories
-   Academic Calendar
-   Notification Templates
-   Security Settings

## Data Management

-   Database Backup
-   Data Export
-   Data Retention

## Activity Logs

-   User Activity Logs
-   Event Action Logs
-   System Audit Logs

## Profile

-   Admin Info
-   Security Settings
-   Notification Preferences

------------------------------------------------------------------------

# Navigation Summary

  Role              Number of Tabs
  ----------------- ----------------
  Public            6
  Student           8
  Event Organizer   11
  Administrator     11

------------------------------------------------------------------------

# Notes

-   The system uses **Role-Based Access Control (RBAC)**.
-   Public users can **view events but must log in to register**.
-   Navigation should remain **consistent across roles** to improve
    usability.
-   Mobile UI should use **Bottom Navigation Tabs**.
-   Web UI should use a **Left Sidebar Navigation with a Top Bar**.
-   Notifications and Profile sections should be accessible across all
    roles.
-   Calendar integration helps **prevent event conflicts and venue
    overlaps**.
