import { ToastType } from '../components/Toast';
import { ConfirmType } from '../components/Confirm';
import { AlertType } from '../components/Alert';

// 提示管理器类型定义
interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

interface ConfirmOptions {
  type?: ConfirmType;
  confirmText?: string;
  cancelText?: string;
}

interface AlertOptions {
  type?: AlertType;
  confirmText?: string;
}

// 全局提示管理器
class NotificationManager {
  private static instance: NotificationManager;
  private toastCallbacks: ((message: string, options?: ToastOptions) => void)[] = [];
  private confirmCallbacks: ((title: string, message: string, options?: ConfirmOptions) => Promise<boolean>)[] = [];
  private alertCallbacks: ((title: string, message: string, options?: AlertOptions) => Promise<void>)[] = [];

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Toast 相关方法
  onToast(callback: (message: string, options?: ToastOptions) => void) {
    this.toastCallbacks.push(callback);
  }

  offToast(callback: (message: string, options?: ToastOptions) => void) {
    const index = this.toastCallbacks.indexOf(callback);
    if (index > -1) {
      this.toastCallbacks.splice(index, 1);
    }
  }

  toast(message: string, options?: ToastOptions) {
    this.toastCallbacks.forEach(callback => callback(message, options));
  }

  success(message: string, duration?: number) {
    this.toast(message, { type: 'success', duration });
  }

  error(message: string, duration?: number) {
    this.toast(message, { type: 'error', duration });
  }

  warning(message: string, duration?: number) {
    this.toast(message, { type: 'warning', duration });
  }

  info(message: string, duration?: number) {
    this.toast(message, { type: 'info', duration });
  }

  // Confirm 相关方法
  onConfirm(callback: (title: string, message: string, options?: ConfirmOptions) => Promise<boolean>) {
    this.confirmCallbacks.push(callback);
  }

  offConfirm(callback: (title: string, message: string, options?: ConfirmOptions) => Promise<boolean>) {
    const index = this.confirmCallbacks.indexOf(callback);
    if (index > -1) {
      this.confirmCallbacks.splice(index, 1);
    }
  }

  async confirm(title: string, message: string, options?: ConfirmOptions): Promise<boolean> {
    if (this.confirmCallbacks.length === 0) {
      // 如果没有注册的回调，使用浏览器默认的 confirm
      return window.confirm(message);
    }
    
    // 使用第一个注册的回调
    return this.confirmCallbacks[0](title, message, options);
  }

  // Alert 相关方法
  onAlert(callback: (title: string, message: string, options?: AlertOptions) => Promise<void>) {
    this.alertCallbacks.push(callback);
  }

  offAlert(callback: (title: string, message: string, options?: AlertOptions) => Promise<void>) {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }

  async alert(title: string, message: string, options?: AlertOptions): Promise<void> {
    if (this.alertCallbacks.length === 0) {
      // 如果没有注册的回调，使用浏览器默认的 alert
      window.alert(message);
      return;
    }
    
    // 使用第一个注册的回调
    return this.alertCallbacks[0](title, message, options);
  }
}

// 导出单例实例
export const notification = NotificationManager.getInstance();

// 导出便捷方法
export const toast = (message: string, options?: ToastOptions) => notification.toast(message, options);
export const success = (message: string, duration?: number) => notification.success(message, duration);
export const error = (message: string, duration?: number) => notification.error(message, duration);
export const warning = (message: string, duration?: number) => notification.warning(message, duration);
export const info = (message: string, duration?: number) => notification.info(message, duration);
export const confirm = (title: string, message: string, options?: ConfirmOptions) => notification.confirm(title, message, options);
export const alert = (title: string, message: string, options?: AlertOptions) => notification.alert(title, message, options); 