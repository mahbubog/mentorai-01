import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, Users, Award, BookOpen, CheckCircle, Star, Download, Smartphone, Lock, Calendar, Globe } from 'lucide-react';
import { PaymentModal } from '../../components/PaymentModal';
import { CourseRow } from '../../lib/database.types';

// Define a type for the course data including related tables
interface CourseDetails extends CourseRow {
  instructors: {
    id: string;
    name: string;
    bio: string | null;
    photo: string | null;
  } | null;
  course_requirements: { requirement: string }[];
  course_learning_outcomes: { outcome: string }[];
  target_audience: string | null;
}

interface ReviewWithProfile {
  id: string;
  rating: number;
  review: string | null;
  created_at: string;
  profiles: { full_name: string } | null;
}

export function CourseDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview');
  const [reviewSort, setReviewSort] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [totalLessons, setTotalLessons] = useState(0);

  useEffect(() => {
    if (slug) {
      loadCourseDetails();
    }
  }, [slug, user]);

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const loadCourseDetails = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          instructors (id, name, bio, photo),
          course_requirements (requirement),
          course_learning_outcomes (outcome)
        `)
        .eq('slug', slug!)
        .eq('status', 'published')
        .maybeSingle();

      if (courseError) throw courseError;
      if (!courseData) {
        navigate('/courses');
        return;
      }

      const typedCourseData = courseData as unknown as CourseDetails;
      setCourse(typedCourseData);

      let lessonCount = 0;
      if (typedCourseData.course_type === 'recorded') {
        const { data: sectionsData } = await supabase
          .from('course_sections')
          .select(`
            *,
            course_lessons (*)
          `)
          .eq('course_id', typedCourseData.id)
          .order('display_order');

        const sectionsArray = sectionsData || [];
        setSections(sectionsArray);
        // Fix for TS2339: Explicitly type 's' in reduce function or cast sectionsArray
        lessonCount = sectionsArray.reduce((acc, s: any) => acc + (s.course_lessons?.length || 0), 0) || 0;
      }
      setTotalLessons(lessonCount);

      const { data: reviewsData } = await supabase
        .from('course_reviews')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('course_id', typedCourseData.id)
        .eq('status', 'approved') // Only show approved reviews
        .order('created_at', { ascending: false });

      setReviews((reviewsData || []) as ReviewWithProfile[]);

      if (user) {
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', typedCourseData.id)
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
      // Redirect to login, passing the current path so the user returns here
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (isEnrolled) {
      navigate(`/learn/${course!.id}`);
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
  const levelMap = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
  const formattedDate = course.updated_at ? new Date(course.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const sortedReviews = [...reviews].sort((a, b) => {
    if (reviewSort === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (reviewSort === 'highest') return b.rating - a.rating;
    if (reviewSort === 'lowest') return a.rating - b.rating;
    return 0;
  });

  const otherInstructorCourses = course.instructors?.id ? 1 : 0; // Placeholder count

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-600 px-4 py-1 rounded-full text-sm font-bold uppercase">
                  {course.course_type === 'live' ? 'Live' : 'Recorded'}
                </span>
                <div className="flex items-center text-yellow-300">
                  <Star className="h-5 w-5 fill-current mr-1" />
                  <span className="font-semibold">{course.rating || 4.5}</span>
                  <span className="text-gray-300 ml-2">({reviews.length} reviews)</span>
                </div>
              </div>

              <h1 className="text-5xl font-bold mb-4 leading-tight">{course.title}</h1>
              <p className="text-xl text-gray-200 mb-8">{course.short_description}</p>

              {/* Course Preview Video/Thumbnail */}
              <div className="mt-8 mb-8">
                {course.preview_video ? (
                  <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                    <iframe
                      src={getYouTubeEmbedUrl(course.preview_video)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <img
                    src={course.thumbnail || 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg'}
                    alt={course.title}
                    className="w-full h-96 object-cover rounded-xl shadow-2xl"
                  />
                )}
              </div>
              {/* End Course Preview */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-gray-700">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Students</p>
                    <p className="font-bold text-lg">{course.enrolled_count}+</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="font-bold text-lg">{course.duration || 10}h</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Level</p>
                    <p className="font-bold text-lg">{levelMap[course.difficulty_level] || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Updated</p>
                    <p className="font-bold text-lg text-sm">{formattedDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Sidebar */}
            <div>
              <div className="bg-white text-gray-900 rounded-xl shadow-2xl p-8 sticky top-24">
                <div className="mb-8">
                  <div className="text-4xl font-bold text-blue-600 mb-2">৳{price}</div>
                  {course.discount_price && (
                    <div className="text-gray-500 line-through text-xl">৳{course.price}</div>
                  )}
                </div>

                <button
                  onClick={handleEnroll}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition mb-4 shadow-lg"
                >
                  {isEnrolled ? 'Go to Course' : price === 0 ? 'Enroll Free' : 'Enroll Now'}
                </button>

                <div className="space-y-4 text-sm mb-6 pb-6 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900">This course includes:</h3>

                  {course.course_type === 'recorded' ? (
                    <>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-blue-600 mr-3" />
                        <span>{course.duration || 10} hours of content</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
                        <span>{totalLessons} lessons</span>
                      </div>
                      {course.includes_lifetime_access && (
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                          <span>Lifetime access</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                        <span>Start Date: {course.start_date ? new Date(course.start_date).toLocaleDateString() : 'TBD'}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-blue-600 mr-3" />
                        <span>Duration: {course.duration || 'N/A'}</span>
                      </div>
                    </>
                  )}

                  {course.includes_resources && (
                    <div className="flex items-center">
                      <Download className="h-5 w-5 text-green-600 mr-3" />
                      <span>Downloadable resources</span>
                    </div>
                  )}

                  {course.includes_certificate && (
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-green-600 mr-3" />
                      <span>Certificate of completion</span>
                    </div>
                  )}

                  {course.includes_mobile_access && (
                    <div className="flex items-center">
                      <Smartphone className="h-5 w-5 text-green-600 mr-3" />
                      <span>Mobile access</span>
                    </div>
                  )}
                </div>

                {course.language && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="h-4 w-4 mr-2" />
                    <span>Language: {course.language}</span>
                  </div>
                )}
              </div>
            </div>
            {/* End Sticky Sidebar */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="border-b border-gray-200 mb-8 flex gap-2 overflow-x-auto sticky top-0 bg-gray-50 py-4">
              {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-2 font-semibold text-sm transition whitespace-nowrap rounded-t-lg ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'overview' && 'Overview'}
                  {tab === 'curriculum' && 'Curriculum'}
                  {tab === 'instructor' && 'Instructor'}
                  {tab === 'reviews' && `Reviews (${reviews.length})`}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow p-8">
                  <h2 className="text-2xl font-bold mb-4">About this course</h2>
                  <p className="text-gray-700 leading-relaxed mb-6">{course.full_description || course.short_description}</p>

                  <h3 className="text-xl font-bold mb-4 mt-8">What you'll learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.course_learning_outcomes?.map((outcome: any, index: number) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{outcome.outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {course.course_requirements?.length > 0 && (
                  <div className="bg-white rounded-xl shadow p-8">
                    <h3 className="text-xl font-bold mb-4">Requirements & Prerequisites</h3>
                    <ul className="space-y-3">
                      {course.course_requirements?.map((req: any, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{req.requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-blue-50 rounded-xl p-8 border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Who is this course for?</h3>
                  <p className="text-gray-700">{course.target_audience || 'This course is designed for professionals looking to advance their skills and knowledge in their field.'}</p>
                </div>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                {sections.length > 0 ? (
                  <div className="divide-y">
                    {sections.map((section: any) => (
                      <div key={section.id} className="p-8">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{section.title}</h3>
                        <p className="text-gray-600 text-sm mb-6">{section.description}</p>
                        <div className="space-y-3">
                          {section.course_lessons?.map((lesson: any) => (
                            <div key={lesson.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                              <span className="flex items-center text-gray-700 font-medium">
                                {!isEnrolled && <Lock className="h-4 w-4 mr-3 text-gray-400" />}
                                <BookOpen className="h-4 w-4 mr-3 text-blue-600" />
                                {lesson.title}
                              </span>
                              <span className="text-gray-500 text-sm">{lesson.duration || '15 min'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>Curriculum details available once enrolled</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'instructor' && (
              <div className="bg-white rounded-xl shadow p-8">
                {course.instructors ? (
                  <div>
                    <div className="flex items-start gap-6 mb-8 pb-8 border-b">
                      <img
                        src={course.instructors.photo || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'}
                        alt={course.instructors.name}
                        className="w-40 h-40 rounded-full object-cover"
                      />
                      <div>
                        <h2 className="text-3xl font-bold mb-2">{course.instructors.name}</h2>
                        <p className="text-blue-600 font-semibold mb-4">Expert Instructor</p>
                        <p className="text-gray-700 leading-relaxed text-lg">{course.instructors.bio}</p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-3">Credentials & Experience</h3>
                      <p className="text-gray-700">With extensive industry experience and a passion for education, {course.instructors.name} brings real-world expertise and practical knowledge to every lesson.</p>
                    </div>

                    {otherInstructorCourses > 0 && (
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-bold text-gray-900 mb-2">Other Courses by This Instructor</h3>
                        <p className="text-gray-600">This instructor has {otherInstructorCourses}+ more courses available</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <p>Instructor information coming soon</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white rounded-xl shadow p-8">
                {reviews.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-6 pb-6 border-b">
                      <h3 className="text-xl font-bold">Student Reviews</h3>
                      <select
                        value={reviewSort}
                        onChange={(e) => setReviewSort(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="recent">Most Recent</option>
                        <option value="highest">Highest Rated</option>
                        <option value="lowest">Lowest Rated</option>
                      </select>
                    </div>

                    <div className="space-y-6">
                      {sortedReviews.map((review) => (
                        <div key={review.id} className="pb-6 border-b last:border-b-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">{review.profiles?.full_name || 'Student'}</p>
                              <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700">{review.review}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>No reviews yet. Be the first to review this course!</p>
                  </div>
                )}
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