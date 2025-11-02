import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../constant/path/pathname";
import { useRegisterMutation } from "../../../services/auth.service";
import toast from '../../../utils/toast';

function Register() {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
     sessionStorage.setItem('tempPassword', form.password);    
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
      }).unwrap();

      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
      navigate(PATHS.AUTH.VERIFY_OTP);
    } catch (error) {
      sessionStorage.removeItem('tempPassword');
      toast.error((error.data?.errorMessage || 'Đăng ký thất bại'));
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-blue-500 overflow-hidden">
      {/* Accent background */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70
        bg-[radial-gradient(800px_400px_at_15%_25%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(600px_300px_at_85%_75%,rgba(29,78,216,0.30),transparent_60%)]" />

      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-md mx-auto border border-blue-100">
        <h2 className="text-3xl font-extrabold text-blue-700 text-center mb-8 tracking-tight">
          Đăng ký
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-blue-50/60"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-blue-50/60"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-blue-50/60"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-blue-50/60"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-blue-50/60"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition text-lg disabled:opacity-50"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-blue-700/80">
          Đã có tài khoản?{" "}
          <button
            className="underline hover:text-blue-900 font-medium"
            onClick={() => navigate(PATHS.AUTH.LOGIN)}
            type="button"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;