import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PaymentsInsert } from '../lib/database.types';

interface PaymentModalProps {
  course: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ course, onClose, onSuccess }: PaymentModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    billing_name: '',
    billing_email: user?.email || '',
    billing_phone: '',
    payment_method: 'bkash',
    payment_number: '',
    transaction_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const price = course.discount_price || course.price;

      const paymentData: PaymentsInsert = {
        user_id: user!.id,
        course_id: course.id,
        amount: price,
        payment_method: formData.payment_method as PaymentsInsert['payment_method'],
        payment_number: formData.payment_number,
        transaction_id: formData.transaction_id,
        billing_name: formData.billing_name,
        billing_email: formData.billing_email,
        billing_phone: formData.billing_phone,
        status: 'pending',
      };

      const { error: paymentError } = await supabase.from('payments').insert([paymentData]);

      if (paymentError) throw paymentError;

      alert('Payment submitted successfully! Admin will review your payment within 24 hours.');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Complete Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Course: {course.title}</h3>
            <p className="text-2xl font-bold text-blue-600">
              Amount: ৳{course.discount_price || course.price}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.billing_name}
                onChange={(e) => setFormData({ ...formData, billing_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.billing_email}
                onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.billing_phone}
                onChange={(e) => setFormData({ ...formData, billing_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="rocket">Rocket</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Payment Instructions:</strong>
              </p>
              <p className="text-sm text-yellow-800">
                Send ৳{course.discount_price || course.price} to{' '}
                <strong>01XXXXXXXXX</strong> using {formData.payment_method}, then enter your
                transaction details below.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Payment Number *
              </label>
              <input
                type="text"
                required
                placeholder="Number you used to send payment"
                value={formData.payment_number}
                onChange={(e) => setFormData({ ...formData, payment_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID *
              </label>
              <input
                type="text"
                required
                placeholder="Enter transaction/reference number"
                value={formData.transaction_id}
                onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}