import React, { useState, useEffect } from 'react';
import { getDateForCountdown } from '../../../../utils/booking';

const CountdownTimer = ({ targetDate, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    // ✅ Use the helper function to parse Vietnamese date format
    const target = getDateForCountdown(targetDate);
    
    const updateTimer = () => {
      const now = new Date();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft(null);
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (!timeLeft) return null;

  const isUrgent = timeLeft.hours === 0 && timeLeft.minutes <= 15;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono ${
      isUrgent 
        ? 'bg-red-100 text-red-700 animate-pulse' 
        : 'bg-blue-100 text-blue-700'
    }`}>
      <span>⏰</span>
      <span>
        {timeLeft.hours > 0 && `${timeLeft.hours}h `}
        {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </div>
  );
};

export default CountdownTimer;
