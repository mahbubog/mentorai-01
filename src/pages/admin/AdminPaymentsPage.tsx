import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { PaymentsUpdate, EnrollmentsInsert, NotificationsInsert } from '../../lib/database.types'; // Removed unused Database

export function AdminPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [filter, setFilter] = useState('pending');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const loadPayments = async () => {
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          courses (title),
          profiles:user_id (full_name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data } = await query;
      setPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: string, courseId: string, userId: string) => {
    if (!confirm('Are you sure you want to approve this payment?')) return;

    try {
      const paymentUpdate: PaymentsUpdate = {
        status: 'approved',
        approved_by: user!.id,
        approved_at: new Date().toISOString(),
      };

      const { error: paymentError } = await supabase
        .from('payments')
        .update(paymentUpdate) // Use specific Update type
        .eq('id', paymentId);

      if (paymentError) throw paymentError;

      const enrollmentData: EnrollmentsInsert = {
        user_id: userId,
        course_id: courseId,
        payment_id: paymentId,
      };

      const { error: enrollmentError } = await supabase.from('enrollments').insert(enrollmentData); // Use specific Insert type

      if (enrollmentError) throw enrollmentError;

      const notificationData: NotificationsInsert = {
        user_id: userId,
        title: 'Payment Approved',
        message: 'Your payment has been approved. You can now access the course.',
        type: 'payment',
      };

      await supabase.from('notifications').insert(notificationData); // Use specific Insert type

      alert('Payment approved successfully!');
      loadPayments();
      setSelectedPayment(null);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleReject = async (paymentId: string, userId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const paymentUpdate: PaymentsUpdate = {
        status: 'rejected',
        rejection_reason: reason,
      };

      const { error } = await supabase
        .from('payments')
        .update(paymentUpdate) // Use specific Update type
        .eq('id', paymentId);

      if (error) throw error;

      const notificationData: NotificationsInsert = {
        user_id: userId,
        title: 'Payment Rejected',
        message: `Your payment was rejected. Reason: ${reason}`,
        type: 'payment',
      };

      await supabase.from('notifications').insert(notificationData); // Use specific Insert type

      alert('Payment rejected successfully!');
      loadPayments();
      setSelectedPayment(null);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment Management</h1>

        <div className="mb-6 flex space-x-2">
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Method
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
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {payment.profiles?.full_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {payment.courses?.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ৳{payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {payment.payment_method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {payment.status === 'pending' && (
                            <>
                              <button
                                onClick={() =>
                                  handleApprove(payment.id, payment.course_id, payment.user_id)
                                }
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleReject(payment.id, payment.user_id)}
                                className="text-red-600 hover:text-red-700"
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
          </div>
        )}

        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold">Payment Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <p className="mt-1 text-gray-900">{selectedPayment.profiles?.full_name}</p>
                  <p className="text-sm text-gray-500">{selectedPayment.profiles?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course</label>
                  <p className="mt-1 text-gray-900">{selectedPayment.courses?.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="mt-1 text-gray-900 font-semibold">৳{selectedPayment.amount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <p className="mt-1 text-gray-900 capitalize">{selectedPayment.payment_method}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Number</label>
                  <p className="mt-1 text-gray-900">{selectedPayment.payment_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="mt-1 text-gray-900">{selectedPayment.transaction_id}</p>
                </div>
                {selectedPayment.rejection_reason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Rejection Reason
                    </label>
                    <p className="mt-1 text-red-600">{selectedPayment.rejection_reason}</p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}