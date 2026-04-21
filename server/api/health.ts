import { db } from '../../src/db'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    await db.execute(sql`SELECT 1`)
    return { status: 'ok' }
  } catch {
    setResponseStatus(event, 503)
    return { status: 'error', message: 'Database unavailable' }
  }
})
