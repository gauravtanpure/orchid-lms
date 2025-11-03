// /frontend/src/pages/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth(); 
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loggedInUser = await login(identifier, password); 

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (error: any) {
      let errorMessage = "An unexpected error occurred.";
      if (error && error.response && error.response.data && error.response.data.msg) {
        errorMessage = error.response.data.msg;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.error('Login failed:', errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* ... (Header and Card structure) ... */}

        <Card className="shadow-xl">
          {/* ... (CardHeader) ... */}
          <CardContent>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Identifier Input (Email or Phone) */}
              <div className="space-y-2">
                <Label htmlFor="identifier">
                    {t('emailOrPhone') || "Email or Phone Number"}
                </Label> 
                <Input
                  id="identifier"
                  type="text" 
                  placeholder={t('identifierPlaceholder') || "Enter your email or phone number"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {/* ... (Eye button) ... */}
                </div>
                {/* 🚨 NEW: Forgot Password Link */}
                <div className="text-right">
                    <Link 
                        to="/forgot-password" 
                        className="text-sm text-primary hover:underline font-medium"
                    >
                        {t('forgotPassword') || "Forgot Password?"}
                    </Link>
                </div>
              </div>

              {/* Button Layout side-by-side */}
              <div className="flex space-x-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="w-1/2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('backToHome')}
                </Button>
                <Button
                  type="submit"
                  className="w-1/2"
                  disabled={isLoading}
                >
                  {isLoading ? t('logging_in') : t('login')}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('noAccount')}{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  {t('signup')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;