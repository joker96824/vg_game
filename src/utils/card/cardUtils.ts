import type { ShowCard } from '../../types/card';

export const getFirstNonZeroRarityIndex = (card: ShowCard): number => {
  const index = card.card_rarity.findIndex(r => (r.quantity || 0) > 0);
  return index !== -1 ? index : 0;
}; 