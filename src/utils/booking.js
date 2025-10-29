
export const getStatusConfig = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return {
        label: 'Chờ xác nhận',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        tone: 'yellow',
      };
    case 'confirmed':
      return {
        label: 'Đã xác nhận',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        tone: 'blue',
      };
    case 'completed':
      return {
        label: 'Hoàn thành',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        tone: 'green',
      };
    case 'cancelled':
      return {
        label: 'Đã hủy',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        tone: 'red',
      };
    default:
      return {
        label: status || 'Không xác định',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200',
        iconColor: 'text-gray-600',
        tone: 'gray',
      };
  }
};

export const formatDateTime = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { date: 'N/A', time: 'N/A' };
    return {
      date: date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  } catch {
    return { date: 'N/A', time: 'N/A' };
  }
};

export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

export const isUpcoming = (timeSlot, status) =>
  new Date(timeSlot) > new Date() &&
  !['cancelled', 'completed'].includes(status?.toLowerCase());

export const isUrgent = (timeSlot, status) => {
  const now = new Date();
  const t = new Date(timeSlot);
  const diff = t - now;
  return (
    diff > 0 &&
    diff <= 60 * 60 * 1000 &&
    !['cancelled', 'completed'].includes(status?.toLowerCase())
  );
};

// Lọc theo thời gian
export const filterBookingsByDate = (
  bookings,
  dateFilter,
  customDateFrom,
  customDateTo
) => {
  if (dateFilter === 'all') return bookings;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return bookings.filter((b) => {
    const d = new Date(b.timeSlot);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    switch (dateFilter) {
      case 'today':
        return day.getTime() === today.getTime();
      case 'tomorrow': {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return day.getTime() === tomorrow.getTime();
      }
      case 'this_week': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return d >= weekStart && d <= weekEnd;
      }
      case 'this_month':
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      case 'last_month': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
      }
      case 'custom': {
        if (!customDateFrom || !customDateTo) return true;
        const from = new Date(customDateFrom);
        const to = new Date(customDateTo);
        to.setHours(23, 59, 59, 999);
        return d >= from && d <= to;
      }
      default:
        return true;
    }
  });
};
