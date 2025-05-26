// 声明 Cache API 类型
declare global {
    interface Window {
      caches?: CacheStorage;
    }
  }
  
  class ImageCache {
    private static instance: ImageCache;
    private cacheName: string = 'card-images';
    private cacheSupported: boolean;
  
    private constructor() {
      this.cacheSupported = this.isCacheAPISupported();
    }
  
    public static getInstance(): ImageCache {
      if (!ImageCache.instance) {
        ImageCache.instance = new ImageCache();
      }
      return ImageCache.instance;
    }
  
    private isCacheAPISupported(): boolean {
      return typeof window !== 'undefined' && 'caches' in window && typeof window.caches === 'object';
    }
  
    /**
     * 获取缓存的图片URL
     * @param imageUrl 原始图片URL
     * @returns 返回图片URL（如果缓存失败则返回原始URL）
     */
    public getCachedImage = async (imageUrl: string): Promise<string> => {
      try {
        if (!this.cacheSupported) {
          console.warn('浏览器不支持 Cache API，将使用浏览器默认缓存机制');
          return imageUrl;
        }
  
        const cache = await window.caches?.open(this.cacheName);
        if (!cache) {
          console.warn('无法打开缓存，将使用浏览器默认缓存机制');
          return imageUrl;
        }
  
        const cachedResponse = await cache.match(imageUrl);
        if (cachedResponse) {
          return imageUrl;
        }
  
        try {
          const response = await fetch(imageUrl);
          if (response.ok) {
            await cache.put(imageUrl, response.clone());
          }
          return imageUrl;
        } catch (fetchError) {
          console.error('获取或缓存图片失败:', fetchError);
          return imageUrl;
        }
      } catch (error) {
        console.error('图片缓存处理失败:', error);
        return imageUrl;
      }
    }
  
    /**
     * 处理图片加载完成事件
     * @param imageUrl 图片URL
     */
    public handleImageLoad = async (imageUrl: string): Promise<void> => {
      try {
        if (this.cacheSupported) {
          const cache = await window.caches?.open(this.cacheName);
          if (cache) {
            const response = await fetch(imageUrl);
            if (response.ok) {
              await cache.put(imageUrl, response.clone());
            }
          }
        }
      } catch (error) {
        console.error('图片缓存保存失败:', error);
      }
    }
  
    /**
     * 清除所有缓存的图片
     */
    public clearCache = async (): Promise<void> => {
      try {
        if (this.cacheSupported) {
          await window.caches?.delete(this.cacheName);
        }
      } catch (error) {
        console.error('清除缓存失败:', error);
      }
    }
  
    /**
     * 获取缓存状态
     */
    public isSupported = (): boolean => {
      return this.cacheSupported;
    }
  }
  
  export const imageCache = ImageCache.getInstance(); 