import Fastify from 'fastify'

const app = Fastify({
  logger: true,
})

await app.register(
  async (r) => {
    r.get('/health', async () => {
      return { ok: true }
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
