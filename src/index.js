import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { Button, Select, Input, Divider, Card, Row, Col, Tag, Empty, message } from 'antd'
import axios from 'axios'

const { TextArea } = Input

const StyleLanguages = [
  { label: 'css', value: 'css' },
  { label: 'less', value: 'less' },
  { label: 'scss', value: 'scss' }
]

const ScriptLanguages = [
  {
    label: 'JavaScript',
    value: 'javascript'
  }
]

const initialValues = {
  filename: 'demo1',
  styleLanguage: 'css',
  scriptLanguage: 'javascript',
  styleCode: `
body {
    padding: 10px;
}
`,
  scriptCode: `
import React, { useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { Button, message } from 'antd'

const App = () => {
    const [count, setCount] = useState(0);

    const handleClick = useCallback(() => {
      setCount(count + 1);
      message.info('clicked');
    }, [count]);

    return <Button type="primary" onClick={handleClick}>click me {count}</Button>;
};

ReactDOM.render(<App />, document.querySelector('#app'));
`.trim()
}

const App = () => {
  const [loading, setLoading] = useState(false)

  const [execData, setExecData] = useState({
    code: 0,
    timestap: 0,
    webpackTime: 0,
    installPkgsTime: 0,
    filePath: ''
    // filePath: 'http://localhost:8080/e368b9938746fa090d6afd3628355133/'
  })

  const [formData, setFormData] = useState({
    ...initialValues
  })

  const handleChange = values => {
    setFormData({ ...formData, ...values })
  }

  const handleSubmit = async () => {
    setLoading(true)
    const { data } = await axios.post('/code', formData)
    if (data.code) {
      message.error(data.message)
    } else {
      setExecData(data)
    }
    console.log(222)
    console.log(data)
    setLoading(false)
  }

  const iframeHeight = `calc(100vh - ${20 + 50 + 12 * 2}px)`

  return (
    <div style={{ padding: 10 }}>
      <Row gutter={[10, 10]}>
        <Col span={8}>
          <Card
            title={
              <Select
                value={formData.styleLanguage}
                onChange={value => {
                  handleChange({ styleLanguage: value })
                }}
                options={StyleLanguages}
                style={{ width: 120 }}
              />
            }
            size="small"
          >
            <TextArea
              style={{ height: 200 }}
              value={formData.styleCode.trim()}
              onChange={e => {
                handleChange({ styleCode: e.target.value })
              }}
            />
          </Card>
          <Card
            title={
              <Select
                value={formData.scriptLanguage}
                onChange={value => {
                  handleChange({ scriptLanguage: value })
                }}
                options={ScriptLanguages}
                style={{ width: 120 }}
              />
            }
            size="small"
          >
            <TextArea
              style={{ height: `calc(100vh - ${20 + 50 * 2 + 12 * 4 + 200}px)` }}
              value={formData.scriptCode.trim()}
              onChange={e => {
                handleChange({ scriptCode: e.target.value })
              }}
            />
          </Card>
        </Col>
        <Col span={16}>
          <Card
            title={
              <Button onClick={handleSubmit} loading={loading} type="primary">
                运行
              </Button>
            }
            extra={
              <>
                {!!execData.installPkgsTime && <Tag color="#f50">npm install 时间: {execData.installPkgsTime}ms</Tag>}
                {!!execData.webpackTime && <Tag color="#87d068">webpack 运行时间: {execData.webpackTime}ms</Tag>}
                {!!execData.filePath && (
                  <Button type="primary" href={execData.filePath} target="_blank">
                    新标签预览
                  </Button>
                )}
              </>
            }
            size="small"
          >
            {execData.filePath ? (
              <iframe
                key={execData.timestap}
                style={{
                  display: 'block',
                  border: 'none',
                  width: '100%',
                  height: iframeHeight
                }}
                src={execData.filePath}
              />
            ) : (
              <div style={{ height: iframeHeight }}>
                <Empty
                  description="你还没执行过代码呢"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ margin: 0, padding: '32px 0' }}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

ReactDOM.render(
  <>
    <App />
  </>,
  document.querySelector('#app')
)
