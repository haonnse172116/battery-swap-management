


import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Line
} from 'recharts';


// Mock data doanh thu theo chi nhánh
const revenueAreaData = [
  { name: '01/10', 'Trạm A': 500000, 'Trạm B': 400000, 'Trạm C': 300000 },
  { name: '02/10', 'Trạm A': 700000, 'Trạm B': 500000, 'Trạm C': 300000 },
  { name: '03/10', 'Trạm A': 600000, 'Trạm B': 300000, 'Trạm C': 200000 },
  { name: '04/10', 'Trạm A': 900000, 'Trạm B': 600000, 'Trạm C': 300000 },
  { name: '05/10', 'Trạm A': 800000, 'Trạm B': 600000, 'Trạm C': 300000 },
];

// Mock data đăng nhập và yêu cầu đổi pin
const comboData = [
  { name: '01/10', users: 30, requests: 20 },
  { name: '02/10', users: 45, requests: 35 },
  { name: '03/10', users: 28, requests: 25 },
  { name: '04/10', users: 50, requests: 40 },
  { name: '05/10', users: 40, requests: 38 },
];


const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Thống kê hệ thống</h1>

      {/* Biểu đồ doanh thu các trạm đổi pin theo chi nhánh */}
      <div className="bg-white rounded-lg shadow p-4 mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Doanh thu các trạm đổi pin theo chi nhánh (VNĐ)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={revenueAreaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ffc658" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={v => v.toLocaleString()} />
            <Legend />
            <Area type="monotone" dataKey="Trạm A" stackId="1" stroke="#8884d8" fillOpacity={1} fill="url(#colorA)" name="Trạm A" />
            <Area type="monotone" dataKey="Trạm B" stackId="1" stroke="#82ca9d" fillOpacity={1} fill="url(#colorB)" name="Trạm B" />
            <Area type="monotone" dataKey="Trạm C" stackId="1" stroke="#ffc658" fillOpacity={1} fill="url(#colorC)" name="Trạm C" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Biểu đồ kết hợp số lượng đăng nhập và yêu cầu đổi pin */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Số lượng người đăng nhập &amp; Yêu cầu đổi pin</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={comboData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="users" fill="#8884d8" name="Người đăng nhập" />
            <Line type="monotone" dataKey="requests" stroke="#ff8042" name="Yêu cầu đổi pin" strokeWidth={3} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;