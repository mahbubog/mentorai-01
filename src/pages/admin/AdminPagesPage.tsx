import { AdminLayout } from '../../components/AdminLayout';
import { FileText } from 'lucide-react';

export function AdminPagesPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-full py-12 bg-white rounded-lg shadow">
        <FileText className="h-24 w-24 text-gray-300 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Pages Management</h1>
        <p className="text-gray-600 text-lg">Manage your website's static pages here.</p>
        <p className="text-gray-500 mt-2">Feature coming soon!</p>
      </div>
    </AdminLayout>
  );
}