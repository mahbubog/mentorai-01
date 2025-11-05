import { AdminLayout } from '../../components/AdminLayout';
import { Settings } from 'lucide-react';

export function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-full py-12 bg-white rounded-lg shadow">
        <Settings className="h-24 w-24 text-gray-300 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Settings</h1>
        <p className="text-gray-600 text-lg">Configure application-wide settings.</p>
        <p className="text-gray-500 mt-2">Feature coming soon!</p>
      </div>
    </AdminLayout>
  );
}