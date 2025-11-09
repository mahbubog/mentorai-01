import { useState } from 'react';
import { X, CheckCircle, XCircle, Loader2, AlertCircle, User, DollarSign, FileText, MessageSquare } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { PaymentsUpdate, EnrollmentsInsert, NotificationsInsert, PaymentRow, CoursesUpdate } from '../../../lib/database.types';

// Extend PaymentRow with course and profile details for display
interface PaymentWithDetails extends PaymentRow {
  courses: { title: string } | null;
  profiles: { full_name: string | null; phone: string | null } | null; // Removed email from here
}

interface PaymentDetailsModalProps {
  payment: PaymentWithDetails;
  onClose: () => void;
  onActionSuccess: () => void;
}

export function PaymentDetailsModal({ payment, onClose, onActionSuccess }: PaymentDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const statusClasses = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const handleApprovePayment = async () => {
    if (!confirm('Are you sure you want to approve this payment and enroll the user?')) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Update payment status to 'approved'
      const paymentUpdatePayload: PaymentsUpdate = {
        status: 'approved',
        approved_by: (await supabase.auth.getUser()).data.user?.id || null,
        approved_at: new Date().toISOString(),
        admin_notes: 'Payment approved by admin.',
        rejection_reason: null, // Clear any previous rejection reason
      };

      const { error: updatePaymentError } = await supabase
        .from('payments')
        .update<PaymentsUpdate>(paymentUpdatePayload)
        .eq('id', payment.id);

      if (updatePaymentError) throw updatePaymentError;

      // 2. Create enrollment record
      const enrollmentPayload: EnrollmentsInsert = {
        user_id: payment.user_id,
        course_id: payment.course_id,
        payment_id: payment.id,
        progress_percentage: 0,
      };

      const { error: createEnrollmentError } = await supabase
        .from('enrollments')
        .insert<EnrollmentsInsert[]>([enrollmentPayload]);

      if (createEnrollmentError) throw createEnrollmentError;

      // 3. Increment enrolled_count for the course
      const { data: courseData, error: fetchCourseError } = await supabase
        .from('courses')
        .select('enrolled_count')
        .eq('id', payment.course_id)
        .single();

      if (fetchCourseError) throw fetchCourseError;

      const newEnrolledCount = (courseData?.enrolled_count || 0) + 1;
      const { error: updateCourseCountError } = await supabase
        .from('courses')
        .update<CoursesUpdate>({ enrolled_count: newEnrolledCount })
        .eq('id', payment.course_id);

      if (updateCourseCountError) throw updateCourseCountError;

      // 4. Create notification for the user
      const notificationPayload: NotificationsInsert = {
        user_id: payment.user_id,
        title: 'Payment Approved!',
        message: `Your payment for "${payment.courses?.title || 'a course'}" has been approved. You can now access the course!`,
        type: 'payment',
        is_read: false,
      };

      const { error: createNotificationError } = await supabase
        .from('notifications')
        .insert<NotificationsInsert[]>([notificationPayload]);

      if (createNotificationError) console.error('Error creating notification:', createNotificationError); // Log but don't block

      alert('Payment approved and user enrolled successfully!');
      onActionSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error approving payment:', err);
      setError('Failed to approve payment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!confirm('Are you sure you want to reject this payment?')) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Update payment status to 'rejected'
      const paymentUpdatePayload: PaymentsUpdate = {
        status: 'rejected',
        approved_by: (await supabase.auth.getUser()).data.user?.id || null,
        approved_at: new Date().toISOString(),
        rejection_reason: rejectionReason || 'No reason provided by admin.',
        admin_notes: 'Payment rejected by admin.',
      };

      const { error: updatePaymentError } = await supabase
        .from('payments')
        .update<PaymentsUpdate>(paymentUpdatePayload)
        .eq('id', payment.id);

      if (updatePaymentError) throw updatePaymentError;

      // 2. Create notification for the user
      const notificationPayload: NotificationsInsert = {
        user_id: payment.user_id,
        title: 'Payment Rejected',
        message: `Your payment for "${payment.courses?.title || 'a course'}" was rejected. Reason: ${rejectionReason || 'Please contact support for more details.'}`,
        type: 'payment',
        is_read: false,
      };

      const { error: createNotificationError } = await supabase
        .from('notifications')
        .insert<NotificationsInsert[]>([notificationPayload]);

      if (createNotificationError) console.error('Error creating notification:', createNotificationError); // Log but don't block

      alert('Payment rejected successfully!');
      onActionSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error rejecting payment:', err);
      setError('Failed to reject payment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold flex items-center">
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            Payment Details
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Status and Summary */}
          <div className="flex justify-between items-center border-b pb-4">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${statusClasses[payment.status]}`}>
              {payment.status}
            </span>
            <p className="text-3xl font-bold text-blue-600">
              ৳{payment.amount}
            </p>
          </div>

          {/* User Information */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              User Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">User Name</p>
                <p className="font-medium text-gray-900">{payment.profiles?.full_name || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">User Email</p>
                <p className="font-medium text-gray-900">{payment.billing_email || 'N/A'}</p> {/* Changed to billing_email */}
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">User Phone</p>
                <p className="font-medium text-gray-900">{payment.profiles?.phone || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">Course Name</p>
                <p className="font-medium text-gray-900">{payment.courses?.title || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
              Transaction Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">Payment Date</p>
                <p className="font-medium text-gray-900">{new Date(payment.created_at).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">Payment Method</p>
                <p className="font-medium text-gray-900 capitalize">{payment.payment_method}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">Payment Number</p>
                <p className="font-medium text-gray-900">{payment.payment_number}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">Transaction ID</p>
                <p className="font-medium text-gray-900 break-all">{payment.transaction_id}</p>
              </div>
              {payment.payment_screenshot && (
                <div className="md:col-span-2 bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 mb-2">Payment Screenshot</p>
                  <a 
                    href={payment.payment_screenshot} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Uploaded Image
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Billing Information */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Billing Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{payment.billing_name}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{payment.billing_email}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{payment.billing_phone}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">Address</p>
                <p className="font-medium text-gray-900">
                  {payment.billing_address || 'N/A'}
                  {payment.billing_city && `, ${payment.billing_city}`}
                  {payment.billing_country && `, ${payment.billing_country}`}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Notes & Rejection Reason */}
          {(payment.status === 'rejected' || payment.rejection_reason || payment.admin_notes) && (
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
                Admin Review Details
              </h3>
              {payment.rejection_reason && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-gray-500">Rejection Reason</p>
                  <p className="font-medium text-red-800">{payment.rejection_reason}</p>
                </div>
              )}
              {payment.admin_notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500">Admin Notes</p>
                  <p className="font-medium text-gray-900">{payment.admin_notes}</p>
                </div>
              )}
              {payment.approved_by && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500">Reviewed By</p>
                  <p className="font-medium text-gray-900">{payment.approved_by}</p>
                </div>
              )}
              {payment.approved_at && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500">Reviewed At</p>
                  <p className="font-medium text-gray-900">{new Date(payment.approved_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {payment.status === 'pending' && (
            <div className="pt-4 border-t space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Admin Actions</h3>
              <div>
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter reason for rejection (e.g., invalid transaction ID, incorrect amount)"
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleApprovePayment}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Approve Payment
                    </>
                  )}
                </button>
                <button
                  onClick={handleRejectPayment}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 mr-2" />
                      Reject Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}