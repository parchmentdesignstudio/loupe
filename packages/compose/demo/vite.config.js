import { defineConfig } from 'vite'
import { compose } from '../vite.js'

export default defineConfig({ plugins: [compose()], server: { port: 5191 } })
