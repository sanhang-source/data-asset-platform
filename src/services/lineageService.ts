/**
 * 数据血缘服务 - Mock数据
 * 模拟从其他系统同步的数据和关联关系维护
 */
import type {
  SourceTable,
  DataAsset,
  ProductService,
  Customer,
  AssetServiceRelation,
  LineageData,
  AssetRelatedService,
} from '../types/lineage'

// ==================== Mock 数据 ====================

// 源数据表（模拟从外部系统同步）
const mockSourceTables: SourceTable[] = [
  { id: 'src-1', tableName: 'T_ENTERPRISE_BASE', tableComment: '企业基础信息表', databaseName: 'DB_ENTERPRISE', sourceSystem: '工商系统', sourceOrgId: 'ORG_GSJ_001', updateFrequency: '每日更新' },
  { id: 'src-2', tableName: 'T_TAX_RECORD', tableComment: '企业纳税记录表', databaseName: 'DB_TAX', sourceSystem: '税务系统', sourceOrgId: 'ORG_SWJ_001', updateFrequency: '每月更新' },
  { id: 'src-3', tableName: 'T_PENALTY_INFO', tableComment: '行政处罚信息表', databaseName: 'DB_PENALTY', sourceSystem: '处罚系统', sourceOrgId: 'ORG_XZCF_001', updateFrequency: '实时更新' },
  { id: 'src-4', tableName: 'T_CREDIT_RECORD', tableComment: '企业信用记录表', databaseName: 'DB_CREDIT', sourceSystem: '征信系统', sourceOrgId: 'ORG_ZXJ_001', updateFrequency: '每日更新' },
  { id: 'src-5', tableName: 'T_LEGAL_CASE', tableComment: '法律诉讼信息表', databaseName: 'DB_LEGAL', sourceSystem: '法院系统', sourceOrgId: 'ORG_FY_001', updateFrequency: '每周更新' },
  { id: 'src-6', tableName: 'T_FINANCIAL_DATA', tableComment: '企业财务数据表', databaseName: 'DB_FINANCE', sourceSystem: '财务系统', sourceOrgId: 'ORG_CW_001', updateFrequency: '每月更新' },
]

// 数据资产
const mockAssets: DataAsset[] = [
  { id: 'asset-1', assetId: 'AST001', assetName: '企业信用评分数据集', assetNameEn: 'Enterprise Credit Score Dataset', assetCategory: '信用评价', assetForm: '产品表', sourceTable: 'T_CREDIT_SCORE', sourceTableComment: '企业信用评分源表', status: '已发布', creator: '张三', department: '数据治理部', createTime: '2024-01-15', updateCycle: '每日更新', businessDescription: '基于企业多维度数据计算得出的信用评分' },
  { id: 'asset-2', assetId: 'AST002', assetName: '行政处罚记录API', assetNameEn: 'Administrative Penalty API', assetCategory: '合规风控', assetForm: '接口', sourceTable: 'T_PENALTY_API', sourceTableComment: '行政处罚信息源表', status: '已发布', creator: '李四', department: '数据产品部', createTime: '2024-02-10', updateCycle: '实时更新', businessDescription: '提供企业行政处罚记录查询接口' },
  { id: 'asset-3', assetId: 'AST003', assetName: '工商注册信息报表', assetNameEn: 'Business Registration Report', assetCategory: '企业信息', assetForm: '产品表', sourceTable: 'T_REGISTRATION', sourceTableComment: '工商注册信息源表', status: '已发布', creator: '王五', department: '数据治理部', createTime: '2024-01-20', updateCycle: '每周更新', businessDescription: '企业工商注册信息汇总报表' },
  { id: 'asset-4', assetId: 'AST004', assetName: '法律诉讼风险数据集', assetNameEn: 'Legal Litigation Risk Dataset', assetCategory: '风险预警', assetForm: '产品表', sourceTable: 'T_LEGAL_RISK', sourceTableComment: '法律诉讼信息源表', status: '已发布', creator: '赵六', department: '风险数据部', createTime: '2024-03-05', updateCycle: '每日更新', businessDescription: '企业法律诉讼风险评估数据' },
  { id: 'asset-5', assetId: 'AST005', assetName: '财务健康度接口', assetNameEn: 'Financial Health API', assetCategory: '财务分析', assetForm: '接口', sourceTable: 'T_FINANCIAL_API', sourceTableComment: '企业财务数据源表', status: '已发布', creator: '钱七', department: '数据产品部', createTime: '2024-02-28', updateCycle: '每月更新', businessDescription: '企业财务健康度评估接口' },
]

