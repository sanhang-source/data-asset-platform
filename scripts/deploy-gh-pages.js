#!/usr/bin/env node
/**
 * GitHub Pages 部署脚本
 * 将dist目录推送到gh-pages分支
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const DIST_DIR = 'dist';
const TEMP_DIR = '.gh-pages-temp';

console.log('🚀 开始部署到GitHub Pages...\n');

try {
  // 1. 检查dist目录是否存在
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ 错误: dist目录不存在，请先运行 npm run build:gh-pages');
    process.exit(1);
  }

  // 2. 获取当前分支
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`📍 当前分支: ${currentBranch}`);

  // 3. 检查是否有未提交的更改
  try {
    execSync('git diff-index --quiet HEAD --');
  } catch {
    console.log('⚠️  警告: 有未提交的更改，继续部署...');
  }

  // 4. 创建临时目录
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true });
  }
  fs.mkdirSync(TEMP_DIR);

  // 5. 复制dist内容到临时目录
  console.log('📦 复制dist目录到临时位置...');
  copyDir(DIST_DIR, TEMP_DIR);

  // 6. 创建.nojekyll文件（防止Jekyll处理）
  fs.writeFileSync(path.join(TEMP_DIR, '.nojekyll'), '');

  // 7. 切换到gh-pages分支（如果不存在则创建）
  console.log('🌿 切换到gh-pages分支...');
  try {
    execSync('git checkout gh-pages', { stdio: 'ignore' });
    console.log('✅ 已切换到gh-pages分支');
  } catch {
    console.log('🆕 创建新的gh-pages分支...');
    execSync('git checkout --orphan gh-pages', { stdio: 'ignore' });
    execSync('git rm -rf .', { stdio: 'ignore' });
  }

  // 8. 清空当前目录（保留.git和关键目录）
  console.log('🧹 清空旧文件...');
  const files = fs.readdirSync('.');
  const keepFiles = ['.git', TEMP_DIR, 'node_modules', '.github', 'src', 'public', 'scripts'];
  for (const file of files) {
    if (!keepFiles.includes(file)) {
      fs.rmSync(file, { recursive: true, force: true });
    }
  }

  // 9. 复制临时目录内容到根目录
  console.log('📋 复制新文件...');
  const tempFiles = fs.readdirSync(TEMP_DIR);
  for (const file of tempFiles) {
    fs.renameSync(path.join(TEMP_DIR, file), file);
  }

  // 10. 删除临时目录
  fs.rmSync(TEMP_DIR, { recursive: true });

  // 11. 添加所有文件并提交
  console.log('💾 提交更改...');
  execSync('git add -A');
  
  try {
    execSync('git commit -m "Deploy to GitHub Pages"');
    console.log('✅ 提交成功');
  } catch {
    console.log('ℹ️  没有需要提交的更改');
  }

  // 12. 推送到远程
  console.log('📤 推送到GitHub...');
  execSync('git push origin gh-pages --force');
  console.log('✅ 推送成功！');

  // 13. 切回原分支
  console.log(`🔙 切回${currentBranch}分支...`);
  execSync(`git checkout ${currentBranch}`);

  console.log('\n🎉 部署完成！');
  console.log('🌐 网站地址: https://sanhang-source.github.io/data-asset-platform/');
  console.log('\n⏳ 请等待1-2分钟让GitHub Pages生效...');

} catch (error) {
  console.error('\n❌ 部署失败:', error.message);
  
  // 清理临时目录
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
  
  // 尝试切回原分支
  try {
    execSync('git checkout main', { stdio: 'ignore' });
  } catch {}
  
  process.exit(1);
}

// 辅助函数：复制目录
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}