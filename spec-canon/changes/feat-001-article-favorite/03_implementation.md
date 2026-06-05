# Implementation Spec: 补全文章收藏功能前端闭环

> Spec Owner: @hljy | Status: draft
> 系统现状: @spec-canon/changes/feat-001-article-favorite/00_context.md
> 对齐 01: @spec-canon/changes/feat-001-article-favorite/01_requirement.md
> 对齐 02: @spec-canon/changes/feat-001-article-favorite/02_interface.md

## 1. Goal Recap（目标复述）

在文章详情页（`ArticlePage.tsx`）新增收藏/取消收藏按钮，页面加载时查询收藏状态，Header 导航栏添加 `/favorites` 入口。纯前端改动，后端和 API Service 层均不动。

## 2. Design Decision（设计决策）

### 选定方案：组件内联 + 本地 state

收藏按钮直接写在 `ArticlePage` 组件内，使用 `useState` 管理本地状态，不复用点赞的状态变量。

### 备选方案对比

| 维度 | 方案 A：内联 + 本地 state（选定） | 方案 B：抽取 FavoriteButton 组件 |
|---|---|---|
| 复杂度 | ★★☆ | ★★★ |
| 可维护性 | ★★★★ | ★★★★★ |
| 复用性 | ★★ | ★★★★ |
| 开发量 | 小（约 30 行新增代码） | 中（新建组件+导出） |

**选择理由**：
1. 本次收藏按钮**仅在 ArticlePage 一处使用**，抽取组件的收益为零
2. 收藏状态（`isFavorited`、`favoriting`）与文章页面强耦合，抽取后需通过 props 来回传状态，反而增加复杂度
3. 现有点赞按钮也是内联模式（`handleLike` + `isLiked`），保持风格一致
4. 后续若 ArticleCard 需要收藏按钮，再抽取不迟（YAGNI）

## 3. File Changes（变更范围）

### 修改文件

| 文件 | 变更类型 | 说明 |
|---|---|---|
| `frontend/src/pages/ArticlePage.tsx` | 修改 | +3 import, +2 state, +2 函数, +1 useEffect 调用, +1 Button |
| `frontend/src/components/common/Header.tsx` | 修改 | +1 import, +1 NAV_ITEM |

### 不修改的文件（仅引用）

| 文件 | 用途 |
|---|---|
| `frontend/src/services/favoriteService.ts` | 已有 API 封装，直接调用 |
| `frontend/src/hooks/useAuth.ts` | 已有 Hook，获取 `user.id` |
| `frontend/src/types/article.ts` | 已有类型定义 |
| `backend/*` | 全部不动 |

## 4. Data Changes（数据变更）

**无**。本次纯前端改动，不涉及数据库/后端。

## 5. Core Logic（核心逻辑）

### 5.1 状态流转

```
页面加载 ──→ checkFavoriteStatus() ──→ isFavorited = true/false
                                          │
用户点击收藏 ──→ favoriting = true        │
                isFavorited 取反（乐观）     │
                ┌── addFavorite()        │
                │   失败 → isFavorited 回退│
                └── removeFavorite()     │
                    失败 → isFavorited 回退│
                favoriting = false ────────┘
```

### 5.2 `handleFavorite` 伪代码

```
handleFavorite():
    1. 防御: if (!id || favoriting || !userId) return
    2. 保存旧状态: prev = isFavorited
    3. setFavoriting(true)
    4. 乐观更新: setIsFavorited(!prev)
    5. try:
        if prev:  removeFavorite(userId, articleId)
        else:     addFavorite(userId, articleId)
    6. catch(err):
        setIsFavorited(prev)      // 回滚
        console.error(err)
    7. finally:
        setFavoriting(false)
```

### 5.3 `checkFavoriteStatus` 伪代码

```
checkFavoriteStatus():
    1. userId = useAuth().user.id
    2. if (!userId || !id) return
    3. try:
        favorited = checkFavorite(userId, articleId)
        setIsFavorited(favorited)
    4. catch:
        静默失败（isFavorited 保持 false）
```

### 5.4 不变量断言

- INV-1: `favoriting === true` 时按钮 `disabled`，不发送第二个请求
- INV-2: API 调用失败后 `isFavorited` 必须回退到调用前状态
- INV-3: `checkFavoriteStatus` 失败不影响页面正常展示（静默降级为未收藏）

## 6. Execution Plan（分步执行计划）

### Step 1: ArticlePage.tsx — 新增 import 和 state

- **动作**：
  - 第 4 行 `lucide-react` import 中添加 `Bookmark`
  - 新增 2 行 import：`useAuth`、`favoriteService`
  - 第 32 行后新增 2 个 state：`isFavorited`、`favoriting`
- **文件**：`frontend/src/pages/ArticlePage.tsx`
- **✅ 验证**：`cd frontend && npx tsc --noEmit`（TypeScript 编译无报错）

### Step 2: ArticlePage.tsx — 新增函数和 useEffect 调用

- **动作**：
  - 新增 `checkFavoriteStatus` 函数（`useCallback`，写在 `checkLiked` 之后）
  - 新增 `handleFavorite` 函数（写在 `handleLike` 之后）
  - 第 78-82 行 `useEffect` 依赖数组中加入 `checkFavoriteStatus`，调用数组中加入 `checkFavoriteStatus()`
- **文件**：`frontend/src/pages/ArticlePage.tsx`
- **✅ 验证**：`npx tsc --noEmit`

### Step 3: ArticlePage.tsx — 新增收藏按钮 UI

- **动作**：
  - 在第 300 行点赞按钮后（`</Button>` 闭合之后），第 301 行评论按钮前，插入收藏 Button
  - 样式与点赞按钮一致：`variant={isFavorited ? 'primary' : 'outline'}` + `rounded-full`
- **文件**：`frontend/src/pages/ArticlePage.tsx`
- **✅ 验证**：`npx tsc --noEmit`

### Step 4: Header.tsx — 新增收藏导航

- **动作**：
  - 第 4 行 `lucide-react` import 中添加 `Bookmark`
  - `NAV_ITEMS` 数组中新增 `{ path: '/favorites', label: '收藏', icon: <Bookmark size={18} /> }`
- **文件**：`frontend/src/components/common/Header.tsx`
- **✅ 验证**：`npx tsc --noEmit`

### Step 5: 端到端验证

- **动作**：
  - `cd frontend && npm run build`（确保生产构建通过）
  - 启动后端 + 前端，手动验证：
    1. 打开文章详情页 → 看到收藏按钮
    2. 点击收藏 → 按钮高亮
    3. 刷新页面 → 按钮保持高亮
    4. 再次点击 → 按钮恢复
    5. Header 点击"收藏" → 跳转 `/favorites`
- **✅ 验证**：`npm run build` 成功 + 手动验证通过

## 7. Rollback & Compatibility（回滚与兼容）

- **回滚方式**：`git checkout` 恢复 `ArticlePage.tsx` 和 `Header.tsx`
- **兼容影响**：无。新增交互不改变已有功能（点赞、评论、分享逻辑不受影响；Header 导航纯新增项）
- **配置项**：无

---

> **下一步**：审阅执行计划 → `test-spec` 生成测试规格 → `impl` 执行编码。
