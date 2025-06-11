# @dawnswwwww/unsplash-mcp-server

🖼️ **强大的 Unsplash Model Context Protocol 服务器**

一个专为 AI 助手设计的 Unsplash 图片搜索和检索 MCP 服务器，支持智能搜索、随机图片和详细信息获取。

[![npm version](https://img.shields.io/npm/v/@dawnswwwww/unsplash-mcp-server.svg)](https://www.npmjs.com/package/@dawnswwwww/unsplash-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特性

- 🔍 **智能图片搜索** - 支持关键词、颜色、方向等多维度搜索
- 🎲 **随机图片获取** - 可配置过滤条件的随机图片
- 📋 **详细图片信息** - 包含 EXIF 数据、位置信息和摄影师详情
- 🚀 **即开即用** - 通过 `npx -y @dawnswwwww/unsplash-mcp-server` 直接使用
- 🔒 **类型安全** - 完全使用 TypeScript 编写，严格类型检查
- 🌐 **标准兼容** - 基于官方 MCP SDK 实现

## 🚀 快速开始

### 使用 npx（推荐）

```bash
npx -y @dawnswwwww/unsplash-mcp-server
```

### 获取 Unsplash API 密钥

1. 访问 [Unsplash Developers](https://unsplash.com/developers)
2. 注册并创建新应用
3. 获取您的 Access Key

### 配置 Claude Desktop

在您的 Claude Desktop 配置文件中添加：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "unsplash": {
      "command": "npx",
      "args": ["-y", "@dawnswwwww/unsplash-mcp-server"],
      "env": {
        "UNSPLASH_ACCESS_KEY": "your-access-key-here"
      }
    }
  }
}
```

## 🛠️ 可用工具

### `search_photos` - 搜索图片

```typescript
{
  "query": "mountain landscape",      // 搜索关键词
  "page": 1,                        // 页码 (可选)
  "per_page": 10,                   // 每页数量 (可选, 1-30)
  "order_by": "relevant",           // 排序方式 (可选: relevant, latest)
  "color": "blue",                  // 颜色过滤 (可选)
  "orientation": "landscape"        // 方向过滤 (可选: landscape, portrait, squarish)
}
```

### `get_photo` - 获取图片详情

```typescript
{
  "photoId": "Dwu85P9SOIk"          // 图片 ID
}
```

### `random_photo` - 获取随机图片

```typescript
{
  "count": 1,                       // 图片数量 (可选, 默认: 1, 最大: 30)
  "query": "coffee",                // 搜索关键词 (可选)
  "orientation": "portrait",        // 方向过滤 (可选)
  "featured": true                  // 仅精选图片 (可选)
}
```

## 🧪 测试

### 使用测试客户端

我们提供了一个专门的测试客户端来验证 MCP 服务器的功能：

```bash
# 进入测试客户端目录
cd test-client

# 安装依赖
npm install

# 设置 API 密钥
export UNSPLASH_ACCESS_KEY="your-access-key-here"

# 运行所有测试
npm test

# 运行特定测试
npm run test:search    # 测试搜索功能
npm run test:get       # 测试获取照片详情
npm run test:random    # 测试随机照片
```

测试客户端会：

- ✅ 自动连接到 MCP 服务器
- ✅ 测试所有三个工具的功能
- ✅ 提供详细的测试报告和时间统计
- ✅ 验证响应格式和数据完整性

### 测试输出示例

```
🧪 Unsplash MCP 服务器测试客户端
=====================================
✅ 连接成功!
📋 测试工具列表...
✅ 找到 3 个工具: search_photos, get_photo, random_photo
🔍 测试搜索功能...
✅ 搜索测试成功
📊 测试总结: 4/4 测试通过
```

## 🏗️ 本地开发

```bash
# 克隆仓库
git clone https://github.com/dawnswwwww/unsplash-mcp-server.git
cd unsplash-mcp-server

# 安装依赖
pnpm install

# 设置环境变量
export UNSPLASH_ACCESS_KEY="your-access-key-here"

# 开发模式
pnpm dev

# 构建
pnpm build

# 运行测试
pnpm test
```

## 📖 示例使用

### 在 Claude 中搜索图片

```
请帮我找几张关于"日出山景"的风景照片，要求是横向构图的。
```

Claude 将自动调用 `search_photos` 工具：

```json
{
  "query": "sunrise mountain landscape",
  "orientation": "landscape",
  "per_page": 5
}
```

### 获取随机图片

```
给我推荐一张随机的咖啡主题图片。
```

Claude 将调用 `random_photo` 工具：

```json
{
  "query": "coffee",
  "count": 1
}
```

## 🔧 环境变量

| 变量名                | 必需 | 描述                  |
| --------------------- | ---- | --------------------- |
| `UNSPLASH_ACCESS_KEY` | ✅   | Unsplash API 访问密钥 |

## 🤝 贡献

欢迎贡献代码！请查看我们的贡献指南。

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [Unsplash](https://unsplash.com/) - 提供高质量的免费图片
- [Model Context Protocol](https://modelcontextprotocol.io/) - 标准化的 AI 上下文协议
- 参考了 [hellokaton/unsplash-mcp-server](https://github.com/hellokaton/unsplash-mcp-server) 和其他优秀的开源项目
