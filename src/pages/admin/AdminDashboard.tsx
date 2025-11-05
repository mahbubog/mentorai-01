import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Users, BookOpen, DollarSign, Clock } from 'lucide-react';
import { PaymentRow } from '../../lib/database.types';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingPayments: 0,
    totalRevenue: 0,
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      const { count: pendingCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { data: approvedPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'approved');

      const revenue = (approvedPayments as PaymentRow[] | null)?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      const { data: payments } = await supabase
        .from('payments')
        .select(`
          *,
          courses (title),
          profiles:user_id (full_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: usersCount || 0,
        totalCourses: coursesCount || 0,
        pendingPayments: pendingCount || 0,
        totalRevenue: revenue,
      });

      setRecentPayments(payments || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm font-medium">Pending Payments</h3>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pendingPayments}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">৳{stats.totalRevenue}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Pending Payment Reviews</h2>
            <Link
              to="/admin/payments"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              View All
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : recentPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.profiles?.full_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {payment.courses?.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ৳{payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to="/admin/payments"
                          className="text-blue-600 font-semibold hover:text-blue-700"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              No pending payments to review
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}