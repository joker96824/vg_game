import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select, { components } from 'react-select';
import type { Card } from '../types/card';
import axios from 'axios';
import Slider from '@mui/material/Slider';
import MinusIcon from '../assets/minus.svg';
import PlusIcon from '../assets/plus.svg';

// 选项数据
const nationOptions = [
  { value: 'CoroCoro', label: 'CoroCoro' },
  { value: '王冠圣域', label: '王冠圣域' },
  { value: '基元', label: '基元' },
  { value: '卟啵电竞', label: '卟啵电竞' },
  { value: '圣律诗院', label: '圣律诗院' },
  { value: '刀剑乱舞', label: '刀剑乱舞' },
  { value: '龙族帝国', label: '龙族帝国' },
  { value: '暗邦', label: '暗邦' },
  { value: '布兰特之门', label: '布兰特之门' },
  { value: '通灵王', label: '通灵王' },
  { value: '终末的女武神', label: '终末的女武神' },
  { value: '怪物弹珠', label: '怪物弹珠' },
  { value: 'BanG Dream', label: 'BanG Dream' }
];

const clanOptions = [
  { value: 'Afterglow', label: 'Afterglow' },
  { value: 'Ave Mujica', label: 'Ave Mujica' },
  { value: 'Black Channel', label: 'Black Channel' },
  { value: 'CoroCoro Comic', label: 'CoroCoro Comic' },
  { value: 'CRYCHIC', label: 'CRYCHIC' },
  { value: 'Hello, Happy World!', label: 'Hello, Happy World!' },
  { value: 'hololive', label: 'hololive' },
  { value: 'Morfonica', label: 'Morfonica' },
  { value: 'MyGO!!!!!', label: 'MyGO!!!!!' },
  { value: 'Pastel＊Palettes', label: 'Pastel＊Palettes' },
  { value: 'Poppin\'Party', label: 'Poppin\'Party' },
  { value: 'RAISE A SUILEN', label: 'RAISE A SUILEN' },
  { value: 'RoRo', label: 'RoRo' },
  { value: 'Roselia', label: 'Roselia' },
  { value: '五胞胎', label: '五胞胎' },
  { value: '亚人', label: '亚人' },
  { value: '人类', label: '人类' },
  { value: '人類', label: '人類' },
  { value: '人鱼', label: '人鱼' },
  { value: '作业机器人', label: '作业机器人' },
  { value: '僵尸', label: '僵尸' },
  { value: '元素精灵', label: '元素精灵' },
  { value: '共心龙', label: '共心龙' },
  { value: '兽', label: '兽' },
  { value: '兽人', label: '兽人' },
  { value: '冈萨雷斯', label: '冈萨雷斯' },
  { value: '刀剑男士-剑', label: '刀剑男士-剑' },
  { value: '刀剑男士-大太刀', label: '刀剑男士-大太刀' },
  { value: '刀剑男士-太刀', label: '刀剑男士-太刀' },
  { value: '刀剑男士-打刀', label: '刀剑男士-打刀' },
  { value: '刀剑男士-枪', label: '刀剑男士-枪' },
  { value: '刀剑男士-短刀', label: '刀剑男士-短刀' },
  { value: '刀剑男士-胁差', label: '刀剑男士-胁差' },
  { value: '刀剑男士-薙刀', label: '刀剑男士-薙刀' },
  { value: '半鱼人', label: '半鱼人' },
  { value: '危险爷爷', label: '危险爷爷' },
  { value: '合成兽', label: '合成兽' },
  { value: '吸血鬼', label: '吸血鬼' },
  { value: '命运的卷回士', label: '命运的卷回士' },
  { value: '圣骑士', label: '圣骑士' },
  { value: '地龙', label: '地龙' },
  { value: '外星', label: '外星' },
  { value: '外星人', label: '外星人' },
  { value: '夜影兵', label: '夜影兵' },
  { value: '大杉大同学', label: '大杉大同学' },
  { value: '天使', label: '天使' },
  { value: '天骑', label: '天骑' },
  { value: '女武神', label: '女武神' },
  { value: '女魅魔', label: '女魅魔' },
  { value: '妖精', label: '妖精' },
  { value: '宇宙', label: '宇宙' },
  { value: '宇宙龙', label: '宇宙龙' },
  { value: '守月人', label: '守月人' },
  { value: '巨人', label: '巨人' },
  { value: '幻兽', label: '幻兽' },
  { value: '幻妖', label: '幻妖' },
  { value: '幻真兽', label: '幻真兽' },
  { value: '幽灵', label: '幽灵' },
  { value: '恐暴龙', label: '恐暴龙' },
  { value: '恶魔', label: '恶魔' },
  { value: '悠闲猫', label: '悠闲猫' },
  { value: '战斗机器人', label: '战斗机器人' },
  { value: '护身符', label: '护身符' },
  { value: '救世主', label: '救世主' },
  { value: '时尚魔女', label: '时尚魔女' },
  { value: '昆虫', label: '昆虫' },
  { value: '机械', label: '机械' },
  { value: '树精灵', label: '树精灵' },
  { value: '森林龙', label: '森林龙' },
  { value: '植培种', label: '植培种' },
  { value: '植物', label: '植物' },
  { value: '武士', label: '武士' },
  { value: '水生种', label: '水生种' },
  { value: '汞螅郁蛇', label: '汞螅郁蛇' },
  { value: '泪龙', label: '泪龙' },
  { value: '流电龙', label: '流电龙' },
  { value: '深渊龙', label: '深渊龙' },
  { value: '火精灵', label: '火精灵' },
  { value: '灵', label: '灵' },
  { value: '炎龙', label: '炎龙' },
  { value: '甲虫', label: '甲虫' },
  { value: '电子兽', label: '电子兽' },
  { value: '电子妖精', label: '电子妖精' },
  { value: '电子改造体', label: '电子改造体' },
  { value: '电子魔像', label: '电子魔像' },
  { value: '电子龙', label: '电子龙' },
  { value: '祈装龙', label: '祈装龙' },
  { value: '神', label: '神' },
  { value: '空间龙', label: '空间龙' },
  { value: '精灵', label: '精灵' },
  { value: '翼龙', label: '翼龙' },
  { value: '自然龙', label: '自然龙' },
  { value: '舞罗主疾', label: '舞罗主疾' },
  { value: '草莓王子', label: '草莓王子' },
  { value: '贝贝贝贝宝贝', label: '贝贝贝贝宝贝' },
  { value: '贵族', label: '贵族' },
  { value: '轴心国', label: '轴心国' },
  { value: '通灵人', label: '通灵人' },
  { value: '野性龙', label: '野性龙' },
  { value: '银河人', label: '银河人' },
  { value: '雷龙', label: '雷龙' },
  { value: '风精灵', label: '风精灵' },
  { value: '风龙', label: '风龙' },
  { value: '食人魔', label: '食人魔' },
  { value: '马', label: '马' },
  { value: '骨', label: '骨' },
  { value: '骨骸', label: '骨骸' },
  { value: '高等兽', label: '高等兽' },
  { value: '魔', label: '魔' },
  { value: '魔人', label: '魔人' },
  { value: '魔像', label: '魔像' },
  { value: '魔王', label: '魔王' },
  { value: '齿轮兽', label: '齿轮兽' },
  { value: '齿轮巨兵', label: '齿轮巨兵' },
  { value: '齿轮改造体', label: '齿轮改造体' },
  { value: '齿轮龙', label: '齿轮龙' },
  { value: '龙', label: '龙' },
  { value: '龙人', label: '龙人' },
  { value: '龙化种', label: '龙化种' },
  { value: '龙的同伴', label: '龙的同伴' }
];

