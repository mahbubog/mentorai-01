import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Mail, Phone, Calendar, BookOpen, DollarSign, Clock, Ban, Trash2, Send, Loader2, Pencil } from 'lucide-react';
import { ProfileRow, EnrollmentRow, PaymentRow, CourseRow } from '../../lib/database.types';
import { EditUserProfileModal } from '../../components/admin/users/EditUserProfileModal';

interface UserDetails extends ProfileRow {
  email: string;
  last_sign_in_at: string | null;
  created_at: string;
  banned_until: string | null;
}

interface EnrollmentWithCourse extends EnrollmentRow {
  courses: CourseRow;
}

interface PaymentWithCourse extends PaymentRow {
  courses: { title: string } | null;
}

export function AdminUserDetailsPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [payments, setPayments] = useState<PaymentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUserDetails(userId);
    }
  }, [userId]);

  const loadUserDetails = async (id: string) => {
    setLoading(true);
    try {
      // 1. Fetch Profile Details
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`*`)
        .eq('id', id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        navigate('/admin/users', { replace: true });
        return;
      }

      // 1b. Fetch Auth Details using Admin API (requires admin privileges)
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(id);
      
      if (authError) throw authError;

      const authUserAny = authUser.user as any; // Cast to any to access admin properties (Fix Error 24)

      setUserDetails({
        ...(profileData as ProfileRow),
        email: authUserAny.email || 'N/A',
        last_sign_in_at: authUserAny.last_sign_in_at || null, // Fix Error 23
        created_at: authUserAny.created_at,
        banned_until: authUserAny.banned_until || null, // Fix Error 24
      });

      // 2. Fetch Enrollments
      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', id)
        .order('enrolled_at', { ascending: false });
      setEnrollments((enrollmentsData || []) as EnrollmentWithCourse[]);

      // 3. Fetch Payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select(`
          *,
          courses (title)
        `)
        .eq('user_id', id)
        .order('created_at', { ascending: false });
      setPayments((paymentsData || []) as PaymentWithCourse[]);

    } catch (error) {
      console.error('Error loading user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUnblock = async (currentStatus: 'Active' | 'Blocked') => {
    if (!userId) return;
    const newBanDuration: number | null = currentStatus === 'Active' ? 60 * 60 * 24 * 365 * 10 : null;
    const actionText = currentStatus === 'Active' ? 'block' : 'unblock';

    if (!confirm(`Are you sure you want to ${actionText} this user?`)) return;

    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: newBanDuration,
      } as any); 

      if (error) throw error;
      alert(`User ${actionText}ed successfully! Reloading data...`);
      loadUserDetails(userId);
    } catch (error: any) {
      alert(`Failed to ${actionText} user: ` + error.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!userId || !userDetails) return;
    if (!confirm(`Are you sure you want to permanently delete user "${userDetails.full_name || userDetails.email}"? This action cannot be undone.`)) return;

    try {
      // 1. Delete the profile data (cascades to related tables)
      await supabase.from('profiles').delete().eq('id', userId);
      
      // 2. Delete the auth user entry (requires admin privileges)
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

      if (authDeleteError) {
        console.error("Error deleting auth user:", authDeleteError);
        alert(`User profile deleted successfully. WARNING: Failed to delete associated authentication entry: ${authDeleteError.message}`);
      } else {
        alert(`User "${userDetails.full_name || userDetails.email}" deleted successfully!`);
      }

      navigate('/admin/users');
    } catch (error: any) {
      alert('Failed to delete user: ' + error.message);
    }
  };

  const handleSendEmail = () => {
    if (userDetails?.email) {
      window.location.href = `mailto:${userDetails.email}`;
    }
  };

  const getPaymentStatusBadge = (status: PaymentRow['status']) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  if (!userDetails) {
    return (
      <AdminLayout>
        <div className="p-12 text-center text-gray-500">User not found.</div>
      </AdminLayout>
    );
  }

  const isBanned = userDetails.banned_until && new Date(userDetails.banned_until) > new Date();
  const status = isBanned ? 'Blocked' : 'Active';
  const statusColor = isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  const totalSpent = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <AdminLayout>
      <div className="max-w-full mx-auto space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Details: {userDetails.full_name || userDetails.email}</h1>
          <button
            onClick={() => navigate('/admin/users')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            &larr; Back to Users
          </button>
        </div>

        {/* User Profile and Actions */}
        <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={userDetails.profile_photo || 'https://via.placeholder.com/80'}
                alt={userDetails.full_name || 'User'}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{userDetails.full_name || 'N/A'}</h2>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                  {status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{userDetails.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{userDetails.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">Registered: {new Date(userDetails.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">Last Login: {userDetails.last_sign_in_at ? new Date(userDetails.last_sign_in_at).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
            
            {userDetails.bio && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">Bio</h3>
                <p className="text-gray-700 text-sm">{userDetails.bio}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="lg:col-span-1 space-y-3 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-bold text-gray-900">Actions</h3>
            <button
              onClick={() => setShowEditModal(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Pencil className="h-5 w-5" />
              <span>Edit User Profile</span>
            </button>
            <button
              onClick={() => handleBlockUnblock(status as 'Active' | 'Blocked')}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition ${
                status === 'Active' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Ban className="h-5 w-5" />
              <span>{status === 'Active' ? 'Block Account' : 'Unblock Account'}</span>
            </button>
            <button
              onClick={handleSendEmail}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              <Send className="h-5 w-5" />
              <span>Send Email</span>
            </button>
            <button
              onClick={handleDeleteUser}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              <Trash2 className="h-5 w-5" />
              <span>Delete User</span>
            </button>
          </div>
        </div>

        {/* Enrollment History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
            Enrolled Courses ({enrollments.length})
          </h2>
          {enrollments.length === 0 ? (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">No active enrollments.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{enrollment.courses.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{new Date(enrollment.enrolled_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${enrollment.progress_percentage}%` }}></div>
                          </div>
                          <span className="text-gray-700">{enrollment.progress_percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${enrollment.completed_at ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {enrollment.completed_at ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-6 w-6 mr-2 text-green-600" />
            Payment History ({payments.length})
          </h2>
          <div className="mb-4 text-lg font-semibold text-gray-700">
            Total Spent: <span className="text-green-600">৳{totalSpent.toLocaleString()}</span>
          </div>
          {payments.length === 0 ? (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">No payment records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 text-sm text-gray-700">{new Date(payment.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.courses?.title || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">৳{payment.amount}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 capitalize">{payment.payment_method}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentStatusBadge(payment.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showEditModal && userDetails && (
        <EditUserProfileModal
          user={{
            id: userDetails.id,
            full_name: userDetails.full_name,
            email: userDetails.email,
            phone: userDetails.phone,
            profile_photo: userDetails.profile_photo,
            bio: userDetails.bio,
          }}
          onClose={() => setShowEditModal(false)}
          onSaveSuccess={() => {
            setShowEditModal(false);
            loadUserDetails(userId!);
          }}
        />
      )}
    </AdminLayout>
  );
}