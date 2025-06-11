import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js'
import { createDownloadInstructions, formatPhoto } from '../utils/formatter'
import type { UnsplashClient } from '../clients/unsplash'
import {
  RandomPhotoSchema,
  type RandomPhotoParams,
  type UnsplashPhoto,
} from './types'

export async function setupRandomPhoto(
  client: UnsplashClient,
  args: unknown,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  try {
    // 参数验证
    const params = RandomPhotoSchema.parse(args) as RandomPhotoParams

    // 调用 Unsplash API 获取随机照片
    const result = await client.getRandomPhoto(params)

    // 处理单张或多张照片的情况
    const photos: UnsplashPhoto[] = Array.isArray(result) ? result : [result]

    // 格式化照片数据
    const formattedPhotos = photos.map(formatPhoto)

    // 生成标题
    const title =
      formattedPhotos.length === 1
        ? '# 🎲 随机照片'
        : `# 🎲 ${formattedPhotos.length} 张随机照片`

    // 生成筛选条件描述
    const filterDescription = createFilterDescription(params)

    // 生成下载说明
    const instructions = createDownloadInstructions(formattedPhotos)

    // 组合结果
    const resultText = [
      title,
      '',
      filterDescription && `**筛选条件**: ${filterDescription}`,
      filterDescription && '',
      instructions,
      '',
      '📌 **使用说明**:',
      '• 这些图片来自 Unsplash，可免费使用于商业和个人项目',
      '• 无需注明出处，但建议注明摄影师姓名以表示感谢',
      '• 点击下载地址可获取对应尺寸的图片',
      '• 要获取更多随机照片，请重新调用此工具',
    ]
      .filter(Boolean)
      .join('\n')

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
      `获取随机照片时发生错误: ${error instanceof Error ? error.message : '未知错误'}`,
    )
  }
}

function createFilterDescription(params: RandomPhotoParams): string {
  const filters: string[] = []

  if (params.query) {
    filters.push(`关键词: ${params.query}`)
  }
  if (params.orientation) {
    const orientationMap = {
      landscape: '横向',
      portrait: '纵向',
      squarish: '方形',
    }
    filters.push(`方向: ${orientationMap[params.orientation]}`)
  }
  if (params.username) {
    filters.push(`摄影师: @${params.username}`)
  }
  if (params.collections) {
    filters.push(`收藏集: ${params.collections}`)
  }
  if (params.topics) {
    filters.push(`主题: ${params.topics}`)
  }
  if (params.featured) {
    filters.push('仅精选照片')
  }
  if (params.content_filter === 'high') {
    filters.push('高内容过滤')
  }

  return filters.join(' • ')
}
