import { IMAGE_BASE_URL } from '../constants/api';
import defaultAvatar from '../assets/default-avatar.png';

/**
 * 生成头像URL
 * @param avatar 头像文件名
 * @returns 完整的头像URL
 */
export const getAvatarUrl = (avatar: string | null | undefined): string => {
  if (!avatar) return defaultAvatar;
  return `${IMAGE_BASE_URL}/avatars/${avatar}`;
};

/**
 * 处理图片加载错误，显示默认图片
 * @param e 图片加载错误事件
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  target.src = defaultAvatar;
};

/**
 * 生成卡牌图片URL
 * @param image 卡牌图片文件名
 * @returns 完整的卡牌图片URL
 */
export const getCardImageUrl = (image: string | null | undefined): string => {
  if (!image) return '';
  return `${IMAGE_BASE_URL}/vg_image/${image}.jpg`;
}; 