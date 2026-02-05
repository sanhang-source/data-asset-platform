# 数据资产管理平台

基于 React + TypeScript + Ant Design 的数据资产管理平台前端项目。

## 项目结构

```
data-asset-platform/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 公共组件
│   │   └── Layout/         # 布局组件
│   ├── pages/              # 页面组件
│   │   ├── data-access/    # 数据接入模块
│   │   ├── data-resource/  # 数据资源模块
│   │   ├── data-classification/  # 数据分级分类模块
│   │   ├── system/         # 系统管理模块
│   │   └── Login/          # 登录页
│   ├── App.tsx             # 路由配置
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局样式
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 功能模块

### 1. 数据接入模块 (data-access)
- 数据接入机构管理（列表、新增、编辑、查看）
- 数源机构合同管理（列表、新增、编辑、查看）
- 数据接入计费管理（结算、结算统计）
- 数据接入账单管理（列表、明细）

### 2. 数据资源模块 (data-resource)
- 数据资源查询（数据库表、数据接口、数据文档）
- 数据库表管理（列表、新增、编辑、字段管理）
- 数据接口管理（列表、新增、编辑、查看）

### 3. 数据分级分类模块 (data-classification)
- 数据分级分类管理（列表、新增、编辑）

### 4. 系统管理模块 (system)
- 用户管理（列表、新增、编辑、删除、重置密码）
- 角色管理（列表、新增、编辑、删除、权限配置）
- 字典管理（列表、新增、编辑、删除、字典项管理）

## 技术栈

- **框架**: React 18
- **语言**: TypeScript
- **UI组件库**: Ant Design 5.x
- **路由**: React Router 6
- **构建工具**: Vite
- **日期处理**: Day.js

## 安装和运行

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 页面清单

### 数据接入模块 (10个页面)
1. OrganizationList - 机构列表
2. OrganizationAdd - 机构新增
3. OrganizationEdit - 机构编辑
4. OrganizationDetail - 机构详情
5. ContractList - 合同列表
6. ContractAdd - 合同新增
7. ContractEdit - 合同编辑
8. ContractDetail - 合同详情
9. Settlement - 结算
10. SettlementStats - 结算统计
11. BillList - 账单列表
12. BillDetail - 账单详情

### 数据资源模块 (9个页面)
1. DataResourceQuery - 数据资源查询
2. DatabaseTableList - 数据库表列表
3. DatabaseTableAdd - 数据库表新增
4. DatabaseTableEdit - 数据库表编辑
5. FieldManagement - 字段管理
6. InterfaceList - 接口列表
7. InterfaceAdd - 接口新增
8. InterfaceEdit - 接口编辑
9. InterfaceDetail - 接口详情

### 数据分级分类模块 (3个页面)
1. ClassificationList - 分类列表
2. ClassificationAdd - 分类新增
3. ClassificationEdit - 分类编辑

### 系统管理模块 (4个页面)
1. UserList - 用户列表
2. RoleList - 角色列表
3. DictList - 字典列表
4. DictItemList - 字典项列表

### 其他页面
1. Login - 登录页
2. Layout - 布局组件

## 路由配置

所有页面路由已在 `src/App.tsx` 中配置完成，支持以下特性：
- 嵌套路由
- 动态路由参数（如 `:id`）
- 默认重定向

## 开发说明

1. 所有页面组件使用函数式组件和 React Hooks
2. 表单使用 Ant Design 的 Form 组件，支持验证
3. 表格支持分页、排序、筛选
4. 使用 dayjs 处理日期
5. 模拟数据用于演示

## 注意事项

1. 当前使用模拟数据，实际项目中需要替换为真实 API
2. 部分功能（如请求参数配置、响应参数配置）标记为"开发中"
3. 文件上传功能需要后端支持
