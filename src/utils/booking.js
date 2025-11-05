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
    
    case 'expired':
      return {
        label: 'Đã hết hạn',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-300',
        iconColor: 'text-gray-600',
        tone: 'gray',
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


export const parseVietnameseDate = (dateString) => {
  try {
    if (!dateString) return null;
    
    
    if (dateString.includes('T') || dateString.includes('Z')) {
      return new Date(dateString);
    }
    
    
    const dateTimeRegex = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/;
    const match = dateString.match(dateTimeRegex);
    
    if (match) {
      const [, day, month, year, hour, minute] = match;
      
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
    }
    
    
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch (error) {
    console.warn('Date parsing error:', error, 'for dateString:', dateString);
    return null;
  }
};


export const isExpired = (timeSlot, status) => {
  try {
    const date = parseVietnameseDate(timeSlot);
    if (!date) return false;
    
    const now = new Date();
    const isOverdue = date < now;
    const isNotFinal = ['pending', 'confirmed'].includes(status?.toLowerCase());
    
    return isOverdue && isNotFinal;
  } catch (error) {
    console.warn('isExpired error:', error, 'for timeSlot:', timeSlot);
    return false;
  }
};


export const getEffectiveStatus = (timeSlot, status) => {
  if (isExpired(timeSlot, status)) {
    return 'expired';
  }
  return status;
};


export const isUpcoming = (timeSlot, status) => {
  try {
    if (isExpired(timeSlot, status)) return false;
    
    const date = parseVietnameseDate(timeSlot);
    if (!date) return false;
    
    return date > new Date() &&
      !['cancelled', 'completed', 'expired'].includes(status?.toLowerCase());
  } catch (error) {
    console.warn('isUpcoming error:', error, 'for timeSlot:', timeSlot);
    return false;
  }
};


export const isUrgent = (timeSlot, status) => {
  try {
    if (isExpired(timeSlot, status)) return false;
    
    const date = parseVietnameseDate(timeSlot);
    if (!date) return false;
    
    const now = new Date();
    const diff = date - now;
    return (
      diff > 0 &&
      diff <= 60 * 60 * 1000 && 
      !['cancelled', 'completed', 'expired'].includes(status?.toLowerCase())
    );
  } catch (error) {
    console.warn('isUrgent error:', error, 'for timeSlot:', timeSlot);
    return false;
  }
};


export const formatDateTime = (dateString) => {
  try {
    const date = parseVietnameseDate(dateString);
    if (!date || isNaN(date.getTime())) {
      return { date: 'N/A', time: 'N/A' };
    }
    
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
  } catch (error) {
    console.warn('formatDateTime error:', error, 'for dateString:', dateString);
    return { date: 'N/A', time: 'N/A' };
  }
};

export const formatDate = (dateString) => {
  try {
    const date = parseVietnameseDate(dateString);
    if (!date || isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    console.warn('formatDate error:', error, 'for dateString:', dateString);
    return 'N/A';
  }
};


export const getTimeStatus = (timeSlot) => {
  try {
    const date = parseVietnameseDate(timeSlot);
    if (!date) return null;
    
    const now = new Date();
    const diff = date - now;
    
    if (diff < 0) {
      
      const overdue = Math.abs(diff);
      const hours = Math.floor(overdue / (1000 * 60 * 60));
      const minutes = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60));
      
      return {
        type: 'overdue',
        hours,
        minutes,
        text: 'Đã quá hạn'
      };
    } else {
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return {
        type: 'upcoming',
        hours,
        minutes,
        text: hours > 0 ? `Còn ${hours}h ${minutes}m` : `Còn ${minutes}m`
      };
    }
  } catch (error) {
    return null;
  }
};


// ✅ Add missing filterBookingsByDate function
export const filterBookingsByDate = (bookings, filter, customFrom = '', customTo = '') => {
  if (!bookings || !Array.isArray(bookings)) return [];
  if (filter === 'all') return bookings;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return bookings.filter(booking => {
    const bookingDate = parseVietnameseDate(booking.timeSlot);
    if (!bookingDate || isNaN(bookingDate.getTime())) return false;

    // Normalize booking date to start of day for comparison
    const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());

    switch (filter) {
      case 'today': {
        return bookingDateOnly.getTime() === today.getTime();
      }

      case 'this_week': {
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
        startOfWeek.setDate(today.getDate() - daysToMonday);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return bookingDateOnly >= startOfWeek && bookingDateOnly <= endOfWeek;
      }

      case 'this_month': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        return bookingDateOnly >= startOfMonth && bookingDateOnly <= endOfMonth;
      }

      case 'last_month': {
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        
        return bookingDateOnly >= startOfLastMonth && bookingDateOnly <= endOfLastMonth;
      }

      case 'custom': {
        if (!customFrom || !customTo) return false;
        
        const fromDate = new Date(customFrom);
        const toDate = new Date(customTo);
        
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return false;
        
        // Normalize custom dates
        const fromDateOnly = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
        const toDateOnly = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
        
        return bookingDateOnly >= fromDateOnly && bookingDateOnly <= toDateOnly;
      }

      default:
        return true;
    }
  });
};


export const formatVietnameseDateTime = (dateString) => {
  try {
    const date = parseVietnameseDate(dateString);
    if (!date) return 'N/A';
    
    return date.toLocaleString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'N/A';
  }
};


export const getDateForCountdown = (timeSlot) => {
  try {
    const date = parseVietnameseDate(timeSlot);
    return date || new Date();
  } catch (error) {
    console.warn('getDateForCountdown error:', error, 'for timeSlot:', timeSlot);
    return new Date();
  }
};
