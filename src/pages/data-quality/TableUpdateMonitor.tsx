import React, { useState, useMemo } from 'react'
import { Card, Table, Tag, Row, Col, Button, Space, Modal, Form, Input, InputNumber, Switch, message, DatePicker, Empty, Alert, Select, Badge, Typography } from 'antd'
import { CheckCircleOutlined, WarningOutlined, ClockCircleOutlined, ReloadOutlined, SearchOutlined, ExportOutlined, StopOutlined, SettingOutlined } from '@ant-design/icons'



interface TableMonitorItem {
  id: string
  tableName: string
  tableId: string
  tableEnglishName: string
  dataSourceId: string
  relatedProductId: string
  impactProducts?: ImpactProduct[]
  expectedUpdateTime: string
  actualUpdateTime: string
  delayDays: number  // 延迟天数
  updateStatus: 'ontime' | 'delayed'
  fluctuationRate: number
  // 数据更新预警配置
  updateAlertEnabled: boolean
  updateAlertThreshold: number  // 延迟天数阈值
  updateAlertPhones: string
  // 数据波动率预警配置
  fluctuationAlertEnabled: boolean
  fluctuationAlertThreshold: number
  fluctuationAlertPhones: string
}

// 影响产品信息
interface ImpactProduct {
  productId: string
  productName: string
  customerNames: string[]
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
interface AlertItem {
  id: string
  time: string
  tableId: string
  tableName: string
  tableEnglishName: string
  dataSourceId: string
  relatedProductId: string
  impactProducts: ImpactProduct[]
  type: 'delay' | 'fluctuation'
  typeName: string
  level: 'warning' | 'error'
  message: string
  value: number  // 当前值
  threshold: number  // 阈值
  status: 'pending' | 'processed'
  processTime?: string
  processRemark?: string
}

const TableUpdateMonitor = () => {
  const [data, setData] = useState<TableMonitorItem[]>([
    { id: '1', tableName: '企业信用评分表', tableId: '001087', tableEnglishName: 'T_CREDIT_SCORE', dataSourceId: 'DS-00001', relatedProductId: 'PRD001', impactProducts: [{ productId: 'PRD001', productName: '企业风控查询服务', customerNames: ['中国工商银行股份有限公司深圳分行', '招商银行股份有限公司'] }, { productId: 'PRD002', productName: '企业信用评估服务', customerNames: ['中国银行股份有限公司'] }], expectedUpdateTime: '2024-02-01', actualUpdateTime: '2024-02-01', delayDays: 0, updateStatus: 'ontime', fluctuationRate: 5.5, updateAlertEnabled: false, updateAlertThreshold: 1, updateAlertPhones: '', fluctuationAlertEnabled: true, fluctuationAlertThreshold: 20, fluctuationAlertPhones: '13800138001' },
    { id: '2', tableName: '行政处罚记录表', tableId: '001090', tableEnglishName: 'T_PENALTY_RECORD', dataSourceId: 'DS-00002', relatedProductId: 'PRD004', impactProducts: [{ productId: 'PRD004', productName: '行政处罚查询服务', customerNames: ['中国建设银行股份有限公司', '中国银行股份有限公司'] }, { productId: 'PRD005', productName: '企业信用报告服务', customerNames: ['中国平安银行股份有限公司'] }], expectedUpdateTime: '2024-02-01', actualUpdateTime: '2024-02-03', delayDays: 2, updateStatus: 'delayed', fluctuationRate: 42.8, updateAlertEnabled: false, updateAlertThreshold: 1, updateAlertPhones: '', fluctuationAlertEnabled: true, fluctuationAlertThreshold: 20, fluctuationAlertPhones: '13800138002' },
    { id: '3', tableName: '社保缴纳信息表', tableId: '001091', tableEnglishName: 'T_SOCIAL_SECURITY', dataSourceId: 'DS-00003', relatedProductId: 'PRD003', impactProducts: [{ productId: 'PRD003', productName: '社保信息查询服务', customerNames: ['中国工商银行股份有限公司深圳分行', '招商银行股份有限公司'] }, { productId: 'PRD007', productName: '员工背景调查服务', customerNames: ['中国民生银行股份有限公司'] }], expectedUpdateTime: '2024-02-01', actualUpdateTime: '2024-02-05', delayDays: 4, updateStatus: 'delayed', fluctuationRate: 12.3, updateAlertEnabled: false, updateAlertThreshold: 1, updateAlertPhones: '', fluctuationAlertEnabled: true, fluctuationAlertThreshold: 20, fluctuationAlertPhones: '13800138003' },
    { id: '4', tableName: '工商注册信息表', tableId: '001089', tableEnglishName: 'T_BUSINESS_REG', dataSourceId: 'DS-00001', relatedProductId: 'PRD002', impactProducts: [{ productId: 'PRD002', productName: '企业信用评估服务', customerNames: ['中国银行股份有限公司'] }, { productId: 'PRD001', productName: '企业风控查询服务', customerNames: ['中国工商银行股份有限公司深圳分行'] }], expectedUpdateTime: '2024-02-01', actualUpdateTime: '2024-02-01', delayDays: 0, updateStatus: 'ontime', fluctuationRate: 3.2, updateAlertEnabled: false, updateAlertThreshold: 1, updateAlertPhones: '', fluctuationAlertEnabled: false, fluctuationAlertThreshold: 20, fluctuationAlertPhones: '' },
    { id: '5', tableName: '纳税信用等级表', tableId: '001088', tableEnglishName: 'T_TAX_CREDIT', dataSourceId: 'DS-00001', relatedProductId: 'PRD008', impactProducts: [{ productId: 'PRD008', productName: '纳税信用查询服务', customerNames: ['中国光大银行股份有限公司'] }, { productId: 'PRD009', productName: '招投标信息查询服务', customerNames: ['中国农业银行股份有限公司'] }], expectedUpdateTime: '2024-02-01', actualUpdateTime: '2024-02-02', delayDays: 1, updateStatus: 'delayed', fluctuationRate: 8.7, updateAlertEnabled: false, updateAlertThreshold: 1, updateAlertPhones: '', fluctuationAlertEnabled: true, fluctuationAlertThreshold: 20, fluctuationAlertPhones: '13800138005' },
  ])
  // 库表监控分页状态
  const [tablePagination, setTablePagination] = useState({ current: 1, pageSize: 10 })
  
  // 告警分页状态
  const [alertPagination, setAlertPagination] = useState({ current: 1, pageSize: 5 })

  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false)
  const [isUpdateStatusConfigVisible, setIsUpdateStatusConfigVisible] = useState(false)
  const [currentTable, setCurrentTable] = useState<TableMonitorItem | null>(null)
  const { Text } = Typography

const [configForm] = Form.useForm()
  const [updateStatusConfigForm] = Form.useForm()
  
