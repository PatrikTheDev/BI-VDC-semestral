import { defineHandler } from 'h3'
import { db } from '../../src/db'
import { sql } from 'drizzle-orm'

export default defineHandler(async (event) => {
  try {
    await db.execute(sql`SELECT 1`)
    return { status: 'ok' }
  } catch {
    event.response.status = 503
    return { status: 'error', message: 'Database unavailable' }
  }
})
