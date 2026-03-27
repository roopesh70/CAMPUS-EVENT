import { create } from 'zustand';

interface UIState {
  activeTab: string;
  targetEventId: string | null;
  previousTab: string | null;
  sidebarOpen: boolean;
  showQR: boolean;
  setActiveTab: (tab: string) => void;
  setTargetEventId: (id: string | null) => void;
  goBack: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setShowQR: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'home',
  targetEventId: null,
  previousTab: null,
  sidebarOpen: true,
  showQR: false,
  setActiveTab: (tab) => set((state) => ({ 
    activeTab: tab,
    previousTab: state.activeTab === tab ? state.previousTab : state.activeTab
  })),
  setTargetEventId: (id) => set({ targetEventId: id }),
  goBack: () => set((state) => ({
    activeTab: state.previousTab || 'dashboard',
    previousTab: null
  })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setShowQR: (show) => set({ showQR: show }),
}));