const gradeOptions = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 10, label: '10' },
  { value: 11, label: '11' }
];

const skillOptions = [
  { value: '截击', label: '截击' },
  { value: '支援', label: '支援' },
  { value: '双判', label: '双判' },
  { value: '三判', label: '三判' }
];

const shieldOptions = [
  { value: 5000, label: '5000' },
  { value: 10000, label: '10000' },
  { value: 15000, label: '15000' },
  { value: 50000, label: '50000' }
];

const typeOptions = [
  { value: 'G单位', label: 'G单位' },
  { value: 'RIDE卡组纹章', label: 'RIDE卡组纹章' },
  { value: '普通单位', label: '普通单位' },
  { value: '普通指令', label: '普通指令' },
  { value: '标记', label: '标记' },
  { value: '纹章', label: '纹章' },
  { value: '能量', label: '能量' },
  { value: '衍生物单位', label: '衍生物单位' },
  { value: '衍生物设置指令', label: '衍生物设置指令' },
  { value: '触发单位', label: '触发单位' },
  { value: '触发指令', label: '触发指令' },
  { value: '设置指令', label: '设置指令' },
  { value: '闪现指令', label: '闪现指令' }
];

const triggerOptions = [
  { value: '前', label: '前' },
  { value: '☆', label: '☆' },
  { value: '引', label: '引' },
  { value: '治', label: '治' },
  { value: '超', label: '超' }
];

const packOptions = [
  { value: 'CP', label: 'CP' },
  { value: 'D-BT01', label: 'D-BT01' },
  { value: 'D-BT02', label: 'D-BT02' },
  { value: 'D-BT03', label: 'D-BT03' },
  { value: 'D-BT04', label: 'D-BT04' },
  { value: 'D-BT05', label: 'D-BT05' },
  { value: 'D-BT06', label: 'D-BT06' },
  { value: 'D-BT07', label: 'D-BT07' },
  { value: 'D-BT08', label: 'D-BT08' },
  { value: 'D-BT09', label: 'D-BT09' },
  { value: 'D-BT10', label: 'D-BT10' },
  { value: 'D-BT11', label: 'D-BT11' },
  { value: 'D-BT12', label: 'D-BT12' },
  { value: 'D-BT13', label: 'D-BT13' },
  { value: 'D-LBT01', label: 'D-LBT01' },
  { value: 'D-LBT02', label: 'D-LBT02' },
  { value: 'D-LBT03', label: 'D-LBT03' },
  { value: 'D-LBT04', label: 'D-LBT04' },
  { value: 'D-LTD01', label: 'D-LTD01' },
  { value: 'D-PR', label: 'D-PR' },
  { value: 'D-SD06', label: 'D-SD06' },
  { value: 'D-SS01', label: 'D-SS01' },
  { value: 'D-SS02', label: 'D-SS02' },
  { value: 'D-SS05', label: 'D-SS05' },
  { value: 'D-SS06', label: 'D-SS06' },
  { value: 'D-SS07', label: 'D-SS07' },
  { value: 'D-SS08', label: 'D-SS08' },
  { value: 'D-SS09', label: 'D-SS09' },
  { value: 'D-SS10', label: 'D-SS10' },
  { value: 'D-SS11', label: 'D-SS11' },
  { value: 'D-TB01', label: 'D-TB01' },
  { value: 'D-TB02', label: 'D-TB02' },
  { value: 'D-TB03', label: 'D-TB03' },
  { value: 'D-TB04', label: 'D-TB04' },
  { value: 'D-TB05', label: 'D-TB05' },
  { value: 'D-TB06', label: 'D-TB06' },
  { value: 'D-TB07', label: 'D-TB07' },
  { value: 'D-TD01', label: 'D-TD01' },
  { value: 'D-TD02', label: 'D-TD02' },
  { value: 'D-TD03', label: 'D-TD03' },
  { value: 'D-TTD01', label: 'D-TTD01' },
  { value: 'D-TTD02', label: 'D-TTD02' },
  { value: 'D-TTD03', label: 'D-TTD03' },
  { value: 'D-TTD04', label: 'D-TTD04' },
  { value: 'D-TTD05', label: 'D-TTD05' },
  { value: 'DZ-BT01', label: 'DZ-BT01' },
  { value: 'DZ-BT02', label: 'DZ-BT02' },
  { value: 'DZ-BT03', label: 'DZ-BT03' },
  { value: 'DZ-BT04', label: 'DZ-BT04' },
  { value: 'DZ-BT05', label: 'DZ-BT05' },
  { value: 'DZ-BT06', label: 'DZ-BT06' },
  { value: 'DZ-BT07', label: 'DZ-BT07' },
  { value: 'DZ-BT08', label: 'DZ-BT08' },
  { value: 'DZ-LBT01', label: 'DZ-LBT01' },
  { value: 'DZ-SD01', label: 'DZ-SD01' },
  { value: 'DZ-SD02', label: 'DZ-SD02' },
  { value: 'DZ-SD03', label: 'DZ-SD03' },
  { value: 'DZ-SD04', label: 'DZ-SD04' },
  { value: 'DZ-SD05', label: 'DZ-SD05' },
  { value: 'DZ-SD06', label: 'DZ-SD06' },
  { value: 'DZ-SS01', label: 'DZ-SS01' },
  { value: 'DZ-SS02', label: 'DZ-SS02' },
  { value: 'DZ-SS03', label: 'DZ-SS03' },
  { value: 'DZ-SS04', label: 'DZ-SS04' },
  { value: 'DZ-SS07', label: 'DZ-SS07' },
  { value: 'DZ-SS08', label: 'DZ-SS08' },
  { value: 'DZ-SS09', label: 'DZ-SS09' },
  { value: 'DZ-SS10', label: 'DZ-SS10' }
];

