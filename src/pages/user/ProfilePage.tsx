import { useState } from 'react';
import { ProfileSettingsLayout } from '../../components/user/ProfileSettingsLayout';
import { PersonalInformationTab } from '../../components/user/PersonalInformationTab';
import { ChangePasswordTab } from '../../components/user/ChangePasswordTab';
import { NotificationPreferencesTab } from '../../components/user/NotificationPreferencesTab';
import { AccountManagementTab } from '../../components/user/AccountManagementTab';

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInformationTab />;
      case 'password':
        return <ChangePasswordTab />;
      case 'notifications':
        return <NotificationPreferencesTab />;
      case 'management':
        return <AccountManagementTab />;
      default:
        return <PersonalInformationTab />;
    }
  };

  return (
    <ProfileSettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </ProfileSettingsLayout>
  );
}