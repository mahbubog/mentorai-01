import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Mail, Phone, Calendar, Eye, Pencil, Ban, Trash2, Search, Download } from 'lucide-react'; // Removed unused User, CheckCircle, Filter
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { EditUserProfileModal } from '../../components/admin/users/EditUserProfileModal'; // New component for editing

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  profile_photo: string | null;
  created_at: string;
  email: string; // From auth.users
  banned_until: string | null; // From auth.users
  enrollments: { id: string }[];
}

export function AdminUsersPage() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'blocked'
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allUsers, searchTerm, statusFilter, startDate, endDate]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          profile_photo,
          created_at,
          auth_users:id (email, banned_until),
          enrollments (id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersData: UserProfile[] = (data || []).map((profile: any) => ({
        id: profile.id,
        full_name: profile.full_name,
        phone: profile.phone,
        profile_photo: profile.profile_photo,
        created_at: profile.created_at,
        email: profile.auth_users?.email || 'N/A',
        banned_until: profile.auth_users?.banned_until || null,
        enrollments: profile.enrollments || [],
      }));
      setAllUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let tempUsers = [...allUsers];

    // Search
    if (searchTerm) {
      tempUsers = tempUsers.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status Filter
    if (statusFilter === 'active') {
      tempUsers = tempUsers.filter((user) => !user.banned_until || new Date(user.banned_until) < new Date());
    } else if (statusFilter === 'blocked') {
      tempUsers = tempUsers.filter((user) => user.banned_until && new Date(user.banned_until) >= new Date());
    }

    // Date Filter
    if (startDate) {
      tempUsers = tempUsers.filter((user) => new Date(user.created_at) >= startDate);
    }
    if (endDate) {
      tempUsers = tempUsers.filter((user) => new Date(user.created_at) <= endDate);
    }

    setFilteredUsers(tempUsers);
  };

  const getUserStatus = (user: UserProfile) => {
    if (user.banned_until && new Date(user.banned_until) >= new Date()) {
      return { text: 'Blocked', color: 'bg-red-100 text-red-800' };
    }
    return { text: 'Active', color: 'bg-green-100 text-green-800' };
  };

  const handleBlockUnblock = async (userId: string, currentStatus: 'Active' | 'Blocked') => {
    const newBanDuration: number | null = currentStatus === 'Active' ? 60 * 60 * 24 * 365 * 10 : null; // Block for 10 years in seconds or unblock (null)
    const actionText = currentStatus === 'Active' ? 'block' : 'unblock';

    if (!confirm(`Are you sure you want to ${actionText} this user?`)) return;

    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: newBanDuration,
      });

      if (error) throw error;

      alert(`User ${actionText}ed successfully!`);
      loadUsers(); // Reload data to reflect changes
    } catch (error: any) {
      console.error(`Error ${actionText}ing user:`, error);
      alert(`Failed to ${actionText} user: ` + error.message);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string | null) => {
    if (!confirm(`Are you sure you want to permanently delete user "${userName || userId}"? This action cannot be undone.`)) return;

    try {
      // Client-side deletion of auth.users is not directly supported without a service role key.
      // We can delete the profile data, but the auth.users entry will remain unless handled by an Edge Function or Supabase Dashboard.
      // For this example, we'll delete the profile and inform the user about the auth.users limitation.

      // Delete profile data (which should cascade to enrollments, lesson_progress, user_notes due to RLS/FK)
      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileDeleteError) {
        console.error("Error deleting user profile:", profileDeleteError);
        throw new Error("Failed to delete user profile data. " + profileDeleteError.message);
      }

      alert(`User profile for "${userName || userId}" deleted successfully. Please note: The associated authentication entry in 'auth.users' needs to be manually deleted from the Supabase dashboard or via a custom Edge Function for full removal.`);
      loadUsers(); // Reload data
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + error.message);
    }
  };

  const handleExportUsers = () => {
    alert('Export to CSV/Excel feature coming soon!');
    // Implement CSV/Excel export logic here
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>

        {/* Top Actions: Search, Filters, Export */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registered From</label>
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => setStartDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Select start date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registered To</label>
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Select end date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleExportUsers}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Enrolled Courses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Joined Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const status = getUserStatus(user);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.profile_photo ? (
                                <img src={user.profile_photo} alt={user.full_name || 'User'} className="h-10 w-10 rounded-full object-cover" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                  {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <p className="font-medium text-gray-900">{user.full_name || 'N/A'}</p>
                              <p className="text-sm text-gray-500">ID: {user.id.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="hover:text-blue-600">{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-semibold">{user.enrollments?.length || 0}</span>{' '}
                          courses
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => alert(`Viewing user: ${user.full_name || user.email}`)}
                              className="text-blue-600 hover:text-blue-700"
                              title="View User Details"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setSelectedUserToEdit(user)}
                              className="text-gray-600 hover:text-gray-700"
                              title="Edit User Profile"
                            >
                              <Pencil className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleBlockUnblock(user.id, status.text as 'Active' | 'Blocked')}
                              className={`${status.text === 'Active' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                              title={status.text === 'Active' ? 'Block User' : 'Unblock User'}
                            >
                              <Ban className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.full_name)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete User"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="p-12 text-center text-gray-500">No users found</div>
            )}
          </div>
        )}
      </div>

      {selectedUserToEdit && (
        <EditUserProfileModal
          user={selectedUserToEdit}
          onClose={() => setSelectedUserToEdit(null)}
          onSaveSuccess={loadUsers} // Reload users after successful edit
        />
      )}
    </AdminLayout>
  );
}