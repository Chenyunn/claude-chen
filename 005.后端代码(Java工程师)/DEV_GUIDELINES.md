# 财务管家后端项目 - Java开发规范

> 以大厂架构视角制定的开发规范，保证代码质量、可维护性和团队协作效率。

---

## 目录

- [1. 命名规范](#1-命名规范)
- [2. 代码格式](#2-代码格式)
- [3. 注释规范](#3-注释规范)
- [4. 分层设计规范](#4-分层设计规范)
- [5. 异常处理规范](#5-异常处理规范)
- [6. 日志规范](#6-日志规范)
- [7. 数据库操作规范](#7-数据库操作规范)
- [8. API 设计规范](#8-api-设计规范)
- [9. 安全规范](#9-安全规范)
- [10. 版本控制规范](#10-版本控制规范)

---

## 1. 命名规范

### 1.1 包名

- **全部小写**，多个单词用 `.` 分隔，不允许使用下划线
- 格式：`com.{公司/项目}.{模块}.{功能}`
- 本项目规范：
  ```
  com.financemanager.controller   - 控制层
  com.financemanager.service     - 业务服务层
  com.financemanager.mapper      - 数据访问层
  com.financemanager.entity      - 实体类
  com.financemanager.dto         - 数据传输对象
  com.financemanager.config      - 配置类
  com.financemanager.security    - 安全认证
  com.financemanager.exception   - 异常处理
  com.financemanager.common      - 公共工具
  ```

### 1.2 类名

- **大驼峰命名** (UpperCamelCase)
- 遵循语义化，避免缩写（除非是通用缩写如 `DTO`, `HTTP`）
- 分层后缀规范：

| 分层 | 后缀 | 示例 |
|------|------|------|
| Controller | `*Controller` | `UserController` ✅ |
| Service 接口 | `*Service` | `UserService` ✅ |
| Service 实现 | `*ServiceImpl` | `UserServiceImpl` ✅ |
| Mapper | `*Mapper` | `UserMapper` ✅ |
| Entity | 直接名称 | `User` ✅ |
| DTO 请求 | `*Request` | `LoginRequest` ✅ |
| DTO 响应 | `*Response` | `LoginResponse` ✅ |
| 配置类 | `*Config` / `*Configuration` | `WebConfig` ✅ |
| 异常类 | `*Exception` | `BusinessException` ✅ |
| 工具类 | `*Utils` / `*Util` | `DateUtils` ✅ |

**禁止**：
```java
class userController {}  // ❌ 小写开头
class UserControllerImpl {}  // ❌ Controller不需要Impl
class UserInfoData {}  // ❌ 多余后缀
```

### 1.3 方法名 & 变量名

- **小驼峰命名** (lowerCamelCase)
- 方法名：**动词开头**，清晰表达行为
- 变量名：**名词**，清晰表达含义

**CRUD 方法命名规范**：
```java
// 查询
getById(Long id)           // 根据ID查询
listByXxx(condition)      // 根据条件查询列表
pageByXxx(condition)      // 根据条件分页查询
countByXxx(condition)    // 根据条件统计

// 新增
insert(entity) / create(entity)  // 新增

// 更新
update(entity)                // 更新
updateStatus(id, status)      // 更新特定字段

// 删除
deleteById(id)                // 删除

// 判断
existsByXxx(condition)      // 判断是否存在
```

**禁止魔法值**：
```java
// ❌ 不允许
if (status == 1) { ... }

// ✅ 推荐
if (status == Status.ENABLED) { ... }
```

### 1.4 常量名

- **全部大写**，单词用下划线分隔
```java
// ✅ 正确
public static final int DEFAULT_PAGE_SIZE = 20;
public static final String TOKEN_HEADER = "Authorization";

// ❌ 错误
public static final int defaultPageSize = 20;
public static final int DefaultPageSize = 20;
```

### 1.5 文件名

- 类名和文件名保持一致
- 大驼峰命名，和类名一致

---

## 2. 代码格式

### 2.1 缩进

- 使用 **4 个空格** 缩进，**不允许使用 Tab**
- IDE 设置：Editor → Code Style → Java → Indentation → Tab size = 4, Indent = 4

### 2.2 空行

- **包导入后** 空一行
- **类注释后** 空一行
- **方法之间** 空一行
- **代码块内部逻辑分组** 之间适当空一行

**示例**：
```java
package com.financemanager.controller;

import ...;  // 导入后空一行

/**
 * 用户控制器
 */
public class UserController {  // 类注释后空一行

    private final UserService userService;

    public UserController(UserService userService) {  // 构造方法
        this.userService = userService;
    }  // 方法后空一行

    @GetMapping("/profile")
    public Result<User> getProfile(@CurrentUser User currentUser) {
        // 方法内逻辑分组后空一行
        Long userId = currentUser.getId();
        User user = userService.getUserById(userId);

        return Result.success(user);
    }
}
```

### 2.3 换行

- **方法参数**：如果超过 3 个参数或参数总长度超过 120 字符，换行，每个参数一行
- **链式调用**：每个方法调用换行
- **if/for/while**：即使只有一行代码，也必须使用大括号，禁止省略

```java
// ✅ 推荐
if (user == null) {
    throw new BusinessException(ErrorCode.USER_NOT_FOUND);
}

// ❌ 禁止
if (user == null)
    throw new BusinessException(ErrorCode.USER_NOT_FOUND);
```

### 2.4 行长限制

- 单行代码不超过 **120 个字符**
- 超过限制时合理换行

### 2.5 import 规范

- **不使用 * 导入**，明确导入具体类
- 顺序：
  1. 第三方包
  2. 项目内部包
  3. Java 原生包
  4. 静态导入放在最后

---

## 3. 注释规范

> **核心原则**：代码本身自解释，好的代码胜过好的注释。不需要注释说明"做了什么"，只需要说明"为什么这么做"和"复杂逻辑的意图"。

### 3.1 类注释

所有类必须加 Javadoc 注释：
```java
/**
 * 用户认证服务
 * 处理用户注册、登录、登出等认证相关业务
 *
 * @author 姓名
 * @date 2024-xx-xx
 */
@Service
public class AuthServiceImpl implements AuthService {
```

### 3.2 方法注释

**public 方法必须加注释**，private 方法可根据复杂度选择：

```java
/**
 * 用户登录
 * <p>
 * 验证用户名密码，生成JWT Token返回
 * 登录失败会统计失败次数，连续5次锁定30分钟
 *
 * @param request   登录请求（用户名密码）
 * @param clientIp  客户端IP，用于安全记录
 * @param userAgent 客户端UA，用于安全记录
 * @return 登录响应（包含Token和用户信息）
 */
public LoginResponse login(LoginRequest request, String clientIp, String userAgent) {
```

### 3.3 单行注释

- 复杂逻辑分支加单行注释
- 放在代码上方，使用 `//` 空格开头

```java
// 如果锁定时间已过，解除锁定
if (user.getLockedUntil() != null && LocalDateTime.now().isAfter(user.getLockedUntil())) {
    userMapper.updateLocked(user.getId(), 0, null);
}
```

### 3.4 TODO 注释

待办事项使用 `// TODO: 描述 责任人` 格式：
```java
// TODO: 实现分页查询优化 - chenjy 2024-xx-xx
```

### 3.5 禁止

- 禁止注释掉无用代码，直接删除（Git可以找回）
- 禁止在注释中写过时的逻辑
- 禁止自说自话，比如：`// 这是一个构造方法` 这种废话注释

---

## 4. 分层设计规范

### 4.1 分层职责

| 分层 | 职责 | 不允许 |
|------|------|--------|
| **Controller** | 请求参数解析、API路由、统一响应封装 | 不允许放业务逻辑 |
| **Service** | 业务逻辑编排、事务控制、领域逻辑 | 不允许直接操作DB，不允许API参数校验（Controller做） |
| **Mapper** | 数据访问、SQL封装 | 不允许包含业务逻辑 |
| **Entity** | 数据库映射实体 | 不允许包含业务逻辑 |
| **DTO** | 层间数据传输 | 不允许直接用Entity作为API响应 |

### 4.2 设计原则

- **单一职责**：一个类只做一件事
- **依赖倒置**：依赖抽象不依赖具体（Service依赖接口，不依赖实现）
- **不要硬编码**：配置信息放在 `application.yml` 中
- **避免重复代码**：相同逻辑抽成公共方法

### 4.3 参数校验

- **所有入口参数必须校验**（Controller层做）
- 使用 `jakarta.validation` 注解：
```java
@NotBlank(message = "用户名不能为空")
@Size(min = 3, max = 20, message = "用户名长度必须在3-20之间")
private String username;
```

### 4.4 事务使用

- **Service 层**处理事务，`@Transactional` 加在方法上
- 只读方法加 `@Transactional(readOnly = true)` 提高性能
- 异常非运行时异常需要加 `rollbackFor = Exception.class`

```java
@Override
@Transactional(rollbackFor = Exception.class)
public User register(RegisterRequest request) {
    // ...
}
```

---

## 5. 异常处理规范

### 5.1 异常分类

- **参数错误** → 400
- **未认证** → 401
- **无权限** → 403
- **数据不存在** → 404
- **业务异常** → 抛出 `BusinessException`，携带错误码和信息
- **系统异常** → 全局异常处理器统一处理

### 5.2 错误码

- 错误码分段管理：
  - `1xx` 通用错误
  - `2xx` 认证错误
  - `3xx` 用户错误
  - `4xx` 分类错误
  - `5xx` 交易错误
  - `6xx` 账户错误

- 在 `ErrorCode` 枚举中统一定义，禁止散落在代码中

### 5.3 规范

```java
// ✅ 正确
if (user == null) {
    throw new BusinessException(ErrorCode.USER_NOT_FOUND);
}

// ❌ 错误
return Result.error("用户不存在");  // 不允许在Controller中直接返回错误，抛异常让全局处理器处理
```

### 5.4 禁止

- 禁止捕获异常后什么都不做（吞异常）
- 禁止 `catch (Exception e) { throw new RuntimeException(e); }` 这种无意义包装
- 禁止在finally中抛出异常

---

## 6. 日志规范

### 6.1 日志级别使用

| 级别 | 使用场景 |
|------|----------|
| `error` | 影响业务流程的错误，需要告警处理 |
| `warn` | 不影响主流程的问题，需要关注 |
| `info` | 关键业务节点记录，生命周期事件 |
| `debug` | 开发调试信息，生产环境默认不开启 |

### 6.2 日志输出规范

```java
// ✅ 推荐
log.warn("用户登录失败，用户名不存在: {}", username);
log.error("数据库连接失败", e);  // 异常信息带上堆栈

// ❌ 禁止
log.info("进入方法" + username);  // 字符串拼接，影响性能，使用占位符
System.out.println("debug");  // 禁止使用System.out打印日志
```

### 6.3 日志打印要点

- **异常必须打堆栈**：`log.error("描述", e)`
- **参数中包含用户敏感信息禁止打日志**（密码、手机号、身份证等）
- **核心业务流程必须有日志**（登录、支付、创建订单等关键节点）

---

## 7. 数据库操作规范

### 7.1 表设计规范

- 必备字段：
  ```sql
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间'
  ```
- 主键使用 `BIGINT UNSIGNED AUTO_INCREMENT`
- 所有表必须加注释 `COMMENT`
- 字段必须加注释 `COMMENT`
- 布尔字段用 `TINYINT(1)` 或 `BOOLEAN`
- 存储金额用 `DECIMAL(12,2)`，禁止用 `FLOAT`/`DOUBLE`（精度问题）
- 使用软删除 `deleted_at`，不物理删除数据

### 7.2 MyBatis 使用规范

- **Mapper 接口 + XML 映射**方式，不允许全注解
- Mapper 接口上加 `@Mapper` 注解
- 结果映射使用 `<resultMap>`，不依赖自动映射
- 动态SQL使用 `<sql>` 片段复用
- 分页使用物理分页，不允许内存分页
- in 查询数量不超过 1000 个

### 7.3 SQL 编写规范

```xml
<!-- ✅ 正确：使用 <where> 自动处理AND，避免多余AND -->
<select id="findByUserPage">
    SELECT * FROM transactions t
    <where>
        t.user_id = #{userId} AND t.deleted_at IS NULL
        <if test="type != null">AND t.type = #{type}</if>
    </where>
</select>
```

- **禁止SELECT ***，只查需要的字段
- **禁止大表全表扫**，必须加索引
- 复杂报表查询可以使用数据库视图（本项目已经提供统计视图）

### 7.4 分页规范

- 分页参数默认：`page = 1`，`pageSize = 20`
- 分页结果包装成 `PageResult<T>`

---

## 8. API 设计规范

### 8.1 URL 命名

- 全部小写，用 `-` 分隔单词
- 复数命名：`/users`、`/transactions`
- 资源层级：`/categories/{categoryId}/subcategories`

**示例**：
```
POST   /api/auth/login          ✅
GET    /api/users/profile       ✅
GET    /api/transactions        ✅
POST   /api/transactions        ✅
GET    /api/transactions/{id}   ✅
PUT    /api/transactions/{id}   ✅
DELETE /api/transactions/{id}   ✅
```

### 8.2 HTTP 方法

| 方法 | 用途 |
|------|------|
| `GET` | 获取资源/查询 |
| `POST` | 创建资源 |
| `PUT` | 更新资源 |
| `DELETE` | 删除资源 |

### 8.3 统一响应格式

所有API统一返回格式：
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

- `code = 200` → 成功
- `code != 200` → 失败，`message` 描述错误
- Controller 不需要处理异常，直接抛异常，全局异常处理器统一包装

### 8.4 分页查询响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

### 8.5 认证

- 使用 JWT Token 认证
- Token 放在请求头：`Authorization: Bearer {token}`
- 需要认证的接口被拦截器拦截，不需要在每个方法参数写

---

## 9. 安全规范

### 9.1 密码

- **绝对禁止明文存储密码**，使用 BCrypt 加密
- 密码验证：`passwordEncoder.matches(rawPassword, encodedPassword)`

### 9.2 SQL注入

- 使用 MyBatis `#{}`, 不使用 `${}` （除非是排序字段等必须动态的场景）
- 禁止拼接SQL

### 9.3 越权检查

- 必须做**用户权限校验**：用户只能操作自己的数据
```java
// ✅ 必须校验
Transaction transaction = transactionMapper.findByUserAndId(currentUserId, transactionId);
if (transaction == null) {
    throw new BusinessException(ErrorCode.TRANSACTION_NOT_FOUND);
}
```

### 9.4 敏感信息

- 返回给前端时，去掉敏感信息（密码哈希、token哈希等）
- 日志不打印敏感信息

---

## 10. 版本控制规范

### 10.1 Git Commit 信息格式

```
<type>: <description>

[可选] body 详细描述
```

**type** 可选值：
- `feat`: 新增功能
- `fix`: 修复bug
- `docs`: 文档修改
- `style`: 代码格式修改，不影响代码逻辑
- `refactor`: 重构（既不新增功能也不修复bug）
- `perf`: 性能优化
- `test`: 测试代码修改
- `chore`: 构建/工具相关修改

**示例**：
```
feat: 添加交易月度统计功能
fix: 修复登录锁定时间判断错误
docs: 更新API文档
```

### 10.2 分支开发

- `main` / `master`: 主分支，稳定可发布版本
- 开发新功能：从主分支拉出 feature 分支，开发完成合并回去
- 修复bug：拉出 bugfix 分支，修复后合并

---

## 11. 本项目特定规范

1. **包路径**：所有代码放在 `com.financemanager` 下
2. **MyBatis XML**：放在 `src/main/resources/mapper/` 下，文件名和 Mapper 接口一致
3. **配置**：开发配置放在 `application.yml`，生产配置放在 `application-prod.yml`
4. **端口**：后端服务端口 `8081`，避免和前端Node.js后端（8080）冲突
5. **跨域**：已经在 `WebConfig` 中配置全局跨域，不需要额外处理

---

## 检查清单（Code Review 要点）

- [ ] 命名是否符合规范？
- [ ] 注释是否清晰？有没有废话注释？
- [ ] 参数校验做了吗？
- [ ] 异常处理正确吗？有没有吞异常？
- [ ] 事务加对了吗？
- [ ] 权限越权检查做了吗？
- [ ] SQL有没有注入风险？
- [ ] 敏感信息有没有泄露到日志？
- [ ] 硬编码有没有？配置是否正确抽取？
- [ ] 代码分层是否清晰？Controller有没有放业务逻辑？

---

> **大道至简，可读胜于完美**
>
> 写代码的目标：让接手的人能看懂、能快速定位问题、能安全修改。

