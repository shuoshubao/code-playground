import React, { useRef, useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Button, Select, Input, Divider, Card, Row, Col, Tag, Empty, message } from 'antd'
import axios from 'axios'
import * as monaco from 'monaco-editor'
import { StorageKey, StyleLanguages, ScriptLanguages, initialValues, MonacoEditorConfig } from './config'

const { TextArea } = Input

if (!window.localStorage.getItem(StorageKey)) {
  window.localStorage.setItem(StorageKey, JSON.stringify(initialValues))
}

const App = () => {
  const cssRef = React.useRef()
  const jsRef = React.useRef()

  const [loading, setLoading] = useState(false)

  const [execData, setExecData] = useState({
    code: 0,
    timestap: 0,
    webpackTime: 0,
    installPkgsTime: 0,
    filePath: ''
    // filePath: 'http://localhost:8080/e368b9938746fa090d6afd3628355133/'
  })

  const [formData, setFormData] = useState(JSON.parse(window.localStorage.getItem(StorageKey)))

  useEffect(() => {
    const cssEditor = monaco.editor.create(cssRef.current, {
      language: 'css',
      ...MonacoEditorConfig,
      value: formData.styleCode
    })
    cssEditor.getModel().onDidChangeContent(() => {
      const value = cssEditor.getValue()
      handleChange('styleCode', value)
    })
    const jsEditor = monaco.editor.create(jsRef.current, {
      language: 'javascript',
      ...MonacoEditorConfig,
      value: formData.scriptCode
    })
    jsEditor.getModel().onDidChangeContent(() => {
      const value = jsEditor.getValue()
      handleChange('scriptCode', value)
    })
  }, [cssRef, jsRef])

  const handleChange = (key, value) => {
    const newData = { ...formData, [key]: value }
    setFormData(newData)
    window.localStorage.setItem(StorageKey, JSON.stringify(newData))
  }

  const handleSubmit = async () => {
    setLoading(true)
    const { data } = await axios.post('/code', formData)
    if (data.code) {
      message.error(data.message)
    } else {
      setExecData(data)
    }
    setLoading(false)
  }

  const iframeHeight = `calc(100vh - ${20 + 50 + 12 * 2}px)`

  return (
    <div style={{ padding: 10 }}>
      <Row>
        <Col style={{ width: 500 }}>
          <Card
            title={
              <Select
                value={formData.styleLanguage}
                onChange={value => {
                  handleChange('styleLanguage', value)
                }}
                options={StyleLanguages}
                style={{ width: 120 }}
              />
            }
            size="small"
          >
            <div ref={cssRef} style={{ height: 200 }} />
          </Card>
          <Card
            title={
              <Select
                value={formData.scriptLanguage}
                onChange={value => {
                  handleChange('scriptLanguage', value)
                }}
                options={ScriptLanguages}
                style={{ width: 120 }}
              />
            }
            size="small"
          >
            <div ref={jsRef} style={{ height: `calc(100vh - ${20 + 50 * 2 + 12 * 4 + 200}px)` }} />
          </Card>
        </Col>
        <Col style={{ width: 'calc(100% - 500px)', paddingLeft: 10 }}>
          <Card
            title={
              <Button onClick={handleSubmit} loading={loading} type="primary">
                运行
              </Button>
            }
            extra={
              <>
                {!!execData.installPkgsTime && <Tag color="success">npm install: {execData.installPkgsTime}ms</Tag>}
                {!!execData.webpackTime && <Tag color="success">webpack compile: {execData.webpackTime}ms</Tag>}
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
