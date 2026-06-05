# Interface Spec: 补全文章收藏功能前端闭环

> Spec Owner: @hljy | Status: draft
> 系统现状: @spec-canon/changes/feat-001-article-favorite/00_context.md
> 对齐 01: @spec-canon/changes/feat-001-article-favorite/01_requirement.md

## 1. Overview（总览）

- **变更类型**：纯前端，后端接口和 Service 层均不改动
- **鉴权方式**：文章详情页已由 `RequireAuth` 保护，进入页面即保证用户已登录
- **状态管理**：组件本地 state（`useState`），不引入全局 store
- **乐观更新**：收藏/取消收藏先更新 UI，再异步调 API，失败后回滚
- **UI 模式**：复用现有点赞按钮的交互范式（`handleLike` + `isLiked` 状态 + `liking` 防抖）
- **lucide-react 图标**：使用 `Bookmark` 图标
  - 未收藏态：`<Bookmark size={18} />`（空心）
  - 已收藏态：`<Bookmark size={18} fill="currentColor" />`（实心 + 当前主题色）

## 2. API Contracts（已有接口，本次不改动）

> 以下接口均已实现，本次仅在前端调用，不修改接口契约。
> 来源: [code: FavoriteController.java] + [code: favoriteService.ts]

### API-1: 收藏文章
```
POST /api/favorites/{articleId}
Body: { "userId": number }
Response: { "message": "收藏成功" }
```
- 幂等保护：后端 `existsByUserIdAndArticleId` 判断，已收藏时直接 return
- 来源对应: `favoriteService.addFavorite(userId, articleId)` [code: favoriteService.ts:15]

### API-2: 取消收藏
```
DELETE /api/favorites/{articleId}
Body: { "userId": number }
Response: { "message": "取消收藏成功" }
```
- `findByUserIdAndArticleId` → `ifPresent → delete`，不存在时不报错
- 来源对应: `favoriteService.removeFavorite(userId, articleId)` [code: favoriteService.ts:19]

### API-3: 检查收藏状态
```
GET /api/favorites/check/{articleId}?userId={userId}
Response: { "favorited": boolean }
```
- 来源对应: `favoriteService.checkFavorite(userId, articleId)` [code: favoriteService.ts:23]

### API-4: 获取收藏列表（参考，本次不改动）
```
GET /api/favorites/user/{userId}?page=0&size=10
Response: Page<ArticleDTO>
```
- 已用于 `FavoritesPage` 和 `ProfilePage`，本次不改动

## 3. Component Interface（前端组件接口变更）

### 3.1 ArticlePage 新增状态

> 对应 AC-1~AC-4, AC-6 | 文件: `frontend/src/pages/ArticlePage.tsx`

```typescript
// 新增状态声明（与现有 isLiked / liking 并列）
const [isFavorited, setIsFavorited] = useState(false);
const [favoriting, setFavoriting] = useState(false);
```

### 3.2 新增函数

```typescript
/**
 * 检查当前用户是否已收藏（页面加载时调用）
 * 来源: useAuth Hook 获取 userId
 * 依赖: favoriteService.checkFavorite()
 */
const checkFavoriteStatus = useCallback(async () => {
    const userId = /* useAuth().user.id */;
    if (!userId || !id) return;
    try {
        const favorited = await favoriteService.checkFavorite(userId, Number(id));
        setIsFavorited(favorited);
    } catch (err) {
        console.error('检查收藏状态失败:', err);
        // 静默失败，默认展示未收藏态
    }
}, [id, userId]);

/**
 * 收藏/取消收藏 toggle（乐观更新 + 防抖）
 * 依赖: favoriteService.addFavorite() / removeFavorite()
 */
const handleFavorite = async () => {
    const userId = /* useAuth().user.id */;
    if (!id || favoriting || !userId) return;

    const previousState = isFavorited;
    try {
        setFavoriting(true);
        // 乐观更新
        setIsFavorited(!isFavorited);

        if (previousState) {
            await favoriteService.removeFavorite(userId, Number(id));
        } else {
            await favoriteService.addFavorite(userId, Number(id));
        }
    } catch (err) {
        // 失败回滚
        setIsFavorited(previousState);
        console.error('收藏操作失败:', err);
    } finally {
        setFavoriting(false);
    }
};
```

### 3.3 生命周期变化

```
新增 useEffect 依赖:
useEffect(() => {
    loadArticle();
    loadComments();
    checkLiked();
    checkFavoriteStatus();  // ← 新增
}, [loadArticle, loadComments, checkLiked, checkFavoriteStatus]);
```

### 3.4 新增 UI（互动区）

> 插入位置：点赞按钮右侧，评论按钮左侧（第 289-300 行区域）

