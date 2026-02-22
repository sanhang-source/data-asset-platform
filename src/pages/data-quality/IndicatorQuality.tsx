import { useState, useMemo } from 'react'
import { Card, Table, Tag, Row, Col, Button, Space, Modal, Form, Input, InputNumber, Switch, message, DatePicker, Empty, Alert, Badge, Typography, Select } from 'antd'
import { CheckCircleOutlined, WarningOutlined, ClockCircleOutlined, ReloadOutlined, SearchOutlined, ExportOutlined, StopOutlined, SettingOutlined } from '@ant-design/icons'

const { Text } = Typography

// 影响产品信息
interface ImpactProduct {
  productId: string
  productName: string
  customerNames: string[]
}

interface IndicatorItem {
  id: string
  indicatorName: string
  indicatorId: string
  indicatorEnglishName: string
  dataSourceId: string
  relatedResourceId: string
  impactProducts?: ImpactProduct[]
  expectedUpdateTime: string
  actualUpdateTime: string
  delayDays: number
  updateStatus: 'ontime' | 'delayed'
  nullRate: number
  fluctuationRate: number
  // 数据更新预警配置
  updateAlertEnabled: boolean
  updateAlertThreshold: number
  updateAlertPhones: string
  // 数据波动预警配置
  fluctuationAlertEnabled: boolean
  fluctuationAlertThreshold: number
  fluctuationAlertPhones: string
  // 数据空值预警配置
  nullAlertEnabled: boolean
  nullAlertThreshold: number
  nullAlertPhones: string
}

// 告警信息接口
interface AlertItem {
  id: string
  time: string
  indicatorId: string
  indicatorName: string
  indicatorEnglishName: string
  dataSourceId: string
  relatedResourceId: string
  impactProducts: ImpactProduct[]
  type: 'delay' | 'fluctuation' | 'nullValue'
  typeName: string
  level: 'warning' | 'error'
  message: string
  value: number
  threshold: number
  status: 'pending' | 'processed'
  processTime?: string
  processRemark?: string
}

