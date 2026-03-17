'use client'

import { useEffect, useState } from 'react'

type ConsultantRow = {
  id: string
  name: string
  email: string
  photoUrl?: string | null
  commissionRate: number
  isActive: boolean
}

export default function AdminConsultantsPage() {
  const [consultants, setConsultants] = useState<ConsultantRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [commissionEdits, setCommissionEdits] = useState<Record<string, number>>({})
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const fetchConsultants = async () => {
    setLoading(true)
    setError(null)
    setStatusMessage(null)
    try {
      const res = await fetch('/api/admin/consultants')
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data?.error || 'Failed to fetch consultants')
        return
      }
      const list: ConsultantRow[] = data.data ?? []
      setConsultants(list)
      const edits: Record<string, number> = {}
      list.forEach((item) => {
        edits[item.id] = item.commissionRate
      })
      setCommissionEdits(edits)
    } catch {
      setError('Failed to fetch consultants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConsultants()
  }, [])

  const patchConsultant = async (
    id: string,
    updates: { isActive?: boolean; commissionRate?: number }
  ) => {
    setSavingId(id)
    setStatusMessage(null)
    try {
      const res = await fetch('/api/admin/consultants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        alert(data?.error || 'Failed to update consultant')
        return
      }
      setStatusMessage('Consultant updated successfully.')
      await fetchConsultants()
    } catch {
      alert('Failed to update consultant')
    } finally {
      setSavingId(null)
    }
  }

  const handleSave = async (consultant: ConsultantRow) => {
    const current = commissionEdits[consultant.id]
    if (current == null || Number.isNaN(current)) {
      alert('Commission rate must be a number')
      return
    }
    if (current < 0 || current > 100) {
      alert('Commission rate must be between 0 and 100')
      return
    }
    if (current === consultant.commissionRate) {
      setStatusMessage('No changes to save.')
      return
    }
    await patchConsultant(consultant.id, { commissionRate: current })
  }

  const handleToggleActive = async (consultant: ConsultantRow) => {
    await patchConsultant(consultant.id, { isActive: !consultant.isActive })
  }

  if (loading) {
    return <div className="p-6 text-slate-100">Loading consultants...</div>
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
              <h1 className="text-2xl font-bold text-white">Consultants</h1>
            </div>
            <p className="text-sm text-slate-300">Manage consultant commission and active status.</p>
          </div>

          {error ? (
            <div className="mt-4 rounded-md border border-rose-500 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">Error: {error}</div>
          ) : null}
          {statusMessage ? (
            <div className="mt-4 rounded-md border border-emerald-500 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{statusMessage}</div>
          ) : null}

          <div className="mt-4 overflow-auto rounded-md border border-slate-700">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-800 text-xs uppercase tracking-wide text-slate-300">
                <tr>
                  <th className="border-b border-slate-700 px-3 py-3">Name</th>
                  <th className="border-b border-slate-700 px-3 py-3">Email</th>
                  <th className="border-b border-slate-700 px-3 py-3">Commission Rate</th>
                  <th className="border-b border-slate-700 px-3 py-3">Active</th>
                  <th className="border-b border-slate-700 px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {consultants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-5 text-center text-slate-400">No consultants found.</td>
                  </tr>
                ) : (
                  consultants.map((consultant) => (
                    <tr key={consultant.id} className="border-b border-slate-700 last:border-b-0">
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-100">{consultant.name}</div>
                        <div className="text-xs text-slate-400">ID: {consultant.id}</div>
                      </td>
                      <td className="px-3 py-3 text-slate-300">{consultant.email}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.1}
                            value={commissionEdits[consultant.id] ?? consultant.commissionRate}
                            onChange={(e) => {
                              const next = Number(e.target.value)
                              setCommissionEdits((prev) => ({
                                ...prev,
                                [consultant.id]: Number.isNaN(next) ? 0 : next,
                              }))
                            }}
                            className="w-20 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-100 outline-none ring-2 ring-transparent transition focus:ring-sky-500"
                          />
                          <span className="text-xs text-slate-300">%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => handleToggleActive(consultant)}
                          disabled={savingId === consultant.id}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${consultant.isActive ? 'bg-emerald-500 text-emerald-900 hover:bg-emerald-400' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}>
                          {consultant.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => handleSave(consultant)}
                          disabled={savingId === consultant.id}
                          className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
                        >
                          {savingId === consultant.id ? 'Saving...' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
