import React, { useRef } from 'react';
import type { Card } from '../types/card';
import { IMAGE_BASE_URL } from '../constants/api';
import { getCardImageUrl, handleCardImageError } from '../utils/image/imageUtils';

interface CardListProps {
  cards: Card[];
  loading: boolean;
  hasMore: boolean;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onCardClick: (idx: number) => void;
  getCachedImage: (imageUrl: string) => Promise<string>;
  isMobile?: boolean;
}

const CardList: React.FC<CardListProps> = ({
  cards,
  loading,
  hasMore,
  onScroll,
  onCardClick,
  getCachedImage,
  isMobile = false
}) => {
  const cardListRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      className={`card-list-container ${isMobile ? 'w-full' : 'w-[70%]'} overflow-y-auto custom-scrollbar`}
      onScroll={onScroll}
    >
      <div className={`grid ${isMobile ? 'grid-cols-4' : 'grid-cols-5'} gap-0 p-0`}>
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="relative cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onCardClick(index)}
          >
            <img
              src={getCardImageUrl(card.rarity_infos?.[0]?.card_number)}
              alt={card.name_cn}
              className="w-full h-auto object-contain rounded border border-gray-200"
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                getCachedImage(target.src);
                target.style.aspectRatio = `${target.naturalWidth} / ${target.naturalHeight}`;
              }}
              onError={handleCardImageError}
            />
          </div>
        ))}
      </div>
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default CardList; 