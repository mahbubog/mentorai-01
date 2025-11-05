import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserLayout } from '../../components/UserLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Play, Clock, CheckCircle, XCircle, Award } from 'lucide-react';
import { CourseRow, PaymentsRow, EnrollmentsRow } from '../../lib/database.types'; // Added missing types

// Define the unified structure for display
interface UserCourse {
  id: string; // Payment ID
  course_id: string;
  course_title: string;
  course_thumbnail: string | null;
  course_type: 'live' | 'recorded';
  course_slug: string;
  payment_status: 'pending' | 'approved' | 'rejected';
  progress_percentage: number;
  is_enrolled: boolean;
}

export function MyCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    if (!user) return;

    try {
      // Fetch all payments made by the user, joining with course details and enrollment progress
      const { data: paymentsData, error } = await supabase
        .from('payments')
        .select(`
          id,
          course_id,
          status,
          courses (id, title, thumbnail, course_type, slug),
          enrollments (progress_percentage)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedCourses: UserCourse[] = (paymentsData || []).map((p: PaymentsRow & { courses: CourseRow, enrollments: EnrollmentsRow[] }) => {
        const enrollment = p.enrollments?.[0];
        const progress = enrollment?.progress_percentage || 0;
        const paymentStatus = p.status;
        const course = p.courses;

        return {
          id: p.id, // Payment ID
          course_id: course.id,
          course_title: course.title,
          course_thumbnail: course.thumbnail,
          course_type: course.course_type,
          course_slug: course.slug,
          payment_status: paymentStatus,
          progress_percentage: progress,
          is_enrolled: paymentStatus === 'approved',
        };
      });

      setCourses(mappedCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = [
    { key: 'all', label: 'All Courses' },
    { key: 'pending_approval', label: 'Pending Approval' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'live', label: 'Live Courses' },
    { key: 'recorded', label: 'Recorded Courses' },
  ];

  const filteredCourses = courses.filter((c) => {
    if (filter === 'all') return true;

    if (filter === 'pending_approval') return c.payment_status === 'pending';
    
    // If rejected, we don't show it in progress/completed/type filters
    if (c.payment_status !== 'approved') return false;

    if (filter === 'live') return c.course_type === 'live';
    if (filter === 'recorded') return c.course_type === 'recorded';

    if (filter === 'completed') return c.progress_percentage === 100;
    if (filter === 'in_progress') return c.progress_percentage > 0 && c.progress_percentage < 100;

    return true;
  });

  const getStatusBadge = (course: UserCourse) => {
    if (course.payment_status === 'pending') {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" /> Payment Pending
        </span>
      );
    }
    if (course.payment_status === 'rejected') {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" /> Payment Rejected
        </span>
      );
    }
    if (course.progress_percentage === 100) {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          <Award className="h-3 w-3 mr-1" /> Completed
        </span>
      );
    }
    if (course.payment_status === 'approved') {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" /> Active
        </span>
      );
    }
    return null;
  };

  return (
    <UserLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Courses</h1>

        <div className="mb-6 flex flex-wrap gap-2">
          {filterOptions.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition text-sm ${
                filter === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
                <div className="relative h-48">
                  <img
                    src={course.course_thumbnail || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg'}
                    alt={course.course_title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    {getStatusBadge(course)}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {course.course_title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 capitalize">
                        {course.course_type} Course
                    </p>
                  </div>

                  {/* Progress Bar (Only for approved recorded courses) */}
                  {course.is_enrolled && course.course_type === 'recorded' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${course.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3 mt-4">
                    {course.is_enrolled ? (
                      <Link
                        to={`/learn/${course.course_id}`}
                        className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Access Course
                      </Link>
                    ) : (
                      <Link
                        to={`/payment-history`}
                        className="flex-1 text-center border border-yellow-600 text-yellow-700 py-2 rounded-lg font-semibold hover:bg-yellow-50 transition"
                      >
                        View Payment Status
                      </Link>
                    )}
                    <Link
                      to={`/courses/${course.course_slug}`}
                      className="flex-1 text-center border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No courses found matching your criteria.</p>
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