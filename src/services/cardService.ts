import { ShowCard, Card } from '../types/card';
import { API_ENDPOINTS } from '../constants/api';
import { createAuthenticatedRequest } from '../utils/request';
import axios from 'axios';

interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data?: T;
}

interface CardListResponse {
  total: number;
  items: Card[];
}

/**
 * 获取卡牌列表
 * @param params 查询参数
 * @returns 卡牌列表
 */
export const getCards = async (params: {
  page: number;
  page_size: number;
  keyword?: string;
  nation?: string;
  clan?: string;
  grade?: string;
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

    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.CARDS}?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiResponse<CardListResponse> = await response.json();
    if (!data.success) {
      throw new Error(data.message || '获取卡牌列表失败');
    }
    
    return data.data?.items || [];
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
    if (cardIds.length === 0) {
      return [];
    }
    const uniqueIds = [...new Set(cardIds)];
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.CARDS}/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        card_ids: uniqueIds
      })
    });
    const data: ApiResponse<CardListResponse> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取卡片信息失败');
    }
    
    return data.data?.items || [];
  } catch (error) {
    console.error('批量获取卡片信息失败:', error);
    throw error;
  }
};

/**
 * 获取卡片列表
 * @param params 查询参数
 * @returns 卡片列表
 */
export const getCardsList = async (params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  clan?: string;
  type?: string;
  grade?: number;
  power?: number;
  shield?: number;
  trigger?: string;
  effect?: string;
  flavor?: string;
  illustrator?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ cards: Card[]; total: number }> => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.CARDS}?${queryParams.toString()}`);
    const data: ApiResponse<CardListResponse> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取卡片列表失败');
    }
    
    return {
      cards: data.data?.items || [],
      total: data.data?.total || 0
    };
  } catch (error) {
    console.error('获取卡片列表失败:', error);
    throw error;
  }
};

/**
 * 获取卡片详情
 * @param cardId 卡片ID
 * @returns 卡片详情
 */
export const getCardById = async (cardId: string): Promise<Card> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.CARDS}/${cardId}`);
    const data: ApiResponse<Card> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取卡片详情失败');
    }
    
    return data.data!;
  } catch (error) {
    console.error('获取卡片详情失败:', error);
    throw error;
  }
};

/**
 * 获取卡片图片
 * @param cardId 卡片ID
 * @returns 卡片图片的Blob
 */
export const getCardImage = async (cardId: string): Promise<Blob> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.CARDS}/${cardId}/image`);
    const data: ApiResponse<Blob> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取卡片图片失败');
    }
    
    return data.data!;
  } catch (error) {
    console.error('获取卡片图片失败:', error);
    throw error;
  }
};

/**
 * 获取卡片图片URL
 * @param cardId 卡片ID
 * @returns 卡片图片URL
 */
export const getCardImageUrl = (cardId: string): string => {
  return `${API_ENDPOINTS.CARDS}/${cardId}/image`;
};

/**
 * 获取卡片统计信息
 * @returns 卡片统计信息
 */
export const getCardStats = async (): Promise<{
  total: number;
  byClan: Record<string, number>;
  byType: Record<string, number>;
  byGrade: Record<number, number>;
  byTrigger: Record<string, number>;
}> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.CARDS}/stats`);
    const data: ApiResponse<{
      total: number;
      byClan: Record<string, number>;
      byType: Record<string, number>;
      byGrade: Record<number, number>;
      byTrigger: Record<string, number>;
    }> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取卡片统计信息失败');
    }
    
    return data.data!;
  } catch (error) {
    console.error('获取卡片统计信息失败:', error);
    throw error;
  }
};

/**
 * 获取卡片搜索建议
 * @param keyword 关键词
 * @returns 搜索建议列表
 */
export const getCardSuggestions = async (keyword: string): Promise<string[]> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.CARDS}/suggestions?keyword=${encodeURIComponent(keyword)}`);
    const data: ApiResponse<string[]> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取卡片搜索建议失败');
    }
    
    return data.data || [];
  } catch (error) {
    console.error('获取卡片搜索建议失败:', error);
    throw error;
  }
};

/**
 * 获取卡片版本历史
 * @param cardId 卡片ID
 * @returns 版本历史列表
 */
export const getCardVersionHistory = async (cardId: string): Promise<{
  version: number;
  changes: string;
  updated_at: string;
}[]> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.CARDS}/${cardId}/history`);
    const data: ApiResponse<{
      version: number;
      changes: string;
      updated_at: string;
    }[]> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取卡片版本历史失败');
    }
    
    return data.data || [];
  } catch (error) {
    console.error('获取卡片版本历史失败:', error);
    throw error;
  }
};

/**
 * 获取卡片相关卡片
 * @param cardId 卡片ID
 * @returns 相关卡片列表
 */
export const getRelatedCards = async (cardId: string): Promise<Card[]> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.CARDS}/${cardId}/related`);
    const data: ApiResponse<CardListResponse> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取相关卡片失败');
    }
    
    return data.data?.items || [];
  } catch (error) {
    console.error('获取相关卡片失败:', error);
    throw error;
  }
};

/**
 * 获取卡片使用统计
 * @param cardId 卡片ID
 * @returns 使用统计信息
 */
export const getCardUsageStats = async (cardId: string): Promise<{
  total_decks: number;
  popularity: number;
  win_rate: number;
  by_clan: Record<string, number>;
  by_grade: Record<number, number>;
}> => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.CARDS}/${cardId}/usage`);
    const data: ApiResponse<{
      total_decks: number;
      popularity: number;
      win_rate: number;
      by_clan: Record<string, number>;
      by_grade: Record<number, number>;
    }> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取卡片使用统计失败');
    }
    
    return data.data!;
  } catch (error) {
    console.error('获取卡片使用统计失败:', error);
    throw error;
  }
};

export const saveCardAbility = async (id: string, ability: Record<string, any>) => {
  try {
    const response = await createAuthenticatedRequest(`${API_ENDPOINTS.CARDS}/abilities`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        ability
      })
    });
    const data: ApiResponse<any> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '保存技能配置失败');
    }
    
    return data.data;
  } catch (error) {
    console.error('保存技能配置失败:', error);
    throw error;
  }
}; 