```tsx
{/* 收藏按钮 — 新增 */}
<Button
    variant={isFavorited ? 'primary' : 'outline'}
    icon={favoriting ? <Loader2 size={18} className="animate-spin" /> : (
        <Bookmark size={18} fill={isFavorited ? 'currentColor' : 'none'} />
    )}
    className="rounded-full"
    onClick={handleFavorite}
    disabled={favoriting}
>
    {isFavorited ? '已收藏' : '收藏'}
</Button>
```

### 3.5 新增 import

```typescript
// 新增导入
import { Bookmark } from 'lucide-react';          // 收藏图标
import { useAuth } from '../hooks/useAuth';        // 获取当前用户
import { favoriteService } from '../services/favoriteService'; // 收藏 API
```

### 3.6 Header 导航变更

> 对应 AC-7 | 文件: `frontend/src/components/common/Header.tsx`

```typescript
// import 新增 Bookmark（或 Heart）
import { Search, Menu, X, Home, Image, Map, Compass, PenLine, Shield, Bookmark } from 'lucide-react';

// NAV_ITEMS 新增一项
const NAV_ITEMS = [
    { path: '/', label: '首页', icon: <Home size={18} /> },
    { path: '/gallery', label: '相册', icon: <Image size={18} /> },
    { path: '/map', label: '地图', icon: <Map size={18} /> },
    { path: '/favorites', label: '收藏', icon: <Bookmark size={18} /> },  // ← 新增
];
```

## 4. Interaction Flow（交互流程）

```
┌─────────────────────────────────────────────────────────┐
│  ArticlePage 加载                                        │
│  ├── loadArticle()      → 获取文章详情                    │
│  ├── checkLiked()       → 查询点赞状态 (已有)              │
│  └── checkFavoriteStatus() → 查询收藏状态 (新增)           │
│                                                         │
│  用户点击收藏按钮                                         │
│  ├── favoriting = true  (禁用按钮，显示 Loader2)           │
│  ├── isFavorited 取反   (乐观更新 UI)                     │
│  ├── isFavorited === true  → addFavorite()               │
│  │   └── 失败 → isFavorited 回退                         │
│  ├── isFavorited === false → removeFavorite()            │
│  │   └── 失败 → isFavorited 回退                         │
│  └── favoriting = false (恢复按钮)                        │
│                                                         │
│  Header 导航                                             │
│  └── 点击"收藏" → navigate('/favorites')                 │
│     └── FavoritesPage 自行加载收藏列表 (已有逻辑)           │
└─────────────────────────────────────────────────────────┘
```

## 5. Data Schema（类型定义，本次无新增）

```typescript
// 所有类型已定义，本次无新增 TypeScript 类型
// 使用的现有类型：
import type { Article } from '../types/article';     // 文章类型
import type { User } from '../types/user';           // 用户类型（含 id）

// favoriteService 返回值：
// addFavorite → void
// removeFavorite → void
// checkFavorite → boolean
```

## 6. Consistency Verification（与既有接口风格对齐）

| 对齐项 | 参照 | 本次实现 | 一致性 |
|---|---|---|---|
| 按钮组件 | `<Button variant="outline" icon={...}>` | 同款 `outline` + `primary` 切换 | ✅ |
| loading 态 | `liking ? <Loader2> : <Heart>` | `favoriting ? <Loader2> : <Bookmark>` | ✅ |
| 乐观更新模式 | `handleLike`: 先改状态再调 API | `handleFavorite`: 同样模式 | ✅ |
| 失败回滚 | `catch` 无回滚（点赞接口返回全量） | `catch` 回退 isFavorited | ⚠️ 略有不同，收藏接口不返回状态需回滚 |
| 图标库 | `lucide-react` | `Bookmark` | ✅ |
| 导航项结构 | `{ path, label, icon }` | 同结构 | ✅ |
| userId 获取 | 点赞通过 `articleService.likeArticle(id)` 隐式获取 | 收藏需显式传 userId（接口不同） | ⚠️ 接口设计差异，前端适配 |

> **注**：收藏接口与点赞接口的设计差异（点赞由后端自动识别用户，收藏需前端传 userId）是已有接口契约，本次不改动后端，前端按现有接口参数调用。

## 7. Notes（补充说明）

- `Bookmark` 图标在 `FavoritesPage` 中可能需要统一，但不在本次范围
- Header 中"收藏"导航位置放在"相册""地图"之后，保持语义就近原则
- 当前 `Sidebar.tsx` 中"我的收藏"指向 `/profile`，本次不改动（避免范围蔓延）
- 若后续需要在 ArticleCard（列表卡片）中添加收藏入口，新增 DTO 字段 `isFavorited` 需要后端配合，不在本次范围

---

> **下一步**：审阅接口设计 → `impl-spec` 生成实现规格。
