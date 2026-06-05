# Context: 补全文章收藏功能前端闭环

> 生成时间: 2026-06-05 | 生成者: CodeBuddy + @hljy
> 本文档描述启动本变更时的系统现状，作为 01-04 的共享前提。

## 1. 业务背景（Business Context）

用户浏览旅行文章时，希望标记自己喜欢的文章以便日后回顾。代码库已有收藏功能的后端完整实现和前端部分页面（独立收藏页、个人中心收藏 Tab），但**「收藏操作入口」缺失**——用户在文章详情页和文章列表中看不到收藏按钮，无法在阅读时一键收藏。

本次变更聚焦：打通收藏功能的前端闭环，让用户在文章详情页和列表页面可以执行收藏/取消收藏操作。

（来源：`goal` + 代码排查）

## 2. 系统现状（Current State）

### 2.1 完整度排查结论

| 组件 | 层 | 文件 | 状态 |
|---|---|---|---|
| Favorite Entity | 后端 | `model/Favorite.java` | ✅ 已有 (@ManyToOne→User, @ManyToOne→Article，唯一约束 userId+articleId) |
| FavoriteRepository | 后端 | `repository/FavoriteRepository.java` | ✅ 已有 (CRUD + existsBy + countBy) |
| FavoriteService | 后端 | `service/FavoriteService.java` | ✅ 已有 (add/remove/isFavorited/getUserFavorites/getFavoriteCount) |
| FavoriteController | 后端 | `controller/FavoriteController.java` | ✅ 已有 (5 个端点) |
| favoriteService.ts | 前端 API | `services/favoriteService.ts` | ✅ 已有 (4 个方法: 增/删/查/判断) |
| FavoritesPage | 前端页面 | `pages/FavoritesPage.tsx` | ✅ 已有 (独立收藏列表页，路由 `/favorites`) |
| ProfilePage 收藏 Tab | 前端页面 | `pages/ProfilePage.tsx` | ✅ 已有 ("我的收藏" Tab，可查看收藏列表) |
| **ArticlePage 收藏按钮** | **前端页面** | `pages/ArticlePage.tsx` | **❌ 缺失** — 互动区仅有 点赞/评论/分享，无收藏按钮 |
| ArticleCard 收藏入口 | 前端组件 | `components/common/Card.tsx` | **❌ 缺失** — 列表卡片无收藏操作 |
| Header 收藏入口 | 前端导航 | `components/common/Header.tsx` | **❌ 缺失** — 无收藏导航链接 |
| Sidebar 收藏入口 | 前端导航 | `components/layout/Sidebar.tsx` | ⚠️ 有入口但指向 `/profile`，未指向 `/favorites` |
| Article.favoriteCount | 后端字段 | `model/Article.java` | **❌ 不存在** — Article 实体无此字段 |

### 2.2 相关数据模型

#### Favorite（收藏关联）[code]
```java
@Entity
@Table(name = "favorites", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "article_id"})
})
public class Favorite {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id")
    User user;           // 收藏用户（JPA 关联）
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "article_id")
    Article article;     // 被收藏文章（JPA 关联）
    LocalDateTime createdAt; // 自动填充 @PrePersist
}
```
- DB 唯一约束：`(user_id, article_id)` — 同一用户对同一文章只能收藏一次
- 收藏列表查询通过 `favorite.getArticle()` 级联获取文章信息 [code: FavoriteService.toArticleDTO()]

#### Article（文章）[code]
关键字段：`id`、`title`、`content`、`summary`、`coverImage`、`author`(@ManyToOne→User)、`category`(@ManyToOne→Category)、`likeCount`、`commentCount`、`viewCount`、`status`、`tags`、`location`

> ⚠️ **无 `favoriteCount` 字段**。当前通过 `FavoriteRepository.countByArticleId()` 实时查询收藏数。

#### User（用户）[code]
关键字段：`id`、`username`、`nickname`、`avatar`、`role`

### 2.3 相关接口（已有的）[code]

#### 收藏接口（5 个端点）
| 方法 | 路径 | 用途 | 认证 |
|---|---|---|---|
| `GET` | `/api/favorites` | 当前用户收藏列表(分页) | ✅ |
| `GET` | `/api/favorites/user/{userId}` | 指定用户收藏列表(分页) | - |
| `POST` | `/api/favorites/{articleId}` | 收藏文章 (body: {userId}) | - |
| `DELETE` | `/api/favorites/{articleId}` | 取消收藏 (body: {userId}) | - |
| `GET` | `/api/favorites/check/{articleId}?userId=` | 检查是否已收藏 | - |

> **注意**：Controller 中 `addFavorite`/`removeFavorite` 通过 `@RequestBody` 接收 userId，**不通过 JWT 自动获取当前用户**，与 `getFavorites`（通过 Authentication 获取）不一致 → 前端调用时需显式传 userId。

#### 前端 API 封装（4 个方法）[code]
| 方法 | 对应后端 | 参数 |
|---|---|---|
| `getUserFavorites(userId, page, size)` | `GET /favorites/user/{userId}` | userId 显式传参 |
| `addFavorite(userId, articleId)` | `POST /favorites/{articleId}` | userId 通过 body |
| `removeFavorite(userId, articleId)` | `DELETE /favorites/{articleId}` | userId 通过 body |
| `checkFavorite(userId, articleId)` | `GET /favorites/check/{articleId}?userId=` | userId 通过 query |

