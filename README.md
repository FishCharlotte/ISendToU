# ISendToU

## 项目简介

ISendToU 是一个基于 WebRTC 技术的文件传输网页应用，旨在通过局域网实现快速、便捷的文件共享。用户可以通过简单的操作，在同一局域网内的设备之间传输文件，无需依赖外部服务器。

## 技术栈

- **前端框架**: React
- **语言**: TypeScript
- **构建工具**: rsbuild
- **WebRTC**: 使用 `simple-peer` 实现点对点连接
- **UI**: 使用 Material-UI (MUI) 提供现代化的用户界面
- **后端**: 使用 Koa 提供简单的服务端支持

## 功能特性

- **文件传输**: 支持通过 WebRTC 在局域网内快速传输文件。
- **实时连接**: 使用 WebRTC 实现点对点连接，确保传输速度和隐私。
- **跨平台支持**: 只需浏览器即可使用，无需安装额外软件。
- **现代化界面**: 基于 MUI 提供直观的用户体验。

## 安装与运行

### 1. 安装依赖

使用 `pnpm` 安装项目依赖：

```bash
pnpm install
```

### 2. 启动开发服务器

运行以下命令启动开发服务器：

```bash
pnpm dev
```

开发服务器启动后，浏览器会自动打开项目页面。

### 3. 构建生产版本

运行以下命令构建生产版本：

```bash
pnpm build
```

构建完成后，生成的文件会存放在 `dist/` 目录中。

### 4. 本地预览生产版本

运行以下命令预览生产版本：

```bash
pnpm preview
```

## 项目结构

- **`src/`**: 项目源代码目录
    - **`components/`**: React 组件
    - **`utils/`**: 工具函数
    - **`server/`**: 后端服务代码
- **`public/`**: 静态资源目录
- **`dist/`**: 构建后的生产版本文件
- **`tsconfig.json`**: TypeScript 配置文件
- **`package.json`**: 项目依赖和脚本配置

## 使用说明

1. 打开项目页面后，选择需要发送的文件。
2. 生成连接代码或二维码，分享给接收方。
3. 接收方输入连接代码或扫描二维码，建立连接。
4. 文件传输完成后，接收方可直接下载文件。

## 依赖

### 主要依赖

- `react` / `react-dom`: 用于构建用户界面
- `simple-peer`: 实现 WebRTC 点对点连接
- `@mui/material` / `@mui/icons-material`: 提供现代化 UI 组件
- `express`: 提供后端服务支持
- `@rsbuild/plugin-node-polyfill`: 提供 Node.js polyfill 支持

### 开发依赖

- `typescript`: 提供类型检查
- `tsx`: 用于运行 TypeScript 文件
- `@rsbuild/core`: 构建工具
- `@rsbuild/plugin-react`: React 插件

## 注意事项

- 确保设备在同一局域网内，才能建立 WebRTC 连接。
- 浏览器需支持 WebRTC 技术（如 Chrome、Firefox 等现代浏览器）。

## 许可证

本项目为私有项目，仅供学习和内部使用。
```
