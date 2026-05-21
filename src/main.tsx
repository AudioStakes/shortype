import '@/index.css'

import { render } from 'preact'

import App from '@/App'

const root = document.getElementById('app')

if (!root) {
  throw new Error('Missing #app root element')
}

render(<App />, root)
