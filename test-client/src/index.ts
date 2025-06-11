#!/usr/bin/env node

import process from 'node:process'
import path from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

interface TestResult {
  success: boolean
  error?: string
  data?: any
  duration: number
}

class UnsplashMCPTestClient {
  private client: Client
  private transport: StdioClientTransport | null = null

  constructor() {
    this.client = new Client(
      {
        name: 'unsplash-mcp-test-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      },
    )
  }

  async connect(): Promise<void> {
    console.log('🔌 连接到 Unsplash MCP 服务器...')

    this.transport = new StdioClientTransport({
      command: 'node',
      args: [
        path.join(
          process.cwd().replace('/test-client', ''),
          'dist',
          'index.js',
        ),
      ],
      env: {
        ...process.env,
        UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY || 'demo-key',
      },
    })

    await this.client.connect(this.transport)
    console.log('✅ 连接成功!')
  }

  async disconnect(): Promise<void> {
    if (this.transport) {
      await this.client.close()
      console.log('🔌 连接已断开')
    }
  }

  async testListTools(): Promise<TestResult> {
    const startTime = Date.now()
    try {
      console.log('\n📋 测试工具列表...')
      const result = await this.client.listTools()
      const duration = Date.now() - startTime

      console.log(`✅ 找到 ${result.tools.length} 个工具:`)
      result.tools.forEach((tool, index) => {
        console.log(`   ${index + 1}. ${tool.name} - ${tool.description}`)
      })

      return { success: true, data: result, duration }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error('❌ 工具列表测试失败:', error)
      return { success: false, error: String(error), duration }
    }
  }

  async testSearchPhotos(): Promise<TestResult> {
    const startTime = Date.now()
    try {
      console.log('\n🔍 测试搜索功能...')
      const result = await this.client.callTool({
        name: 'search_photos',
        arguments: {
          query: 'mountain landscape',
          per_page: 3,
          orientation: 'landscape',
        },
      })
      const duration = Date.now() - startTime

      console.log('✅ 搜索测试成功')
      console.log(`📊 响应长度: ${JSON.stringify(result).length} 字符`)

      return { success: true, data: result, duration }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error('❌ 搜索测试失败:', error)
      return { success: false, error: String(error), duration }
    }
  }

  async testGetPhoto(): Promise<TestResult> {
    const startTime = Date.now()
    try {
      console.log('\n📸 测试获取照片详情...')

      // 先搜索一张照片来获取有效的ID
      const searchResult = await this.client.callTool({
        name: 'search_photos',
        arguments: {
          query: 'nature',
          per_page: 1,
        },
      })

      // 从搜索结果中提取照片ID
      const searchContent = (searchResult.content as any)?.[0]?.text || ''
      const photoIdMatch = searchContent.match(/照片ID[：:]\s*([\w-]+)/)
      let photoId = photoIdMatch ? photoIdMatch[1] : null

      // 如果没有从搜索结果中找到ID，使用备用方案
      if (!photoId) {
        // 尝试几个常用的照片ID
        const fallbackIds = ['tAKXap853rY', 'xekxE_VR0Ec', 'hvdnff_bieQ']
        photoId = fallbackIds[0]
      }

      console.log(`🔍 使用照片ID: ${photoId}`)

      const result = await this.client.callTool({
        name: 'get_photo',
        arguments: {
          photoId,
        },
      })
      const duration = Date.now() - startTime

      console.log('✅ 照片详情测试成功')
      console.log(`📊 响应长度: ${JSON.stringify(result).length} 字符`)

      return { success: true, data: result, duration }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error('❌ 照片详情测试失败:', error)
      return { success: false, error: String(error), duration }
    }
  }

  async testRandomPhoto(): Promise<TestResult> {
    const startTime = Date.now()
    try {
      console.log('\n🎲 测试随机照片...')
      const result = await this.client.callTool({
        name: 'random_photo',
        arguments: {
          count: 2,
          query: 'nature',
          orientation: 'landscape',
        },
      })
      const duration = Date.now() - startTime

      console.log('✅ 随机照片测试成功')
      console.log(`📊 响应长度: ${JSON.stringify(result).length} 字符`)

      return { success: true, data: result, duration }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error('❌ 随机照片测试失败:', error)
      return { success: false, error: String(error), duration }
    }
  }

  async runTests(testType: string = 'all'): Promise<void> {
    console.log('🧪 Unsplash MCP 服务器测试客户端')
    console.log('=====================================')

    try {
      await this.connect()

      const results: Record<string, TestResult> = {}

      // 总是先测试工具列表
      results.listTools = await this.testListTools()

      switch (testType) {
        case 'search':
          results.searchPhotos = await this.testSearchPhotos()
          break
        case 'get':
          results.getPhoto = await this.testGetPhoto()
          break
        case 'random':
          results.randomPhoto = await this.testRandomPhoto()
          break
        case 'all':
        default:
          results.searchPhotos = await this.testSearchPhotos()
          results.getPhoto = await this.testGetPhoto()
          results.randomPhoto = await this.testRandomPhoto()
          break
      }

      // 输出测试总结
      console.log('\n📊 测试总结')
      console.log('=============')

      let totalTests = 0
      let successfulTests = 0
      let totalDuration = 0

      Object.entries(results).forEach(([testName, result]) => {
        totalTests++
        totalDuration += result.duration

        if (result.success) {
          successfulTests++
          console.log(`✅ ${testName}: 成功 (${result.duration}ms)`)
        } else {
          console.log(`❌ ${testName}: 失败 (${result.duration}ms)`)
          console.log(`   错误: ${result.error}`)
        }
      })

      console.log(`\n🎯 总计: ${successfulTests}/${totalTests} 测试通过`)
      console.log(`⏱️  总耗时: ${totalDuration}ms`)

      if (successfulTests === totalTests) {
        console.log('\n🎉 所有测试通过! Unsplash MCP 服务器运行正常.')
      } else {
        console.log('\n⚠️  部分测试失败，请检查服务器配置和网络连接.')
        process.exit(1)
      }
    } catch (error) {
      console.error('❌ 测试运行失败:', error)
      process.exit(1)
    } finally {
      await this.disconnect()
    }
  }
}

async function main(): Promise<void> {
  const testType = process.argv[2] || 'all'

  // 检查环境变量
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    console.log('⚠️  警告: 未设置 UNSPLASH_ACCESS_KEY 环境变量')
    console.log('   某些测试可能会失败。请设置您的 Unsplash API 密钥。')
    console.log('   获取方式: https://unsplash.com/developers')
    console.log('')
  }

  const testClient = new UnsplashMCPTestClient()
  await testClient.runTests(testType)
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', promise, '原因:', reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
  process.exit(1)
})

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('主程序执行失败:', error)
    process.exit(1)
  })
}
