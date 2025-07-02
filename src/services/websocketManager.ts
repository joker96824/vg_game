import { WebSocketService, WebSocketMessage } from './websocketService';
import { WS_BASE_URL } from '../constants/api';

class WebSocketManager {
    private wsService: WebSocketService;
    private messageCallbacks: Set<(message: WebSocketMessage) => void> = new Set();
    private connectionCallbacks: Set<(connected: boolean) => void> = new Set();
    private authCallbacks: Set<(authenticated: boolean) => void> = new Set();
    private errorCallbacks: Set<(error: string) => void> = new Set();
    private isConnecting: boolean = false;

    constructor() {
        this.wsService = WebSocketService.getInstance(WS_BASE_URL);
        this.setupCallbacks();
    }

    private setupCallbacks() {
        // 设置 WebSocket 回调
        this.wsService.setConnectionChangeCallback((connected) => {
            this.connectionCallbacks.forEach(callback => callback(connected));
            if (connected) {
                this.isConnecting = false;
            }
        });

        this.wsService.setAuthChangeCallback((authenticated) => {
            this.authCallbacks.forEach(callback => callback(authenticated));
        });

        this.wsService.setMessageCallback((message) => {
            this.messageCallbacks.forEach(callback => callback(message));
        });

        this.wsService.setErrorCallback((error) => {
            this.errorCallbacks.forEach(callback => callback(error));
            this.isConnecting = false;
        });
    }

    public connect() {
        if (this.isConnected() || this.isConnecting) {
            console.log('WebSocket已经连接或正在连接中，跳过重复连接');
            return;
        }

        this.isConnecting = true;
        console.log('开始连接WebSocket...');
        this.wsService.connect();
    }

    public disconnect() {
        this.wsService.disconnect();
    }

    public sendMessage(type: string, content: string, receiverId?: string) {
        this.wsService.sendMessage(type as any, content, receiverId);
    }

    public sendChat(content: string, receiverId?: string) {
        this.wsService.sendChat(content, receiverId);
    }

    // 添加消息监听器
    public addMessageListener(callback: (message: WebSocketMessage) => void) {
        this.messageCallbacks.add(callback);
    }

    // 移除消息监听器
    public removeMessageListener(callback: (message: WebSocketMessage) => void) {
        this.messageCallbacks.delete(callback);
    }

    // 添加连接状态监听器
    public addConnectionListener(callback: (connected: boolean) => void) {
        this.connectionCallbacks.add(callback);
    }

    // 移除连接状态监听器
    public removeConnectionListener(callback: (connected: boolean) => void) {
        this.connectionCallbacks.delete(callback);
    }

    // 添加认证状态监听器
    public addAuthListener(callback: (authenticated: boolean) => void) {
        this.authCallbacks.add(callback);
    }

    // 移除认证状态监听器
    public removeAuthListener(callback: (authenticated: boolean) => void) {
        this.authCallbacks.delete(callback);
    }

    // 添加错误监听器
    public addErrorListener(callback: (error: string) => void) {
        this.errorCallbacks.add(callback);
    }

    // 移除错误监听器
    public removeErrorListener(callback: (error: string) => void) {
        this.errorCallbacks.delete(callback);
    }

    // 获取连接状态
    public isConnected(): boolean {
        return this.wsService['ws']?.readyState === WebSocket.OPEN;
    }

    // 获取认证状态
    public isAuthenticated(): boolean {
        return this.wsService['isAuthenticated'];
    }
}

// 创建全局实例
export const websocketManager = new WebSocketManager(); 