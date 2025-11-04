import { X, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaymentSuccessModalProps {
  onClose: () => void;
}

export function PaymentSuccessModal({ onClose }: PaymentSuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-8 text-center">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex justify-center mb-6 -mt-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Submitted!</h2>
        
        <p className="text-gray-600 mb-6">
          Thank you for your payment submission. Your enrollment is currently pending review.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 flex items-start gap-3">
            <Clock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800 text-left">
                The admin will review your transaction and approve your enrollment within 24 hours.
            </p>
        </div>

        <Link
          to="/payment-history"
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-4"
        >
          <CreditCard className="h-5 w-5 mr-2" />
          Go to Payment History
        </Link>

        <button
          onClick={onClose}
          className="w-full text-gray-600 py-2 rounded-lg font-semibold hover:text-blue-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}