import process from 'node:process'
import { z } from 'zod'

export class ValidationError extends Error {
  constructor(
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function validateParams<T>(schema: z.ZodSchema<T>, params: unknown): T {
  try {
    return schema.parse(params)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ')
      throw new ValidationError(`参数验证失败: ${errorMessages}`, {
        errors: error.errors,
        params,
      })
    }
    throw error
  }
}

export function validateEnvironment(): string {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    throw new Error(
      '缺少 Unsplash Access Key。请设置环境变量 UNSPLASH_ACCESS_KEY。\n' +
        '获取方式：访问 https://unsplash.com/developers 创建应用并获取 Access Key。',
    )
  }
  return accessKey
}
