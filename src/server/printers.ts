import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { printers, type NewPrinter } from '../db/schema'
import { eq } from 'drizzle-orm'

export const fetchPrinters = createServerFn({ method: 'GET' }).handler(
  async () => {
    return db.select().from(printers).orderBy(printers.classroom, printers.name)
  },
)

export const fetchPrinter = createServerFn({ method: 'GET' })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    const [printer] = await db
      .select()
      .from(printers)
      .where(eq(printers.id, id))
    return printer ?? null
  })

export const createPrinter = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { name: string; model: string; classroom: string; status: string; notes?: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    const [printer] = await db
      .insert(printers)
      .values(data as NewPrinter)
      .returning()
    return printer
  })

export const updatePrinter = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      id: number
      name: string
      model: string
      classroom: string
      status: string
      notes?: string
    }) => data,
  )
  .handler(async ({ data }) => {
    const { id, ...values } = data
    const [printer] = await db
      .update(printers)
      .set({ ...values, updatedAt: new Date() } as Partial<NewPrinter>)
      .where(eq(printers.id, id))
      .returning()
    return printer
  })

export const deletePrinter = createServerFn({ method: 'POST' })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    await db.delete(printers).where(eq(printers.id, id))
    return { success: true }
  })
