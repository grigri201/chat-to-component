/**
 * 模板变量的值类型
 */
export type TemplateValue = string | number | boolean;

/**
 * 模板变量映射
 */
export type TemplateVariables = Record<string, TemplateValue>;

/**
 * 模板验证结果
 */
export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 错误类型枚举
 */
export enum PromptErrorType {
  SYNTAX_ERROR = 'SYNTAX_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  VARIABLE_ERROR = 'VARIABLE_ERROR'
}

/**
 * PromptTemplate 的构造参数
 */
export interface PromptTemplateInput {
  /** 模板字符串，使用 {变量名} 语法 */
  template: string;
  /** 模板中使用的变量名列表 */
  inputVariables: string[];
  /** 可选的默认值映射 */
  defaultVariables?: TemplateVariables;
  /** 是否允许未声明的变量 */
  allowUnknownVariables?: boolean;
  /** 是否允许未使用的变量 */
  allowUnusedVariables?: boolean;
}

/**
 * 提示模板相关错误
 */
export class PromptTemplateError extends Error {
  public readonly type: PromptErrorType;

  constructor(message: string, type: PromptErrorType = PromptErrorType.VALIDATION_ERROR) {
    super(message);
    this.name = 'PromptTemplateError';
    this.type = type;
  }
}

/**
 * 模板解析结果
 */
export interface ParsedTemplate {
  /** 变量名称集合 */
  variables: Set<string>;
  /** 变量匹配信息 */
  matches: Array<{
    variable: string;
    start: number;
    end: number;
  }>;
}
