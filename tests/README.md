# 每日记账 · 测试工程结构

## 概述

本目录为「每日记账」项目的**独立测试工程**，按测试计划分为三端：
- **Backend**（后端）→ Jest + Supertest
- **Frontend**（前端Web）→ Vitest + jsdom
- **UniApp**（跨端APP）→ Vitest + Vue Test Utils

> ⚠️ 测试代码独立于业务代码，不影响现有项目运行。

---

## 目录结构

```
tests/
├── README.md                   # 本文件
├── package.json                # 根编排脚本
│
├── backend/                    # 后端测试 — Jest + Supertest
│   ├── package.json            # 测试依赖
│   ├── jest.config.js          # Jest 配置 + 报告路径
│   ├── setup.js                # 全局环境初始化（测试库）
│   ├── helpers/
│   │   └── testDb.js           # ★ 测试数据库连接池、建表、清理
│   ├── fixtures/
│   │   └── testData.js         # ★ 测试数据工厂（用户/分类/Token）
│   ├── unit/
│   │   └── validators.test.js  # ★ Joi 参数校验 Schema 单元测试
│   └── integration/
│       ├── health.test.js      # ★ 健康检查接口冒烟测试
│       ├── auth.test.js        # ★ 鉴权接口全场景（注册/登录/登出/me）
│       ├── categories.test.js  # ★ 分类管理接口（CRUD+鉴权+越权）
│       └── security.test.js    # ★ 安全专项（Token撤销/CORS/SQL注入）
│
├── frontend/                   # 前端测试 — Vitest + jsdom
│   ├── package.json            # 测试依赖
│   ├── vitest.config.js        # Vitest 配置 + 报告路径
│   ├── setup.js                # ★ jsdom环境 + 加载业务JS模块
│   ├── unit/
│   │   ├── api.test.js         # ★ api.js HTTP封装测试
│   │   ├── auth.test.js        # ★ auth.js 认证业务测试
│   │   └── toast.test.js       # ★ toast.js 通知组件测试
│   └── security/
│       └── xss.test.js         # ★ 前端 XSS 安全验证
│
└── uniapp/                     # uni-app测试 — Vitest + Vue Test Utils
    ├── package.json            # 测试依赖
    ├── vitest.config.ts        # Vitest + Vue 配置
    ├── setup.ts                # ★ uni全局mock + Vue环境
    ├── unit/
    │   ├── store.test.ts       # ★ Vuex Store 状态/变更/操作测试
    │   ├── api.test.ts         # ★ uni.request 封装测试
    │   └── types.test.ts       # ★ TS 类型结构验证
    └── static/
        └── manifest.test.ts    # ★ manifest/pages.json 静态审查
```

---

## 各测试文件作用说明

### Backend（后端测试）

| 文件 | 作用 | 对应测试计划 |
|---|---|---|
| `jest.config.js` | Jest 框架配置：测试匹配、环境变量、JUnit/HTML 报告输出路径 | — |
| `setup.js` | 全局初始化：设置测试环境变量（独立库 `daily_expense_test`），加载 dotenv | — |
| `helpers/testDb.js` | **测试数据库工具**：连接池管理、执行建表 SQL、`truncateTables()` 清理数据、`closePool()` 关闭连接 | L3 数据层 |
| `fixtures/testData.js` | **测试数据工厂**：预置用户/分类数据、bcrypt 密码哈希、JWT Token 生成、数据库插入辅助 | — |
| `unit/validators.test.js` | **Joi Schema 纯逻辑测试**：验证 `registerSchema`（用户名6-20位字母数字、密码6-20位）和 `loginSchema`（rememberMe默认值）的参数校验/边界/默认值 | RG-02~05 |
| `integration/health.test.js` | **健康检查冒烟**：GET /api/health 返回 200 + status/uptime，404 路径返回正确错误 | 环境验证 |
| `integration/auth.test.js` | **鉴权全场景**：注册（合法/冲突/事务/密码哈希）、登录（正确/错误/锁定/rememberMe/计数清零）、登出（revoked_at/Token撤销验证）、获取用户（合法Token/无Token/过期/伪造） | RG-01~07, LG-01~07, LO-01~04, ME-01~04 |
| `integration/categories.test.js` | **分类管理全场景**：列表（过滤/数据结构）、创建（参数校验/重复code/空字段）、修改（部分字段/系统分类保护）、删除（软删除/data不可见）、鉴权（所有接口需Token）、越权（A用户操作B用户分类）、SQL注入（参数化防护） | CAT-01~13 |
| `integration/security.test.js` | **安全专项**：Token撤销验证（SEC-01 P0）、JWT弱密钥兜底（SEC-03 P1）、CORS配置、SQL注入防护（多payload）、密码强度（bcrypt cost=12）、登录爆破防护（5次锁定）、鉴权绕过（空/超长/错误格式Token） | SEC-01~10 |

