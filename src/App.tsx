import React from 'react'

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* 顶部栏，占据整行 */}
      <header className="w-full h-20 flex items-center justify-center border-b border-gray-200">
        <span className="font-bold text-xl">卡牌战斗先导者图标</span>
      </header>
      <div className="flex flex-1">
        {/* 左侧区域 */}
        <aside className="flex flex-col items-center justify-center w-1/2 relative">
          <div className="flex flex-col items-center justify-center h-full">
            <DiamondButton text="匹配" size="large" />
            <div className="my-10" />
            <DiamondButton text="房间" size="large" />
          </div>
        </aside>
        {/* 右侧主区域 */}
        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="flex items-center">
            {/* 卡组大区域 */}
            <div className="border-4 border-black w-96 h-96 flex items-center justify-center text-xl font-bold">
              卡组
            </div>
            {/* 预设卡组 */}
            <div className="flex flex-col ml-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="border-4 border-black w-28 h-20 flex items-center justify-center mb-4 last:mb-0"
                >
                  预设卡组{i}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      {/* 底部菜单栏和版本号 */}
      <footer className="w-full flex items-end justify-between px-8 py-2 fixed left-0 right-0 bottom-0 bg-white z-10 border-t border-gray-200">
        <span className="text-xs text-gray-400">版本号</span>
        <div className="flex flex-1 justify-end">
          <div className="flex bg-white rounded-xl px-4 py-2 space-x-6 shadow-lg">
            {['背包', '好友', '对战记录', '关于', '设置'].map((label) => (
              <div
                key={label}
                className="w-16 h-16 rounded-full border-4 border-black flex items-center justify-center text-base font-medium"
                >
                {label}
              </div>
            ))}
          </div>
        </div>
      </footer>
      {/* 预留底部空间，避免内容被footer遮挡 */}
      <div className="h-24" />
    </div>
  )
}

// 长方形按钮，长宽比3:2，圆角，宽度w-48，高度h-32
function DiamondButton({ text, size = 'large' }: { text: string; size?: 'large' | 'normal' }) {
  const sizeClass = size === 'large' ? 'w-48 h-32 text-2xl' : 'w-40 h-24 text-lg'
  return (
    <div className="flex justify-center items-center">
      <div className={`border-4 border-black rounded-xl flex items-center justify-center ${sizeClass}`}>
        <span className="font-bold">{text}</span>
      </div>
    </div>
  )
}

export default App