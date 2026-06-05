# Domain Spec: [业务域名称]
> 最后更新: YYYY-MM-DD | 更新来源: change-xxx
> 本文档描述 [业务域] 的系统当前行为，由各变更归档时回填更新。

## 1. 业务规则（Business Rules）
- BR-1: [规则描述]
  （来源: feat-001 AC-1）
- BR-2: [规则描述]
  （来源: feat-002 AC-1~AC-3）

## 2. 状态流转（State Machine）
```mermaid
stateDiagram-v2
    [描述当前完整的状态流转]
```
（来源: feat-001 03§5 + feat-002 03§5）

## 3. 数据流转（Data Flow）
```
[描述当前完整的数据流经路径]
```
（来源: feat-001 03§5，feat-002 更新）

## 4. 接口清单（API Surface）
| 接口 | 方法 | 用途 | 引入版本 |
|---|---|---|---|
| `/api/v1/xxx` | POST | [用途] | feat-001 |
| `/api/v1/yyy` | GET | [用途] | feat-002 |
（详细契约见各变更的 02_interface.md）

## 5. 数据模型（Data Model）
| 表 | 关键字段 | 索引 | 引入/变更来源 |
|---|---|---|---|
| `table_a` | col1, col2, col3 | UK(col1, col2) | feat-001 创建, feat-002 追加 col3 |

## 6. 已知约束与坑位（Known Constraints）
- [约束/坑位描述]
  （来源: feat-001 开发过程 / RULES.md）