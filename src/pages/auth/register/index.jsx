import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    gmail: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const validateEmail = (email) => {
    // Simple Gmail validation
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(form.gmail)) {
      setError("Vui lòng nhập địa chỉ Gmail hợp lệ.");
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    // Mock register logic
    setSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
    setTimeout(() => navigate("/login"), 1500);
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
        {error && (
          <p className="mb-4 text-red-500 text-sm text-center">{error}</p>
        )}
        {success && (
          <p className="mb-4 text-green-600 text-sm text-center">{success}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              Gmail
            </label>
            <input
              type="email"
              name="gmail"
              value={form.gmail}
              onChange={handleChange}
              placeholder="yourname@gmail.com"
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-blue-50/60 text-blue-900 placeholder:text-blue-300 transition"
              autoFocus
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
              placeholder="Nhập lại mật khẩu"
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-blue-50/60 text-blue-900 placeholder:text-blue-300 transition"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition text-lg"
          >
            Đăng ký
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-blue-700/80">
          Đã có tài khoản?{" "}
          <button
            className="underline hover:text-blue-900 font-medium"
            onClick={() => navigate("/login")}
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