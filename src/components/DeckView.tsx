import React from 'react';
import type { ShowCard } from '../types/card';
import { IMAGE_BASE_URL } from '../constants/api';
import { getFirstNonZeroRarityIndex } from '../utils/card/cardUtils';

interface DeckViewProps {
  showCards: ShowCard[];
  onCardClick: (idx: number) => void;
  isMobile?: boolean;
}

const DeckView: React.FC<DeckViewProps> = ({ showCards, onCardClick, isMobile = false }) => {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-4'} gap-0 p-0`}>
        {showCards.map((card, index) => (
          <div
            key={`${card.id}-${index}`}
            className="relative cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onCardClick(index)}
          >
            <img
              src={`${IMAGE_BASE_URL}/${card.card_rarity[0]?.card_number}.jpg`}
              alt={card.name_cn}
              className="w-full h-auto object-contain rounded border border-gray-200"
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
              }}
            />
            {card.card_rarity[0]?.quantity > 1 && (
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                {card.card_rarity[0].quantity}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeckView; 