#### 文章接口（部分，与本次变更相关）
| 方法 | 路径 | 用途 |
|---|---|---|
| `GET` | `/api/articles/{id}` | 文章详情 |
| `GET` | `/api/articles` | 文章列表(分页) |
| `POST` | `/api/articles/{id}/like` | 点赞文章 |

### 2.4 前端页面排查详情 [code]

#### ArticlePage.tsx — **核心缺口**
- 互动区域（第 288-309 行）：仅有 点赞(Heart)、评论(MessageCircle)、分享(Share2) 三个按钮
- **未引入 `favoriteService`**
- **无 `addFavorite`/`removeFavorite`/`checkFavorite` 调用**
- 现有 `handleLike` 函数可作为收藏互动的参考模式

#### ProfilePage.tsx — **已有**
- 引入 `favoriteService`（第 15 行）
- "我的收藏" Tab（`{ key: 'likes', label: '我的收藏' }`，第 211 行）
- `loadFavorites()` 加载收藏列表（第 119-133 行）

#### FavoritesPage.tsx — **已有**
- 路由 `/favorites` 已注册（App.tsx 第 58 行）
- 调用 `favoriteService.getUserFavorites()` 展示收藏列表
- **但无导航入口指向此路由**

#### Header.tsx — **缺失**
- 导航项：首页/相册/地图/写文章/搜索/通知/头像(→/profile)
- **无收藏入口**

#### Sidebar.tsx — **缺失**
- 快捷入口"我的收藏"指向 `/profile`（第 57 行），未指向 `/favorites`

### 2.5 依赖关系

- `ArticlePage` → `favoriteService`(需新增引用) → `FavoriteController`(已有)
- `Article` DTO 列表需传递「当前用户是否已收藏」状态（当前 DTO 无此字段）
- `useAuth` Hook 提供当前用户信息 [code: `hooks/useAuth.ts`]

## 3. 技术约束（Technical Constraints）

- **后端无需改动**：Controller/Service/Repository/Entity 全部就绪
- **前端需新增**：ArticlePage 收藏按钮交互 + ArticleCard 组件收藏状态
- **UI 风格**：需与现有点赞按钮保持一致（Button 组件，圆角+图标+文字）
- **状态管理**：需在 ArticlePage 中维护 `isFavorited` 本地状态，参考 `isLiked` 模式
- **用户体验**：收藏/取消收藏需即时反馈（乐观更新），失败时回滚
- **路由**：`/favorites` 路由已注册，但需在 Header 中添加入口

## 4. 历史决策（Prior Decisions）

- 点赞功能已实现的交互模式（`handleLike` + `isLiked` 状态 + Heart 图标 + 乐观更新）为收藏功能提供了可直接复用的 UI 模式 [code: ArticlePage.tsx]
- 收藏列表查询通过 `favorite.getArticle()` JPA 级联获取文章信息，后端无 N+1 问题 [code: FavoriteService]
- 认证使用 JWT + Spring Security，但 `addFavorite`/`removeFavorite` 未通过 JWT 自动取值，前端需手动传 userId [code]

## 5. 已知风险与坑位（Known Pitfalls）

- **userId 透传不一致**：后端 `addFavorite`/`removeFavorite` 从 request body 取 userId，而非从 Authentication。前端需确保从 `useAuth` 获取正确的当前用户 userId 并传递 [code]
- **DTO 缺少收藏状态字段**：`ArticleDTO` 无 `isFavorited` 字段，若列表页需要展示收藏状态（如 Card 高亮），需后端新增字段或在列表请求后批量查询 [code: 待设计方案]
- **ArticlePage 数据流**：当前 `loadArticle()` 只获取文章详情，需额外调用 `checkFavorite` 获取当前用户是否已收藏 [code: 待实现]

## 6. 域识别结果

| 域 | 识别方式 | 影响范围 |
|---|---|---|
| **文章域** (article) | 主域 [goal → code] | ArticlePage, ArticleCard (新增收藏交互) |
| **用户域** (user) | 上下游域 [goal → code] | useAuth (获取当前用户) |
| **收藏域** (favorite) | 子域 [code] | 后端无需改动，前端补闭环 |

> ⚠️ `domains/README.md` 和 `domain_spec.md` 均为空，域结构完全从代码反向推断。

## 7. 变更范围确认

排查结论：本次变更为**纯前端补全**，后端无需改动。具体：

| # | 变更项 | 类型 |
|---|---|---|
| 1 | ArticlePage 新增收藏/取消收藏按钮交互 | 新增 |
| 2 | ArticlePage 加载时查询当前用户收藏状态 | 新增 |
| 3 | Header 添加收藏导航入口 → `/favorites` | 新增 |
| 4 | （可选）ArticleCard 组件支持收藏操作入口 | 增强 |

> **下一步**：确认变更范围后，执行 `req` 生成需求文档。
