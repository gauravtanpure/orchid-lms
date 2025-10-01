// @/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import React from 'react'; // Import React for useEffect
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// --- User-facing Pages ---
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import MyCourses from "./pages/MyCourses";
import NotFound from "./pages/NotFound";
// 👇 IMPORT THE NEW DEDICATED SIGNUP COMPONENT
import SignUp from "./pages/SignUp"; 

// --- Admin-facing Pages (NEW) ---
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCourses from './pages/admin/ManageCourses';
import ManageUsers from './pages/admin/ManageUsers';

const queryClient = new QueryClient();

// 👇 REMOVE THE MOCK SignUp COMPONENT HERE
/*
const SignUp = () => {
    const { register, isLoggedIn } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!isLoggedIn) {
            register('New Registered User', 'newuser@test.com', 'password123');
        }
        navigate('/');
    }, [isLoggedIn, register, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            Registering and logging you in...
        </div>
    );
};
*/

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        {/* AuthProvider needs to wrap BrowserRouter for SignUp to work */}
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* --- Your Existing User Routes --- */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} /> {/* Use the imported SignUp */}
                <Route path="/cart" element={<Cart />} />
                <Route path="/my-courses" element={<MyCourses />} />
                
                {/* --- NEW: Admin Routes --- */}
                {/* This block defines all routes under the /admin path. */}
                {/* The AdminLayout component acts as a wrapper and a guard, */}
                {/* protecting all nested routes. */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="courses" element={<ManageCourses />} />
                  <Route path="users" element={<ManageUsers />} />
                </Route>

                {/* --- Your Existing Catch-all Route --- */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;