import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { RideHailingProvider } from './state/useRideHailingStore.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RideHailingProvider>
      <App />
    </RideHailingProvider>
  </React.StrictMode>,
)

