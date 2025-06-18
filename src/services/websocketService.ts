export type MessageType = 'auth' | 'auth_success' | 'auth_error' | 'test' | 'ping' | 'pong' | 'chat' | 'notification' | 'system_notification' | 'error';

export interface WebSocketMessage {
    type: MessageType;
    content?: string;
    receiver_id?: string;
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
                console.log('[WebSocket] 连接已存在，无需重新连接');
                return;
            }

            const url = `${this.baseUrl}/ws`;
            console.log('[WebSocket] 开始连接:', {
                url,
                timestamp: new Date().toISOString(),
                readyState: this.ws?.readyState
            });
            
            this.connectionStartTime = Date.now();
            this.ws = new WebSocket(url);
            this.setupEventListeners();
        } catch (error) {
            console.error('[WebSocket] 连接失败:', {
                error,
                timestamp: new Date().toISOString(),
                readyState: this.ws?.readyState
            });
            this.onError?.(`连接失败: ${error instanceof Error ? error.message : String(error)}`);
            this.onConnectionChange?.(false);
        }
    }

    private setupEventListeners() {
        if (!this.ws) return;

        this.ws.onopen = () => {
            const connectionTime = Date.now() - this.connectionStartTime;
            console.log('[WebSocket] 连接已建立', {
                connectionTime: `${connectionTime}ms`,
                timestamp: new Date().toISOString(),
                readyState: this.ws?.readyState
            });
            
            this.reconnectAttempts = 0;
            this.onConnectionChange?.(true);
            
            // 发送认证消息
            if (this.token && this.ws) {
                console.log('[WebSocket] 发送认证消息');
                this.ws.send(JSON.stringify({
                    type: 'auth',
                    token: this.token
                }));
            } else {
                console.error('[WebSocket] 无法发送认证消息：token不存在');
            }
        };

        this.ws.onclose = (event) => {
            const connectionDuration = Date.now() - this.connectionStartTime;
            console.log('[WebSocket] 连接已关闭', {
                code: event.code,
                reason: event.reason,
                wasClean: event.wasClean,
                connectionDuration: `${connectionDuration}ms`,
                timestamp: new Date().toISOString(),
                readyState: this.ws?.readyState,
                lastPongTime: this.lastPongTime ? `${Date.now() - this.lastPongTime}ms ago` : 'never'
            });
            
            // 记录关闭代码的含义
            const closeCodeMeaning = {
                1000: '正常关闭',
                1001: '离开页面',
                1002: '协议错误',
                1003: '不支持的数据',
                1005: '无状态码',
                1006: '异常关闭',
                1007: '数据不一致',
                1008: '违反政策',
                1009: '消息过大',
                1010: '需要扩展',
                1011: '意外情况',
                1012: '服务重启',
                1013: '服务过载',
                1014: '网关超时',
                1015: 'TLS握手失败'
            };
            
            console.log('[WebSocket] 关闭原因:', closeCodeMeaning[event.code as keyof typeof closeCodeMeaning] || '未知原因');
            
            this.isAuthenticated = false;
            this.onAuthChange?.(false);
            this.onConnectionChange?.(false);
            this.handleReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('[WebSocket] 连接错误:', {
                error,
                timestamp: new Date().toISOString(),
                readyState: this.ws?.readyState,
                connectionDuration: `${Date.now() - this.connectionStartTime}ms`
            });
            this.onError?.(`连接错误: ${error instanceof Error ? error.message : '未知错误'}`);
            this.onConnectionChange?.(false);
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as WebSocketMessage;
                console.log('[WebSocket] 收到消息:', {
                    type: message.type,
                    timestamp: new Date().toISOString(),
                    content: message.content,
                    sender: message.sender_name,
                    readyState: this.ws?.readyState
                });
                
                switch (message.type) {
                    case 'auth_success':
                        this.isAuthenticated = true;
                        this.onAuthChange?.(true);
                        console.log('[WebSocket] 认证成功');
                        this.sendQueuedMessages();
                        break;
                        
                    case 'auth_error':
                        this.isAuthenticated = false;
                        this.onAuthChange?.(false);
                        console.error('[WebSocket] 认证失败:', message.message);
                        this.onError?.(`认证失败: ${message.message}`);
                        break;
                        
                    case 'ping':
                        console.log('[WebSocket] 收到ping，发送pong响应');
                        if (this.ws?.readyState === WebSocket.OPEN) {
                            this.ws.send(JSON.stringify({
                                type: 'pong',
                                timestamp: new Date().toISOString()
                            }));
                        }
                        break;
                        
                    case 'pong':
                        this.lastPongTime = Date.now();
                        console.log('[WebSocket] 收到pong响应');
                        break;
                        
                    default:
                        this.handleMessage(message);
                        this.onMessage?.(message);
                }
            } catch (error) {
                console.error('[WebSocket] 消息解析错误:', {
                    error,
                    timestamp: new Date().toISOString(),
                    readyState: this.ws?.readyState
                });
                this.onError?.(`消息解析错误: ${error instanceof Error ? error.message : String(error)}`);
            }
        };
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectTimeout * Math.pow(2, this.reconnectAttempts - 1);
            console.log('[WebSocket] 准备重连:', {
                attempt: this.reconnectAttempts,
                maxAttempts: this.maxReconnectAttempts,
                delay: `${delay}ms`,
                timestamp: new Date().toISOString()
            });
            
            setTimeout(() => {
                console.log('[WebSocket] 开始重连尝试');
                this.connect();
            }, delay);
        } else {
            console.error('[WebSocket] 达到最大重连次数', {
                attempts: this.reconnectAttempts,
                maxAttempts: this.maxReconnectAttempts,
                timestamp: new Date().toISOString()
            });
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
        const queueLength = this.messageQueue.length;
        if (queueLength > 0) {
            console.log('[WebSocket] 发送队列中的消息:', {
                count: queueLength,
                timestamp: new Date().toISOString()
            });
        }
        
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
            console.log('[WebSocket] 发送消息:', {
                type,
                content,
                receiverId,
                timestamp: new Date().toISOString(),
                readyState: this.ws?.readyState
            });
            this.ws.send(JSON.stringify(message));
        } else {
            console.log('[WebSocket] 消息已加入队列:', {
                type,
                content,
                receiverId,
                timestamp: new Date().toISOString(),
                readyState: this.ws?.readyState,
                isAuthenticated: this.isAuthenticated
            });
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
            console.log('[WebSocket] 主动断开连接', {
                timestamp: new Date().toISOString(),
                readyState: this.ws?.readyState,
                connectionDuration: `${Date.now() - this.connectionStartTime}ms`
            });
            this.ws.close();
            this.ws = null;
            this.isAuthenticated = false;
            this.onAuthChange?.(false);
        }
    }
} 