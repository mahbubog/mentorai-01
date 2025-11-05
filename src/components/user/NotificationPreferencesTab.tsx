import { useState } from 'react';
import { Bell, Mail, Loader, CheckCircle } from 'lucide-react';

export function NotificationPreferencesTab() {
  const [settings, setSettings] = useState({
    email_payment: true,
    email_course: true,
    sms_payment: false,
    sms_course: false,
    system_updates: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    // Mock API call delay
    setTimeout(() => {
      setSaving(false);
      setMessage('Notification preferences saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 border-b pb-4 mb-6">Notification Preferences</h2>
      
      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-green-600 text-sm">{message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Email Settings */}
        <div className="space-y-4 border p-6 rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-600" />
            Email Notifications
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="email_payment" className="text-gray-700">Payment Status Updates</label>
              <input
                id="email_payment"
                type="checkbox"
                checked={settings.email_payment}
                onChange={() => handleToggle('email_payment')}
                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="email_course" className="text-gray-700">New Course Content / Announcements</label>
              <input
                id="email_course"
                type="checkbox"
                checked={settings.email_course}
                onChange={() => handleToggle('email_course')}
                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="space-y-4 border p-6 rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-purple-600" />
            System Notifications
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="system_updates" className="text-gray-700">Platform Updates and Security Alerts</label>
              <input
                id="system_updates"
                type="checkbox"
                checked={settings.system_updates}
                onChange={() => handleToggle('system_updates')}
                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="sms_payment" className="text-gray-700">SMS Notifications (Payment Status)</label>
              <input
                id="sms_payment"
                type="checkbox"
                checked={settings.sms_payment}
                onChange={() => handleToggle('sms_payment')}
                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {saving ? (
            <>
              <Loader className="h-5 w-5 mr-2 animate-spin" />
              Saving Preferences...
            </>
          ) : (
            'Save Preferences'
          )}
        </button>
      </form>
    </div>
  );
}