import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { Search, Filter, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { CourseRow } from '../../lib/database.types';

interface Course extends CourseRow {
  // Inherits all fields from CourseRow
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const PAGE_SIZE = 9;

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]); // Store unfiltered/unsorted data for client-side filtering
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all'); // 'all', 'free', 'paid'
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000); // Max price assumption

  // Sorting & Pagination
  const [sortOption, setSortOption] = useState<string>('newest');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [page, setPage] = useState(1);

  // Fetching courses based on sorting (server-side)
  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('courses')
        .select('*')
        .eq('status', 'published');

      // Apply sorting
      if (sortOption === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortOption === 'price_low') {
        query = query.order('price', { ascending: true });
      } else if (sortOption === 'price_high') {
        query = query.order('price', { ascending: false });
      } else if (sortOption === 'popular') {
        query = query.order('enrolled_count', { ascending: false });
      } else if (sortOption === 'rated') {
        query = query.order('rating', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setAllCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  }, [sortOption]);

  // Fetch categories once
  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase.from('course_categories').select('id, name, slug').order('display_order');
      setCategories(data || []);
    };
    loadCategories();
  }, []);

  // Load courses whenever sort option changes
  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Client-side filtering and pagination
  useEffect(() => {
    const filtered = allCourses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.short_description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || course.course_type === typeFilter;
      const matchesLevel = levelFilter === 'all' || course.difficulty_level === levelFilter;
      
      const effectivePrice = course.discount_price !== null ? course.discount_price : course.price;
      
      // Price Category Filter (Free/Paid)
      const isFree = effectivePrice === 0;
      const matchesCategory = categoryFilter === 'all' ||
        (categoryFilter === 'free' && isFree) ||
        (categoryFilter === 'paid' && !isFree);

      // Price Range Filter
      const matchesPriceRange = effectivePrice >= minPrice && effectivePrice <= maxPrice;

      // Rating Filter
      const matchesRating = course.rating >= ratingFilter;

      return matchesSearch && matchesType && matchesLevel && matchesCategory && matchesPriceRange && matchesRating;
    });

    // Apply pagination
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setCourses(filtered.slice(start, end));
  }, [allCourses, searchTerm, typeFilter, levelFilter, categoryFilter, minPrice, maxPrice, ratingFilter, page]);

  const totalFilteredCourses = allCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.short_description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || course.course_type === typeFilter;
    const matchesLevel = levelFilter === 'all' || course.difficulty_level === levelFilter;
    const effectivePrice = course.discount_price !== null ? course.discount_price : course.price;
    const isFree = effectivePrice === 0;
    const matchesCategory = categoryFilter === 'all' ||
      (categoryFilter === 'free' && isFree) ||
      (categoryFilter === 'paid' && !isFree);
    const matchesPriceRange = effectivePrice >= minPrice && effectivePrice <= maxPrice;
    const matchesRating = course.rating >= ratingFilter;
    return matchesSearch && matchesType && matchesLevel && matchesCategory && matchesPriceRange && matchesRating;
  }).length;

  const totalPages = Math.ceil(totalFilteredCourses / PAGE_SIZE);

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setLevelFilter('all');
    setCategoryFilter('all');
    setMinPrice(0);
    setMaxPrice(1000);
    setRatingFilter(0);
    setSortOption('newest');
    setPage(1);
  };

  const renderRatingStars = (minRating: number) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= minRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
      {minRating > 0 && <span className="ml-2 text-sm text-gray-600">({minRating}+)</span>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">All Courses</h1>
          <p className="text-xl text-blue-100">Explore our complete course catalog</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h3>

              <div className="space-y-6">
                {/* Course Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="recorded">Recorded</option>
                    <option value="live">Live</option>
                  </select>
                </div>

                {/* Price Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                {/* Price Range Slider (Simple) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price (৳{maxPrice})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>৳0</span>
                    <span>৳1000+</span>
                  </div>
                </div>

                {/* Difficulty Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={levelFilter}
                    onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={ratingFilter}
                    onChange={(e) => { setRatingFilter(Number(e.target.value)); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[0, 5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r === 0 ? 'Any Rating' : `${r} Stars & Up`}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleClearFilters}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              {/* Search Bar */}
              <div className="relative w-full sm:w-2/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sort Options */}
              <div className="w-full sm:w-1/3">
                <select
                  value={sortOption}
                  onChange={(e) => { setSortOption(e.target.value); setPage(1); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                  <option value="rated">Highest Rated</option>
                </select>
              </div>
            </div>

            <div className="mb-4 text-gray-600">
              Showing {totalFilteredCourses} course{totalFilteredCourses !== 1 ? 's' : ''} found
            </div>

            {loading && allCourses.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      to={`/courses/${course.slug}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={course.thumbnail || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg'}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute top-4 right-4">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {course.course_type === 'live' ? 'Live' : 'Recorded'}
                          </span>
                        </div>
                        <div className="absolute top-4 left-4">
                          <span className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
                            {course.difficulty_level}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2 min-h-[3rem]">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm min-h-[2.5rem]">
                          {course.short_description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-blue-600">
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
                            <span className="ml-1 text-gray-700 font-semibold text-sm">{course.rating || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {courses.length === 0 && totalFilteredCourses > 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No courses found on this page.</p>
                  </div>
                )}

                {totalFilteredCourses === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No courses found matching your criteria.</p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 mt-8">
                    <button
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-gray-700">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}