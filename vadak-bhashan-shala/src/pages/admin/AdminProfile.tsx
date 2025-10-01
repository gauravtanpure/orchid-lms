import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminProfile: React.FC = () => {
  const { user } = useAuth(); // Assume 'user' contains admin data
  
  // State for profile fields (pre-filled with mock user data)
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@edutrack.com',
    oldPassword: '',
    newPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to call an API to update name/email
    console.log('Updating profile:', { name: profileData.name, email: profileData.email });
    alert('Profile updated successfully!');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileData.newPassword.length < 6) {
        alert('New password must be at least 6 characters.');
        return;
    }
    // Logic to call an API to update password
    console.log('Updating password...');
    alert('Password updated successfully!');
    setProfileData({ ...profileData, oldPassword: '', newPassword: '' });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Admin Profile</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Details Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={profileData.name} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" value={profileData.email} onChange={handleInputChange} required />
              </div>
              <Button type="submit" className="w-full">
                <Save className="h-4 w-4 mr-2" /> Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="h-4 w-4 mr-2" /> Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input id="oldPassword" name="oldPassword" type="password" value={profileData.oldPassword} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" name="newPassword" type="password" value={profileData.newPassword} onChange={handleInputChange} required />
              </div>
              <Button type="submit" variant="destructive" className="w-full">
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* Security/Session Card Placeholder */}
      <Card className="mt-6 shadow-lg">
        <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Enable two-factor authentication or view recent login sessions here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile;