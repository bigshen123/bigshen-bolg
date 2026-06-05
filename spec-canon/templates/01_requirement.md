# Change: [功能名称]
> Spec Owner: @[工程师姓名] | Status: draft / approved / archived
> PRD 来源: [PRD 链接或编号]
> 系统现状: @spec-canon/changes/change-xxx/00_context.md

## 1. Background（背景）
[为什么要做这个功能？解决什么问题？—— 1-2 段即可]

## 2. Goals（目标）
- Goal-1: [要达成的结果]
- Goal-2: [要达成的结果]

## 3. Scope（范围）
### In Scope（本次做）
- [条目化列出]

### Out of Scope（本次不做）
- [条目化列出，明确边界]

## 4. Acceptance Criteria（验收标准）
- AC-1: [具体的、可验证的验收条件]
- AC-2: [具体的、可验证的验收条件]
- AC-3: [具体的、可验证的验收条件]
  （至少覆盖：主流程 + 幂等/重复 + 2 个失败场景）

## 5. Constraints（约束）
- 性能：[如 P95 < 200ms]
- 安全：[如 需鉴权、脱敏]
- 兼容：[如 需兼容旧版客户端]
- 依赖：[如 依赖积分服务 v2 接口]

## 6. Risks & Rollout（风险与上线策略）
- 风险：[已识别的风险]
- 灰度策略：[如 先开放 5% 流量]
- 回滚预案：[如 关闭功能开关即可回滚]

## 7. Consistency Check（一致性自检）
- [ ] 各 AC 之间无矛盾
- [ ] 约束条件在所有 AC 场景下成立
- [ ] In/Out Scope 边界无灰色地带