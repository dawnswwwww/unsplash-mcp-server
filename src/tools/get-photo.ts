import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js'
import {
  createDownloadInstructions,
  createPhotoDetails,
  formatPhoto,
} from '../utils/formatter'
import type { UnsplashClient } from '../clients/unsplash'
import { GetPhotoSchema, type GetPhotoParams } from './types'

export async function setupGetPhoto(
  client: UnsplashClient,
  args: unknown,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  try {
    // 参数验证
    const params = GetPhotoSchema.parse(args) as GetPhotoParams

    // 调用 Unsplash API 获取照片详情
    const photo = await client.getPhoto(params)

    // 格式化照片数据
    const formattedPhoto = formatPhoto(photo)

    // 生成详细信息
    const photoDetails = createPhotoDetails(formattedPhoto)

    // 生成下载说明
    const instructions = createDownloadInstructions([formattedPhoto])

    // 组合结果
    const resultText = [
      `# 📸 照片详情`,
      '',
      photoDetails,
      '',
      instructions,
      '',
      '📌 **使用说明**:',
      '• 这张图片来自 Unsplash，可免费使用于商业和个人项目',
      '• 无需注明出处，但建议注明摄影师姓名以表示感谢',
      '• 点击下载地址可获取对应尺寸的图片',
      '• 商业使用时请遵守 Unsplash License',
    ].join('\n')

    return {
      content: [
        {
          type: 'text',
          text: resultText,
        },
      ],
    }
  } catch (error: unknown) {
    if (error instanceof McpError) {
      throw error
    }

    // Zod 验证错误
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as {
        issues: Array<{ path: string[]; message: string }>
      }
      const errorMessages = zodError.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      )
      throw new McpError(
        ErrorCode.InvalidParams,
        `参数验证失败: ${errorMessages.join(', ')}`,
      )
    }

    throw new McpError(
      ErrorCode.InternalError,
      `获取照片详情时发生错误: ${error instanceof Error ? error.message : '未知错误'}`,
    )
  }
}
