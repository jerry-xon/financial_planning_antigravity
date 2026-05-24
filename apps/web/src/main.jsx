import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { FinancialPlanProvider } from './contexts/FinancialPlanContext'
import './index.css'

import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FinancialPlanProvider>
          <App />
        </FinancialPlanProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
