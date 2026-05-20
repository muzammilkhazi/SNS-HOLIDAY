// ============================================
// sns-holiday-app — All Public Holidays Screen (Dynamic)
// ============================================

import { useState, useEffect } from 'react'
import type { ScreenName } from '../../types'
import type { UserSession } from '../../services/api'
import { getSessionId, loadSession } from '../../services/api'
import { CalendarIcon, ChevronRightIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'
import { colors } from '../../constants/colors'

interface PublicHoliday {
  id: number
  name: string
  date_from: string
  date_to: string
}

interface AllPublicHolidaysScreenProps {
  setActiveScreen: (screen: ScreenName) => void
  session?: UserSession | null
}

const ACCENT_COLORS = [
  '#4f46e5', '#7c3aed', '#db2777', '#059669',
  '#d97706', '#dc2626', '#2563eb', '#7c3aed',
]

const AllPublicHolidaysScreen = ({ setActiveScreen, session }: AllPublicHolidaysScreenProps) => {
  const [holidays, setHolidays] = useState<PublicHoliday[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublicHolidays()
    const onVisible = () => { if (document.visibilityState === 'visible') fetchPublicHolidays() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    const interval = setInterval(fetchPublicHolidays, 30000)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
      clearInterval(interval)
    }
  }, [])

  const fetchPublicHolidays = async () => {
    setLoading(true)
    try {
      const currentSession = session || loadSession()
      let employeeId = currentSession?.employeeId

      if (!employeeId && currentSession?.uid) {
        try {
          const userRes = await fetch('/web/dataset/call_kw/res.users/read', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            body: JSON.stringify({
              jsonrpc: '2.0', method: 'call', id: 59,
              params: { session_id: getSessionId(), model: 'res.users', method: 'read', args: [[currentSession.uid], ['employee_id']], kwargs: {} },
            }),
          })
          const userData = await userRes.json()
          const empField = userData.result?.[0]?.employee_id
          if (empField && empField !== false) employeeId = Array.isArray(empField) ? empField[0] : empField
        } catch { /* silent */ }
      }
      if (!employeeId && currentSession?.uid) {
        try {
          const empRes = await fetch('/web/dataset/call_kw/hr.employee/search_read', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            body: JSON.stringify({
              jsonrpc: '2.0', method: 'call', id: 60,
              params: { session_id: getSessionId(), model: 'hr.employee', method: 'search_read', args: [[['user_id', '=', currentSession.uid]]], kwargs: { fields: ['id'], limit: 1 } },
            }),
          })
          const empData = await empRes.json()
          if (empData.result?.length > 0) employeeId = empData.result[0].id
        } catch { /* silent */ }
      }

      // # Admin → all companies (company_ids); normal user → active company only (company_id)
      // # Every user sees only their active company's holidays
      let domain: unknown[] = [['resource_id', '=', false]]
      let allowedCompanyIds: number[] = []
      if (currentSession?.uid) {
        try {
          const userRes = await fetch('/web/dataset/call_kw/res.users/read', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            body: JSON.stringify({
              jsonrpc: '2.0', method: 'call', id: 61,
              params: { session_id: getSessionId(), model: 'res.users', method: 'read', args: [[currentSession.uid], ['company_id']], kwargs: {} },
            }),
          })
          const userData = await userRes.json()
          const cf = userData.result?.[0]?.company_id
          const cid: number | false = Array.isArray(cf) ? cf[0] : cf
          if (cid) { domain = [['company_id', '=', cid], ['resource_id', '=', false]]; allowedCompanyIds = [cid] }
        } catch { /* silent */ }
      }

      const res = await fetch('/web/dataset/call_kw/resource.calendar.leaves/search_read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 8,
          params: {
            session_id: getSessionId(), model: 'resource.calendar.leaves', method: 'search_read',
            args: [domain],
            kwargs: {
              fields: ['id', 'name', 'date_from', 'date_to'], order: 'date_from asc',
              context: allowedCompanyIds.length > 0 ? { allowed_company_ids: allowedCompanyIds } : {},
            },
          },
        }),
      })
      const data = await res.json()
      if (data.result) setHolidays(data.result)
    } catch (err) {
      console.error('Error fetching public holidays:', err)
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
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer' }}>
            <ChevronRightIcon className="w-5 h-5 text-white rotate-180" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-white">Public Holidays</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {loading ? '...' : `${holidays.length} holidays`}
            </p>
          </div>
          <div className="w-9" />
        </div>
      </div>

      {/* # Holidays list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-12">
            <p style={{ color: colors.textMuted }}>Loading...</p>
          </div>
        ) : holidays.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: colors.background }}>
              <CalendarIcon className="w-8 h-8" style={{ color: colors.textLight }} />
            </div>
            <p className="font-medium" style={{ color: colors.textSecondary }}>
              No public holidays found
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {holidays.map((holiday, index) => (
              <div key={holiday.id} className="rounded-xl p-4 shadow-sm"
                style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: 1 }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* # Colored accent bar */}
                    <div className="w-1 h-12 rounded-full"
                      style={{ backgroundColor: ACCENT_COLORS[index % ACCENT_COLORS.length] }} />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
                        {holiday.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <CalendarIcon className="w-3 h-3" style={{ color: colors.textLight }} />
                        <p className="text-xs" style={{ color: colors.textMuted }}>
                          {formatDate(holiday.date_from)}
                          {holiday.date_to && holiday.date_to !== holiday.date_from
                            ? ` → ${formatDate(holiday.date_to)}`
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#e0e7ff' }}>
                    <CalendarIcon className="w-5 h-5" style={{ color: colors.primary }} />
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

export default AllPublicHolidaysScreen