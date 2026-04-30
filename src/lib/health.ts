import { db } from '../db'
import { sql } from 'drizzle-orm'
import { printers } from '../db/schema'

export async function getHealthChecks() {
  const dbResult = await checkDatabase()
  const queryResult = await checkPrintersQuery()
  const connInfo = getConnectionInfo()

  return {
    status: dbResult.status === 'connected' && queryResult.status === 'ok' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connection: connInfo,
    database: dbResult,
    printersQuery: queryResult,
    env: {
      NODE_ENV: process.env.NODE_ENV ?? '(not set)',
      HOST: process.env.HOST ?? '(not set)',
      PORT: process.env.PORT ?? '(not set)',
    },
  }
}

function getConnectionInfo() {
  const raw = process.env.DATABASE_URL ?? '(not set, using fallback)'
  // Mask the password in the URL for display
  let masked = raw
  try {
    const url = new URL(raw)
    if (url.password) {
      url.password = '***'
    }
    masked = url.toString()
  } catch {
    masked = raw.replace(/:([^@]+)@/, ':***@')
  }

  return {
    DATABASE_URL_masked: masked,
    DATABASE_URL_set: !!process.env.DATABASE_URL,
  }
}

async function checkDatabase() {
  try {
    const start = Date.now()
    const result = await db.execute(sql`SELECT current_user, current_database(), version(), inet_server_addr(), inet_server_port()`)
    const latency = Date.now() - start
    const row = result[0] as Record<string, unknown> | undefined

    // Check SSL status
    let sslInfo: Record<string, unknown> = {}
    try {
      const sslResult = await db.execute(sql`SELECT ssl, version AS ssl_version, cipher FROM pg_stat_ssl WHERE pid = pg_backend_pid()`)
      sslInfo = (sslResult[0] as Record<string, unknown>) ?? { note: 'no SSL info returned' }
    } catch (e) {
      sslInfo = { error: e instanceof Error ? e.message : 'unknown' }
    }

    return {
      status: 'connected' as const,
      latency,
      currentUser: row?.current_user,
      currentDatabase: row?.current_database,
      serverVersion: row?.version,
      serverAddr: row?.inet_server_addr,
      serverPort: row?.inet_server_port,
      ssl: sslInfo,
    }
  } catch (error) {
    return {
      status: 'error' as const,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }
  }
}

async function checkPrintersQuery() {
  try {
    const start = Date.now()
    // Run the exact same query that the app runs on page load
    const result = await db.select().from(printers).orderBy(printers.classroom, printers.name)
    const latency = Date.now() - start

    return {
      status: 'ok' as const,
      latency,
      rowCount: result.length,
      sample: result.length > 0 ? result[0] : null,
    }
  } catch (error) {
    return {
      status: 'error' as const,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }
  }
}
