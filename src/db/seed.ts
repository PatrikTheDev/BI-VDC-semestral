import { db } from './index'
import { printers } from './schema'

async function seed() {
  console.log('Seeding database...')

  await db.insert(printers).values([
    {
      name: 'Prusa #1',
      model: 'Prusa MK4S',
      classroom: 'A1-101',
      status: 'idle',
      notes: 'Recently calibrated',
    },
    {
      name: 'Prusa #2',
      model: 'Prusa MK4S',
      classroom: 'A1-101',
      status: 'printing',
      notes: 'Printing semester project',
    },
    {
      name: 'Ender #1',
      model: 'Creality Ender 3 V3',
      classroom: 'A1-101',
      status: 'maintenance',
      notes: 'Nozzle replacement needed',
    },
    {
      name: 'Bambu Lab #1',
      model: 'Bambu Lab P1S',
      classroom: 'B2-205',
      status: 'idle',
    },
    {
      name: 'Bambu Lab #2',
      model: 'Bambu Lab X1 Carbon',
      classroom: 'B2-205',
      status: 'offline',
      notes: 'Waiting for spare parts',
    },
    {
      name: 'Prusa #3',
      model: 'Prusa MINI+',
      classroom: 'B2-205',
      status: 'printing',
      notes: 'Small parts batch',
    },
  ])

  console.log('Seeded 6 printers.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