// 产品服务（模拟从外部系统同步）
const mockServices: ProductService[] = [
  { id: 'service-1', serviceId: 'SVC001', serviceName: '企业风控查询服务', serviceType: '风控服务', description: '提供企业多维度风控评分', status: '运行中', createTime: '2024-01-10' },
  { id: 'service-2', serviceId: 'SVC002', serviceName: '普惠金融信用核验', serviceType: '信用服务', description: '用于小微企业贷款审批', status: '运行中', createTime: '2024-01-15' },
  { id: 'service-3', serviceId: 'SVC003', serviceName: '政务数据开放接口', serviceType: '数据开放', description: '对政府部门开放的数据接口', status: '运行中', createTime: '2024-02-01' },
  { id: 'service-4', serviceId: 'SVC004', serviceName: '企业背景调查API', serviceType: '背景调查', description: '查询企业工商、诉讼等背景', status: '运行中', createTime: '2024-02-20' },
  { id: 'service-5', serviceId: 'SVC005', serviceName: '供应链金融风控', serviceType: '风控服务', description: '供应链金融风控评估', status: '运行中', createTime: '2024-03-01' },
  { id: 'service-6', serviceId: 'SVC006', serviceName: '企业信用报告服务', serviceType: '报告服务', description: '生成企业信用评估报告', status: '运行中', createTime: '2024-03-10' },
]

// 客户（模拟从外部系统同步）
const mockCustomers: Customer[] = [
  { id: 'cust-1', customerName: '工商银行', customerFullName: '中国工商银行股份有限公司', customerType: '金融机构', contactPerson: '张经理', contactPhone: '13800138001', status: '合作中' },
  { id: 'cust-2', customerName: '建设银行', customerFullName: '中国建设银行股份有限公司', customerType: '金融机构', contactPerson: '李经理', contactPhone: '13800138002', status: '合作中' },
  { id: 'cust-3', customerName: '某市大数据局', customerFullName: '某某市大数据发展管理局', customerType: '政府机构', contactPerson: '王处长', contactPhone: '13800138003', status: '合作中' },
  { id: 'cust-4', customerName: '招商银行', customerFullName: '招商银行股份有限公司', customerType: '金融机构', contactPerson: '赵经理', contactPhone: '13800138004', status: '合作中' },
  { id: 'cust-5', customerName: '某省金融办', customerFullName: '某某省地方金融监督管理局', customerType: '政府机构', contactPerson: '孙主任', contactPhone: '13800138005', status: '合作中' },
  { id: 'cust-6', customerName: '平安银行', customerFullName: '平安银行股份有限公司', customerType: '金融机构', contactPerson: '周经理', contactPhone: '13800138006', status: '合作中' },
]

