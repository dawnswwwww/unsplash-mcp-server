#!/usr/bin/env node

import process from 'node:process'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js'
import { UnsplashClient } from './clients/unsplash.js'
import { setupGetPhoto } from './tools/get-photo.js'
import { setupRandomPhoto } from './tools/random-photo.js'
import { setupSearchPhotos } from './tools/search-photos.js'

class UnsplashMCPServer {
  private server: Server
  private unsplashClient: UnsplashClient

  constructor() {
    this.server = new Server(
      {
        name: '@webbuilder/unsplash-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    )

    // 初始化 Unsplash 客户端
    const accessKey = process.env.UNSPLASH_ACCESS_KEY
    if (!accessKey) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'UNSPLASH_ACCESS_KEY environment variable is required',
      )
    }

    this.unsplashClient = new UnsplashClient(accessKey)
    this.setupTools()
    this.setupErrorHandling()
  }

  private setupTools(): void {
    // 注册工具列表处理器
    // eslint-disable-next-line require-await
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_photos',
            description: 'Search for photos on Unsplash with various filters',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query for photos',
                },
                page: {
                  type: 'number',
                  description: 'Page number (1-999)',
                  minimum: 1,
                  maximum: 999,
                  default: 1,
                },
                per_page: {
                  type: 'number',
                  description: 'Number of photos per page (1-30)',
                  minimum: 1,
                  maximum: 30,
                  default: 10,
                },
                order_by: {
                  type: 'string',
                  enum: ['relevant', 'latest'],
                  description: 'Sort order',
                  default: 'relevant',
                },
                color: {
                  type: 'string',
                  enum: [
                    'black_and_white',
                    'black',
                    'white',
                    'yellow',
                    'orange',
                    'red',
                    'purple',
                    'magenta',
                    'green',
                    'teal',
                    'blue',
                  ],
                  description: 'Filter by color',
                },
                orientation: {
                  type: 'string',
                  enum: ['landscape', 'portrait', 'squarish'],
                  description: 'Filter by orientation',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_photo',
            description: 'Get detailed information about a specific photo',
            inputSchema: {
              type: 'object',
              properties: {
                photoId: {
                  type: 'string',
                  description: 'The ID of the photo to retrieve',
                },
              },
              required: ['photoId'],
            },
          },
          {
            name: 'random_photo',
            description: 'Get one or more random photos from Unsplash',
            inputSchema: {
              type: 'object',
              properties: {
                count: {
                  type: 'number',
                  description: 'Number of photos to return (1-30)',
                  minimum: 1,
                  maximum: 30,
                  default: 1,
                },
                collections: {
                  type: 'string',
                  description: 'Comma-separated collection IDs to filter by',
                },
                topics: {
                  type: 'string',
                  description: 'Comma-separated topic IDs to filter by',
                },
                username: {
                  type: 'string',
                  description: 'Username to filter by',
                },
                query: {
                  type: 'string',
                  description: 'Keywords to filter by',
                },
                orientation: {
                  type: 'string',
                  enum: ['landscape', 'portrait', 'squarish'],
                  description: 'Filter by orientation',
                },
                content_filter: {
                  type: 'string',
                  enum: ['low', 'high'],
                  description: 'Content filter level',
                  default: 'low',
                },
                featured: {
                  type: 'boolean',
                  description: 'Only return featured photos',
                },
              },
            },
          },
        ],
      }
    })

    // 注册工具调用处理器
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'search_photos':
            return await setupSearchPhotos(
              this.unsplashClient,
              request.params.arguments,
            )

          case 'get_photo':
            return await setupGetPhoto(
              this.unsplashClient,
              request.params.arguments,
            )

          case 'random_photo':
            return await setupRandomPhoto(
              this.unsplashClient,
              request.params.arguments,
            )

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`,
            )
        }
      } catch (error: unknown) {
        if (error instanceof McpError) {
          throw error
        }

        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
    })
  }

  private setupErrorHandling(): void {
    // 全局错误处理
    // eslint-disable-next-line unicorn/prefer-add-event-listener
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error)
    }

    process.on('SIGINT', async () => {
      await this.server.close()
      process.exit(0)
    })
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('Unsplash MCP server running on stdio')
  }
}

// 启动服务器
async function main(): Promise<void> {
  try {
    const server = new UnsplashMCPServer()
    await server.run()
  } catch (error: unknown) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}
