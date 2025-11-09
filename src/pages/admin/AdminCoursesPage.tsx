import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Pencil, Trash2, Eye, Search, ArrowUpNarrowWide, ArrowDownNarrowWide } from 'lucide-react';
import { CoursesUpdate, CourseRow, CourseCategoryRow } from '../../lib/database.types';

// Extend CourseRow to include instructor name and categories
interface CourseWithDetails extends CourseRow {
  instructors: { name: string } | null;
  course_categories_mapping: {
    course_categories: {
      id: string;
      name: string;
    };
  }[];
}

interface Category extends CourseCategoryRow {} // Use CourseCategoryRow from types

export function AdminCoursesPage() {
  const [allCourses, setAllCourses] = useState<CourseWithDetails[]>([]);
  const [filteredAndSortedCourses, setFilteredAndSortedCourses] = useState<CourseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filter and Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadCoursesAndCategories();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [allCourses, searchTerm, categoryFilter, typeFilter, statusFilter, sortKey, sortOrder]);

  const loadCoursesAndCategories = async () => {
    setLoading(true);
    try {
      // Fetch courses with instructor and category details
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          instructors (name),
          course_categories_mapping (
            course_categories (id, name)
          )
        `)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      setAllCourses(coursesData as CourseWithDetails[] || []);

      // Fetch all categories for the filter dropdown
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('course_categories')
        .select('id, name')
        .order('name', { ascending: true });

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let tempCourses = [...allCourses];

    // Apply Search
    if (searchTerm) {
      tempCourses = tempCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.short_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply Category Filter
    if (categoryFilter !== 'all') {
      tempCourses = tempCourses.filter(course =>
        course.course_categories_mapping.some(
          mapping => mapping.course_categories?.id === categoryFilter
        )
      );
    }

    // Apply Type Filter
    if (typeFilter !== 'all') {
      tempCourses = tempCourses.filter(course => course.course_type === typeFilter);
    }

    // Apply Status Filter
    if (statusFilter !== 'all') {
      tempCourses = tempCourses.filter(course => course.status === statusFilter);
    }

    // Apply Sort
    tempCourses.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortKey) {
        case 'title':
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
          break;
        case 'price':
          valA = a.discount_price ?? a.price;
          valB = b.discount_price ?? b.price;
          break;
        case 'enrolled_count':
          valA = a.enrolled_count;
          valB = b.enrolled_count;
          break;
        case 'created_at':
        default:
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
          break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredAndSortedCourses(tempCourses);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;

    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);

      if (error) throw error;

      alert('Course deleted successfully!');
      loadCoursesAndCategories(); // Reload all data
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const toggleStatus = async (id: string, currentStatus: CourseRow['status']) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    const updatePayload: CoursesUpdate = {
      status: newStatus,
    };

    try {
      const { error } = await supabase
        .from('courses')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;

      loadCoursesAndCategories(); // Reload all data
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <Link
            to="/admin/courses/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Add New Course
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
              >
                <option value="all">All Types</option>
                <option value="recorded">Recorded</option>
                <option value="live">Live</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
            >
              <option value="created_at">Date Created</option>
              <option value="title">Title</option>
              <option value="price">Price</option>
              <option value="enrolled_count">Enrolled Students</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            >
              {sortOrder === 'asc' ? (
                <ArrowUpNarrowWide className="h-5 w-5" />
              ) : (
                <ArrowDownNarrowWide className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrolled
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={course.thumbnail || 'https://via.placeholder.com/48'}
                            alt={course.title}
                            className="w-12 h-12 rounded object-cover mr-3"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{course.title}</p>
                            <p className="text-sm text-gray-500">
                              {course.instructors?.name || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {course.course_type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {course.course_categories_mapping
                          .map(mapping => mapping.course_categories?.name)
                          .filter(Boolean)
                          .join(', ') || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ৳{course.discount_price || course.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.enrolled_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleStatus(course.id, course.status)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            course.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {course.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-3">
                          <Link to={`/courses/${course.slug}`} target="_blank" className="text-blue-600 hover:text-blue-700" title="View Course">
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Link to={`/admin/courses/edit/${course.id}`} className="text-gray-600 hover:text-gray-700" title="Edit Course">
                            <Pencil className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete Course"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredAndSortedCourses.length === 0 && !loading && (
              <div className="p-12 text-center text-gray-500">No courses found matching your criteria.</div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}