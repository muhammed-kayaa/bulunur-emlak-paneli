'use client'

import { useState, useEffect } from 'react'

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
  const [updating, setUpdating] = useState<string | null>(null) // id of consultant being updated

  useEffect(() => {
    fetchConsultants()
  }, [])

  const fetchConsultants = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/consultants')
      const data = await res.json()
      if (data.ok) {
        setConsultants(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch consultants')
    } finally {
      setLoading(false)
    }
  }

  const updateConsultant = async (id: string, updates: { isActive?: boolean; commissionRate?: number }) => {
    setUpdating(id)
    try {
      const res = await fetch('/api/admin/consultants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      const data = await res.json()
      if (data.ok) {
        await fetchConsultants() // refresh list
      } else {
        alert(data.error)
      }
    } catch (err) {
      alert('Failed to update consultant')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Consultants</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Commission Rate</th>
            <th className="border border-gray-300 p-2">Active</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {consultants.map((consultant) => (
            <tr key={consultant.id}>
              <td className="border border-gray-300 p-2">{consultant.name}</td>
              <td className="border border-gray-300 p-2">{consultant.email}</td>
              <td className="border border-gray-300 p-2">
                <input
                  type="number"
                  defaultValue={consultant.commissionRate}
                  className="border p-1 w-20"
                  id={`commission-${consultant.id}`}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById(`commission-${consultant.id}`) as HTMLInputElement
                    const rate = parseFloat(input.value)
                    if (!isNaN(rate) && rate >= 0 && rate <= 100) {
                      updateConsultant(consultant.id, { commissionRate: rate })
                    } else {
                      alert('Invalid commission rate')
                    }
                  }}
                  disabled={updating === consultant.id}
                  className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Save
                </button>
              </td>
              <td className="border border-gray-300 p-2">
                <button
                  onClick={() => updateConsultant(consultant.id, { isActive: !consultant.isActive })}
                  disabled={updating === consultant.id}
                  className={`px-2 py-1 rounded ${consultant.isActive ? 'bg-green-500' : 'bg-red-500'} text-white`}
                >
                  {consultant.isActive ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td className="border border-gray-300 p-2">
                {/* Actions column, perhaps leave empty or add more later */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}