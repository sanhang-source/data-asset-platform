#!/usr/bin/env node

/**
 * 简化版阿里云OSS部署脚本
 * 去除复杂的headers和callback，减少出错概率
 */

import OSS from 'ali-oss'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

// 加载环境变量
import 'dotenv/config'

// OSS配置 - 从环境变量读取
const ossConfig = {
  region: process.env.OSS_REGION || 'oss-cn-hangzhou',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
  secure: true // 使用HTTPS
}

// 验证配置
if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret || !ossConfig.bucket) {
  console.error('❌ OSS配置不完整，请检查环境变量：')
  console.error('   OSS_REGION、OSS_ACCESS_KEY_ID、OSS_ACCESS_KEY_SECRET、OSS_BUCKET')
  process.exit(1)
}

// 要上传的本地目录
const distDir = path.join(projectRoot, 'dist')

// 检查dist目录是否存在
if (!fs.existsSync(distDir)) {
  console.log('📦 dist目录不存在，先执行构建...')
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: projectRoot })
    console.log('✅ 构建成功')
  } catch (error) {
    console.error('❌ 构建失败:', error.message)
    process.exit(1)
  }
}

async function deploy() {
  console.log('🚀 开始部署到阿里云OSS...')
  console.log('📋 配置信息:')
  console.log(`   Region: ${ossConfig.region}`)
  console.log(`   Bucket: ${ossConfig.bucket}`)
  console.log(`   本地目录: ${distDir}`)

  try {
    // 初始化OSS客户端
    const client = new OSS(ossConfig)

    // 获取dist目录下的所有文件
    const files = getAllFiles(distDir)
    console.log(`📁 找到 ${files.length} 个文件需要上传`)

    let successCount = 0
    let errorCount = 0

    // 上传每个文件
    for (const file of files) {
      const relativePath = path.relative(distDir, file)
      const ossPath = relativePath.replace(/\\/g, '/')
      
      // 根据文件扩展名设置Content-Type
      const extension = path.extname(file).toLowerCase()
      const mimeType = getMimeType(extension)
      
      // 简化的headers配置
      const headers = {
        'Content-Type': mimeType,
        // 设置对象ACL为公共读
        'x-oss-object-acl': 'public-read'
      }
      
      // 对于网页资源文件设置Content-Disposition为inline
      const inlineExtensions = ['.html', '.htm', '.css', '.js', '.mjs', '.json', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico']
      if (inlineExtensions.includes(extension)) {
        headers['Content-Disposition'] = 'inline'
      }

      try {
        // 简化的上传选项，去掉callback和复杂meta
        const putOptions = {
          headers: headers,
          // 设置超时时间
          timeout: 60000,
          // 设置mime类型
          mime: mimeType
        }
        
        await client.put(ossPath, file, putOptions)
        console.log(`✅ 上传成功: ${ossPath} (${mimeType})`)
        successCount++
      } catch (error) {
        console.error(`❌ 上传失败 ${ossPath}:`, error.message)
        if (error.code) console.error(`   错误代码: ${error.code}`)
        if (error.status) console.error(`   HTTP状态: ${error.status}`)
        errorCount++
      }
    }

    console.log('\n🎉 部署完成！')
    console.log(`✅ 成功: ${successCount} 个文件`)
    if (errorCount > 0) {
      console.log(`❌ 失败: ${errorCount} 个文件`)
    }

    // 获取Bucket域名
    const endpoint = `https://${ossConfig.bucket}.${ossConfig.region}.aliyuncs.com`
    console.log('\n🌐 访问地址:')
    console.log(`   网站地址: ${endpoint}/index.html`)
    console.log(`   OSS控制台: https://oss.console.aliyun.com/bucket/oss-cn-shenzhen/${ossConfig.bucket}/object`)

  } catch (error) {
    console.error('❌ 部署失败:', error.message)
    if (error.code) console.error(`   错误代码: ${error.code}`)
    if (error.status) console.error(`   HTTP状态: ${error.status}`)
    process.exit(1)
  }
}

/**
 * 递归获取目录下所有文件
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath)

  files.forEach(file => {
    const fullPath = path.join(dirPath, file)
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles)
    } else {
      arrayOfFiles.push(fullPath)
    }
  })

  return arrayOfFiles
}

/**
 * 根据文件扩展名获取MIME类型
 */
function getMimeType(extension) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.txt': 'text/plain',
    '.xml': 'application/xml'
  }

  return mimeTypes[extension] || 'application/octet-stream'
}

// 执行部署
deploy()