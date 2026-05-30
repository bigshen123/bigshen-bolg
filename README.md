# 🌍 bigshen的旅行小窝 - 可爱卡通风格旅行分享博客

纯AI生成项目Demo
一个可爱的卡通风格个人旅行分享博客网站，采用前后端分离架构。

## ✨ 特色功能

- 🎨 **随机色调主题**：一键切换配色，每天都有新鲜感
- 🐾 **动物角色系统**：7种可爱的旅行伙伴可选
- 📝 **旅行文章分享**：发布、编辑和管理旅行故事
- 📸 **旅行相册**：照片墙展示，支持懒加载
- 🗺️ **旅行地图**：可视化展示旅行足迹
- 💬 **评论互动**：支持评论和回复功能
- 📱 **响应式设计**：完美适配手机和桌面端

## 🛠 技术栈

### 后端
- Spring Boot 3.2.5
- Spring Security + JWT
- Spring Data JPA
- H2 Database

### 前端
- React 18 + TypeScript
- Tailwind CSS 3.4
- Framer Motion
- React Router
- Vite 5

## 📦 项目结构

```
bigshen-blog/
├── backend/                  # Spring Boot后端
│   ├── src/main/java/com/bigshen/blog/
│   │   ├── config/           # 配置类 (Security, JWT, Web)
│   │   ├── controller/       # REST API控制器
│   │   ├── service/          # 业务逻辑层
│   │   ├── repository/       # 数据访问层
│   │   ├── model/            # 数据实体
│   │   └── dto/              # 数据传输对象
│   └── pom.xml               # Maven配置
├── frontend/                 # React前端
│   ├── src/
│   │   ├── components/       # 可复用组件
│   │   │   ├── common/       # 通用组件
│   │   │   ├── layout/       # 布局组件
│   │   │   └── theme/        # 主题组件
│   │   ├── pages/            # 页面组件
│   │   ├── services/         # API服务
│   │   ├── hooks/            # 自定义Hook
│   │   ├── utils/            # 工具函数
│   │   └── types/            # TypeScript类型
│   └── package.json
└── README.md
```

## 🚀 快速开始

### 前置要求
- JDK 17+
- Node.js 18+
- Maven 3.8+ (后端)
- npm/yarn (前端)

### 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端启动在 `http://localhost:8080`

- H2 Console: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:file:./data/blogdb`

### 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端启动在 `http://localhost:3000`

### 测试账号
- 用户名：`travel_bear`，密码：`123456`
- 用户名：`bunny_travel`，密码：`123456`
- 用户名：`wander_cat`，密码：`123456`

## 🎨 可用的动物角色

| 角色 | 动物 | 描述 |
|------|------|------|
| 🐻 旅行小熊 | 熊 | 最喜欢在森林里露营的小熊 |
| 🐰 蹦蹦兔 | 兔 | 爱拍照的旅行达人兔 |
| 🐱 喵旅者 | 猫 | 慵懒但热爱探索世界的猫咪 |
| 🐶 旺旺探险家 | 狗 | 永远充满活力的旅行伙伴 |
| 🐼 滚滚游记 | 熊猫 | 慢悠悠走遍世界的熊猫 |
| 🦊 火狐迷踪 | 狐狸 | 聪明机智的路线规划师 |
| 🐨 树袋旅人 | 考拉 | 享受慢旅行的考拉君 |

## 📡 API接口

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录

### 文章
- `GET /api/articles` - 文章列表
- `GET /api/articles/{id}` - 文章详情
- `POST /api/articles` - 创建文章
- `PUT /api/articles/{id}` - 更新文章
- `DELETE /api/articles/{id}` - 删除文章
- `POST /api/articles/{id}/like` - 点赞
- `GET /api/articles/search` - 搜索

### 评论
- `GET /api/comments/article/{articleId}` - 获取评论
- `POST /api/comments` - 添加评论
- `POST /api/comments/{commentId}/reply` - 回复评论
