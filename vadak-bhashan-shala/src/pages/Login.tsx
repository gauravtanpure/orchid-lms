import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react'; // Import AlertTriangle

const Login: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast(); // Use toast hook
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back to Orchid Learning!",
      });
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-heading font-bold text-primary">
            Orchid
          </Link>
          <p className="text-muted-foreground mt-2">
            {t('loginSubtitle')}
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-heading">{t('login')}</CardTitle>
            <CardDescription>{t('loginDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* DEMO CREDENTIALS REMINDER */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-3 mb-4 rounded-md text-sm">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                <p className="font-medium">Demo Credentials:</p>
              </div>
              <ul className="list-disc list-inside ml-5 mt-1 text-xs">
                <li>Email: <strong>demo@user.com</strong></li>
                <li>Password: <strong>(any non-empty password)</strong></li>
              </ul>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t('logging_in') : t('login')}
              </Button>
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