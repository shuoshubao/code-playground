export const StorageKey = 'CodePlayground'

export const StyleLanguages = [
  { label: 'css', value: 'css' },
  { label: 'less', value: 'less' },
  { label: 'sass', value: 'sass' }
]

export const ScriptLanguages = [
  {
    label: 'JavaScript',
    value: 'javascript'
  }
]

export const initialValues = {
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
`
}

export const MonacoEditorConfig = {
  theme: 'vs-dark',
  automaticLayout: true,
  scrollbar: {
    horizontal: 'hidden',
    verticalScrollbarSize: 8
  }
}
