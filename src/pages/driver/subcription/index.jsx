import {
  ArrowRightIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  FireIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { useUser } from '../../../hooks/useUser';
import { useGetMySubscriptionQuery } from '../../../services/subcription.service';
import { useGetSubscriptionPlansQuery } from '../../../services/subcriptionPlan.service';
import { usePurchaseSubscriptionMutation } from '../../../services/subscriptionPayment.service';
import toast from '../../../utils/toast';

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Get current user from custom hook
  const { userInfo: currentUser, isLoading: isLoadingUser, error: userError } = useUser();
  const userId = currentUser?.userId;

  // API hooks with user dependency
  const { data: plansResponse, isLoading: isLoadingPlans, error: plansError, refetch: refetchPlans } = useGetSubscriptionPlansQuery({ page: 1, pageSize: 10 });
  
  // Subscription query with user dependency - will auto refresh when user changes
  const { 
    data: subscriptionResponse, 
    isLoading: isLoadingSubscription, 
    error: subscriptionError, 
    refetch: refetchSubscription 
  } = useGetMySubscriptionQuery(undefined, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
  });
  
  const [purchaseSubscription, { isLoading: isPurchasing }] = usePurchaseSubscriptionMutation();

  // Auto-refetch subscription when user changes
  useEffect(() => {
    if (userId) {
      refetchSubscription();
    }
  }, [userId, refetchSubscription]);

  // Process API data
  const availablePlans = plansResponse?.content || [];
  const totalPlans = plansResponse?.pagination?.totalCount || 0;
  const currentSubscription = subscriptionResponse?.content || null;

  const transformPlanFromAPI = (apiPlan) => {
    const swapsCount = parseInt(apiPlan.swapAmount) || 0;
    const isBasicPlan = apiPlan.name.toLowerCase().includes('basic');
    const isPremiumPlan = apiPlan.name.toLowerCase().includes('premium');
    
    return {
      id: apiPlan.planId,
      name: apiPlan.name,
      description: apiPlan.description,
      price: apiPlan.monthlyFee,
      duration: 30, 
      swapsPerMonth: swapsCount,
      swapAmount: swapsCount,
      active: apiPlan.active,
      type: isBasicPlan ? 'basic' : isPremiumPlan ? 'premium' : 'standard',
      features: generatePlanFeatures(apiPlan),
      badge: isBasicPlan ? 'Phổ biến' : isPremiumPlan ? 'Tốt nhất' : 'Tiêu chuẩn',
      badgeColor: isBasicPlan ? 'bg-blue-100 text-blue-800' : 
                  isPremiumPlan ? 'bg-purple-100 text-purple-800' : 
                  'bg-gray-100 text-gray-800',
      popular: isPremiumPlan, 
      createdAt: apiPlan.createdAt
    };
  };

  const generatePlanFeatures = (apiPlan) => {
    const baseFeatures = [
      `${apiPlan.swapAmount} lần thay pin/tháng`,
      'Hỗ trợ 24/7',
      'Theo dõi lịch sử thay pin'
    ];

    const isBasicPlan = apiPlan.name.toLowerCase().includes('basic');
    const isPremiumPlan = apiPlan.name.toLowerCase().includes('premium');

    if (isPremiumPlan) {
      return [
        ...baseFeatures,
        'Ưu tiên cao trong hàng chờ',
        'Báo cáo chi tiết hàng tháng'
      ];
    } else if (isBasicPlan) {
      return [
        ...baseFeatures,
        'Ưu tiên tiêu chuẩn',
        'Thông báo cơ bản'
      ];
    }

    return baseFeatures;
  };

  // Check if current plan is same as available plan
  const isCurrentPlan = (planId) => {
    return currentSubscription?.planId === planId;
  };

  // Check if plan is upgrade from current
  const isUpgrade = (planPrice) => {
    return currentSubscription && planPrice > currentSubscription.monthlyFee;
  };

  const handleUpgrade = (plan) => {
    if (!currentUser || !userId) {
      toast.error('Vui lòng đăng nhập để sử dụng dịch vụ');
      return;
    }

    if (!plan.active) {
      toast.error('Gói dịch vụ này hiện không khả dụng');
      return;
    }
    
    // Check for active subscription that prevents new subscription
    if (currentSubscription && 
        currentSubscription.status === 'Active' && 
        !currentSubscription.isExpired && 
        !isCurrentPlan(plan.id)) {
      toast.error('Bạn đang có gói dịch vụ hoạt động. Vui lòng đợi hết hạn hoặc liên hệ hỗ trợ để thay đổi gói.');
      return;
    }
    
    // For current plan renewal - check if renewal is allowed
    if (isCurrentPlan(plan.id)) {
      if (currentSubscription.status === 'Active' && !currentSubscription.isExpired) {
        if (currentSubscription.daysRemaining > 7) {
          toast.error('Gói dịch vụ của bạn vẫn còn thời gian sử dụng. Bạn có thể gia hạn khi còn 7 ngày hoặc ít hơn.');
          return;
        }
      }
      
      setSelectedPlan(plan);
      setShowUpgradeModal(true);
      return;
    }
    
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const confirmUpgrade = async () => {
    if (!selectedPlan) return;

    if (!currentUser || !userId) {
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
      setShowUpgradeModal(false);
      return;
    }

    try {
      const purchaseResponse = await purchaseSubscription({
        planId: selectedPlan.id,
        paymentMethod: 'Card'
      }).unwrap();

      const paymentData = purchaseResponse.content;

      if (paymentData?.paymentUrl) {
        // Find the real subPayId field name from API response
        const realSubPayId = paymentData.subPayId || 
                            paymentData.subscriptionPaymentId || 
                            paymentData.paymentId || 
                            paymentData.id ||
                            paymentData.transactionId;

        const paymentInfo = {
          subPayId: realSubPayId,
          planName: selectedPlan.name,
          amount: paymentData.amount || selectedPlan.price,
          orderCode: paymentData.orderCode,
          paymentUrl: paymentData.paymentUrl,
          userId: userId,
          timestamp: new Date().toISOString(),
          planId: selectedPlan.id,
          planPrice: selectedPlan.price,
          payosId: paymentData.payosId || paymentData.payosTransactionId,
          rawPaymentData: paymentData
        };

        localStorage.setItem('pendingPayment', JSON.stringify(paymentInfo));

        // Redirect to PayOS
        window.location.href = paymentData.paymentUrl;
      } else {
        throw new Error('Không nhận được URL thanh toán');
      }
    } catch (error) {
      let errorMessage = 'Không thể tạo đơn thanh toán';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Check for specific error cases
      if (errorMessage.toLowerCase().includes('active') || 
          errorMessage.toLowerCase().includes('đang hoạt động') ||
          errorMessage.toLowerCase().includes('subscription already exists')) {
        errorMessage = 'Bạn đã có gói dịch vụ đang hoạt động. Không thể đăng ký thêm gói mới.';
      }
      
      toast.error(errorMessage);
    } finally {
      setShowUpgradeModal(false);
    }
  };

  // Enhanced payment return handling with user context
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('success') === 'true' || urlParams.get('payment') === 'success';
    
    if (paymentSuccess && userId) {
      // Get pending payment info
      const pendingPayment = JSON.parse(localStorage.getItem('pendingPayment') || 'null');
      
      // Check if payment belongs to current user
      if (pendingPayment?.userId === userId) {
        toast.success('Thanh toán thành công! Đang cập nhật thông tin gói dịch vụ...');
        
        // Refresh subscription data with delay to ensure backend has processed
        setTimeout(() => {
          refetchSubscription();
        }, 2000);
        
        // Clear pending payment
        localStorage.removeItem('pendingPayment');
      }
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [userId, refetchSubscription]);

  // Clear data when user logs out
  useEffect(() => {
    if (!currentUser) {
      localStorage.removeItem('pendingPayment');
    }
  }, [currentUser]);

  const formatPrice = (price) => {
    if (price === 0) return 'Miễn phí';
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
      case 'basic': return <CheckCircleIcon className="w-6 h-6" />;
      case 'premium': return <StarIcon className="w-6 h-6" />;
      case 'business': return <FireIcon className="w-6 h-6" />;
      default: return <BoltIcon className="w-6 h-6" />;
    }
  };

  const isLoading = isLoadingPlans || isLoadingSubscription || isLoadingUser;

  // Show login required message if no user
  if (!currentUser && !isLoadingUser) {
    return (
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cần đăng nhập</h3>
          <p className="text-gray-600">Vui lòng đăng nhập để xem và quản lý gói dịch vụ của bạn.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Đang tải thông tin gói dịch vụ...</p>
            {currentUser && (
              <p className="text-xs text-gray-500 mt-1">
                Đang tải cho: {currentUser.fullName || currentUser.email}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (plansError) {
    return (
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải gói dịch vụ</h3>
          <p className="text-gray-600 mb-6">
            {plansError?.data?.message || plansError?.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
          </p>
          <button 
            onClick={() => refetchPlans()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!availablePlans.length) {
    return (
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có gói dịch vụ nào</h3>
          <p className="text-gray-600">Hiện tại chưa có gói dịch vụ nào khả dụng. Vui lòng quay lại sau.</p>
        </div>
      </div>
    );
  }

  const transformedPlans = availablePlans
    .map(transformPlanFromAPI)
    .sort((a, b) => a.price - b.price); 

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gói dịch vụ thay pin</h1>
        <p className="text-gray-600">
          Chọn gói dịch vụ phù hợp với nhu cầu của bạn.
        </p>
      </div>

      {/* Current Subscription */}
      {currentSubscription && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Gói hiện tại</h2>
          <div className={`rounded-xl border-2 p-6 ${
            currentSubscription.status === 'Active' 
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' 
              : currentSubscription.isExpired
              ? 'bg-gradient-to-r from-red-50 to-red-50 border-red-200'
              : 'bg-gradient-to-r from-yellow-50 to-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  currentSubscription.status === 'Active' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {getPlanIcon(currentSubscription.planName?.toLowerCase().includes('premium') ? 'premium' : 'basic')}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{currentSubscription.planName}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      currentSubscription.status === 'Active' && !currentSubscription.isExpired
                        ? 'bg-green-100 text-green-800'
                        : currentSubscription.isExpired
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      <CheckCircleIconSolid className="w-4 h-4 mr-1" />
                      {currentSubscription.status === 'Active' && !currentSubscription.isExpired
                        ? 'Đang hoạt động'
                        : currentSubscription.isExpired
                        ? 'Đã hết hạn'
                        : currentSubscription.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Từ {formatDate(currentSubscription.startDate)} đến {formatDate(currentSubscription.endDate)}
                  </p>
                  {currentSubscription.planDescription && (
                    <p className="text-xs text-gray-500 mt-1">{currentSubscription.planDescription}</p>
                  )}
                  {/* Show user info in subscription */}
                  <p className="text-xs text-gray-400 mt-1">
                    Người sử dụng: {currentSubscription.userName || currentUser?.fullName || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{formatPrice(currentSubscription.monthlyFee)}</div>
                <div className="text-sm text-gray-600">/tháng</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <BoltIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Lần thay pin đã sử dụng</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {currentSubscription.numberOfSwap}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Tổng lần đã sử dụng trong chu kỳ
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Thời gian còn lại</span>
                </div>
                <div className={`text-2xl font-bold ${
                  currentSubscription.daysRemaining > 7 
                    ? 'text-green-600' 
                    : currentSubscription.daysRemaining > 0 
                    ? 'text-yellow-600' 
                    : 'text-red-600'
                }`}>
                  {currentSubscription.daysRemaining} ngày
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {currentSubscription.isExpired ? 'Đã hết hạn' : 'Còn lại'}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Trạng thái</span>
                </div>
                <div className={`text-lg font-semibold capitalize ${
                  currentSubscription.status === 'Active' && !currentSubscription.isExpired
                    ? 'text-green-600'
                    : currentSubscription.isExpired
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`}>
                  {currentSubscription.status === 'Active' && !currentSubscription.isExpired
                    ? 'Hoạt động'
                    : currentSubscription.isExpired
                    ? 'Hết hạn'
                    : currentSubscription.status}
                </div>
              </div>
            </div>

            {/* Renewal/Upgrade notice */}
            {currentSubscription.isExpired && (
              <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Gói dịch vụ của bạn đã hết hạn. Vui lòng gia hạn hoặc nâng cấp để tiếp tục sử dụng.
                </p>
              </div>
            )}
            
            {!currentSubscription.isExpired && currentSubscription.daysRemaining <= 7 && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  ⏰ Gói dịch vụ của bạn sẽ hết hạn trong {currentSubscription.daysRemaining} ngày. 
                  Hãy gia hạn để tránh gián đoạn dịch vụ.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {currentSubscription ? 'Nâng cấp hoặc gia hạn' : 'Các gói dịch vụ có sẵn'}
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {transformedPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 p-8 hover:shadow-xl transition-all duration-300 ${
                plan.popular 
                  ? 'border-purple-500 shadow-lg transform scale-105' 
                  : isCurrentPlan(plan.id)
                  ? 'border-green-500 bg-green-50'
                  : plan.active
                  ? 'border-gray-200 hover:border-gray-300'
                  : 'border-gray-100 opacity-75'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && plan.active && !isCurrentPlan(plan.id) && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                    <SparklesIcon className="w-4 h-4" />
                    Được đề xuất
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan(plan.id) && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                    <CheckCircleIconSolid className="w-4 h-4" />
                    Gói hiện tại
                  </span>
                </div>
              )}

              {/* Inactive Badge */}
              {!plan.active && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Không khả dụng
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                {/* Icon */}
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  plan.type === 'basic' ? 'bg-blue-100 text-blue-600' :
                  plan.type === 'premium' ? 'bg-purple-100 text-purple-600' :
                  'bg-gray-100 text-gray-600'
                } ${!plan.active ? 'opacity-50' : ''}`}>
                  {getPlanIcon(plan.type)}
                </div>
                
                {/* Plan Name */}
                <h3 className={`text-2xl font-bold mb-2 ${plan.active ? 'text-gray-900' : 'text-gray-500'}`}>
                  {plan.name}
                </h3>
                
                {/* Badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${plan.badgeColor} mb-4 ${!plan.active ? 'opacity-50' : ''}`}>
                  {plan.badge}
                </span>
                
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className={`text-4xl font-bold ${plan.active ? 'text-gray-900' : 'text-gray-500'}`}>
                      {plan.price === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN').format(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <>
                        <span className={`text-lg ${plan.active ? 'text-gray-600' : 'text-gray-400'}`}>₫</span>
                        <span className={`text-sm ${plan.active ? 'text-gray-600' : 'text-gray-400'}`}>/tháng</span>
                      </>
                    )}
                  </div>
                  
                  {/* Swaps per month highlight */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    plan.type === 'premium' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  } ${!plan.active ? 'opacity-50' : ''}`}>
                    <BoltIcon className="w-4 h-4" />
                    {plan.swapAmount} lần thay pin/tháng
                  </div>
                </div>

                {/* Description */}
                {plan.description && (
                  <p className={`text-sm mb-6 ${plan.active ? 'text-gray-600' : 'text-gray-400'}`}>
                    {plan.description}
                  </p>
                )}
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <CheckCircleIconSolid className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      plan.active ? 'text-green-500' : 'text-gray-400'
                    }`} />
                    <span className={`leading-5 ${plan.active ? 'text-gray-700' : 'text-gray-500'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <div className="mt-auto">
                {!plan.active ? (
                  <button 
                    disabled
                    className="w-full py-4 px-6 bg-gray-100 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
                  >
                    Không khả dụng
                  </button>
                ) : isCurrentPlan(plan.id) ? (
                  <button 
                    onClick={() => handleUpgrade(plan)}
                    className="w-full py-4 px-6 bg-green-100 text-green-800 rounded-xl font-semibold hover:bg-green-200 transition"
                  >
                    Gia hạn gói này
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600 transform hover:scale-105'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {isUpgrade(plan.price) ? 'Nâng cấp' : 'Chọn gói này'}
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Created date for reference */}
              {plan.createdAt && (
                <div className="text-center mt-4">
                  <p className="text-xs text-gray-400">
                    Tạo ngày {formatDate(plan.createdAt)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comparison Note */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <BoltIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-800">
              Tất cả gói đều bao gồm hỗ trợ 24/7 và theo dõi lịch sử thay pin
            </span>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                selectedPlan.type === 'basic' ? 'bg-blue-100 text-blue-600' :
                selectedPlan.type === 'premium' ? 'bg-purple-100 text-purple-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {getPlanIcon(selectedPlan.type)}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Xác nhận {isCurrentPlan(selectedPlan.id) ? 'gia hạn' : 'thanh toán'}
              </h3>
              <p className="text-gray-600 mb-4">
                Bạn sẽ được chuyển đến trang thanh toán PayOS để hoàn tất giao dịch
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Gói dịch vụ:</span>
                <span className="font-medium">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Giá:</span>
                <span className="font-medium text-blue-600">{formatPrice(selectedPlan.price)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Lần thay pin:</span>
                <span className="font-medium">{selectedPlan.swapsPerMonth}/tháng</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Phương thức:</span>
                <span className="font-medium">Thẻ ngân hàng</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Người thanh toán:</span>
                <span className="font-medium text-green-600">
                  {currentUser?.fullName || currentUser?.email}
                </span>
              </div>
              {currentSubscription && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Loại giao dịch:</span>
                  <span className="font-medium text-purple-600">
                    {isCurrentPlan(selectedPlan.id) ? 'Gia hạn' : 
                     isUpgrade(selectedPlan.price) ? 'Nâng cấp' : 'Chuyển đổi'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                disabled={isPurchasing}
                className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmUpgrade}
                disabled={isPurchasing}
                className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isPurchasing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  'Thanh toán ngay'
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