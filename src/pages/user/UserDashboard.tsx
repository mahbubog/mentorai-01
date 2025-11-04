import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserLayout } from '../../components/UserLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Clock, Award, AlertCircle } from 'lucide-react';
import { EnrollmentRow, CourseRow } from '../../lib/database.types';

interface EnrollmentWithCourse extends EnrollmentRow {
  courses: CourseRow;
}

export function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    inProgress: 0,
    completed: 0,
    pendingPayments: 0,
  });
  const [recentCourses, setRecentCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false })
        .limit(4);

      const { data: payments } = await supabase
        .from('payments')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      const typedEnrollments = (enrollments || []) as EnrollmentWithCourse[];

      const completed = typedEnrollments.filter((e) => e.progress_percentage === 100).length || 0;
      const inProgress = typedEnrollments.filter(
        (e) => e.progress_percentage > 0 && e.progress_percentage < 100
      ).length || 0;

      setStats({
        totalCourses: typedEnrollments.length || 0,
        inProgress,
        completed,
        pendingPayments: payments?.length || 0,
      });

      setRecentCourses(typedEnrollments.map((e) => e.courses) || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {stats.pendingPayments > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800">
                You have {stats.pendingPayments} pending payment
                {stats.pendingPayments !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Admin will review your payment within 24 hours.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm font-medium">In Progress</h3>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm font-medium">Pending Payments</h3>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pendingPayments}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : recentCourses.length > 0 ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentCourses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/learn/${course.id}`}
                    className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow transition"
                  >
                    <img
                      src={course.thumbnail || 'https://via.placeholder.com/96'}
                      alt={course.title}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {course.short_description}
                      </p>
                      <button className="mt-2 text-sm text-blue-600 font-semibold hover:text-blue-700">
                        Continue →
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
              <Link
                to="/courses"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}