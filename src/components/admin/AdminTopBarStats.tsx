import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, BookOpen, DollarSign, Clock } from 'lucide-react';
import { PaymentRow } from '../../lib/database.types';

export function AdminTopBarStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingPayments: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
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

      setStats({
        totalUsers: usersCount || 0,
        totalCourses: coursesCount || 0,
        pendingPayments: pendingCount || 0,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
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
  );
}