  // 数源机构弹窗状态
  const [sourceModalVisible, setSourceModalVisible] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<SourceOrg | null>(null)
  
  // 影响产品列表弹窗状态
  const [isProductModalVisible, setIsProductModalVisible] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<ImpactProduct[]>([])
  
  // 告警处理弹窗状态
  const [isProcessModalVisible, setIsProcessModalVisible] = useState(false)
  const [currentAlert, setCurrentAlert] = useState<AlertItem | null>(null)
  const [selectedAlerts, setSelectedAlerts] = useState<AlertItem[]>([])
  const [isBatchProcess, setIsBatchProcess] = useState(false)
  const [processForm] = Form.useForm()
  
  // 批量选择状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  
  // 表监控查询状态
  const [tableSearchForm] = Form.useForm()
  const [filterTableId, setFilterTableId] = useState('')
  const [filterTableName, setFilterTableName] = useState('')
  const [filterTableStatus, setFilterTableStatus] = useState<'ontime' | 'delayed' | ''>('')
  
  // 筛选后的表数据
  const filteredTableData = useMemo(() => {
    return data.filter(record => {
      if (filterTableId && !record.tableId.toLowerCase().includes(filterTableId.toLowerCase())) return false
      if (filterTableName && !record.tableName.includes(filterTableName)) return false
      if (filterTableStatus && record.updateStatus !== filterTableStatus) return false
      return true
    })
  }, [data, filterTableId, filterTableName, filterTableStatus])
  
  // 表监控查询字段
  const tableSearchFields = [
    { name: 'tableId', label: '库表ID', component: <Input placeholder="请输入库表ID" allowClear /> },
    { name: 'tableName', label: '库表中文名', component: <Input placeholder="请输入库表中文名" allowClear /> },
    { name: 'tableStatus', label: '库表状态', component: (
      <Select placeholder="请选择库表状态" allowClear>
        <Select.Option value="ontime">正常</Select.Option>
        <Select.Option value="delayed">告警</Select.Option>
      </Select>
    )},
  ]
  
  // 处理表监控查询
  const handleTableSearch = () => {
    const values = tableSearchForm.getFieldsValue()
    setFilterTableId(values.tableId || '')
    setFilterTableName(values.tableName || '')
    setFilterTableStatus(values.tableStatus || '')
    message.success('查询成功')
  }
  
  // 处理表监控重置
  const handleTableReset = () => {
    tableSearchForm.resetFields()
    setFilterTableId('')
    setFilterTableName('')
    setFilterTableStatus('')
    message.success('重置成功')
  }

  // 库表监控列表列定义
  const columns = [
    { title: '序号', key: 'index', width: 60, align: 'center' as const, render: (_: any, __: any, index: number) => index + 1 },
    { title: '库表ID', dataIndex: 'tableId', width: 100 },
    { title: '库表中文名', dataIndex: 'tableName', width: 140, ellipsis: true },
    { title: '库表英文名', dataIndex: 'tableEnglishName', width: 140, ellipsis: true },
    { 
      title: '库表状态', 
      dataIndex: 'updateStatus',
      width: 90, 
      align: 'center' as const,
      render: (status: string) => (
        <Badge 
          status={status === 'ontime' ? 'success' : 'error'} 
          text={status === 'ontime' ? '正常' : '告警'}
        />
      )
    },
    { 
      title: '数源机构ID', 
      dataIndex: 'dataSourceId', 
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
      render: (_: any, record: TableMonitorItem) => {
        const formatProductId = (id: string) => {
          const num = id.replace(/\D/g, '')
          return `CR${num.padStart(4, '0')}`
        }
        const productIds = record.impactProducts?.map(p => formatProductId(p.productId)).join(', ') || formatProductId(record.relatedProductId)
        return (
          <Button 
            type="link" 
            size="small" 
            onClick={() => handleViewImpactProducts(record.impactProducts || [{ productId: record.relatedProductId, productName: '关联产品', customerNames: ['客户A', '客户B'] }])}
            style={{ padding: 0, whiteSpace: 'normal', textAlign: 'left', lineHeight: '1.5' }}
          >
            {productIds}
          </Button>
        )
      }
    },
    { title: '预期更新时间', dataIndex: 'expectedUpdateTime', width: 140, align: 'center' as const },
    { title: '实际更新时间', dataIndex: 'actualUpdateTime', width: 140, align: 'center' as const },
    { title: '延迟更新时间', dataIndex: 'delayDays', width: 140, align: 'center' as const, render: (days: number, record: TableMonitorItem) => {
        if (!record.expectedUpdateTime || !record.actualUpdateTime) return '-'
        return `${days}天`
      } },
    {
      title: '数据更新',
      key: 'updateStatus',
      width: 130,
      align: 'center' as const,
      render: (_: any, record: TableMonitorItem) => {
        const isNormal = record.updateStatus === 'ontime'
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', padding: '0 24px 0 0' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              {record.updateAlertEnabled ? (
                <Tag color={isNormal ? 'success' : 'error'}>
                  {isNormal ? '正常' : '延迟'}
                </Tag>
              ) : (
                <span>{isNormal ? '正常' : '延迟'}</span>
              )}
            </div>
            <Button type="link" size="small" style={{ padding: 0, position: 'absolute', right: 4 }} onClick={() => handleUpdateStatusConfig(record)}>
              <SettingOutlined />
            </Button>
          </div>
        )
      }
    },
    {
      title: '数据波动',
      key: 'fluctuationRate',
      width: 150,
      align: 'center' as const,
      render: (_: any, record: TableMonitorItem) => {
        const isNormal = record.fluctuationRate <= record.fluctuationAlertThreshold
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', padding: '0 24px 0 0' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              {record.fluctuationAlertEnabled ? (
                <Tag color={isNormal ? 'success' : 'error'}>{record.fluctuationRate.toFixed(1)}%</Tag>
              ) : (
                <span>{record.fluctuationRate.toFixed(1)}%</span>
              )}
            </div>
            <Button type="link" size="small" style={{ padding: 0, position: 'absolute', right: 4 }} onClick={() => handleConfig(record)}>
              <SettingOutlined />
            </Button>
          </div>
        )
      }
    },

  ]

  const handleConfig = (record: TableMonitorItem) => {
    setCurrentTable(record)
    configForm.setFieldsValue({
      alertThreshold: record.fluctuationAlertThreshold,
      alertEnabled: record.fluctuationAlertEnabled,
      alertPhones: record.fluctuationAlertPhones
    })
    setIsConfigModalVisible(true)
  }

  const handleUpdateStatusConfig = (record: TableMonitorItem) => {
    setCurrentTable(record)
    updateStatusConfigForm.setFieldsValue({
      updateAlertEnabled: record.updateAlertEnabled,
      updateAlertThreshold: record.updateAlertThreshold,
      updateAlertPhones: record.updateAlertPhones
    })
    setIsUpdateStatusConfigVisible(true)
  }

  const handleUpdateStatusConfigSubmit = () => {
    updateStatusConfigForm.validateFields().then(values => {
      if (currentTable) {
        setData(data.map(item =>
          item.id === currentTable.id
            ? { ...item, updateAlertEnabled: values.updateAlertEnabled, updateAlertThreshold: values.updateAlertThreshold, updateAlertPhones: values.updateAlertPhones }
            : item
        ))
        message.success('数据更新预警配置保存成功')
        setIsUpdateStatusConfigVisible(false)
      }
    })
  }

  const handleConfigSubmit = () => {
    configForm.validateFields().then(values => {
      if (currentTable) {
        setData(data.map(item =>
          item.id === currentTable.id
            ? { ...item, fluctuationAlertThreshold: values.alertThreshold, fluctuationAlertEnabled: values.alertEnabled, fluctuationAlertPhones: values.alertPhones }
            : item
        ))
        message.success('预警配置保存成功')
        setIsConfigModalVisible(false)
      }
    })
  }

  // 实时告警数据（只有更新延迟类型）
  const [alertData, setAlertData] = useState<AlertItem[]>([
    { id: '1', time: '2024-02-05 14:32:15', tableId: '001091', tableName: '社保缴纳信息表', tableEnglishName: 'T_SOCIAL_SECURITY', dataSourceId: 'DS-00003', relatedProductId: 'PRD003', impactProducts: [{ productId: 'PRD003', productName: '社保信息查询服务', customerNames: ['中国工商银行股份有限公司深圳分行', '招商银行股份有限公司'] }, { productId: 'PRD007', productName: '员工背景调查服务', customerNames: ['中国民生银行股份有限公司'] }], type: 'delay', typeName: '更新延迟', level: 'error', message: '数据更新延迟4天', value: 4, threshold: 1, status: 'pending' },
    { id: '2', time: '2024-02-03 14:28:10', tableId: '001090', tableName: '行政处罚记录表', tableEnglishName: 'T_PENALTY_RECORD', dataSourceId: 'DS-00002', relatedProductId: 'PRD004', impactProducts: [{ productId: 'PRD004', productName: '行政处罚查询服务', customerNames: ['中国建设银行股份有限公司', '中国银行股份有限公司'] }, { productId: 'PRD005', productName: '企业信用报告服务', customerNames: ['中国平安银行股份有限公司'] }], type: 'delay', typeName: '更新延迟', level: 'warning', message: '数据更新延迟2天', value: 2, threshold: 1, status: 'pending' },
    { id: '3', time: '2024-02-05 14:25:33', tableId: '001091', tableName: '社保缴纳信息表', tableEnglishName: 'T_SOCIAL_SECURITY', dataSourceId: 'DS-00003', relatedProductId: 'PRD003', impactProducts: [{ productId: 'PRD003', productName: '社保信息查询服务', customerNames: ['中国工商银行股份有限公司深圳分行'] }], type: 'delay', typeName: '更新延迟', level: 'error', message: '数据更新延迟4天', value: 4, threshold: 1, status: 'processed', processTime: '2024-02-05 15:10:00', processRemark: '已联系上游系统确认数据延迟' },
    { id: '4', time: '2024-02-06 14:22:18', tableId: '001091', tableName: '社保缴纳信息表', tableEnglishName: 'T_SOCIAL_SECURITY', dataSourceId: 'DS-00003', relatedProductId: 'PRD003', impactProducts: [{ productId: 'PRD003', productName: '社保信息查询服务', customerNames: ['中国工商银行股份有限公司深圳分行', '招商银行股份有限公司', '中信银行股份有限公司'] }, { productId: 'PRD007', productName: '员工背景调查服务', customerNames: ['中国民生银行股份有限公司'] }], type: 'delay', typeName: '更新延迟', level: 'error', message: '数据更新延迟5天', value: 5, threshold: 1, status: 'pending' },
    { id: '5', time: '2024-02-02 14:20:45', tableId: '001089', tableName: '工商注册信息表', tableEnglishName: 'T_BUSINESS_REG', dataSourceId: 'DS-00001', relatedProductId: 'PRD002', impactProducts: [{ productId: 'PRD002', productName: '企业信用评估服务', customerNames: ['中国银行股份有限公司'] }, { productId: 'PRD001', productName: '企业风控查询服务', customerNames: ['中国工商银行股份有限公司深圳分行'] }], type: 'delay', typeName: '更新延迟', level: 'warning', message: '数据更新延迟1天', value: 1, threshold: 1, status: 'processed', processTime: '2024-02-02 16:00:00', processRemark: '网络抖动导致，已恢复正常' },
    { id: '6', time: '2024-02-02 14:18:30', tableId: '001088', tableName: '纳税信用等级表', tableEnglishName: 'T_TAX_CREDIT', dataSourceId: 'DS-00001', relatedProductId: 'PRD008', impactProducts: [{ productId: 'PRD008', productName: '纳税信用查询服务', customerNames: ['中国光大银行股份有限公司'] }, { productId: 'PRD009', productName: '招投标信息查询服务', customerNames: ['中国农业银行股份有限公司'] }], type: 'delay', typeName: '更新延迟', level: 'warning', message: '数据更新延迟1天', value: 1, threshold: 1, status: 'pending' },
    { id: '7', time: '2024-02-02 14:15:22', tableId: '001087', tableName: '企业信用评分表', tableEnglishName: 'T_CREDIT_SCORE', dataSourceId: 'DS-00001', relatedProductId: 'PRD001', impactProducts: [{ productId: 'PRD001', productName: '企业风控查询服务', customerNames: ['中国工商银行股份有限公司深圳分行', '招商银行股份有限公司', '中国建设银行股份有限公司'] }, { productId: 'PRD002', productName: '企业信用评估服务', customerNames: ['中国银行股份有限公司'] }], type: 'delay', typeName: '更新延迟', level: 'warning', message: '数据更新延迟1天', value: 1, threshold: 1, status: 'processed', processTime: '2024-02-02 14:50:00', processRemark: '监控阈值调整，已忽略' },
    { id: '8', time: '2024-02-03 14:12:08', tableId: '001090', tableName: '行政处罚记录表', tableEnglishName: 'T_PENALTY_RECORD', dataSourceId: 'DS-00002', relatedProductId: 'PRD004', impactProducts: [{ productId: 'PRD004', productName: '行政处罚查询服务', customerNames: ['中国建设银行股份有限公司'] }], type: 'delay', typeName: '更新延迟', level: 'warning', message: '数据更新延迟2天', value: 2, threshold: 1, status: 'pending' },
    { id: '9', time: '2024-02-05 16:45:22', tableId: '001090', tableName: '行政处罚记录表', tableEnglishName: 'T_PENALTY_RECORD', dataSourceId: 'DS-00002', relatedProductId: 'PRD004', impactProducts: [{ productId: 'PRD004', productName: '行政处罚查询服务', customerNames: ['中国建设银行股份有限公司', '中国银行股份有限公司'] }, { productId: 'PRD005', productName: '企业信用报告服务', customerNames: ['中国平安银行股份有限公司'] }], type: 'fluctuation', typeName: '数据波动', level: 'error', message: '数据波动率42.8%', value: 42.8, threshold: 20, status: 'pending' },
    { id: '10', time: '2024-02-05 16:30:15', tableId: '001087', tableName: '企业信用评分表', tableEnglishName: 'T_CREDIT_SCORE', dataSourceId: 'DS-00001', relatedProductId: 'PRD001', impactProducts: [{ productId: 'PRD001', productName: '企业风控查询服务', customerNames: ['中国工商银行股份有限公司深圳分行', '招商银行股份有限公司'] }, { productId: 'PRD002', productName: '企业信用评估服务', customerNames: ['中国银行股份有限公司'] }], type: 'fluctuation', typeName: '数据波动', level: 'warning', message: '数据波动率25.5%', value: 25.5, threshold: 20, status: 'pending' },
    { id: '11', time: '2024-02-05 16:15:08', tableId: '001088', tableName: '纳税信用等级表', tableEnglishName: 'T_TAX_CREDIT', dataSourceId: 'DS-00001', relatedProductId: 'PRD008', impactProducts: [{ productId: 'PRD008', productName: '纳税信用查询服务', customerNames: ['中国光大银行股份有限公司'] }], type: 'fluctuation', typeName: '数据波动', level: 'warning', message: '数据波动率18.2%', value: 18.2, threshold: 15, status: 'processed', processTime: '2024-02-05 16:45:00', processRemark: '数据量正常波动，已确认无异常' },
    { id: '12', time: '2024-02-05 16:00:33', tableId: '001091', tableName: '社保缴纳信息表', tableEnglishName: 'T_SOCIAL_SECURITY', dataSourceId: 'DS-00003', relatedProductId: 'PRD003', impactProducts: [{ productId: 'PRD003', productName: '社保信息查询服务', customerNames: ['中国工商银行股份有限公司深圳分行', '招商银行股份有限公司'] }], type: 'fluctuation', typeName: '数据波动', level: 'error', message: '数据波动率35.6%', value: 35.6, threshold: 20, status: 'pending' },
  ])

  // 统计卡片数据
  const statsData = [
    { title: '库表总数', value: data.length, icon: <ClockCircleOutlined />, color: '#1890ff' },
    { title: '正常库表', value: data.filter(item => item.updateStatus === 'ontime').length, icon: <CheckCircleOutlined />, color: '#52c41a' },
    { title: '告警库表', value: data.filter(item => item.updateStatus === 'delayed').length, icon: <WarningOutlined />, color: '#faad14' },
    { title: '未处理告警', value: alertData.filter(item => item.status === 'pending').length, icon: <StopOutlined />, color: '#f5222d' },
  ]

  // 告警查询状态
  const [alertSearchForm] = Form.useForm()
  const [filterAlertTableId, setFilterAlertTableId] = useState('')
  const [filterAlertTable, setFilterAlertTable] = useState('')
  const [filterAlertStatus, setFilterAlertStatus] = useState<'pending' | 'processed' | ''>('pending')

  // 筛选后的告警数据
  const filteredAlertData = useMemo(() => {
    return alertData.filter(alert => {
      if (filterAlertTableId && !alert.tableId.toLowerCase().includes(filterAlertTableId.toLowerCase())) return false
      if (filterAlertTable && !alert.tableName.includes(filterAlertTable)) return false
      if (filterAlertStatus && alert.status !== filterAlertStatus) return false
      return true
    })
  }, [alertData, filterAlertTableId, filterAlertTable, filterAlertStatus])

  // 告警表格列定义
  const alertColumns = [
    { title: '告警时间', dataIndex: 'time', width: 160 },
    { title: '库表ID', dataIndex: 'tableId', width: 100 },
    { title: '库表中文名', dataIndex: 'tableName', width: 140, ellipsis: true },
    { title: '库表英文名', dataIndex: 'tableEnglishName', width: 140, ellipsis: true },
    { 
      title: '数源机构ID', 
      dataIndex: 'dataSourceId', 
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
      render: (_: any, record: AlertItem) => {
        const formatProductId = (id: string) => {
          const num = id.replace(/\D/g, '')
          return `CR${num.padStart(4, '0')}`
        }
        return (
          <Button 
            type="link" 
            size="small" 
            onClick={() => handleViewImpactProducts(record.impactProducts)}
            style={{ padding: 0 }}
          >
            {record.impactProducts.map(p => formatProductId(p.productId)).join(', ')}
          </Button>
        )
      }
    },
    { title: '告警类型', dataIndex: 'typeName', width: 100, render: (text: string) => <Tag color="error">{text}</Tag> },
    { title: '告警详情', dataIndex: 'message', width: 200, ellipsis: true },
    { title: '当前值', key: 'value', width: 90, align: 'center' as const, render: (_: any, record: AlertItem) => (
      <Text type="danger" strong>
        {record.type === 'delay' ? `${record.value}天` : `${record.value}%`}
      </Text>
    )},
    { title: '阈值', key: 'threshold', width: 90, align: 'center' as const, render: (_: any, record: AlertItem) => (
      <Text type="secondary">
        {record.type === 'delay' ? `${record.threshold}天` : `${record.threshold}%`}
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
    { title: '操作', key: 'action', width: 80, fixed: 'right' as const, render: (_: any, record: AlertItem) => (
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

  // 告警查询表单字段
  const alertSearchFields = [
    { name: 'tableId', label: '库表ID', component: <Input placeholder="请输入库表ID" allowClear /> },
    { name: 'tableName', label: '库表中文名', component: <Input placeholder="请输入库表中文名" allowClear /> },
    { name: 'alertTime', label: '告警时间', component: <DatePicker.RangePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder={['开始时间', '结束时间']} style={{ width: '100%' }} /> },
    { name: 'alertStatus', label: '处理状态', component: (
      <Select placeholder="请选择处理状态" allowClear>
        <Select.Option value="pending">待处理</Select.Option>
        <Select.Option value="processed">已处理</Select.Option>
      </Select>
    )},
  ]

  // 处理告警查询
  const handleAlertSearch = () => {
    const values = alertSearchForm.getFieldsValue()
    setFilterAlertTableId(values.tableId || '')
    setFilterAlertTable(values.tableName || '')
    setFilterAlertStatus(values.alertStatus || '')
    message.success('查询成功')
  }

  // 处理告警重置
  const handleAlertReset = () => {
    alertSearchForm.resetFields()
    setFilterAlertTableId('')
    setFilterAlertTable('')
    setFilterAlertStatus('')
    message.success('重置成功')
  }

  // 处理告警导出
  const handleAlertExport = () => {
    message.success('导出成功')
  }

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
    setSourceModalVisible(true)
  }

  // 点击查看影响产品列表
  const handleViewImpactProducts = (products: ImpactProduct[]) => {
    setSelectedProducts(products)
    setIsProductModalVisible(true)
  }

  // 打开处理告警弹窗（单条）
  const handleProcessAlert = (record: AlertItem) => {
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
      message.warning('请选择要处理的告警')
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
        message.success(`成功处理 ${selectedAlerts.length} 条告警`)
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
        message.success('告警处理成功')
      }
      setIsProcessModalVisible(false)
    })
  }

  return (
    <div className="table-update-monitor">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {statsData.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <div>
                <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>{stat.title}</div>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: stat.color || '#1890ff' }}>
                  {stat.icon && <span style={{ marginRight: 8 }}>{stat.icon}</span>}
                  {stat.value}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 实时告警 */}
      <Card title="实时告警" style={{ marginBottom: 16 }}>
        <Form form={alertSearchForm} style={{ marginBottom: 16 }} initialValues={{ alertStatus: 'pending' }}>
          <Row gutter={24}>
            {alertSearchFields.map((field, index) => (
              <Col span={6} key={index}>
                <Form.Item name={field.name} label={field.label} style={{ marginBottom: 12 }}>
                  {field.component}
                </Form.Item>
              </Col>
            ))}
          </Row>
          <Row gutter={24} align="middle">
            <Col span={24} style={{ textAlign: 'right', paddingRight: 8 }}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleAlertSearch}>查询</Button>
                <Button icon={<ReloadOutlined />} onClick={handleAlertReset}>重置</Button>
                <Button icon={<ExportOutlined />} onClick={handleAlertExport}>导出</Button>
                <Button type="primary" onClick={handleBatchProcess} disabled={selectedRowKeys.length === 0}>
                  批量处理 ({selectedRowKeys.length})
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
        <Table
          columns={alertColumns}
          dataSource={filteredAlertData}
          rowKey="id"
          size="small"
          scroll={{ x: 1600 }}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys,
            onChange: (keys) => {
              setSelectedRowKeys(keys)
            },
            getCheckboxProps: (record: AlertItem) => ({
              disabled: record.status === 'processed',
            }),
          }}
          pagination={{
            current: alertPagination.current,
            pageSize: alertPagination.pageSize,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['5', '10', '20', '50'],
            onChange: (page, pageSize) => setAlertPagination({ current: page, pageSize: pageSize || 5 })
          }}
          locale={{ emptyText: <Empty description="暂无告警信息" /> }}
        />
      </Card>

      {/* 表监控列表 */}
      <Card title="库表质量监控" style={{ marginBottom: 16 }}>
        <Form form={tableSearchForm} style={{ marginBottom: 16 }}>
          <Row gutter={24}>
            {tableSearchFields.map((field, index) => (
              <Col span={6} key={index}>
                <Form.Item name={field.name} label={field.label} style={{ marginBottom: 12 }}>
                  {field.component}
                </Form.Item>
              </Col>
            ))}
          </Row>
          <Row gutter={24} align="middle">
            <Col span={24} style={{ textAlign: 'right', paddingRight: 8 }}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleTableSearch}>查询</Button>
                <Button icon={<ReloadOutlined />} onClick={handleTableReset}>重置</Button>
                <Button icon={<ExportOutlined />} onClick={() => message.success('导出成功')}>导出</Button>
              </Space>
            </Col>
          </Row>
        </Form>
        <Table
          columns={columns}
          dataSource={filteredTableData}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            current: tablePagination.current,
            pageSize: tablePagination.pageSize,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => setTablePagination({ current: page, pageSize: pageSize || 10 })
          }}
        />
      </Card>

      {/* 数据波动率预警配置弹窗 */}
      <Modal
        title={`预警配置 - ${currentTable?.tableName}`}
        open={isConfigModalVisible}
        onOk={handleConfigSubmit}
        onCancel={() => setIsConfigModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={400}
      >
        <Form form={configForm} layout="vertical">
          <Alert
            message="配置数据波动预警阈值"
            description="当数据波动率超过阈值时触发预警"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form.Item
            name="alertThreshold"
            label="波动率阈值(%)"
            rules={[{ required: true, message: '请输入波动率阈值' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} max={100} placeholder="请输入波动率阈值" />
          </Form.Item>
          <Form.Item
            name="alertEnabled"
            label="预警开关"
            valuePropName="checked"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          <Form.Item
            name="alertPhones"
            label="预警手机号"
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}
          >
            <Input placeholder="请输入接收预警的手机号" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 数据更新预警配置弹窗 */}
      <Modal
        title={`预警配置 - ${currentTable?.tableName}`}
        open={isUpdateStatusConfigVisible}
        onOk={handleUpdateStatusConfigSubmit}
        onCancel={() => setIsUpdateStatusConfigVisible(false)}
        okText="保存"
        cancelText="取消"
        width={400}
      >
        <Form form={updateStatusConfigForm} layout="vertical">
          <Alert
            message="配置数据更新预警"
            description="当数据更新延迟超过设定天数时触发预警"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form.Item
            name="updateAlertThreshold"
            label="延迟阈值(天)"
            rules={[{ required: true, message: '请输入延迟阈值' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} max={30} placeholder="请输入延迟阈值，如超过1天延迟则触发告警" />
          </Form.Item>
          <Form.Item
            name="updateAlertEnabled"
            label="预警开关"
            valuePropName="checked"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          <Form.Item
            name="updateAlertPhones"
            label="预警手机号"
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}
          >
            <Input placeholder="请输入接收预警的手机号" />
          </Form.Item>
        </Form>
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
            <Input.TextArea 
              rows={4} 
              placeholder="请输入处理备注（选填），如：已联系上游系统、已修复、监控阈值调整等"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
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
                  {customers.map((name, idx) => (
                    <Tag key={idx} color="blue" style={{ marginBottom: 4, marginRight: 8 }}>{name}</Tag>
                  ))}
                </div>
              )
            },
          ]}
          dataSource={selectedProducts}
          rowKey="productId"
          size="small"
          pagination={false}
        />
      </Modal>

      {/* 数源机构弹窗 */}
      <Modal
        title="数源机构"
        open={sourceModalVisible}
        onCancel={() => setSourceModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSourceModalVisible(false)}>
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
    </div>
  )
}

export default TableUpdateMonitor
