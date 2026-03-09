import React, { useState, useEffect } from 'react';
import { 
  Home, Search, Calendar, Info, LogIn, LayoutDashboard, Compass, 
  CheckSquare, Award, MessageSquare, Bell, User, PlusCircle, 
  Users, CheckCircle, FileText, BarChart2, ShieldCheck, 
  MapPin, Settings, Database, Activity, LogOut, Menu, X,
  ChevronRight, Filter, Download, MoreVertical, Check, AlertCircle,
  Twitter, Instagram, Github, Youtube, Send, Zap
} from 'lucide-react';

// --- THEME & CONSTANTS ---
const ROLES = {
  PUBLIC: 'public',
  STUDENT: 'student',
  ORGANIZER: 'organizer',
  ADMIN: 'admin'
};

const COLORS = {
  yellow: '#FACC15',
  teal: '#2DD4BF',
  pink: '#F472B6',
  lavender: '#A78BFA',
  red: '#EF4444',
  bg: '#FFFBEB', 
};

// --- NAVIGATION CONFIGURATION ---
const NAV_CONFIG = {
  [ROLES.PUBLIC]: [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore Events', icon: Compass },
    { id: 'calendar', label: 'Campus Calendar', icon: Calendar },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'about', label: 'About', icon: Info },
    { id: 'auth', label: 'Login / Register', icon: LogIn },
  ],
  [ROLES.STUDENT]: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'discover', label: 'Discover Events', icon: Compass },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'registrations', label: 'My Registrations', icon: CheckSquare },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ],
  [ROLES.ORGANIZER]: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-events', label: 'My Events', icon: FileText },
    { id: 'create', label: 'Create Event', icon: PlusCircle },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'updates', label: 'Event Updates', icon: Bell },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ],
  [ROLES.ADMIN]: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'approvals', label: 'Event Approvals', icon: ShieldCheck },
    { id: 'calendar', label: 'Campus Calendar', icon: Calendar },
    { id: 'venues', label: 'Venue Management', icon: MapPin },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart2 },
    { id: 'notifications', label: 'System Notifications', icon: Bell },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'logs', label: 'Activity Logs', icon: Activity },
    { id: 'profile', label: 'Profile', icon: User },
  ],
};

// --- REUSABLE NEO-BRUTALIST COMPONENTS ---

const BrutalCard = ({ children, color = 'white', className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`border-[2.5px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer p-4 bg-[${color}] rounded-[1.25rem] overflow-hidden ${className}`}
    style={{ backgroundColor: color }}
  >
    {children}
  </div>
);

const BrutalButton = ({ children, color = COLORS.yellow, className = '', onClick }) => (
  <button 
    onClick={onClick}
    className={`border-[2.5px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] hover:-translate-y-[1px] transition-all px-4 py-2 font-black uppercase text-[11px] flex items-center justify-center gap-2 rounded-xl ${className}`}
    style={{ backgroundColor: color }}
  >
    {children}
  </button>
);

const BrutalInput = ({ placeholder, icon: Icon, className = "" }) => (
  <div className={`relative flex items-center ${className}`}>
    {Icon && <Icon className="absolute left-4 w-4 h-4 text-black" />}
    <input 
      type="text" 
      placeholder={placeholder}
      className={`w-full border-[2.5px] border-black bg-white p-2.5 ${Icon ? 'pl-11' : 'pl-4'} font-bold text-xs focus:outline-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:shadow-none transition-all rounded-xl`}
    />
  </div>
);

