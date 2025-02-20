# 当前任务：实现提示模板系统

## 概述
参考 LangChain 的 PromptTemplate 系统，实现一个 TypeScript 版本的动态提示生成和管理系统，用于我们的 React 组件生成系统。

## 技术设计

### 1. 核心组件

#### PromptTemplate 类
- 位置：`src/core/prompts/PromptTemplate.ts`
- 主要功能：
  - 模板字符串解析和变量插值
  - 必需变量的输入验证
  - 生成最终提示的格式化方法
  - 支持部分变量和默认值

#### BasePromptValue 接口
- 位置：`src/core/prompts/schema.ts`
- 用途：定义提示值的基础接口
- 属性：
  - `toString()` 方法用于字符串转换
  - `toChatMessages()` 用于聊天格式转换

### 2. 辅助类

#### TemplateFormat 类
- 位置：`src/core/prompts/template.ts`
- 功能：
  - 解析模板字符串
  - 提取变量名
  - 验证模板语法
  - 处理转义字符

#### InputValidator 类
- 位置：`src/core/prompts/validator.ts`
- 功能：
  - 验证输入变量是否满足模板要求
  - 输入值类型检查
  - 默认值处理

## 实现步骤

1. **基础设施**
   - 创建 prompts 目录结构
   - 设置基本接口和类型
   - 实现提示相关的错误类

2. **核心模板处理**
   - 实现模板字符串解析
   - 添加变量提取逻辑
   - 创建模板处理的格式化方法

3. **输入验证系统**
   - 构建输入验证机制
   - 实现类型检查
   - 添加默认值支持

4. **集成组件**
   - 创建 React 组件模板
   - 添加常用场景的提示模板预设
   - 实现模板组合工具

5. **测试基础设施**
   - 模板处理的单元测试
   - 提示生成的集成测试
   - 边缘情况处理测试

## 使用示例

```typescript
// 使用示例
const template = new PromptTemplate({
  template: "创建一个{component}组件，该组件能够{functionality}",
  inputVariables: ["component", "functionality"]
});

const prompt = await template.format({
  component: "按钮",
  functionality: "在悬停时改变颜色"
});
```

## 依赖关系
- 不需要外部依赖
- 使用原生 TypeScript/JavaScript 字符串操作

## 测试策略
1. 单元测试：
   - 模板解析
   - 变量验证
   - 格式化方法功能
   - 错误处理

2. 集成测试：
   - 完整提示生成流程
   - 组件生成集成
   - 边缘情况和错误场景

## 下一步
1. 创建目录结构
2. 实现基础接口
3. 构建核心 PromptTemplate 类
4. 添加辅助工具
5. 编写测试
6. 编写使用文档和示例