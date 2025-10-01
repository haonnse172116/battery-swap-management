import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../constant/path/pathname";

function DriverHome() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-50 to-blue-500 overflow-hidden px-4">
      {/* Accent background */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70
        bg-[radial-gradient(800px_400px_at_15%_25%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(600px_300px_at_85%_75%,rgba(29,78,216,0.30),transparent_60%)]" />

      <img
        src="/battery-pack-default.png"
        alt="Battery Icon"
        className="w-20 mb-4 mt-12"
      />
      <h1 className="text-4xl font-extrabold text-blue-700 text-center mb-4 drop-shadow">
        Chào mừng tài xế!
      </h1>
      <p className="text-lg text-blue-900 text-center mb-6 max-w-xl drop-shadow">
        Dịch vụ đổi pin điện VinFast giúp bạn di chuyển liên tục, không lo hết pin, không cần chờ sạc.  
        <br />
        <span className="text-blue-600 font-semibold">Nhanh chóng - Tiện lợi - Xanh sạch</span>
      </p>
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-xl justify-center mb-8">
        <button
          className="flex-1 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition"
          onClick={() => navigate(PATHS.DRIVER.BOOKING)}
        >
          Đặt lịch đổi pin
        </button>
        <button
          className="flex-1 px-6 py-3 rounded-full bg-white text-blue-700 font-semibold shadow border border-blue-200 hover:bg-blue-50 transition"
          onClick={() => navigate(PATHS.DRIVER.MYCAR)}
        >
          Quản lý xe của tôi
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl mt-4 mb-12">
        <div className="bg-blue-50/60 rounded-xl p-4 shadow flex flex-col items-center">
          <img src="https://cdn-icons-png.flaticon.com/512/483/483947.png" alt="Nhanh" className="w-10 mb-2" />
          <span className="font-bold text-blue-700">Đổi pin nhanh</span>
          <span className="text-sm text-gray-600 text-center">Chỉ mất vài phút, không cần chờ sạc.</span>
        </div>
        <div className="bg-blue-50/60 rounded-xl p-4 shadow flex flex-col items-center">
          <img src="https://cdn-icons-png.flaticon.com/512/1006/1006363.png" alt="Tiện" className="w-10 mb-2" />
          <span className="font-bold text-blue-700">Trạm phủ rộng</span>
          <span className="text-sm text-gray-600 text-center">Dễ dàng tìm trạm đổi pin gần bạn.</span>
        </div>
        <div className="bg-blue-50/60 rounded-xl p-4 shadow flex flex-col items-center">
          <img src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png" alt="Xanh" className="w-10 mb-2" />
          <span className="font-bold text-blue-700">Thân thiện môi trường</span>
          <span className="text-sm text-gray-600 text-center">Giảm khí thải, bảo vệ môi trường.</span>
        </div>
      </div>
    </div>
  );
}

export default DriverHome;