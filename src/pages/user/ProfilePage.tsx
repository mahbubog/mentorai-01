import { useState } from 'react';
import { UserLayout } from '../../components/UserLayout';
import { PersonalInformationTab } from '../../components/user/PersonalInformationTab';
import { NotificationPreferencesTab } from '../../components/user/NotificationPreferencesTab';
import { AccountManagementTab } from '../../components/user/AccountManagementTab';
import { ChangePasswordModal } from '../../components/user/ChangePasswordModal';
import { Lock } from 'lucide-react';

export function ProfilePage() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

        {/* 1. Personal Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <PersonalInformationTab />
        </div>

        {/* 2. Change Password Link/Button */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 flex justify-between items-center border-l-4 border-blue-600">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-blue-600" />
            Change Password
          </h2>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Update Password
          </button>
        </div>

        {/* 3. Notification Preferences */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <NotificationPreferencesTab />
        </div>

        {/* 4. Account Management */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <AccountManagementTab />
        </div>
      </div>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </UserLayout>
  );
}