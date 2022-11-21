import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { Button, Select, Input, Divider, Card, Row, Col, Tag, message } from 'antd'
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
  styleCode: '',
  scriptLanguage: 'javascript',
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

  const [runData, setRunData] = useState({
    code: 0,
    timestap: 0,
    webpackTime: 0,
    installPkgsTime: 0,
    filePath: ''
  })

  const [formData, setFormData] = useState({
    ...initialValues
  })

  const handleChange = values => {
    setFormData({ ...formData, ...values })
  }

  const handleSubmit = async () => {
    setLoading(true)
    console.log(111)
    console.log(formData)
    const { data } = await axios.post('/code', formData)
    if (data.code) {
      message.error(data.message)
    } else {
      setRunData(data)
    }
    console.log(222)
    console.log(data)
    setLoading(false)
  }

  return (
    <div style={{ padding: 10 }}>
      <Row>
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
              rows={10}
              value={formData.styleCode}
              onChange={e => {
                handleChange({ styleCode: e.target.value })
              }}
            />
          </Card>
        </Col>
        <Col
          span={16}
          style={{
            marginLeft: -1,
            marginRight: -1
          }}
        >
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
            extra={
              <Button onClick={handleSubmit} loading={loading} type="primary" style={{ width: '100%' }}>
                运行
              </Button>
            }
            size="small"
          >
            <TextArea
              rows={10}
              value={formData.scriptCode}
              onChange={e => {
                handleChange({ scriptCode: e.target.value })
              }}
            />
          </Card>
        </Col>
      </Row>
      {runData.filePath && (
        <Card
          title={
            <>
              {!!runData.installPkgsTime && <Tag color="#f50">npm install 时间: {runData.installPkgsTime}ms</Tag>}
              <Tag color="#87d068">webpack 运行时间: {runData.webpackTime}ms</Tag>
            </>
          }
          size="small"
          style={{ marginTop: 10 }}
        >
          <iframe
            key={runData.timestap}
            width="100%"
            height="400px"
            style={{ border: 'none' }}
            src={runData.filePath}
          />
        </Card>
      )}
    </div>
  )
}

ReactDOM.render(
  <>
    <App />
  </>,
  document.querySelector('#app')
)
