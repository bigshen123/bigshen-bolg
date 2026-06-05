# AI Decision Changelog

## 2026-02-26 feat-xxx-checkin
- **Decision**: 幂等通过数据库唯一约束实现，而非 Redis 计数
- **Reason**: 降低一致性风险，数据库作为单一事实来源
- **Risk**: 高并发写入压力；需关注索引与事务耗时
- **Alternatives**: Redis 分布式锁（性能优但一致性弱）
- **Spec**: @spec-canon/changes/feat-xxx-checkin/03_implementation.md

## 2026-02-20 feat-yyy-points
...