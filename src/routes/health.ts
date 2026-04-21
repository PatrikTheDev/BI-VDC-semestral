import { createFileRoute } from '@tanstack/react-router'
import { db } from '../db'
import { sql } from 'drizzle-orm'

export const Route = createFileRoute('/health')({
  server: {
    handlers: {
      GET: async () => {
        const checks = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          database: await checkDatabase(),
        }

        return Response.json(checks)
      },
    },
  },
})

async function checkDatabase() {
  try {
    const start = Date.now()
    await db.execute(sql`SELECT 1`)
    return { status: 'connected', latency: Date.now() - start }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
