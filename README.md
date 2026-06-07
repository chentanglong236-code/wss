# Orange Hero Section 安装包

这是一个可安装运行的 Vite + React 项目，已集成：

- 橘色 Hero section 页面
- 默认人物图 + 鼠标/触控 spotlight reveal 第二张赛博人物图
- canvas 动态 radial gradient mask
- requestAnimationFrame 平滑跟随
- 动态数字、扰动文字、导航、按钮
- 手机竖屏视觉强制横屏展示，手机横屏紧凑布局

## 运行方式

确保本机已安装 Node.js。

### macOS / Linux

```bash
chmod +x install-and-run.sh
./install-and-run.sh
```

### Windows

双击：

```text
install-and-run.bat
```

或手动运行：

```bash
npm install
npm run dev
```

打开终端提示的本地地址即可查看，例如：

```text
http://localhost:5173
```

## 构建部署

```bash
npm run build
```

构建产物会生成在 `dist/` 目录。

## 文件说明

- `src/HeroSection.jsx`：React 组件主逻辑
- `src/HeroSection.css`：完整样式与移动端横屏适配
- `src/hero-person.png`：默认人物图
- `src/hero-person-reveal.png`：reveal 图层人物图
- `public/standalone-preview.html`：无需安装即可直接打开的静态预览版本
