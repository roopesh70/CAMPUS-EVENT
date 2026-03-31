'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { NAV_CONFIG } from '@/lib/constants';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Footer } from '@/components/layout/Footer';
import { useSettings } from '@/hooks/useSettings';

// Views
import { PublicHome } from '@/components/views/PublicHome';
import { ExploreEvents } from '@/components/views/ExploreEvents';
import { CalendarView } from '@/components/views/CalendarView';
import { StudentDashboard } from '@/components/views/StudentDashboard';
import { OrganizerDashboard, CreateEventFlow } from '@/components/views/OrganizerViews';
import { AdminDashboard, AdminApprovals } from '@/components/views/AdminViews';
import { PlaceholderSection } from '@/components/ui/PlaceholderSection';
import {
  AnnouncementsPage, AboutPage,
  MyRegistrations, CertificatesPage, FeedbackPage,
  NotificationsPage, ProfilePage,
  OrganizerMyEvents, ParticipantsPage, AttendancePage, OrganizerFeedbackPage,
  TasksPage, EventUpdatesPage, OrganizerAnalytics, AdminAnalytics,
  VenueManagement, UserManagement, SystemNotificationsPage,
  SystemSettingsPage, DataManagementPage, ActivityLogsPage,
  AdminCertificateTemplates,
} from '@/components/views/AllViews';
import { AuthPageView } from '@/components/views/AuthPageView';

function PublicView({ tab }: { tab: string }) {
  if (tab === 'home') return <PublicHome />;
  if (tab === 'explore') return <ExploreEvents />;
  if (tab === 'calendar') return <CalendarView />;
  if (tab === 'announcements') return <AnnouncementsPage />;
  if (tab === 'about') return <AboutPage />;
  if (tab === 'auth') return <AuthPageView />;
  return <PlaceholderSection title={tab} />;
}

function StudentView({ tab }: { tab: string }) {
  if (tab === 'dashboard') return <StudentDashboard />;
  if (tab === 'discover') return <ExploreEvents />;
  if (tab === 'calendar') return <CalendarView />;
  if (tab === 'registrations') return <MyRegistrations />;
  if (tab === 'certificates') return <CertificatesPage />;
  if (tab === 'feedback') return <FeedbackPage />;
  if (tab === 'notifications') return <NotificationsPage />;
  if (tab === 'profile') return <ProfilePage />;
  return <PlaceholderSection title={tab} />;
}

function OrganizerView({ tab }: { tab: string }) {
  if (tab === 'dashboard') return <OrganizerDashboard />;
  if (tab === 'my-events') return <OrganizerMyEvents />;
  if (tab === 'calendar') return <CalendarView />;
  if (tab === 'create') return <CreateEventFlow />;
  if (tab === 'participants') return <ParticipantsPage />;
  if (tab === 'attendance') return <AttendancePage />;
  if (tab === 'certificates') return <CertificatesPage />;
  if (tab === 'tasks') return <TasksPage />;
  if (tab === 'feedback') return <OrganizerFeedbackPage />;
  if (tab === 'updates') return <EventUpdatesPage />;
  if (tab === 'analytics') return <OrganizerAnalytics />;
  if (tab === 'notifications') return <NotificationsPage />;
  if (tab === 'profile') return <ProfilePage />;
  return <PlaceholderSection title={tab} />;
}

function AdminView({ tab }: { tab: string }) {
  if (tab === 'dashboard') return <AdminDashboard />;
  if (tab === 'approvals') return <AdminApprovals />;
  if (tab === 'calendar') return <CalendarView />;
  if (tab === 'venues') return <VenueManagement />;
  if (tab === 'users') return <UserManagement />;
  if (tab === 'analytics') return <AdminAnalytics />;
  if (tab === 'notifications') return <NotificationsPage />;
  if (tab === 'system-notifications') return <SystemNotificationsPage />;
  if (tab === 'cert-templates') return <AdminCertificateTemplates />;
  if (tab === 'settings') return <SystemSettingsPage />;
  if (tab === 'data') return <DataManagementPage />;
  if (tab === 'logs') return <ActivityLogsPage />;
  if (tab === 'profile') return <ProfilePage />;
  return <PlaceholderSection title={tab} />;
}

export default function HomePage() {
  const { role, isAuthenticated, loading } = useAuthStore();
  const { activeTab, setActiveTab } = useUIStore();
  const { settings, loading: settingsLoading } = useSettings();
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine the effective nav role
  const navRole = isAuthenticated ? (role as keyof typeof NAV_CONFIG) : 'public';

  // Reset to first tab when role changes
  useEffect(() => {
    const navItems = NAV_CONFIG[navRole];
    if (navItems && navItems.length > 0) {
      const firstTab = navItems[0].id;
      setActiveTab(firstTab);
    }
  }, [navRole, setActiveTab]);

  // Animate content on tab change
  useEffect(() => {
    setIsLoaded(false);
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Show loading screen while auth initializes
  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBEB]">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 border-[4px] border-black rounded-2xl bg-yellow-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-bounce mx-auto flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="CAMEVE" className="w-full h-full object-contain" />
          </div>
          <p className="font-black uppercase text-[10px] tracking-widest opacity-40 italic">Initializing CAMEVE...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (navRole) {
      case 'public': return <PublicView tab={activeTab} />;
      case 'student': return <StudentView tab={activeTab} />;
      case 'organizer': return <OrganizerView tab={activeTab} />;
      case 'admin': return <AdminView tab={activeTab} />;
      default: return <PublicView tab={activeTab} />;
    }
  };

  const isMaintenance = settings?.maintenanceMode;
  const isRoleRestricted = settings?.restrictedRoles?.includes(role || '');
  const isRestricted = isMaintenance || isRoleRestricted;

  if (isRestricted && role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBEB]">
        <div className="text-center space-y-4 max-w-md p-8 border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl mx-4">
          <div className={`w-16 h-16 border-[3px] border-black rounded-xl ${isMaintenance ? 'bg-yellow-400' : 'bg-red-400'} mx-auto flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
            {isMaintenance ? '🚧' : '🔒'}
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">
            {isMaintenance ? 'Maintenance Mode' : 'Access Restricted'}
          </h1>
          <p className="font-bold text-sm opacity-60">
            {isMaintenance 
              ? 'The platform is currently undergoing scheduled maintenance. Please check back later.' 
              : `Access for ${role || 'your'} accounts has been temporarily restricted by administrators.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-mono text-black flex flex-col md:flex-row bg-[#FFFBEB]">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <div className={`flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="max-w-6xl mx-auto">
            {renderContent()}
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}
