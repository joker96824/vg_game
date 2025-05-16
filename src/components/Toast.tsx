import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // 3秒后开始淡出
    const fadeTimer = setTimeout(() => {
      setOpacity(0);
    }, 3000);

    // 5秒后完全消失
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      style={{ 
        opacity,
        transition: 'opacity 2s ease-in-out'
      }}
    >
      {message}
    </div>
  );
};

export default Toast; 