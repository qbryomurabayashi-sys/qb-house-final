import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
// import App from './App.tsx' // Disabled for V6 Debug

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1 style={{ color: 'green', fontSize: '24px' }}>V6: System Check OK</h1>
            <p>Basic React rendering is working.</p>
            <p>Illegal Constructor Error Debugging...</p>
        </div>
    </React.StrictMode>,
)
