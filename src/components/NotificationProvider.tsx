import React, { useState, useEffect, useCallback } from 'react';
import Toast, { ToastType } from './Toast';
import Confirm, { ConfirmType } from './Confirm';
import Alert, { AlertType } from './Alert';
import { notification } from '../utils/notification';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ConfirmItem {
  id: string;
  title: string;
  message: string;
  type: ConfirmType;
  confirmText: string;
  cancelText: string;
  resolve: (value: boolean) => void;
}

interface AlertItem {
  id: string;
  title: string;
  message: string;
  type: AlertType;
  confirmText: string;
  resolve: () => void;
}

const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirms, setConfirms] = useState<ConfirmItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  // Toast 处理
  const handleToast = useCallback((message: string, options?: { type?: ToastType; duration?: number }) => {
    const id = Date.now().toString();
    const newToast: ToastItem = {
      id,
      message,
      type: options?.type || 'info',
      duration: options?.duration || 3000
    };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Confirm 处理
  const handleConfirm = useCallback((
    title: string, 
    message: string, 
    options?: { type?: ConfirmType; confirmText?: string; cancelText?: string }
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const id = Date.now().toString();
      const newConfirm: ConfirmItem = {
        id,
        title,
        message,
        type: options?.type || 'info',
        confirmText: options?.confirmText || '确认',
        cancelText: options?.cancelText || '取消',
        resolve
      };
      
      setConfirms(prev => [...prev, newConfirm]);
    });
  }, []);

  const handleConfirmResponse = useCallback((id: string, result: boolean) => {
    setConfirms(prev => {
      const confirm = prev.find(c => c.id === id);
      if (confirm) {
        confirm.resolve(result);
      }
      return prev.filter(c => c.id !== id);
    });
  }, []);

  // Alert 处理
  const handleAlert = useCallback((
    title: string, 
    message: string, 
    options?: { type?: AlertType; confirmText?: string }
  ): Promise<void> => {
    return new Promise((resolve) => {
      const id = Date.now().toString();
      const newAlert: AlertItem = {
        id,
        title,
        message,
        type: options?.type || 'info',
        confirmText: options?.confirmText || '确定',
        resolve
      };
      
      setAlerts(prev => [...prev, newAlert]);
    });
  }, []);

  const handleAlertResponse = useCallback((id: string) => {
    setAlerts(prev => {
      const alert = prev.find(a => a.id === id);
      if (alert) {
        alert.resolve();
      }
      return prev.filter(a => a.id !== id);
    });
  }, []);

  // 注册通知管理器回调
  useEffect(() => {
    notification.onToast(handleToast);
    notification.onConfirm(handleConfirm);
    notification.onAlert(handleAlert);

    return () => {
      notification.offToast(handleToast);
      notification.offConfirm(handleConfirm);
      notification.offAlert(handleAlert);
    };
  }, [handleToast, handleConfirm, handleAlert]);

  return (
    <>
      {children}
      
      {/* Toast 容器 */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Confirm 容器 */}
      {confirms.map((confirm) => (
        <Confirm
          key={confirm.id}
          isOpen={true}
          title={confirm.title}
          message={confirm.message}
          type={confirm.type}
          confirmText={confirm.confirmText}
          cancelText={confirm.cancelText}
          onConfirm={() => handleConfirmResponse(confirm.id, true)}
          onCancel={() => handleConfirmResponse(confirm.id, false)}
        />
      ))}

      {/* Alert 容器 */}
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          isOpen={true}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          confirmText={alert.confirmText}
          onConfirm={() => handleAlertResponse(alert.id)}
        />
      ))}
    </>
  );
};

export default NotificationProvider; 