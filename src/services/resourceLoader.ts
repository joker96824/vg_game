interface PreloadItem {
  id: string;
  url: string;
  type: 'image' | 'audio' | 'json';
  priority?: number;
}

interface PreloadProgress {
  total: number;
  loaded: number;
  failed: number;
  currentItem?: string;
}

class ResourceLoader {
  private preloadQueue: PreloadItem[] = [];
  private loadedResources = new Map<string, any>();
  private loading = false;
  private onProgress?: (progress: PreloadProgress) => void;
  private onComplete?: () => void;
  private onError?: (error: string) => void;

  // 添加预加载项
  addToQueue(item: PreloadItem) {
    this.preloadQueue.push(item);
  }

  // 批量添加卡牌图片
  addCardImages(cards: Array<{ id: string; image: string }>) {
    cards.forEach(card => {
      this.addToQueue({
        id: card.id,
        url: this.getCardImageUrl(card.image),
        type: 'image',
        priority: 1
      });
    });
  }

  // 获取卡牌图片URL
  private getCardImageUrl(imagePath: string): string {
    // 使用与项目中相同的图片URL生成逻辑
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${baseUrl}/api/images/${imagePath}`;
  }

  // 开始预加载
  async startPreload() {
    if (this.loading) return;
    
    this.loading = true;
    const progress: PreloadProgress = {
      total: this.preloadQueue.length,
      loaded: 0,
      failed: 0
    };

    // 按优先级排序
    this.preloadQueue.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const item of this.preloadQueue) {
      try {
        progress.currentItem = item.id;
        this.onProgress?.(progress);

        const resource = await this.loadResource(item);
        this.loadedResources.set(item.id, resource);
        progress.loaded++;
        
        this.onProgress?.(progress);
        
        // 添加小延迟避免阻塞UI
        await new Promise(resolve => setTimeout(resolve, 10));
        
      } catch (error) {
        console.error(`Failed to load resource: ${item.id}`, error);
        progress.failed++;
        this.onProgress?.(progress);
      }
    }

    this.loading = false;
    this.onComplete?.();
  }

  // 加载单个资源
  private async loadResource(item: PreloadItem): Promise<any> {
    switch (item.type) {
      case 'image':
        return this.loadImage(item.url);
      case 'audio':
        return this.loadAudio(item.url);
      case 'json':
        return this.loadJson(item.url);
      default:
        throw new Error(`Unsupported resource type: ${item.type}`);
    }
  }

  // 加载图片
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  // 加载音频
  private loadAudio(url: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
      audio.src = url;
    });
  }

  // 加载JSON
  private async loadJson(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${url}`);
    }
    return response.json();
  }

  // 获取已加载的资源
  getResource(id: string): any {
    return this.loadedResources.get(id);
  }

  // 检查资源是否已加载
  isResourceLoaded(id: string): boolean {
    return this.loadedResources.has(id);
  }

  // 设置进度回调
  onProgressCallback(callback: (progress: PreloadProgress) => void) {
    this.onProgress = callback;
  }

  // 设置完成回调
  onCompleteCallback(callback: () => void) {
    this.onComplete = callback;
  }

  // 设置错误回调
  onErrorCallback(callback: (error: string) => void) {
    this.onError = callback;
  }

  // 清空队列
  clearQueue() {
    this.preloadQueue = [];
    this.loadedResources.clear();
  }

  // 获取加载状态
  getLoadingStatus(): boolean {
    return this.loading;
  }
}

// 创建单例实例
export const resourceLoader = new ResourceLoader(); 