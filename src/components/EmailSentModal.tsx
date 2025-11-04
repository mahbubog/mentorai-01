import { Mail, X, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface EmailSentModalProps {
  email: string;
  onClose: () => void;
}

export function EmailSentModal({ email, onClose }: EmailSentModalProps) {
  const { resendVerificationEmail } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    setResendError('');

    try {
      await resendVerificationEmail(email);
      setResendMessage('Verification email sent again! Check your inbox (and spam folder).');
    } catch (err: any) {
      setResendError(err.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-8 text-center">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex justify-center mb-6 -mt-4">
          <Mail className="h-12 w-12 text-blue-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Email Sent</h2>
        
        <p className="text-gray-600 mb-6">
          A verification link has been sent to 
          <span className="font-semibold text-gray-800 block mt-1">{email}</span>.
          Please click the link to activate your account.
        </p>

        {resendError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-600 text-sm text-left">{resendError}</p>
          </div>
        )}

        {resendMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-green-600 text-sm text-left">{resendMessage}</p>
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={resendLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-4"
        >
          {resendLoading ? (
            <>
              <Loader className="h-5 w-5 mr-2 animate-spin" />
              Resending...
            </>
          ) : (
            'Resend Verification Email'
          )}
        </button>

        <button
          onClick={onClose}
          className="w-full text-gray-600 py-2 rounded-lg font-semibold hover:text-blue-700 transition"
        >
          Close and Go to Login
        </button>
      </div>
    </div>
  );
}