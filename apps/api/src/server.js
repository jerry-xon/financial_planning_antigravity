import Fastify from 'fastify'
import cors from '@fastify/cors'

const app = Fastify({
  logger: true,
})

// Parse comma-separated origins from CORS_ORIGIN. Fall back to localhost dev origins.
const corsOriginEnv = process.env.CORS_ORIGIN || ''
const allowedOrigins = corsOriginEnv
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

await app.register(cors, {
  origin:
    allowedOrigins.length > 0
      ? allowedOrigins
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
})

await app.register(
  async (r) => {
    r.get('/health', async () => {
      return { ok: true, service: 'finplan-api', env: process.env.NODE_ENV || 'development' }
    })
  },
  { prefix: '/api' },
)

const port = Number(process.env.PORT || '8080')
const host = process.env.HOST || '0.0.0.0'

app
  .listen({ port, host })
  .then(() => {
    app.log.info({ port, host }, 'listening')
  })
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })
