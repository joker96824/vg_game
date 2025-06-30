import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import starIcon from '../assets/star.svg';
import starOutlineIcon from '../assets/star-outline.svg';
import warningIcon from '../assets/warning.svg';
import editIcon from '../assets/edit.svg';
import settingIcon from '../assets/setting.svg';
import { IMAGE_BASE_URL } from '../constants/api';
import { getDecks, saveDeck, createDeck, deleteDeck, setDeckPreset, updateDeckInfo, copyDeck } from '../services/deckService';
import type { Deck, DeckCard } from '../types/deck';
import Toast from '../components/Toast';
import { getCardImageUrl, handleCardImageError } from '../utils/image/imageUtils';
import { error, confirm } from '../utils/notification';

const Deck: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'ride' | 'main' | 'g' | 'token'>('main');
  const [isStarred, setIsStarred] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importDeckId, setImportDeckId] = useState('');
  const settingsRef = useRef<HTMLDivElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deckValidationErrors, setDeckValidationErrors] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 新增导航栏tab配置
  const tabs = [
    { id: 'ride', label: '骑升' },
    { id: 'main', label: '主卡组' },
    { id: 'g', label: 'G区' },
    { id: 'token', label: '衍生' }
  ] as const;

  // 获取卡组列表
  const fetchDecks = async () => {
    try {
      setIsLoadingDecks(true);
      const data = await getDecks();
      console.log(Array.isArray(data));
      setDecks(Array.isArray(data) ? data : []);
      
      // 检查 URL 参数中是否有选中的卡组ID
      const urlParams = new URLSearchParams(window.location.search);
      const selectedDeckId = urlParams.get('selected');
      
      if (selectedDeckId) {
        const deck = data.find((d: Deck) => d.id === selectedDeckId);
        if (deck) {
          setSelectedDeck(deck);
          setIsStarred(deck.preset === 0);
        } else if (data.length > 0) {
          setSelectedDeck(data[0]);
          setIsStarred(data[0].preset === 0);
        }
      } else if (location.state?.deck) {
        const editedDeck = data.find((d: Deck) => d.id === location.state.deck.id);
        if (editedDeck) {
          setSelectedDeck(editedDeck);
          setIsStarred(editedDeck.preset === 0);
        } else if (data.length > 0) {
          setSelectedDeck(data[0]);
          setIsStarred(data[0].preset === 0);
        }
      } else if (data.length > 0) {
        setSelectedDeck(data[0]);
        setIsStarred(data[0].preset === 0);
      }
    } catch (error) {
      console.error('获取卡组列表失败:', error);
      showToast('获取卡组列表失败');
      setDecks([]); // 确保在错误时设置为空数组
    } finally {
      setIsLoadingDecks(false);
    }
  };

  // 显示提示消息
  const showToast = (message: string) => {
    setToastMessage(message);
  };

  // 处理提示关闭
  const handleToastClose = () => {
    setToastMessage(null);
  };

  // 创建新卡组
  const createNewDeck = async () => {
    try {
      const newDeck = {
        deck_name: newDeckName || '新卡组',
        deck_description: newDeckDescription
      };
      
      await createDeck(newDeck);
      
      // 刷新卡组列表
      await fetchDecks();
      
      // 重置表单并关闭弹窗
      setNewDeckName('');
      setNewDeckDescription('');
      setIsModalOpen(false);
      showToast('卡组创建成功');
    } catch (error) {
      console.error('创建卡组失败:', error);
      showToast('创建失败，请重试');
    }
  };

  // 获取当前区域的卡片
  const getCurrentZoneCards = (deck: Deck) => {
    if (!deck.deck_cards) return [];
    return deck.deck_cards.filter(card => card.deck_zone === activeTab);
  };

  // 处理点击设置按钮
  const handleSettingsClick = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  //处理点击star
  const handleStarClick = async () => {
    if (!isStarred && selectedDeck?.id) {
      // 首先检查卡组合规性
      if (!selectedDeck.is_valid) {
        showToast('卡组不合规');
        return;
      }

      try {
        await setDeckPreset(selectedDeck.id, 0);
        // 更新所有卡组的 preset 值
        setDecks(prevDecks => 
          prevDecks.map(deck => ({
            ...deck,
            preset: deck.id === selectedDeck.id ? 0 : -1
          }))
        );
        setIsStarred(true);
      } catch (error) {
        console.error('设置预设卡组失败:', error);
        showToast('设置失败，请重试');
      }
    }
  };

  // 处理重命名
  const handleRename = async () => {
    if (!selectedDeck) return;
    
    try {
      await saveDeck(selectedDeck.id, {
        ...selectedDeck,
        deck_name: newDeckName,
        deck_version: selectedDeck.deck_version || 0
      });
      
      // 刷新卡组列表
      await fetchDecks();
      
      // 关闭弹窗
      setIsRenameModalOpen(false);
      setNewDeckName('');
      showToast('重命名成功');
    } catch (error) {
      console.error('重命名卡组失败:', error);
      showToast('重命名失败，请重试');
    }
  };

  // 处理删除
  const handleDelete = async () => {
    if (!selectedDeck) return;
    
    const confirmed = await confirm('删除卡组', '确定要删除这个卡组吗？此操作不可恢复。', { type: 'danger' });
    if (confirmed) {
      try {
        await deleteDeck(selectedDeck.id);
        // 刷新卡组列表
        await fetchDecks();
        showToast('删除成功');
      } catch (error) {
        console.error('删除卡组失败:', error);
        showToast('删除失败，请重试');
      }
    }
  };

  // 处理分享
  const handleShare = async () => {
    if (!selectedDeck) return;
    
    try {
      await navigator.clipboard.writeText(selectedDeck.id);
      showToast('卡组ID已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      showToast('复制失败，请手动复制卡组ID');
    }
    setIsSettingsOpen(false);
  };

  // 处理导入
  const handleImport = async () => {
    if (!importDeckId.trim()) {
      showToast('请输入要导入的卡组ID');
      return;
    }

    try {
      await copyDeck(importDeckId);
      
      // 刷新卡组列表
      await fetchDecks();
      
      // 关闭弹窗
      setIsImportModalOpen(false);
      setImportDeckId('');
      showToast('导入成功');
    } catch (error) {
      console.error('导入卡组失败:', error);
      showToast('导入失败，请检查卡组ID是否正确');
    }
  };

  // 处理卡组名编辑
  const handleNameEdit = async () => {
    if (!selectedDeck) return;
    
    try {
      await updateDeckInfo(
        selectedDeck.id,
        editingName || selectedDeck.deck_name,
        selectedDeck.deck_description
      );
      
      // 刷新卡组列表
      await fetchDecks();
      
      // 关闭编辑状态
      setIsEditingName(false);
      setEditingName('');
      showToast('修改成功');
    } catch (error) {
      console.error('修改卡组名失败:', error);
      showToast('修改失败，请重试');
    }
  };

  // 处理卡组名点击
  const handleNameClick = () => {
    if (selectedDeck) {
      setIsEditingName(true);
      setEditingName(selectedDeck.deck_name);
    }
  };

  // 处理卡组名输入框失焦
  const handleNameBlur = () => {
    if (editingName !== selectedDeck?.deck_name) {
      handleNameEdit();
    } else {
      setIsEditingName(false);
      setEditingName('');
    }
  };

  // 处理卡组名输入框按键
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameEdit();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setEditingName('');
    }
  };

  // 处理复制卡组
  const handleCopy = async () => {
    if (!selectedDeck) return;
    
    try {
      await copyDeck(selectedDeck.id);
      
      // 刷新卡组列表
      await fetchDecks();
      
      // 关闭设置菜单
      setIsSettingsOpen(false);
      
      showToast('卡组复制成功');
    } catch (error) {
      console.error('复制卡组失败:', error);
      showToast('复制失败，请重试');
    }
  };

  // 点击外部关闭设置菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 检查卡组合规性
  const checkDeckValidity = async (deck: Deck) => {
    try {
      if (!deck.is_valid) {
        setDeckValidationErrors([deck.remark || '卡组不合规']);
      } else {
        setDeckValidationErrors([]);
      }
    } catch (error) {
      console.error('检查卡组合规性失败:', error);
      setDeckValidationErrors(['检查卡组合规性失败']);
    }
  };

  // 当选择的卡组改变时，检查合规性
  useEffect(() => {
    if (selectedDeck) {
      checkDeckValidity(selectedDeck);
    } else {
      setDeckValidationErrors([]);
    }
  }, [selectedDeck]);

  // 检测设备类型
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    fetchDecks();
  }, []);

  // 过滤卡组列表
  const filteredDecks = useMemo(() => {
    return decks.filter(deck => 
      deck.deck_name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [decks, searchKeyword]);

  // 处理卡组选择
  const handleDeckSelect = (deck: Deck) => {
    setSelectedDeck(deck);
    setIsStarred(deck.preset === 0);
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden h-screen flex flex-col">
      {/* Toast 提示 */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={handleToastClose} />
      )}

      {/* 顶部栏 */}
      <div className="w-full h-12 flex items-center justify-center border-b text-lg font-bold text-center relative">
        <button
          className="absolute left-4 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm z-10"
          onClick={() => navigate('/')}
        >
          返回
        </button>
        <div>我的卡组</div>
        <button
          className="absolute right-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          onClick={() => setIsImportModalOpen(true)}
        >
          导入卡组
        </button>
      </div>

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧卡组区 - 占30%宽度 */}
        <div className="w-[30%] border-r overflow-y-auto custom-scrollbar">
          <div className="p-4">
            <button
              className="w-full p-1.5 mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="text-xl">+</span>
            </button>
            <div className="space-y-2">
              {decks.map((deck) => (
                <div
                  key={deck.id}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedDeck?.id === deck.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleDeckSelect(deck)}
                >
                  <div className="truncate">{deck.deck_name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧卡牌区 - 占70%宽度 */}
        <div className="w-[70%] flex flex-col">
          <div className="h-12 w-full flex items-center justify-between px-4 border-b">
            <div className="flex items-center w-16">
              <button className="p-1 hover:bg-gray-200 rounded" onClick={() => handleStarClick()}>
                <img src={isStarred ? starIcon : starOutlineIcon} alt="star" className="w-5 h-5" />
              </button>
              <div className="relative group ml-2">
                {deckValidationErrors.length > 0 && (
                  <img src={warningIcon} alt="warning" className="w-5 h-5" />
                )}
                {deckValidationErrors.length > 0 && (
                  <div className="absolute left-0 top-full mt-1 w-64 p-2 bg-yellow-50 border border-yellow-200 rounded shadow-lg text-red-600 text-sm hidden group-hover:block z-50">
                    {deckValidationErrors.map((error, index) => (
                      <div key={index} className="mb-1 last:mb-0">
                        {error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="font-medium text-center flex-1">
              {isEditingName ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={handleNameBlur}
                  onKeyDown={handleNameKeyDown}
                  className="w-full text-center border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
                  autoFocus
                />
              ) : (
                <span 
                  className="cursor-pointer hover:text-blue-500"
                  onClick={handleNameClick}
                >
                  {selectedDeck?.deck_name || '未选择卡组'}
                </span>
              )}
            </div>
            <div className="flex gap-2 w-16 justify-end">
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={() => {
                  if (selectedDeck) {
                    navigate('/cards', { state: { deck: selectedDeck } });
                  } else {
                    alert('请先选择一个卡组');
                  }
                }}
              >
                <img src={editIcon} alt="edit" className="w-5 h-5" />
              </button>
              <div className="relative" ref={settingsRef}>
                <button 
                  className="p-1 hover:bg-gray-200 rounded"
                  onClick={handleSettingsClick}
                >
                  <img src={settingIcon} alt="setting" className="w-5 h-5" />
                </button>
                {isSettingsOpen && (
                  <div className="absolute right-0 mt-1 w-24 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded-t-lg"
                      onClick={() => {
                        setIsRenameModalOpen(true);
                        setNewDeckName(selectedDeck?.deck_name || '');
                        setIsSettingsOpen(false);
                      }}
                    >
                      重命名
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                      onClick={handleShare}
                    >
                      分享
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                      onClick={handleCopy}
                    >
                      复制
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 rounded-b-lg"
                      onClick={() => {
                        handleDelete();
                        setIsSettingsOpen(false);
                      }}
                    >
                      删除
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 新增：导航栏 */}
          <div className="flex border-b h-8 w-full">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex-1 py-1 text-center text-xs font-medium transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 卡片展示区域 */}
          <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-5'} gap-2 w-full px-4 overflow-y-auto`}>
            {selectedDeck && getCurrentZoneCards(selectedDeck).map((card, index) => (
              <div 
                key={index} 
                className="relative border rounded-lg flex items-center justify-center text-gray-500 text-xs bg-white shadow"
              >
                <img
                  src={getCardImageUrl(card.image)}
                  alt={`Card ${card.card_id}`}
                  className="w-full h-full object-cover"
                  onError={handleCardImageError}
                />
                {/* 白色半透明数量条 */}
                <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 py-0.5">
                  <div className="text-center text-xs font-bold">
                    {card.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 创建卡组弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">创建新卡组</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">卡组名称</label>
                <input
                  type="text"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="请输入卡组名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注信息</label>
                <textarea
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="请输入备注信息"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  取消
                </button>
                <button
                  onClick={createNewDeck}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 重命名弹窗 */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">重命名卡组</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">卡组名称</label>
                <input
                  type="text"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="请输入卡组名称"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsRenameModalOpen(false);
                    setNewDeckName('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  取消
                </button>
                <button
                  onClick={handleRename}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 导入弹窗 */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">导入卡组</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">卡组ID</label>
                <input
                  type="text"
                  value={importDeckId}
                  onChange={(e) => setImportDeckId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleImport();
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="请输入要导入的卡组ID"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportDeckId('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  取消
                </button>
                <button
                  onClick={handleImport}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deck;