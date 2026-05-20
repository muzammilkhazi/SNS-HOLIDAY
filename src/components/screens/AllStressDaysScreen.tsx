// ============================================
// sns-holiday-app — All Stress Days Screen
// ============================================

import { useState, useEffect } from 'react'
import type { ScreenName } from '../../types'
import type { UserSession } from '../../services/api'
import { getSessionId, loadSession } from '../../services/api'
import { CalendarIcon, ChevronRightIcon, AlertCircleIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'
import { colors } from '../../constants/colors'

interface StressDay {
  id: number
  name: string
  start_date: string
  end_date: string
  color: number
}

interface AllStressDaysScreenProps {
  setActiveScreen: (screen: ScreenName) => void
  session: UserSession | null
}

// # Odoo color index → hex
const ODOO_COLORS: Record<number, string> = {
  0: '#9ca3af', 1: '#ef4444', 2: '#f97316', 3: '#eab308',
  4: '#22c55e', 5: '#14b8a6', 6: '#3b82f6', 7: '#8b5cf6',
  8: '#ec4899', 9: '#6b7280', 10: '#78716c', 11: '#0ea5e9',
}

const AllStressDaysScreen = ({ setActiveScreen, session }: AllStressDaysScreenProps) => {
  const [stressDays, setStressDays] = useState<StressDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStressDays()
    const onVisible = () => { if (document.visibilityState === 'visible') fetchStressDays() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    const interval = setInterval(fetchStressDays, 30000)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
      clearInterval(interval)
    }
  }, [])

  const fetchStressDays = async () => {
    setLoading(true)
    try {
      // # Step 1: get employee's department
      let deptId: number | null = null
      const currentSession = session || loadSession()
      let employeeId = currentSession?.employeeId

      // # Resolve employeeId via uid if not in session
      if (!employeeId && currentSession?.uid) {
        try {
          const userRes = await fetch('/web/dataset/call_kw/res.users/read', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            body: JSON.stringify({
              jsonrpc: '2.0', method: 'call', id: 57,
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
              jsonrpc: '2.0', method: 'call', id: 58,
              params: { session_id: getSessionId(), model: 'hr.employee', method: 'search_read', args: [[['user_id', '=', currentSession.uid]]], kwargs: { fields: ['id'], limit: 1 } },
            }),
          })
          const empData = await empRes.json()
          if (empData.result?.length > 0) employeeId = empData.result[0].id
        } catch { /* silent */ }
      }

      if (employeeId) {
        const empRes = await fetch('/web/dataset/call_kw/hr.employee/read', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({
            jsonrpc: '2.0', method: 'call', id: 55,
            params: {
              session_id: getSessionId(), model: 'hr.employee', method: 'read',
              args: [[employeeId], ['department_id']], kwargs: {},
            },
          }),
        })
        const empData = await empRes.json()
        const deptField = empData.result?.[0]?.department_id
        if (deptField && deptField !== false) deptId = Array.isArray(deptField) ? deptField[0] : deptField
      }

      // # Step 2: get user's active company — restrict context to prevent cross-company data leaks
      // # Every user sees only their active company's stress days
      let companyFilter: unknown[] = []
      let allowedCompanyIds: number[] = []
      if (currentSession?.uid) {
        try {
          const userRes = await fetch('/web/dataset/call_kw/res.users/read', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            body: JSON.stringify({
              jsonrpc: '2.0', method: 'call', id: 56,
              params: { session_id: getSessionId(), model: 'res.users', method: 'read', args: [[currentSession.uid], ['company_id']], kwargs: {} },
            }),
          })
          const userData = await userRes.json()
          const cf = userData.result?.[0]?.company_id
          const cid: number | false = Array.isArray(cf) ? cf[0] : cf
          if (cid) { companyFilter = [['company_id', '=', cid]]; allowedCompanyIds = [cid] }
        } catch { /* silent */ }
      }

      // # Step 3: filter stress days — current year only, company, global (no dept) OR employee's dept
      const year = new Date().getFullYear()
      const yearStart = `${year}-01-01`
      const yearEnd   = `${year}-12-31`
      const deptCondition = deptId
        ? ['|', ['department_ids', '=', false], ['department_ids', 'in', [deptId]]]
        : [['department_ids', '=', false]]
      const domain = [
        ...companyFilter,
        ...deptCondition,
        ['start_date', '>=', yearStart],
        ['start_date', '<=', yearEnd],
      ]

      const res = await fetch('/web/dataset/call_kw/hr.leave.stress.day/search_read', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 10,
          params: {
            session_id: getSessionId(),
            model: 'hr.leave.stress.day', method: 'search_read',
            args: [domain],
            kwargs: {
              fields: ['id', 'name', 'start_date', 'end_date', 'color'],
              order: 'start_date asc', limit: 50,
              context: allowedCompanyIds.length > 0 ? { allowed_company_ids: allowedCompanyIds } : {},
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
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  const getColor = (colorIndex: number) => ODOO_COLORS[colorIndex] ?? '#f59e0b'

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
            <h1 className="text-lg font-bold text-white">Stress Days</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {loading ? '...' : `${stressDays.length} stress day${stressDays.length !== 1 ? 's' : ''}`}
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
            <p className="font-medium mb-2" style={{ color: colors.textSecondary }}>No stress days found</p>
            <p className="text-sm" style={{ color: colors.textMuted }}>Stress days will appear here when added</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stressDays.map((day) => {
              const barColor = getColor(day.color)
              return (
                <div key={day.id} className="rounded-2xl p-4 shadow-sm"
                  style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: 1 }}>
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: barColor }} />
                    <div className="flex-1">
                      <p className="font-bold text-sm" style={{ color: colors.textPrimary }}>{day.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <CalendarIcon className="w-3 h-3" style={{ color: colors.textLight }} />
                        <p className="text-xs" style={{ color: colors.textMuted }}>
                          {formatDate(day.start_date)} → {formatDate(day.end_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav active="dashboard" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default AllStressDaysScreen
