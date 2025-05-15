import React, { useRef } from 'react';
import type { Card } from '../types/card';
import { IMAGE_BASE_URL } from '../constants/api';

interface CardListProps {
  cards: Card[];
  loading: boolean;
  hasMore: boolean;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onCardClick: (index: number) => void;
  getCachedImage: (imageUrl: string) => Promise<string>;
}

const CardList: React.FC<CardListProps> = ({
  cards,
  loading,
  hasMore,
  onScroll,
  onCardClick,
  getCachedImage
}) => {
  const cardListRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-[70%] h-full flex flex-col items-center justify-center">
      <div
        className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2"
        ref={cardListRef}
        onScroll={onScroll}
      >
        <div className="grid grid-cols-5 gap-4 py-4">
          {cards.map((card, idx) => (
            <div 
              key={card.id} 
              className="w-36 h-52 flex flex-col items-center justify-center text-gray-700 text-base bg-transparent cursor-pointer"
              onClick={() => onCardClick(idx)}
            >
              {card.rarity_infos?.[0]?.card_number ? (
                <img 
                  src={`${IMAGE_BASE_URL}/${card.rarity_infos[0].card_number}.jpg`}
                  alt={card.name_cn}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.classList.add('text-center');
                  }}
                  onLoad={async (e) => {
                    const target = e.target as HTMLImageElement;
                    const imageUrl = target.src;
                    const cachedUrl = await getCachedImage(imageUrl);
                    if (cachedUrl !== imageUrl) {
                      target.src = cachedUrl;
                    }
                  }}
                />
              ) : (
                <div className="text-center">
                  <div className="font-bold">{card.name_cn}</div>
                  <div className="text-xs mt-1">{card.card_type}</div>
                  <div className="text-xs mt-1">{card.card_power}</div>
                </div>
              )}
            </div>
          ))}
        </div>
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardList; 