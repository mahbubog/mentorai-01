import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, Users, Award, BookOpen, CheckCircle } from 'lucide-react';
import { PaymentModal } from '../../components/PaymentModal';

export function CourseDetailsPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (slug) {
      loadCourseDetails();
    }
  }, [slug, user]);

  const loadCourseDetails = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          instructors (name, bio, photo),
          course_requirements (requirement),
          course_learning_outcomes (outcome)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (courseError) throw courseError;
      if (!courseData) {
        navigate('/courses');
        return;
      }

      setCourse(courseData);

      if (courseData.course_type === 'recorded') {
        const { data: sectionsData } = await supabase
          .from('course_sections')
          .select(`
            *,
            course_lessons (*)
          `)
          .eq('course_id', courseData.id)
          .order('display_order');

        setSections(sectionsData || []);
      }

      if (user) {
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseData.id)
          .maybeSingle();

        setIsEnrolled(!!enrollmentData);
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isEnrolled) {
      navigate(`/learn/${course.id}`);
      return;
    }

    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const price = course.discount_price || course.price;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                  {course.course_type === 'live' ? 'Live Course' : 'Recorded Course'}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-gray-300 mb-6">{course.short_description}</p>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{course.enrolled_count} enrolled</span>
                </div>
                {course.duration && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{course.duration}</span>
                  </div>
                )}
                <div className="flex items-center capitalize">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <span>{course.difficulty_level}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white text-gray-900 rounded-lg shadow-xl p-6 sticky top-24">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">৳{price}</div>
                  {course.discount_price && (
                    <div className="text-gray-500 line-through">৳{course.price}</div>
                  )}
                </div>

                <button
                  onClick={handleEnroll}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-4"
                >
                  {isEnrolled ? 'Go to Course' : 'Enroll Now'}
                </button>

                <div className="space-y-3 text-sm">
                  {course.includes_lifetime_access && (
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Lifetime access</span>
                    </div>
                  )}
                  {course.includes_certificate && (
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-green-500 mr-2" />
                      <span>Certificate of completion</span>
                    </div>
                  )}
                  {course.includes_mobile_access && (
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Mobile access</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.course_learning_outcomes?.map((outcome: any, index: number) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{outcome.outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {sections.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Course Content</h2>
                <div className="space-y-4">
                  {sections.map((section: any) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-bold text-lg mb-2">{section.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{section.description}</p>
                      <div className="space-y-2">
                        {section.course_lessons?.map((lesson: any) => (
                          <div key={lesson.id} className="flex items-center justify-between py-2 text-sm">
                            <span className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                              {lesson.title}
                            </span>
                            <span className="text-gray-500">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Requirements</h2>
              <ul className="space-y-2">
                {course.course_requirements?.map((req: any, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{req.requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {course.instructors && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Instructor</h2>
                <div className="flex items-start space-x-4">
                  <img
                    src={course.instructors.photo || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'}
                    alt={course.instructors.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{course.instructors.name}</h3>
                    <p className="text-gray-600 mt-2">{course.instructors.bio}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPaymentModal && course && (
        <PaymentModal
          course={course}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            loadCourseDetails();
          }}
        />
      )}
    </div>
  );
}
