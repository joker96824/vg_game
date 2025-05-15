import React from 'react';
import Select from 'react-select';
import Slider from '@mui/material/Slider';
import { customSelectStyles } from '../styles/selectStyles';
import {
  nationOptions,
  clanOptions,
  gradeOptions,
  skillOptions,
  shieldOptions,
  typeOptions,
  triggerOptions,
  packOptions
} from '../constants/cardOptions';

interface CardFilterProps {
  keyword: string;
  setKeyword: (value: string) => void;
  nation: any;
  setNation: (value: any) => void;
  clan: any;
  setClan: (value: any) => void;
  grade: any;
  setGrade: (value: any) => void;
  skill: any;
  setSkill: (value: any) => void;
  cardPowerRange: number[];
  setCardPowerRange: (value: number[]) => void;
  shield: any;
  setShield: (value: any) => void;
  cardType: any;
  setCardType: (value: any) => void;
  triggerType: any;
  setTriggerType: (value: any) => void;
  selectedPack: any;
  setSelectedPack: (value: any) => void;
  onClear: () => void;
  onSearch: () => void;
  onSave?: () => void;
  saving?: boolean;
}

const CardFilter: React.FC<CardFilterProps> = ({
  keyword,
  setKeyword,
  nation,
  setNation,
  clan,
  setClan,
  grade,
  setGrade,
  skill,
  setSkill,
  cardPowerRange,
  setCardPowerRange,
  shield,
  setShield,
  cardType,
  setCardType,
  triggerType,
  setTriggerType,
  selectedPack,
  setSelectedPack,
  onClear,
  onSearch,
  onSave,
  saving
}) => {
  const handleCardPowerChange = (event: Event, newValue: number | number[]) => {
    setCardPowerRange(newValue as number[]);
  };

  return (
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
        onClick={onClear}
      >清空</button>
      <button
        className="ml-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs h-6"
        onClick={onSearch}
      >搜索</button>
      {onSave && (
        <button
          className="ml-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs h-6 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? '保存中...' : '保存'}
        </button>
      )}
    </div>
  );
};

export default CardFilter; 