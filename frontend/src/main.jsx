import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Boot Novus by Pendo exactly once, before the first render. The install
// snippet in index.html defines window.pendo; an empty visitor id resumes a
// returning visitor or starts an anonymous one until the user signs in.
if (window.pendo) {
  window.pendo.initialize({
    visitor: {
      id: '',
    },
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
