import React, { useState } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookMarked,
  Users,
  LogOut,
  BarChart3,
  User,
  MessageSquare,
  Bell,
  Menu,
  X,
  ChevronRight,
  Settings,
} from 'lucide-react';

// Mock auth context
const useAuth = () => ({
  user: { name: 'Admin User', email: 'admin@orchid.com', role: 'admin' },
  isLoggedIn: true,
  logout: () => console.log('Logging out...'),
});

const AdminLayout = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isLoggedIn || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Orchid</h1>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {/* Overview Section */}
          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Overview
            </p>
            <div className="space-y-1">
              <NavLink
                to="/admin"
                end
                className={linkClass}
                onClick={() => setSidebarOpen(false)}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="text-sm">Dashboard</span>
              </NavLink>
              <NavLink
                to="/admin/analytics"
                className={linkClass}
                onClick={() => setSidebarOpen(false)}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm">Analytics</span>
              </NavLink>
            </div>
          </div>

          {/* Management Section */}
          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Management
            </p>
            <div className="space-y-1">
              <NavLink
                to="/admin/courses"
                className={linkClass}
                onClick={() => setSidebarOpen(false)}
              >
                <BookMarked className="h-5 w-5" />
                <span className="text-sm">Courses</span>
              </NavLink>
              <NavLink
                to="/admin/users"
                className={linkClass}
                onClick={() => setSidebarOpen(false)}
              >
                <Users className="h-5 w-5" />
                <span className="text-sm">Users</span>
              </NavLink>
              <NavLink
                to="/admin/feedback"
                className={linkClass}
                onClick={() => setSidebarOpen(false)}
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm">Feedback</span>
              </NavLink>
            </div>
          </div>

          {/* Settings Section */}
          <div>
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Settings
            </p>
            <div className="space-y-1">
              <NavLink
                to="/admin/profile"
                className={linkClass}
                onClick={() => setSidebarOpen(false)}
              >
                <User className="h-5 w-5" />
                <span className="text-sm">Profile</span>
              </NavLink>
              <NavLink
                to="/admin/settings"
                className={linkClass}
                onClick={() => setSidebarOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span className="text-sm">Platform Settings</span>
              </NavLink>
            </div>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 lg:flex-initial">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
              Admin Dashboard
            </h2>
            <p className="text-sm text-gray-500 hidden sm:block">
              Manage your educational platform
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;