// 资产与服务关联关系（需要人工维护）
let mockAssetServiceRelations: AssetServiceRelation[] = [
  { id: 'rel-1', assetId: 'asset-1', serviceId: 'service-1', createTime: '2024-01-20', creator: '管理员' },
  { id: 'rel-2', assetId: 'asset-1', serviceId: 'service-2', createTime: '2024-01-22', creator: '管理员' },
  { id: 'rel-3', assetId: 'asset-1', serviceId: 'service-6', createTime: '2024-03-15', creator: '管理员' },
  { id: 'rel-4', assetId: 'asset-2', serviceId: 'service-1', createTime: '2024-02-15', creator: '管理员' },
  { id: 'rel-5', assetId: 'asset-2', serviceId: 'service-4', createTime: '2024-02-18', creator: '管理员' },
  { id: 'rel-6', assetId: 'asset-3', serviceId: 'service-3', createTime: '2024-01-25', creator: '管理员' },
  { id: 'rel-7', assetId: 'asset-3', serviceId: 'service-4', createTime: '2024-02-22', creator: '管理员' },
  { id: 'rel-8', assetId: 'asset-4', serviceId: 'service-4', createTime: '2024-03-10', creator: '管理员' },
  { id: 'rel-9', assetId: 'asset-4', serviceId: 'service-6', createTime: '2024-03-12', creator: '管理员' },
  { id: 'rel-10', assetId: 'asset-5', serviceId: 'service-5', createTime: '2024-03-20', creator: '管理员' },
]

// 服务与客户关联关系（系统已维护）
const mockServiceCustomerRelations = [
  { serviceId: 'service-1', customerId: 'cust-1' },
  { serviceId: 'service-1', customerId: 'cust-2' },
  { serviceId: 'service-1', customerId: 'cust-4' },
  { serviceId: 'service-2', customerId: 'cust-2' },
  { serviceId: 'service-2', customerId: 'cust-6' },
  { serviceId: 'service-3', customerId: 'cust-3' },
  { serviceId: 'service-3', customerId: 'cust-5' },
  { serviceId: 'service-4', customerId: 'cust-1' },
  { serviceId: 'service-4', customerId: 'cust-4' },
  { serviceId: 'service-5', customerId: 'cust-2' },
  { serviceId: 'service-5', customerId: 'cust-6' },
  { serviceId: 'service-6', customerId: 'cust-1' },
  { serviceId: 'service-6', customerId: 'cust-4' },
]

// 源数据表与资产关联关系（系统已维护）
const mockSourceAssetRelations = [
  { sourceId: 'src-1', assetId: 'asset-1' },
  { sourceId: 'src-2', assetId: 'asset-1' },
  { sourceId: 'src-3', assetId: 'asset-2' },
  { sourceId: 'src-1', assetId: 'asset-3' },
  { sourceId: 'src-5', assetId: 'asset-4' },
  { sourceId: 'src-4', assetId: 'asset-1' },
  { sourceId: 'src-6', assetId: 'asset-5' },
]

// ==================== 服务方法 ====================

/**
 * 获取所有产品服务列表
 */
export const getAllServices = async (): Promise<ProductService[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockServices]), 300)
  })
}

/**
 * 获取资产关联的服务列表
 */
export const getAssetRelatedServices = async (assetId: string): Promise<AssetRelatedService[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const relations = mockAssetServiceRelations.filter(r => r.assetId === assetId)
      const relatedServices: AssetRelatedService[] = relations.map(relation => {
        const service = mockServices.find(s => s.id === relation.serviceId)!
        return {
          ...service,
          relationId: relation.id,
          relationCreateTime: relation.createTime,
        }
      })
      resolve(relatedServices)
    }, 300)
  })
}

/**
 * 保存资产与服务的关联关系（全量替换）
 */
export const saveAssetServiceRelations = async (
  assetId: string,
  serviceIds: string[],
  creator: string = '当前用户'
): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 删除该资产原有的所有关联
      mockAssetServiceRelations = mockAssetServiceRelations.filter(r => r.assetId !== assetId)
      
      // 创建新的关联
      const newRelations: AssetServiceRelation[] = serviceIds.map((serviceId, index) => ({
        id: `rel-${Date.now()}-${index}`,
        assetId,
        serviceId,
        createTime: new Date().toISOString().split('T')[0],
        creator,
      }))
      
      mockAssetServiceRelations.push(...newRelations)
      resolve(true)
    }, 500)
  })
}

