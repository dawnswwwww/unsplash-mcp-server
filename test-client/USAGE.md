# Test Client 使用指南

## 快速开始

```bash
# 1. 进入测试客户端目录
cd test-client

# 2. 安装依赖
npm install

# 3. 查看演示（无需 API 密钥）
npm run demo

# 4. 设置真实 API 密钥并运行完整测试
export UNSPLASH_ACCESS_KEY="your-unsplash-api-key"
npm test
```

## 测试模式

### 1. 演示模式（无需 API 密钥）

```bash
npm run demo
```

- 展示基本功能概述
- 不需要真实的 API 密钥
- 快速验证 MCP 架构理解

### 2. 完整测试模式

```bash
npm test
```

- 真实连接 MCP 服务器
- 测试所有三个工具
- 需要有效的 Unsplash API 密钥

### 3. 选择性测试

```bash
npm run test:search    # 只测试搜索功能
npm run test:get       # 只测试照片详情获取
npm run test:random    # 只测试随机照片功能
```

## 工作原理

### MCP 客户端 → 服务器通信流程

1. **连接阶段**

   ```typescript
   // 客户端启动 MCP 服务器进程
   StdioClientTransport → 启动 node ../dist/index.js

   // 建立双向通信
   Client ← stdin/stdout → Server
   ```

2. **工具发现**

   ```typescript
   // 客户端请求工具列表
   client.listTools() → server.listTools()

   // 服务器返回可用工具
   [search_photos, get_photo, random_photo]
   ```

3. **工具调用**

   ```typescript
   // 客户端调用工具
   client.callTool('search_photos', { query: 'mountain' })

   // 服务器执行并返回结果
   → Unsplash API → 格式化响应 → 返回给客户端
   ```

## 测试覆盖范围

### ✅ 连接测试

- MCP 协议握手
- 传输层验证
- 错误处理

### ✅ 工具列表测试

- 服务器工具注册
- 工具元数据验证
- 工具数量检查

### ✅ 功能测试

- **搜索照片**: 关键词搜索、筛选条件
- **照片详情**: ID 查询、详细信息格式
- **随机照片**: 批量获取、随机性验证

### ✅ 错误处理测试

- API 密钥验证
- 参数验证
- 网络错误处理

## 输出解读

### 成功输出示例

```
🧪 Unsplash MCP 服务器测试客户端
=====================================
✅ 连接成功!
📋 测试工具列表...
✅ 找到 3 个工具: search_photos, get_photo, random_photo
🔍 测试搜索功能...
✅ 搜索测试成功 (1234ms)
📊 测试总结: 4/4 测试通过
```

### 错误输出示例

```
❌ API 密钥错误: Authentication failed
💡 解决方案: 检查 UNSPLASH_ACCESS_KEY 环境变量
```

## 故障排除

### 问题 1: 连接失败

```
❌ 连接失败: Connection closed
```

**解决方案:**

- 确保主项目已构建: `cd .. && npm run build`
- 检查路径配置: 验证 `../dist/index.js` 存在

### 问题 2: API 密钥错误

```
❌ Authentication failed: OAuth error
```

**解决方案:**

- 检查环境变量: `echo $UNSPLASH_ACCESS_KEY`
- 获取新密钥: https://unsplash.com/developers
- 重新设置: `export UNSPLASH_ACCESS_KEY="new-key"`

### 问题 3: 工具调用失败

```
❌ 工具调用失败: Tool execution error
```

**解决方案:**

- 检查网络连接
- 验证 API 限制和配额
- 查看详细错误信息

## 自定义测试

要添加自定义测试用例，编辑 `src/index.ts`:

```typescript
// 添加新的测试函数
async testCustomFunction(): Promise<TestResult> {
  const startTime = Date.now()
  try {
    const result = await this.client.callTool('your_tool', {
      // 你的参数
    })

    return {
      success: true,
      data: result,
      duration: Date.now() - startTime
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    }
  }
}
```

## 集成到 CI/CD

```yaml
# .github/workflows/test.yml
name: MCP Server Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          npm install
          cd test-client && npm install

      - name: Build server
        run: npm run build

      - name: Run MCP tests
        run: cd test-client && npm test
        env:
          UNSPLASH_ACCESS_KEY: ${{ secrets.UNSPLASH_ACCESS_KEY }}
```

这个测试客户端展示了如何：

- 🔌 建立 MCP 客户端到服务器的连接
- 🛠️ 调用 MCP 工具并处理响应
- 📊 提供详细的测试报告和性能统计
- 🚀 验证整个 MCP 生态系统的正确性
