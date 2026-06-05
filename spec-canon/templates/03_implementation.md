# Implementation Spec: [功能名称]
> Spec Owner: @[工程师姓名] | Status: draft / approved
> 系统现状: @spec-canon/changes/change-xxx/00_context.md
> 对齐 01: @spec-canon/changes/change-xxx/01_requirement.md
> 对齐 02: @spec-canon/changes/change-xxx/02_interface.md

## 1. Goal Recap（目标复述）
用 3-5 行复述本次要实现什么，确保 AI 理解正确。

## 2. Design Decision（设计决策）

### 选定方案
[描述选定的技术方案]

### 备选方案对比

| 维度 | 方案 A（选定） | 方案 B | 方案 C |
|---|---|---|---|
| 复杂度 | ★★☆ | ★★★★ | ★★★ |
| 性能 | ★★★ | ★★★★★ | ★★★★ |
| 可维护性 | ★★★★★ | ★★★ | ★★ |
| 风险 | ★★ | ★★★ | ★★★★ |

**选择理由**：[为什么选 A，trade-off 是什么]

## 3. File Changes（变更范围）
- `path/to/FileA.java` — 新增 [类/方法]
- `path/to/FileB.java` — 修改 [方法名]，调整 [逻辑]
- `path/to/FileC.java` — 新增（新文件）
- `path/to/TestD.java` — 新增单测

## 4. Data Changes（数据变更，如适用）
```sql
-- 新增表 / 索引 / 字段
ALTER TABLE xxx ADD COLUMN yyy;
CREATE UNIQUE INDEX idx_xxx ON table(col1, col2);
```

## 5. Core Logic（核心逻辑）

### 伪代码

```
1. 解析参数，校验格式
2. 开启事务
3. 尝试插入记录（唯一约束保证幂等）
    - 冲突 → 返回已处理结果
4. 插入成功 → 执行业务逻辑
5. 提交事务
6. 查询最新状态 → 组装响应
```

### 不变量断言（复杂逻辑时使用）
- INV-1: [不变量描述]
- INV-2: [不变量描述]

### 状态图（复杂逻辑时使用）
```mermaid
stateDiagram-v2
    [描述状态流转]
```

## 6. Execution Plan（分步执行计划）

### Step 1: [步骤标题]
- 动作：[具体做什么]
- 文件：`path/to/file`
- ✅ 验证：`[验证命令]`（必须通过才进入下一步）

### Step 2: [步骤标题]
- 动作：[具体做什么]
- 文件：`path/to/file`
- ✅ 验证：`[验证命令]`

### Step 3: [步骤标题]
...

## 7. Rollback & Compatibility（回滚与兼容）
- 回滚方式：[如何回退]
- 兼容影响：[影响哪些现有功能]
- 配置项：[需要配置什么]