// 自定义 Option 组件
const CustomOption = (props: any) => (
  <components.Option {...props}>
    <div className="flex items-center">
      <span
        className={`inline-block w-4 h-4 mr-2 border rounded-sm flex items-center justify-center text-xs
          ${props.isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300'}
        `}
      >
        {props.isSelected ? '✔' : ''}
      </span>
      <span className="text-xs">{props.label}</span>
    </div>
  </components.Option>
);

// 自定义 MenuList 组件：已选项显示在顶部
const CustomMenuList = (props: any) => {
  const { options, children, selectProps } = props;
  const selected = selectProps.value || [];
  return (
    <div>
      {selected.length > 0 && (
        <div className="px-2 py-1 border-b bg-gray-50">
          <div className="text-xs text-gray-500 mb-1">已选 {selected.length} 项:</div>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
            {selected.map((item: any) => (
              <button 
                key={item.value} 
                className="flex items-center border rounded px-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                onClick={(e) => {
                  e.stopPropagation();
                  selectProps.onChange(
                    selected.filter((sel: any) => sel.value !== item.value),
                    { action: 'remove-value', removedValue: item }
                  );
                }}
              >
                <span className="truncate max-w-xs">{item.label}</span>
                <span className="ml-1 text-blue-500 hover:text-blue-700">×</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <components.MenuList {...props}>{children}</components.MenuList>
    </div>
  );
};

const customSelectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: 24,
    height: 24,
    fontSize: 12,
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: '0 4px',
    minHeight: 24,
    height: 24,
    flexWrap: 'wrap',
    overflow: 'hidden',
  }),
  input: (base: any) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  indicatorsContainer: (base: any) => ({
    ...base,
    height: 24,
  }),
  multiValue: (base: any) => ({
    ...base,
    maxWidth: '80px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  option: (base: any) => ({
    ...base,
    fontSize: 12,
    minHeight: 24,
    height: 24,
    paddingTop: 2,
    paddingBottom: 2,
  }),
  menu: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
};

interface DeckCard {
  id: string;
  card_id: string;
  image: string;
  quantity?: number;
  create_time: string;
  deck_id: string;
  deck_zone: string;
  is_deleted: boolean;
  position: number;
  remark: string;
  update_time: string;
}

interface Deck {
  id: string;
  deck_name: string;
  deck_cards: DeckCard[];
  deck_description?: string;
  is_public?: boolean;
  is_official?: boolean;
  preset?: number;
  deck_version?: number;
  remark?: string;
}

interface ShowCard extends Card {
  card_rarity: Array<{
    card_number: string;
    quantity: number;
  }>;
}

