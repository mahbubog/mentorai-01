import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserLayout } from '../../components/UserLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Play } from 'lucide-react';

export function MyCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (*),
          payments (status)
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((enrollment) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return enrollment.progress_percentage === 100;
    if (filter === 'in_progress') return enrollment.progress_percentage > 0 && enrollment.progress_percentage < 100;
    return true;
  });

  return (
    <UserLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Courses</h1>

        <div className="mb-6 flex space-x-2">
          {['all', 'in_progress', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((enrollment) => (
              <div key={enrollment.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={enrollment.courses.thumbnail}
                    alt={enrollment.courses.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <Link
                      to={`/learn/${enrollment.courses.id}`}
                      className="bg-white text-blue-600 p-4 rounded-full hover:bg-blue-600 hover:text-white transition"
                    >
                      <Play className="h-8 w-8" />
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {enrollment.courses.title}
                  </h3>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{enrollment.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <Link
                    to={`/learn/${enrollment.courses.id}`}
                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Continue Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No courses found.</p>
            <Link
              to="/courses"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
