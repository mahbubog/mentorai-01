import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Phone, Search, Download, Pencil, Ban, Trash2, Eye } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { EditUserProfileModal } from '../../components/admin/users/EditUserProfileModal';

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
      // Fetch profiles, joining auth_users (for email/ban status) and enrollments count.
      // Since we start from 'profiles', we get all users who successfully registered and created a profile entry.
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
      // Filter up to the end of the selected day
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      tempUsers = tempUsers.filter((user) => new Date(user.created_at) <= endOfDay);
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
    const newBanDuration: number | null = currentStatus === 'Active' ? 60 * 60 * 24 * 365 * 10 : null; // Block for 10 years
    const actionText = currentStatus === 'Active' ? 'block' : 'unblock';

    if (!confirm(`Are you sure you want to ${actionText} this user?`)) return;

    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: newBanDuration,
      } as any); 

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
      // Delete the profile data, which should cascade to related tables (enrollments, notes, etc.)
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
            <div className="md:col-span-1 flex items-end">
              <button
                onClick={handleExportUsers}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Export Users
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User (ID / Name / Email)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const status = getUserStatus(user);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={user.profile_photo || 'https://via.placeholder.com/48'}
                              alt={user.full_name || 'User'}
                              className="w-10 h-10 rounded-full object-cover mr-3"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{user.full_name || 'N/A'}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{user.phone || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.enrollments.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setSelectedUserToEdit(user)}
                              className="text-gray-600 hover:text-gray-700"
                              title="View Details"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setSelectedUserToEdit(user)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Edit Profile"
                            >
                              <Pencil className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleBlockUnblock(user.id, status.text as 'Active' | 'Blocked')}
                              className={status.text === 'Active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                              title={status.text === 'Active' ? 'Block User' : 'Unblock User'}
                            >
                              <Ban className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.full_name)}
                              className="text-gray-600 hover:text-gray-700"
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
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No users found matching your criteria.</p>
          </div>
        )}
      </div>

      {selectedUserToEdit && (
        <EditUserProfileModal
          user={selectedUserToEdit}
          onClose={() => setSelectedUserToEdit(null)}
          onSaveSuccess={loadUsers}
        />
      )}
    </AdminLayout>
  );
}