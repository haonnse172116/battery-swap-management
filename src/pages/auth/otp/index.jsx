import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PATHS } from '../../../constant/path/pathname';
import { useVerifyOtpMutation, useResendOtpMutation } from '../../../services/auth.service';
import { getDefaultPathByRole } from '../../../utils/role';
import { logout } from '../../../redux/slices/authSlice'; // ✅ Add this import
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ArrowLeftIcon,
  ShieldCheckIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import toast from '../../../utils/toast';

function VerifyOtp() {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // ✅ Add dispatch
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  
  const { tempToken, tempEmail, needsActivation, role, accessToken, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // If already authenticated and active, redirect to dashboard
    if (accessToken && user && user.status === 'Active') {
      const defaultPath = getDefaultPathByRole(user.role || role);
      navigate(defaultPath, { replace: true });
      return;
    }

    // If no temp token (not from register/login), redirect to login
    if (!tempToken && !accessToken) {
      navigate(PATHS.AUTH.LOGIN, { replace: true });
      return;
    }
  }, [tempToken, accessToken, user?.status, needsActivation, user, role, navigate]); // ✅ Reduced dependencies

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);
  };

  const handleVerify = async (e) => {
    e.preventDefault();  
    const otpString = otp.join('');
    if (!otpString || otpString.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 số OTP');
      return;
    }
    try {
      await verifyOtp({ otp: otpString, token: tempToken }).unwrap();
      toast.success('✅ Xác thực thành công!');           
    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      toast.error('❌ ' + (error.data?.errorMessage || error.data?.content || 'OTP không hợp lệ'));
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await resendOtp().unwrap();
      toast.success('📧 OTP mới đã được gửi!');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      toast.error((error.data?.errorMessage || 'Không thể gửi lại OTP'));
    }
  };

  const handleBackToLogin = () => {
    dispatch(logout()); 
    navigate(PATHS.AUTH.LOGIN, { replace: true });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-blue-500 overflow-hidden">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70
        bg-[radial-gradient(800px_400px_at_15%_25%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(600px_300px_at_85%_75%,rgba(29,78,216,0.30),transparent_60%)]" />

      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-md mx-auto border border-blue-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-blue-700 mb-2 tracking-tight">
            Xác thực OTP
          </h2>
          <p className="text-gray-600 text-sm">
            Mã OTP đã được gửi đến email của bạn
          </p>
        </div>

        {/* Email display */}
        {tempEmail && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <EnvelopeIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Email đã gửi</p>
                <p className="text-blue-800 font-semibold truncate max-w-[200px]">
                  {tempEmail}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning for inactive account */}
        {needsActivation && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <ClockIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Tài khoản chưa được kích hoạt
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Vui lòng nhập mã OTP để kích hoạt tài khoản
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-3 text-center">
              Nhập mã OTP (6 số)
            </label>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-blue-200 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/60
                    transition-all duration-200"
                  maxLength={1}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isVerifying || otp.join('').length !== 6}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold 
              rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 
              disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                <span>Xác nhận</span>
              </>
            )}
          </button>
        </form>

        {/* Resend Section */}
        <div className="mt-6 text-center">
          {!canResend ? (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span>
                Gửi lại sau <span className="font-semibold text-blue-600">{formatTime(countdown)}</span>
              </span>
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium 
                underline disabled:opacity-50 transition-colors"
            >
              {isResending ? 'Đang gửi...' : '📧 Gửi lại OTP'}
            </button>
          )}
        </div>

        {/* Back Button - ✅ Fixed */}
        <div className="mt-6 text-center">
          <button
            onClick={handleBackToLogin}
            type="button"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 
              font-medium transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Quay lại đăng nhập</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;