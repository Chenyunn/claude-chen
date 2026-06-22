# 每日记账 - 前端代码

> 一款轻量、快捷、无负担的个人日常记账工具

## 项目简介

基于 PRD V1.0.1 开发的每日记账应用前端原型，采用现代化的设计系统，支持完整的用户交互流程。

## 页面结构

```
frontend/
├── assets/
│   ├── css/
│   │   └── design-system.css    # 共享设计系统（颜色、字体、间距、组件）
│   └── js/
│       └── (功能脚本预留)
├── pages/
│   ├── login.html              # 登录页
│   ├── register.html           # 注册页
│   ├── index.html             # 首页（快速记账 + 本月概览）
│   ├── index.css              # 首页样式
│   ├── records.html           # 交易记录页
│   ├── records.css            # 交易记录样式
│   ├── statistics.html        # 统计分析页
│   ├── statistics.css        # 统计分析样式
│   ├── profile.html            # 个人设置页
│   └── profile.css             # 个人设置样式
└── components/                 # 公共组件（预留）
```

## 功能页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 登录 | `pages/login.html` | 用户名+密码登录，支持7天免登录 |
| 注册 | `pages/register.html` | 用户名（6-20位字母数字）、密码（6-16位） |
| 首页 | `index.html` | 快速记账、分类选择、本月支出概览、最近记录 |
| 交易 | `pages/records.html` | 全部交易记录，支持按日期筛选 |
| 统计 | `pages/statistics.html` | 月度支出趋势、分类占比、支出明细 |
| 设置 | `pages/profile.html` | 个人信息、账户管理、安全设置、关于 |

## 设计规范

### 色彩系统

| 用途 | 色值 |
|------|------|
| 主色（Primary） | `#864e5a` |
| 主色容器 | `#ffb7c5` |
| 次色（Secondary） | `#655781` |
| 背景色 | `#fbf9f8` |
| 卡片背景 | `#FFF0F3` |
| 错误/支出 | `#ba1a1a` |
| 成功/收入 | `#2E7D32` |

### 字体

- **主字体**: Plus Jakarta Sans
- **中文字体**: Noto Sans SC
- **图标**: Material Symbols Outlined

### 间距系统

基于 4px 基准网格：`xs: 4px`, `sm: 8px`, `md: 16px`, `lg: 24px`, `xl: 32px`

## 技术栈

- **HTML5**: 语义化标签
- **CSS3**: CSS Variables、Tailwind CSS
- **JavaScript**: 原生 ES6+
- **字体**: Google Fonts (Plus Jakarta Sans, Noto Sans SC, Material Symbols)
- **图标**: Material Symbols Outlined

## 快速开始

1. 直接在浏览器中打开 `pages/login.html`
2. 或使用任意本地服务器：

```bash
# Python
python -m http.server 8080

# Node.js
npx serve

# VS Code Live Server
# 右键点击 index.html -> "Open with Live Server"
```

## 页面跳转关系

```
登录页 (login.html)
    ├── 跳转注册 → register.html
    │
    └── 登录成功 → index.html (首页)
                       ├── 首页 → records.html (交易)
                       ├── 首页 → statistics.html (统计)
                       ├── 首页 → profile.html (设置)
                       │
                       └── 退出登录 → login.html

注册页 (register.html)
    └── 注册成功 → index.html (首页)
```

## 功能说明

### 快速记账
- 输入金额 → 选择分类 → 添加备注（可选）→ 保存
- 支持支出/收入切换

### 交易记录
- 按日期分组显示
- 支持筛选（全部/餐饮/购物/交通）
- 可导出报表

### 统计分析
- 月度支出趋势图
- 分类支出占比饼图
- 支出明细列表

### 用户设置
- 个人信息编辑
- 支付账户管理
- 安全设置（修改密码、指纹解锁）
- 消息提醒开关

## 注意事项

- 本原型为静态页面，数据存储使用 localStorage
- 登录注册功能为模拟实现，需配合后端 API
- 设计系统已抽离为单独的 CSS 文件，便于维护

## 版本

- **V1.0.1** (2026-06-17): 新增注册登录功能
- **V1.0** (2026-06-16): 初版发布

## 设计参考

- [Material Design 3](https://m3.material.io/)
- [Plus Jakarta Sans 字体](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
- PRD 文档: `001.产品PRD（产品经理）/002.每日记账-产品需求文档PRD.md`
