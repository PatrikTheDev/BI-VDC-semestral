import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import {
  fetchPrinters,
  createPrinter,
  updatePrinter,
  deletePrinter,
} from '../server/printers'
import type { Printer } from '../db/schema'

export const Route = createFileRoute('/')({
  loader: () => fetchPrinters(),
  component: PrintersPage,
})

const STATUS_OPTIONS = ['idle', 'printing', 'maintenance', 'offline'] as const
type Status = (typeof STATUS_OPTIONS)[number]

const STATUS_CONFIG: Record<Status, { label: string; dot: string; bg: string }> = {
  idle: { label: 'Idle', dot: 'bg-emerald-400', bg: 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20' },
  printing: { label: 'Printing', dot: 'bg-blue-400', bg: 'bg-blue-400/10 text-blue-400 ring-blue-400/20' },
  maintenance: { label: 'Maintenance', dot: 'bg-amber-400', bg: 'bg-amber-400/10 text-amber-400 ring-amber-400/20' },
  offline: { label: 'Offline', dot: 'bg-zinc-500', bg: 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20' },
}

function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

type FormData = {
  name: string
  model: string
  classroom: string
  status: string
  notes: string
}

const emptyForm: FormData = { name: '', model: '', classroom: '', status: 'idle', notes: '' }

function PrinterModal({
  open,
  printer,
  onClose,
  onSave,
  saving,
}: {
  open: boolean
  printer: Printer | null
  onClose: () => void
  onSave: (data: FormData) => void
  saving: boolean
}) {
  const [form, setForm] = useState<FormData>(
    printer
      ? { name: printer.name, model: printer.model, classroom: printer.classroom, status: printer.status, notes: printer.notes ?? '' }
      : emptyForm,
  )

  if (!open) return null

  const isEdit = !!printer

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h2 className="text-xl font-semibold mb-6">
          {isEdit ? 'Edit Printer' : 'Add Printer'}
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-zinc-400 mb-1 block">Name</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Prusa #1"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-400 mb-1 block">Model</span>
              <input
                type="text"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="e.g. Prusa MK4S"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-zinc-400 mb-1 block">Classroom</span>
              <input
                type="text"
                value={form.classroom}
                onChange={(e) => setForm({ ...form, classroom: e.target.value })}
                placeholder="e.g. A1-101"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-400 mb-1 block">Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-zinc-400 mb-1 block">Notes</span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Optional notes..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.name || !form.model || !form.classroom}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirm({
  printer,
  onClose,
  onConfirm,
  deleting,
}: {
  printer: Printer
  onClose: () => void
  onConfirm: () => void
  deleting: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h2 className="text-lg font-semibold mb-2">Delete Printer</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Are you sure you want to delete <strong className="text-zinc-200">{printer.name}</strong>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-40 transition"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PrintersPage() {
  const router = useRouter()
  const printers = Route.useLoaderData()

  const [modal, setModal] = useState<{ open: boolean; printer: Printer | null }>({ open: false, printer: null })
  const [deleteTarget, setDeleteTarget] = useState<Printer | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [filterClassroom, setFilterClassroom] = useState<string>('all')

  const classrooms = [...new Set(printers.map((p) => p.classroom))].sort()
  const filtered = filterClassroom === 'all' ? printers : printers.filter((p) => p.classroom === filterClassroom)

  const grouped = filtered.reduce<Record<string, typeof printers>>((acc, p) => {
    ;(acc[p.classroom] ??= []).push(p)
    return acc
  }, {})

  async function handleSave(data: FormData) {
    setSaving(true)
    try {
      if (modal.printer) {
        await updatePrinter({ data: { id: modal.printer.id, ...data } })
      } else {
        await createPrinter({ data })
      }
      setModal({ open: false, printer: null })
      router.invalidate()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deletePrinter({ data: deleteTarget.id })
      setDeleteTarget(null)
      router.invalidate()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white">
                <path d="M6 9V2h12v7" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect width="12" height="8" x="6" y="14" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold">3D Printer Manager</h1>
              <p className="text-xs text-zinc-500">Classroom inventory</p>
            </div>
          </div>
          <button
            onClick={() => setModal({ open: true, printer: null })}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Add Printer
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {STATUS_OPTIONS.map((status) => {
            const count = printers.filter((p) => p.status === status).length
            const config = STATUS_CONFIG[status]
            return (
              <div key={status} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{config.label}</span>
                </div>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            )
          })}
        </div>

        {/* Filter */}
        {classrooms.length > 1 && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-zinc-500">Classroom:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setFilterClassroom('all')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filterClassroom === 'all' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
              >
                All
              </button>
              {classrooms.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterClassroom(c)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filterClassroom === c ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Printer cards grouped by classroom */}
        {Object.entries(grouped).map(([classroom, items]) => (
          <div key={classroom} className="mb-8">
            <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {classroom}
              <span className="text-zinc-600">({items.length})</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((printer) => (
                <div
                  key={printer.id}
                  className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-700 hover:bg-zinc-900 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-zinc-100">{printer.name}</h3>
                      <p className="text-sm text-zinc-500">{printer.model}</p>
                    </div>
                    <StatusBadge status={printer.status as Status} />
                  </div>

                  {printer.notes && (
                    <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{printer.notes}</p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                    <span className="text-xs text-zinc-600">
                      Updated {new Date(printer.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => setModal({ open: true, printer })}
                        className="rounded-md p-1.5 text-zinc-500 hover:text-blue-400 hover:bg-blue-400/10 transition"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(printer)}
                        className="rounded-md p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-zinc-500">
                <path d="M6 9V2h12v7" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect width="12" height="8" x="6" y="14" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-300 mb-1">No printers found</h3>
            <p className="text-sm text-zinc-500 mb-4">Get started by adding your first 3D printer.</p>
            <button
              onClick={() => setModal({ open: true, printer: null })}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition"
            >
              Add Printer
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <PrinterModal
        key={modal.printer?.id ?? 'new'}
        open={modal.open}
        printer={modal.printer}
        onClose={() => setModal({ open: false, printer: null })}
        onSave={handleSave}
        saving={saving}
      />

      {deleteTarget && (
        <DeleteConfirm
          printer={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  )
}
