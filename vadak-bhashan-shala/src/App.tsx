import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import MyCourses from "./pages/MyCourses"; // Import new page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Mock SignUp component for routing
const SignUp = () => {
    const { register, isLoggedIn } = useAuth();
    const navigate = useNavigate();

    // Simple mock registration and immediate redirect
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
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} /> {/* Added SignUp route */}
                <Route path="/cart" element={<Cart />} />
                <Route path="/my-courses" element={<MyCourses />} /> {/* Added MyCourses route */}
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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