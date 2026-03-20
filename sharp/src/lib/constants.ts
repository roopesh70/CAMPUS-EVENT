import {
  Home, Compass, Calendar, Bell, Info, LogIn, LayoutDashboard,
  CheckSquare, Award, MessageSquare, User, PlusCircle,
  Users, CheckCircle, FileText, BarChart2, ShieldCheck,
  MapPin, Settings, Database, Activity, QrCode, Send,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Role = 'public' | 'student' | 'organizer' | 'admin';

export const COLORS = {
  yellow: '#FACC15',
  teal: '#2DD4BF',
  pink: '#F472B6',
  lavender: '#A78BFA',
  red: '#EF4444',
  green: '#4ADE80',
  bg: '#FFFBEB',
} as const;

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_CONFIG: Record<Role, NavItem[]> = {
  public: [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore Events', icon: Compass },
    { id: 'calendar', label: 'Campus Calendar', icon: Calendar },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'about', label: 'About', icon: Info },
  ],
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'discover', label: 'Discover Events', icon: Compass },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'registrations', label: 'My Registrations', icon: CheckSquare },
    { id: 'my-qr', label: 'My QR Code', icon: QrCode },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ],
  organizer: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-events', label: 'My Events', icon: FileText },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'create', label: 'Create Event', icon: PlusCircle },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'feedback', label: 'Feedback Insights', icon: MessageSquare },
    { id: 'updates', label: 'Event Updates', icon: Bell },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'approvals', label: 'Event Approvals', icon: ShieldCheck },
    { id: 'calendar', label: 'Campus Calendar', icon: Calendar },
    { id: 'venues', label: 'Venue Management', icon: MapPin },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart2 },
    { id: 'system-notifications', label: 'System Notifications', icon: Send },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'cert-templates', label: 'Certificate Templates', icon: Award },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'logs', label: 'Activity Logs', icon: Activity },
  ],
};
