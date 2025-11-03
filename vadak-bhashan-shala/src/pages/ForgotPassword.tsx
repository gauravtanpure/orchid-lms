// /frontend/src/pages/ForgotPassword.tsx
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Define the steps for the multi-step form
type Step = 'phone' | 'otp' | 'reset';

const ForgotPassword: React.FC = () => {
    const { sendPasswordResetOTP, verifyPasswordResetOTP, resetUserPassword } = useAuth();
    const { t } = useLanguage();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [resetToken, setResetToken] = useState(''); // Stores the temporary token from verify step
    const [isLoading, setIsLoading] = useState(false);

    const handleBack = () => {
        navigate('/login');
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const message = await sendPasswordResetOTP(phone);
            toast({ title: t('otpSent'), description: message });
            setStep('otp'); // Move to the next step
        } catch (error: any) {
            toast({ 
                title: t('error'), 
                description: error.message || t('otpSendFailed'), 
                variant: 'destructive' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await verifyPasswordResetOTP(phone, otp);
            toast({ title: t('otpVerified'), description: result.message });
            setResetToken(result.resetToken); // Store the token
            setStep('reset'); // Move to the final step
        } catch (error: any) {
            toast({ 
                title: t('error'), 
                description: error.message || t('otpVerificationFailed'), 
                variant: 'destructive' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (newPassword !== confirmNewPassword) {
            setIsLoading(false);
            return toast({ 
                title: t('error'), 
                description: t('passwordsDoNotMatch'), 
                variant: 'destructive' 
            });
        }

        try {
            const message = await resetUserPassword(resetToken, newPassword, confirmNewPassword);
            
            toast({ 
                title: t('success'), 
                description: message || t('passwordResetSuccess') 
            });
            
            // Redirect to login page after successful reset
            navigate('/login');
        } catch (error: any) {
            toast({ 
                title: t('error'), 
                description: error.message || t('passwordResetFailed'), 
                variant: 'destructive' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (step) {
            case 'phone':
                return (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">{t('phone_number')}</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder={t('enterRegisteredPhone')}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground pt-1">
                                {t('phoneNote')}
                            </p>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? t('sendingOtp') : t('sendOtp')}
                        </Button>
                    </form>
                );
            case 'otp':
                return (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">{t('otp')}</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder={t('enter6DigitOtp')}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength={6}
                            />
                            <p className="text-sm text-muted-foreground pt-1">
                                {t('otpSentTo')} {phone}
                            </p>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? t('verifyingOtp') : t('verifyOtp')}
                        </Button>
                        <Button type="button" variant="link" className="w-full" onClick={() => setStep('phone')}>
                            {t('backToPhone')}
                        </Button>
                    </form>
                );
            case 'reset':
                return (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">{t('newPassword')}</Label>
                            <Input
                                id="new-password"
                                type="password"
                                placeholder={t('enterNewPassword')}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">{t('confirmNewPassword')}</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                placeholder={t('reEnterNewPassword')}
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? t('resettingPassword') : t('resetPassword')}
                        </Button>
                    </form>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-heading font-bold text-primary">
                        Orchid
                    </Link>
                </div>

                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-heading">{t('forgotPasswordTitle') || "Reset Your Password"}</CardTitle>
                        <CardDescription>
                            {step === 'phone' && (t('forgotPhoneDesc') || "Enter your registered phone number to receive a verification code.")}
                            {step === 'otp' && (t('forgotOtpDesc') || "Enter the 6-digit code sent to your phone.")}
                            {step === 'reset' && (t('forgotResetDesc') || "Set a new password for your account.")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderContent()}

                        <div className="mt-6 text-center">
                            <Button
                                type="button"
                                variant="link"
                                onClick={handleBack}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('backToLogin')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;