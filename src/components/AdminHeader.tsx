import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

export function AdminHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin User';

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-purple-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/admin" className="flex items-center space-x-2">
            <LayoutDashboard className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold text-gray-900">Admin Panel</span>
          </Link>

          <div className="flex items-center space-x-6">
            {/* Admin Name / Quick Info */}
            <div className="hidden sm:block text-sm text-gray-600">
              <span className="font-medium">Welcome, {userName}</span>
            </div>
            
            {/* Notifications */}
            <NotificationDropdown />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition"
              >
                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-3 border-b">
                    <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </Link>
                    <Link
                      to="/"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Go to Site
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}