/**
 * 获取完整血缘数据（用于血缘地图）
 */
export const getFullLineageData = async (): Promise<LineageData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const nodes: LineageData['nodes'] = []
      const edges: LineageData['edges'] = []

      // 添加源数据表节点
      mockSourceTables.forEach(table => {
        nodes.push({
          id: table.id,
          type: 'source',
          label: `${table.tableName}\n${table.tableComment}`,
          data: table,
        })
      })

      // 添加资产节点
      mockAssets.forEach(asset => {
        nodes.push({
          id: asset.id,
          type: 'asset',
          label: `${asset.assetId}\n${asset.assetName}`,
          data: asset,
        })
      })

      // 添加服务节点
      mockServices.forEach(service => {
        nodes.push({
          id: service.id,
          type: 'service',
          label: `${service.serviceId}\n${service.serviceName}`,
          data: service,
        })
      })

      // 添加客户节点
      mockCustomers.forEach(customer => {
        nodes.push({
          id: customer.id,
          type: 'customer',
          label: customer.customerName,
          data: customer,
        })
      })

      // 添加源数据表 -> 资产边
      mockSourceAssetRelations.forEach(relation => {
        edges.push({ source: relation.sourceId, target: relation.assetId })
      })

      // 添加资产 -> 服务边
      mockAssetServiceRelations.forEach(relation => {
        edges.push({ source: relation.assetId, target: relation.serviceId })
      })

      // 添加服务 -> 客户边
      mockServiceCustomerRelations.forEach(relation => {
        edges.push({ source: relation.serviceId, target: relation.customerId })
      })

      resolve({ nodes, edges })
    }, 500)
  })
}

/**
 * 获取单个资产的血缘数据（上下游）
 */
export const getAssetLineageData = async (assetId: string): Promise<LineageData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const nodes: LineageData['nodes'] = []
      const edges: LineageData['edges'] = []

      // 当前资产
      const asset = mockAssets.find(a => a.id === assetId)
      if (!asset) {
        resolve({ nodes, edges })
        return
      }

      nodes.push({
        id: asset.id,
        type: 'asset',
        label: `${asset.assetId}\n${asset.assetName}`,
        data: asset,
      })

      // 上游源数据表
      const sourceRelations = mockSourceAssetRelations.filter(r => r.assetId === assetId)
      sourceRelations.forEach(relation => {
        const table = mockSourceTables.find(t => t.id === relation.sourceId)
        if (table) {
          nodes.push({
            id: table.id,
            type: 'source',
            label: `${table.tableName}\n${table.tableComment}`,
            data: table,
          })
          edges.push({ source: table.id, target: asset.id })
        }
      })

      // 下游服务
      const serviceRelations = mockAssetServiceRelations.filter(r => r.assetId === assetId)
      serviceRelations.forEach(relation => {
        const service = mockServices.find(s => s.id === relation.serviceId)
        if (service) {
          nodes.push({
            id: service.id,
            type: 'service',
            label: `${service.serviceId}\n${service.serviceName}`,
            data: service,
          })
          edges.push({ source: asset.id, target: service.id })

          // 客户的客户
          const customerRelations = mockServiceCustomerRelations.filter(r => r.serviceId === service.id)
          customerRelations.forEach(custRelation => {
            const customer = mockCustomers.find(c => c.id === custRelation.customerId)
            if (customer && !nodes.find(n => n.id === customer.id)) {
              nodes.push({
                id: customer.id,
                type: 'customer',
                label: customer.customerName,
                data: customer,
              })
            }
            edges.push({ source: service.id, target: custRelation.customerId })
          })
        }
      })

      resolve({ nodes, edges })
    }, 300)
  })
}

/**
 * 获取所有数据资产列表
 */
export const getAllAssets = async (): Promise<DataAsset[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockAssets]), 300)
  })
}
