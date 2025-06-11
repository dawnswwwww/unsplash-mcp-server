import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js'
import {
  createDownloadInstructions,
  createSearchSummary,
  formatPhoto,
} from '../utils/formatter'
import type { UnsplashClient } from '../clients/unsplash'
import { SearchPhotosSchema, type SearchPhotosParams } from './types'

export async function setupSearchPhotos(
  client: UnsplashClient,
  args: unknown,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  try {
    // 参数验证
    const params = SearchPhotosSchema.parse(args) as SearchPhotosParams

    // 调用 Unsplash API
    const response = await client.searchPhotos(params)

    // 检查结果
    if (response.total === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `未找到与 "${params.query}" 相关的照片。\n\n建议：\n• 尝试更通用的关键词\n• 检查拼写是否正确\n• 使用英文关键词可能有更好的结果`,
          },
        ],
      }
    }

    // 格式化照片数据
    const formattedPhotos = response.results.map(formatPhoto)

    // 生成搜索摘要
    const summary = createSearchSummary(
      params.query,
      response.total,
      params.page,
      params.per_page,
      response.total_pages,
    )

    // 生成下载说明
    const instructions = createDownloadInstructions(formattedPhotos)

    // 组合结果
    const resultText = [
      summary,
      '',
      instructions,
      '',
      '📌 **使用说明**:',
      '• 这些图片来自 Unsplash，可免费使用于商业和个人项目',
      '• 无需注明出处，但建议注明摄影师姓名以表示感谢',
      '• 点击下载地址可获取对应尺寸的图片',
      params.page < response.total_pages
        ? `• 要查看更多结果，请使用 page: ${params.page + 1}`
        : '',
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
      `搜索照片时发生错误: ${error instanceof Error ? error.message : '未知错误'}`,
    )
  }
}
