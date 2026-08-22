import 'reflect-metadata'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { MotionConfig } from 'framer-motion'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="always">
      <App />
    </MotionConfig>
  </React.StrictMode>
)

