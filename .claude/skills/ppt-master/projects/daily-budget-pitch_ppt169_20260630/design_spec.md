# Design Specification & Content Outline — 每日记账 投资人路演

## I. Project Information
- **Project name**: daily-budget-pitch（每日记账 · 投资人路演 Pitch Deck）
- **Canvas**: PPT 16:9 (1280×720)
- **Page count**: 5
- **Style**: showcase mode + 品牌粉·深色科技感 visual style
- **Audience**: 天使 / VC 投资人
- **Scenario**: 多人路演、拉投资
- **Delivery purpose**: balanced（既投屏演讲，也会被传阅）；body 24px
- **Content strategy / divergence**: balanced——基于项目真实资料（PRD、产品说明书、测试计划、运营手册）重组为投资叙事；不虚构功能与数据，市场规模类数字标注为行业测算。
- **Date**: 2026-06-30

## II. Canvas Specification
- Format 1280×720, viewBox `0 0 1280 720`, margins 40px, safe area 1200×640.

## III. Visual Theme
- **Style**: 深色科技感，延续产品「每日记账」品牌粉/珊瑚橙基因；深底 + 暖色渐变高光 + 弥散光斑。
- **Theme**: dark
- **Color scheme**:

| Role | HEX | Use |
|------|-----|-----|
| background | `#1A1320` | 页面深底 |
| secondary_bg | `#241A2E` | 卡片/面板 |
| surface | `#2E2238` | 抬升面板 |
| grid | `#3A2C44` | 分隔/网格细线 |
| primary | `#FF6B8A` | 蜜桃粉主强调 |
| accent | `#FF8C6B` | 珊瑚橙副强调 |
| secondary_accent | `#FFD479` | 暖金高光/数字 |
| body_text | `#EDE6EC` | 正文 |
| muted_text | `#A99FB0` | 次要文字 |
| positive | `#7CE7C0` | 正向/已实现 |

- 渐变：`#FF6B8A → #FF8C6B → #FFD479`（标题描金、强调）。
- **Image Rendering**: none（无 AI 配图）
- **Image Palette**: none

## IV. Typography System
- **Title**: `"Microsoft YaHei", SimHei, sans-serif`（黑体，承担力量感）
- **Body**: `"Microsoft YaHei", "PingFang SC", sans-serif`
- Font sizes (px): cover_title 96 · hero_number 84 · page_title 44 · subtitle 30 · lead 28 · body 24 · annotation 18 · footnote 15
- Formula policy: text-only。

## V. Layout Principles
- 深底 + 弥散光斑（右上粉、左下橙），每页页脚品牌点 + 页码。
- 封面单栏聚焦；痛点左右分栏；卖点三栏 + 巨型数字；市场左右分栏 + 大数字卡；路线图三段 + Ask 双卡。
- page_rhythm：P01 anchor / P02 dense / P03 anchor / P04 dense / P05 dense。

## VI. Icon Usage Spec
- **Source**: 内置图标库 `tabler-filled`（圆润、现代、专业），统一一套。
- **Placeholder**: `<use data-icon="tabler-filled/<name>" .../>`
- **Inventory**（已 sync 到 `icons/tabler-filled/`）: bolt, heart, flame, mood-sad, clock, discount, chart-pie-3, chart-area-line, chart-grid-dots, user, device-mobile, seedling, coin-euro, cash-banknote, pig, circle-check, bell-ringing-2, calendar-month, sparkles, crown, award, flag-3, diamond, star, quote。

## VII. Visualization Reference List
Catalog read: 本 deck 为路演叙事页，数字以 KPI 卡 / 巨型数字原生 SVG 表达，不套用图表模板。无 `page_charts` 条目。

## VIII. Image Resource List
无图片（option A）。VC 路演纯 SVG + 图标，环境无 AI 图像后端，避免占位空图。

## IX. Content Outline

