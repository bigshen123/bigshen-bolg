# Context: [变更名称]
> 生成时间: YYYY-MM-DD | 生成者: Claude Code + @[工程师]
> 本文档描述启动本变更时的系统现状，作为 01-04 的共享前提。

## 1. 业务背景（Business Context）
[这个变更所在的业务域是什么？用户场景是什么？
 为什么现在要做？—— 从 PRD 中提炼，2-3 段即可]
（→ 下游消费者：01_requirement 的 Background 段落可直接引用）

## 2. 系统现状（Current State）

### 2.1 相关模块
- `模块A`（path/to/module-a/）：负责 [职责]，当前状态 [正常/有已知问题]
- `模块B`（path/to/module-b/）：负责 [职责]
（→ 下游消费者：03_implementation 的 File Changes、04_test_spec 的 Regression Impact）

### 2.2 相关数据模型
- `table_a`：[关键字段说明，当前索引情况]
- `table_b`：[与 table_a 的关联关系]
（→ 下游消费者：02_interface 的字段命名对齐、03_implementation 的 Data Changes）

### 2.3 相关接口（已有的）
- `GET /api/v1/xxx`：[用途，当前调用方]
- `POST /api/v1/yyy`：[用途]
（→ 下游消费者：02_interface 的风格一致性、错误码体系对齐）

### 2.4 依赖服务
- [内部服务]：积分服务 v2（HTTP），SLA: P99 < 100ms
- [外部服务]：支付网关（无直接依赖 / 有依赖）

## 3. 技术约束（Technical Constraints）
- [性能]：当前 QPS 约 [N]，峰值 [M]
- [数据量]：table_a 当前 [X] 万行，月增 [Y] 万
- [兼容性]：需兼容客户端 v2.1+（不支持 [某特性]）
- [安全]：涉及 [用户隐私/资金] 数据，需 [脱敏/审计]
（→ 下游消费者：01_requirement 的 Constraints、02_interface 的版本策略）

## 4. 历史决策（Prior Decisions）
- [YYYY-MM-DD] 曾考虑过 [方案X]，因 [原因] 放弃
  （来源：@spec-canon/decisions/AI_CHANGELOG.md）
- [YYYY-MM-DD] [模块A] 重构时选择了 [方案Y]，需注意 [遗留约束]
（→ 下游消费者：03_implementation 的 Design Decision，避免重复评估已否决方案）

## 5. 已知风险与坑位（Known Pitfalls）
- table_a 的 idx_xxx 索引在高并发写入时有锁竞争
- 模块B 的 xxxMethod() 不是线程安全的，不要并发调用
- [其他团队经验/踩坑记录]
（→ 下游消费者：03_implementation 的坑位规避、04_test_spec 的边界用例）