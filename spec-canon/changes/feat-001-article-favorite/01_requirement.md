# Change: 补全文章收藏功能前端闭环

> Spec Owner: @hljy | Status: draft
> 系统现状: @spec-canon/changes/feat-001-article-favorite/00_context.md

## 1. Background（背景）

当前系统后端收藏功能（Entity/Repository/Service/Controller）和前端 API 封装层（`favoriteService.ts`）均已完整实现，但**前端 UI 闭环尚未打通**——用户在文章详情页看不到收藏按钮，无法在阅读文章时执行收藏/取消收藏操作。同时 Header 导航栏缺少指向 `/favorites` 收藏列表页的入口，用户只能通过个人中心 Tab 间接查看收藏。

本次变更聚焦补齐前端交互缺口，使收藏功能形成完整的前端闭环。

## 2. Goals（目标）

- Goal-1: 用户在文章详情页可以**一键收藏/取消收藏**文章
- Goal-2: 文章详情页加载时**自动展示当前用户的收藏状态**（已收藏高亮）
- Goal-3: Header 导航栏提供**收藏列表入口**，用户可直达 `/favorites` 页

## 3. Scope（范围）

### In Scope（本次做）

- `frontend/src/pages/ArticlePage.tsx`：新增收藏按钮交互（收藏/取消收藏 toggle）
- `frontend/src/pages/ArticlePage.tsx`：页面加载时查询当前用户收藏状态
- `frontend/src/components/common/Header.tsx`：NAV_ITEMS 新增收藏导航项 → `/favorites`

### Out of Scope（本次不做）

- 后端代码修改（Controller/Service/Repository/Entity 均已就绪）
- 前端 API 封装修改（`favoriteService.ts` 已就绪）
- 收藏列表页修改（`FavoritesPage.tsx` 已就绪）
- 个人中心收藏 Tab 修改（`ProfilePage.tsx` 已就绪）
- 通知模块（收藏时不做通知推送）
- ArticleCard 组件收藏按钮（列表页收藏操作留待后续）
- 收藏数展示（Article 实体无 `favoriteCount` 字段，本次不新增）

## 4. Acceptance Criteria（验收标准）

### AC-1: 收藏文章（主流程-收藏）
1. 用户打开任意文章详情页
2. 互动区（点赞按钮右侧）显示收藏按钮，图标为 **Bookmark**（未收藏态为空心，已收藏态为实心填充 / 当前主题色）
3. 用户点击收藏按钮
4. 按钮立即变为**已收藏高亮态**（乐观更新），`favoriteService.addFavorite()` 在后台调用
5. 调用失败时按钮回退到未收藏态，在控制台输出错误日志

### AC-2: 取消收藏（主流程-取消）
1. 已收藏文章详情页，收藏按钮为高亮态
2. 用户点击收藏按钮
3. 按钮立即变为**未收藏态**（乐观更新），`favoriteService.removeFavorite()` 在后台调用
4. 调用失败时按钮回退到已收藏高亮态

### AC-3: 页面加载时展示收藏状态
1. 用户打开文章详情页
2. 页面加载完成后，自动调用 `favoriteService.checkFavorite()` 查询当前用户是否已收藏
3. 收藏按钮根据查询结果展示对应状态（已收藏/未收藏）
4. 查询期间按钮不展示（或展示 loading 态）

### AC-4: 幂等性（重复操作）
1. 用户对已收藏文章再次点击收藏 → 后端幂等返回（`FavoriteService.addFavorite` 内已有 `existsBy...` 判断），前端不报错
2. 用户对未收藏文章点击取消收藏 → 后端无人处理（当前 `removeFavorite` 为 `ifPresent → delete`），前端不报错
3. 快速连续点击收藏按钮 → loading 状态期间按钮禁用，不发送重复请求

### AC-5: 未登录场景（失败场景-1）
1. 文章详情页由 `RequireAuth` 保护，未登录用户无法访问
2. **不需特殊处理**：页面级别的鉴权已保证用户一定已登录

### AC-6: 网络异常场景（失败场景-2）
1. 用户点击收藏按钮时网络异常
2. 乐观更新已生效（显示已收藏）
3. API 调用失败后，按钮回退到操作前状态
4. 错误信息记录到 console.error

### AC-7: Header 收藏入口
1. Header 导航栏显示"收藏"入口（Heart 或 Bookmark 图标）
2. 点击后跳转到 `/favorites` 页面
3. 当前路由为 `/favorites` 时，导航项高亮（active 样式）

## 5. Constraints（约束）

| 约束项 | 说明 | 来源 |
|---|---|---|
| 代码风格 | 遵循现有点赞按钮的交互模式（`handleLike` + `isLiked` 状态 + 乐观更新） | [00_context §4] |
| UI 组件 | 使用现有 `Button` 组件，图标使用 `lucide-react` 中的 `Bookmark` | [00_context §3] |
| 用户身份 | 从 `useAuth` Hook 获取 `user.id`，传递给 `favoriteService` | [00_context §2.4, code: useAuth.ts] |
| userId 参数 | `addFavorite`/`removeFavorite` 需要显式传 userId，不依赖后端自动识别 | [00_context §2.3, code: FavoriteController] |
| 路由兼容 | `/favorites` 路由已注册，无需新增路由，仅需在 Header 添加入口 | [00_context §2.4, code: App.tsx:58] |
| 接口不变 | 后端接口无改动，前端无需修改 Service 层 | [00_context §3] |

## 6. Risks & Rollout（风险与上线策略）

### 6.1 回归风险
- **点赞功能不受影响**：收藏按钮为独立新增，不复用点赞相关状态（`isLiked`、`likeCount`），使用独立状态 `isFavorited`
- **文章详情页其他功能不受影响**：评论、分享逻辑无耦合
- **已知坑位**：`addFavorite`/`removeFavorite` 从 request body 取 userId 而非 Authentication，前端需确保 `useAuth.user.id` 正确传递 [00_context §5]

### 6.2 单测影响
- 项目当前无前端单元测试，无单测影响

### 6.3 变更冲突
- 无其他进行中的变更

### 6.4 灰度策略
- 个人项目，无需灰度，直接全量发布

### 6.5 回滚预案
- 前端代码回滚：恢复 `ArticlePage.tsx` 和 `Header.tsx` 的原始版本即可
- 无需后端回滚（后端无改动）

## 7. Consistency Check（一致性自检）

- [x] 各 AC 之间无矛盾 — 收藏/取消/状态查询/加载态/失败回退 覆盖了完整状态流转
- [x] 约束条件在所有 AC 场景下成立 — 所有 AC 均使用现有 Button 组件、useAuth Hook、favoriteService API
- [x] In/Out Scope 边界无灰色地带 — 明确排除了后端、列表卡片、通知模块等

---

> **下一步**：审阅验收标准，确认后 Sign-off → 进入 `iface` 阶段。
