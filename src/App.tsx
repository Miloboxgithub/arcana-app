import { useEffect, useRef } from 'react'

// 把整个原型 HTML 作为 iframe 嵌入，完全 1:1 还原原型
// 后续逐步组件化替换
const PrototypeApp = () => {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#080808',
    }}>
      <iframe
        src="/prototype-reference.html"
        style={{
          width: '390px',
          height: '100vh',
          border: 'none',
          maxHeight: '844px',
        }}
        title="ARCANA App"
      />
    </div>
  )
}

export default PrototypeApp