const uuid = () => {
  // 简单UUID生成（仅前端临时用，后端保存时可替换）
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const CardBrowser: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [nation, setNation] = useState<any>(null);
  const [clan, setClan] = useState<any>(null);
  const [grade, setGrade] = useState<any>(null);
  const [skill, setSkill] = useState<any>(null);
  const [cardPowerRange, setCardPowerRange] = useState<number[]>([0, 20000]);
  const [shield, setShield] = useState<any>(null);
  const [cardType, setCardType] = useState<any>(null);
  const [triggerType, setTriggerType] = useState<any>(null);
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [cardsData, setCardsData] = useState<Card[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const deckData = location.state?.deck as Deck | undefined;
  const cardListRef = useRef<HTMLDivElement>(null);
  const [cachedUrls] = useState<Set<string>>(new Set());
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [modalCardIndex, setModalCardIndex] = useState<number | null>(null);
  const [modalType, setModalType] = useState<'left' | 'right' | null>(null); // 区分左右
  const [modalRarityIndex, setModalRarityIndex] = useState<number>(0); // 当前卡片的稀有度索引
  const [localDeckCards, setLocalDeckCards] = useState(deckData?.deck_cards ? JSON.parse(JSON.stringify(deckData.deck_cards)) : []);
  const [showCards, setShowCards] = useState<ShowCard[]>([]);
  const [saving, setSaving] = useState(false);

  // 获取卡牌数据
  const fetchCards = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://118.25.45.131:8000/api/v1/cards`, {
        params: {
          page: pageNum,
          page_size: 20,
          keyword,
          nation: nation?.value,
          clan: clan?.value,
          grade: grade?.value,
          skill: skill?.value,
          card_power_min: cardPowerRange[0],
          card_power_max: cardPowerRange[1],
          shield: shield?.value,
          card_type: cardType?.value,
          trigger_type: triggerType?.value,
          package: selectedPack?.value
        }
      });
      
      if (pageNum === 1) {
        setCards(response.data);
      } else {
        setCards(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.data.length === 20);
    } catch (error) {
      console.error('获取卡牌数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchCards(1);
  }, []);

  // 筛选条件清空
  const handleClear = () => {
    setKeyword('');
    setNation(null);
    setClan(null);
    setGrade(null);
    setSkill(null);
    setCardPowerRange([0, 20000]);
    setShield(null);
    setCardType(null);
    setTriggerType(null);
    setSelectedPack(null);
    setPage(1);
    fetchCards(1);
  };

  // 筛选条件搜索
  const handleSearch = () => {
    setPage(1);
    fetchCards(1);
  };

  // 处理力量值范围变化
  const handleCardPowerChange = (event: Event, newValue: number | number[]) => {
    setCardPowerRange(newValue as number[]);
  };

  // 无限滚动加载更多
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10 && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCards(nextPage);
    }
  };

  // 图片缓存处理
  const getCachedImage = async (imageUrl: string): Promise<string> => {
    try {
      // 尝试从缓存中获取图片
      const cache = await caches.open('card-images');
      const cachedResponse = await cache.match(imageUrl);
      
      if (cachedResponse) {
        // 如果缓存中有图片，直接返回原始URL
        return imageUrl;
      }

      // 如果缓存中没有，则获取并缓存
      const response = await fetch(imageUrl);
      await cache.put(imageUrl, response.clone());
      return imageUrl;
    } catch (error) {
      console.error('图片缓存处理失败:', error);
      return imageUrl; // 如果缓存失败，返回原始URL
    }
  };

  // 在组件卸载时清理URL对象
  useEffect(() => {
    return () => {
      // 清理所有创建的URL对象
      cachedUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [cachedUrls]);

  // 切换卡片函数
  const handlePrev = () => {
    if (modalType === 'left' && modalCardIndex !== null) {
      setModalCardIndex((prev) => {
        const newIndex = (prev! - 1 + cards.length) % cards.length;
        setModalRarityIndex(0);
        return newIndex;
      });
    } else if (modalType === 'right' && modalCardIndex !== null && deckData?.deck_cards) {
      setModalCardIndex((prev) => {
        const newIndex = (prev! - 1 + deckData.deck_cards.length) % deckData.deck_cards.length;
        setModalRarityIndex(0);
        return newIndex;
      });
    }
  };
  const handleNext = () => {
    if (modalType === 'left' && modalCardIndex !== null) {
      setModalCardIndex((prev) => {
        const newIndex = (prev! + 1) % cards.length;
        setModalRarityIndex(0);
        return newIndex;
      });
    } else if (modalType === 'right' && modalCardIndex !== null && deckData?.deck_cards) {
      setModalCardIndex((prev) => {
        const newIndex = (prev! + 1) % deckData.deck_cards.length;
        setModalRarityIndex(0);
        return newIndex;
      });
    }
  };

  // 切换稀有度图片
  const handleRarityDotClick = (idx: number) => {
    setModalRarityIndex(idx);
  };

  // 图片滑动切换
  let touchStartX = 0;
  let touchEndX = 0;
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent, rarityCount: number) => {
    touchEndX = e.changedTouches[0].clientX;
    if (touchEndX - touchStartX > 50) {
      // 向右滑
      setModalRarityIndex((prev) => (prev - 1 + rarityCount) % rarityCount);
    } else if (touchStartX - touchEndX > 50) {
      // 向左滑
      setModalRarityIndex((prev) => (prev + 1) % rarityCount);
    }
  };

  // 当modalType为right且modalCardIndex变化时，确保localDeckCards同步
  useEffect(() => {
    if (modalType === 'right' && deckData?.deck_cards) {
      setLocalDeckCards(JSON.parse(JSON.stringify(deckData.deck_cards)));
    }
  }, [modalType, deckData, isCardModalOpen]);

  // 处理左侧卡片数量变更
  const handleLeftCardQuantityChange = (val: number) => {
    if (modalType === 'left' && modalCardIndex !== null) {
      const card = cards[modalCardIndex];
      const rarity = card.rarity_infos?.[modalRarityIndex];
      if (!rarity) return;

      // 确保数量不小于0
      if (val < 0) val = 0;

      // 在cardsData中查找是否存在该卡片
      const existingCardIndex = cardsData.findIndex(c => c.id === rarity.card_id);
      
      if (existingCardIndex === -1) {
        // 如果不存在，添加新卡片到cardsData
        const newCard = {
          ...card,
          rarity_infos: card.rarity_infos?.map((r, i) => 
            i === modalRarityIndex ? { ...r, quantity: val } : r
          )
        };
        setCardsData(prev => {
          const newCardsData = [...prev, newCard];
          // 同步更新showCards
          const processedCards = newCardsData.map(card => ({
            ...card,
            card_rarity: card.rarity_infos?.map(rarity => ({
              card_number: rarity.card_number,
              quantity: rarity.quantity || 0
            })) || []
          }));
          setShowCards(processedCards);
          return newCardsData;
        });
      } else {
        // 如果存在，更新对应卡片的quantity
        setCardsData(prev => {
          const next = [...prev];
          const cardRarityIndex = next[existingCardIndex].rarity_infos?.findIndex(
            r => r.card_number === rarity.card_number
          );
          
          if (cardRarityIndex !== undefined && cardRarityIndex !== -1) {
            // 计算当前卡片所有稀有度的数量总和
            const totalQuantity = next[existingCardIndex].rarity_infos?.reduce((sum, r) => sum + (r.quantity || 0), 0) || 0;
            const currentQuantity = next[existingCardIndex].rarity_infos?.[cardRarityIndex]?.quantity || 0;
            
            // 如果新数量会导致总和超过4，则不允许更新
            if (totalQuantity - currentQuantity + val > 4) {
              alert('一张卡的所有稀有度数量之和不能超过4');
              return next;
            }

            next[existingCardIndex] = {
              ...next[existingCardIndex],
              rarity_infos: next[existingCardIndex].rarity_infos?.map((r, i) => 
                i === cardRarityIndex ? { ...r, quantity: val } : r
              )
            };

            // 如果所有稀有度的数量都为0，则从cardsData中删除该卡片
            const allZero = next[existingCardIndex].rarity_infos?.every(r => (r.quantity || 0) === 0);
            if (allZero) {
              next.splice(existingCardIndex, 1);
            }
          }

          // 同步更新showCards
          const processedCards = next.map(card => ({
            ...card,
            card_rarity: card.rarity_infos?.map(rarity => ({
              card_number: rarity.card_number,
              quantity: rarity.quantity || 0
            })) || []
          }));
          setShowCards(processedCards);

          return next;
        });
      }
    }
  };

  // 获取第一个quantity不为0的card_rarity索引
  const getFirstNonZeroRarityIndex = (card: ShowCard) => {
    const index = card.card_rarity.findIndex(r => (r.quantity || 0) > 0);
    return index !== -1 ? index : 0;
  };

  // 处理右侧卡片数量变更
  const handleRightCardQuantityChange = (val: number) => {
    if (modalType === 'right' && modalCardIndex !== null && showCards[modalCardIndex]) {
      const card = showCards[modalCardIndex];
      const rarity = card.card_rarity[modalRarityIndex];
      
      // 确保数量不小于0
      if (val < 0) val = 0;

      // 在cardsData中查找是否存在该卡片
      const existingCardIndex = cardsData.findIndex(c => c.id === card.id);
      
      if (existingCardIndex === -1) {
        // 如果不存在，添加新卡片到cardsData
        const newCard = {
          ...card,
          rarity_infos: card.rarity_infos?.map((r, i) => 
            i === modalRarityIndex ? { ...r, quantity: val } : r
          )
        };
        setCardsData(prev => {
          const newCardsData = [...prev, newCard];
          // 同步更新showCards
          const processedCards = newCardsData.map(card => ({
            ...card,
            card_rarity: card.rarity_infos?.map(rarity => ({
              card_number: rarity.card_number,
              quantity: rarity.quantity || 0
            })) || []
          }));
          setShowCards(processedCards);
          return newCardsData;
        });
      } else {
        // 如果存在，更新对应卡片的quantity
        setCardsData(prev => {
          const next = [...prev];
          const cardRarityIndex = next[existingCardIndex].rarity_infos?.findIndex(
            r => r.card_number === rarity.card_number
          );
          
          if (cardRarityIndex !== undefined && cardRarityIndex !== -1) {
            // 计算当前卡片所有稀有度的数量总和
            const totalQuantity = next[existingCardIndex].rarity_infos?.reduce((sum, r) => sum + (r.quantity || 0), 0) || 0;
            const currentQuantity = next[existingCardIndex].rarity_infos?.[cardRarityIndex]?.quantity || 0;
            
            // 如果新数量会导致总和超过4，则不允许更新
            if (totalQuantity - currentQuantity + val > 4) {
              alert('一张卡的所有稀有度数量之和不能超过4');
              return next;
            }

            next[existingCardIndex] = {
              ...next[existingCardIndex],
              rarity_infos: next[existingCardIndex].rarity_infos?.map((r, i) => 
                i === cardRarityIndex ? { ...r, quantity: val } : r
              )
            };

            // 如果所有稀有度的数量都为0，则从cardsData中删除该卡片
            const allZero = next[existingCardIndex].rarity_infos?.every(r => (r.quantity || 0) === 0);
            if (allZero) {
              next.splice(existingCardIndex, 1);
            } else if (val === 0) {
              // 如果当前稀有度数量变为0，查找其他非0稀有度并切换
              const newRarityIndex = next[existingCardIndex].rarity_infos?.findIndex(r => (r.quantity || 0) > 0);
              if (newRarityIndex !== undefined && newRarityIndex !== -1) {
                setModalRarityIndex(newRarityIndex);
              }
            }
          }

          // 同步更新showCards
          const processedCards = next.map(card => ({
            ...card,
            card_rarity: card.rarity_infos?.map(rarity => ({
              card_number: rarity.card_number,
              quantity: rarity.quantity || 0
            })) || []
          }));
          setShowCards(processedCards);

          // 如果cardsData为空，关闭窗口
          if (next.length === 0) {
            setIsCardModalOpen(false);
          }

          return next;
        });
      }
    }
  };

  const handleMinus = () => {
    if (modalType === 'right' && modalCardIndex !== null && showCards[modalCardIndex]) {
      const cur = showCards[modalCardIndex].card_rarity[modalRarityIndex]?.quantity || 0;
      if (cur > 0) handleRightCardQuantityChange(cur - 1);
    }
  };

  const handlePlus = () => {
    if (modalType === 'right' && modalCardIndex !== null && showCards[modalCardIndex]) {
      const cur = showCards[modalCardIndex].card_rarity[modalRarityIndex]?.quantity || 0;
      handleRightCardQuantityChange(cur + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    handleRightCardQuantityChange(val);
  };

  // 左侧卡牌添加到卡组
  const handleAddLeftCardToDeck = () => {
    if (modalType === 'left' && modalCardIndex !== null) {
      const card = cards[modalCardIndex];
      const rarity = card.rarity_infos?.[modalRarityIndex];
      if (!rarity) return;
      
      if (deckData?.deck_cards) {
        // 查找是否已存在相同card_id的卡
        const idx = deckData.deck_cards.findIndex((c: DeckCard) => c.card_id === rarity.card_id);
        if (idx !== -1) {
          // 已存在，数量+1
          deckData.deck_cards[idx] = { 
            ...deckData.deck_cards[idx], 
            quantity: (deckData.deck_cards[idx].quantity || 0) + 1 
          };
        } else {
          // 不存在，新增
          const now = new Date().toISOString();
          deckData.deck_cards.push({
            card_id: rarity.card_id,
            image: rarity.card_number,
            create_time: now,
            deck_id: deckData.id || uuid(),
            deck_zone: 'main',
            id: uuid(),
            is_deleted: false,
            position: deckData.deck_cards.length,
            quantity: 1,
            remark: '',
            update_time: now
          });
        }
        setLocalDeckCards([...deckData.deck_cards]);
      }
    }
  };

  // 获取左侧卡片在cardsData中的数量
  const getLeftCardQuantity = () => {
    if (modalType === 'left' && modalCardIndex !== null) {
      const card = cards[modalCardIndex];
      const rarity = card.rarity_infos?.[modalRarityIndex];
      if (!rarity) return 0;
      
      const existingCard = cardsData.find(c => c.id === rarity.card_id);
      if (existingCard) {
        const cardRarity = existingCard.rarity_infos?.find(r => r.card_number === rarity.card_number);
        return cardRarity?.quantity || 0;
      }
    }
    return 0;
  };

  const handleLeftCardMinus = () => {
    const cur = getLeftCardQuantity();
    console.log('点击减号按钮时的cardsData:', {
      currentQuantity: cur,
      cards: cards,
      cardsData: cardsData,
      deckData: deckData
    });
    if (cur > 0) handleLeftCardQuantityChange(cur - 1);
  };

  const handleLeftCardPlus = () => {
    const cur = getLeftCardQuantity();
    console.log('点击加号按钮时的cardsData:', {
      currentQuantity: cur,
      cards: cards,
      cardsData: cardsData,
      deckData: deckData
    });
    handleLeftCardQuantityChange(cur + 1);
  };

  const handleLeftCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    console.log('输入框改变时的cardsData:', {
      inputValue: val,
      cards: cards,
      cardsData: cardsData,
      deckData: deckData
    });
    handleLeftCardQuantityChange(val);
  };

  // 图片滚轮切换稀有度
  const handleImageWheel = (e: React.WheelEvent, rarityCount: number) => {
    e.preventDefault();
    if (rarityCount <= 1) return;
    if (e.deltaY > 0) {
      // 向下滚轮，下一个
      setModalRarityIndex(prev => (prev + 1) % rarityCount);
    } else if (e.deltaY < 0) {
      // 向上滚轮，上一个
      setModalRarityIndex(prev => (prev - 1 + rarityCount) % rarityCount);
    }
  };

  // 获取并整理卡片数据
  const fetchAndProcessCards = async () => {
    if (!deckData?.deck_cards || deckData.deck_cards.length === 0) {
      setCardsData([]);
      setShowCards([]);
      return;
    }
    
    try {
      // 获取所有唯一的card_id
      const uniqueCardIds = [...new Set(deckData.deck_cards.map(dc => dc.card_id))];
      
      if (uniqueCardIds.length === 0) {
        setCardsData([]);
        setShowCards([]);
        return;
      }

      // 调用API获取卡片数据
      const response = await axios.get(`http://118.25.45.131:8000/api/v1/cards/${uniqueCardIds.join(',')}`);
      
      const newCardsData = response.data;
      setCardsData(newCardsData);
      
      // 处理卡片数据，添加quantity属性
      const processedCards = newCardsData.map((card: Card) => {
        // 找到所有相同card_id的deck_cards
        const deckCards = deckData.deck_cards.filter(dc => dc.card_id === card.id);
        
        // 为每个rarity添加quantity
        const processedRarities = card.rarity_infos?.map(rarity => {
          const deckCard = deckCards.find(dc => dc.image === rarity.card_number);
          return {
            ...rarity,
            quantity: deckCard?.quantity || 0
          };
        }) || [];

        return {
          ...card,
          card_rarity: processedRarities
        };
      });

      setShowCards(processedCards);
    } catch (error) {
      console.error('获取卡片数据失败:', error);
      setCardsData([]);
      setShowCards([]);
    }
  };

  // 当deckData变化时重新获取数据
  useEffect(() => {
    fetchAndProcessCards();
  }, [deckData]);

  // 保存卡组数据
  const handleSaveDeck = async () => {
    if (!deckData?.id) {
      alert('卡组ID不存在');
      return;
    }

    try {
      setSaving(true);
      
      // 从cardsData中获取deck_cards数据
      const deckCards = cardsData.flatMap(card => 
        card.rarity_infos?.filter(rarity => (rarity.quantity || 0) > 0).map((rarity, index) => ({
          card_id: rarity.card_id,
          image: rarity.card_number,
          quantity: rarity.quantity || 0,
          deck_zone: 'main',
          position: index,
          remark: '',
          deck_id: deckData.id
        })) || []
      );

      // 准备请求数据
      const requestData = {
        deck_name: deckData.deck_name,
        deck_description: deckData.deck_description || '',
        is_public: deckData.is_public || false,
        is_official: deckData.is_official || false,
        preset: deckData.preset || -1,
        deck_version: (deckData.deck_version || 0) + 1,
        remark: deckData.remark || '',
        deck_cards: deckCards
      };

      // 调用保存接口
      await axios.put(`http://localhost:8000/api/v1/decks/${deckData.id}`, requestData);
      
      alert('保存成功');
      navigate('/deck');
    } catch (error) {
      console.error('保存卡组失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden h-screen flex flex-col">
      {/* 顶部卡组名 */}
      <div className="w-full h-12 flex items-center justify-center border-b text-lg font-bold text-center">
        {deckData?.deck_name || '卡组名预留'}
      </div>

      {/* 返回按钮 */}
      <button
        className="absolute top-3 left-4 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm z-10"
        onClick={() => navigate('/deck')}
      >返回</button>

      {/* 筛选条件 */}
      <div className="flex flex-wrap gap-x-2 gap-y-1 items-end px-8 py-2 text-xs bg-white z-10">
        <div className="flex flex-col w-48">
          <label className="mb-0.5">关键词</label>
          <input
            className="border border-gray-300 rounded px-1 py-0.5 text-xs h-6"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="输入关键词"
          />
        </div>
        <div className="flex flex-col w-48">
          <label className="mb-0.5">国家</label>
          <Select
            options={nationOptions}
            value={nation}
            onChange={setNation}
            classNamePrefix="select"
            styles={customSelectStyles}
            placeholder="请选择..."
            isClearable
          />
        </div>
        <div className="flex flex-col w-48">
          <label className="mb-0.5">种族</label>
          <Select
            options={clanOptions}
            value={clan}
            onChange={setClan}
            classNamePrefix="select"
            styles={customSelectStyles}
            placeholder="请选择..."
            isClearable
          />
        </div>
        <div className="flex flex-col w-48">
          <label className="mb-0.5">等级</label>
          <Select
            options={gradeOptions}
            value={grade}
            onChange={setGrade}
            classNamePrefix="select"
            styles={customSelectStyles}
            placeholder="请选择..."
            isClearable
          />
        </div>
        <div className="flex flex-col w-48">
          <label className="mb-0.5">技能</label>
          <Select
            options={skillOptions}
            value={skill}
            onChange={setSkill}
            classNamePrefix="select"
            styles={customSelectStyles}
            placeholder="请选择..."
            isClearable
          />
        </div>
        <div className="flex flex-col w-48">
          <label className="mb-0.5">盾值</label>
          <Select
            options={shieldOptions}
            value={shield}
            onChange={setShield}
            classNamePrefix="select"
            styles={customSelectStyles}
            placeholder="请选择..."
            isClearable
          />
        </div>
        <div className="flex flex-col w-48">
          <label className="mb-0.5">种类</label>
          <Select
            options={typeOptions}
            value={cardType}
            onChange={setCardType}
            classNamePrefix="select"
            styles={customSelectStyles}
            placeholder="请选择..."
            isClearable
          />
        </div>
        <div className="flex flex-col w-48">
          <label className="mb-0.5">触发</label>
          <Select
            options={triggerOptions}
            value={triggerType}
            onChange={setTriggerType}
            classNamePrefix="select"
            styles={customSelectStyles}
            placeholder="请选择..."
            isClearable
          />
        </div>
        <div className="flex flex-col w-48">
          <label className="mb-0.5">卡包</label>
          <Select
            options={packOptions}
            value={selectedPack}
            onChange={setSelectedPack}
            classNamePrefix="select"
            styles={customSelectStyles}
            placeholder="请选择..."
            isClearable
          />
        </div>
        <div className="flex flex-col w-48">
          <label className="mb-0.5">力量值范围</label>
          <div className="px-1">
            <Slider
              value={cardPowerRange}
              onChange={handleCardPowerChange}
              valueLabelDisplay="auto"
              min={0}
              max={20000}
              step={1000}
              size="small"
              marks={false}
            />
          </div>
        </div>
        <button
          className="ml-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs h-6"
          onClick={handleClear}
        >清空</button>
        <button
          className="ml-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs h-6"
          onClick={handleSearch}
        >搜索</button>
        <button
          className="ml-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs h-6 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSaveDeck}
          disabled={saving}
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧卡牌列表 */}
        <div className="w-[70%] h-full flex flex-col items-center justify-center">
          <div
            className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2"
            ref={cardListRef}
            onScroll={handleScroll}
          >
            <div className="grid grid-cols-5 gap-4 py-4">
              {cards.map((card, idx) => (
                <div key={card.id} className="w-36 h-52 flex flex-col items-center justify-center text-gray-700 text-base bg-transparent cursor-pointer"
                  onClick={() => {
                    setModalCardIndex(idx);
                    setModalType('left');
                    setIsCardModalOpen(true);
                  }}
                >
                  {card.rarity_infos?.[0]?.card_number ? (
                    <img 
                      src={`http://118.25.45.131:3000/images/${card.rarity_infos[0].card_number}.jpg`}
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
        {/* 右侧卡组展示 */}
        <div className="w-[30%] h-full border-l flex flex-col items-center justify-start pt-4 bg-gray-50">
          <div className="grid grid-cols-4 gap-2 w-full px-4">
            {showCards.map((card, idx) => {
              const firstNonZeroIndex = getFirstNonZeroRarityIndex(card);
              return (
                <div 
                  key={idx} 
                  className="w-16 h-24 border rounded flex items-center justify-center text-gray-500 text-xs bg-white shadow cursor-pointer"
                  onClick={() => {
                    setModalCardIndex(idx);
                    setModalType('right');
                    setIsCardModalOpen(true);
                    // 设置初始稀有度索引为第一个非0稀有度
                    setModalRarityIndex(firstNonZeroIndex);
                  }}
                >
                  {card.card_rarity[firstNonZeroIndex]?.card_number ? (
                    <img 
                      src={`http://118.25.45.131:3000/images/${card.card_rarity[firstNonZeroIndex].card_number}.jpg`}
                      alt={card.name_cn}
                      className="w-full h-full object-contain"
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
      </div>

      {/* 弹窗 */}
      {isCardModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setIsCardModalOpen(false)}
        >
          <div
            className="relative flex flex-col items-center"
            style={{ minWidth: 400, minHeight: 400 }}
            onClick={e => e.stopPropagation()}
          >
            {/* 左箭头SVG，极窄宽度，贴边 */}
            <button
              className="fixed left-2 top-1/2 -translate-y-1/2 z-50 p-0 bg-transparent border-none outline-none flex items-center justify-center"
              style={{width:'40px',height:'80px'}}
              onClick={handlePrev}
            >
              <svg width="32" height="80" viewBox="0 0 32 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="28,8 4,40 28,72" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {/* 中间大卡片 */}
            <div
              className="flex flex-col items-center justify-center relative select-none bg-white rounded-lg border border-gray-200"
              style={{width:'420px',minHeight:'600px'}}
            >
              <div
                className="flex items-center justify-center relative select-none p-4"
                style={{width:'420px',height:'540px'}}
                onTouchStart={e => { handleTouchStart(e); }}
                onTouchEnd={e => {
                  let rarityCount = 1;
                  if (modalType === 'left' && modalCardIndex !== null && cards[modalCardIndex]?.rarity_infos) {
                    rarityCount = cards[modalCardIndex].rarity_infos.length;
                  }
                  handleTouchEnd(e, rarityCount);
                }}
              >
                {/* 展示卡片内容 */}
                {modalType === 'left' && modalCardIndex !== null && cards[modalCardIndex] && (
                  cards[modalCardIndex].rarity_infos?.length > 0 ? (
                    <div className="relative w-full h-full">
                      {/* 稀有度切换按钮 - 左 */}
                      {cards[modalCardIndex].rarity_infos.length > 1 && (
                        <button
                          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-r-lg px-2 py-4 hover:bg-opacity-100 transition-all"
                          onClick={() => setModalRarityIndex((prev) => (prev - 1 + cards[modalCardIndex].rarity_infos.length) % cards[modalCardIndex].rarity_infos.length)}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      <img
                        src={`http://118.25.45.131:3000/images/${cards[modalCardIndex].rarity_infos[modalRarityIndex]?.card_number}.jpg`}
                        alt={cards[modalCardIndex].name_cn}
                        className="w-full h-full object-contain"
                        style={{boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}
                      />
                      {/* 稀有度切换按钮 - 右 */}
                      {cards[modalCardIndex].rarity_infos.length > 1 && (
                        <button
                          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-l-lg px-2 py-4 hover:bg-opacity-100 transition-all"
                          onClick={() => setModalRarityIndex((prev) => (prev + 1) % cards[modalCardIndex].rarity_infos.length)}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      {/* 分页点放在图片底部 */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {cards[modalCardIndex].rarity_infos.map((_, i) => (
                          <span
                            key={i}
                            className={`w-2 h-2 rounded-full inline-block cursor-pointer ${i === modalRarityIndex ? 'bg-black' : 'bg-gray-300'}`}
                            onClick={() => handleRarityDotClick(i)}
                          ></span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="font-bold">{cards[modalCardIndex].name_cn}</div>
                      <div className="text-xs mt-1">{cards[modalCardIndex].card_type}</div>
                      <div className="text-xs mt-1">{cards[modalCardIndex].card_power}</div>
                    </div>
                  )
                )}
                {modalType === 'right' && modalCardIndex !== null && showCards[modalCardIndex] && (
                  <div className="relative w-full h-full">
                    {/* 稀有度切换按钮 - 左 */}
                    {showCards[modalCardIndex].card_rarity.length > 1 && (
                      <button
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-r-lg px-2 py-4 hover:bg-opacity-100 transition-all"
                        onClick={() => setModalRarityIndex((prev) => (prev - 1 + showCards[modalCardIndex].card_rarity.length) % showCards[modalCardIndex].card_rarity.length)}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                    <img
                      src={`http://118.25.45.131:3000/images/${showCards[modalCardIndex].card_rarity[modalRarityIndex]?.card_number}.jpg`}
                      alt={showCards[modalCardIndex].name_cn}
                      className="w-full h-full object-contain"
                      style={{boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}
                    />
                    {/* 稀有度切换按钮 - 右 */}
                    {showCards[modalCardIndex].card_rarity.length > 1 && (
                      <button
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-l-lg px-2 py-4 hover:bg-opacity-100 transition-all"
                        onClick={() => setModalRarityIndex((prev) => (prev + 1) % showCards[modalCardIndex].card_rarity.length)}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                    {/* 分页点放在图片底部 */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {showCards[modalCardIndex].card_rarity.map((_, i) => (
                        <span
                          key={i}
                          className={`w-2 h-2 rounded-full inline-block cursor-pointer ${i === modalRarityIndex ? 'bg-black' : 'bg-gray-300'}`}
                          onClick={() => handleRarityDotClick(i)}
                        ></span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* 底部按钮 */}
              <div className="flex items-center justify-center py-4 gap-8">
                {/* 左侧卡牌弹窗底部按钮 */}
                {modalType === 'left' && (
                  <>
                    <button className="w-10 h-10 flex items-center justify-center" onClick={handleLeftCardMinus}>
                      <img src={MinusIcon} alt="minus" className="w-8 h-8" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={getLeftCardQuantity()}
                      onChange={handleLeftCardInputChange}
                      className="w-10 text-center border rounded mx-2"
                      style={{fontSize:'1rem'}}
                    />
                    <button className="w-10 h-10 flex items-center justify-center" onClick={handleLeftCardPlus}>
                      <img src={PlusIcon} alt="plus" className="w-8 h-8" />
                    </button>
                  </>
                )}
                {/* 右侧卡组卡数量输入和加减按钮 */}
                {modalType === 'right' && modalCardIndex !== null && showCards[modalCardIndex] && (
                  <>
                    <button className="w-10 h-10 flex items-center justify-center" onClick={handleMinus}>
                      <img src={MinusIcon} alt="minus" className="w-8 h-8" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={showCards[modalCardIndex].card_rarity[modalRarityIndex]?.quantity || 0}
                      onChange={handleInputChange}
                      className="w-10 text-center border rounded mx-2"
                      style={{fontSize:'1rem'}}
                    />
                    <button className="w-10 h-10 flex items-center justify-center" onClick={handlePlus}>
                      <img src={PlusIcon} alt="plus" className="w-8 h-8" />
                    </button>
                  </>
                )}
              </div>
            </div>
            {/* 右箭头SVG，极窄宽度，贴边 */}
            <button
              className="fixed right-2 top-1/2 -translate-y-1/2 z-50 p-0 bg-transparent border-none outline-none flex items-center justify-center"
              style={{width:'40px',height:'80px'}}
              onClick={handleNext}
            >
              <svg width="32" height="80" viewBox="0 0 32 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="4,8 28,40 4,72" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardBrowser;