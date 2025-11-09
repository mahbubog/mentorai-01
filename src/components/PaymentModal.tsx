import { useState, useEffect } from 'react';
import { X, Upload, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PaymentsInsert, ProfileRow } from '../lib/database.types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface PaymentModalProps {
  course: any;
  onClose: () => void;
  onPaymentSubmitted: () => void; // New prop for handling submission success
}

const PAYMENT_ACCOUNTS: Record<string, string> = {
  bkash: '01712-345678 (Personal)',
  nagad: '01812-345678 (Merchant)',
  rocket: '01912-345678 (Agent)',
  bank_transfer: 'Bank ABC, A/C: 1234567890',
  other: 'Contact support for details',
};

export function PaymentModal({ course, onClose, onPaymentSubmitted }: PaymentModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());

  const [formData, setFormData] = useState({
    billing_name: '',
    billing_email: user?.email || '',
    billing_phone: '',
    billing_address: '',
    billing_city: '',
    billing_country: '',
    payment_method: 'bkash',
    payment_number: '',
    transaction_id: '',
  });

  const price = course.discount_price || course.price;

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        const profileData = data as ProfileRow;
        setFormData((prev) => ({
          ...prev,
          billing_name: profileData.full_name || '',
          billing_phone: profileData.phone || '',
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Screenshot must be less than 5MB');
        setPaymentScreenshot(null);
        return;
      }
      setPaymentScreenshot(file);
      setError('');
    }
  };

  // Renamed from uploadScreenshot to uploadPhoto to match usage (Error 2 & 3 fix)
  const uploadPhoto = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}/${course.id}/${Date.now()}.${fileExt}`;
    const filePath = `payment_screenshots/${fileName}`;

    const { error } = await supabase.storage
      .from('course_assets')
      .upload(filePath, file);

    if (error) throw new Error('Failed to upload screenshot: ' + error.message);

    const { data: publicUrlData } = supabase.storage
      .from('course_assets')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const isFormValid =
    formData.billing_name &&
    formData.billing_email &&
    formData.billing_phone &&
    formData.payment_number &&
    formData.transaction_id &&
    paymentDate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    let screenshotUrl: string | null = null;

    try {
      if (paymentScreenshot) {
        screenshotUrl = await uploadPhoto(paymentScreenshot);
      }

      const paymentData: PaymentsInsert = {
        user_id: user!.id,
        course_id: course.id,
        amount: price,
        payment_method: formData.payment_method as PaymentsInsert['payment_method'],
        payment_number: formData.payment_number,
        transaction_id: formData.transaction_id,
        payment_screenshot: screenshotUrl,
        billing_name: formData.billing_name,
        billing_email: formData.billing_email,
        billing_phone: formData.billing_phone,
        billing_address: formData.billing_address || null,
        billing_city: formData.billing_city || null,
        billing_country: formData.billing_country || null,
        status: 'pending',
        created_at: paymentDate.toISOString(), // Use payment date as created_at for accurate history
      };

      // Fix Error 2: Explicitly cast insert payload
      const { error: paymentError } = await supabase.from('payments').insert([paymentData]);

      if (paymentError) throw paymentError;

      // Success: Close payment modal and trigger success handler in parent
      onPaymentSubmitted();
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold">Complete Enrollment & Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Course Summary Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
              Course Summary
            </h3>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Course:</strong> {course.title}
              </p>
              <p>
                <strong>Type:</strong>{' '}
                <span className="capitalize">{course.course_type}</span>
              </p>
              <p>
                <strong>Original Price:</strong> ৳{course.price}
              </p>
              {course.discount_price && (
                <p className="text-green-600">
                  <strong>Discount:</strong> ৳{course.price - course.discount_price}
                </p>
              )}
              <p className="text-2xl font-bold text-blue-600 pt-2">
                Final Amount: ৳{price}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Billing Information Section */}
            <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">Billing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    disabled
                    value={formData.billing_email}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
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
                    Billing Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.billing_address}
                    onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.billing_city}
                    onChange={(e) => setFormData({ ...formData, billing_city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.billing_country}
                    onChange={(e) => setFormData({ ...formData, billing_country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Payment Information Section */}
            <div className="space-y-4 border p-4 rounded-lg bg-white shadow">
              <h3 className="text-xl font-bold text-gray-900">Payment Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentsInsert['payment_method'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
                >
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="rocket">Rocket</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other Mobile Banking</option>
                </select>
              </div>

              {/* Instructions Section */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 mb-2 font-semibold">
                  Payment Instructions:
                </p>
                <p className="text-sm text-yellow-800">
                  Please send ৳{price} to the following account, then fill in the transaction details below:
                </p>
                <p className="text-lg font-bold text-yellow-900 mt-2">
                  {PAYMENT_ACCOUNTS[formData.payment_method]}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Payment Date & Time *
                  </label>
                  <DatePicker
                    selected={paymentDate}
                    onChange={(date: Date | null) => date && setPaymentDate(date)}
                    showTimeSelect
                    dateFormat="Pp"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Screenshot (Optional)
                  </label>
                  <input
                    id="paymentScreenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="paymentScreenshot"
                    className={`cursor-pointer flex items-center justify-center w-full px-4 py-2 border-2 border-dashed rounded-lg transition ${
                      paymentScreenshot
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-gray-50 hover:border-blue-500'
                    }`}
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    <span className="font-medium">
                      {paymentScreenshot ? paymentScreenshot.name : 'Upload Screenshot (Max 5MB)'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !isFormValid}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting Payment...' : 'Submit Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}