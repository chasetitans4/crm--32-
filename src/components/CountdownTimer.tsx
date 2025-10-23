"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface CountdownTimerProps {
  itemId: string;
  itemType: 'quote' | 'proposal';
  daysRemaining?: number;
  expiresAt: Date;
  isExtended?: boolean;
  title?: string;
  description?: string;
  className?: string;
  onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  itemId,
  itemType,
  daysRemaining,
  expiresAt,
  isExtended = false,
  title = "Limited Time Offer",
  description,
  className = "",
  onExpire
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);
  const expiredRef = useRef(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = expiresAt.getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (!expiredRef.current) {
          expiredRef.current = true;
          setIsExpired(true);
          onExpire?.();
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  // Reset expiredRef when expiresAt changes
  useEffect(() => {
    expiredRef.current = false;
  }, [expiresAt]);

  if (isExpired) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Offer Expired</span>
        </div>
        <p className="text-red-600 mt-1">This promotion has ended. Contact us for current pricing.</p>
      </div>
    );
  }

  const defaultDescription = description || `Your ${itemType} will expire soon. ${isExtended ? 'This deadline has been extended.' : 'Contact us to extend if needed.'}`;

  return (
    <div className={`bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Clock className="h-5 w-5" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-purple-100 mb-4">{defaultDescription}</p>
        {daysRemaining !== undefined && (
          <p className="text-purple-200 text-sm mb-2">
            {daysRemaining} days remaining {isExtended && '(Extended)'}
          </p>
        )}
        
        <div className="flex justify-center space-x-4">
          <div className="text-center">
            <div className="bg-white/20 rounded-lg p-3 min-w-[60px]">
              <div className="text-2xl font-bold">{timeLeft.days}</div>
              <div className="text-xs uppercase tracking-wide">Days</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white/20 rounded-lg p-3 min-w-[60px]">
              <div className="text-2xl font-bold">{timeLeft.hours}</div>
              <div className="text-xs uppercase tracking-wide">Hours</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white/20 rounded-lg p-3 min-w-[60px]">
              <div className="text-2xl font-bold">{timeLeft.minutes}</div>
              <div className="text-xs uppercase tracking-wide">Minutes</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white/20 rounded-lg p-3 min-w-[60px]">
              <div className="text-2xl font-bold">{timeLeft.seconds}</div>
              <div className="text-xs uppercase tracking-wide">Seconds</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
