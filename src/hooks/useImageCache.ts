import { useState } from 'react';

export const useImageCache = () => {
  const [cachedUrls] = useState<Set<string>>(new Set());

  const isCacheAPISupported = () => {
    return typeof window !== 'undefined' && 'caches' in window && typeof window.caches === 'object';
  };

  const getCachedImage = async (imageUrl: string): Promise<string> => {
    try {
      if (!isCacheAPISupported()) {
        // console.warn('浏览器不支持 Cache API，将使用浏览器默认缓存机制');
        return imageUrl;
      }

      const cache = await window.caches.open('card-images');
      const cachedResponse = await cache.match(imageUrl);
      
      if (cachedResponse) {
        return imageUrl;
      }

      const response = await fetch(imageUrl);
      await cache.put(imageUrl, response.clone());
      return imageUrl;
    } catch (error) {
      console.error('图片缓存处理失败:', error);
      return imageUrl;
    }
  };

  const handleImageLoad = () => {
    // 图片加载成功时的处理
  };

  return { getCachedImage, handleImageLoad };
}; 