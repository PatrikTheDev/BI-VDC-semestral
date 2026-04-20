import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core'

export const printerStatusEnum = pgEnum('printer_status', [
  'idle',
  'printing',
  'maintenance',
  'offline',
])

export const printers = pgTable('printers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  model: varchar('model', { length: 255 }).notNull(),
  classroom: varchar('classroom', { length: 100 }).notNull(),
  status: printerStatusEnum('status').notNull().default('idle'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type Printer = typeof printers.$inferSelect
export type NewPrinter = typeof printers.$inferInsert
