// ============================================
// sns-holiday-app — All Stress Days Screen (Dynamic)
// ============================================

import { useState, useEffect } from 'react'
import type { ScreenName } from '../../types'
import type { UserSession } from '../../services/api'
import { CalendarIcon, ChevronRightIcon, AlertCircleIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'
import { colors } from '../../constants/colors'

interface StressDay {
  id: number
  holiday_status_id: [number, string]
  request_date_from: string
  request_date_to: string
  number_of_days: number
  state: string
  employee_id: [number, string]
}

interface AllStressDaysScreenProps {
  setActiveScreen: (screen: ScreenName) => void
  session: UserSession | null
}

const AllStressDaysScreen = ({ setActiveScreen }: AllStressDaysScreenProps) => {
  const [stressDays, setStressDays] = useState<StressDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStressDays()
  }, [])

  const fetchStressDays = async () => {
    setLoading(true)
    try {
      const res = await fetch('/web/dataset/call_kw/hr.leave/search_read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 10,
          params: {
            model: 'hr.leave',
            method: 'search_read',
            args: [[['holiday_status_id.name', 'ilike', 'stress']]],
            kwargs: {
              fields: ['id', 'holiday_status_id', 'request_date_from', 'request_date_to', 'number_of_days', 'state', 'employee_id'],
              order: 'request_date_from desc',
              limit: 50,
            },
          },
        }),
      })
      const data = await res.json()
      if (data.result) setStressDays(data.result)
    } catch (err) {
      console.error('Error fetching stress days:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: colors.background }}>

      {/* # Header */}
      <div className="p-4 shadow-md" style={{ background: colors.gradientHeader }}>
        <div className="flex items-center justify-between">
          <button onClick={() => setActiveScreen('dashboard')}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <ChevronRightIcon className="w-5 h-5 text-white rotate-180" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-white">Stress Days</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {loading ? '...' : `${stressDays.length} stress days`}
            </p>
          </div>
          <div className="w-9" />
        </div>
      </div>

      {/* # Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-12">
            <p style={{ color: colors.textMuted }}>Loading...</p>
          </div>
        ) : stressDays.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#fef3c7' }}>
              <AlertCircleIcon className="w-8 h-8" style={{ color: '#f59e0b' }} />
            </div>
            <p className="font-medium mb-2" style={{ color: colors.textSecondary }}>
              No stress days found
            </p>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              Stress days will appear here when added
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stressDays.map((day) => (
              <div key={day.id} className="rounded-2xl p-4 shadow-sm"
                style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: 1 }}>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-12 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: colors.textPrimary }}>
                      {day.employee_id[1]}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <CalendarIcon className="w-3 h-3" style={{ color: colors.textLight }} />
                      <p className="text-xs" style={{ color: colors.textMuted }}>
                        {formatDate(day.request_date_from)} → {formatDate(day.request_date_to)}
                      </p>
                    </div>
                    <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                      {day.number_of_days} day{day.number_of_days !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="dashboard" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default AllStressDaysScreen