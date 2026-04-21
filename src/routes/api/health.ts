import { createFileRoute } from '@tanstack/react-router'
import { getHealthChecks } from '../../lib/health'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => Response.json(await getHealthChecks()),
    },
  },
})
