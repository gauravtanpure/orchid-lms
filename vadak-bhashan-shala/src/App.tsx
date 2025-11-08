// App.tsx
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";

// Contexts
import { LanguageProvider } from "./contexts/LanguageContext";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Index from "./pages/Index"; // The main public wrapper for landing, courses, about, contact, and blog index
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Cart from "./pages/Cart";
import MyCourses from "./pages/MyCourses";
import CoursePlayer from "./pages/CoursePlayer";
import NotFound from "./pages/NotFound";
import HomeBanner from './components/HomeBanner';
import BlogDetails from './pages/BlogDetails';
import CourseDetails from "./pages/CourseDetails";
import ForgotPassword from "./pages/ForgotPassword"; 

// Admin Pages
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageCourses from "./pages/admin/ManageCourses";
import ManageCoupons from "./pages/admin/ManageCoupons";
import ManageUsers from "./pages/admin/ManageUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import ManageFeedback from "./pages/admin/ManageFeedback";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminSettings from "./pages/admin/AdminSettings";
import ManageBlogs from './pages/admin/ManageBlogs';
// ⬇️ NEW ADMIN PAGE IMPORT (assuming you create this file)
import ManageBanners from './pages/admin/ManageBanners'; 

// Route Components
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute"; // Ensures logged-in access

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
                {/* ----------------- Public Routes (wrapped by PublicRoute/Index) ----------------- */}
                <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
                <Route path="/courses" element={<PublicRoute><Index /></PublicRoute>} />
                <Route path="/about" element={<PublicRoute><Index /></PublicRoute>} />
                <Route path="/blogs" element={<PublicRoute><Index /></PublicRoute>} />
                <Route path="/contact" element={<PublicRoute><Index /></PublicRoute>} />
                <Route path="banners" element={<ManageBanners />} />
                {/* Specific public routes that don't use the Index wrapper */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/course/:slug" element={<CourseDetails />} />
                <Route path="/blog/:blogId" element={<PublicRoute><BlogDetails /></PublicRoute>} />

                {/* ----------------- Logged-in User Routes ----------------- */}
                <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
                <Route path="/learn/:slug" element={<ProtectedRoute><CoursePlayer /></ProtectedRoute>} />

                

                {/* ----------------- Admin Routes ----------------- */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute role="admin">
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="courses" element={<ManageCourses />} />
                  <Route path="coupons" element={<ManageCoupons />} />
                  <Route path="blogs" element={<ManageBlogs />} />
                  {/* ⬇️ NEW BANNERS ROUTE */}
                  <Route path="banners" element={<ManageBanners />} /> 
                  <Route path="users" element={<ManageUsers />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="feedback" element={<ManageFeedback />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* ----------------- Catch-all ----------------- */}
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