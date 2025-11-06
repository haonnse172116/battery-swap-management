import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../constant/path/pathname";

function Landing() {
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const handleRegister = () => {
    navigate(PATHS.AUTH.REGISTER);
  };

  const handleLogin = () => {
    navigate(PATHS.AUTH.LOGIN);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Hero */}
      <section
        className="
          relative min-h-screen w-full overflow-hidden
          bg-gradient-to-br from-white via-blue-50 to-blue-500
        "
      >
        {/* Enhanced background effects */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-70
          bg-[radial-gradient(800px_400px_at_15%_25%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(600px_300px_at_85%_75%,rgba(29,78,216,0.30),transparent_60%)]" />
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
          <div className="flex flex-col items-center mb-4">
            <img 
              src="/ev_logo.png" 
              alt="EV Battery Swap Logo"
              className={`w-24 h-24 mb-4 drop-shadow-xl transform transition-all duration-1000 ${
                animate ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 rotate-12"
              }`}
            />
            <h1
              className={`text-5xl md:text-7xl font-extrabold leading-tight text-slate-900 transform transition-all duration-1000 delay-200 ${
                animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-12"
              }`}
            >
              EV Battery Swap
            </h1>
          </div>

          <p
            className={`mt-6 text-lg md:text-xl text-slate-700 max-w-2xl mx-auto transform transition-all duration-1000 delay-400 ${
              animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            Trạm đổi pin thông minh – nhanh chóng, tiện lợi, thân thiện với môi
            trường.
          </p>

          <div
            className={`mt-10 flex flex-col sm:flex-row justify-center gap-4 transform transition-all duration-1000 delay-600 ${
              animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <button
              onClick={handleRegister}
              className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg transition hover:scale-105 hover:shadow-xl"
            >
              Đăng ký ngay
            </button>
            <button
              onClick={handleLogin}
              className="px-8 py-3 rounded-full bg-white/90 backdrop-blur-sm text-slate-900 font-medium shadow-lg hover:bg-white hover:shadow-xl transition hover:scale-105"
            >
              Đăng nhập
            </button>
          </div>
        </div>

        {/* Enhanced Images with better positioning */}
        <img
          src="/vf8.png"
          alt="VinFast EV"
          className={`absolute bottom-0 right-[-50px] w-[550px] xl:w-[600px] hidden md:block transform transition-all duration-1200 delay-700 z-20 ${
            animate ? "opacity-100 translate-x-0" : "opacity-0 translate-x-40"
          }`}
        />
        <img
          src="/vf3.png"
          alt="VinFast EV"
          className={`absolute top-1/2 left-[-80px] w-[550px] xl:w-[600px] hidden md:block transform transition-all duration-1200 delay-1000 z-20 ${
            animate ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-40"
          }`}
        />
      </section>

      {/* ✅ Enhanced Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-4">
            <img src="/ev_logo.png" alt="" className="w-12 h-12 mx-auto opacity-60 mb-4" />
            <h2 className="text-4xl font-bold mb-4 text-slate-800">Vì sao chọn Battery Swap?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto mb-12">
              Trải nghiệm công nghệ đổi pin tiên tiến nhất Việt Nam
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Nhanh chóng</h3>
              <p className="text-slate-600 leading-relaxed">
                Đổi pin chỉ trong <strong>2-3 phút</strong> – nhanh hơn việc đổ xăng truyền thống
              </p>
            </div>
            
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Tiện lợi</h3>
              <p className="text-slate-600 leading-relaxed">
                Hệ thống trạm phủ khắp thành phố với <strong>GPS định vị</strong> chính xác
              </p>
            </div>
            
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Xanh & Bền vững</h3>
              <p className="text-slate-600 leading-relaxed">
                <strong>100% năng lượng sạch</strong>, giảm 90% khí thải so với xe xăng
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white text-center relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-10 left-10 opacity-10">
          <img src="/ev_logo.png" alt="" className="w-24 h-24 animate-pulse" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-10">
          <img src="/ev_logo.png" alt="" className="w-20 h-20 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl font-bold mb-6">Sẵn sàng cho tương lai xanh?</h2>
          <p className="mb-8 text-xl text-blue-100 leading-relaxed">
            Tham gia cộng đồng tiên phong sử dụng công nghệ đổi pin thông minh
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleRegister} 
              className="px-8 py-4 rounded-full bg-white text-blue-700 font-bold shadow-xl hover:bg-gray-100 transition hover:scale-105 text-lg"
            >
              🚀 Đăng ký miễn phí
            </button>
            <button 
              onClick={handleLogin}
              className="px-8 py-4 rounded-full border-2 border-white text-white font-bold hover:bg-white hover:text-blue-700 transition hover:scale-105 text-lg"
            >
              🔍 Tìm hiểu thêm
            </button>
          </div>
        </div>
      </section>

      {/* ✅ Enhanced Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div className="flex items-center gap-4 mb-8 md:mb-0">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <img
                  src="/ev_logo.png"
                  alt="EV Battery Swap Logo"
                  className="w-8 h-8 brightness-0 invert"
                />
              </div>
              <div>
                <h3 className="font-bold text-2xl">EV Battery Swap</h3>
                <p className="text-slate-400">Tương lai xanh, khởi đầu từ hôm nay</p>
              </div>
            </div>

            <div className="flex gap-8 text-sm">
              <a href="/about-us" className="text-slate-300 hover:text-white transition hover:underline">Về chúng tôi</a>
              <a href="#" className="text-slate-300 hover:text-white transition hover:underline">Hỗ trợ</a>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
            <p>&copy; 2025 EV Battery Swap. All rights reserved. Made for a greener future.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
