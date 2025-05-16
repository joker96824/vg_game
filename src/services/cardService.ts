import { ShowCard, Card } from '../types/card';
import { API_ENDPOINTS } from '../constants/api';

/**
 * 搜索卡牌
 * @param searchTerm 搜索关键词
 * @returns 搜索结果
 */
export const searchCards = async (searchTerm: string): Promise<ShowCard[]> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.CARDS}/search?term=${encodeURIComponent(searchTerm)}`);
    if (!response.ok) {
      throw new Error('搜索请求失败');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('搜索卡牌时出错:', error);
    throw error;
  }
};

/**
 * 获取卡牌列表
 * @param params 查询参数
 * @returns 卡牌列表
 */
export const getCards = async (params: {
  page?: number;
  page_size?: number;
  keyword?: string;
  nation?: string;
  clan?: string;
  grade?: number;
  skill?: string;
  card_power_min?: number;
  card_power_max?: number;
  shield?: number;
  card_type?: string;
  trigger_type?: string;
  package?: string;
}): Promise<Card[]> => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_ENDPOINTS.CARDS}?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('获取卡牌列表失败');
    }
    return await response.json();
  } catch (error) {
    console.error('获取卡牌列表时出错:', error);
    throw error;
  }
};

/**
 * 获取指定卡牌详情
 * @param cardIds 卡牌ID数组
 * @returns 卡牌详情列表
 */
export const getCardsByIds = async (cardIds: string[]): Promise<Card[]> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.CARDS}/${cardIds.join(',')}`);
    if (!response.ok) {
      throw new Error('获取卡牌详情失败');
    }
    return await response.json();
  } catch (error) {
    console.error('获取卡牌详情时出错:', error);
    throw error;
  }
}; 