### Frontend（前端Web测试）

| 文件 | 作用 | 对应测试计划 |
|---|---|---|
| `vitest.config.js` | Vitest 框架配置：jsdom 环境、JUnit 报告输出、`@frontend` 别名 | — |
| `setup.js` | **浏览器环境模拟**：创建 jsdom 实例、Mock fetch/localStorage/AbortController、按依赖顺序加载 api.js→toast.js→auth.js 三个业务模块 | — |
| `unit/api.test.js` | **HTTP 封装测试**：Token存取（setToken/getToken/removeToken/异常容错）、请求构建（baseURL拼接/查询参数/空值过滤/Authorization头/JSON body）、响应处理（code=0正常/code≠0抛异常）、超时（AbortError→408）、网络错误、401自动跳转（清Token/重定向/登录页不跳转） | API-01~04 |
| `unit/auth.test.js` | **认证业务测试**：login（成功保存Token+用户/失败保持未认证/rememberMe布尔转换）、register（成功/失败）、logout（成功清除/finally清除状态）、fetchUser（成功更新currentUser/失败）、checkAuth（无Token→false/有Token成功→true/有Token失败→false并清除） | LN-01~06, RG-01~06 |
| `unit/toast.test.js` | **通知组件测试**：show（DOM创建/默认info类型/success/error/warning/loading类型/关闭按钮/role=alert无障碍）、dismiss（动画移除/immediate跳过动画/无效元素不报错/清除定时器）、maxVisible（超过3个移除最早）、快捷方法（success/error/warning/info/loading）、CSS样式注入（仅一次） | — |
| `security/xss.test.js` | **XSS安全验证**：模拟 profile.html renderCategories 函数，验证 `<img src=x onerror=alert(1)>` 和 `<script>` 标签等 XSS payload 是否被 innerHTML 原样注入（FE-SEC-03→P0缺陷），并提供 textContent 转义修复示例 | FE-SEC-03 |

### UniApp（跨端APP测试）

| 文件 | 作用 | 对应测试计划 |
|---|---|---|
| `vitest.config.ts` | Vitest 框架配置：jsdom环境、`@`别名（与vite.config.ts一致）、Vue Test Utils、JUnit报告 | — |
| `setup.ts` | **uni全局Mock**：创建内存存储模拟 `uni.getStorageSync/setStorageSync/removeStorageSync`、Mock `uni.request/uni.reLaunch` 等导航API、Mock `@dcloudio/uni-app` 生命周期钩子（onLaunch/onShow/onHide），提供 `mockUniRequestSuccess/Fail/401` 快捷函数 | — |
| `unit/store.test.ts` | **Vuex Store 测试**：mutations（SET_TOKEN更新token+isAuthenticated/SET_USER更新用户）、actions（register→commit SET_TOKEN+SET_USER/login→传递rememberMe/logout→finally清除/checkAuth→无token返回false/有token+成功返回true/有token+失败清除）、getters（isAuthenticated/currentUser）、BUG-04验证（rememberMe参数传递） | BUG-04, BUG-06 |
| `unit/api.test.ts` | **uni.request 封装测试**：Token存取（uni.getStorageSync系列）、请求构建（baseURL拼接/GET查询参数/空值过滤/Authorization头）、401处理（removeToken+reLaunch登录页）、UA-SEC-03验证（http baseURL硬编码） | UA-SEC-03 |
| `unit/types.test.ts` | **TS 类型运行时验证**：User/Category/Transaction/Account/PagedResponse/StatisticsSummary/TrendPoint 等接口的结构完整性检查 | — |
| `static/manifest.test.ts` | **静态配置审查**：manifest.json（应用名称/mp-weixin.appid空值→P2/urlCheck关闭→P2/iOS ATS→P2）、pages.json（7页面路由/5 tabBar标签）、XC-08（tabBar图标文件存在性）、STATIC-04（src/static缺失）、关键源文件存在性（9个核心文件） | STATIC-03~04, XC-08, UA-SEC-04~05, UA-SEC-07 |

