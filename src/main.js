import { createApp } from 'vue'
import App from './App.jsx'

// eslint-disable-next-line no-unused-expressions
process.env.NODE_ENV === 'development'
  ? import('vconsole').then(({ default: VConsole }) => {
      window._VConsole = new VConsole();
    })
  : null;

createApp(App).mount('#root')
