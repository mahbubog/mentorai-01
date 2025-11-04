import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/Header';

export function EmailVerificationPage() {
  const { user, isLoading, isVerified, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    if (!isLoading && isVerified) {
      // If user is verified, redirect them to the dashboard
      navigate('/dashboard', { replace: true });
    }
    // If user is not logged in, redirect to login page
    if (!isLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [isLoading, isVerified, user, navigate]);

  const handleResend = async () => {
    if (!user?.email) return;

    setResendLoading(true);
    setResendMessage('');
    setResendError('');

    try {
      await resendVerificationEmail(user.email);
      setResendMessage('Verification email sent! Check your inbox (and spam folder).');
    } catch (err: any) {
      setResendError(err.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  if (isLoading || isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <Mail className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Verify Your Email</h1>
          <p className="text-gray-600 mb-6">
            A verification link has been sent to 
            <span className="font-semibold text-gray-800 block mt-1">{user?.email}</span>.
            Please click the link to activate your account.
          </p>

          {resendError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-600 text-sm">{resendError}</p>
            </div>
          )}

          {resendMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-green-600 text-sm">{resendMessage}</p>
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-600 font-semibold hover:text-blue-700"
            >
              I verified my email, take me to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}