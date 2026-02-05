/**
 * 数据血缘模块类型定义
 */

// 源数据表（从外部系统同步）
export interface SourceTable {
  id: string
  tableName: string
  tableComment: string
  databaseName: string
  sourceSystem: string
  sourceOrgId: string  // 数据来源机构ID
  updateFrequency: string  // 数据更新频率
}

// 数据资产（产品表/接口）
export interface DataAsset {
  id: string
  assetId: string
  assetName: string
  assetNameEn: string  // 英文名
  assetCategory: string
  assetForm: '产品表' | '接口'
  sourceTable: string
  sourceTableComment: string  // 源表中文名
  status: string
  creator: string
  department: string
  createTime: string
  updateCycle: string
  businessDescription: string
}

// 产品服务（从外部系统同步）
export interface ProductService {
  id: string
  serviceId: string
  serviceName: string
  serviceType: string
  description: string
  status: string
  createTime: string
}

// 客户（从外部系统同步）
export interface Customer {
  id: string
  customerName: string
  customerFullName: string  // 机构全名
  customerType: '金融机构' | '政府机构' | '企业'
  contactPerson: string
  contactPhone: string
  status: string
}

// 资产与服务关联关系（需要人工维护）
export interface AssetServiceRelation {
  id: string
  assetId: string
  serviceId: string
  createTime: string
  creator: string
}

// 血缘图谱节点类型
export type LineageNodeType = 'source' | 'asset' | 'service' | 'customer'

// 血缘图谱节点
export interface LineageNode {
  id: string
  type: LineageNodeType
  label: string
  data?: SourceTable | DataAsset | ProductService | Customer
}

// 血缘图谱边
export interface LineageEdge {
  source: string
  target: string
}

// 完整血缘数据
export interface LineageData {
  nodes: LineageNode[]
  edges: LineageEdge[]
}

// 资产关联的服务（用于详情页展示）
export interface AssetRelatedService extends ProductService {
  relationId: string
  relationCreateTime: string
}
