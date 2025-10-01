// src/pages/admin/AdminSettings.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const AdminSettings: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Platform Settings</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" /> General Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page is the dedicated area for platform-wide settings (e.g., changing the site name, maintenance mode, API keys).
          </p>
          <ul className="mt-4 list-disc list-inside space-y-1 text-sm">
            <li>Email Service Configuration (SMTP)</li>
            <li>Payment Gateway Setup (Razorpay/Stripe Keys)</li>
            <li>Data Backup Management</li>
          </ul>
        </CardContent>
      </Card>
      
      <p className="mt-8 text-sm text-center text-muted-foreground">
        Settings management interface coming soon...
      </p>
    </div>
  );
};

export default AdminSettings;