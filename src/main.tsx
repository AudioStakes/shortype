import 'virtual:uno.css'

import { render } from 'preact'

import App from '@/App'
import { initializeWebAnalytics } from '@/utils/web-analytics'

const root = document.getElementById('app')

if (!root) {
  throw new Error('Missing #app root element')
}

render(<App />, root)
initializeWebAnalytics()
