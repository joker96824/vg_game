import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Select, { components } from 'react-select';
import type { Card } from '../types/card';

// 假数据
const rarityOptions = [
  { value: 'R', label: 'R' }, { value: 'RR', label: 'RR' }, { value: 'RRR', label: 'RRR' }
];
const nationOptions = [
  { value: '国家A', label: '国家A' }, { value: '国家B', label: '国家B' }
];
const clanOptions = [
  { value: '种族A', label: '种族A' }, { value: '种族B', label: '种族B' }
];
const skillOptions = [
  { value: '技能A', label: '技能A' }, { value: '技能B', label: '技能B' }
];
const typeOptions = [
  { value: '类型A', label: '类型A' }, { value: '类型B', label: '类型B' }
];
const triggerOptions = [
  { value: '触发A', label: '触发A' }, { value: '触发B', label: '触发B' }
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
    minHeight: 28,
    height: 28,
    fontSize: 12,
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: '0 4px',
    minHeight: 28,
    height: 28,
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
    height: 28,
  }),
  multiValue: (base: any) => ({
    ...base,
    maxWidth: '80px', // 限制单个标签最大宽度
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  option: (base: any) => ({
    ...base,
    fontSize: 12,
    minHeight: 28,
    height: 28,
    paddingTop: 2,
    paddingBottom: 2,
  }),
  menu: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
};

const CardBrowser: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [rarity, setRarity] = useState<any[]>([]);
  const [nation, setNation] = useState<any[]>([]);
  const [clan, setClan] = useState<any[]>([]);
  const [skill, setSkill] = useState<any[]>([]);
  const [type, setType] = useState<any[]>([]);
  const [trigger, setTrigger] = useState<any[]>([]);
  const [cards, setCards] = useState(Array(40).fill(0).map((_, i) => ({ id: i, name_cn: `卡牌${i + 1}` })));
  const [deck] = useState(Array(12).fill(0).map((_, i) => ({ id: i, name_cn: `卡组卡${i + 1}` })));
  const navigate = useNavigate();
  const cardListRef = useRef<HTMLDivElement>(null);

  // 筛选条件清空
  const handleClear = () => {
    setKeyword('');
    setRarity([]);
    setNation([]);
    setClan([]);
    setSkill([]);
    setType([]);
    setTrigger([]);
  };

  // 筛选条件搜索
  const handleSearch = () => {
    // TODO: 调用API
  };

  // 无限滚动加载更多
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      // 加载更多
      setCards(prev => [
        ...prev,
        ...Array(20).fill(0).map((_, i) => ({
          id: prev.length + i,
          name_cn: `卡牌${prev.length + i + 1}`,
        }))
      ]);
    }
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden h-screen flex flex-col">
      {/* 顶部卡组名 */}
      <div className="w-full h-12 flex items-center justify-center border-b text-lg font-bold text-center">卡组名预留</div>

      {/* 返回按钮 */}
      <button
        className="absolute top-3 left-4 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm z-10"
        onClick={() => navigate('/')}
      >返回</button>

      {/* 筛选条件 */}
      <div className="flex flex-wrap gap-x-2 gap-y-1 items-end px-8 py-2 text-xs bg-white z-10">
        <div className="flex flex-col w-56">
          <label className="mb-0.5">关键词</label>
          <input
            className="border border-gray-300 rounded px-1 py-0.5 text-xs h-7"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="输入关键词"
          />
        </div>
        <div className="flex flex-col w-56">
          <label className="mb-0.5">罕贵度</label>
          <Select
            isMulti
            options={rarityOptions}
            value={rarity}
            onChange={setRarity}
            classNamePrefix="select"
            closeMenuOnSelect={false}
            menuPortalTarget={document.body}
            styles={customSelectStyles}
            components={{ 
                Option: CustomOption, 
                MenuList: CustomMenuList,
                MultiValue: ({ data, removeProps }: { data: any, removeProps: any }) => (
                  <div className="flex items-center bg-blue-100 rounded px-1 mr-1 my-0.5 text-xs text-blue-700 truncate max-w-[80px]">
                    <span className="truncate">{data.label}</span>
                    <button 
                      {...removeProps} 
                      className="ml-1 text-blue-500 hover:text-blue-700"
                      aria-label={`移除${data.label}`}
                    >
                      ×
                    </button>
                  </div>
                )
              }}
              hideSelectedOptions={false}
              noOptionsMessage={() => "无选项"}
              placeholder="请选择..."
          />
        </div>
        <div className="flex flex-col w-56">
          <label className="mb-0.5">国家</label>
          <Select
            isMulti
            options={nationOptions}
            value={nation}
            onChange={setNation}
            classNamePrefix="select"
            closeMenuOnSelect={false}
            menuPortalTarget={document.body}
            styles={customSelectStyles}
            components={{ 
                Option: CustomOption, 
                MenuList: CustomMenuList,
                MultiValue: ({ data, removeProps }: { data: any, removeProps: any }) => (
                  <div className="flex items-center bg-blue-100 rounded px-1 mr-1 my-0.5 text-xs text-blue-700 truncate max-w-[80px]">
                    <span className="truncate">{data.label}</span>
                    <button 
                      {...removeProps} 
                      className="ml-1 text-blue-500 hover:text-blue-700"
                      aria-label={`移除${data.label}`}
                    >
                      ×
                    </button>
                  </div>
                )
              }}
              hideSelectedOptions={false}
              noOptionsMessage={() => "无选项"}
              placeholder="请选择..."
          />
        </div>
        <div className="flex flex-col w-56">
          <label className="mb-0.5">种族</label>
          <Select
            isMulti
            options={clanOptions}
            value={clan}
            onChange={setClan}
            classNamePrefix="select"
            closeMenuOnSelect={false}
            menuPortalTarget={document.body}
            styles={customSelectStyles}
            components={{ 
                Option: CustomOption, 
                MenuList: CustomMenuList,
                MultiValue: ({ data, removeProps }: { data: any, removeProps: any }) => (
                  <div className="flex items-center bg-blue-100 rounded px-1 mr-1 my-0.5 text-xs text-blue-700 truncate max-w-[80px]">
                    <span className="truncate">{data.label}</span>
                    <button 
                      {...removeProps} 
                      className="ml-1 text-blue-500 hover:text-blue-700"
                      aria-label={`移除${data.label}`}
                    >
                      ×
                    </button>
                  </div>
                )
              }}
              hideSelectedOptions={false}
              noOptionsMessage={() => "无选项"}
              placeholder="请选择..."
          />
        </div>
        <div className="flex flex-col w-56">
          <label className="mb-0.5">技能</label>
          <Select
            isMulti
            options={skillOptions}
            value={skill}
            onChange={setSkill}
            classNamePrefix="select"
            closeMenuOnSelect={false}
            menuPortalTarget={document.body}
            styles={customSelectStyles}
            components={{ 
                Option: CustomOption, 
                MenuList: CustomMenuList,
                MultiValue: ({ data, removeProps }: { data: any, removeProps: any }) => (
                  <div className="flex items-center bg-blue-100 rounded px-1 mr-1 my-0.5 text-xs text-blue-700 truncate max-w-[80px]">
                    <span className="truncate">{data.label}</span>
                    <button 
                      {...removeProps} 
                      className="ml-1 text-blue-500 hover:text-blue-700"
                      aria-label={`移除${data.label}`}
                    >
                      ×
                    </button>
                  </div>
                )
              }}
              hideSelectedOptions={false}
              noOptionsMessage={() => "无选项"}
              placeholder="请选择..."
          />
        </div>
        <div className="flex flex-col w-56">
          <label className="mb-0.5">类型</label>
          <Select
            isMulti
            options={typeOptions}
            value={type}
            onChange={setType}
            classNamePrefix="select"
            closeMenuOnSelect={false}
            menuPortalTarget={document.body}
            styles={customSelectStyles}
            components={{ 
                Option: CustomOption, 
                MenuList: CustomMenuList,
                MultiValue: ({ data, removeProps }: { data: any, removeProps: any }) => (
                  <div className="flex items-center bg-blue-100 rounded px-1 mr-1 my-0.5 text-xs text-blue-700 truncate max-w-[80px]">
                    <span className="truncate">{data.label}</span>
                    <button 
                      {...removeProps} 
                      className="ml-1 text-blue-500 hover:text-blue-700"
                      aria-label={`移除${data.label}`}
                    >
                      ×
                    </button>
                  </div>
                )
              }}
              hideSelectedOptions={false}
              noOptionsMessage={() => "无选项"}
              placeholder="请选择..."
          />
        </div>
        <div className="flex flex-col w-56">
          <label className="mb-0.5">触发</label>
          <Select
            isMulti
            options={triggerOptions}
            value={trigger}
            onChange={setTrigger}
            classNamePrefix="select"
            closeMenuOnSelect={false}
            menuPortalTarget={document.body}
            styles={customSelectStyles}
            components={{ 
                Option: CustomOption, 
                MenuList: CustomMenuList,
                MultiValue: ({ data, removeProps }: { data: any, removeProps: any }) => (
                  <div className="flex items-center bg-blue-100 rounded px-1 mr-1 my-0.5 text-xs text-blue-700 truncate max-w-[80px]">
                    <span className="truncate">{data.label}</span>
                    <button 
                      {...removeProps} 
                      className="ml-1 text-blue-500 hover:text-blue-700"
                      aria-label={`移除${data.label}`}
                    >
                      ×
                    </button>
                  </div>
                )
              }}
              hideSelectedOptions={false}
              noOptionsMessage={() => "无选项"}
              placeholder="请选择..."
          />
        </div>
        <button
          className="ml-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs h-7"
          onClick={handleClear}
        >清空</button>
        <button
          className="ml-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs h-7"
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
                <div key={card.id} className="w-36 h-52 border rounded-lg flex items-center justify-center text-gray-700 text-base bg-white shadow">
                  {card.name_cn}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* 右侧卡组展示 */}
        <div className="w-[30%] h-full border-l flex flex-col items-center justify-start pt-4 bg-gray-50">
          <div className="grid grid-cols-4 gap-2 w-full px-4">
            {deck.map(card => (
              <div key={card.id} className="w-16 h-24 border rounded flex items-center justify-center text-gray-500 text-xs bg-white shadow">
                {card.name_cn}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardBrowser;