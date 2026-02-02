import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <div className="p-10 text-center">
            <h1 className="text-2xl font-bold text-green-600">V6: System Check OK</h1>
            <p className="mt-4">Basic React rendering is working.</p>
        </div>
    </React.StrictMode>,
)
