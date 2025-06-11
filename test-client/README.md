# Unsplash MCP 测试客户端

这是一个用于测试 `@dawnswwwww/unsplash-mcp-server` 服务器的独立测试客户端。

## 功能特点

- 🔌 **自动连接**: 通过 npx 自动启动和连接 Unsplash MCP 服务器
- 🧪 **全面测试**: 测试所有三个工具 (search_photos, get_photo, random_photo)
- 📊 **详细报告**: 提供测试时间和成功率统计
- 🎯 **选择性测试**: 支持单独测试特定功能

## 安装和使用

### 环境要求

- Node.js 18+
- NPM 或 PNPM
- Unsplash API 密钥

### 设置 API 密钥

```bash
export UNSPLASH_ACCESS_KEY="your-unsplash-api-key"
```

### 运行测试

```bash
# 安装依赖
cd test-client
npm install

# 运行所有测试
npm test

# 运行特定测试
npm run test:search    # 只测试搜索功能
npm run test:get       # 只测试获取照片详情
npm run test:random    # 只测试随机照片

# 开发模式运行
npm run dev
```

## 测试项目

### 1. 工具列表测试

检查服务器是否正确暴露了所有三个工具。

### 2. 搜索照片测试 (`search_photos`)

- 搜索关键词: "mountain landscape"
- 筛选条件: 横向布局，3张图片
- 验证响应格式和内容

### 3. 获取照片详情 (`get_photo`)

- 使用示例照片ID: "Dwu85P9SOIk"
- 验证返回的详细信息格式

### 4. 随机照片测试 (`random_photo`)

- 获取2张自然主题的随机照片
- 筛选条件: 横向布局
- 验证随机性和响应格式

## 输出示例

```
🧪 Unsplash MCP 服务器测试客户端
=====================================
🔌 连接到 Unsplash MCP 服务器...
✅ 连接成功!

📋 测试工具列表...
✅ 找到 3 个工具:
   1. search_photos - Search for photos on Unsplash with various filters
   2. get_photo - Get detailed information about a specific photo
   3. random_photo - Get one or more random photos from Unsplash

🔍 测试搜索功能...
✅ 搜索测试成功
📊 响应长度: 2847 字符

📸 测试获取照片详情...
✅ 照片详情测试成功
📊 响应长度: 1923 字符

🎲 测试随机照片...
✅ 随机照片测试成功
📊 响应长度: 3142 字符

📊 测试总结
=============
✅ listTools: 成功 (1250ms)
✅ searchPhotos: 成功 (2341ms)
✅ getPhoto: 成功 (1876ms)
✅ randomPhoto: 成功 (2103ms)

🎯 总计: 4/4 测试通过
⏱️  总耗时: 7570ms

🎉 所有测试通过! Unsplash MCP 服务器运行正常.
```

## 故障排除

### 常见问题

1. **连接失败**

   - 确保已安装 `@dawnswwwww/unsplash-mcp-server` 包
   - 检查网络连接
   - 验证 npx 是否可用

2. **API 密钥错误**

   - 确保设置了正确的 `UNSPLASH_ACCESS_KEY`
   - 从 [Unsplash Developers](https://unsplash.com/developers) 获取有效密钥

3. **测试超时**
   - 首次运行可能较慢，需要下载依赖
   - 网络较慢时适当增加超时时间

### 调试模式

如果遇到问题，可以查看详细的错误信息：

```bash
DEBUG=* npm test
```

## 项目结构

```
test-client/
├── src/
│   └── index.ts          # 主测试客户端代码
├── package.json          # 项目配置和脚本
├── tsconfig.json         # TypeScript 配置
├── tsdown.config.ts      # 构建配置
└── README.md            # 本文档
```

## 开发和贡献

如果需要修改测试逻辑或添加新的测试用例：

1. 编辑 `src/index.ts`
2. 运行 `npm run build` 构建
3. 运行 `npm test` 验证更改

## 许可证

MIT License
