import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, BookMarked, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLayout: React.FC = () => {
  const { user, isLoggedIn, logout } = useAuth();

  // Route protection: if not logged in or user is not an admin, redirect to login
  if (!isLoggedIn || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="w-64 flex-shrink-0 border-r bg-background p-4 flex flex-col">
        <h1 className="text-2xl font-heading font-bold text-primary mb-8">
          Admin Panel
        </h1>
        <nav className="flex flex-col space-y-2">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                isActive ? 'bg-muted text-primary font-semibold' : 'text-muted-foreground'
              }`
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/courses"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                isActive ? 'bg-muted text-primary font-semibold' : 'text-muted-foreground'
              }`
            }
          >
            <BookMarked className="h-4 w-4" />
            Courses
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                isActive ? 'bg-muted text-primary font-semibold' : 'text-muted-foreground'
              }`
            }
          >
            <Users className="h-4 w-4" />
            Users
          </NavLink>
        </nav>
        <div className="mt-auto">
           <Button variant="ghost" className="w-full justify-start" onClick={logout}>
             <LogOut className="h-4 w-4 mr-2"/>
             Logout
           </Button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet /> {/* Child routes will be rendered here */}
      </main>
    </div>
  );
};

export default AdminLayout;