---

## 快速开始

### 前置条件

- **Node.js** ≥ 16
- **MySQL** 服务运行中（仅后端测试需要，前端/uni-app 测试不需要）
- 项目根目录已 clone

### 安装依赖

```bash
# 在 tests/ 目录下，一键安装所有三端的测试依赖
cd tests
npm run install:all
```

### 运行测试

```bash
# 运行全部测试（三端并行）
npm test

# 或分别运行
npm run test:backend      # 后端接口 + 安全测试（需要 MySQL）
npm run test:frontend     # 前端单元 + XSS 测试
npm run test:uniapp       # uni-app 单元 + 静态审查
```

### 测试报告

所有测试报告输出到 `008.项目测试(测试工程师)/测试报告/`：

| 文件 | 说明 |
|---|---|
| `backend-junit.xml` | 后端测试 JUnit 报告 |
| `frontend-junit.xml` | 前端测试 JUnit 报告 |
| `uniapp-junit.xml` | uni-app 测试 JUnit 报告 |
| `coverage-backend/` | 后端覆盖率报告 |
| `coverage-frontend/` | 前端覆盖率报告 |
| `coverage-uniapp/` | uni-app 覆盖率报告 |

---

## 测试分层对应关系

```
                     ┌──────────────────────────────────┐
 L5  E2E 联调        │  手工联调（不在本工程）            │
                     ├──────────────────────────────────┤
 L4  安全/兼容性     │  backend/security.test.js        │
                     │  frontend/security/xss.test.js   │
                     │  uniapp/static/manifest.test.ts   │
                     ├──────────────────────────────────┤
 L3  功能/UI 测试    │  手工功能测试 + 本工程辅助         │
                     ├──────────────────────────────────┤
 L2  接口测试        │  backend/auth.test.js             │
                     │  backend/categories.test.js       │
                     ├──────────────────────────────────┤
 L1  单元测试        │  backend/unit/validators.test.js  │
                     │  frontend/unit/*.test.js          │
                     │  uniapp/unit/*.test.ts            │
                     ├──────────────────────────────────┤
 L0  静态检查        │  uniapp/manifest.test.ts          │
                     │  npm audit / vue-tsc              │
                     └──────────────────────────────────┘
```

---

## 技术选型理由

| 端 | 框架 | 原因 |
|---|---|---|
| **Backend** | Jest + Supertest | Express 接口测试标准方案；`request(app)` 无需启动服务器；支持 `--forceExit` 清理连接池 |
| **Frontend** | Vitest + jsdom | 原生 JS 无框架，Vitest 零配置 + jsdom 浏览器模拟；比 Jest 更快 |
| **UniApp** | Vitest + Vue Test Utils | 复用 Vite 生态与 `@` 别名；原生 TS 支持 |

---

## 注意事项

1. **后端测试需要 MySQL**：确保 MySQL 服务运行，测试会自动创建 `daily_expense_test` 库
2. **后端测试数据库独立**：使用独立测试库，不会污染开发数据
3. **前端测试需要 Node.js**：使用 jsdom 模拟浏览器，无需真实浏览器
4. **uni-app 测试 mock 了 uni 全局对象**：不依赖真实 App/小程序运行时
5. **已知缺陷标记**：部分测试（如 SEC-01 Token撤销、XSS）仅记录行为不硬断言，等待修复后修改断言
