import { X, FileText, DollarSign, User, Download } from 'lucide-react';
import { PaymentRow } from '../lib/database.types';

interface PaymentReceiptModalProps {
  payment: PaymentRow & { courses: { title: string } | null };
  onClose: () => void;
}

export function PaymentReceiptModal({ payment, onClose }: PaymentReceiptModalProps) {
  const statusClasses = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const handleDownloadReceipt = () => {
    // Placeholder for PDF generation logic
    alert('Download Receipt functionality coming soon!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold flex items-center">
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            Payment Receipt
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Status and Summary */}
          <div className="flex justify-between items-center border-b pb-4">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${statusClasses[payment.status]}`}>
              {payment.status}
            </span>
            <p className="text-3xl font-bold text-blue-600">
              ৳{payment.amount}
            </p>
          </div>

          {/* Course Details */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
              Transaction Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">Course Name</p>
                <p className="font-medium text-gray-900">{payment.courses?.title || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">Payment Date</p>
                <p className="font-medium text-gray-900">{new Date(payment.created_at).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">Payment Method</p>
                <p className="font-medium text-gray-900 capitalize">{payment.payment_method}</p>
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

          {/* Action Button */}
          <div className="pt-4 border-t">
            <button
              onClick={handleDownloadReceipt}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Receipt (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}