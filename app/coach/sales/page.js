'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true)
      const { data: authData } = await supabase.auth.getUser()
      const coach = authData?.user
      if (!coach) return

      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          date,
          client:client_id ( name, email ),
          package:package_id ( title, price )
        `)
        .eq('coach_id', coach.id)
        .not('package_id', 'is', null)
        .order('date', { ascending: false })

      if (!error) {
        const totalSales = data.reduce((sum, sale) => sum + (sale.package?.price || 0), 0)

        const filtered = data.filter(sale => {
          const d = new Date(sale.date)
          return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
        })

        const filteredTotal = filtered.reduce((sum, sale) => sum + (sale.package?.price || 0), 0)

        setSales(filtered)
        setTotal(totalSales)
        setMonthlyTotal(filteredTotal)
      }

      setLoading(false)
    }

    fetchSales()
  }, [selectedMonth, selectedYear])

  if (loading) return <p className="text-center text-gray-500">Chargement...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">💰 Ventes</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="flex gap-2 items-center">
          <label>Mois :</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border p-1 rounded"
          >
            {months.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border p-1 rounded"
          >
            {[2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="text-sm sm:text-base">
          <p><strong>Total :</strong> {total} €</p>
          <p><strong>{months[selectedMonth]} {selectedYear} :</strong> {monthlyTotal} €</p>
        </div>
      </div>

      {sales.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
          Aucune vente trouvée pour ce mois.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Séance</th>
                <th className="px-4 py-3">Prix (€)</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-t">
                  <td className="px-4 py-3">{sale.client?.name || '—'}</td>
                  <td className="px-4 py-3">{sale.client?.email || '—'}</td>
                  <td className="px-4 py-3">{sale.package?.title || '—'}</td>
                  <td className="px-4 py-3">{sale.package?.price != null ? `${sale.package.price} €` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
