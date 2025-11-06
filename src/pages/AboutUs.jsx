import React from 'react';
import { 
  BoltIcon,
  UsersIcon,
  HeartIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const AboutUs = () => {
  const stats = [
    { icon: BoltIcon, number: '50+', label: 'Trạm đổi pin' },
    { icon: UsersIcon, number: '1000+', label: 'Người dùng' },
    { icon: HeartIcon, number: '24/7', label: 'Hỗ trợ' },
    { icon: ShieldCheckIcon, number: '100%', label: 'An toàn' }
  ];

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Về EV Battery Swap</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Hệ thống quản lý trạm đổi pin thông minh cho xe điện
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                <div className="text-2xl font-bold">{stat.number}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Giới thiệu dự án</h2>
                <p className="text-gray-600 mb-4">
                  EV Battery Swap là hệ thống quản lý trạm đổi pin được phát triển 
                  nhằm hỗ trợ việc vận hành và quản lý các trạm đổi pin xe điện một cách hiệu quả.
                </p>
                <p className="text-gray-600 mb-4">
                  Dự án cung cấp các tính năng quản lý người dùng, đặt lịch đổi pin, 
                  theo dõi trạng thái trạm và báo cáo thống kê.
                </p>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Tính năng chính</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Quản lý người dùng và phân quyền
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Đặt lịch và quản lý booking
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Theo dõi trạng thái trạm
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Báo cáo và thống kê
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Nhóm phát triển</h2>
            
          <div className="grid md:grid-cols-4 gap-6">
  {[
    { name: 'Nguyễn Nhật Hào', role: 'Team Leader' },
    { name: 'Lê Thị Bình Minh', role: 'Frontend Developer' },
    { name: 'Nguyễn Tuấn Kiệt', role: 'Backend Developer' },
    { name: 'Nguyễn Tấn Phát', role: 'Database Designer' }
  ].map((member, index) => (
    <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center">
      <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
        {member.name.charAt(0)}
      </div>
      <h3 className="font-bold text-gray-800 mb-1">{member.name}</h3>
      <p className="text-blue-600 text-sm">{member.role}</p>
    </div>
  ))}
</div>

          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">Liên hệ</h2>
          <p className="text-blue-100 mb-6">
            Dự án được phát triển trong khuôn khổ môn học Software Engineering
          </p>
          <div className="text-blue-200">
            <p>📧 haonguyen03.work@gmail.com</p>
            <p>📱 033 7248 801</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;