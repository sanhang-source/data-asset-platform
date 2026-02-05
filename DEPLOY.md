# 阿里云OSS部署指南

本项目支持一键部署到阿里云OSS（对象存储服务）。

## 前置条件

1. **阿里云账号**：拥有有效的阿里云账号
2. **OSS存储桶**：已在阿里云OSS创建存储桶（Bucket）
3. **AccessKey**：拥有阿里云AccessKey（有OSS操作权限）

## 部署步骤

### 1. 安装依赖

```bash
# 安装项目依赖（如果还没安装）
npm install

# 安装部署依赖（已添加到devDependencies，npm install时会自动安装）
# 依赖包含：ali-oss, dotenv
```

### 2. 配置OSS凭证

复制环境变量模板文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的阿里云OSS配置：

```env
# 阿里云OSS配置
# 请将以下配置替换为你的实际值

# OSS区域，例如：oss-cn-hangzhou、oss-cn-beijing、oss-cn-shanghai等
OSS_REGION=oss-cn-hangzhou

# 阿里云AccessKey ID
OSS_ACCESS_KEY_ID=your-access-key-id

# 阿里云AccessKey Secret
OSS_ACCESS_KEY_SECRET=your-access-key-secret

# OSS存储桶名称
OSS_BUCKET=your-bucket-name

# OSS目标目录（可选，如果部署到子目录）
# OSS_TARGET_PREFIX=subfolder
```

**如何获取配置信息：**

1. **OSS_REGION**：登录阿里云控制台 → OSS → 查看Bucket详情中的"地域"
2. **OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET**：阿里云控制台 → 头像 → AccessKey管理
3. **OSS_BUCKET**：你的Bucket名称

### 3. 构建和部署

执行一键部署命令：

```bash
npm run deploy
```

部署脚本会自动：
1. 检查并构建项目（如果dist目录不存在）
2. 上传所有文件到OSS
3. 显示上传结果和访问地址

### 4. 验证部署

访问脚本输出的OSS地址：
```
🌐 访问地址:
   根目录: https://your-bucket.oss-cn-hangzhou.aliyuncs.com/
```

**重要：配置Bucket为静态网站托管（可选）**

如果你希望通过域名直接访问应用，需要配置Bucket的静态网站托管功能：

1. 登录阿里云OSS控制台
2. 进入你的Bucket
3. 选择"基础设置" → "静态页面"
4. 开启静态页面设置：
   - 默认首页：index.html
   - 默认404页：index.html（支持SPA路由）
5. 保存配置

### 5. 配置自定义域名（可选）

1. 在OSS控制台配置"域名管理"
2. 绑定你的自定义域名
3. 配置CDN加速（推荐）

## 注意事项

### 1. 路由配置
本项目是单页应用（SPA），使用React Router。在OSS静态网站托管中：
- 确保错误页面配置为 `index.html`
- 确保所有路由都能正确重定向到index.html

### 2. 环境变量安全
- **不要**将 `.env` 文件提交到Git
- `.env` 文件已在 `.gitignore` 中排除
- 生产环境建议使用更安全的方式管理密钥

### 3. 跨域问题
如果前端需要调用API，可能需要在OSS配置CORS规则：
1. OSS控制台 → 权限管理 → 跨域设置
2. 添加CORS规则，允许你的API域名

### 4. 缓存策略
建议为静态文件配置合适的缓存策略：
- HTML文件：短缓存或无缓存
- JS/CSS/图片：长期缓存（可设置版本哈希）

## 手动部署方式

如果你不想使用自动脚本，也可以手动部署：

```bash
# 1. 构建项目
npm run build

# 2. 使用OSS控制台上传
# 进入dist目录，将所有文件上传到OSS Bucket

# 3. 或者使用ossutil工具
ossutil cp -r dist/ oss://your-bucket/ --recursive
```

## 常见问题

### Q: 上传时提示权限不足
A: 检查AccessKey是否具有OSS读写权限

### Q: 访问页面显示空白
A: 检查静态网站托管配置，确保默认首页为index.html

### Q: 路由页面404
A: 确保错误页面配置为index.html（SPA路由需要）

### Q: 如何更新部署
A: 直接运行 `npm run deploy`，脚本会自动清理旧文件并上传新文件

## 技术支持

如有部署问题，请检查：
1. 环境变量配置是否正确
2. OSS Bucket是否存在且可访问
3. 网络连接是否正常

---
*最后更新：2024-02-01*