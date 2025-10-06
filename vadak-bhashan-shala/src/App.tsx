// /frontend/src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";

// Contexts
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";

// --- Pages ---
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Cart from "./pages/Cart";
import MyCourses from "./pages/MyCourses";
import CoursePlayer from "./pages/CoursePlayer";
import NotFound from "./pages/NotFound";

// --- Admin Pages ---
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageCourses from "./pages/admin/ManageCourses";
import ManageUsers from "./pages/admin/ManageUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import ManageFeedback from "./pages/admin/ManageFeedback";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminSettings from "./pages/admin/AdminSettings";

// 🟢 IMPORT THE NEW PublicRoute COMPONENT
import PublicRoute from "./components/PublicRoute";

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
                {/* --- 🟢 WRAP PUBLIC ROUTES --- */}
                <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
                <Route path="/courses" element={<PublicRoute><Index /></PublicRoute>} />
                <Route path="/about" element={<PublicRoute><Index /></PublicRoute>} />
                <Route path="/blogs" element={<PublicRoute><Index /></PublicRoute>} />
                <Route path="/contact" element={<PublicRoute><Index /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
                
                {/* --- Routes for logged-in regular users (not wrapped) --- */}
                <Route path="/cart" element={<Cart />} />
                <Route path="/my-courses" element={<MyCourses />} />
                <Route path="/learn/:courseId" element={<CoursePlayer />} />

                {/* --- Admin Routes (not wrapped) --- */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="courses" element={<ManageCourses />} />
                  <Route path="users" element={<ManageUsers />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="feedback" element={<ManageFeedback />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* --- Catch-all --- */}
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