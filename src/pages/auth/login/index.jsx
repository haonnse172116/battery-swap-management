import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { PATHS } from "../../../constant/path/pathname";
import { useLoginMutation } from "../../../services/auth.service";
import { getDefaultPathByRole } from "../../../utils/role";

function Login() {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  
  const [form, setForm] = useState({ 
    email: "", 
    password: "" 
  });

  const { needsActivation, user, role, accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    // If fully authenticated (has accessToken and user)
    if (accessToken && user && user.status === 'Active') {
      const defaultPath = getDefaultPathByRole(user.role || role); // Fallback to role
      navigate(defaultPath, { replace: true });
      return;
    }
    // If needs activation (from current login attempt)
    if (needsActivation) {
      navigate(PATHS.AUTH.VERIFY_OTP, { replace: true });
      return;
    }
  }, [accessToken, user, role, needsActivation, navigate]); // Keep role in deps

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(form).unwrap();
    } catch (error) {
      alert(error.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-blue-500 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70
        bg-[radial-gradient(800px_400px_at_15%_25%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(600px_300px_at_85%_75%,rgba(29,78,216,0.30),transparent_60%)]" />

      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-md mx-auto border border-blue-100">
        <h2 className="text-3xl font-extrabold text-blue-700 text-center mb-8 tracking-tight">
          Đăng nhập
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-blue-50/60 text-blue-900 placeholder:text-blue-300 transition"
              autoFocus
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
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-blue-50/60 text-blue-900 placeholder:text-blue-300 transition"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition text-lg disabled:opacity-50"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-blue-700/80">
          Chưa có tài khoản?{" "}
          <button
            className="underline hover:text-blue-900 font-medium"
            onClick={() => navigate(PATHS.AUTH.REGISTER)}
            type="button"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
