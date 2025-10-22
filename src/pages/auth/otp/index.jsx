import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PATHS } from '../../../constant/path/pathname';
import { useVerifyOtpMutation, useResendOtpMutation } from '../../../services/auth.service';
import { getDefaultPathByRole } from '../../../utils/role';

function VerifyOtp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  
  const { tempToken, tempEmail, needsActivation, role, accessToken, user } = useSelector((state) => state.auth);

  // Redirect if already active
  useEffect(() => {
    if (accessToken && user && user.status === 'Active' && !needsActivation) {
      const defaultPath = getDefaultPathByRole(role);
      navigate(defaultPath, { replace: true });
      return;
    }

    if (!tempToken && !needsActivation) {
      navigate(PATHS.AUTH.LOGIN, { replace: true });
    }
  }, [tempToken, needsActivation, accessToken, user, role, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      alert('Vui lòng nhập đủ 6 số OTP');
      return;
    }

    try {
      const result = await verifyOtp({ otp, token: tempToken }).unwrap();
      alert('Xác thực thành công!');
    const userRole = result.content?.role;
    const defaultPath = getDefaultPathByRole(userRole);
    navigate(defaultPath, { replace: true });
    } catch (error) {
      alert(error.data?.message || 'OTP không hợp lệ');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await resendOtp(tempToken).unwrap();
      alert('OTP mới đã được gửi');
      setCountdown(60);
      setCanResend(false);
      setOtp('');
    } catch (error) {
      alert(error.data?.message || 'Không thể gửi lại OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-700 text-center mb-2">
          Xác thực OTP
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Mã OTP đã được gửi đến: <br />
          <span className="font-semibold">{tempEmail}</span>
        </p>

        {needsActivation && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Tài khoản chưa được kích hoạt. Vui lòng nhập OTP.
            </p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhập mã OTP (6 số)
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 text-center text-2xl font-mono border rounded-lg focus:ring-2 focus:ring-blue-500 tracking-widest"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying || otp.length !== 6}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50"
          >
            {isVerifying ? 'Đang xác thực...' : 'Xác nhận'}
          </button>
        </form>

        <div className="mt-6 text-center">
          {!canResend ? (
            <p className="text-sm text-gray-600">
              Gửi lại sau <span className="font-semibold text-blue-600">{countdown}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              {isResending ? 'Đang gửi...' : 'Gửi lại OTP'}
            </button>
          )}
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate(PATHS.AUTH.LOGIN)}
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;