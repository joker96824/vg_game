import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select, { components } from 'react-select';
import type { Card } from '../types/card';
import axios from 'axios';
import Slider from '@mui/material/Slider';

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
  card_rarity_id: string;
}

interface Deck {
  deck_name: string;
  deck_cards: DeckCard[];
}

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
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [deck] = useState(Array(12).fill(0).map((_, i) => ({ id: i, name_cn: `卡组卡${i + 1}` })));
  const navigate = useNavigate();
  const location = useLocation();
  const deckData = location.state?.deck as Deck | undefined;
  const cardListRef = useRef<HTMLDivElement>(null);
  const [cachedUrls] = useState<Set<string>>(new Set());

  // 获取卡牌数据
  const fetchCards = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/v1/cards`, {
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
              {cards.map(card => (
                <div key={card.id} className="w-36 h-52 flex flex-col items-center justify-center text-gray-700 text-base bg-transparent">
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
            {deckData?.deck_cards.map((card, index) => (
              <div 
                key={index} 
                className="w-16 h-24 border rounded flex items-center justify-center text-gray-500 text-xs bg-white shadow"
              >
                {card.card_rarity_id}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardBrowser;