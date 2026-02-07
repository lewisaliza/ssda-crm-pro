import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { initializeDatabase, DB } from './services/DatabaseService';
import { Member, Community, Event, AttendanceRecord, Contribution } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginView from './views/LoginView';
import ForgotPasswordView from './views/ForgotPasswordView';

import {
  LayoutDashboard,
  Users,
  Home,
  Calendar,
  DollarSign,
  Bot,
  Menu,
  X,
  LogOut,
  Shield
} from 'lucide-react';

import DashboardView from './views/DashboardView';
import MembersView from './views/MembersView';
import CommunitiesView from './views/CommunitiesView';
import EventsView from './views/EventsView';
import FinancesView from './views/FinancesView';
import RetentionView from './views/RetentionView';
import UserManagementView from './views/UserManagementView';

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-lg transition-all
      ${isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'}
    `}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </NavLink>
);

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const { user, logout } = useAuth();

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Data State for child components
  const [members, setMembers] = useState<Member[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isDbReady, setIsDbReady] = useState(false);

  // Initialize Database
  React.useEffect(() => {
    const init = async () => {
      await initializeDatabase();
      await refreshData();
      setIsDbReady(true);
    };
    init();
  }, []);

  const refreshData = async () => {
    try {
      const [
        membersData,
        communitiesData,
        eventsData,
        attendanceData,
        contributionsData
      ] = await Promise.all([
        DB.getMembers(),
        DB.getCommunities(),
        DB.getEvents(),
        DB.getAttendance(),
        DB.getContributions()
      ]);

      setMembers(membersData);
      setCommunities(communitiesData);
      setEvents(eventsData);
      setAttendance(attendanceData);
      setContributions(contributionsData);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

  const handleAddMember = async (newMember: Member) => {
    await DB.addMember(newMember);
    await refreshData();
  };

  const handleEditMember = async (updatedMember: Member) => {
    await DB.updateMember(updatedMember);
    await refreshData();
  };

  const handleDeleteMember = async (id: string) => {
    await DB.deleteMember(id);
    await refreshData();
  };

  const handleAddContribution = async (newContribution: Contribution) => {
    await DB.addContribution(newContribution);
    await refreshData();
  };

  const handleAddAttendance = async (newRecord: AttendanceRecord) => {
    await DB.addAttendance(newRecord);
    await refreshData();
  };

  const handleAddCommunity = async (newCommunity: Community) => {
    await DB.addCommunity(newCommunity);
    await refreshData();
  };

  const handleEditCommunity = async (updatedCommunity: Community) => {
    await DB.updateCommunity(updatedCommunity);
    await refreshData();
  };

  const handleDeleteCommunity = async (id: string) => {
    await DB.deleteCommunity(id);
    await refreshData();
  };

  const handleAddEvent = async (newEvent: Event) => {
    await DB.addEvent(newEvent);
    await refreshData();
  };

  const handleEditEvent = async (updatedEvent: Event) => {
    await DB.updateEvent(updatedEvent);
    await refreshData();
  };

  const handleDeleteEvent = async (id: string) => {
    await DB.deleteEvent(id);
    await refreshData();
  };

  if (!isDbReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Initializing Secure Database...</p>
        </div>
      </div>
    );
  }

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg overflow-hidden border border-slate-100 shadow-sm">
              <img src="/images/sda_logo.jpg" alt="SDA Logo" className="w-full h-full object-contain" width="40" height="40" loading="lazy" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">SEGEREA SDA SmartPro</h1>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar" onClick={handleNavClick}>
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

            {user?.role !== 'admin' && (
              <>
                <NavItem to="/members" icon={Users} label="Members" />
                <NavItem to="/communities" icon={Home} label="Communities" />
                <NavItem to="/events" icon={Calendar} label="Events" />
                <NavItem to="/finances" icon={DollarSign} label="Finances" />
                <NavItem to="/retention" icon={Bot} label="Retention Bot" />
              </>
            )}

            {user?.role === 'admin' && (
              <div className="pt-2 mt-2 border-t border-slate-100">
                <NavItem to="/users" icon={Shield} label="User Management" />
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-slate-800 truncate w-32">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role || 'Admin'}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-slate-400 hover:text-red-600 transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              System Online
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 overflow-auto">
          <Routes>
            <Route path="/dashboard" element={<DashboardView members={members} contributions={contributions} communities={communities} />} />

            {user?.role !== 'admin' && (
              <>
                <Route
                  path="/members"
                  element={
                    <MembersView
                      members={members}
                      attendance={attendance}
                      contributions={contributions}
                      communities={communities}
                      onAddMember={handleAddMember}
                      onEditMember={handleEditMember}
                      onDeleteMember={handleDeleteMember}
                    />
                  }
                />
                <Route
                  path="/communities"
                  element={
                    <CommunitiesView
                      communities={communities}
                      members={members}
                      onAddCommunity={handleAddCommunity}
                      onEditCommunity={handleEditCommunity}
                      onDeleteCommunity={handleDeleteCommunity}
                    />
                  }
                />
                <Route
                  path="/events"
                  element={
                    <EventsView
                      events={events}
                      attendance={attendance}
                      members={members}
                      onAddAttendance={handleAddAttendance}
                      onAddEvent={handleAddEvent}
                      onEditEvent={handleEditEvent}
                      onDeleteEvent={handleDeleteEvent}
                    />
                  }
                />
                <Route
                  path="/finances"
                  element={
                    <FinancesView
                      contributions={contributions}
                      members={members}
                      onAddContribution={handleAddContribution}
                    />
                  }
                />
                <Route
                  path="/retention"
                  element={
                    <RetentionView
                      members={members}
                      attendance={attendance}
                      events={events}
                    />
                  }
                />
              </>
            )}

            {user?.role === 'admin' && (
              <Route path="/users" element={<UserManagementView />} />
            )}

            {/* Fallback to Dashboard if matched here, RequireAuth handles the rest */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

// CheckAuth: If authenticated, redirect to dashboard. If not, show children (Login).
const PublicOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // Or a spinner

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={
            <PublicOnly>
              <LoginView />
            </PublicOnly>
          } />
          <Route path="/forgot-password" element={<ForgotPasswordView />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <MainLayout />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
