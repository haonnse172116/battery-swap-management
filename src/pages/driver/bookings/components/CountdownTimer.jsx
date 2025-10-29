import React, { useEffect, useState } from 'react';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Đã hết hạn');
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      if (d > 0) setTimeLeft(`${d}d ${h}h ${m}m`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m ${s}s`);
      else if (m > 0) setTimeLeft(`${m}m ${s}s`);
      else setTimeLeft(`${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (isExpired) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-mono">
        <span>⏰</span><span>Hết hạn</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">
      <span>⏱️</span><span>{timeLeft}</span>
    </div>
  );
};

export default CountdownTimer;
