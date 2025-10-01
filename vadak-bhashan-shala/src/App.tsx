// @/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";

// Contexts
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";

// --- User-facing Pages ---
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import MyCourses from "./pages/MyCourses";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp"; 

// --- Admin-facing Pages ---
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageCourses from "./pages/admin/ManageCourses";
import ManageUsers from "./pages/admin/ManageUsers";

// NEW IMPORTS for Admin Pages (Based on your file structure image)
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminProfile from "./pages/admin/AdminProfile";
import ManageFeedback from "./pages/admin/ManageFeedback";
import AdminSettings from "./pages/admin/AdminSettings"; // Assuming a placeholder for settings

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* --- Home + Section Routes all point to Index --- */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<Index />} />
                <Route path="/courses" element={<Index />} />
                <Route path="/blogs" element={<Index />} />
                <Route path="/contact" element={<Index />} />

                {/* --- User Routes --- */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/my-courses" element={<MyCourses />} />

                {/* --- Admin Routes (UPDATED) --- */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="analytics" element={<AdminAnalytics />} /> {/* NEW ROUTE */}
                  <Route path="courses" element={<ManageCourses />} />
                  <Route path="users" element={<ManageUsers />} />
                  <Route path="feedback" element={<ManageFeedback />} /> {/* NEW ROUTE */}
                  <Route path="profile" element={<AdminProfile />} /> {/* NEW ROUTE */}
                  <Route path="settings" element={<AdminSettings />} /> {/* NEW ROUTE (Placeholder) */}
                </Route>

                {/* --- Catch-all Route --- */}
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