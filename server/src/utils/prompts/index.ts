import { PromptErrorType, PromptTemplateError, type ParsedTemplate, type PromptTemplateInput, type TemplateValidationResult, type TemplateVariables } from "./types";

/**
 * PromptTemplate 类用于管理和格式化提示模板
 */
export class PromptTemplate {
  private readonly template: string;
  private readonly parsedTemplate: ParsedTemplate;
  public readonly inputVariables: string[];
  private readonly defaultVariables: TemplateVariables;
  private readonly options: {
    allowUnknownVariables: boolean;
    allowUnusedVariables: boolean;
  };

  constructor(input: PromptTemplateInput) {
    this.validateInput(input);
    
    this.template = input.template;
    this.inputVariables = input.inputVariables;
    this.defaultVariables = input.defaultVariables || {};
    this.options = {
      allowUnknownVariables: input.allowUnknownVariables ?? false,
      allowUnusedVariables: input.allowUnusedVariables ?? false
    };

    this.parsedTemplate = this.parseTemplate(this.template);
    this.validateVariables();
  }

  /**
   * 验证输入参数
   */
  private validateInput(input: PromptTemplateInput): void {
    if (!input.template) {
      throw new PromptTemplateError('模板不能为空', PromptErrorType.VALIDATION_ERROR);
    }

    if (!Array.isArray(input.inputVariables)) {
      throw new PromptTemplateError(
        'inputVariables 必须是字符串数组',
        PromptErrorType.VALIDATION_ERROR
      );
    }
  }

  /**
   * 解析模板字符串
   */
  private parseTemplate(template: string): ParsedTemplate {
    const variables = new Set<string>();
    const matches: ParsedTemplate['matches'] = [];
    const regex = /{([^{}]+)}/g;
    let match: RegExpExecArray | null;

    // 验证花括号配对
    const openCount = (template.match(/{/g) || []).length;
    const closeCount = (template.match(/}/g) || []).length;
    if (openCount !== closeCount) {
      throw new PromptTemplateError('花括号不匹配', PromptErrorType.SYNTAX_ERROR);
    }

    // 提取变量
    while ((match = regex.exec(template)) !== null) {
      const variable = match[1].trim();
      
      if (variables.has(variable)) {
        throw new PromptTemplateError(
          `变量 "${variable}" 在模板中重复出现`,
          PromptErrorType.VARIABLE_ERROR
        );
      }

      variables.add(variable);
      matches.push({
        variable,
        start: match.index,
        end: match.index + match[0].length
      });
    }

    return { variables, matches };
  }

  /**
   * 验证变量一致性
   */
  private validateVariables(): void {
    const templateVars = this.parsedTemplate.variables;
    const declaredVars = new Set(this.inputVariables);

    // 检查未声明的变量
    if (!this.options.allowUnknownVariables) {
      for (const variable of templateVars) {
        if (!declaredVars.has(variable)) {
          throw new PromptTemplateError(
            `模板中存在未声明的变量：${variable}`,
            PromptErrorType.VARIABLE_ERROR
          );
        }
      }
    }

    // 检查未使用的变量
    if (!this.options.allowUnusedVariables) {
      for (const variable of declaredVars) {
        if (!templateVars.has(variable)) {
          throw new PromptTemplateError(
            `声明的变量未在模板中使用：${variable}`,
            PromptErrorType.VARIABLE_ERROR
          );
        }
      }
    }
  }

  /**
   * 格式化模板
   */
  public async format(variables: TemplateVariables): Promise<string> {
    this.validateFormatVariables(variables);

    let result = this.template;
    for (const { variable } of this.parsedTemplate.matches) {
      const value = variables[variable] ?? this.defaultVariables[variable];
      result = result.replace(`{${variable}}`, String(value));
    }

    return result;
  }

  /**
   * 验证格式化变量
   */
  private validateFormatVariables(variables: TemplateVariables): void {
    const missingVars = Array.from(this.parsedTemplate.variables)
      .filter(v => !(v in variables) && !(v in this.defaultVariables));

    if (missingVars.length > 0) {
      throw new PromptTemplateError(
        `缺少必需的变量：${missingVars.join(', ')}`,
        PromptErrorType.VALIDATION_ERROR
      );
    }
  }

  /**
   * 创建部分应用的模板
   */
  public partial(partialVariables: TemplateVariables): PromptTemplate {
    const remainingVariables = this.inputVariables.filter(
      v => !(v in partialVariables)
    );

    return new PromptTemplate({
      template: this.template,
      inputVariables: remainingVariables,
      defaultVariables: {
        ...this.defaultVariables,
        ...partialVariables
      },
      allowUnknownVariables: this.options.allowUnknownVariables,
      allowUnusedVariables: this.options.allowUnusedVariables
    });
  }

  /**
   * 获取模板中的所有变量
   */
  public getVariables(): Set<string> {
    return new Set(this.parsedTemplate.variables);
  }

  /**
   * 验证模板是否有效
   */
  public validate(): TemplateValidationResult {
    try {
      this.validateVariables();
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof PromptTemplateError) {
        return { isValid: false, errors: [error.message] };
      }
      return { isValid: false, errors: ['未知错误'] };
    }
  }
}
