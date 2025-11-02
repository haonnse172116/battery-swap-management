import React, { useEffect, useState } from 'react';
import { 
  CreditCardIcon, 
  CheckCircleIcon, 
  ClockIcon,
  BoltIcon,
  StarIcon,
  FireIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import toast from '../../../utils/toast';

const SubscriptionPage = () => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setCurrentPlan({
            id: 2,
            name: 'Gói Cơ Bản',
            type: 'basic',
            price: 299000,
            duration: 30,
            swapsPerMonth: 15,
            startDate: '2024-10-15',
            endDate: '2024-11-15',
            remainingSwaps: 8,
            status: 'active'
          });

          setAvailablePlans([
            {
              id: 1,
              name: 'Gói Thử Nghiệm',
              type: 'trial',
              price: 0,
              duration: 7,
              swapsPerMonth: 3,
              features: [
                '3 lần thay pin miễn phí',
                'Hỗ trợ 24/7',
                'Thời gian chờ tối đa 15 phút'
              ],
              badge: 'Miễn phí',
              badgeColor: 'bg-green-100 text-green-800',
              popular: false
            },
            {
              id: 2,
              name: 'Gói Cơ Bản',
              type: 'basic',
              price: 299000,
              duration: 30,
              swapsPerMonth: 15,
              features: [
                '15 lần thay pin/tháng',
                'Hỗ trợ 24/7',
                'Thời gian chờ tối đa 10 phút',
                'Ưu tiên hỗ trợ'
              ],
              badge: 'Phổ biến',
              badgeColor: 'bg-blue-100 text-blue-800',
              popular: true
            },
            {
              id: 3,
              name: 'Gói Cao Cấp',
              type: 'premium',
              price: 599000,
              duration: 30,
              swapsPerMonth: 35,
              features: [
                '35 lần thay pin/tháng',
                'Hỗ trợ VIP 24/7',
                'Thời gian chờ tối đa 5 phút',
                'Ưu tiên cao nhất',
                'Thông báo trước khi hết pin'
              ],
              badge: 'Tốt nhất',
              badgeColor: 'bg-purple-100 text-purple-800',
              popular: false
            },
            {
              id: 4,
              name: 'Gói Doanh Nghiệp',
              type: 'business',
              price: 999000,
              duration: 30,
              swapsPerMonth: 60,
              features: [
                '60 lần thay pin/tháng',
                'Hỗ trợ doanh nghiệp 24/7',
                'Thời gian chờ tối đa 3 phút',
                'Ưu tiên tuyệt đối',
                'Báo cáo chi tiết',
                'API tích hợp'
              ],
              badge: 'Doanh nghiệp',
              badgeColor: 'bg-orange-100 text-orange-800',
              popular: false
            }
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        toast.error('❌ Không thể tải thông tin gói dịch vụ');
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const confirmUpgrade = async () => {
    try {
      // Simulate API call
      setIsLoading(true);
      setTimeout(() => {
        toast.success(`✅ Đã nâng cấp lên ${selectedPlan.name} thành công!`);
        setShowUpgradeModal(false);
        setSelectedPlan(null);
        setIsLoading(false);
        // Refresh data
      }, 2000);
    } catch (error) {
      toast.error('❌ Không thể nâng cấp gói dịch vụ');
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanIcon = (type) => {
    switch (type) {
      case 'trial': return <BoltIcon className="w-6 h-6" />;
      case 'basic': return <CheckCircleIcon className="w-6 h-6" />;
      case 'premium': return <StarIcon className="w-6 h-6" />;
      case 'business': return <FireIcon className="w-6 h-6" />;
      default: return <BoltIcon className="w-6 h-6" />;
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Đang tải thông tin gói dịch vụ...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gói dịch vụ thay pin</h1>
        <p className="text-gray-600">Quản lý gói dịch vụ và nâng cấp để có trải nghiệm tốt hơn</p>
      </div>

      {/* Current Plan */}
      {currentPlan && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Gói hiện tại</h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  {getPlanIcon(currentPlan.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{currentPlan.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIconSolid className="w-4 h-4 mr-1" />
                      Đang hoạt động
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Từ {formatDate(currentPlan.startDate)} đến {formatDate(currentPlan.endDate)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{formatPrice(currentPlan.price)}</div>
                <div className="text-sm text-gray-600">/{currentPlan.duration} ngày</div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <BoltIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Lần thay pin còn lại</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {currentPlan.remainingSwaps}/{currentPlan.swapsPerMonth}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(currentPlan.remainingSwaps / currentPlan.swapsPerMonth) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Thời gian còn lại</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.ceil((new Date(currentPlan.endDate) - new Date()) / (1000 * 60 * 60 * 24))} ngày
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Trạng thái</span>
                </div>
                <div className="text-lg font-semibold text-purple-600 capitalize">
                  {currentPlan.status === 'active' ? 'Hoạt động' : currentPlan.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Các gói dịch vụ có sẵn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {availablePlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl border-2 p-6 hover:shadow-lg transition-all duration-300 ${
                plan.popular 
                  ? 'border-blue-500 shadow-lg' 
                  : currentPlan?.id === plan.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Được đề xuất
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  plan.type === 'trial' ? 'bg-green-100 text-green-600' :
                  plan.type === 'basic' ? 'bg-blue-100 text-blue-600' :
                  plan.type === 'premium' ? 'bg-purple-100 text-purple-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {getPlanIcon(plan.type)}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.name}</h3>
                
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${plan.badgeColor} mb-3`}>
                  {plan.badge}
                </span>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                  <span className="text-gray-600">/{plan.duration} ngày</span>
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  {plan.swapsPerMonth} lần thay pin/tháng
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircleIconSolid className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {currentPlan?.id === plan.id ? (
                  <button 
                    disabled
                    className="w-full py-2.5 px-4 bg-green-100 text-green-800 rounded-lg font-medium cursor-not-allowed"
                  >
                    Gói hiện tại
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {currentPlan && plan.price > currentPlan.price ? 'Nâng cấp' : 'Chọn gói'}
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                selectedPlan.type === 'trial' ? 'bg-green-100 text-green-600' :
                selectedPlan.type === 'basic' ? 'bg-blue-100 text-blue-600' :
                selectedPlan.type === 'premium' ? 'bg-purple-100 text-purple-600' :
                'bg-orange-100 text-orange-600'
              }`}>
                {getPlanIcon(selectedPlan.type)}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Xác nhận nâng cấp
              </h3>
              <p className="text-gray-600">
                Bạn có chắc chắn muốn nâng cấp lên <strong>{selectedPlan.name}</strong>?
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Gói dịch vụ:</span>
                <span className="font-medium">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Giá:</span>
                <span className="font-medium">{formatPrice(selectedPlan.price)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Thời hạn:</span>
                <span className="font-medium">{selectedPlan.duration} ngày</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button
                onClick={confirmUpgrade}
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  'Xác nhận'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;