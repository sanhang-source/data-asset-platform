import { useState } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Row, Col, Upload } from 'antd'
import { PlusOutlined, SearchOutlined, ReloadOutlined, ExportOutlined, EditOutlined, DeleteOutlined, DownOutlined, UpOutlined, DatabaseOutlined, UploadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Option } = Select

interface AssetItem {
  id: string
  assetId: string
  assetName: string
  assetNameEn: string
  assetCategory: string
  assetForm: string
  fieldCount: number
  dataVolume: number
  serviceStatus: '未服务' | '已服务'
  serviceCount: number
  description?: string
}

const AssetCatalog = () => {
  const navigate = useNavigate()
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [isFieldModalVisible, setIsFieldModalVisible] = useState(false)
  const [isImportModalVisible, setIsImportModalVisible] = useState(false)
  const [currentAsset, setCurrentAsset] = useState<AssetItem | null>(null)
  const [searchForm] = Form.useForm()
  const [searchExpanded, setSearchExpanded] = useState(false)

  const [data, setData] = useState<AssetItem[]>([
    { id: '1', assetId: 'AST001', assetName: '企业信用评分数据集', assetNameEn: 'Enterprise Credit Score Dataset', assetCategory: '信用评价', assetForm: '产品表', fieldCount: 15, dataVolume: 1200000, serviceStatus: '已服务', serviceCount: 3, description: '' },
    { id: '2', assetId: 'AST002', assetName: '行政处罚记录', assetNameEn: 'Administrative Penalty Record', assetCategory: '行政处罚', assetForm: '接口', fieldCount: 12, dataVolume: 800000, serviceStatus: '已服务', serviceCount: 2, description: '' },
    { id: '3', assetId: 'AST003', assetName: '社保缴纳信息', assetNameEn: 'Social Security Payment Info', assetCategory: '社保信息', assetForm: '产品表', fieldCount: 20, dataVolume: 2500000, serviceStatus: '未服务', serviceCount: 0, description: '' },
    { id: '4', assetId: 'AST004', assetName: '工商注册信息', assetNameEn: 'Business Registration Info', assetCategory: '工商信息', assetForm: '接口', fieldCount: 25, dataVolume: 3100000, serviceStatus: '已服务', serviceCount: 4, description: '' },
    { id: '5', assetId: 'AST005', assetName: '企业纳税信用等级', assetNameEn: 'Enterprise Tax Credit Rating', assetCategory: '信用评价', assetForm: '产品表', fieldCount: 8, dataVolume: 500000, serviceStatus: '未服务', serviceCount: 0, description: '' },
    { id: '6', assetId: 'AST006', assetName: '法律诉讼信息', assetNameEn: 'Legal Litigation Info', assetCategory: '风险预警', assetForm: '接口', fieldCount: 18, dataVolume: 950000, serviceStatus: '已服务', serviceCount: 2, description: '' },
    { id: '7', assetId: 'AST007', assetName: '知识产权信息', assetNameEn: 'Intellectual Property Info', assetCategory: '企业信息', assetForm: '产品表', fieldCount: 22, dataVolume: 1800000, serviceStatus: '已服务', serviceCount: 3, description: '' },
    { id: '8', assetId: 'AST008', assetName: '企业经营异常', assetNameEn: 'Enterprise Abnormal Operation', assetCategory: '风险预警', assetForm: '接口', fieldCount: 10, dataVolume: 420000, serviceStatus: '未服务', serviceCount: 0, description: '' },
    { id: '9', assetId: 'AST009', assetName: '股东出资信息', assetNameEn: 'Shareholder Investment Info', assetCategory: '企业信息', assetForm: '产品表', fieldCount: 14, dataVolume: 680000, serviceStatus: '已服务', serviceCount: 2, description: '' },
    { id: '10', assetId: 'AST010', assetName: '企业年报信息', assetNameEn: 'Enterprise Annual Report', assetCategory: '企业信息', assetForm: '接口', fieldCount: 30, dataVolume: 2200000, serviceStatus: '已服务', serviceCount: 5, description: '' },
  ])

  // 模拟字段数据
  const fieldData = [
    { id: '1', fieldCn: '企业类型', fieldEn: 'econKind', fieldType: 'String', dataLevel: '1级—无损害' },
    { id: '2', fieldCn: '注册资本', fieldEn: 'registCapi', fieldType: 'String', dataLevel: '1级—无损害' },
    { id: '3', fieldCn: '企业标签', fieldEn: 'tags', fieldType: 'Array', dataLevel: '1级—无损害' },
    { id: '4', fieldCn: '所属工商局', fieldEn: 'belongOrg', fieldType: 'String', dataLevel: '1级—无损害' },
    { id: '5', fieldCn: '经营状态', fieldEn: 'status', fieldType: 'String', dataLevel: '1级—无损害' },
  ]

  const fieldColumns = [
    { title: '序号', key: 'index', width: 60, align: 'center' as const, render: (_: any, __: any, index: number) => index + 1 },
    { title: '字段中文名', dataIndex: 'fieldCn', width: 150 },
    { title: '字段英文名', dataIndex: 'fieldEn', width: 150 },
    { title: '字段类型', dataIndex: 'fieldType', width: 100, align: 'center' as const },
    { title: '数据分级', dataIndex: 'dataLevel', width: 120, align: 'center' as const }
  ]

  const columns = [
    { title: '序号', key: 'index', width: 60, align: 'center' as const, render: (_: any, __: any, index: number) => index + 1 },
    { title: '数据资产ID', dataIndex: 'assetId', width: 120, render: (text: string) => text || '-' },
    { title: '数据资产中文名', dataIndex: 'assetName', width: 180, ellipsis: true, render: (text: string) => text || '-' },
    { title: '数据资产英文名', dataIndex: 'assetNameEn', width: 200, ellipsis: true, render: (text: string) => text || '-' },
    { title: '数据资产分类', dataIndex: 'assetCategory', width: 120, render: (text: string) => text ? <Tag>{text}</Tag> : '-' },
    { title: '数据资产形态', dataIndex: 'assetForm', width: 120, render: (text: string) => text ? <Tag color="processing">{text}</Tag> : '-' },
    { 
      title: '字段数', 
      dataIndex: 'fieldCount', 
      width: 80, 
      align: 'center' as const,
      render: (count: number, record: AssetItem) => (
        <Button type="link" size="small" onClick={() => handleFieldClick(record)}>
          {count || 0}
        </Button>
      )
    },
    { 
      title: '数据总量', 
      dataIndex: 'dataVolume', 
      width: 120, 
      render: (volume: number) => volume ? volume.toLocaleString() : '-'
    },
    { 
      title: '服务产品状态', 
      dataIndex: 'serviceStatus', 
      width: 120,
      render: (status: string) => (
        status ? <Tag color={status === '已服务' ? 'success' : 'default'}>{status}</Tag> : '-'
      )
    },
    { title: '服务产品数量', dataIndex: 'serviceCount', width: 120, align: 'center' as const, render: (text: number) => text ?? '-' },
    { title: '数据资产说明', dataIndex: 'description', width: 200, ellipsis: true, render: (text: string) => text || '-' },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right' as const,
      render: (_: any, record: AssetItem) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" icon={<DatabaseOutlined />} onClick={() => handleFieldManage(record)}>字段管理</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      )
    },
  ]

  const handleSearch = () => {
    message.success('查询成功')
  }

  const handleReset = () => {
    searchForm.resetFields()
    message.success('重置成功')
  }

  const handleAdd = () => {
    navigate('/main/data-asset/add')
  }

  const handleEdit = (record: AssetItem) => {
    navigate(`/main/data-asset/edit/${record.id}`)
  }

  const handleFieldManage = (record: AssetItem) => {
    navigate(`/main/data-asset/fields/${record.id}`)
  }

  const handleFieldClick = (record: AssetItem) => {
    setCurrentAsset(record)
    setIsFieldModalVisible(true)
  }

  const handleDelete = (record: AssetItem) => {
    setCurrentAsset(record)
    setIsDeleteModalVisible(true)
  }

  const handleDeleteConfirm = () => {
    if (currentAsset) {
      setData(data.filter(item => item.id !== currentAsset.id))
      message.success('删除成功')
      setIsDeleteModalVisible(false)
    }
  }

  const handleExport = () => {
    message.success('导出成功')
  }

  const handleImport = () => {
    setIsImportModalVisible(true)
  }

  const handleImportOk = () => {
    message.success('导入成功')
    setIsImportModalVisible(false)
  }

  // 统计卡片数据
  const statsData = [
    { title: '资产总数（项）', value: data.length, color: '#1890ff' },
    { title: '数据字段（个）', value: data.reduce((sum, item) => sum + item.fieldCount, 0), color: '#52c41a' },
    { title: '数据总量（条）', value: data.reduce((sum, item) => sum + item.dataVolume, 0).toLocaleString(), color: '#fa8c16' },
    { title: '服务产品（个）', value: data.reduce((sum, item) => sum + item.serviceCount, 0), color: '#722ed1' },
  ]

  // 查询表单内容
  const searchFields = [
    { name: 'assetName', label: '数据资产中文名', component: <Input placeholder="请输入数据资产中文名" allowClear /> },
    { name: 'assetNameEn', label: '数据资产英文名', component: <Input placeholder="请输入数据资产英文名" allowClear /> },
    { name: 'assetCategory', label: '数据资产分类', component: (
      <Select placeholder="请选择资产分类" allowClear>
        <Option value="行政处罚">行政处罚</Option>
        <Option value="社保信息">社保信息</Option>
        <Option value="工商信息">工商信息</Option>
        <Option value="信用评价">信用评价</Option>
        <Option value="风险预警">风险预警</Option>
        <Option value="企业信息">企业信息</Option>
      </Select>
    )},
    { name: 'assetForm', label: '数据资产形态', component: (
      <Select placeholder="请选择资产形态" allowClear>
        <Option value="产品表">产品表</Option>
        <Option value="接口">接口</Option>
      </Select>
    )},
    { name: 'serviceStatus', label: '服务产品状态', component: (
      <Select placeholder="请选择服务状态" allowClear>
        <Option value="未服务">未服务</Option>
        <Option value="已服务">已服务</Option>
      </Select>
    )},
  ]

  const visibleSearchFields = searchExpanded ? searchFields : searchFields.slice(0, 3)

  return (
    <div className="asset-catalog">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {statsData.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <div>
                <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>{stat.title}</div>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 查询栏 */}
      <Card className="search-card" style={{ marginBottom: 16 }}>
        <Form form={searchForm}>
          <Row gutter={24}>
            {visibleSearchFields.map((field, index) => (
              <Col span={8} key={index}>
                <Form.Item name={field.name} label={field.label} style={{ marginBottom: 16 }}>
                  {field.component}
                </Form.Item>
              </Col>
            ))}
          </Row>
          <Row gutter={24} align="middle">
            <Col span={24} style={{ textAlign: 'right', paddingRight: 8 }}>
              <Space>
                <Button type="link" onClick={() => setSearchExpanded(!searchExpanded)}>
                  {searchExpanded ? <><UpOutlined /> 收起</> : <><DownOutlined /> 展开</>}
                </Button>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 数据表格 */}
      <Card
        title="数据资产目录"
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button>
            <Button icon={<UploadOutlined />} onClick={handleImport}>导入</Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          scroll={{ x: 1500 }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 字段信息弹窗 */}
      <Modal
        title="字段信息"
        open={isFieldModalVisible}
        onCancel={() => setIsFieldModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsFieldModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {currentAsset && (
          <div style={{ marginBottom: 16 }}>
            <p><strong>数据资产中文名：</strong>{currentAsset.assetName}</p>
            <p><strong>数据资产英文名：</strong>{currentAsset.assetNameEn}</p>
          </div>
        )}
        <Table
          columns={fieldColumns}
          dataSource={fieldData}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Modal>

      {/* 导入弹窗 */}
      <Modal
        title="导入数据资产"
        open={isImportModalVisible}
        onOk={handleImportOk}
        onCancel={() => setIsImportModalVisible(false)}
        width={500}
        okText="提交"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: '13px', color: '#666' }}>
            1. <a href="#" onClick={(e) => { e.preventDefault(); message.success('模板下载成功') }}>下载模板</a>，请根据模板的格式填写信息；
          </p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            2. 上传文件不超过5M，仅支持上传xls、xlsx格式的文件。
          </p>
        </div>
        <Upload.Dragger
          name="file"
          multiple={false}
          accept=".xls,.xlsx"
          beforeUpload={() => false}
          style={{ padding: 20 }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或将文件拖拽到此处上传</p>
        </Upload.Dragger>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal
        title="提示"
        open={isDeleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={400}
      >
        <p>是否确认删除资产"{currentAsset?.assetName}"？</p>
      </Modal>
    </div>
  )
}

export default AssetCatalog
