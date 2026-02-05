import { useState, useMemo } from 'react'
import { Card, Table, Tag, Row, Col, Button, Modal, Form, Input, InputNumber, Switch, message, Space, Badge, Empty, Select, Typography, Alert, DatePicker } from 'antd'
import { 
  CheckCircleOutlined, 
  WarningOutlined, 
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  ApiOutlined,
  StopOutlined
} from '@ant-design/icons'


const { Option } = Select
const { Text } = Typography

// 告警信息接口
interface AlertItem {
  id: string
  time: string
  interfaceId: string
  interfaceName: string
  relatedProductId: string  // 关联产品ID
  type: 'queryRate' | 'responseTime' | 'errorRate'
  typeName: string
  level: 'warning' | 'error'
  message: string
  timeWindow: '10m' | '30m' | 'day' | 'month'
  value: number
  threshold: number
}

// 监控规则配置
interface AlertRule {
  timeWindow: '10m' | '30m'
  queryRateThreshold: number      // 查得率阈值(%)
  responseTimeThreshold: number   // 响应时间阈值(ms)
  errorRateThreshold: number      // 报错率阈值(%)
}

interface InterfaceMonitorItem {
  id: string
  interfaceName: string
  interfaceId: string
  relatedProductId: string  // 关联产品ID
  // 10分钟窗口数据
  queryRate10m: number
  avgResponseTime10m: number
  errorRate10m: number
  totalCalls10m: number
  // 30分钟窗口数据
  queryRate30m: number
  avgResponseTime30m: number
  errorRate30m: number
  totalCalls30m: number
  // 月度统计数据
  queryRateMonth: number
  avgResponseTimeMonth: number
  errorRateMonth: number
  totalCallsMonth: number
  // 年度统计数据
  queryRateYear: number
  avgResponseTimeYear: number
  errorRateYear: number
  totalCallsYear: number
  // 状态
  status: 'normal' | 'warning' | 'error'
  // 预警配置
  alertEnabled: boolean
  alertPhones: string
  rules: AlertRule[]
}

