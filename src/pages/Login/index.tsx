import { useState, useEffect } from 'react'
import { Form, Input, Button, message } from 'antd'
import { MobileOutlined, LockOutlined, SafetyOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './style.css'

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [captcha, setCaptcha] = useState('')
  const [smsLoading, setSmsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // 生成随机验证码
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
    let result = ''
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptcha(result)
  }

  // 初始化验证码
  useEffect(() => {
    generateCaptcha()
  }, [])

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // 发送短信验证码
  const handleSendSms = () => {
    setSmsLoading(true)
    // 模拟发送短信
    setTimeout(() => {
      message.success('短信验证码已发送')
      setSmsLoading(false)
      setCountdown(60)
    }, 1000)
  }

  const onFinish = (_values: any) => {
    console.log('登录表单提交')
    setLoading(true)
    // 模拟登录请求 - 不校验账号密码和验证码
    setTimeout(() => {
      message.success('登录成功')
      // 设置token到localStorage，用于认证检查
      const token = 'mock-login-token-' + Date.now()
      console.log('设置token到localStorage:', token)
      localStorage.setItem('token', token)
      console.log('导航到/main')
      navigate('/main')
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <img src={`${import.meta.env?.BASE_URL || ''}images/login_bg@2x.png`} alt="" />
      </div>
      
      <div className="login-container">
        <div className="login-logo">
          <img src={`${import.meta.env?.BASE_URL || ''}images/logo.png`} alt="logo" />
          <h1>数据资产管理平台</h1>
        </div>
        
        <div className="login-box">
          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="phone"
            >
              <Input
                prefix={<MobileOutlined />}
                placeholder="请输入手机号"
              />
            </Form.Item>

            <Form.Item
              name="password"
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
              />
            </Form.Item>

            <Form.Item
              name="captcha"
            >
              <div className="captcha-row">
                <Input
                  prefix={<SafetyOutlined />}
                  placeholder="请输入图形验证码"
                  className="captcha-input"
                />
                <div 
                  className="captcha-code" 
                  onClick={generateCaptcha}
                  title="点击刷新"
                >
                  {captcha || 'ABCD'}
                </div>
              </div>
            </Form.Item>

            <Form.Item
              name="smsCode"
            >
              <div className="sms-captcha-row">
                <Input
                  prefix={<MailOutlined />}
                  placeholder="请输入短信验证码"
                  className="sms-captcha-input"
                />
                <Button
                  type="primary"
                  loading={smsLoading}
                  disabled={countdown > 0}
                  onClick={handleSendSms}
                  className="sms-captcha-btn"
                >
                  {countdown > 0 ? `${countdown}秒后重发` : '获取验证码'}
                </Button>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="login-btn"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      
      <div className="login-footer">
        <p>版权所有@2021深圳征信服务有限公司版权所有粤ICP备2021095883号</p>
      </div>
    </div>
  )
}

export default Login
