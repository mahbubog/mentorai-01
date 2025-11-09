import { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, Eye, Clock, Search, Filter, Download, Calendar } from 'lucide-react';
import { PaymentsUpdate, EnrollmentsInsert, NotificationsInsert, PaymentRow, CourseRow, ProfileRow } from '../../lib/database.types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PaymentDetailsModal } from '../../components/admin/payments/PaymentDetailsModal';

// Extend PaymentRow with course and profile details for display
interface PaymentWithDetails extends PaymentRow {
  courses: { title: string } | null;
  profiles: { full_name: string | null; email: string; phone: string | null } | null;
}

interface CourseOption {
  id: string;
  title: string;
}

export function AdminPaymentsPage() {
  const { user } = useAuth();
  const [allPayments, setAllPayments] = useState<PaymentWithDetails[]>([]);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterCourseId, setFilterCourseId] = useState('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);

  useEffect(() => {
    loadPaymentsAndCourses();
  }, []);

  const loadPaymentsAndCourses = async () => {
    setLoading(true);
    try {
      // 1. Load all payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          courses (title),
          profiles:user_id (full_name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;
      setAllPayments(paymentsData as PaymentWithDetails[] || []);

      // 2. Load course options for filtering
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title')
        .eq('status', 'published');
      
      if (coursesError) throw coursesError;
      setCourseOptions(coursesData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    let tempPayments = allPayments;

    // Status Filter
    if (filterStatus !== 'all') {
      tempPayments = tempPayments.filter(p => p.status === filterStatus);
    }

    // Course Filter
    if (filterCourseId !== 'all') {
      tempPayments = tempPayments.filter(p => p.course_id === filterCourseId);
    }

    // Method Filter
    if (filterMethod !== 'all') {
      tempPayments = tempPayments.filter(p => p.payment_method === filterMethod);
    }

    // Search Filter (User Name, Email, Transaction ID)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      tempPayments = tempPayments.filter(p => 
        p.profiles?.full_name?.toLowerCase().includes(lowerSearch) ||
        p.profiles?.email?.toLowerCase().includes(lowerSearch) ||
        p.transaction_id.toLowerCase().includes(lowerSearch)
      );
    }

    // Date Range Filter (Submitted Date)
    if (startDate) {
      tempPayments = tempPayments.filter(p => new Date(p.created_at) >= startDate);
    }
    if (endDate) {
      // Filter up to the end of the selected day
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      tempPayments = tempPayments.filter(p => new Date(p.created_at) <= endOfDay);
    }

    return tempPayments;
  }, [allPayments, filterStatus, filterCourseId, filterMethod, searchTerm, startDate, endDate]);

  const getStatusBadge = (status: PaymentRow['status']) => {
    const statusClasses = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  const exportToCsv = (data: PaymentWithDetails[]) => {
    if (data.length === 0) {
      alert('No payments to export.');
      return;
    }

    const headers = [
      'Payment ID', 'User Name', 'User Email', 'User Phone', 'Course Title', 'Amount', 
      'Payment Method', 'Payment Number', 'Transaction ID', 'Payment Screenshot', 
      'Billing Name', 'Billing Email', 'Billing Phone', 'Billing Address', 'Billing City', 
      'Billing Country', 'Status', 'Rejection Reason', 'Admin Notes', 'Approved By', 
      'Approved At', 'Created At', 'Updated At'
    ];

    const rows = data.map(p => [
      `"${p.id}"`,
      `"${p.profiles?.full_name || 'N/A'}"`,
      `"${p.profiles?.email || 'N/A'}"`,
      `"${p.profiles?.phone || 'N/A'}"`,
      `"${p.courses?.title || 'N/A'}"`,
      p.amount,
      `"${p.payment_method}"`,
      `"${p.payment_number}"`,
      `"${p.transaction_id}"`,
      `"${p.payment_screenshot || 'N/A'}"`,
      `"${p.billing_name}"`,
      `"${p.billing_email}"`,
      `"${p.billing_phone}"`,
      `"${p.billing_address || 'N/A'}"`,
      `"${p.billing_city || 'N/A'}"`,
      `"${p.billing_country || 'N/A'}"`,
      `"${p.status}"`,
      `"${p.rejection_reason || 'N/A'}"`,
      `"${p.admin_notes || 'N/A'}"`,
      `"${p.approved_by || 'N/A'}"`,
      `"${p.approved_at ? new Date(p.approved_at).toLocaleString() : 'N/A'}"`,
      `"${new Date(p.created_at).toLocaleString()}"`,
      `"${new Date(p.updated_at).toLocaleString()}"`,
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `payments_${filterStatus}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handlers for table actions (just open the modal)
  const handleViewDetails = (payment: PaymentWithDetails) => {
    setSelectedPayment(payment);
  };
  
  const handleApprove = (payment: PaymentWithDetails) => {
    setSelectedPayment(payment);
  };

  const handleReject = (payment: PaymentWithDetails) => {
    setSelectedPayment(payment);
  };

  const paymentMethods = [
    { value: 'all', label: 'All Methods' },
    { value: 'bkash', label: 'bKash' },
    { value: 'nagad', label: 'Nagad' },
    { value: 'rocket', label: 'Rocket' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment Management</h1>

        {/* Filter Tabs */}
        <div className="mb-6 flex space-x-2 border-b border-gray-200 pb-4">
          {['pending', 'approved', 'rejected', 'all'].map((f) => {
            const count = allPayments.filter(p => f === 'all' ? true : p.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition flex items-center space-x-2 ${
                  filterStatus === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span>{f === 'all' ? 'All Payments' : f}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${filterStatus === f ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Top Actions: Search, Filters, Export */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center text-gray-900">
            <Filter className="h-5 w-5 mr-2" /> Advanced Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search user name, email, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
              >
                {paymentMethods.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterCourseId}
                onChange={(e) => setFilterCourseId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Courses</option>
                {courseOptions.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-gray-100 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submitted From</label>
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => setStartDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Select start date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submitted To</label>
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Select end date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                onClick={() => exportToCsv(filteredPayments)}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Export Payments
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        ) : filteredPayments.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User / Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Method / Txn ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Submitted Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <p className="font-medium">{payment.profiles?.full_name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{payment.profiles?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {payment.courses?.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ৳{payment.amount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <p className="capitalize">{payment.payment_method}</p>
                        <p className="text-xs text-gray-500 break-all">{payment.transaction_id}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(payment)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {payment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(payment)}
                                className="text-green-600 hover:text-green-700 p-1"
                                title="Approve"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleReject(payment)}
                                className="text-red-600 hover:text-red-700 p-1"
                                title="Reject"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredPayments.length === 0 && !loading && (
              <div className="p-12 text-center text-gray-500">No payments found matching your criteria.</div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No payments found.</p>
          </div>
        )}
      </div>

      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onActionSuccess={loadPaymentsAndCourses}
        />
      )}
    </AdminLayout>
  );
}