import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../constant/path/pathname";

// Mock function decode token
const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1])); // giả lập JWT decode
  } catch {
    return null;
  }
};

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // mock login logic
    if (form.username === "admin") {
      const token = btoa(JSON.stringify({ role: "admin" }));
      localStorage.setItem("accessToken", token);
      navigate(PATHS.ADMIN.DASHBOARD);
    } else if (form.username === "staff") {
      const token = btoa(JSON.stringify({ role: "staff" }));
      localStorage.setItem("accessToken", token);
      navigate(PATHS.STAFF.SWAP.HOME);
    } else if (form.username === "driver") {
      const token = btoa(JSON.stringify({ role: "driver" }));
      localStorage.setItem("accessToken", token);
      navigate(PATHS.DRIVER.HOME);
    } else {
      setError("Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-blue-500 overflow-hidden">
      {/* Accent background */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70
        bg-[radial-gradient(800px_400px_at_15%_25%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(600px_300px_at_85%_75%,rgba(29,78,216,0.30),transparent_60%)]" />

      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-md mx-auto border border-blue-100">
        <h2 className="text-3xl font-extrabold text-blue-700 text-center mb-8 tracking-tight">
          Đăng nhập
        </h2>
        {error && (
          <p className="mb-4 text-red-500 text-sm text-center">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              Tài khoản
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="admin / staff / customer"
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
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition text-lg"
          >
            Đăng nhập
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-blue-700/80">
          Chưa có tài khoản?{" "}
          <button
            className="underline hover:text-blue-900 font-medium"
            onClick={() => navigate("/register")}
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
