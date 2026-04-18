import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { I18nProvider } from './lib/i18n.jsx'

createRoot(document.getElementById('root')).render(
  <I18nProvider>
    <App />
  </I18nProvider>
)
