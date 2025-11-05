import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Users, BookOpen, DollarSign, Clock, Activity, UserPlus, Plus, Eye, FileText } from 'lucide-react';
import { PaymentRow, ProfileRow } from '../../lib/database.types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, PieLabelRenderProps
} from 'recharts';

// Mock data for charts (replace with actual data fetching/aggregation later)
const mockRevenueData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 4500 },
  { name: 'May', revenue: 6000 },
  { name: 'Jun', revenue: 7000 },
];

const mockEnrollmentsByCategoryData = [
  { name: 'Web Dev', value: 400 },
  { name: 'Data Science', value: 300 },
  { name: 'Design', value: 300 },
  { name: 'Marketing', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const mockUserGrowthData = [
  { name: 'Jan', users: 100 },
  { name: 'Feb', users: 120 },
  { name: 'Mar', users: 150 },
  { name: 'Apr', users: 180 },
  { name: 'May', users: 220 },
  { name: 'Jun', users: 250 },
];

interface RecentActivityItem {
  type: 'user_registration' | 'course_enrollment' | 'pending_payment' | 'course_review';
  id: string;
  message: string;
  timestamp: string;
  link?: string;
}

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    activeStudents: 0,
    newRegistrationsThisMonth: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // --- Statistics Overview ---
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

      const totalRevenue = (approvedPayments as PaymentRow[] | null)?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      const { count: activeStudentsCount } = await supabase
        .from('enrollments')
        .select('user_id', { count: 'exact', head: true })
        .eq('progress_percentage', 0) // Assuming active means not completed
        .neq('progress_percentage', 100);

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newRegistrationsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      setStats({
        totalUsers: usersCount || 0,
        totalCourses: coursesCount || 0,
        pendingPayments: pendingCount || 0,
        totalRevenue: totalRevenue,
        activeStudents: activeStudentsCount || 0,
        newRegistrationsThisMonth: newRegistrationsCount || 0,
      });

      // --- Recent Activity Feed ---
      const activityPromises = [
        supabase.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('enrollments').select('id, created_at, courses(title), profiles(full_name)').order('enrolled_at', { ascending: false }).limit(3),
        supabase.from('payments').select('id, created_at, courses(title), profiles(full_name)').eq('status', 'pending').order('created_at', { ascending: false }).limit(3),
        supabase.from('course_reviews').select('id, created_at, review, profiles(full_name), courses(title)').order('created_at', { ascending: false }).limit(3),
      ];

      const [
        { data: newUsers },
        { data: newEnrollments },
        { data: pendingPayments },
        { data: recentReviews },
      ] = await Promise.all(activityPromises);

      const activities: RecentActivityItem[] = [];

      (newUsers || []).forEach((user: ProfileRow) => {
        activities.push({
          type: 'user_registration',
          id: user.id,
          message: `New user registered: ${user.full_name || 'N/A'}`,
          timestamp: user.created_at,
          link: `/admin/users`,
        });
      });

      (newEnrollments || []).forEach((enrollment: any) => {
        activities.push({
          type: 'course_enrollment',
          id: enrollment.id,
          message: `New enrollment in "${enrollment.courses?.title || 'N/A'}" by ${enrollment.profiles?.full_name || 'N/A'}`,
          timestamp: enrollment.created_at,
          link: `/admin/payments`, // Enrollments are linked to payments for review
        });
      });

      (pendingPayments || []).forEach((payment: any) => {
        activities.push({
          type: 'pending_payment',
          id: payment.id,
          message: `Pending payment for "${payment.courses?.title || 'N/A'}" by ${payment.profiles?.full_name || 'N/A'}`,
          timestamp: payment.created_at,
          link: `/admin/payments`,
        });
      });

      (recentReviews || []).forEach((review: any) => {
        activities.push({
          type: 'course_review',
          id: review.id,
          message: `New review for "${review.courses?.title || 'N/A'}" by ${review.profiles?.full_name || 'N/A'}`,
          timestamp: review.created_at,
          link: `/admin/courses`, // Or a dedicated reviews page
        });
      });

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 10)); // Show top 10 recent activities

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

        {/* Statistics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm font-medium">Pending Payments</h3>
              <div className="relative">
                <Clock className="h-8 w-8 text-yellow-600" />
                {stats.pendingPayments > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.pendingPayments}
                  </span>
                )}
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pendingPayments}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">৳{stats.totalRevenue.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm font-medium">Active Students</h3>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.activeStudents}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm font-medium">New Registrations (Month)</h3>
              <UserPlus className="h-8 w-8 text-teal-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.newRegistrationsThisMonth}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/courses/new" // Assuming a route for adding new courses
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Course</span>
            </Link>
            <Link
              to="/admin/payments?filter=pending"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition"
            >
              <Eye className="h-5 w-5" />
              <span>Review Payments</span>
            </Link>
            <Link
              to="/admin/pages/new" // Assuming a route for adding new pages
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              <FileText className="h-5 w-5" />
              <span>Add New Page</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity Feed */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentActivity.map((activity) => (
                  <Link
                    key={activity.id}
                    to={activity.link || '#'}
                    className="flex items-center py-3 hover:bg-gray-50 transition px-2 -mx-2 rounded-lg"
                  >
                    <div className="flex-shrink-0 mr-3">
                      {activity.type === 'user_registration' && <UserPlus className="h-5 w-5 text-blue-500" />}
                      {activity.type === 'course_enrollment' && <BookOpen className="h-5 w-5 text-green-500" />}
                      {activity.type === 'pending_payment' && <Clock className="h-5 w-5 text-yellow-500" />}
                      {activity.type === 'course_review' && <Activity className="h-5 w-5 text-purple-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No recent activity.</div>
            )}
          </div>

          {/* Charts/Graphs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Enrollments by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockEnrollmentsByCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, percent }: PieLabelRenderProps) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} // Corrected type for label prop
                  dataKey="value"
                >
                  {mockEnrollmentsByCategoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Growth</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockUserGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}