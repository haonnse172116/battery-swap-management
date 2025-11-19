import React, { useState } from 'react';
import Income from './components/Income';
import UsersBookings from './components/UsersBookings';

export default function Dashboard() {
  const [tab, setTab] = useState('income');
  
  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Thống kê hệ thống</h1>
      </header>
      
      <div className="mb-6">
        <div className="flex justify-evenly gap-8 border-b border-gray-200">
          <button 
            onClick={() => setTab('income')} 
            className={`
              px-4 py-3 text-sm sm:text-base font-medium transition-all duration-200
              border-b-2 -mb-[1px]
              ${tab === 'income' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:rounded-t-lg hover:bg-blue-50'
              }
            `}
          >
            Số liệu bán hàng
          </button>
          
          <button 
            onClick={() => setTab('users')} 
            className={`
              px-4 py-3 text-sm sm:text-base font-medium transition-all duration-200
              border-b-2 -mb-[1px]
              ${tab === 'users' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:rounded hover:bg-blue-50'
              }
            `}
          >
            Người dùng dịch vụ
          </button>
        </div>
      </div>
      
      <div>
        {tab === 'income' && <Income />}
        {tab === 'users' && <UsersBookings />}
      </div>
    </div>
  );
}