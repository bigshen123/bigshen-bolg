# Interface Spec: [功能名称]
> Spec Owner: @[工程师姓名] | Status: draft / approved
> 系统现状: @spec-canon/changes/change-xxx/00_context.md
> 对齐 01: @spec-canon/changes/change-xxx/01_requirement.md

## 1. Overview（总览）
- 鉴权方式：Bearer Token
- 幂等要求：[描述幂等键]
- 版本策略：[如 v1 接口保持向后兼容]
- 错误码体系：[遵循项目统一错误码规范]

## 2. Endpoints

### API-1: [HTTP方法] [路径]
> 对应 AC: AC-1, AC-2

**Request**

| 字段 | 类型 | 必填 | 说明 | 校验规则 |
|---|---|---|---|---|
| field1 | string | Y | 描述 | 正则/长度/枚举 |
| field2 | int | N | 描述 | 范围 |

**Response (Success)**

| 字段 | 类型 | Nullable | 说明 |
|---|---|---|---|
| field1 | boolean | N | 描述 |
| field2 | string | Y | 描述 |

**Error Codes**

| 错误码 | HTTP Status | 说明 | 触发条件 |
|---|---|---|---|
| INVALID_PARAM | 400 | 参数非法 | field1 格式不符 |
| UNAUTHORIZED | 401 | 未授权 | Token 无效或过期 |

**Examples**
```json
// 成功 — 首次操作
Request: { "field1": "value" }
Response: { "field1": true, "field2": "xxx" }

// 成功 — 幂等场景
Request: { "field1": "value" }  (第二次请求)
Response: { "field1": true, "field2": "xxx" }  (结果一致)

// 失败 — 参数错误
Request: { "field1": "" }
Response: { "code": "INVALID_PARAM", "message": "field1 不能为空" }
```

## 3. Data Schema（可选，供 DTO 生成使用）
```typescript
// TypeScript 类型定义（AI 可直接用于前端）
interface XxxResponse {
  field1: boolean;
  field2: string | null;
}
```

## 4. Notes（补充说明）
- 兼容性注意事项
- 与其他接口的联动关系