const InterfaceQuality = () => {
  // 当前Tab：'realtime' | 'month' | 'year'
  const [activeTab, setActiveTab] = useState('realtime')
  
  // 数据状态（10条，接口名称去掉API，增加关联产品ID）
  const [data, setData] = useState<InterfaceMonitorItem[]>([
    { id: '1', interfaceName: '企业信用查询', interfaceId: 'API001', relatedProductId: 'PRD001', queryRate10m: 99.8, avgResponseTime10m: 120, errorRate10m: 0.01, totalCalls10m: 1250, queryRate30m: 99.7, avgResponseTime30m: 125, errorRate30m: 0.02, totalCalls30m: 3750, queryRateMonth: 99.75, avgResponseTimeMonth: 123, errorRateMonth: 0.015, totalCallsMonth: 112500, queryRateYear: 99.72, avgResponseTimeYear: 128, errorRateYear: 0.018, totalCallsYear: 1350000, status: 'normal', alertEnabled: true, alertPhones: '13800138001', rules: [{ timeWindow: '10m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }, { timeWindow: '30m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }] },
    { id: '2', interfaceName: '行政处罚查询', interfaceId: 'API002', relatedProductId: 'PRD002', queryRate10m: 95.5, avgResponseTime10m: 450, errorRate10m: 0.15, totalCalls10m: 890, queryRate30m: 96.2, avgResponseTime30m: 380, errorRate30m: 0.12, totalCalls30m: 2670, queryRateMonth: 95.8, avgResponseTimeMonth: 415, errorRateMonth: 0.135, totalCallsMonth: 80100, queryRateYear: 95.6, avgResponseTimeYear: 420, errorRateYear: 0.14, totalCallsYear: 961200, status: 'warning', alertEnabled: true, alertPhones: '13800138002', rules: [{ timeWindow: '10m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }, { timeWindow: '30m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }] },
    { id: '3', interfaceName: '社保信息查询', interfaceId: 'API003', relatedProductId: 'PRD003', queryRate10m: 85.2, avgResponseTime10m: 820, errorRate10m: 0.68, totalCalls10m: 560, queryRate30m: 88.5, avgResponseTime30m: 680, errorRate30m: 0.48, totalCalls30m: 1680, queryRateMonth: 86.8, avgResponseTimeMonth: 750, errorRateMonth: 0.58, totalCallsMonth: 50400, queryRateYear: 87.2, avgResponseTimeYear: 760, errorRateYear: 0.55, totalCallsYear: 604800, status: 'error', alertEnabled: true, alertPhones: '13800138003', rules: [{ timeWindow: '10m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }, { timeWindow: '30m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }] },
    { id: '4', interfaceName: '工商信息查询', interfaceId: 'API004', relatedProductId: 'PRD004', queryRate10m: 99.9, avgResponseTime10m: 150, errorRate10m: 0.01, totalCalls10m: 1520, queryRate30m: 99.8, avgResponseTime30m: 155, errorRate30m: 0.02, totalCalls30m: 4560, queryRateMonth: 99.85, avgResponseTimeMonth: 152, errorRateMonth: 0.015, totalCallsMonth: 136800, queryRateYear: 99.82, avgResponseTimeYear: 158, errorRateYear: 0.018, totalCallsYear: 1641600, status: 'normal', alertEnabled: false, alertPhones: '', rules: [{ timeWindow: '10m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }, { timeWindow: '30m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }] },
    { id: '5', interfaceName: '纳税信用查询', interfaceId: 'API005', relatedProductId: 'PRD005', queryRate10m: 99.2, avgResponseTime10m: 200, errorRate10m: 0.03, totalCalls10m: 780, queryRate30m: 99.4, avgResponseTime30m: 195, errorRate30m: 0.03, totalCalls30m: 2340, queryRateMonth: 99.3, avgResponseTimeMonth: 197, errorRateMonth: 0.028, totalCallsMonth: 70200, queryRateYear: 99.28, avgResponseTimeYear: 202, errorRateYear: 0.032, totalCallsYear: 842400, status: 'normal', alertEnabled: true, alertPhones: '13800138005', rules: [{ timeWindow: '10m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }, { timeWindow: '30m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }] },
    { id: '6', interfaceName: '司法诉讼查询', interfaceId: 'API006', relatedProductId: 'PRD006', queryRate10m: 97.5, avgResponseTime10m: 280, errorRate10m: 0.08, totalCalls10m: 650, queryRate30m: 98.1, avgResponseTime30m: 265, errorRate30m: 0.06, totalCalls30m: 1950, queryRateMonth: 97.8, avgResponseTimeMonth: 272, errorRateMonth: 0.07, totalCallsMonth: 58500, queryRateYear: 97.6, avgResponseTimeYear: 275, errorRateYear: 0.075, totalCallsYear: 702000, status: 'warning', alertEnabled: true, alertPhones: '13800138006', rules: [{ timeWindow: '10m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }, { timeWindow: '30m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }] },
    { id: '7', interfaceName: '知识产权查询', interfaceId: 'API007', relatedProductId: 'PRD007', queryRate10m: 99.5, avgResponseTime10m: 180, errorRate10m: 0.02, totalCalls10m: 920, queryRate30m: 99.6, avgResponseTime30m: 175, errorRate30m: 0.015, totalCalls30m: 2760, queryRateMonth: 99.55, avgResponseTimeMonth: 177, errorRateMonth: 0.018, totalCallsMonth: 82800, queryRateYear: 99.52, avgResponseTimeYear: 179, errorRateYear: 0.019, totalCallsYear: 993600, status: 'normal', alertEnabled: true, alertPhones: '13800138007', rules: [{ timeWindow: '10m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }, { timeWindow: '30m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }] },
    { id: '8', interfaceName: '招投标信息查询', interfaceId: 'API008', relatedProductId: 'PRD008', queryRate10m: 96.8, avgResponseTime10m: 350, errorRate10m: 0.11, totalCalls10m: 480, queryRate30m: 97.5, avgResponseTime30m: 320, errorRate30m: 0.09, totalCalls30m: 1440, queryRateMonth: 97.1, avgResponseTimeMonth: 335, errorRateMonth: 0.10, totalCallsMonth: 43200, queryRateYear: 96.9, avgResponseTimeYear: 342, errorRateYear: 0.105, totalCallsYear: 518400, status: 'warning', alertEnabled: true, alertPhones: '13800138008', rules: [{ timeWindow: '10m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }, { timeWindow: '30m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }] },
    { id: '9', interfaceName: '海关进出口查询', interfaceId: 'API009', relatedProductId: 'PRD009', queryRate10m: 99.1, avgResponseTime10m: 220, errorRate10m: 0.04, totalCalls10m: 580, queryRate30m: 99.3, avgResponseTime30m: 215, errorRate30m: 0.035, totalCalls30m: 1740, queryRateMonth: 99.2, avgResponseTimeMonth: 217, errorRateMonth: 0.038, totalCallsMonth: 52200, queryRateYear: 99.15, avgResponseTimeYear: 219, errorRateYear: 0.039, totalCallsYear: 626400, status: 'normal', alertEnabled: true, alertPhones: '13800138009', rules: [{ timeWindow: '10m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }, { timeWindow: '30m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }] },
    { id: '10', interfaceName: '环保处罚查询', interfaceId: 'API010', relatedProductId: 'PRD010', queryRate10m: 94.2, avgResponseTime10m: 520, errorRate10m: 0.22, totalCalls10m: 320, queryRate30m: 95.8, avgResponseTime30m: 480, errorRate30m: 0.18, totalCalls30m: 960, queryRateMonth: 95.0, avgResponseTimeMonth: 500, errorRateMonth: 0.20, totalCallsMonth: 28800, queryRateYear: 94.8, avgResponseTimeYear: 505, errorRateYear: 0.205, totalCallsYear: 345600, status: 'error', alertEnabled: true, alertPhones: '13800138010', rules: [{ timeWindow: '10m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }, { timeWindow: '30m', queryRateThreshold: 95, responseTimeThreshold: 500, errorRateThreshold: 1 }] },
  ])

  // 告警记录（10条，不分级别，增加关联产品ID）
  const [alertData] = useState<AlertItem[]>([
    { id: '1', time: '2024-02-01 14:32:15', interfaceId: 'API003', interfaceName: '社保信息查询', relatedProductId: 'PRD003', type: 'queryRate', typeName: '查得率过低', level: 'error', message: '查得率85.2%，低于阈值95%', timeWindow: '10m', value: 85.2, threshold: 95 },
    { id: '2', time: '2024-02-01 14:31:20', interfaceId: 'API003', interfaceName: '社保信息查询', relatedProductId: 'PRD003', type: 'responseTime', typeName: '响应超时', level: 'error', message: '平均响应820ms，超过阈值500ms', timeWindow: '10m', value: 820, threshold: 500 },
    { id: '3', time: '2024-02-01 14:30:45', interfaceId: 'API003', interfaceName: '社保信息查询', relatedProductId: 'PRD003', type: 'errorRate', typeName: '报错率过高', level: 'error', message: '报错率0.68%，超过阈值1%', timeWindow: '10m', value: 0.68, threshold: 1 },
    { id: '4', time: '2024-02-01 14:28:10', interfaceId: 'API002', interfaceName: '行政处罚查询', relatedProductId: 'PRD002', type: 'responseTime', typeName: '响应超时', level: 'error', message: '平均响应450ms，超过阈值500ms', timeWindow: '30m', value: 450, threshold: 500 },
    { id: '5', time: '2024-02-01 14:25:33', interfaceId: 'API003', interfaceName: '社保信息查询', relatedProductId: 'PRD003', type: 'queryRate', typeName: '查得率过低', level: 'error', message: '查得率88.5%，低于阈值95%', timeWindow: '30m', value: 88.5, threshold: 95 },
    { id: '6', time: '2024-02-01 14:22:18', interfaceId: 'API002', interfaceName: '行政处罚查询', relatedProductId: 'PRD002', type: 'errorRate', typeName: '报错率过高', level: 'error', message: '报错率0.12%，超过阈值1%', timeWindow: '30m', value: 0.12, threshold: 1 },
    { id: '7', time: '2024-02-01 14:20:45', interfaceId: 'API003', interfaceName: '社保信息查询', relatedProductId: 'PRD003', type: 'errorRate', typeName: '报错率过高', level: 'error', message: '报错率0.48%，超过阈值1%', timeWindow: '30m', value: 0.48, threshold: 1 },
    { id: '8', time: '2024-02-01 14:18:30', interfaceId: 'API003', interfaceName: '社保信息查询', relatedProductId: 'PRD003', type: 'responseTime', typeName: '响应超时', level: 'error', message: '平均响应680ms，超过阈值500ms', timeWindow: '30m', value: 680, threshold: 500 },
    { id: '9', time: '2024-02-01 14:15:22', interfaceId: 'API001', interfaceName: '企业信用查询', relatedProductId: 'PRD001', type: 'queryRate', typeName: '查得率过低', level: 'error', message: '查得率94.5%，低于阈值95%', timeWindow: '10m', value: 94.5, threshold: 95 },
    { id: '10', time: '2024-02-01 14:12:08', interfaceId: 'API005', interfaceName: '纳税信用查询', relatedProductId: 'PRD005', type: 'responseTime', typeName: '响应超时', level: 'error', message: '平均响应520ms，超过阈值500ms', timeWindow: '10m', value: 520, threshold: 500 },
  ])

  // 弹窗状态
  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false)
  const [currentInterface, setCurrentInterface] = useState<InterfaceMonitorItem | null>(null)
  const [configForm] = Form.useForm()
  
  // 查询栏状态
  const [searchForm] = Form.useForm()
  const [filterInterfaceName, setFilterInterfaceName] = useState('')
  const [filterInterfaceId, setFilterInterfaceId] = useState('')

  // 筛选后的数据
  const filteredData = useMemo(() => {
    return data.filter(record => {
      if (filterInterfaceName && !record.interfaceName.includes(filterInterfaceName)) return false
      if (filterInterfaceId && !record.interfaceId.toLowerCase().includes(filterInterfaceId.toLowerCase())) return false
      return true
    })
  }, [data, filterInterfaceName, filterInterfaceId])

  // 处理查询
  const handleSearch = () => {
    const values = searchForm.getFieldsValue()
    setFilterInterfaceName(values.interfaceName || '')
    setFilterInterfaceId(values.interfaceId || '')
    message.success('查询成功')
  }

  // 处理重置
  const handleReset = () => {
    searchForm.resetFields()
    setFilterInterfaceName('')
    setFilterInterfaceId('')
    message.success('重置成功')
  }

  // 实时表格列定义（增加关联产品ID，调整列宽避免换行）
  const realtimeColumns = [
    { title: '序号', key: 'index', width: 60, align: 'center' as const, render: (_: any, __: any, index: number) => index + 1 },
    { title: '接口ID', dataIndex: 'interfaceId', width: 100 },
    { title: '接口名称', dataIndex: 'interfaceName', width: 140, ellipsis: true },
    { title: '关联产品ID', dataIndex: 'relatedProductId', width: 110 },
    { title: '查得率(10分钟)', key: 'queryRate10m', width: 125, align: 'center' as const, render: (_: any, record: InterfaceMonitorItem) => {
      const color = record.queryRate10m >= 99 ? 'success' : record.queryRate10m >= 95 ? 'warning' : 'error'
      return <Tag color={color}>{record.queryRate10m.toFixed(2)}%</Tag>
    }},
    { title: '查得率(30分钟)', key: 'queryRate30m', width: 140, align: 'center' as const, render: (_: any, record: InterfaceMonitorItem) => {
      const color = record.queryRate30m >= 99 ? 'success' : record.queryRate30m >= 95 ? 'warning' : 'error'
      return <Tag color={color}>{record.queryRate30m.toFixed(2)}%</Tag>
    }},
    { title: '平均响应(10分钟)', key: 'avgResponseTime10m', width: 150, align: 'center' as const, render: (_: any, record: InterfaceMonitorItem) => {
      let color = 'success'
      if (record.avgResponseTime10m > 5000) color = 'error'
      else if (record.avgResponseTime10m > 1000) color = 'warning'
      else if (record.avgResponseTime10m > 300) color = 'default'
      return <Tag color={color}>{record.avgResponseTime10m}ms</Tag>
    }},
    { title: '平均响应(30分钟)', key: 'avgResponseTime30m', width: 150, align: 'center' as const, render: (_: any, record: InterfaceMonitorItem) => {
      let color = 'success'
      if (record.avgResponseTime30m > 5000) color = 'error'
      else if (record.avgResponseTime30m > 1000) color = 'warning'
      else if (record.avgResponseTime30m > 300) color = 'default'
      return <Tag color={color}>{record.avgResponseTime30m}ms</Tag>
    }},
    { title: '报错率(10分钟)', key: 'errorRate10m', width: 130, align: 'center' as const, render: (_: any, record: InterfaceMonitorItem) => {
      const color = record.errorRate10m < 0.01 ? 'success' : record.errorRate10m < 0.1 ? 'warning' : 'error'
      return <Tag color={color}>{(record.errorRate10m * 100).toFixed(2)}%</Tag>
    }},
    { title: '报错率(30分钟)', key: 'errorRate30m', width: 130, align: 'center' as const, render: (_: any, record: InterfaceMonitorItem) => {
      const color = record.errorRate30m < 0.01 ? 'success' : record.errorRate30m < 0.1 ? 'warning' : 'error'
      return <Tag color={color}>{(record.errorRate30m * 100).toFixed(2)}%</Tag>
    }},
    { title: '调用次数(10分钟)', key: 'totalCalls10m', width: 140, align: 'center' as const, render: (_: any, record: InterfaceMonitorItem) => record.totalCalls10m.toLocaleString() },
    { title: '调用次数(30分钟)', key: 'totalCalls30m', width: 150, align: 'center' as const, render: (_: any, record: InterfaceMonitorItem) => record.totalCalls30m.toLocaleString() },
    { title: '预警状态', dataIndex: 'alertEnabled', width: 95, align: 'center' as const, render: (enabled: boolean) => (
      <Badge status={enabled ? 'processing' : 'default'} text={enabled ? '已开启' : '已关闭'} />
    )},
    { title: '操作', key: 'action', width: 80, fixed: 'right' as const, render: (_: any, record: InterfaceMonitorItem) => (
      <Button type="link" size="small" onClick={() => handleConfig(record)}>配置</Button>
    )},
  ]

  // 月度统计表格列定义（增加关联产品ID，最后增加统计月度）
  const monthColumns = [
    { title: '序号', key: 'index', width: 60, align: 'center' as const, render: (_: any, __: any, index: number) => index + 1 },
    { title: '接口ID', dataIndex: 'interfaceId', width: 100 },
    { title: '接口名称', dataIndex: 'interfaceName', width: 160, ellipsis: true },
    { title: '关联产品ID', dataIndex: 'relatedProductId', width: 110 },
    {
      title: '查得率',
      key: 'queryRate',
      width: 110,
      align: 'center' as const,
      render: (_: any, record: InterfaceMonitorItem) => {
        const color = record.queryRateMonth >= 99 ? 'success' : record.queryRateMonth >= 95 ? 'warning' : 'error'
        return <Tag color={color}>{record.queryRateMonth.toFixed(2)}%</Tag>
      }
    },
    {
      title: '平均响应',
      key: 'avgResponseTime',
      width: 130,
      align: 'center' as const,
      render: (_: any, record: InterfaceMonitorItem) => {
        let color = 'success'
        if (record.avgResponseTimeMonth > 5000) color = 'error'
        else if (record.avgResponseTimeMonth > 1000) color = 'warning'
        else if (record.avgResponseTimeMonth > 300) color = 'default'
        return <Tag color={color}>{record.avgResponseTimeMonth}ms</Tag>
      }
    },
    {
      title: '报错率',
      key: 'errorRate',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: InterfaceMonitorItem) => {
        const color = record.errorRateMonth < 0.01 ? 'success' : record.errorRateMonth < 0.1 ? 'warning' : 'error'
        return <Tag color={color}>{(record.errorRateMonth * 100).toFixed(2)}%</Tag>
      }
    },
    {
      title: '总调用次数',
      key: 'totalCalls',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: InterfaceMonitorItem) => record.totalCallsMonth.toLocaleString()
    },
    { title: '统计月度', key: 'statMonth', width: 100, align: 'center' as const, render: () => '2024年2月' },
  ]

  // 年度统计表格列定义（增加关联产品ID，最后增加统计年度）
  const yearColumns = [
    { title: '序号', key: 'index', width: 60, align: 'center' as const, render: (_: any, __: any, index: number) => index + 1 },
    { title: '接口ID', dataIndex: 'interfaceId', width: 100 },
    { title: '接口名称', dataIndex: 'interfaceName', width: 160, ellipsis: true },
    { title: '关联产品ID', dataIndex: 'relatedProductId', width: 110 },
    {
      title: '查得率',
      key: 'queryRate',
      width: 110,
      align: 'center' as const,
      render: (_: any, record: InterfaceMonitorItem) => {
        const color = record.queryRateYear >= 99 ? 'success' : record.queryRateYear >= 95 ? 'warning' : 'error'
        return <Tag color={color}>{record.queryRateYear.toFixed(2)}%</Tag>
      }
    },
    {
      title: '平均响应',
      key: 'avgResponseTime',
      width: 130,
      align: 'center' as const,
      render: (_: any, record: InterfaceMonitorItem) => {
        let color = 'success'
        if (record.avgResponseTimeYear > 5000) color = 'error'
        else if (record.avgResponseTimeYear > 1000) color = 'warning'
        else if (record.avgResponseTimeYear > 300) color = 'default'
        return <Tag color={color}>{record.avgResponseTimeYear}ms</Tag>
      }
    },
    {
      title: '报错率',
      key: 'errorRate',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: InterfaceMonitorItem) => {
        const color = record.errorRateYear < 0.01 ? 'success' : record.errorRateYear < 0.1 ? 'warning' : 'error'
        return <Tag color={color}>{(record.errorRateYear * 100).toFixed(2)}%</Tag>
      }
    },
    {
      title: '总调用次数',
      key: 'totalCalls',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: InterfaceMonitorItem) => record.totalCallsYear.toLocaleString()
    },
    { title: '统计年度', key: 'statYear', width: 100, align: 'center' as const, render: () => '2024年' },
  ]

  // 统计卡片数据
  const statsData = [
    { title: '接口总数', value: data.length, color: '#1890ff', icon: <ApiOutlined /> },
    { title: '正常接口', value: data.filter(item => item.status === 'normal').length, color: '#52c41a', icon: <CheckCircleOutlined /> },
    { title: '告警接口', value: data.filter(item => item.status === 'warning' || item.status === 'error').length, color: '#faad14', icon: <WarningOutlined /> },
    { title: '告警数量', value: alertData.length, color: '#f5222d', icon: <StopOutlined /> },
  ]

  const handleConfig = (record: InterfaceMonitorItem) => {
    setCurrentInterface(record)
    configForm.setFieldsValue({
      alertEnabled: record.alertEnabled,
      alertPhones: record.alertPhones,
      // 10分钟规则
      queryRateThreshold10m: record.rules[0]?.queryRateThreshold || 95,
      responseTimeThreshold10m: record.rules[0]?.responseTimeThreshold || 500,
      errorRateThreshold10m: record.rules[0]?.errorRateThreshold || 1,
      // 30分钟规则
      queryRateThreshold30m: record.rules[1]?.queryRateThreshold || 95,
      responseTimeThreshold30m: record.rules[1]?.responseTimeThreshold || 500,
      errorRateThreshold30m: record.rules[1]?.errorRateThreshold || 1,
    })
    setIsConfigModalVisible(true)
  }

  const handleConfigSubmit = () => {
    configForm.validateFields().then(values => {
      if (currentInterface) {
        setData(data.map(item =>
          item.id === currentInterface.id
            ? { 
                ...item, 
                alertEnabled: values.alertEnabled,
                alertPhones: values.alertPhones,
                rules: [
                  { 
                    timeWindow: '10m', 
                    queryRateThreshold: values.queryRateThreshold10m,
                    responseTimeThreshold: values.responseTimeThreshold10m,
                    errorRateThreshold: values.errorRateThreshold10m,
                  },
                  { 
                    timeWindow: '30m', 
                    queryRateThreshold: values.queryRateThreshold30m,
                    responseTimeThreshold: values.responseTimeThreshold30m,
                    errorRateThreshold: values.errorRateThreshold30m,
                  },
                ]
              }
            : item
        ))
        message.success('预警配置保存成功')
        setIsConfigModalVisible(false)
      }
    })
  }

  // 告警查询状态
  const [alertSearchForm] = Form.useForm()
  const [filterAlertInterfaceId, setFilterAlertInterfaceId] = useState('')
  const [filterAlertInterface, setFilterAlertInterface] = useState('')
  const [filterAlertType, setFilterAlertType] = useState('')
  const [filterAlertTimeWindow, setFilterAlertTimeWindow] = useState('')

  // 筛选后的告警数据
  const filteredAlertData = useMemo(() => {
    return alertData.filter(alert => {
      if (filterAlertInterfaceId && !alert.interfaceId.toLowerCase().includes(filterAlertInterfaceId.toLowerCase())) return false
      if (filterAlertInterface && !alert.interfaceName.includes(filterAlertInterface)) return false
      if (filterAlertType && alert.type !== filterAlertType) return false
      if (filterAlertTimeWindow && alert.timeWindow !== filterAlertTimeWindow) return false
      return true
    })
  }, [alertData, filterAlertInterfaceId, filterAlertInterface, filterAlertType, filterAlertTimeWindow])

  // 告警表格列定义
  const alertColumns = [
    { title: '告警时间', dataIndex: 'time', width: 160 },
    { title: '时间窗口', dataIndex: 'timeWindow', width: 100, align: 'center' as const, render: (text: string) => (
      <Tag color={text === '10m' ? 'blue' : 'purple'}>
        {text === '10m' ? '10分钟' : '30分钟'}
      </Tag>
    )},
    { title: '接口ID', dataIndex: 'interfaceId', width: 110 },
    { title: '接口名称', dataIndex: 'interfaceName', width: 140, ellipsis: true },
    { title: '关联产品ID', dataIndex: 'relatedProductId', width: 110, align: 'center' as const },
    { title: '告警类型', dataIndex: 'typeName', width: 120, render: (text: string) => (
      <Tag color="error">{text}</Tag>
    )},
    { title: '告警详情', dataIndex: 'message', width: 240, ellipsis: true },
    { title: '当前值', key: 'value', width: 100, align: 'center' as const, render: (_: any, record: AlertItem) => (
      <Text type="danger" strong>
        {record.type === 'responseTime' ? `${record.value}ms` : `${record.value}%`}
      </Text>
    )},
    { title: '阈值', key: 'threshold', width: 100, align: 'center' as const, render: (_: any, record: AlertItem) => (
      <Text type="secondary">
        {record.type === 'responseTime' ? `${record.threshold}ms` : `${record.threshold}%`}
      </Text>
    )},
  ]

  // 告警查询表单字段（告警时间改为RangePicker）
  const alertSearchFields = [
    { name: 'interfaceId', label: '接口ID', component: <Input placeholder="请输入接口ID" allowClear /> },
    { name: 'interfaceName', label: '接口名称', component: <Input placeholder="请输入接口名称" allowClear /> },
    { name: 'alertType', label: '告警类型', component: (
      <Select placeholder="请选择告警类型" allowClear>
        <Option value="queryRate">查得率过低</Option>
        <Option value="responseTime">响应超时</Option>
        <Option value="errorRate">报错率过高</Option>
      </Select>
    )},
    { name: 'alertTime', label: '告警时间', component: (
      <DatePicker.RangePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder={['开始时间', '结束时间']} />
    )},
  ]

  // 处理告警查询
  const handleAlertSearch = () => {
    const values = alertSearchForm.getFieldsValue()
    setFilterAlertInterfaceId(values.interfaceId || '')
    setFilterAlertInterface(values.interfaceName || '')
    setFilterAlertType(values.alertType || '')
    setFilterAlertTimeWindow(values.timeWindow || '')
    message.success('查询成功')
  }

  // 处理告警重置
  const handleAlertReset = () => {
    alertSearchForm.resetFields()
    setFilterAlertInterfaceId('')
    setFilterAlertInterface('')
    setFilterAlertType('')
    setFilterAlertTimeWindow('')
    message.success('重置成功')
  }

  // 处理告警导出
  const handleAlertExport = () => {
    message.success('导出成功')
  }

  // 查询表单字段（接口列表）- 删除健康状态
  const searchFields = [
    { name: 'interfaceId', label: '接口ID', component: <Input placeholder="请输入接口ID" allowClear /> },
    { name: 'interfaceName', label: '接口名称', component: <Input placeholder="请输入接口名称" allowClear /> },
  ]



  return (
    <div className="interface-quality">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {statsData.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <div>
                <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>{stat.title}</div>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: stat.color }}>
                  {stat.icon && <span style={{ marginRight: 8 }}>{stat.icon}</span>}
                  {stat.value}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 实时告警 */}
      <Card 
        title="实时告警" 
        style={{ marginBottom: 16 }}
      >
        {/* 告警查询栏 - 4个查询项，无展开收起 */}
        <Form form={alertSearchForm} style={{ marginBottom: 16 }}>
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
              </Space>
            </Col>
          </Row>
        </Form>

        {/* 告警数据表格 */}
        <Table
          columns={alertColumns}
          dataSource={filteredAlertData}
          rowKey="id"
          size="small"
          scroll={{ x: 1000 }}
          pagination={{ 
            pageSize: 5, 
            showSizeChanger: true, 
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['5', '10', '20', '50']
          }}
          locale={{ emptyText: <Empty description="暂无告警信息" /> }}
        />
      </Card>

      {/* 接口质量监控Tab页 */}
      <Card 
        title="接口质量监控"
        extra={
          <Space>
            <Button 
              type={activeTab === 'realtime' ? 'primary' : 'default'}
              onClick={() => setActiveTab('realtime')}
            >
              实时统计
            </Button>
            <Button 
              type={activeTab === 'month' ? 'primary' : 'default'}
              onClick={() => setActiveTab('month')}
            >
              月度统计
            </Button>
            <Button 
              type={activeTab === 'year' ? 'primary' : 'default'}
              onClick={() => setActiveTab('year')}
            >
              年度统计
            </Button>
          </Space>
        }
      >
        {/* 查询栏 */}
        <Form form={searchForm} style={{ marginBottom: 16 }}>
          <Row gutter={24}>
            {searchFields.map((field, index) => (
              <Col span={8} key={index}>
                <Form.Item name={field.name} label={field.label} style={{ marginBottom: 12 }}>
                  {field.component}
                </Form.Item>
              </Col>
            ))}
          </Row>
          <Row gutter={24} align="middle">
            <Col span={24} style={{ textAlign: 'right', paddingRight: 8 }}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
                <Button icon={<ExportOutlined />} onClick={() => message.success('导出成功')}>导出</Button>
              </Space>
            </Col>
          </Row>
        </Form>
        
        {/* 数据表格 */}
        <Table
          columns={activeTab === 'realtime' ? realtimeColumns : activeTab === 'month' ? monthColumns : yearColumns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: activeTab === 'realtime' ? 1500 : 1050 }}
          pagination={{ showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      {/* 预警配置弹窗 */}
      <Modal
        title={`预警配置 - ${currentInterface?.interfaceName}`}
        open={isConfigModalVisible}
        onOk={handleConfigSubmit}
        onCancel={() => setIsConfigModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={configForm} layout="vertical">
          <Alert
            message="监控规则说明"
            description="分别为近10分钟（检测短期突发问题）和近30分钟（检测持续性问题）配置独立的监控阈值。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Card size="small" title="近10分钟监控规则" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="queryRateThreshold10m"
                  label="查得率阈值(%)"
                  rules={[{ required: true, message: '请输入' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={0} max={100} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="responseTimeThreshold10m"
                  label="响应时间阈值(ms)"
                  rules={[{ required: true, message: '请输入' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={100} max={10000} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="errorRateThreshold10m"
                  label="报错率阈值(%)"
                  rules={[{ required: true, message: '请输入' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={0} max={100} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card size="small" title="近30分钟监控规则" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="queryRateThreshold30m"
                  label="查得率阈值(%)"
                  rules={[{ required: true, message: '请输入' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={0} max={100} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="responseTimeThreshold30m"
                  label="响应时间阈值(ms)"
                  rules={[{ required: true, message: '请输入' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={100} max={10000} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="errorRateThreshold30m"
                  label="报错率阈值(%)"
                  rules={[{ required: true, message: '请输入' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={0} max={100} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

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
    </div>
  )
}

export default InterfaceQuality
