import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js'
import type {
  GetPhotoParams,
  RandomPhotoParams,
  SearchPhotosParams,
  UnsplashError,
  UnsplashPhoto,
  UnsplashSearchResponse,
} from '../tools/types'

export class UnsplashClient {
  private readonly accessKey: string
  private readonly baseUrl = 'https://api.unsplash.com'
  private readonly appName = '@webbuilder/unsplash-mcp'

  constructor(accessKey: string) {
    this.accessKey = accessKey
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, string | number | boolean> = {},
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)

    // 添加查询参数
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })

    try {
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Client-ID ${this.accessKey}`,
          'Accept-Version': 'v1',
          'User-Agent': `${this.appName}/1.0.0`,
        },
      })

      // 检查响应状态
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`

        try {
          const errorData = (await response.json()) as UnsplashError
          if (errorData.errors && errorData.errors.length > 0) {
            errorMessage = errorData.errors.join(', ')
          }
        } catch {
          // 如果解析错误响应失败，使用默认错误消息
        }

        // 根据状态码抛出相应的MCP错误
        switch (response.status) {
          case 401:
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Authentication failed: ${errorMessage}. Please check your UNSPLASH_ACCESS_KEY.`,
            )
          case 403:
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Access forbidden: ${errorMessage}. Please check your API permissions.`,
            )
          case 404:
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Resource not found: ${errorMessage}`,
            )
          case 429:
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Rate limit exceeded: ${errorMessage}. Please try again later.`,
            )
          case 500:
          case 502:
          case 503:
            throw new McpError(
              ErrorCode.InternalError,
              `Unsplash service error: ${errorMessage}. Please try again later.`,
            )
          default:
            throw new McpError(
              ErrorCode.InternalError,
              `Unexpected error: ${errorMessage}`,
            )
        }
      }

      const data = (await response.json()) as T
      return data
    } catch (error: unknown) {
      if (error instanceof McpError) {
        throw error
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new McpError(
          ErrorCode.InternalError,
          'Network error: Unable to connect to Unsplash API. Please check your internet connection.',
        )
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async searchPhotos(
    params: SearchPhotosParams,
  ): Promise<UnsplashSearchResponse> {
    const searchParams: Record<string, string | number> = {
      query: params.query,
      page: params.page,
      per_page: params.per_page,
      order_by: params.order_by,
    }

    // 添加可选参数
    if (params.color) {
      searchParams.color = params.color
    }
    if (params.orientation) {
      searchParams.orientation = params.orientation
    }

    return await this.makeRequest<UnsplashSearchResponse>(
      '/search/photos',
      searchParams,
    )
  }

  async getPhoto(params: GetPhotoParams): Promise<UnsplashPhoto> {
    return await this.makeRequest<UnsplashPhoto>(`/photos/${params.photoId}`)
  }

  async getRandomPhoto(
    params: RandomPhotoParams,
  ): Promise<UnsplashPhoto | UnsplashPhoto[]> {
    const searchParams: Record<string, string | number | boolean> = {}

    // 添加所有可选参数
    if (params.count !== undefined) {
      searchParams.count = params.count
    }
    if (params.collections) {
      searchParams.collections = params.collections
    }
    if (params.topics) {
      searchParams.topics = params.topics
    }
    if (params.username) {
      searchParams.username = params.username
    }
    if (params.query) {
      searchParams.query = params.query
    }
    if (params.orientation) {
      searchParams.orientation = params.orientation
    }
    if (params.content_filter) {
      searchParams.content_filter = params.content_filter
    }
    if (params.featured !== undefined) {
      searchParams.featured = params.featured
    }

    const result = await this.makeRequest<UnsplashPhoto | UnsplashPhoto[]>(
      '/photos/random',
      searchParams,
    )

    return result
  }

  // 统计方法：下载照片（触发下载统计）
  async triggerDownload(photoId: string): Promise<{ url: string }> {
    return await this.makeRequest<{ url: string }>(
      `/photos/${photoId}/download`,
    )
  }

  // 获取用户统计信息
  async getUserStats(username: string): Promise<{
    username: string
    downloads: {
      total: number
      historical: {
        change: number
        average: number
        resolution: string
        quantity: number
        values: Array<{ date: string; value: number }>
      }
    }
    views: {
      total: number
      historical: {
        change: number
        average: number
        resolution: string
        quantity: number
        values: Array<{ date: string; value: number }>
      }
    }
    likes: {
      total: number
      historical: {
        change: number
        average: number
        resolution: string
        quantity: number
        values: Array<{ date: string; value: number }>
      }
    }
  }> {
    return await this.makeRequest(`/users/${username}/statistics`)
  }

  // 获取照片统计信息
  async getPhotoStats(photoId: string): Promise<{
    id: string
    downloads: {
      total: number
      historical: {
        change: number
        resolution: string
        quantity: number
        values: Array<{ date: string; value: number }>
      }
    }
    views: {
      total: number
      historical: {
        change: number
        resolution: string
        quantity: number
        values: Array<{ date: string; value: number }>
      }
    }
    likes: {
      total: number
      historical: {
        change: number
        resolution: string
        quantity: number
        values: Array<{ date: string; value: number }>
      }
    }
  }> {
    return await this.makeRequest(`/photos/${photoId}/statistics`)
  }
}
