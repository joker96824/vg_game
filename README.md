# VG Game

一个使用 Electron + React + TypeScript 构建的跨平台游戏应用。
更新测试

## 技术栈

- Electron
- React
- TypeScript
- Vite
- TailwindCSS
- Redux Toolkit

## 开发环境设置

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
# 仅启动网页版
npm run dev

# 启动桌面应用
npm run electron:dev
```

3. 构建应用：
```bash
# 构建网页版
npm run build

# 构建桌面应用
npm run electron:build
```

## 项目结构

```
vg_game/
├── src/                    # 共享的源代码
│   ├── components/        # 共享组件
│   ├── pages/            # 页面组件
│   ├── services/         # API 服务
│   └── utils/            # 工具函数
├── electron/              # Electron 相关代码
│   ├── main.js           # 主进程
│   └── preload.js        # 预加载脚本
├── web/                   # 网页版特定代码
└── package.json
```

## 开发指南

1. 使用 TypeScript 进行开发
2. 使用 TailwindCSS 进行样式开发
3. 使用 Redux Toolkit 进行状态管理
4. 遵循项目既定的代码规范

## 许可证

ISC 