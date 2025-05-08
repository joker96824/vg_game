import React from 'react'

interface GameButtonProps {
  text: string
  icon: string
  size?: 'large' | 'normal'
  isActive?: boolean
  onClick?: () => void
}

const GameButton: React.FC<GameButtonProps> = ({ 
  text, 
  icon, 
  size = 'normal', 
  isActive, 
  onClick 
}) => {
  const sizeClass = size === 'large' ? 'w-96 h-96' : 'w-48 h-32'
  const iconSize = size === 'large' ? 'w-24 h-24' : 'w-12 h-12'

  return (
    <div 
      className={`relative ${sizeClass} group`}
      onClick={onClick}
    >
      <div 
        className={`w-full h-full rounded-xl border border-gray-200 flex flex-col items-center justify-center
          transition-all duration-100 ease-in-out cursor-pointer select-none transform-gpu
          ${isActive 
            ? 'scale-95 border-blue-500 bg-blue-50 shadow-inner' 
            : 'hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
          }`}
      >
        <img 
          src={icon} 
          alt={text} 
          className={`${iconSize} transition-transform duration-100
            ${isActive ? 'scale-95' : 'group-hover:scale-110'}`}
        />
        <span className={`font-game text-xl mt-2 transition-colors
          ${isActive ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'}`}>
          {text}
        </span>
      </div>
      {/* 调试信息 */}
      <div className="absolute -top-6 left-0 text-xs text-red-500">
        {isActive ? 'Active!' : ''}
      </div>
    </div>
  )
}

export default GameButton 