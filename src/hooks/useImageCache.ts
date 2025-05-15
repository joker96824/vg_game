import { useState } from 'react';

export const useImageCache = () => {
  const [cachedUrls] = useState<Set<string>>(new Set());

  const getCachedImage = async (imageUrl: string): Promise<string> => {
    try {
      const cache = await caches.open('card-images');
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