const Badge = ({ text, color = COLORS.pink, pulsing = false }) => (
  <span className={`border-[1.5px] border-black px-2 py-0.5 font-black text-[8.5px] uppercase rounded-full inline-flex items-center gap-1.5 ${pulsing ? 'animate-pulse' : ''}`} style={{ backgroundColor: color }}>
    {pulsing && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
    {text}
  </span>
);

// --- FOOTER COMPONENT ---

const BrutalFooter = () => (
  <footer className="bg-black text-white p-8 md:p-10 rounded-t-[2rem] mt-12 border-t-[3px] border-black">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-red-500 border-2 border-white rounded-full flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,1)]">
            <Compass className="text-white w-4 h-4" />
          </div>
          <h2 className="text-xl font-black italic tracking-tighter">SHARP</h2>
        </div>
        <div className="flex flex-col gap-1 font-bold uppercase text-[8px] opacity-60">
          <a href="#" className="hover:text-yellow-400 hover:opacity-100 transition-all">Privacy Policy</a>
          <a href="#" className="hover:text-yellow-400 hover:opacity-100 transition-all">Cookies Settings</a>
          <a href="#" className="hover:text-yellow-400 hover:opacity-100 transition-all">Terms of Use</a>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest">Newsletter</h3>
        <div className="flex gap-2">
          <input 
            type="email" 
            placeholder="Email..." 
            className="flex-1 bg-white border-[2px] border-white p-2 rounded-xl text-black font-bold text-[10px] outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
          />
          <button className="bg-yellow-400 text-black border-[2px] border-black px-4 py-2 rounded-xl font-black uppercase text-[9px] shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:shadow-none transition-all">
            Join
          </button>
        </div>
      </div>

      <div className="space-y-4 md:text-right">
        <h3 className="text-xs font-black uppercase tracking-widest">Connect</h3>
        <div className="flex md:justify-end gap-3">
          {[Twitter, Instagram, Github, Youtube].map((Icon, i) => (
            <a key={i} href="#" className="w-8 h-8 border-[2px] border-white rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black hover:border-black transition-all">
              <Icon className="w-3.5 h-3.5" />
            </a>
          ))}
        </div>
      </div>
    </div>
    <p className="text-[8px] font-bold uppercase opacity-30 mt-10 text-center italic">© Sharp Campus 2026. Experience the Edge.</p>
  </footer>
);

// --- MAIN APPLICATION COMPONENT ---

