import { useState, useMemo } from 'react'
import { Card, Table, Tag, Row, Col, Button, Space, Form, Input, Select, Statistic, Empty, Modal, Typography, Input as AntInput } from 'antd'
import { ReloadOutlined, SearchOutlined, ApiOutlined, DatabaseOutlined, LineChartOutlined, BellOutlined, DownOutlined, UpOutlined, ExportOutlined } from '@ant-design/icons'

const { Text } = Typography

// 告警来源类型
type AlertSource = 'interface' | 'table' | 'indicator'

// 影响产品信息
interface ImpactProduct {
  productId: string
  productName: string
  customerName: string
}

// 数源机构信息
interface SourceOrg {
  orgId: string
  orgName: string
  orgShortName: string
  creditCode: string
  orgType: string
  contactName: string
  contactPhone: string
  contactEmail: string
  region: string
  detailAddress: string
  accessDate: string
  cooperationStatus: string
  remark: string
  managerName: string
  managerPhone: string
}

// 告警信息接口
interface AlertMessage {
  id: string
  source: AlertSource
  sourceName: string
  objectId: string
  objectName: string
  sourceOrgId: string // 数源机构ID
  impactProducts: ImpactProduct[] // 影响产品列表
  alertType: string
  alertTime: string
  message: string
  createTime: string // 用于90天过滤
  value: number // 当前值
  threshold: number // 阈值
  status: 'pending' | 'processed'
  processTime?: string
  processRemark?: string
}

