import React from 'react';
import type { ShowCard } from '../types/card';
import { IMAGE_BASE_URL } from '../constants/api';
import { getFirstNonZeroRarityIndex } from '../utils/card/cardUtils';

interface DeckViewProps {
  showCards: ShowCard[];
  onCardClick: (index: number) => void;
}

const DeckView: React.FC<DeckViewProps> = ({
  showCards,
  onCardClick
}) => {
  return (
    <div className="w-[100%] h-full border-l flex flex-col items-center justify-start pt-4 bg-gray-50">
      <div className="grid grid-cols-4 gap-2 w-full px-4">
        {showCards.map((card, idx) => {
          const firstNonZeroIndex = getFirstNonZeroRarityIndex(card);
          return (
            <div 
              key={idx} 
              className="w-16 h-22 border rounded flex items-center justify-center text-gray-500 text-xs bg-white shadow cursor-pointer"
              onClick={() => onCardClick(idx)}
            >
              {card.card_rarity[firstNonZeroIndex]?.card_number ? (
                <img 
                  src={`${IMAGE_BASE_URL}/${card.card_rarity[firstNonZeroIndex].card_number}.jpg`}
                  alt={card.name_cn}
                  className="w-full h-full object-contain rounded-[4%]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.classList.add('text-center');
                    target.parentElement!.textContent = card.name_cn;
                  }}
                />
              ) : (
                <div className="text-center">{card.name_cn}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeckView; 