### P01 — 封面（anchor）
- **Layout**: 单栏聚焦，左对齐；右上弥散光斑
- **Core message**: 让记账像发朋友圈一样轻
- **Cover impact**: hook = 核心主张「一秒记账」；composition = 高对比 typographic poster + 渐变描金主标题 + 品牌 logo 块
- **Blocks**:
  - Logo 块 🐷 每日记账 DailyBudget
  - eyebrow：投资人路演 · 天使轮
  - 主标题：让记账像「发朋友圈」一样轻
  - slogan：一秒记账，清楚花钱
  - 一句话副文：用极致轻量 + 习惯养成，解决记账产品「留不住人」的根本问题
  - meta：三端 Web·iOS·Android·小程序 / 2026.06 / 寻求天使轮融资

### P02 — 痛点与机会（dense）
- **Layout**: 左右分栏，左痛点列表 4 项，右洞察
- **Core message**: 人人都想记账，没人能坚持
- **Blocks**:
  - 左 4 痛点（icon + 标题 + 说明）：步骤繁琐(clock) / 容易忘记(mood-sad) / 三分钟热度(flame) / 看不懂数据(chart-pie-3)
  - 右洞察：现有产品要么太重（随手记、鲨鱼记账），要么绑生态分类粗（支付宝记账本）；真正的缺口是够轻、无广告、能让人坚持——这就是我们的切入点

### P03 — 核心卖点（anchor，吸睛主页）
- **Layout**: 顶部标题 + 巨型数字「5秒」，中部三卖点卡，底部 4 KPI
- **Core message**: 三个字打穿市场——轻·快·黏
- **Blocks**:
  - hero number：5秒（单笔记账目标耗时）
  - 卡1 极致的快(bolt)：一镜直达，金额→分类→保存三步，打开即聚焦
  - 卡2 足够的轻(heart)：无广告、不绑生态、零学习成本，粉嫩温暖
  - 卡3 留得住的黏(flame)：连续打卡+周报+餐饮复盘，直击留存
  - KPI：<5s 单笔 / >40% 次日留存目标 / ≥2笔 人均日记账 / 0 广告干扰

### P04 — 产品与进展（dense）
- **Layout**: 左右分栏，左功能清单（已实现/规划），右技术栈 + 阶段卡
- **Core message**: 三端已落地，核心链路真实可跑
- **Blocks**:
  - 左已实现(circle-check)：注册登录(JWT+bcrypt)、快速记账、分类管理、交易记录、餐饮分析、统计图表
  - 左规划中(sparkles)：云同步换机恢复、账单导出、后台运营系统
  - 右技术栈：Spring Boot + MyBatis + MySQL；uni-app(Vue3) 一套代码三端
  - 右阶段卡：MVP 已成型，核心链路打通，进入内测打磨期
  - 脚注：云同步/导出为下一阶段，按真实状态标注，不超前承诺

### P05 — 市场、路线图与融资诉求（dense）
- **Layout**: 上市场大数字行(3) + 中路线图三段 + 下 Ask 双卡
- **Core message**: 高频刚需 + 清晰路线，期待与你同行
- **Closing impact**: leave-with = 这是一个高频、可留存、避开巨头正面战场的赛道；composition = 大数字 + 三段路线 + 融资 Ask 双卡 + 收尾 slogan
- **Blocks**:
  - 市场大数字：2.6亿 移动支付年轻人(user) / 高频刚需 每天2+次(calendar-month) / 差异化 最轻无广告(crown)
  - 路线图：种子期(0–3月 seedling) 核心打磨+50–200内测 / 增长期(3–9月 chart-area-line) 云同步+内容矩阵，D7>20% / 商业化(9月+ coin-euro) 导出/会员/数据洞察
  - Ask 双卡：天使轮(cash-banknote) 团队+产品+冷启动 / 12个月里程碑(flag-3) 10万注册用户验证模型
  - 收尾：让记账重新变得简单——一秒记账，清楚花钱

## X. Speaker Notes Requirements
- 每页一文件，对应 SVG 名；conversational + persuasive；总时长约 5–6 分钟（路演节奏）。

## XI. Technical Constraints Reminder
- 纯静态 SVG，viewBox `0 0 1280 720`；字体仅用 PPT 安全字体；图标用 `<use data-icon>`；无外链图片；颜色仅取 spec_lock。
