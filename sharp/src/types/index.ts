import { Timestamp } from 'firebase/firestore';

/* ===== Users ===== */
export interface UserProfile {
  id?: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'organizer' | 'admin';
  department: string;
  year: number | null;
  photoURL: string;
  preferences: {
    categories: string[];
    notifications: {
      email: boolean;
      sms: boolean;
      inApp: boolean;
    };
  };
  createdAt: Timestamp;
  lastLogin: Timestamp;
}

/* ===== Events ===== */
export type EventCategory = string;

export type EventStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'revision'
  | 'completed';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  organizerId: string;
  organizerName: string;
  eventType?: 'PHYSICAL' | 'ONLINE'; // Optional for backward compatibility, defaults to PHYSICAL
  venueId?: string; // Optional for ONLINE events
  venueName?: string; // Optional for ONLINE events
  department: string;
  startTime: Timestamp;
  endTime: Timestamp;
  capacity: number;
  registeredCount: number;
  attendanceCount: number;
  status: EventStatus;
  outcomeStatus: 'success' | 'failed' | null;
  eligibility: {
    departments: string[];
    years: number[];
  };
  resources: string[];
  posterUrl: string;
  approvalComment: string;
  conflictFlag: boolean;
  // PRD 5.2.1 additions
  registrationDeadline?: Timestamp;
  coOrganizers?: string;
  targetAudience?: string;
  expectedAttendance?: number;
  contactEmail?: string;
  contactPhone?: string;
  budget?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/* ===== Venues ===== */
export interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  facilities: string[];
  isActive: boolean;
}

/* ===== Registrations ===== */
export type RegistrationStatus = 'confirmed' | 'waitlisted' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'pending';

export interface Registration {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userDepartment: string;
  userYear: number | null;
  registrationTime: Timestamp;
  status: RegistrationStatus;
  attendanceStatus: AttendanceStatus;
  feedbackSubmitted: boolean;
  registrationId: string;
}

/* ===== Certificates ===== */
export type CertificateType = 'participation' | 'volunteer' | 'winner' | 'organizer';

export interface CertificateTemplate {
  id: string;
  name: string;
  eventType: string; // EventCategory or 'all'
  layout: 'standard' | 'modern' | 'classic' | 'minimal' | 'elegant' | 'bold';

  // Custom Typography & Colors
  fontFamily?: string;
  primaryColor: string;
  secondaryColor: string;
  primaryTextColor?: string;
  secondaryTextColor?: string;
  textColor?: string; // Legacy global text color
  primaryFontSize?: number;
  secondaryFontSize?: number;

  // Custom Positioning
  idPosition?: { x?: number; y?: number };
  datePosition?: { x?: number; y?: number };
  signaturePosition?: { x?: number; y?: number };
  bodyPosition?: { x?: number; y?: number };
  bodyAlignment?: 'left' | 'center' | 'right';

  borderStyle: 'solid' | 'double' | 'dashed' | 'none';
  logoUrl?: string; // Legacy single logo
  logoUrls?: string[]; // Multiple overlapping/placed logos
  backgroundImageUrl?: string; // Full bleed background image
  signatureImageUrl?: string; // Organizer signature image
  signatureText?: string; // Typed signature name/title
  headerText: string;
  bodyTemplate: string; // Supports variables like {{participantName}}
  footerText: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CertificateStatus = 'issued' | 'revoked' | 'replacement_requested';

export interface Certificate {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  type: CertificateType;
  issueDate: Timestamp;
  certificateUrl: string; // Pre-rendered image URL, if stored (we use dynamic canvas, so this might be empty)
  verificationCode: string;

  // New properties for v2 (Template-driven)
  // New properties for v2 (Template-driven)
  templateId?: string;
  logoUrl?: string; // Legacy custom override
  logoUrls?: string[]; // Multiple logo overrides
  backgroundImageUrl?: string; // Background override
  textColor?: string; // Text color override
  signatureImageUrl?: string; // Custom override
  signatureText?: string; // Custom override

  status?: CertificateStatus; // Track if it's been revoked or user asked for a reprint
  emailSent?: boolean; // Whether the PDF attachment was emailed
  department?: string; // Stored department for rendering
  year?: number | null; // Stored academic year for rendering
}

/* ===== Notifications ===== */
export type NotificationType =
  | 'approval'
  | 'registration'
  | 'reminder'
  | 'update'
  | 'cancellation'
  | 'certificate'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  eventId: string | null;
  createdAt: Timestamp;
}

/* ===== Tasks ===== */
export type TaskCategory = 'registration_desk' | 'logistics' | 'technical' | 'hospitality';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface EventTask {
  id: string;
  eventId: string;
  title: string;
  category?: TaskCategory;
  assignedTo: string;
  shiftStart?: Timestamp;
  shiftEnd?: Timestamp;
  status: TaskStatus;
  createdAt: Timestamp;
}

/* ===== Feedback ===== */
export interface Feedback {
  id: string;
  eventId: string;
  userId: string | null;
  ratings: {
    content: number;
    organization: number;
    venue: number;
    speaker: number;
    overall: number;
  };
  comment: string;
  anonymous: boolean;
  createdAt: Timestamp;
}

/* ===== Activity Logs ===== */
export type EntityType = 'event' | 'user' | 'venue' | 'certificate' | 'registration';

export interface ActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  role: string;
  action: string;
  entityId: string;
  entityName?: string;
  entityType: EntityType;
  createdAt: Timestamp;
}

/* ===== System Settings ===== */
export interface SystemSettings {
  id?: string;
  registrationOpen: boolean;
  requireEventApproval: boolean;
  maintenanceMode: boolean;
  supportEmail: string;
  allowAnonymousFeedback: boolean;
  eventCategories?: { id: string; name: string; isActive: boolean }[];
  restrictedRoles?: string[];
  updatedAt?: Timestamp;
  // Social Links
  /** Full absolute URL to Twitter/X profile (e.g., https://x.com/username) */
  twitterUrl?: string;
  /** Full absolute URL to Instagram profile (e.g., https://instagram.com/username) */
  instagramUrl?: string;
  /** Full absolute URL to Github profile or organization (e.g., https://github.com/org) */
  githubUrl?: string;
  /** Full absolute URL to YouTube channel (e.g., https://youtube.com/@channel) */
  youtubeUrl?: string;
  /** Full absolute URL to the main campus website (e.g., https://campus.edu) */
  campusWebsiteUrl?: string;
  // Legal Content
  privacyPolicy?: string;
  cookieSettings?: string;
  termsOfUse?: string;
}
