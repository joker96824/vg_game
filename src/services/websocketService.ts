export type MessageType = 'auth' | 'auth_success' | 'auth_error' | 'test' | 'ping' | 'pong' | 'chat' | 'notification' | 'system_notification' | 'error';

export interface WebSocketMessage {
    type: MessageType;
    content?: string;
    receiver_id?: string;
    sender_id?: string;
    level?: 'info' | 'warning' | 'error';
    sender_name?: string;
    sender_avatar?: string;
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
    private lastPongTime: number = 0;
    private connectionStartTime: number = 0;
    private static instance: WebSocketService | null = null;

    constructor(private baseUrl: string) {
        this.token = localStorage.getItem('token');
    }

    // 单例模式，确保全局只有一个 WebSocket 实例
    public static getInstance(baseUrl: string): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService(baseUrl);
        }
        return WebSocketService.instance;
    }

    // 销毁实例（用于测试或重置）
    public static destroyInstance(): void {
        if (WebSocketService.instance) {
            WebSocketService.instance.disconnect();
            WebSocketService.instance = null;
        }
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
            this.connectionStartTime = Date.now();
            this.ws = new WebSocket(url);
            this.setupEventListeners();
        } catch (error) {
            console.error('[WebSocket] 连接失败:', error);
            this.onError?.(`连接失败: ${error instanceof Error ? error.message : String(error)}`);
            this.onConnectionChange?.(false);
        }
    }

    private setupEventListeners() {
        if (!this.ws) return;

        this.ws.onopen = () => {
            this.reconnectAttempts = 0;
            this.onConnectionChange?.(true);
            
            // 发送认证消息 - 添加状态检查
            if (this.token && this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: 'auth',
                    token: this.token
                }));
            } else if (!this.token) {
                console.error('[WebSocket] 无法发送认证消息：token不存在');
            } else if (this.ws?.readyState !== WebSocket.OPEN) {
                console.error('[WebSocket] 无法发送认证消息：WebSocket 未完全连接');
            }
        };

        this.ws.onclose = (event) => {
            this.isAuthenticated = false;
            this.onAuthChange?.(false);
            this.onConnectionChange?.(false);
            this.handleReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('[WebSocket] 连接错误:', error);
            this.onError?.(`连接错误: ${error instanceof Error ? error.message : '未知错误'}`);
            this.onConnectionChange?.(false);
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as WebSocketMessage;
                console.log('[WebSocket] 收到消息:', message);
                
                switch (message.type) {
                    case 'auth_success':
                        this.isAuthenticated = true;
                        this.onAuthChange?.(true);
                        this.sendQueuedMessages();
                        break;
                        
                    case 'auth_error':
                        this.isAuthenticated = false;
                        this.onAuthChange?.(false);
                        console.error('[WebSocket] 认证失败:', message.message);
                        this.onError?.(`认证失败: ${message.message}`);
                        break;
                        
                    case 'ping':
                        if (this.ws?.readyState === WebSocket.OPEN) {
                            this.ws.send(JSON.stringify({
                                type: 'pong',
                                timestamp: new Date().toISOString()
                            }));
                        }
                        break;
                        
                    case 'pong':
                        this.lastPongTime = Date.now();
                        break;
                        
                    default:
                        this.handleMessage(message);
                        this.onMessage?.(message);
                }
            } catch (error) {
                console.error('[WebSocket] 消息解析错误:', error);
                this.onError?.(`消息解析错误: ${error instanceof Error ? error.message : String(error)}`);
            }
        };
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectTimeout * Math.pow(2, this.reconnectAttempts - 1);
            
            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            console.error('[WebSocket] 达到最大重连次数');
            this.onError?.('达到最大重连次数，请检查网络连接或服务器状态');
        }
    }

    private handleMessage(message: WebSocketMessage) {
        switch (message.type) {
            case 'test':
                console.log('[WebSocket] 收到测试消息:', message.content);
                break;
            case 'chat':
                console.log(`[WebSocket] 收到来自 ${message.sender_name} 的消息: ${message.content}`);
                break;
            case 'notification':
                console.log(`[WebSocket] 收到通知: ${message.content}`);
                break;
            case 'system_notification':
                console.log(`[WebSocket] 收到系统通知: ${message.content}`);
                break;
            case 'error':
                console.error(`[WebSocket] 错误: ${message.message}`);
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

    public sendMessage(type: MessageType, content: string, receiverId?: string) {
        const message: WebSocketMessage = {
            type,
            content,
            timestamp: new Date().toISOString(),
            ...(receiverId && { receiver_id: receiverId })
        };

        if (this.isAuthenticated && this.ws?.readyState === WebSocket.OPEN) {
            console.log('[WebSocket] 发送消息:', message);
            this.ws.send(JSON.stringify(message));
        } else {
            this.messageQueue.push(message);
        }
    }

    public sendTestMessage(content: string) {
        this.sendMessage('test', content);
    }

    public sendPing() {
        this.sendMessage('ping', '');
    }

    public sendChat(content: string, receiverId?: string) {
        this.sendMessage('chat', content, receiverId);
    }

    public sendNotification(content: string, level: 'info' | 'warning' | 'error' = 'info', receiverId?: string) {
        this.sendMessage('notification', content, receiverId);
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