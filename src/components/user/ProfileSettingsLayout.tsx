import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Lock, Bell, Trash2 } from 'lucide-react';
import { UserLayout } from '../UserLayout';

interface ProfileSettingsLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileSettingsLayout({ children, activeTab, onTabChange }: ProfileSettingsLayoutProps) {
  const navItems = [
    { key: 'personal', icon: User, label: 'Personal Information' },
    { key: 'password', icon: Lock, label: 'Change Password' },
    { key: 'notifications', icon: Bell, label: 'Notification Preferences' },
    { key: 'management', icon: Trash2, label: 'Account Management' },
  ];

  return (
    <UserLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4 sticky top-24">
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => onTabChange(item.key)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition text-left ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow p-6 min-h-[60vh]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </UserLayout>
  );
}