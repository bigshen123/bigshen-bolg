# Test Spec: [功能名称]
> Spec Owner: @[工程师姓名] | Status: draft / approved
> 系统现状: @spec-canon/changes/change-xxx/00_context.md
> 对齐 01: AC-1 ~ AC-N
> 对齐 02: 所有 Endpoints

## 1. Test Scope（测试范围）
- Service 层：单测
- Controller 层：契约测试 / 集成测试
- 接口级：契约测试（Schema 比对）

## 2. Test Strategy（测试策略）
| 层级 | 测试类型 | 工具 | 覆盖重点 |
|---|---|---|---|
| Service | 单测 | JUnit 5 + Mockito | 业务逻辑、幂等、异常 |
| Controller | 集成测试 | MockMvc / WebTestClient | 参数校验、响应格式 |
| 契约 | Schema 比对 | 自定义断言 | Response 与 02_interface 一致 |

## 3. Test Cases（用例清单）

| 编号 | 场景 | 输入 | 期望结果 | 对齐 AC |
|---|---|---|---|---|
| TC-01 | [正常路径] | [输入] | [期望] | AC-1 |
| TC-02 | [幂等场景] | [输入] | [期望] | AC-1 |
| TC-03 | [参数异常] | [输入] | [期望错误码] | AC-2 |
| TC-04 | [并发场景] | [输入] | [期望] | AC-1 |

## 4. Test Data（数据准备）
- 前置数据：[需要预置什么数据]
- 时间假设：[如 "当天" 以服务端 UTC 为准]
- Mock 依赖：[哪些外部服务需要 Mock]

## 5. Regression Impact（回归影响）
- [列出可能影响的现有功能，提示需要回归]