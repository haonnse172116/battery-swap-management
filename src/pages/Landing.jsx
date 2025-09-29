import { useEffect, useState } from "react";

function Landing() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  return (
    <div className="w-full flex flex-col">
      {/* Hero */}
      <section
        className="
          relative min-h-screen w-full overflow-hidden
          bg-gradient-to-br from-white via-blue-50 to-blue-500
        "
      >
        {/* accent nhẹ để nền “sống” hơn, không đụng content */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-70
          bg-[radial-gradient(800px_400px_at_15%_25%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(600px_300px_at_85%_75%,rgba(29,78,216,0.30),transparent_60%)]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
          <h1
            className={`text-5xl md:text-7xl font-extrabold leading-tight text-slate-900 transform transition-all duration-1000 ${
              animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-12"
            }`}
          >
            EV Battery Swap
          </h1>

          <p
            className={`mt-6 text-lg md:text-xl text-slate-700 max-w-2xl mx-auto transform transition-all duration-1000 delay-200 ${
              animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            Trạm đổi pin thông minh – nhanh chóng, tiện lợi, thân thiện với môi
            trường.
          </p>

          <div
            className={`mt-10 flex justify-center gap-6 transform transition-all duration-1000 delay-500 ${
              animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <button className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg transition">
              Đăng ký trải nghiệm
            </button>
            <button className="px-8 py-3 rounded-full bg-white text-slate-900 font-medium shadow hover:bg-gray-100 transition">
              Tìm hiểu thêm
            </button>
          </div>
        </div>

        {/* Images */}
        <img
          src="/vf8.png"
          alt="VinFast EV"
          className={`absolute bottom-0 right-[-50px] w-[600px] hidden md:block transform transition-all duration-1000 delay-700 z-20 ${
            animate ? "opacity-100 translate-x-0" : "opacity-0 translate-x-40"
          }`}
        />
        <img
          src="/battery-pack-default.png"
          alt="Battery Icon"
          className={`absolute top-1/4 left-[-80px] w-56 hidden md:block transform transition-all duration-1000 delay-1000 z-20 ${
            animate ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-40"
          }`}
        />
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Vì sao chọn Battery Swap?</h2>
          <div className="grid gap-10 md:grid-cols-3">
            <div className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg transition">
              <img
                src="https://cdn-icons-png.flaticon.com/512/483/483947.png"
                alt="Nhanh chóng"
                className="w-16 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Nhanh chóng</h3>
              <p className="text-gray-600">
                Đổi pin chỉ trong vài phút – không cần chờ sạc.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg transition">
              <img
                src="https://cdn-icons-png.flaticon.com/512/1006/1006363.png"
                alt="Tiện lợi"
                className="w-16 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Tiện lợi</h3>
              <p className="text-gray-600">
                Trạm phủ khắp thành phố – dễ dàng tiếp cận bất cứ lúc nào.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg transition">
              <img
                src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
                alt="Xanh sạch"
                className="w-16 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Xanh & Bền vững</h3>
              <p className="text-gray-600">
                Giảm khí thải, góp phần xây dựng môi trường xanh cho tương lai.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA cuối */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">Sẵn sàng cho trải nghiệm mới?</h2>
          <p className="mb-8 text-lg">
            Đăng ký ngay để là một trong những người đầu tiên trải nghiệm trạm
            đổi pin VinFast.
          </p>
          <button className="px-8 py-3 rounded-full bg-white text-blue-700 font-medium shadow hover:bg-gray-200 transition">
            Đăng ký ngay
          </button>
        </div>
      </section>
    </div>
  );
}

export default Landing;
