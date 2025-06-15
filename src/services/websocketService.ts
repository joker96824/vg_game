export type MessageType = 'auth' | 'auth_success' | 'auth_error' | 'test' | 'ping' | 'chat' | 'notification' | 'system_notification' | 'error';

export interface WebSocketMessage {
    type: MessageType;
    content?: string;
    target_user_id?: string;
    level?: 'info' | 'warning' | 'error';
    sender_name?: string;
    message?: string;
    token?: string;
    timestamp?: string;
}

export class WebSocketService {
    private ws: WebSocket | null = null;
    private token: string | null = null;
    private isAuthenticated = false;
    private messageQueue: WebSocketMessage[] = [];
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout = 3000;
    private onConnectionChange: ((connected: boolean) => void) | null = null;
    private onMessage: ((message: WebSocketMessage) => void) | null = null;
    private onError: ((error: string) => void) | null = null;
    private onAuthChange: ((authenticated: boolean) => void) | null = null;

    constructor(private baseUrl: string) {
        this.token = localStorage.getItem('token');
    }

    public setConnectionChangeCallback(callback: (connected: boolean) => void) {
        this.onConnectionChange = callback;
    }

    public setMessageCallback(callback: (message: WebSocketMessage) => void) {
        this.onMessage = callback;
    }

    public setErrorCallback(callback: (error: string) => void) {
        this.onError = callback;
    }

    public setAuthChangeCallback(callback: (authenticated: boolean) => void) {
        this.onAuthChange = callback;
    }

    public connect() {
        try {
            if (this.ws?.readyState === WebSocket.OPEN) {
                return;
            }

            const url = `${this.baseUrl}/ws`;
            console.log('正在连接WebSocket:', url);
            this.ws = new WebSocket(url);
            this.setupEventListeners();
        } catch (error) {
            console.error('WebSocket连接失败:', error);
            this.onError?.(`连接失败: ${error instanceof Error ? error.message : String(error)}`);
            this.onConnectionChange?.(false);
        }
    }

    private setupEventListeners() {
        if (!this.ws) return;

        this.ws.onopen = () => {
            console.log('WebSocket连接已建立');
            this.reconnectAttempts = 0;
            this.onConnectionChange?.(true);
            
            // 发送认证消息
            if (this.token && this.ws) {
                this.ws.send(JSON.stringify({
                    type: 'auth',
                    token: this.token
                }));
            }
        };

        this.ws.onclose = (event) => {
            console.log('WebSocket连接已关闭', event.code, event.reason);
            this.isAuthenticated = false;
            this.onAuthChange?.(false);
            this.onConnectionChange?.(false);
            this.handleReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
            this.onError?.(`连接错误: ${error instanceof Error ? error.message : '未知错误'}`);
            this.onConnectionChange?.(false);
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as WebSocketMessage;
                console.log('收到消息:', message);
                
                switch (message.type) {
                    case 'auth_success':
                        this.isAuthenticated = true;
                        this.onAuthChange?.(true);
                        console.log('认证成功');
                        this.sendQueuedMessages();
                        break;
                        
                    case 'auth_error':
                        this.isAuthenticated = false;
                        this.onAuthChange?.(false);
                        console.error('认证失败:', message.message);
                        this.onError?.(`认证失败: ${message.message}`);
                        break;
                        
                    default:
                        this.handleMessage(message);
                        this.onMessage?.(message);
                }
            } catch (error) {
                console.error('消息解析错误:', error);
                this.onError?.(`消息解析错误: ${error instanceof Error ? error.message : String(error)}`);
            }
        };
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectTimeout * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`将在 ${delay}ms 后尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            this.onError?.('达到最大重连次数，请检查网络连接或服务器状态');
        }
    }

    private handleMessage(message: WebSocketMessage) {
        switch (message.type) {
            case 'test':
                console.log('收到测试消息:', message.content);
                break;
            case 'ping':
                console.log('收到pong响应');
                break;
            case 'chat':
                console.log(`收到来自 ${message.sender_name} 的消息: ${message.content}`);
                break;
            case 'notification':
                console.log(`收到通知: ${message.content}`);
                break;
            case 'system_notification':
                console.log(`收到系统通知: ${message.content}`);
                break;
            case 'error':
                console.error(`错误: ${message.message}`);
                break;
        }
    }

    private sendQueuedMessages() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            if (message) {
                this.ws?.send(JSON.stringify(message));
            }
        }
    }

    public sendMessage(type: MessageType, content: string, targetUserId?: string) {
        const message: WebSocketMessage = {
            type,
            content,
            timestamp: new Date().toISOString(),
            ...(targetUserId && { target_user_id: targetUserId })
        };

        if (this.isAuthenticated && this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.log('消息已加入队列');
            this.messageQueue.push(message);
        }
    }

    public sendTestMessage(content: string) {
        this.sendMessage('test', content);
    }

    public sendPing() {
        this.sendMessage('ping', '');
    }

    public sendChat(content: string, targetUserId?: string) {
        this.sendMessage('chat', content, targetUserId);
    }

    public sendNotification(content: string, level: 'info' | 'warning' | 'error' = 'info', targetUserId?: string) {
        this.sendMessage('notification', content, targetUserId);
    }

    public disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.isAuthenticated = false;
            this.onAuthChange?.(false);
        }
    }
} 