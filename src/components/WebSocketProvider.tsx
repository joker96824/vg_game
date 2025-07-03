import React, { useEffect } from 'react';
import { websocketManager } from '../services/websocketManager';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  useEffect(() => {
    // 检查是否有token，如果有则连接WebSocket
    const token = localStorage.getItem('token');
    if (token) {
      console.log('WebSocketProvider: 检测到token，连接WebSocket...');
      websocketManager.connect();
    }

    // 监听token变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue) {
          console.log('WebSocketProvider: token已更新，连接WebSocket...');
          websocketManager.connect();
        } else {
          console.log('WebSocketProvider: token已移除，断开WebSocket...');
          websocketManager.disconnect();
        }
      }
    };

    // 添加storage事件监听器
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return <>{children}</>;
};

export default WebSocketProvider; 