const AlertMessageCenter = () => {
  // Mock数据 - 整合三个来源的告警数据
  const [alertData, setAlertData] = useState<AlertMessage[]>([
    // 接口质量告警 - 来自InterfaceQuality.tsx
    { 
      id: '1', source: 'interface', sourceName: '接口质量监控', objectId: 'API003', objectName: '社保信息查询', 
      sourceOrgId: 'DS-00003', 
      impactProducts: [
        { productId: 'PRD003', productName: '社保信息查询服务', customerName: '中国工商银行股份有限公司深圳分行' },
      ],
      alertType: '查得率过低', alertTime: '2024-02-01 14:32:15', message: '查得率85.2%', createTime: '2024-02-01',
      value: 85.2, threshold: 95, status: 'pending'
    },
    { 
      id: '2', source: 'interface', sourceName: '接口质量监控', objectId: 'API003', objectName: '社保信息查询', 
      sourceOrgId: 'DS-00003',
      impactProducts: [
        { productId: 'PRD003', productName: '社保信息查询服务', customerName: '中国工商银行股份有限公司深圳分行' },
      ],
      alertType: '响应超时', alertTime: '2024-02-01 14:31:20', message: '平均响应820ms', createTime: '2024-02-01',
      value: 820, threshold: 500, status: 'pending'
    },
    { 
      id: '3', source: 'interface', sourceName: '接口质量监控', objectId: 'API003', objectName: '社保信息查询', 
      sourceOrgId: 'DS-00003',
      impactProducts: [
        { productId: 'PRD003', productName: '社保信息查询服务', customerName: '中国建设银行股份有限公司' },
      ],
      alertType: '报错率过高', alertTime: '2024-02-01 14:30:45', message: '报错率1.68%', createTime: '2024-02-01',
      value: 1.68, threshold: 1, status: 'pending'
    },
    { 
      id: '4', source: 'interface', sourceName: '接口质量监控', objectId: 'API002', objectName: '行政处罚查询', 
      sourceOrgId: 'DS-00002',
      impactProducts: [
        { productId: 'PRD004', productName: '行政处罚查询服务', customerName: '中国建设银行股份有限公司' },
        { productId: 'PRD005', productName: '企业信用报告服务', customerName: '中国平安银行股份有限公司' },
      ],
      alertType: '响应超时', alertTime: '2024-02-01 14:28:10', message: '平均响应650ms', createTime: '2024-02-01',
      value: 650, threshold: 500, status: 'pending'
    },
    { 
      id: '5', source: 'interface', sourceName: '接口质量监控', objectId: 'API003', objectName: '社保信息查询', 
      sourceOrgId: 'DS-00003',
      impactProducts: [
        { productId: 'PRD003', productName: '社保信息查询服务', customerName: '中国工商银行股份有限公司深圳分行' },
      ],
      alertType: '查得率过低', alertTime: '2024-02-01 14:25:33', message: '查得率88.5%', createTime: '2024-02-01',
      value: 88.5, threshold: 95, status: 'processed', processTime: '2024-02-01 14:35:00', processRemark: '已联系上游系统确认数据延迟'
    },
    { 
      id: '6', source: 'interface', sourceName: '接口质量监控', objectId: 'API002', objectName: '行政处罚查询', 
      sourceOrgId: 'DS-00002',
      impactProducts: [
        { productId: 'PRD004', productName: '行政处罚查询服务', customerName: '中国建设银行股份有限公司' },
        { productId: 'PRD005', productName: '企业信用报告服务', customerName: '中国平安银行股份有限公司' },
        { productId: 'PRD006', productName: '司法诉讼查询服务', customerName: '中国民生银行股份有限公司' },
      ],
      alertType: '报错率过高', alertTime: '2024-02-01 14:22:18', message: '报错率1.12%', createTime: '2024-02-01',
      value: 1.12, threshold: 1, status: 'processed', processTime: '2024-02-01 14:30:00', processRemark: '网络抖动导致，已恢复正常'
    },
    
    // 库表更新告警 - 来自TableUpdateMonitor.tsx
    { 
      id: '7', source: 'table', sourceName: '库表质量监控', objectId: '001091', objectName: '社保缴纳信息表', 
      sourceOrgId: 'DS-00003',
      impactProducts: [
        { productId: 'PRD003', productName: '社保信息查询服务', customerName: '中国工商银行股份有限公司深圳分行' },
        { productId: 'PRD007', productName: '员工背景调查服务', customerName: '中国民生银行股份有限公司' },
      ],
      alertType: '更新延迟', alertTime: '2024-02-05 14:32:15', message: '数据更新延迟4天', createTime: '2024-02-05',
      value: 4, threshold: 1, status: 'pending'
    },
    { 
      id: '8', source: 'table', sourceName: '库表质量监控', objectId: '001090', objectName: '行政处罚记录表', 
      sourceOrgId: 'DS-00002',
      impactProducts: [
        { productId: 'PRD004', productName: '行政处罚查询服务', customerName: '中国建设银行股份有限公司' },
        { productId: 'PRD005', productName: '企业信用报告服务', customerName: '中国平安银行股份有限公司' },
      ],
      alertType: '更新延迟', alertTime: '2024-02-03 14:28:10', message: '数据更新延迟2天', createTime: '2024-02-03',
      value: 2, threshold: 1, status: 'pending'
    },
    { 
      id: '9', source: 'table', sourceName: '库表质量监控', objectId: '001091', objectName: '社保缴纳信息表', 
      sourceOrgId: 'DS-00003',
      impactProducts: [
        { productId: 'PRD003', productName: '社保信息查询服务', customerName: '中国工商银行股份有限公司深圳分行' },
      ],
      alertType: '更新延迟', alertTime: '2024-02-05 14:25:33', message: '数据更新延迟4天', createTime: '2024-02-05',
      value: 4, threshold: 1, status: 'processed', processTime: '2024-02-05 15:10:00', processRemark: '已联系上游系统确认数据延迟'
    },
    { 
      id: '10', source: 'table', sourceName: '库表质量监控', objectId: '001091', objectName: '社保缴纳信息表', 
      sourceOrgId: 'DS-00003',
      impactProducts: [
        { productId: 'PRD003', productName: '社保信息查询服务', customerName: '中国工商银行股份有限公司深圳分行' },
        { productId: 'PRD007', productName: '员工背景调查服务', customerName: '中国民生银行股份有限公司' },
      ],
      alertType: '更新延迟', alertTime: '2024-02-06 14:22:18', message: '数据更新延迟5天', createTime: '2024-02-06',
      value: 5, threshold: 1, status: 'pending'
    },
    { 
      id: '11', source: 'table', sourceName: '库表质量监控', objectId: '001090', objectName: '行政处罚记录表', 
      sourceOrgId: 'DS-00002',
      impactProducts: [
        { productId: 'PRD004', productName: '行政处罚查询服务', customerName: '中国建设银行股份有限公司' },
        { productId: 'PRD005', productName: '企业信用报告服务', customerName: '中国平安银行股份有限公司' },
      ],
      alertType: '数据波动', alertTime: '2024-02-05 16:45:22', message: '数据波动率42.8%', createTime: '2024-02-05',
      value: 42.8, threshold: 20, status: 'pending'
    },
    { 
      id: '12', source: 'table', sourceName: '库表质量监控', objectId: '001087', objectName: '企业信用评分表', 
      sourceOrgId: 'DS-00001',
      impactProducts: [
        { productId: 'PRD001', productName: '企业风控查询服务', customerName: '中国工商银行股份有限公司深圳分行' },
        { productId: 'PRD002', productName: '企业信用评估服务', customerName: '中国银行股份有限公司' },
      ],
      alertType: '数据波动', alertTime: '2024-02-05 16:30:15', message: '数据波动率25.5%', createTime: '2024-02-05',
      value: 25.5, threshold: 20, status: 'pending'
    },
    
    // 指标质量告警 - 来自IndicatorQuality.tsx
    { 
      id: '13', source: 'indicator', sourceName: '指标质量监控', objectId: 'IND003', objectName: '社保缴纳企业数', 
      sourceOrgId: 'DS-00003',
      impactProducts: [
        { productId: 'PRD003', productName: '社保信息查询服务', customerName: '中国工商银行股份有限公司深圳分行' },
      ],
      alertType: '更新延迟', alertTime: '2024-02-01 14:32:15', message: '数据更新延迟2天', createTime: '2024-02-01',
      value: 2, threshold: 1, status: 'pending'
    },
    { 
      id: '14', source: 'indicator', sourceName: '指标质量监控', objectId: 'IND002', objectName: '行政处罚记录数', 
      sourceOrgId: 'DS-00002',
      impactProducts: [
        { productId: 'PRD004', productName: '行政处罚查询服务', customerName: '中国建设银行股份有限公司' },
        { productId: 'PRD005', productName: '企业信用报告服务', customerName: '中国平安银行股份有限公司' },
      ],
      alertType: '更新延迟', alertTime: '2024-02-01 14:28:10', message: '数据更新延迟1天', createTime: '2024-02-01',
      value: 1, threshold: 1, status: 'pending'
    },
    { 
      id: '15', source: 'indicator', sourceName: '指标质量监控', objectId: 'IND003', objectName: '社保缴纳企业数', 
      sourceOrgId: 'DS-00003',
      impactProducts: [
        { productId: 'PRD003', productName: '社保信息查询服务', customerName: '中国工商银行股份有限公司深圳分行' },
      ],
      alertType: '更新延迟', alertTime: '2024-02-01 14:25:33', message: '数据更新延迟2天', createTime: '2024-02-01',
      value: 2, threshold: 1, status: 'processed', processTime: '2024-02-01 15:10:00', processRemark: '已联系上游系统确认数据延迟'
    },
    { 
      id: '16', source: 'indicator', sourceName: '指标质量监控', objectId: 'IND002', objectName: '行政处罚记录数', 
      sourceOrgId: 'DS-00002',
      impactProducts: [
        { productId: 'PRD004', productName: '行政处罚查询服务', customerName: '中国建设银行股份有限公司' },
        { productId: 'PRD005', productName: '企业信用报告服务', customerName: '中国平安银行股份有限公司' },
      ],
      alertType: '数据波动', alertTime: '2024-02-05 16:45:22', message: '数据波动率42.8%', createTime: '2024-02-05',
      value: 42.8, threshold: 20, status: 'pending'
    },
    { 
      id: '17', source: 'indicator', sourceName: '指标质量监控', objectId: 'IND001', objectName: '企业信用评分均值', 
      sourceOrgId: 'DS-00001',
      impactProducts: [
        { productId: 'PRD001', productName: '企业风控查询服务', customerName: '中国工商银行股份有限公司深圳分行' },
        { productId: 'PRD002', productName: '企业信用评估服务', customerName: '中国银行股份有限公司' },
      ],
      alertType: '数据波动', alertTime: '2024-02-05 16:30:15', message: '数据波动率25.5%', createTime: '2024-02-05',
      value: 25.5, threshold: 20, status: 'pending'
    },
    { 
      id: '18', source: 'indicator', sourceName: '指标质量监控', objectId: 'IND002', objectName: '行政处罚记录数', 
      sourceOrgId: 'DS-00002',
      impactProducts: [
        { productId: 'PRD004', productName: '行政处罚查询服务', customerName: '中国建设银行股份有限公司' },
      ],
      alertType: '数据空值', alertTime: '2024-02-05 17:15:30', message: '数据空值率15.2%', createTime: '2024-02-05',
      value: 15.2, threshold: 10, status: 'pending'
    },
    { 
      id: '19', source: 'indicator', sourceName: '指标质量监控', objectId: 'IND005', objectName: '纳税信用A级占比', 
      sourceOrgId: 'DS-00001',
      impactProducts: [
        { productId: 'PRD008', productName: '纳税信用查询服务', customerName: '中国光大银行股份有限公司' },
      ],
      alertType: '数据空值', alertTime: '2024-02-05 17:30:45', message: '数据空值率12.3%', createTime: '2024-02-05',
      value: 12.3, threshold: 10, status: 'pending'
    },
  ])

  // 弹窗状态
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [isOrgModalVisible, setIsOrgModalVisible] = useState(false)
  const [isProductModalVisible, setIsProductModalVisible] = useState(false)
  const [isProcessModalVisible, setIsProcessModalVisible] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<SourceOrg | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<ImpactProduct[]>([])
  const [currentAlert, setCurrentAlert] = useState<AlertMessage | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [isBatchProcess, setIsBatchProcess] = useState(false)
  const [selectedAlerts, setSelectedAlerts] = useState<AlertMessage[]>([])
  const [processForm] = Form.useForm()
  const [searchExpanded, setSearchExpanded] = useState(false)

  // 筛选状态
  const [searchForm] = Form.useForm()
  const [filterSource, setFilterSource] = useState<AlertSource | ''>('')
  const [filterType, setFilterType] = useState('')
  const [filterObjectId, setFilterObjectId] = useState('')
  const [filterObjectName, setFilterObjectName] = useState('')
  const [filterStatus, setFilterStatus] = useState<'pending' | 'processed' | ''>('pending')

  // 90天过滤
  const filteredByDate = useMemo(() => {
    const now = new Date('2024-02-05') // 当前时间
    const ninetyDaysAgo = new Date(now)
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    
    return alertData.filter(alert => {
      const createDate = new Date(alert.createTime)
      return createDate >= ninetyDaysAgo
    })
  }, [alertData])

  // 筛选后的数据
  const filteredData = useMemo(() => {
    return filteredByDate.filter(alert => {
      if (filterSource && alert.source !== filterSource) return false
      if (filterType && alert.alertType !== filterType) return false
      if (filterObjectId && !alert.objectId.toLowerCase().includes(filterObjectId.toLowerCase())) return false
      if (filterObjectName && !alert.objectName.includes(filterObjectName)) return false
      if (filterStatus && alert.status !== filterStatus) return false
      return true
    })
  }, [filteredByDate, filterSource, filterType, filterObjectId, filterObjectName, filterStatus])

  // 统计卡片数据
  const statsData = [
    { 
      title: '告警总数', 
      value: filteredData.length,
      icon: <BellOutlined style={{ color: '#f5222d' }} />
    },
    { 
      title: '接口质量告警', 
      value: filteredData.filter(item => item.source === 'interface').length,
      icon: <ApiOutlined style={{ color: '#1890ff' }} />
    },
    { 
      title: '库表质量告警', 
      value: filteredData.filter(item => item.source === 'table').length,
      icon: <DatabaseOutlined style={{ color: '#52c41a' }} />
    },
    { 
      title: '指标质量告警', 
      value: filteredData.filter(item => item.source === 'indicator').length,
      icon: <LineChartOutlined style={{ color: '#faad14' }} />
    },
  ]

  // 点击查看数源机构详情
  const handleViewSourceOrg = (orgId: string) => {
    const mockOrgData: Record<string, SourceOrg> = {
      'DS-00001': {
        orgId: 'DS-00001',
        orgName: '上海生腾数据科技有限公司',
        orgShortName: '生腾数据',
        creditCode: '91310106MA1FY86D4M',
        orgType: '商业数据',
        contactName: '张三',
        contactPhone: '13800138001',
        contactEmail: 'zhangsan@shengteng.com',
        region: '上海市/上海市/浦东新区',
        detailAddress: '张江高科技园区',
        accessDate: '2024-01-01',
        cooperationStatus: '合作中',
        remark: '主要提供企业信用数据服务',
        managerName: '赵六',
        managerPhone: '15158136666',
      },
      'DS-00002': {
        orgId: 'DS-00002',
        orgName: '深圳市市场监督管理局',
        orgShortName: '深圳市监局',
        creditCode: '11440300MB2C92051N',
        orgType: '政府机构',
        contactName: '李四',
        contactPhone: '13800138002',
        contactEmail: 'lisi@szamr.gov.cn',
        region: '广东省/深圳市/福田区',
        detailAddress: '福田区深南大道7010号',
        accessDate: '2023-06-01',
        cooperationStatus: '合作中',
        remark: '提供行政处罚、工商注册等政务数据',
        managerName: '钱七',
        managerPhone: '15158137777',
      },
      'DS-00003': {
        orgId: 'DS-00003',
        orgName: '深圳市人力资源和社会保障局',
        orgShortName: '深圳人社局',
        creditCode: '11440300695559836P',
        orgType: '政府机构',
        contactName: '王五',
        contactPhone: '13800138003',
        contactEmail: 'wangwu@szhrss.gov.cn',
        region: '广东省/深圳市/福田区',
        detailAddress: '福田区深南大道8005号',
        accessDate: '2023-08-15',
        cooperationStatus: '合作中',
        remark: '提供社保缴纳相关数据',
        managerName: '孙八',
        managerPhone: '15158138888',
      },
    }
    setSelectedOrg(mockOrgData[orgId] || null)
    setIsOrgModalVisible(true)
  }

  // 点击查看影响产品列表
  const handleViewImpactProducts = (products: ImpactProduct[]) => {
    setSelectedProducts(products)
    setIsProductModalVisible(true)
  }

  // 打开处理告警弹窗（单条）
  const handleProcessAlert = (record: AlertMessage) => {
    setCurrentAlert(record)
    setSelectedAlerts([])
    setIsBatchProcess(false)
    processForm.setFieldsValue({
      remark: ''
    })
    setIsProcessModalVisible(true)
  }

  // 打开批量处理弹窗
  const handleBatchProcess = () => {
    if (selectedRowKeys.length === 0) {
      return
    }
    const selected = alertData.filter(alert => selectedRowKeys.includes(alert.id))
    setSelectedAlerts(selected)
    setCurrentAlert(null)
    setIsBatchProcess(true)
    processForm.setFieldsValue({
      remark: ''
    })
    setIsProcessModalVisible(true)
  }

  // 提交告警处理
  const handleProcessSubmit = () => {
    processForm.validateFields().then(values => {
      const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      
      if (isBatchProcess && selectedAlerts.length > 0) {
        // 批量处理
        setAlertData(alertData.map(alert => {
          if (selectedAlerts.some(sel => sel.id === alert.id)) {
            return {
              ...alert,
              status: 'processed',
              processTime: now,
              processRemark: values.remark
            }
          }
          return alert
        }))
        setSelectedRowKeys([])
      } else if (currentAlert) {
        // 单条处理
        setAlertData(alertData.map(alert =>
          alert.id === currentAlert.id
            ? {
                ...alert,
                status: 'processed',
                processTime: now,
                processRemark: values.remark
              }
            : alert
        ))
      }
      setIsProcessModalVisible(false)
    })
  }

  // 表格列定义
  const columns = [
    {
      title: '告警来源',
      dataIndex: 'sourceName',
      width: 130,
      render: (text: string, record: AlertMessage) => {
        const colorMap: Record<AlertSource, string> = {
          'interface': 'blue',
          'table': 'green',
          'indicator': 'orange'
        }
        return <Tag color={colorMap[record.source]}>{text}</Tag>
      }
    },
    { title: '告警时间', dataIndex: 'alertTime', width: 160 },
    { title: '告警对象ID', dataIndex: 'objectId', width: 120 },
    { title: '告警对象名称', dataIndex: 'objectName', width: 160, ellipsis: true },
    { 
      title: '数源机构ID', 
      dataIndex: 'sourceOrgId', 
      width: 130,
      render: (text: string) => (
        <Button type="link" size="small" onClick={() => handleViewSourceOrg(text)} style={{ padding: 0, textAlign: 'left' }}>
          BM00001-068
        </Button>
      )
    },
    { 
      title: '影响产品ID', 
      key: 'impactProducts',
      width: 180,
      render: (_: any, record: AlertMessage) => {
        const formatProductId = (id: string) => {
          const num = id.replace(/\D/g, '')
          return `CR${num.padStart(4, '0')}`
        }
        return (
          <Button 
            type="link" 
            size="small" 
            onClick={() => handleViewImpactProducts(record.impactProducts)}
            style={{ padding: 0, whiteSpace: 'normal', textAlign: 'left', lineHeight: '1.5' }}
          >
            {record.impactProducts.map(p => formatProductId(p.productId)).join(', ')}
          </Button>
        )
      }
    },
    { title: '告警类型', dataIndex: 'alertType', width: 100, render: (text: string) => <Tag color="error">{text}</Tag> },
    { title: '告警详情', dataIndex: 'message', width: 180, ellipsis: true },
    { title: '当前值', key: 'value', width: 90, align: 'center' as const, render: (_: any, record: AlertMessage) => (
      <Text type="danger" strong>
        {record.source === 'table' || record.source === 'indicator' 
          ? (record.alertType === '更新延迟' ? `${record.value}天` : `${record.value}%`)
          : `${record.value}${record.alertType === '响应超时' ? 'ms' : '%'}`}
      </Text>
    )},
    { title: '阈值', key: 'threshold', width: 90, align: 'center' as const, render: (_: any, record: AlertMessage) => (
      <Text type="secondary">
        {record.source === 'table' || record.source === 'indicator' 
          ? (record.alertType === '更新延迟' ? `${record.threshold}天` : `${record.threshold}%`)
          : `${record.threshold}${record.alertType === '响应超时' ? 'ms' : '%'}`}
      </Text>
    )},
    { title: '处理状态', dataIndex: 'status', width: 90, align: 'center' as const, render: (status: string) => (
      status === 'pending' ? (
        <Tag color="warning">待处理</Tag>
      ) : (
        <Tag color="success">已处理</Tag>
      )
    )},
    { title: '处理时间', dataIndex: 'processTime', width: 160, render: (text: string) => text || '-' },
    { title: '处理备注', dataIndex: 'processRemark', width: 160, ellipsis: true, render: (text: string) => text || '-' },
    { title: '操作', key: 'action', width: 80, fixed: 'right' as const, render: (_: any, record: AlertMessage) => (
      <Button 
        type="link" 
        size="small" 
        disabled={record.status === 'processed'}
        onClick={() => handleProcessAlert(record)}
      >
        处理
      </Button>
    )},
  ]

  // 告警类型选项
  const alertTypeOptions = [
    { label: '查得率过低', value: '查得率过低' },
    { label: '响应超时', value: '响应超时' },
    { label: '报错率过高', value: '报错率过高' },
    { label: '更新延迟', value: '更新延迟' },
    { label: '数据波动', value: '数据波动' },
    { label: '数据空值', value: '数据空值' },
  ]

  // 处理查询
  const handleSearch = () => {
    const values = searchForm.getFieldsValue()
    setFilterSource(values.source || '')
    setFilterType(values.alertType || '')
    setFilterObjectId(values.objectId || '')
    setFilterObjectName(values.objectName || '')
    setFilterStatus(values.status || '')
  }

  // 处理重置
  const handleReset = () => {
    searchForm.resetFields()
    setFilterSource('')
    setFilterType('')
    setFilterObjectId('')
    setFilterObjectName('')
    setFilterStatus('pending')
  }

  return (
    <div className="alert-message-center">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {statsData.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic 
                title={stat.title} 
                value={stat.value} 
                prefix={stat.icon}
                valueStyle={{ fontSize: 24, fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 查询栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} initialValues={{ status: 'pending' }}>
          <Row gutter={24} align="middle">
            <Col span={8}>
              <Form.Item name="source" label="告警来源" style={{ marginBottom: 0 }}>
                <Select placeholder="请选择告警来源" allowClear>
                  <Select.Option value="interface">接口质量监控</Select.Option>
                  <Select.Option value="table">库表质量监控</Select.Option>
                  <Select.Option value="indicator">指标质量监控</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="alertType" label="告警类型" style={{ marginBottom: 0 }}>
                <Select placeholder="请选择告警类型" allowClear options={alertTypeOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="objectId" label="告警对象ID" style={{ marginBottom: 0 }}>
                <Input placeholder="请输入对象ID" allowClear />
              </Form.Item>
            </Col>
          </Row>

          {searchExpanded && (
            <Row gutter={24} align="middle" style={{ marginTop: 16 }}>
              <Col span={8}>
                <Form.Item name="objectName" label="告警对象名称" style={{ marginBottom: 0 }}>
                  <Input placeholder="请输入对象名称" allowClear />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="status" label="处理状态" style={{ marginBottom: 0 }}>
                  <Select placeholder="请选择处理状态" allowClear>
                    <Select.Option value="pending">待处理</Select.Option>
                    <Select.Option value="processed">已处理</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={24} align="middle" style={{ marginTop: 16 }}>
            <Col span={24} style={{ textAlign: 'right', paddingRight: 8 }}>
              <Space>
                <Button type="link" onClick={() => setSearchExpanded(!searchExpanded)}>
                  {searchExpanded ? <><UpOutlined /> 收起</> : <><DownOutlined /> 展开</>}
                </Button>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  查询
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
                </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 告警列表 */}
      <Card 
        title="告警消息中心"
        extra={
          <Space>
            <Button icon={<ExportOutlined />} onClick={() => {}}>导出</Button>
            <Button type="primary" onClick={handleBatchProcess} disabled={selectedRowKeys.length === 0}>
              批量处理 ({selectedRowKeys.length})
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1600 }}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys,
            onChange: (keys) => {
              setSelectedRowKeys(keys)
            },
            getCheckboxProps: (record: AlertMessage) => ({
              disabled: record.status === 'processed',
            }),
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条（仅显示近90天数据）`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize: pageSize || 10 })
          }}
          locale={{ emptyText: <Empty description="暂无告警消息" /> }}
        />
      </Card>

      {/* 数源机构弹窗 */}
      <Modal
        title="数源机构"
        open={isOrgModalVisible}
        onCancel={() => setIsOrgModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsOrgModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={500}
      >
        {selectedOrg && (
          <div>
            <p><strong>数源机构ID：</strong>BM00001-068</p>
            <p><strong>数源机构名称：</strong>{selectedOrg.orgName}</p>
          </div>
        )}
      </Modal>

      {/* 产品列表弹窗 */}
      <Modal
        title="产品列表"
        open={isProductModalVisible}
        onCancel={() => setIsProductModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsProductModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={900}
      >
        <Table
          columns={[
            { title: '产品ID', dataIndex: 'productId', width: 100, render: (text: string) => {
              const num = text.replace(/\D/g, '')
              return `CR${num.padStart(4, '0')}`
            }},
            { title: '产品名称', dataIndex: 'productName', width: 220, ellipsis: true },
            { 
              title: '服务客户', 
              dataIndex: 'customerNames', 
              width: 500,
              render: (customers: string[]) => (
                <div style={{ lineHeight: '1.8' }}>
                  {customers?.map((name, idx) => (
                    <Tag key={idx} color="blue" style={{ marginBottom: 4, marginRight: 8 }}>{name}</Tag>
                  ))}
                </div>
              )
            },
          ]}
          dataSource={selectedProducts.map(p => ({ ...p, customerNames: [p.customerName] }))}
          rowKey="productId"
          pagination={false}
          size="small"
          bordered
        />
      </Modal>

      {/* 告警处理弹窗 */}
      <Modal
        title={isBatchProcess ? `批量处理告警 (${selectedAlerts.length}条)` : '处理告警消息'}
        open={isProcessModalVisible}
        onOk={handleProcessSubmit}
        onCancel={() => setIsProcessModalVisible(false)}
        okText="确认处理"
        cancelText="取消"
        width={500}
      >
        <Form form={processForm} layout="vertical">
          <Form.Item
            name="remark"
            label="处理备注"
          >
            <AntInput.TextArea 
              rows={4} 
              placeholder="请输入处理备注（选填），如：已联系上游系统、已修复、监控阈值调整等"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AlertMessageCenter