export default function App() {
  const [role, setRole] = useState(ROLES.PUBLIC);
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setActiveTab(NAV_CONFIG[role][0].id);
    setIsLoaded(false);
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, [role]);

  useEffect(() => {
    setIsLoaded(false);
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const renderContent = () => {
    const ViewProps = { tab: activeTab };
    switch(role) {
      case ROLES.PUBLIC: return <PublicView {...ViewProps} />;
      case ROLES.STUDENT: return <StudentView {...ViewProps} />;
      case ROLES.ORGANIZER: return <OrganizerView {...ViewProps} />;
      case ROLES.ADMIN: return <AdminView {...ViewProps} />;
      default: return <div className="p-10">Select a Role</div>;
    }
  };

  return (
    <div className="min-h-screen font-mono text-black flex flex-col md:flex-row bg-[#FFFBEB]">
      {/* Sidebar */}
      <aside className={`border-r-[3px] border-black bg-white transition-all duration-300 z-50 fixed md:relative h-full md:h-screen ${sidebarOpen ? 'w-60 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'} overflow-hidden`}>
        <div className="p-5 border-b-[3px] border-black flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 bg-red-500 border-[2px] border-black rounded-full flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <Compass className="text-white w-3.5 h-3.5" />
            </div>
            {sidebarOpen && <h1 className="text-lg font-black italic tracking-tighter uppercase">SHARP</h1>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden"><X className="w-5 h-5"/></button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {NAV_CONFIG[role].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-2.5 border-[2px] transition-all font-black rounded-xl group ${
                activeTab === item.id 
                ? 'bg-black text-white border-black translate-x-1 shadow-[2.5px_2.5px_0px_0px_rgba(250,204,21,1)]' 
                : 'border-transparent hover:border-black hover:bg-slate-50'
              }`}
            >
              <item.icon className={`w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110`} />
              {sidebarOpen && <span className="uppercase text-[9.5px] tracking-tight">{item.label}</span>}
            </button>
          ))}
          
          <div className="pt-6 space-y-1">
            {sidebarOpen && <p className="text-[8px] font-black text-gray-400 uppercase mb-2 ml-3">Simulator</p>}
            {Object.values(ROLES).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`w-full text-left px-4 py-1.5 text-[8.5px] font-black uppercase transition-all border-[2px] rounded-lg ${role === r ? 'bg-yellow-400 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'border-transparent text-gray-400 hover:text-black'}`}
              >
                {sidebarOpen ? `Mode: ${r}` : r[0].toUpperCase()}
              </button>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b-[3px] border-black bg-white flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 border-[2.5px] border-black rounded-lg hover:bg-yellow-400 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none">
              <Menu className="w-4.5 h-4.5" />
            </button>
            <BrutalInput placeholder="Quick search..." icon={Search} className="hidden sm:flex max-w-xs w-full" />
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-[7.5px] font-black uppercase opacity-30 leading-none">{role}</span>
              <span className="text-xs font-black uppercase italic tracking-tighter">Campus_Admin</span>
            </div>
            <button className="relative p-1.5 border-[2.5px] border-black rounded-lg hover:bg-teal-400 transition-all bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border-[1.5px] border-black rounded-full"></span>
            </button>
            <div className="w-8.5 h-8.5 border-[2.5px] border-black rounded-xl overflow-hidden bg-pink-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`} alt="avatar" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
           <div className="max-w-6xl mx-auto">
              {renderContent()}
              <BrutalFooter />
           </div>
        </div>
      </main>
    </div>
  );
}

// --- SUB-VIEWS ---

function PublicView({ tab }) {
  if (tab === 'home') return <PublicHome />;
  if (tab === 'explore') return <ExploreEvents />;
  if (tab === 'calendar') return <CalendarView />;
  return <PlaceholderSection title={tab} />;
}

function StudentView({ tab }) {
  if (tab === 'dashboard') return <StudentDashboard />;
  if (tab === 'discover') return <ExploreEvents />;
  return <PlaceholderSection title={tab} />;
}

function OrganizerView({ tab }) {
  if (tab === 'dashboard') return <OrganizerDashboard />;
  if (tab === 'create') return <CreateEventFlow />;
  return <PlaceholderSection title={tab} />;
}

function AdminView({ tab }) {
  if (tab === 'dashboard') return <AdminDashboard />;
  if (tab === 'approvals') return <AdminApprovals />;
  return <PlaceholderSection title={tab} />;
}

// --- REFINED SECTION COMPONENTS ---

const PublicHome = () => (
  <div className="space-y-10">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BrutalCard color={COLORS.yellow} className="relative min-h-[300px] flex flex-col justify-end p-6 group">
        <Badge text="Live" color="#EF4444" pulsing={true} className="absolute top-5 left-5" />
        <div className="space-y-3 z-10">
          <h2 className="text-3xl md:text-4xl font-black leading-[0.95] tracking-tighter uppercase italic">
            MILLIONS OF<br />SHOWS. MORE WAYS<br />TO LISTEN.
          </h2>
          <BrutalButton color="white" className="w-fit rounded-full px-5 py-2.5 text-[9px]">Explore Events <ChevronRight className="w-4 h-4" /></BrutalButton>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white border-[4px] border-black rounded-full group-hover:scale-110 transition-all duration-700 opacity-20"></div>
      </BrutalCard>

      <BrutalCard color={COLORS.teal} className="relative min-h-[300px] flex flex-col items-center justify-center text-center p-6">
        <div className="w-28 h-28 bg-white border-[3px] border-black rounded-[1.5rem] mb-4 flex items-center justify-center shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] rotate-3 transition-transform hover:rotate-0">
           <Zap className="w-10 h-10 text-yellow-500" />
        </div>
        <h3 className="text-xl font-black uppercase italic tracking-tight underline decoration-2 underline-offset-4">Meaningful Design.</h3>
        <p className="font-bold max-w-xs mt-2 text-[10px] uppercase opacity-70 leading-relaxed italic">The professional event platform for students.</p>
        <div className="mt-5 flex items-center gap-2">
           <div className="w-28 h-2 bg-black rounded-full overflow-hidden border border-black">
              <div className="w-2/3 h-full bg-white animate-pulse"></div>
           </div>
           <span className="font-black text-[9px]">NEXT: OCT 24</span>
        </div>
      </BrutalCard>
    </div>

    <section>
      <div className="flex justify-between items-end mb-6">
        <h3 className="text-2xl font-black uppercase underline decoration-[5px] decoration-pink-400 underline-offset-[6px] italic tracking-tight">Top Picks</h3>
        <BrutalButton color="white" className="text-[8px] px-3 py-1.5">View All</BrutalButton>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1,2,3,4].map(i => (
          <BrutalCard key={i} className="p-0 group overflow-hidden border-b-[5px]">
            <div className={`h-36 border-b-[2px] border-black bg-slate-100 overflow-hidden`}>
              <img src={`https://picsum.photos/seed/${i+60}/500/350`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" alt="event" />
            </div>
            <div className="p-4 space-y-2">
              <Badge text={['Visual', 'Tech', 'Music', 'Sports'][i-1]} color={[COLORS.teal, COLORS.pink, COLORS.lavender, COLORS.yellow][i-1]} />
              <h4 className="text-md font-black uppercase italic leading-tight">Campus Hackathon</h4>
              <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest"> 24 Oct • Auditorium</p>
              <BrutalButton className="w-full mt-2 bg-white border-2">Detail</BrutalButton>
            </div>
          </BrutalCard>
        ))}
      </div>
    </section>
  </div>
);

const StudentDashboard = () => (
  <div className="space-y-8">
    <BrutalCard color={COLORS.lavender} className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-b-[6px]">
      <div className="space-y-1">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">HELLO ALEX!</h2>
        <p className="text-[11px] font-bold uppercase opacity-80 italic">You're registered for <span className="underline">4 upcoming events</span>. Keep it up!</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {[ {l: 'COMING', v: '04', c: COLORS.yellow}, {l: 'REGS', v: '12', c: COLORS.teal}, {l: 'CERT', v: '05', c: COLORS.pink} ].map(s => (
          <div key={s.l} className="border-[2px] border-black bg-white p-3 text-center min-w-[85px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-xl">
            <div className="text-2xl font-black">{s.v}</div>
            <div className="text-[7.5px] font-black uppercase opacity-40 tracking-widest">{s.l}</div>
          </div>
        ))}
      </div>
    </BrutalCard>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-5">
        <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
          <Calendar className="w-5 h-5" /> Upcoming Schedule
        </h3>
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <BrutalCard key={i} className="flex items-center gap-5 p-4 border-l-[8px] border-l-black group hover:bg-slate-50">
              <div className="w-12 h-12 border-[2px] border-black flex flex-col items-center justify-center shrink-0 bg-yellow-400 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none transition-all">
                <span className="text-lg font-black leading-none">24</span>
                <span className="text-[7px] font-black uppercase">OCT</span>
              </div>
              <div className="flex-1">
                <h4 className="text-[13px] font-black uppercase italic leading-tight">Design Workshop with Google</h4>
                <p className="text-[9px] font-bold opacity-50 uppercase mt-0.5 tracking-tight">Tech Hall • 11:00 AM</p>
              </div>
              <BrutalButton color={COLORS.teal} className="hidden sm:flex px-5 h-8">View</BrutalButton>
            </BrutalCard>
          ))}
        </div>
      </div>
      
      <div className="space-y-5">
        <h3 className="text-xl font-black uppercase italic">Recent Alerts</h3>
        <div className="border-[2.5px] border-black bg-white rounded-xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
           {[1,2,3].map(i => (
             <div key={i} className="p-3.5 border-b-[2px] border-black hover:bg-yellow-50 cursor-pointer transition-colors last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <Badge text="Alert" color={COLORS.pink} />
                  <span className="text-[7.5px] font-black opacity-30 italic">2m ago</span>
                </div>
                <p className="text-[10px] font-bold leading-tight">Venue for <span className="underline">Jazz Night</span> changed.</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[
        { label: 'Total Students', value: '4.2k', color: COLORS.teal, icon: Users },
        { label: 'Active Events', value: '38', color: COLORS.yellow, icon: LayoutDashboard },
        { label: 'Approvals', value: '12', color: COLORS.pink, icon: ShieldCheck },
        { label: 'Conflicts', value: '0', color: COLORS.lavender, icon: AlertCircle },
      ].map((stat, i) => (
        <BrutalCard key={i} color={stat.color} className="flex items-center justify-between p-5 border-b-[5px] border-black">
          <div className="space-y-0">
            <span className="text-[7px] font-black uppercase opacity-60 tracking-wider leading-none">{stat.label}</span>
            <div className="text-2xl font-black tracking-tighter mt-1">{stat.value}</div>
          </div>
          <div className="bg-white border-[1.5px] border-black p-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <stat.icon className="w-4 h-4" />
          </div>
        </BrutalCard>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <BrutalCard className="p-0 border-[2.5px]">
        <div className="p-3.5 border-b-[2.5px] border-black bg-black text-white flex justify-between items-center">
          <h3 className="text-[11px] font-black uppercase italic tracking-widest">Pending Approvals</h3>
          <Badge text="Needs Action" color={COLORS.pink} pulsing />
        </div>
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left font-bold">
            <thead>
              <tr className="border-b-[2px] border-black text-[8px] uppercase opacity-40 italic tracking-widest">
                <th className="p-2.5">Proposal</th>
                <th className="p-2.5 text-center">Venue</th>
                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[10px]">
              {[
                { name: 'Quantum Hackathon', venue: 'Lab 4' },
                { name: 'Neo-Jazz Night', venue: 'Hall B' },
                { name: 'Startup Pitch', venue: 'Room 10' },
              ].map((row, i) => (
                <tr key={i} className="border-b-[1px] border-black border-opacity-10 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 font-black uppercase truncate max-w-[120px]">{row.name}</td>
                  <td className="p-2.5 text-center"><Badge text={row.venue} color="#fff" /></td>
                  <td className="p-2.5 flex gap-1.5 justify-end">
                    <button className="w-7 h-7 bg-green-400 border-[2px] border-black rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:shadow-none transition-all"><Check className="w-3.5 h-3.5" /></button>
                    <button className="w-7 h-7 bg-red-400 border-[2px] border-black rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:shadow-none transition-all"><X className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BrutalCard>

      <BrutalCard className="flex flex-col items-center justify-center p-6 gap-6 text-center bg-white border-[2.5px]">
         <h3 className="text-lg font-black uppercase italic underline decoration-2 underline-offset-4 tracking-tight">Category Engagement</h3>
         <div className="relative w-40 h-40 border-[5px] border-black rounded-full flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-slate-100 overflow-hidden group">
            <div className="absolute inset-0 border-[25px] border-teal-400" style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%)' }}></div>
            <div className="absolute inset-0 border-[25px] border-pink-400" style={{ clipPath: 'polygon(50% 50%, 0 0, 50% 0)' }}></div>
            <div className="z-10 bg-white border-[3px] border-black w-20 h-20 rounded-full flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-xl font-black leading-none italic">86%</span>
              <span className="text-[6.5px] font-black uppercase opacity-40">Growth</span>
            </div>
         </div>
         <div className="flex flex-wrap gap-3 justify-center">
           {['Academic', 'Cultural', 'Social'].map((t, i) => (
             <div key={t} className="flex items-center gap-1.5 font-black text-[8px] uppercase tracking-tighter">
               <div className="w-2.5 h-2.5 border-[1.5px] border-black rounded-sm" style={{ backgroundColor: [COLORS.teal, COLORS.pink, COLORS.yellow][i] }}></div>
               {t}
             </div>
           ))}
         </div>
      </BrutalCard>
    </div>
  </div>
);

const AdminApprovals = () => (
  <div className="space-y-6">
    <div className="flex gap-2 border-b-[3px] border-black pb-0">
      <button className="px-6 py-2.5 font-black uppercase text-xs italic bg-yellow-400 border-x-[2.5px] border-t-[2.5px] border-black rounded-t-xl -mb-[3px] z-10">Pending</button>
      <button className="px-6 py-2.5 font-black uppercase text-xs italic hover:bg-slate-50 opacity-40">History</button>
    </div>
    <div className="grid grid-cols-1 gap-4">
      {[1, 2, 3].map(i => (
        <BrutalCard key={i} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-24 h-24 bg-slate-200 border-[2px] border-black rounded-lg shrink-0 overflow-hidden">
             <img src={`https://picsum.photos/seed/appr${i}/200/200`} className="w-full h-full object-cover grayscale" alt="proposal" />
          </div>
          <div className="flex-1 space-y-1">
             <div className="flex items-center gap-2">
               <Badge text="Academic" color={COLORS.teal} />
               <span className="text-[8px] font-black opacity-30 italic">SUBMITTED 2H AGO</span>
             </div>
             <h4 className="text-lg font-black uppercase italic leading-none">AI Ethics Symposium 2026</h4>
             <p className="text-[10px] font-bold opacity-60 leading-tight line-clamp-2">Exploring the intersections of machine intelligence and human morality with faculty experts.</p>
          </div>
          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
             <BrutalButton color="#4ADE80" className="flex-1 px-4 py-2">Approve</BrutalButton>
             <BrutalButton color="#F87171" className="flex-1 px-4 py-2">Reject</BrutalButton>
          </div>
        </BrutalCard>
      ))}
    </div>
  </div>
);

const OrganizerDashboard = () => (
  <div className="space-y-8">
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none underline decoration-[4px] decoration-yellow-400 underline-offset-4">Event Center</h2>
      <BrutalButton color={COLORS.yellow} className="px-6 py-2 text-[10px]"><PlusCircle className="w-4 h-4" /> New Proposal</BrutalButton>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {['Active', 'Drafts', 'History', 'Review'].map((status, i) => (
              <BrutalCard key={status} color={[COLORS.teal, COLORS.yellow, COLORS.lavender, COLORS.pink][i]} className="flex flex-col justify-between min-h-[140px] group border-b-[6px] border-b-black">
                 <div className="flex justify-between items-start">
                    <span className="text-3xl font-black italic tracking-tighter opacity-10 leading-none">0{i+2}</span>
                    <Badge text={status} color="white" />
                 </div>
                 <div className="flex justify-between items-end">
                    <span className="font-black uppercase text-md leading-none tracking-tight">{status} Events</span>
                    <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                       <ChevronRight className="w-4.5 h-4.5" />
                    </div>
                 </div>
              </BrutalCard>
            ))}
          </div>

          <div className="space-y-4">
             <h3 className="text-lg font-black uppercase italic flex items-center gap-2">Performance Flow</h3>
             <BrutalCard className="h-40 flex items-end justify-between p-6 gap-2 border-[2.5px] bg-white">
                {[45, 80, 35, 95, 60, 85, 40, 100, 20].map((h, i) => (
                  <div key={i} className="flex-1 bg-black border-[1.5px] border-white group relative hover:bg-yellow-400 transition-all rounded-t-lg" style={{ height: `${h}%` }}>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white px-1.5 py-0.5 rounded text-[7px] opacity-0 group-hover:opacity-100 transition-opacity font-bold border border-white">
                      {h}%
                    </div>
                  </div>
                ))}
             </BrutalCard>
          </div>
       </div>

       <div className="space-y-5">
          <h3 className="text-lg font-black uppercase italic">Pending Tasks</h3>
          <div className="space-y-3">
             {[
               { t: 'Security Log', e: 'Tech Fest', d: 'Today' },
               { t: 'Art Proofs', e: 'Jazz Night', d: '2 days' },
               { t: 'Catering Log', e: 'Art Gala', d: 'Tomorrow' },
             ].map((task, i) => (
               <BrutalCard key={i} className={`border-l-[10px] border-l-black hover:translate-x-1 transition-all p-3`}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[7.5px] font-black uppercase opacity-30 italic">{task.e}</span>
                    <Badge text={task.d} color={COLORS.yellow} />
                  </div>
                  <h4 className="font-black uppercase text-[12px] italic tracking-tight leading-tight">{task.t}</h4>
                  <div className="mt-3 flex gap-2">
                     <BrutalButton className="flex-1 py-1.5 text-[8px]" color="white">Verify</BrutalButton>
                     <button className="p-1.5 border-[2px] border-black rounded-lg hover:bg-slate-50 transition-colors">
                        <MoreVertical className="w-3.5 h-3.5" />
                     </button>
                  </div>
               </BrutalCard>
             ))}
          </div>
       </div>
    </div>
  </div>
);

const CreateEventFlow = () => {
  const [step, setStep] = useState(1);
  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="flex justify-between relative px-2">
        <div className="absolute top-1/2 left-0 w-full h-[3px] bg-black -translate-y-1/2 z-0"></div>
        {[1,2,3,4,5].map(s => (
          <div key={s} onClick={() => setStep(s)} className={`relative z-10 w-10 h-10 border-[3px] border-black flex items-center justify-center font-black text-md cursor-pointer transition-all rounded-2xl ${step >= s ? 'bg-yellow-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white'}`}>
            {s}
          </div>
        ))}
      </div>

      <BrutalCard className="p-6 md:p-8 space-y-5 border-b-[8px] border-b-black">
        <h2 className="text-2xl font-black uppercase italic leading-none">{['Event Details', 'Venue', 'Resources', 'Upload Poster', 'Submit'][step-1]}</h2>
        
        {step === 1 && (
          <div className="grid grid-cols-1 gap-5 mt-2">
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Title</label>
              <BrutalInput placeholder="e.g. Winter Code Sprint" />
            </div>
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Category</label>
              <select className="w-full border-[2.5px] border-black p-2.5 font-bold text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl outline-none italic">
                <option>Technical Workshop</option>
                <option>Cultural Festival</option>
                <option>Sports Tournament</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Brief Description</label>
              <textarea className="w-full border-[2.5px] border-black p-3 font-bold text-xs h-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl focus:outline-none" placeholder="Target audience..."></textarea>
            </div>
          </div>
        )}

        {step > 1 && <div className="p-16 text-center border-[3px] border-dashed border-black rounded-[1.5rem] font-black uppercase opacity-10 text-2xl italic">System Locked</div>}

        <div className="flex justify-between items-center pt-6">
          <button onClick={() => step > 1 && setStep(step - 1)} className={`font-black uppercase italic underline decoration-2 underline-offset-2 text-[10px] opacity-40 hover:opacity-100 ${step === 1 ? 'invisible' : ''}`}>&larr; Previous</button>
          <BrutalButton className="px-8" onClick={() => step < 5 && setStep(step + 1)}>
            {step === 5 ? 'Confirm' : 'Continue'}
          </BrutalButton>
        </div>
      </BrutalCard>
    </div>
  );
};

// --- GENERAL PAGE COMPONENTS ---

const ExploreEvents = () => (
  <div className="space-y-8">
    <div className="flex flex-col md:flex-row gap-3 items-center">
      <BrutalInput className="flex-1" placeholder="Search campus events..." icon={Search} />
      <BrutalButton color={COLORS.teal} className="px-6 py-2.5"><Filter className="w-4 h-4" /> Filters</BrutalButton>
    </div>

    <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
      {['All', 'Workshop', 'Concert', 'Sports', 'Code'].map(cat => (
        <button key={cat} className="whitespace-nowrap border-[2px] border-black px-4 py-1.5 font-black uppercase text-[9px] bg-white rounded-xl hover:bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all italic">
          {cat}
        </button>
      ))}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <BrutalCard key={i} className="group p-0 overflow-hidden border-b-[5px]">
           <div className="h-40 border-b-[2px] border-black relative overflow-hidden bg-slate-100">
              <img src={`https://picsum.photos/seed/${i + 170}/700/500`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt="event" />
              <div className="absolute top-2.5 left-2.5">
                <Badge text="Popular" color={COLORS.yellow} pulsing />
              </div>
           </div>
           <div className="p-5 space-y-2.5">
              <h4 className="text-lg font-black uppercase italic leading-tight">Campus Music Festival 2026</h4>
              <div className="flex items-center justify-between mt-3">
                <div className="text-[7.5px] font-black uppercase opacity-30 italic leading-snug">
                  <p>Oct 22 • 10:00 AM</p>
                  <p>Grand Arena</p>
                </div>
                <BrutalButton className="px-4 py-1 text-[8.5px]" color={COLORS.pink}>Enter</BrutalButton>
              </div>
           </div>
        </BrutalCard>
      ))}
    </div>
  </div>
);

const CalendarView = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
       <h2 className="text-3xl font-black uppercase italic tracking-tighter decoration-teal-400 underline decoration-[5px] underline-offset-2">March 2026</h2>
       <div className="flex gap-2">
         <BrutalButton color="white" className="w-9 h-9">&larr;</BrutalButton>
         <BrutalButton color="white" className="w-9 h-9">&rarr;</BrutalButton>
       </div>
    </div>
    <BrutalCard className="p-0 border-[2.5px] overflow-hidden shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
      <div className="grid grid-cols-7 border-b-[2.5px] border-black font-black uppercase text-[8px] bg-black text-white italic tracking-widest">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="p-3 border-r-[1px] border-white border-opacity-20 last:border-0 text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {[...Array(31)].map((_, i) => (
          <div key={i} className="min-h-[100px] p-2.5 border-r-[1px] border-b-[1px] border-black border-opacity-10 last:border-r-0 hover:bg-yellow-50 transition-colors cursor-pointer group">
            <span className="font-black text-lg group-hover:text-pink-500 transition-colors leading-none">{i + 1}</span>
            {i === 4 && <div className="mt-1.5 text-[7px] font-black uppercase p-1.5 bg-pink-400 border-[1.5px] border-black rounded-lg leading-tight shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Arts</div>}
            {i === 14 && <div className="mt-1.5 text-[7px] font-black uppercase p-1.5 bg-yellow-400 border-[1.5px] border-black rounded-lg leading-tight shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Tech</div>}
            {i === 21 && <div className="mt-1.5 text-[7px] font-black uppercase p-1.5 bg-teal-400 border-[1.5px] border-black rounded-lg leading-tight shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Music</div>}
          </div>
        ))}
      </div>
    </BrutalCard>
  </div>
);

const PlaceholderSection = ({ title }) => (
  <div className="h-full flex flex-col items-center justify-center py-16 px-6 text-center space-y-6">
    <div className="w-32 h-32 border-[5px] border-black rounded-[3rem] bg-slate-100 flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-6 group transition-transform hover:rotate-0">
       <Compass className="w-16 h-16 animate-spin-slow text-teal-500" />
    </div>
    <div className="space-y-1">
      <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none italic">{title}</h2>
      <p className="text-[13px] font-bold opacity-30 uppercase tracking-[0.15em] italic">Campus_Node / Ready</p>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-2xl mt-6">
       {[1,2,3,4].map(i => (
         <div key={i} className="border-[2px] border-black p-3 font-black uppercase text-[8.5px] bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-xl hover:bg-yellow-400 transition-colors italic">
            Module_ {i+20}
         </div>
       ))}
    </div>
  </div>
);