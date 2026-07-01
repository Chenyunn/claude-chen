# 每日记账 - uni-app 跨端版本

## 项目说明

这是「每日记账」应用的 uni-app 跨端实现版本，兼容：

- ✅ iOS APP
- ✅ Android APP  
- ✅ 微信小程序

功能与浏览器版本完全一致，不包含统计页面的「导出 Excel」功能（需求要求移除）。

## 技术栈

- **框架**: uni-app 3.x + Vue 3 + TypeScript
- **状态管理**: Vuex
- **图表**: 原生 SVG 实现（保持与原项目一致，不引入第三方图表库）
- **构建工具**: Vite

## 页面结构

```
src/
├── api/              # API 接口封装
│   ├── account.ts    # 支付账户 API
│   ├── category.ts   # 分类管理 API
│   ├── food.ts      # 餐饮统计 API
│   ├── statistics.ts # 统计分析 API
│   └── transaction.ts # 交易记录 API
├── pages/           # 页面
│   ├── login/       # 登录页
│   ├── register/    # 注册页
│   ├── index/       # 首页 / 快捷记账
│   ├── records/     # 交易记录
│   ├── food/        # 餐饮明细
│   ├── statistics/  # 统计分析
│   └── profile/     # 个人设置
├── store/          # Vuex 状态管理
│   └── index.ts     # 主 store（包含认证状态）
├── styles/         # 样式
│   └── design-system.css # 设计系统（复制自原项目）
├── types/          # TypeScript 类型定义
└── utils/          # 工具函数
    └── api.ts       # API 封装（适配 uni.request）
```

## 功能清单

| 功能 | 实现状态 | 说明 |
|------|----------|------|
| 用户登录 | ✅ | |
| 用户注册 | ✅ | |
| 快捷记账 | ✅ | 支出/收入切换，分类选择 |
| 交易记录 | ✅ | 搜索、分类筛选、分页加载 |
| 餐饮明细 | ✅ | 子分类筛选、消费分布条形图 |
| 统计分析 | ✅ | SVG 趋势图、SVG 饼图、支出排行 |
| 分类管理 | ✅ | 添加/编辑/删除自定义分类 |
| 个人设置 | ✅ | 修改用户信息、偏好设置 |

## 环境配置

后端 API 地址默认配置为 `http://localhost:8081/api`，与原浏览器版本一致。

如需修改，请在 `src/utils/api.ts` 中修改 `CONFIG.baseURL`。

## 开发运行

### 安装依赖

```bash
npm install
```

### 开发调试

```bash
# H5 开发
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin

# Android APP
npm run dev:app-android

# iOS APP
npm run dev:app-ios
```

### 生产构建

```bash
# H5
npm run build:h5

# 微信小程序
npm run build:mp-weixin

# Android
npm run build:app-android

# iOS
npm run build:app-ios
```

## 设计特点

1. **原汁原味** - 完全复制原浏览器版的配色、布局、交互
2. **纯 SVG 图表** - 与原版保持一致，不引入第三方图表库
3. **响应式设计** - 完美适配手机/平板/桌面各尺寸
4. **类型安全** - 完整 TypeScript 类型定义

## 项目创建日期

2026-06-29
