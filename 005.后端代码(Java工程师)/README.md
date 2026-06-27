# 财务管家 - 后端 Java API 服务

## 项目介绍

「财务管家」是一个个人财务管理应用，后端基于 **Spring Boot + MyBatis** 构建，提供 RESTful API 服务。

## 技术栈

- **Java 版本**: 17
- **框架**: Spring Boot 3.2.4
- **ORM**: MyBatis 3.0.4
- **数据库**: MySQL 9.x
- **认证**: JWT
- **构建工具**: Maven
- **密码加密**: BCrypt

## 项目结构

```
finance-manager/
├── src/main/java/com/financemanager/
│   ├── FinanceManagerApplication.java      # 启动类
│   ├── controller/                         # REST API 控制层
│   │   ├── AuthController.java            # 认证接口
│   │   ├── UserController.java            # 用户接口
│   │   ├── CategoryController.java        # 分类接口
│   │   ├── TransactionController.java     # 交易流水接口
│   │   ├── AccountController.java         # 支付账户接口
│   │   └── ReportController.java          # 统计报表接口
│   ├── service/                            # 业务逻辑层
│   │   ├── interfaces/                    # 服务接口
│   │   └── impl/                          # 服务实现
│   ├── mapper/                             # MyBatis Mapper
│   ├── entity/                             # 数据库实体
│   ├── dto/                                # 请求/响应 DTO
│   │   ├── request/
│   │   └── response/
│   ├── config/                             # 配置类
│   ├── security/                           # 安全认证
│   │   ├── JwtUtil.java                   # JWT工具
│   │   ├── TokenInterceptor.java          # Token拦截器
│   │   ├── UserContext.java               # 用户上下文
│   │   └── ...
│   ├── exception/                          # 异常处理
│   └── common/                             # 公共工具类
├── src/main/resources/
│   ├── application.yml                     # 配置文件
│   └── mapper/                             # MyBatis XML映射文件
└── pom.xml
```

## 环境要求

- JDK 17+
- Maven 3.6+
- MySQL 8.0+

## 快速开始

### 1. 初始化数据库

执行数据库脚本：
```bash
# 脚本位置在项目根目录上级
../004.数据库脚本（数据库管理员DBA）/001_daily_expense_schema.sql
```

### 2. 修改数据库配置

编辑 `src/main/resources/application.yml`，修改数据库连接信息：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/daily_expense...
    username: your-username
    password: your-password
```

### 3. 编译运行

```bash
# 编译
mvn clean package -DskipTests

# 运行
java -jar target/finance-manager-1.0.0-SNAPSHOT.jar
```

或者直接在 IDE 中运行 `FinanceManagerApplication.java` 启动类。

### 4. 访问服务

服务地址: http://localhost:8081/api

## API 接口列表

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/logout` | POST | 用户登出 |
| `/api/auth/me` | GET | 获取当前用户信息 |
| `/api/user/profile` | GET | 获取用户资料 |
| `/api/user/profile` | PUT | 更新用户资料 |
| `/api/user/settings` | GET | 获取用户设置 |
| `/api/user/settings` | PUT | 更新用户设置 |
| `/api/categories` | GET | 获取分类列表 |
| `/api/categories` | POST | 创建自定义分类 |
| `/api/categories/{id}` | PUT | 更新分类 |
| `/api/categories/{id}` | DELETE | 删除分类 |
| `/api/categories/{id}/subcategories` | GET | 获取子分类列表 |
| `/api/transactions` | GET | 分页查询交易 |
| `/api/transactions` | POST | 创建交易 |
| `/api/transactions/{id}` | GET | 获取交易详情 |
| `/api/transactions/{id}` | PUT | 更新交易 |
| `/api/transactions/{id}` | DELETE | 删除交易 |
| `/api/accounts/types` | GET | 获取账户类型列表 |
| `/api/accounts` | GET | 获取用户账户列表 |
| `/api/accounts` | POST | 创建账户 |
| `/api/accounts/{id}` | PUT | 更新账户 |
| `/api/accounts/{id}` | DELETE | 删除账户 |
| `/api/accounts/{id}/set-default` | POST | 设置默认账户 |
| `/api/report/monthly` | GET | 月度汇总统计 |
| `/api/report/monthly-category` | GET | 月度分类统计 |

## 认证方式

使用 **JWT Token** 认证，在请求头中携带：
```
Authorization: Bearer <your-token>
```

登录成功后返回 token，后续请求需要带上 token。

## 开发说明

- 使用 Lombok 减少样板代码，请确保 IDE 安装了 Lombok 插件
- MyBatis 使用 XML 映射文件方式，SQL 与代码分离，便于维护
- 统一使用 `Result<T>` 封装 API 响应
- 软删除使用 `deleted_at` 字段，不物理删除数据

## 许可证

MIT
