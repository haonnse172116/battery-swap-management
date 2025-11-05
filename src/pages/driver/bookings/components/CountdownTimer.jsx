import React, { useState, useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

const CountdownTimer = ({ targetDate, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!targetDate) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      
      if (isNaN(target)) {
        setTimeLeft(null);
        return;
      }

      const difference = target - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft(null);
        // ✅ Safe onExpire call with additional checks
        if (onExpire && typeof onExpire === 'function') {
          try {
            onExpire();
          } catch (error) {
            console.warn('CountdownTimer onExpire error:', error);
          }
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <ClockIcon className="w-3 h-3" />
        <span>Đã hết hạn</span>
      </div>
    );
  }

  const isUrgent = timeLeft.hours === 0 && timeLeft.minutes <= 15;
  
  return (
    <div className={`flex items-center gap-2 text-xs font-medium ${
      isUrgent ? 'text-red-600' : 'text-blue-600'
    }`}>
      <ClockIcon className="w-3 h-3" />
      <span>
        {timeLeft.hours > 0 && `${timeLeft.hours}h `}
        {timeLeft.minutes > 0 && `${timeLeft.minutes}m `}
        {timeLeft.seconds}s
      </span>
      {isUrgent && <span className="text-red-500 font-bold">🚨</span>}
    </div>
  );
};

export default CountdownTimer;
