import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/Header';
import { supabase } from '../../integrations/supabase/client'; // Updated import path
import { BookOpen, Users, Award, Clock, Mail, Phone, MapPin, Star, User, GraduationCap, CheckCircle, Zap, Target, Trophy } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  thumbnail: string;
  course_type: string;
  price: number;
  discount_price: number | null;
  rating: number;
  enrolled_count: number;
  instructor_name: string;
  duration_hours: number;
}

export function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedCourses();
  }, []);

  const loadFeaturedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .eq('is_featured', true)
        .limit(6);

      if (error) throw error;
      setFeaturedCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg')] opacity-10 bg-cover bg-center"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transform Your Future with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
                Expert-Led Learning
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Master in-demand skills with live and recorded courses taught by industry professionals. Start your learning journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/courses"
                className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Browse Courses
              </Link>
              <Link
                to="/register"
                className="inline-block bg-blue-500 bg-opacity-20 backdrop-blur-sm border-2 border-white text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-opacity-30 transition"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, title: '50+', description: 'Expert Courses', value: '50+' },
              { icon: Users, title: '1000+', description: 'Happy Students', value: '1000+' },
              { icon: Trophy, title: '95%', description: 'Success Rate', value: '95%' },
              { icon: Clock, title: 'Lifetime', description: 'Course Access', value: 'Lifetime' },
            ].map((stat, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition text-center border border-blue-100">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-600 p-3 rounded-full text-white">
                    <stat.icon className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</h3>
                <p className="text-gray-600 font-medium">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Courses
            </h2>
            <p className="text-xl text-gray-600">
              Start learning with our most popular courses
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={course.thumbnail || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg'}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                        {course.course_type === 'live' ? 'Live' : 'Recorded'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition line-clamp-2 min-h-[3.5rem]">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed min-h-[2.5rem]">
                      {course.short_description}
                    </p>

                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center text-gray-600 text-sm">
                        <User className="h-4 w-4 mr-1" />
                        <span className="font-medium">{course.instructor_name || 'Expert Instructor'}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{course.duration_hours || 10}h</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-blue-600">
                          ৳{course.discount_price || course.price}
                        </span>
                        {course.discount_price && (
                          <span className="text-gray-400 line-through text-sm">
                            ৳{course.price}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 text-gray-700 font-semibold text-sm">{course.rating || 4.5}</span>
                      </div>
                    </div>

                    <Link
                      to={`/courses/${course.slug}`}
                      className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/courses"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose CourseHub?
            </h2>
            <div className="w-24 h-1 bg-blue-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                title: 'Expert Instructors',
                description: 'Learn from industry professionals with years of real-world experience'
              },
              {
                icon: Award,
                title: 'Certificates of Completion',
                description: 'Earn recognized certificates to boost your professional profile'
              },
              {
                icon: Clock,
                title: 'Lifetime Access',
                description: 'Access your courses anytime, anywhere, at your own pace'
              },
              {
                icon: Zap,
                title: 'Interactive Learning',
                description: 'Engage with live sessions, quizzes, and hands-on projects'
              },
              {
                icon: Target,
                title: 'Career Focused',
                description: 'Courses designed to help you advance in your chosen field'
              },
              {
                icon: Users,
                title: 'Community Support',
                description: 'Join thousands of learners and get peer support'
              },
            ].map((item, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-xl border border-white border-opacity-20 hover:bg-opacity-20 transition">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <item.icon className="h-10 w-10 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-blue-100">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Ahmed',
                role: 'UI/UX Designer',
                image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg',
                rating: 5,
                comment: 'CourseHub transformed my career! The courses are well-structured and the instructors are incredibly supportive. Highly recommended!'
              },
              {
                name: 'Mohammad Hassan',
                role: 'Full Stack Developer',
                image: 'https://images.pexels.com/photos/1181605/pexels-photo-1181605.jpeg',
                rating: 5,
                comment: 'The hands-on projects and lifetime access make this platform exceptional. I got my dream job after completing the courses!'
              },
              {
                name: 'Fatima Khan',
                role: 'Data Analyst',
                image: 'https://images.pexels.com/photos/1181599/pexels-photo-1181599.jpeg',
                rating: 5,
                comment: 'Great courses with practical applications. The community support and mentorship made all the difference in my learning journey.'
              },
              {
                name: 'Ahmed Rahman',
                role: 'Business Manager',
                image: 'https://images.pexels.com/photos/1181581/pexels-photo-1181581.jpeg',
                rating: 5,
                comment: 'Affordable, high-quality education delivered by experts. I completed 3 courses and already seeing results in my career!'
              },
              {
                name: 'Nisha Patel',
                role: 'Software Engineer',
                image: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg',
                rating: 5,
                comment: 'The course materials are comprehensive and up-to-date. Instructors are responsive and genuinely care about student success.'
              },
              {
                name: 'Karim Islam',
                role: 'Graphic Designer',
                image: 'https://images.pexels.com/photos/1181566/pexels-photo-1181566.jpeg',
                rating: 5,
                comment: 'Best investment for my professional development. The certificate has already helped me land better projects!'
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-16 w-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 italic">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About Us
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg"
                alt="Learning"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Empowering Learners Worldwide
              </h3>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                CourseHub is a leading online learning platform dedicated to providing high-quality education to students around the globe. We believe that education should be accessible, engaging, and transformative.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Our expert instructors bring years of industry experience and are passionate about sharing their knowledge. Whether you're looking to advance your career, learn a new skill, or pursue a passion, we have the perfect course for you.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
                  <div className="text-gray-600">Expert Courses</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
                  <div className="text-gray-600">Happy Students</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-4"></div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600">info@coursehub.com</p>
              <p className="text-gray-600">support@coursehub.com</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600">+880 1234-567890</p>
              <p className="text-gray-600">Mon-Fri, 9AM-6PM</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600">123 Learning Street</p>
              <p className="text-gray-600">Dhaka, Bangladesh</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Start Learning?</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students already learning on CourseHub. Create your account today and get access to our entire course library.
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition shadow-lg"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">CourseHub</span>
              </div>
              <p className="text-gray-400">
                Empowering learners worldwide with quality education and expert-led courses.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition">Home</Link></li>
                <li><Link to="/courses" className="text-gray-400 hover:text-white transition">Courses</Link></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#contact" className="text-gray-400 hover:text-white transition">Contact</a></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition">Login</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li>info@coursehub.com</li>
                <li>+880 1234-567890</li>
                <li>Dhaka, Bangladesh</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">© 2024 CourseHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}