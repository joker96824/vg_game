import React, { useEffect, useRef, useState } from 'react';
import { searchUsers } from '../services/authService';
import { sendFriendRequest, getFriendRequests, acceptFriendRequest, rejectFriendRequest, getFriends, deleteFriend } from '../services/friendService';
import { useNavigate } from 'react-router-dom';

interface FriendMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { left: number; bottom: number } | null;
  onStartChat?: (friend: Friend) => void;
}

interface SearchResult {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
}

interface FriendRequest {
  id: string;
  message: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  create_time: string;
  update_time: string;
  is_deleted: boolean;
  sender_nickname: string;
  receiver_nickname: string;
}

interface Friend {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  is_blocked: boolean;
  friend_id: number;
  friend_username: string;
  friend_nickname: string;
  friend_avatar: string;
}

const FriendMenu: React.FC<FriendMenuProps> = ({ isOpen, onClose, position, onStartChat }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const searchModalRef = useRef<HTMLDivElement>(null);
  const requestModalRef = useRef<HTMLDivElement>(null);
  const friendListModalRef = useRef<HTMLDivElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isFriendListOpen, setIsFriendListOpen] = useState(false);
  const [isSendRequestOpen, setIsSendRequestOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentUserNickname, setCurrentUserNickname] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [friendToDelete, setFriendToDelete] = useState<Friend | null>(null);
  const deleteConfirmModalRef = useRef<HTMLDivElement>(null);
  const [hasFriendRequests, setHasFriendRequests] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 从 localStorage 获取当前用户信息
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserNickname(user.nickname || '');
      } catch (error) {
        console.error('解析用户信息失败:', error);
      }
    }
  }, []);

  useEffect(() => {
    const hasRequests = localStorage.getItem('hasFriendRequests') === 'true';
    setHasFriendRequests(hasRequests);
  }, [isOpen]);

  // 获取好友请求列表
  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const requests = await getFriendRequests();
        setPendingRequests(requests);
      } catch (error) {
        console.error('获取好友请求失败:', error);
      }
    };

    if (isRequestOpen) {
      fetchFriendRequests();
    }
  }, [isRequestOpen]);

  // 获取好友列表
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await getFriends();
        setFriends(data.filter((friend: Friend) => !friend.is_blocked));
      } catch (error) {
        console.error('获取好友列表失败:', error);
      }
    };

    if (isFriendListOpen) {
      fetchFriends();
    }
  }, [isFriendListOpen]);

  // 处理点击外部关闭弹窗
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSearchOpen) {
        if (searchModalRef.current && !searchModalRef.current.contains(event.target as Node)) {
          setIsSearchOpen(false);
          setSearchKeyword('');
          setSearchResults([]);
        }
      } else if (isSendRequestOpen) {
        if (requestModalRef.current && !requestModalRef.current.contains(event.target as Node)) {
          setIsSendRequestOpen(false);
          setSelectedUser(null);
          setRequestMessage('');
        }
      } else if (isRequestOpen) {
        if (requestModalRef.current && !requestModalRef.current.contains(event.target as Node)) {
          setIsRequestOpen(false);
        }
      } else if (isDeleteConfirmOpen) {
        if (deleteConfirmModalRef.current && !deleteConfirmModalRef.current.contains(event.target as Node)) {
          setIsDeleteConfirmOpen(false);
          setFriendToDelete(null);
        }
      } else if (isFriendListOpen) {
        if (friendListModalRef.current && !friendListModalRef.current.contains(event.target as Node)) {
          setIsFriendListOpen(false);
        }
      } else {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, isSearchOpen, isSendRequestOpen, isRequestOpen, isDeleteConfirmOpen, isFriendListOpen]);

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchUsers(searchKeyword);
      setSearchResults(results);
    } catch (error) {
      console.error('搜索好友失败:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!selectedUser || !requestMessage.trim()) return;

    setIsSending(true);
    try {
      await sendFriendRequest(selectedUser.id, requestMessage);
      setToastMessage({ type: 'success', message: '发送好友请求成功' });
    } catch (error) {
      console.error('发送好友请求失败:', error);
      setToastMessage({ 
        type: 'error', 
        message: error instanceof Error ? error.message : '发送好友请求失败'
      });
    } finally {
      setIsSending(false);
      setIsSendRequestOpen(false);
      setSelectedUser(null);
      setRequestMessage('');
    }
  };

  // 处理好友申请
  const handleFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      if (action === 'accept') {
        await acceptFriendRequest(requestId);
      } else {
        await rejectFriendRequest(requestId);
      }
      
      setToastMessage({ 
        type: 'success', 
        message: action === 'accept' ? '已同意好友申请' : '已拒绝好友申请'
      });
      
      // 重新获取好友请求列表
      const requests = await getFriendRequests();
      setPendingRequests(requests);
      // 更新localStorage中的状态
      localStorage.setItem('hasFriendRequests', requests.length > 0 ? 'true' : 'false');
      setHasFriendRequests(requests.length > 0);
    } catch (error) {
      console.error('处理好友申请失败:', error);
      setToastMessage({ 
        type: 'error', 
        message: error instanceof Error ? error.message : '处理好友申请失败'
      });
    }
  };

  // 处理删除好友
  const handleDeleteFriend = async () => {
    if (!friendToDelete) return;

    try {
      await deleteFriend(friendToDelete.friend_id);
      setToastMessage({ type: 'success', message: '删除好友成功' });
      // 重新获取好友列表
      const data = await getFriends();
      setFriends(data.filter((friend: Friend) => !friend.is_blocked));
    } catch (error) {
      console.error('删除好友失败:', error);
      setToastMessage({ 
        type: 'error', 
        message: error instanceof Error ? error.message : '删除好友失败'
      });
    } finally {
      setIsDeleteConfirmOpen(false);
      setFriendToDelete(null);
    }
  };

  // 自动关闭提示消息
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!isOpen || !position) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div 
        className="fixed bg-white rounded-lg shadow-lg z-50 w-48"
        style={{
          left: position?.left,
          bottom: position?.bottom ? position.bottom + 10 : 'auto',
          top: position?.bottom ? 'auto' : '50%',
          transform: position?.bottom ? 'none' : 'translateY(-50%)',
        }}
      >
        <div className="py-1">
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={() => {
              setIsSearchOpen(true);
            }}
          >
            添加好友
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 relative"
            onClick={() => {
              setIsRequestOpen(true);
            }}
          >
            好友申请
            {hasFriendRequests && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
              </span>
            )}
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={() => {
              setIsFriendListOpen(true);
            }}
          >
            好友列表
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={() => {
              // TODO: 处理黑名单
              onClose();
            }}
          >
            黑名单
          </button>
        </div>
      </div>

      {/* 搜索好友弹窗 */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            ref={searchModalRef}
            className="bg-white rounded-lg p-4 w-96"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">搜索好友</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSearchOpen(false);
                  setSearchKeyword('');
                  setSearchResults([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="输入用户名或昵称搜索"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isSearching ? '搜索中...' : '搜索'}
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={user.avatar}
                          alt={user.nickname}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{user.nickname}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                      <button
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                          setRequestMessage(`你好，我是${currentUserNickname}`);
                          setIsSendRequestOpen(true);
                          setIsSearchOpen(false);
                        }}
                      >
                        添加
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchKeyword && !isSearching ? (
                <div className="text-center text-gray-500 py-4">
                  未找到相关用户
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* 发送好友请求弹窗 */}
      {isSendRequestOpen && selectedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            ref={requestModalRef}
            className="bg-white rounded-lg p-4 w-96"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">发送好友请求</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSendRequestOpen(false);
                  setSelectedUser(null);
                  setRequestMessage('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.nickname}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-medium">{selectedUser.nickname}</div>
                  <div className="text-sm text-gray-500">@{selectedUser.username}</div>
                </div>
              </div>

              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="请输入验证消息"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSendRequestOpen(false);
                  setSelectedUser(null);
                  setRequestMessage('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendRequest();
                }}
                disabled={isSending || !requestMessage.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isSending ? '发送中...' : '确认'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 好友申请列表弹窗 */}
      {isRequestOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            ref={requestModalRef}
            className="bg-white rounded-lg p-4 w-96"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">好友申请</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRequestOpen(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
              {pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 border border-gray-200 rounded-lg relative"
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium mb-2">{request.sender_nickname}</div>
                        <div className="flex gap-2">
                          <button
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFriendRequest(request.id, 'reject');
                            }}
                          >
                            ✕
                          </button>
                          <button
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-green-500 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFriendRequest(request.id, 'accept');
                            }}
                          >
                            ✓
                          </button>
                        </div>
                      </div>
                      <div className="text-gray-600">{request.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  暂无好友申请
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 好友列表弹窗 */}
      {isFriendListOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            ref={friendListModalRef}
            className="bg-white rounded-lg p-4 w-96"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">好友列表</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFriendListOpen(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
              {friends.length > 0 ? (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={friend.friend_avatar}
                          alt={friend.friend_nickname}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="font-medium">{friend.friend_nickname}</div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            if (onStartChat) {
                              onStartChat(friend);
                              onClose();
                              setIsFriendListOpen(false);
                            }
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setFriendToDelete(friend);
                            setIsDeleteConfirmOpen(true);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  暂无好友
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {isDeleteConfirmOpen && friendToDelete && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            ref={deleteConfirmModalRef}
            className="bg-white rounded-lg p-4 w-80"
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium mb-2">确认删除</h3>
              <p className="text-gray-600">
                确定要删除好友 <span className="font-medium">{friendToDelete.friend_nickname}</span> 吗？
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteConfirmOpen(false);
                  setFriendToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFriend();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 提示消息 */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[80]">
          <div className={`px-4 py-2 rounded-lg shadow-lg ${
            toastMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {toastMessage.message}
          </div>
        </div>
      )}
    </>
  );
};

export default FriendMenu; 