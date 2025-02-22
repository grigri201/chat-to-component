import { expect, test, describe } from "bun:test";
import { PromptTemplate } from ".";

describe("PromptTemplate", () => {
  // 基本功能测试
  describe("基本功能", () => {
    test("应该正确创建一个简单的模板", () => {
      const template = new PromptTemplate({
        template: "你好，{name}！",
        inputVariables: ["name"],
      });
      
      expect(template).toBeDefined();
      expect(template.inputVariables).toEqual(["name"]);
    });

    test("应该正确格式化一个简单的模板", async () => {
      const template = new PromptTemplate({
        template: "创建一个{component}组件",
        inputVariables: ["component"],
      });

      const result = await template.format({ component: "按钮" });
      expect(result).toBe("创建一个按钮组件");
    });
  });

  // 变量验证测试
  describe("变量验证", () => {
    test("当缺少必需变量时应该抛出错误", async () => {
      const template = new PromptTemplate({
        template: "创建{component}组件，具有{functionality}功能",
        inputVariables: ["component", "functionality"],
      });

      await expect(
        template.format({ component: "按钮" })
      ).rejects.toThrow("缺少必需的变量：functionality");
    });

    test("应该验证模板中的所有变量都在inputVariables中声明", () => {
      expect(() => {
        new PromptTemplate({
          template: "创建{component}组件，具有{functionality}功能",
          inputVariables: ["component"], // 缺少 functionality
        });
      }).toThrow("模板中存在未声明的变量：functionality");
    });
  });

  // 部分变量和默认值测试
  describe("部分变量和默认值", () => {
    test("应该使用提供的默认值", async () => {
      const template = new PromptTemplate({
        template: "创建{component}组件，样式为{style}",
        inputVariables: ["component", "style"],
        defaultVariables: {
          style: "默认样式",
        },
      });

      const result = await template.format({ component: "按钮" });
      expect(result).toBe("创建按钮组件，样式为默认样式");
    });

    test("提供的值应该覆盖默认值", async () => {
      const template = new PromptTemplate({
        template: "创建{component}组件，样式为{style}",
        inputVariables: ["component", "style"],
        defaultVariables: {
          style: "默认样式",
        },
      });

      const result = await template.format({
        component: "按钮",
        style: "圆角样式",
      });
      expect(result).toBe("创建按钮组件，样式为圆角样式");
    });
  });

  // 特殊字符处理测试
  describe("特殊字符处理", () => {
    test("应该正确处理包含特殊字符的模板", async () => {
      const template = new PromptTemplate({
        template: "创建{component}组件，处理{event}事件，使用{symbol}符号",
        inputVariables: ["component", "event", "symbol"],
      });

      const result = await template.format({
        component: "表单",
        event: "onChange",
        symbol: "@",
      });
      expect(result).toBe("创建表单组件，处理onChange事件，使用@符号");
    });

    test("应该正确处理多行文本", async () => {
      const template = new PromptTemplate({
        template: "创建{component}组件：\n- 功能：{functionality}\n- 样式：{style}",
        inputVariables: ["component", "functionality", "style"],
      });

      const result = await template.format({
        component: "按钮",
        functionality: "点击提交",
        style: "圆角边框",
      });
      expect(result).toBe("创建按钮组件：\n- 功能：点击提交\n- 样式：圆角边框");
    });
  });

  // 模板组合测试
  describe("模板组合", () => {
    test("应该能够组合多个模板", async () => {
      const baseTemplate = new PromptTemplate({
        template: "创建{component}组件",
        inputVariables: ["component"],
      });

      const styleTemplate = new PromptTemplate({
        template: "{basePrompt}，样式为{style}",
        inputVariables: ["basePrompt", "style"],
      });

      const baseResult = await baseTemplate.format({ component: "按钮" });
      const finalResult = await styleTemplate.format({
        basePrompt: baseResult,
        style: "圆角",
      });

      expect(finalResult).toBe("创建按钮组件，样式为圆角");
    });
  });

  // 错误处理测试
  describe("错误处理", () => {
    test("应该优雅地处理无效的模板语法", () => {
      expect(() => {
        new PromptTemplate({
          template: "创建{component组件", // 缺少结束括号
          inputVariables: ["component"],
        });
      }).toThrow("花括号不匹配");
    });

    test("应该处理空模板", () => {
      expect(() => {
        new PromptTemplate({
          template: "",
          inputVariables: ["component"],
        });
      }).toThrow("模板不能为空");
    });

    test("应该处理重复的变量声明", () => {
      expect(() => {
        new PromptTemplate({
          template: "{var}{var}",
          inputVariables: ["var"],
        });
      }).toThrow('变量 "var" 在模板中重复出现');
    });
  });
});
