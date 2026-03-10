import { Timestamp } from 'firebase/firestore';

/* ===== Users ===== */
export interface UserProfile {
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
export type EventCategory =
  | 'technical'
  | 'cultural'
  | 'sports'
  | 'academic'
  | 'workshop'
  | 'seminar'
  | 'competition'
  | 'social';

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
  venueId: string;
  venueName: string;
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
  registrationTime: Timestamp;
  status: RegistrationStatus;
  attendanceStatus: AttendanceStatus;
  feedbackSubmitted: boolean;
}

/* ===== Certificates ===== */
export type CertificateType = 'participation' | 'volunteer' | 'winner' | 'organizer';

export interface Certificate {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  type: CertificateType;
  issueDate: Timestamp;
  certificateUrl: string;
  verificationCode: string;
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
  entityType: EntityType;
  createdAt: Timestamp;
}