const IndicatorQuality = () => {
  const [data, setData] = useState<IndicatorItem[]>([
    { id: '1', indicatorName: '企业信用评分均值', indicatorId: 'IND001', indicatorEnglishName: 'AVG_CREDIT_SCORE', dataSourceId: 'DS-00001', relatedResourceId: 'RES001', impactProducts: [{ productId: 'PRD001', productName: '企业风控查询服务', customerNames: ['中国工商银行股份有限公司深圳分行', '招商银行股份有限公司'] }, { productId: 'PRD002', productName: '企业信用评估服务', customerNames: ['中国银行股份有限公司'] }], expectedUpdateTime: '2024-02-01', actualUpdateTime: '2024-02-01', delayDays: 0, updateStatus: 'ontime', nullRate: 0.02, fluctuationRate: 5.5, updateAlertEnabled: false, updateAlertThreshold: 1, updateAlertPhones: '', fluctuationAlertEnabled: false, fluctuationAlertThreshold: 20, fluctuationAlertPhones: '', nullAlertEnabled: false, nullAlertThreshold: 10, nullAlertPhones: '' },
    { id: '2', indicatorName: '行政处罚记录数', indicatorId: 'IND002', indicatorEnglishName: 'PENALTY_RECORD_COUNT', dataSourceId: 'DS-00002', relatedResourceId: 'RES002', impactProducts: [{ productId: 'PRD004', productName: '行政处罚查询服务', customerNames: ['中国建设银行股份有限公司', '中国银行股份有限公司'] }, { productId: 'PRD005', productName: '企业信用报告服务', customerNames: ['中国平安银行股份有限公司'] }], expectedUpdateTime: '2024-02-01', actualUpdateTime: '2024-02-03', delayDays: 1, updateStatus: 'delayed', nullRate: 0.15, fluctuationRate: 42.8, updateAlertEnabled: false, updateAlertThreshold: 1, updateAlertPhones: '', fluctuationAlertEnabled: false, fluctuationAlertThreshold: 20, fluctuationAlertPhones: '', nullAlertEnabled: false, nullAlertThreshold: 10, nullAlertPhones: '' },
    { id: '3', indicatorName: '社保缴纳企业数', indicatorId: 'IND003', indicatorEnglishName: 'SOCIAL_SECURITY_COUNT', dataSourceId: 'DS-00003', relatedResourceId: 'RES003', impactProducts: [{ productId: 'PRD003', productName: '社保信息查询服务', customerNames: ['中国工商银行股份有限公司深圳分行', '招商银行股份有限公司'] }], expectedUpdateTime: '2024-02-01', actualUpdateTime: '2024-02-05', delayDays: 2, updateStatus: 'delayed', nullRate: 0.08, fluctuationRate: 12.3, updateAlertEnabled: false, updateAlertThreshold: 1, updateAlertPhones: '', fluctuationAlertEnabled: false, fluctuationAlertThreshold: 20, fluctuationAlertPhones: '', nullAlertEnabled: false, nullAlertThreshold: 10, nullAlertPhones: '' },
    { id: '4', indicatorName: '工商注册企业数', indicatorId: 'IND004', indicatorEnglishName: 'BUSINESS_REG_COUNT', dataSourceId: 'DS-00001', relatedResourceId: 'RES004', impactProducts: [{ productId: 'PRD002', productName: '企业信用评估服务', customerNames: ['中国银行股份有限公司'] }], expectedUpdateTime: '2024-02-01', actualUpdateTime: '2024-02-01', delayDays: 0, updateStatus: 'ontime', nullRate: 0.01, fluctuationRate: 3.2, updateAlertEnabled: false, updateAlertThreshold: 1, updateAlertPhones: '', fluctuationAlertEnabled: false, fluctuationAlertThreshold: 20, fluctuationAlertPhones: '', nullAlertEnabled: false, nullAlertThreshold: 10, nullAlertPhones: '' },
    { id: '5', indicatorName: '纳税信用A级占比', indicatorId: 'IND005', indicatorEnglishName: 'TAX_CREDIT_A_RATIO', dataSourceId: 'DS-00001', relatedResourceId: 'RES005', impactProducts: [{ productId: 'PRD008', productName: '纳税信用查询服务', customerNames: ['中国光大银行股份有限公司'] }], expectedUpdateTime: '2024-02-01', actualUpdateTime: '2024-02-02', delayDays: 0, updateStatus: 'ontime', nullRate: 0.05, fluctuationRate: 8.7, updateAlertEnabled: false, updateAlertThreshold: 1, updateAlertPhones: '', fluctuationAlertEnabled: false, fluctuationAlertThreshold: 20, fluctuationAlertPhones: '', nullAlertEnabled: false, nullAlertThreshold: 10, nullAlertPhones: '' },
  ])

  // 指标监控分页状态
  const [indicatorPagination, setIndicatorPagination] = useState({ current: 1, pageSize: 10 })
  
  // 告警分页状态
  const [alertPagination, setAlertPagination] = useState({ current: 1, pageSize: 5 })

  const [isFluctuationConfigVisible, setIsFluctuationConfigVisible] = useState(false)
  const [isUpdateConfigVisible, setIsUpdateConfigVisible] = useState(false)
  const [isNullConfigVisible, setIsNullConfigVisible] = useState(false)
  const [currentIndicator, setCurrentIndicator] = useState<IndicatorItem | null>(null)
  const [fluctuationConfigForm] = Form.useForm()
  const [updateConfigForm] = Form.useForm()
  const [nullConfigForm] = Form.useForm()
  
  // 数源机构弹窗状态
  const [sourceModalVisible, setSourceModalVisible] = useState(false)
  
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
  
  // 指标监控查询状态
  const [indicatorSearchForm] = Form.useForm()
  const [filterIndicatorId, setFilterIndicatorId] = useState('')
  const [filterIndicatorName, setFilterIndicatorName] = useState('')
  const [filterIndicatorStatus, setFilterIndicatorStatus] = useState<'ontime' | 'delayed' | ''>('')
  
  // 筛选后的指标数据
  const filteredIndicatorData = useMemo(() => {
    return data.filter(record => {
      if (filterIndicatorId && !record.indicatorId.toLowerCase().includes(filterIndicatorId.toLowerCase())) return false
      if (filterIndicatorName && !record.indicatorName.includes(filterIndicatorName)) return false
      if (filterIndicatorStatus && record.updateStatus !== filterIndicatorStatus) return false
      return true
    })
  }, [data, filterIndicatorId, filterIndicatorName, filterIndicatorStatus])
  
  // 指标监控查询字段
  const indicatorSearchFields = [
    { name: 'indicatorId', label: '指标ID', component: <Input placeholder="请输入指标ID" allowClear /> },
    { name: 'indicatorName', label: '指标中文名', component: <Input placeholder="请输入指标中文名" allowClear /> },
    { name: 'indicatorStatus', label: '指标状态', component: (
      <Select placeholder="请选择指标状态" allowClear>
        <Select.Option value="ontime">正常</Select.Option>
        <Select.Option value="delayed">告警</Select.Option>
      </Select>
    )},
  ]
  
  // 处理指标查询
  const handleIndicatorSearch = () => {
    const values = indicatorSearchForm.getFieldsValue()
    setFilterIndicatorId(values.indicatorId || '')
    setFilterIndicatorName(values.indicatorName || '')
    setFilterIndicatorStatus(values.indicatorStatus || '')
    message.success('查询成功')
  }
  
  // 处理指标重置
  const handleIndicatorReset = () => {
    indicatorSearchForm.resetFields()
    setFilterIndicatorId('')
    setFilterIndicatorName('')
    setFilterIndicatorStatus('')
    message.success('重置成功')
  }

  // 指标监控列表列定义
  const columns = [
    { title: '序号', key: 'index', width: 60, align: 'center' as const, render: (_: any, __: any, index: number) => index + 1 },
    { title: '指标ID', dataIndex: 'indicatorId', width: 100 },
    { title: '指标中文名', dataIndex: 'indicatorName', width: 140, ellipsis: true },
    { title: '指标英文名', dataIndex: 'indicatorEnglishName', width: 160, ellipsis: true },
    { 
      title: '指标状态', 
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
      render: (_: string) => (
        <Button type="link" size="small" onClick={() => setSourceModalVisible(true)} style={{ padding: 0, textAlign: 'left' }}>
          BM00001-068
        </Button>
      )
    },
    { 
      title: '影响产品ID', 
      key: 'impactProducts',
      width: 180,
      render: (_: any, record: IndicatorItem) => {
        const formatProductId = (id: string) => {
          const num = id.replace(/\D/g, '')
          return `CR${num.padStart(4, '0')}`
        }
        const productIds = record.impactProducts?.map(p => formatProductId(p.productId)).join(', ') || '-'
        return (
          <Button 
            type="link" 
            size="small" 
            onClick={() => handleViewImpactProducts(record.impactProducts || [])}
            style={{ padding: 0, whiteSpace: 'normal', textAlign: 'left', lineHeight: '1.5' }}
          >
            {productIds}
          </Button>
        )
      }
    },
    { title: '预期更新时间', dataIndex: 'expectedUpdateTime', width: 150, align: 'center' as const },
    { title: '实际更新时间', dataIndex: 'actualUpdateTime', width: 150, align: 'center' as const },
    { title: '延迟更新时间', dataIndex: 'delayDays', width: 150, align: 'center' as const, render: (days: number, record: IndicatorItem) => {
        if (!record.expectedUpdateTime || !record.actualUpdateTime) return '-'
        return `${days}天`
      } },
    {
      title: '数据更新',
      key: 'updateStatus',
      width: 130,
      align: 'center' as const,
      render: (_: any, record: IndicatorItem) => {
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
            <Button type="link" size="small" style={{ padding: 0, position: 'absolute', right: 4 }} onClick={() => handleUpdateConfig(record)}>
              <SettingOutlined />
            </Button>
          </div>
        )
      }
    },
    {
      title: '数据波动',
      key: 'fluctuationRate',
      width: 130,
      align: 'center' as const,
      render: (_: any, record: IndicatorItem) => {
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
            <Button type="link" size="small" style={{ padding: 0, position: 'absolute', right: 4 }} onClick={() => handleFluctuationConfig(record)}>
              <SettingOutlined />
            </Button>
          </div>
        )
      }
    },
    {
      title: '数据空值',
      key: 'nullRate',
      width: 130,
      align: 'center' as const,
      render: (_: any, record: IndicatorItem) => {
        const isNormal = record.nullRate * 100 <= record.nullAlertThreshold
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', padding: '0 24px 0 0' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              {record.nullAlertEnabled ? (
                <Tag color={isNormal ? 'success' : 'error'}>{(record.nullRate * 100).toFixed(1)}%</Tag>
              ) : (
                <span>{(record.nullRate * 100).toFixed(1)}%</span>
              )}
            </div>
            <Button type="link" size="small" style={{ padding: 0, position: 'absolute', right: 4 }} onClick={() => handleNullConfig(record)}>
              <SettingOutlined />
            </Button>
          </div>
        )
      }
    },
  ]

  const handleFluctuationConfig = (record: IndicatorItem) => {
    setCurrentIndicator(record)
    fluctuationConfigForm.setFieldsValue({
      alertThreshold: record.fluctuationAlertThreshold,
      alertEnabled: record.fluctuationAlertEnabled,
      alertPhones: record.fluctuationAlertPhones
    })
    setIsFluctuationConfigVisible(true)
  }

  const handleFluctuationConfigSubmit = () => {
    fluctuationConfigForm.validateFields().then(values => {
      if (currentIndicator) {
        setData(data.map(item =>
          item.id === currentIndicator.id
            ? { ...item, fluctuationAlertThreshold: values.alertThreshold, fluctuationAlertEnabled: values.alertEnabled, fluctuationAlertPhones: values.alertPhones }
            : item
        ))
        message.success('数据波动预警配置保存成功')
        setIsFluctuationConfigVisible(false)
      }
    })
  }

  const handleUpdateConfig = (record: IndicatorItem) => {
    setCurrentIndicator(record)
    updateConfigForm.setFieldsValue({
      alertThreshold: record.updateAlertThreshold,
      alertEnabled: record.updateAlertEnabled,
      alertPhones: record.updateAlertPhones
    })
    setIsUpdateConfigVisible(true)
  }

  const handleUpdateConfigSubmit = () => {
    updateConfigForm.validateFields().then(values => {
      if (currentIndicator) {
        setData(data.map(item =>
          item.id === currentIndicator.id
            ? { ...item, updateAlertThreshold: values.alertThreshold, updateAlertEnabled: values.alertEnabled, updateAlertPhones: values.alertPhones }
            : item
        ))
        message.success('数据更新预警配置保存成功')
        setIsUpdateConfigVisible(false)
      }
    })
  }

  const handleNullConfig = (record: IndicatorItem) => {
    setCurrentIndicator(record)
    nullConfigForm.setFieldsValue({
      alertThreshold: record.nullAlertThreshold,
      alertEnabled: record.nullAlertEnabled,
      alertPhones: record.nullAlertPhones
    })
    setIsNullConfigVisible(true)
  }

  const handleNullConfigSubmit = () => {
    nullConfigForm.validateFields().then(values => {
      if (currentIndicator) {
        setData(data.map(item =>
          item.id === currentIndicator.id
            ? { ...item, nullAlertThreshold: values.alertThreshold, nullAlertEnabled: values.alertEnabled, nullAlertPhones: values.alertPhones }
            : item
        ))
        message.success('数据空值预警配置保存成功')
        setIsNullConfigVisible(false)
      }
    })
  }

  // 点击查看影响产品列表
  const handleViewImpactProducts = (products: ImpactProduct[]) => {
    setSelectedProducts(products)
    setIsProductModalVisible(true)
  }

  // 实时告警数据
  const [alertData, setAlertData] = useState<AlertItem[]>([
    { id: '1', time: '2024-02-01 14:32:15', indicatorId: 'IND003', indicatorName: '社保缴纳企业数', indicatorEnglishName: 'SOCIAL_SECURITY_COUNT', dataSourceId: 'DS-00003', relatedResourceId: 'RES003', impactProducts: [{ productId: 'PRD003', productName: '社保信息查询服务', customerNames: ['中国工商银行股份有限公司深圳分行', '招商银行股份有限公司'] }], type: 'delay', typeName: '更新延迟', level: 'error', message: '数据更新延迟2天', value: 2, threshold: 1, status: 'pending' },
    { id: '2', time: '2024-02-01 14:28:10', indicatorId: 'IND002', indicatorName: '行政处罚记录数', indicatorEnglishName: 'PENALTY_RECORD_COUNT', dataSourceId: 'DS-00002', relatedResourceId: 'RES002', impactProducts: [{ productId: 'PRD004', productName: '行政处罚查询服务', customerNames: ['中国建设银行股份有限公司', '中国银行股份有限公司'] }, { productId: 'PRD005', productName: '企业信用报告服务', customerNames: ['中国平安银行股份有限公司'] }], type: 'delay', typeName: '更新延迟', level: 'warning', message: '数据更新延迟1天', value: 1, threshold: 1, status: 'pending' },
    { id: '3', time: '2024-02-01 14:25:33', indicatorId: 'IND003', indicatorName: '社保缴纳企业数', indicatorEnglishName: 'SOCIAL_SECURITY_COUNT', dataSourceId: 'DS-00003', relatedResourceId: 'RES003', impactProducts: [{ productId: 'PRD003', productName: '社保信息查询服务', customerNames: ['中国工商银行股份有限公司深圳分行'] }], type: 'delay', typeName: '更新延迟', level: 'error', message: '数据更新延迟2天', value: 2, threshold: 1, status: 'processed', processTime: '2024-02-01 15:10:00', processRemark: '已联系上游系统确认数据延迟' },
    { id: '4', time: '2024-02-01 14:22:18', indicatorId: 'IND003', indicatorName: '社保缴纳企业数', indicatorEnglishName: 'SOCIAL_SECURITY_COUNT', dataSourceId: 'DS-00003', relatedResourceId: 'RES003', impactProducts: [{ productId: 'PRD003', productName: '社保信息查询服务', customerNames: ['中国工商银行股份有限公司深圳分行', '招商银行股份有限公司', '中信银行股份有限公司'] }], type: 'delay', typeName: '更新延迟', level: 'error', message: '数据更新延迟2天', value: 2, threshold: 1, status: 'pending' },
    { id: '5', time: '2024-02-01 14:20:45', indicatorId: 'IND004', indicatorName: '工商注册企业数', indicatorEnglishName: 'BUSINESS_REG_COUNT', dataSourceId: 'DS-00001', relatedResourceId: 'RES004', impactProducts: [{ productId: 'PRD002', productName: '企业信用评估服务', customerNames: ['中国银行股份有限公司'] }], type: 'delay', typeName: '更新延迟', level: 'warning', message: '数据更新延迟1天', value: 1, threshold: 1, status: 'processed', processTime: '2024-02-01 15:00:00', processRemark: '网络抖动导致，已恢复正常' },
    { id: '6', time: '2024-02-01 14:18:30', indicatorId: 'IND005', indicatorName: '纳税信用A级占比', indicatorEnglishName: 'TAX_CREDIT_A_RATIO', dataSourceId: 'DS-00001', relatedResourceId: 'RES005', impactProducts: [{ productId: 'PRD008', productName: '纳税信用查询服务', customerNames: ['中国光大银行股份有限公司'] }], type: 'delay', typeName: '更新延迟', level: 'warning', message: '数据更新延迟1天', value: 1, threshold: 1, status: 'pending' },
    { id: '7', time: '2024-02-01 14:15:22', indicatorId: 'IND001', indicatorName: '企业信用评分均值', indicatorEnglishName: 'AVG_CREDIT_SCORE', dataSourceId: 'DS-00001', relatedResourceId: 'RES001', impactProducts: [{ productId: 'PRD001', productName: '企业风控查询服务', customerNames: ['中国工商银行股份有限公司深圳分行', '招商银行股份有限公司'] }], type: 'delay', typeName: '更新延迟', level: 'warning', message: '数据更新延迟1天', value: 1, threshold: 1, status: 'processed', processTime: '2024-02-01 14:50:00', processRemark: '监控阈值调整，已忽略' },
    { id: '8', time: '2024-02-01 14:12:08', indicatorId: 'IND002', indicatorName: '行政处罚记录数', indicatorEnglishName: 'PENALTY_RECORD_COUNT', dataSourceId: 'DS-00002', relatedResourceId: 'RES002', impactProducts: [{ productId: 'PRD004', productName: '行政处罚查询服务', customerNames: ['中国建设银行股份有限公司'] }, { productId: 'PRD006', productName: '司法诉讼查询服务', customerNames: ['中国民生银行股份有限公司'] }], type: 'delay', typeName: '更新延迟', level: 'warning', message: '数据更新延迟1天', value: 1, threshold: 1, status: 'pending' },
    { id: '9', time: '2024-02-05 16:45:22', indicatorId: 'IND002', indicatorName: '行政处罚记录数', indicatorEnglishName: 'PENALTY_RECORD_COUNT', dataSourceId: 'DS-00002', relatedResourceId: 'RES002', impactProducts: [{ productId: 'PRD004', productName: '行政处罚查询服务', customerNames: ['中国建设银行股份有限公司', '中国银行股份有限公司'] }], type: 'fluctuation', typeName: '数据波动', level: 'error', message: '数据波动率42.8%', value: 42.8, threshold: 20, status: 'pending' },
    { id: '10', time: '2024-02-05 16:30:15', indicatorId: 'IND001', indicatorName: '企业信用评分均值', indicatorEnglishName: 'AVG_CREDIT_SCORE', dataSourceId: 'DS-00001', relatedResourceId: 'RES001', impactProducts: [{ productId: 'PRD001', productName: '企业风控查询服务', customerNames: ['中国工商银行股份有限公司深圳分行', '招商银行股份有限公司'] }], type: 'fluctuation', typeName: '数据波动', level: 'warning', message: '数据波动率25.5%', value: 25.5, threshold: 20, status: 'pending' },
    { id: '11', time: '2024-02-05 16:20:10', indicatorId: 'IND002', indicatorName: '行政处罚记录数', indicatorEnglishName: 'PENALTY_RECORD_COUNT', dataSourceId: 'DS-00002', relatedResourceId: 'RES002', impactProducts: [{ productId: 'PRD004', productName: '行政处罚查询服务', customerNames: ['中国建设银行股份有限公司'] }], type: 'nullValue', typeName: '数据空值', level: 'error', message: '数据空值率15.2%', value: 15.2, threshold: 10, status: 'pending' },
    { id: '12', time: '2024-02-05 16:10:05', indicatorId: 'IND003', indicatorName: '社保缴纳企业数', indicatorEnglishName: 'SOCIAL_SECURITY_COUNT', dataSourceId: 'DS-00003', relatedResourceId: 'RES003', impactProducts: [{ productId: 'PRD003', productName: '社保信息查询服务', customerNames: ['中国工商银行股份有限公司深圳分行'] }], type: 'nullValue', typeName: '数据空值', level: 'warning', message: '数据空值率8.5%', value: 8.5, threshold: 10, status: 'processed', processTime: '2024-02-05 16:30:00', processRemark: '数据源补全，已恢复正常' },
    { id: '13', time: '2024-02-05 17:15:30', indicatorId: 'IND004', indicatorName: '工商注册企业数', indicatorEnglishName: 'BUSINESS_REG_COUNT', dataSourceId: 'DS-00001', relatedResourceId: 'RES004', impactProducts: [{ productId: 'PRD002', productName: '企业信用评估服务', customerNames: ['中国银行股份有限公司'] }, { productId: 'PRD001', productName: '企业风控查询服务', customerNames: ['中国工商银行股份有限公司深圳分行'] }], type: 'nullValue', typeName: '数据空值', level: 'error', message: '数据空值率18.5%', value: 18.5, threshold: 10, status: 'pending' },
    { id: '14', time: '2024-02-05 17:30:45', indicatorId: 'IND005', indicatorName: '纳税信用A级占比', indicatorEnglishName: 'TAX_CREDIT_A_RATIO', dataSourceId: 'DS-00001', relatedResourceId: 'RES005', impactProducts: [{ productId: 'PRD008', productName: '纳税信用查询服务', customerNames: ['中国光大银行股份有限公司'] }], type: 'nullValue', typeName: '数据空值', level: 'warning', message: '数据空值率12.3%', value: 12.3, threshold: 10, status: 'pending' },
    { id: '15', time: '2024-02-05 17:45:00', indicatorId: 'IND001', indicatorName: '企业信用评分均值', indicatorEnglishName: 'AVG_CREDIT_SCORE', dataSourceId: 'DS-00001', relatedResourceId: 'RES001', impactProducts: [{ productId: 'PRD001', productName: '企业风控查询服务', customerNames: ['中国工商银行股份有限公司深圳分行', '招商银行股份有限公司'] }], type: 'nullValue', typeName: '数据空值', level: 'error', message: '数据空值率22.1%', value: 22.1, threshold: 10, status: 'processed', processTime: '2024-02-05 18:00:00', processRemark: '已联系数据提供方补全数据' },
  ])

  // 统计卡片数据
  const statsData = [
    { title: '指标总数', value: data.length, icon: <ClockCircleOutlined />, color: '#1890ff' },
    { title: '正常指标', value: data.filter(item => item.updateStatus === 'ontime').length, icon: <CheckCircleOutlined />, color: '#52c41a' },
    { title: '告警指标', value: data.filter(item => item.updateStatus === 'delayed').length, icon: <WarningOutlined />, color: '#faad14' },
    { title: '未处理告警', value: alertData.filter(item => item.status === 'pending').length, icon: <StopOutlined />, color: '#f5222d' },
  ]

  // 告警查询状态
  const [alertSearchForm] = Form.useForm()
  const [filterAlertIndicatorId, setFilterAlertIndicatorId] = useState('')
  const [filterAlertIndicator, setFilterAlertIndicator] = useState('')
  const [filterAlertStatus, setFilterAlertStatus] = useState<'pending' | 'processed' | ''>('pending')

  // 筛选后的告警数据
  const filteredAlertData = useMemo(() => {
    return alertData.filter(alert => {
      if (filterAlertIndicatorId && !alert.indicatorId.toLowerCase().includes(filterAlertIndicatorId.toLowerCase())) return false
      if (filterAlertIndicator && !alert.indicatorName.includes(filterAlertIndicator)) return false
      if (filterAlertStatus && alert.status !== filterAlertStatus) return false
      return true
    })
  }, [alertData, filterAlertIndicatorId, filterAlertIndicator, filterAlertStatus])

  // 告警表格列定义
  const alertColumns = [
    { title: '告警时间', dataIndex: 'time', width: 160 },
    { title: '指标ID', dataIndex: 'indicatorId', width: 100 },
    { title: '指标中文名', dataIndex: 'indicatorName', width: 140, ellipsis: true },
    { title: '指标英文名', dataIndex: 'indicatorEnglishName', width: 160, ellipsis: true },
    { 
      title: '数源机构ID', 
      dataIndex: 'dataSourceId', 
      width: 130,
      render: (_: string) => (
        <Button type="link" size="small" onClick={() => setSourceModalVisible(true)} style={{ padding: 0, textAlign: 'left' }}>
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
    { name: 'indicatorId', label: '指标ID', component: <Input placeholder="请输入指标ID" allowClear /> },
    { name: 'indicatorName', label: '指标中文名', component: <Input placeholder="请输入指标中文名" allowClear /> },
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
    setFilterAlertIndicatorId(values.indicatorId || '')
    setFilterAlertIndicator(values.indicatorName || '')
    setFilterAlertStatus(values.alertStatus || '')
    message.success('查询成功')
  }

  // 处理告警重置
  const handleAlertReset = () => {
    alertSearchForm.resetFields()
    setFilterAlertIndicatorId('')
    setFilterAlertIndicator('')
    setFilterAlertStatus('pending')
    message.success('重置成功')
  }

  // 处理告警导出
  const handleAlertExport = () => {
    message.success('导出成功')
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
    <div className="indicator-quality">
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

      {/* 指标监控列表 */}
      <Card title="指标质量监控" style={{ marginBottom: 16 }}>
        <Form form={indicatorSearchForm} style={{ marginBottom: 16 }}>
          <Row gutter={24}>
            {indicatorSearchFields.map((field, index) => (
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
                <Button type="primary" icon={<SearchOutlined />} onClick={handleIndicatorSearch}>查询</Button>
                <Button icon={<ReloadOutlined />} onClick={handleIndicatorReset}>重置</Button>
                <Button icon={<ExportOutlined />} onClick={() => message.success('导出成功')}>导出</Button>
              </Space>
            </Col>
          </Row>
        </Form>
        <Table
          columns={columns}
          dataSource={filteredIndicatorData}
          rowKey="id"
          scroll={{ x: 1500 }}
          pagination={{
            current: indicatorPagination.current,
            pageSize: indicatorPagination.pageSize,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => setIndicatorPagination({ current: page, pageSize: pageSize || 10 })
          }}
        />
      </Card>

      {/* 数据波动预警配置弹窗 */}
      <Modal
        title={`预警配置 - ${currentIndicator?.indicatorName}`}
        open={isFluctuationConfigVisible}
        onOk={handleFluctuationConfigSubmit}
        onCancel={() => setIsFluctuationConfigVisible(false)}
        okText="保存"
        cancelText="取消"
        width={400}
      >
        <Form form={fluctuationConfigForm} layout="vertical">
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
            rules={[{ required: true, message: '请输入波动阈值' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} max={100} placeholder="请输入波动阈值" />
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

      {/* 数据空值预警配置弹窗 */}
      <Modal
        title={`预警配置 - ${currentIndicator?.indicatorName}`}
        open={isNullConfigVisible}
        onOk={handleNullConfigSubmit}
        onCancel={() => setIsNullConfigVisible(false)}
        okText="保存"
        cancelText="取消"
        width={400}
      >
        <Form form={nullConfigForm} layout="vertical">
          <Alert
            message="配置数据空值预警阈值"
            description="当数据空值率超过阈值时触发预警"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form.Item
            name="alertThreshold"
            label="空值率阈值(%)"
            rules={[{ required: true, message: '请输入空值率阈值' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="请输入空值率阈值" />
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
        title={`预警配置 - ${currentIndicator?.indicatorName}`}
        open={isUpdateConfigVisible}
        onOk={handleUpdateConfigSubmit}
        onCancel={() => setIsUpdateConfigVisible(false)}
        okText="保存"
        cancelText="取消"
        width={400}
      >
        <Form form={updateConfigForm} layout="vertical">
          <Alert
            message="配置数据更新预警"
            description="当数据更新延迟超过设定天数时触发预警"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form.Item
            name="alertThreshold"
            label="延迟阈值(天)"
            rules={[{ required: true, message: '请输入延迟阈值' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} max={30} placeholder="请输入延迟阈值" />
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
        <div>
          <p><strong>数源机构ID：</strong>BM00001-068</p>
          <p><strong>数源机构名称：</strong>上海生腾数据科技有限公司</p>
        </div>
      </Modal>
    </div>
  )
}

export default IndicatorQuality
