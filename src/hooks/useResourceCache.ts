import { useCallback } from 'react';
import { resourceLoader } from '../services/resourceLoader';

export const useResourceCache = () => {
  // 获取已加载的资源
  const getResource = useCallback((id: string) => {
    return resourceLoader.getResource(id);
  }, []);

  // 检查资源是否已加载
  const isResourceLoaded = useCallback((id: string) => {
    return resourceLoader.isResourceLoaded(id);
  }, []);

  // 获取卡牌图片URL（优先使用缓存）
  const getCardImageUrl = useCallback((cardId: string, imagePath: string) => {
    // 如果资源已预加载，返回缓存的URL
    if (resourceLoader.isResourceLoaded(cardId)) {
      const cachedImage = resourceLoader.getResource(cardId);
      return cachedImage?.src || getFallbackImageUrl(imagePath);
    }
    
    // 否则返回原始URL
    return getFallbackImageUrl(imagePath);
  }, []);

  // 获取备用图片URL
  const getFallbackImageUrl = useCallback((imagePath: string) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${baseUrl}/api/images/${imagePath}`;
  }, []);

  // 预加载特定卡牌
  const preloadCard = useCallback((cardId: string, imagePath: string) => {
    resourceLoader.addToQueue({
      id: cardId,
      url: getFallbackImageUrl(imagePath),
      type: 'image',
      priority: 2
    });
  }, [getFallbackImageUrl]);

  // 批量预加载卡牌
  const preloadCards = useCallback((cards: Array<{ id: string; image: string }>) => {
    resourceLoader.addCardImages(cards);
  }, []);

  return {
    getResource,
    isResourceLoaded,
    getCardImageUrl,
    preloadCard,
    preloadCards
  };
}; 