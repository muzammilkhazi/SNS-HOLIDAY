// ============================================
// sns-holiday-app — Dashboard Screen (Dynamic)
// ============================================

import { useState, useEffect } from 'react'
import type { ScreenName } from '../../types'
import type { UserSession } from '../../services/api'
import { loadSession, getSessionId } from '../../services/api'
import { UserIcon, CalendarIcon, PlusIcon, FileTextIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'
import { colors } from '../../constants/colors'

interface LeaveType {
  id: number
  name: string
  max_leaves: number
  leaves_taken: number
  remaining_leaves: number
  virtual_remaining_leaves: number
}

interface PublicHoliday {
  id: number
  name: string
  date_from: string
  date_to: string
}

interface AwayEmployee {
  id: number
  employee_id: [number, string]
  holiday_status_id: [number, string]
  request_date_from: string
  request_date_to: string
}

interface StressDay {
  id: number
  name: string
  start_date: string
  end_date: string
  color: number
}

interface DashboardScreenProps {
  setActiveScreen: (screen: ScreenName) => void
  session?: UserSession | null
}

const DashboardScreen = ({ setActiveScreen, session }: DashboardScreenProps) => {
  const [isAdmin, setIsAdmin]               = useState<boolean>(session?.isAdmin === true)
  const [leaveTypes, setLeaveTypes]         = useState<LeaveType[]>([])
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>([])
  const [awayToday, setAwayToday]           = useState<AwayEmployee[]>([])
  const [stressDays, setStressDays]         = useState<StressDay[]>([])
  const [loading, setLoading]               = useState(true)

  useEffect(() => {
    fetchDashboardData()
    if (session?.isAdmin === undefined) checkAdminStatus()

    const onVisible = () => { if (document.visibilityState === 'visible') fetchDashboardData() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    const interval = setInterval(fetchDashboardData, 30000)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
      clearInterval(interval)
    }
  }, [])

  const checkAdminStatus = async () => {
    try {
      const res = await fetch('/web/dataset/call_kw/res.users/has_group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 98,
          params: { model: 'res.users', method: 'has_group', args: ['base.group_system'], kwargs: {} },
        }),
      })
      const data = await res.json()
      setIsAdmin(data.result === true)
      // # fetchAwayToday already runs inside fetchDashboardData — do not call again here
    } catch { setIsAdmin(false) }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchLeaveTypes(), fetchPublicHolidays(), fetchAwayToday(), fetchStressDays()])
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaveTypes = async () => {
    const currentSession = session || loadSession()
    let employeeId = currentSession?.employeeId

    if (!employeeId && currentSession?.uid) {
      try {
        const userRes = await fetch('/web/dataset/call_kw/res.users/read', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({
            jsonrpc: '2.0', method: 'call', id: 3,
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
            jsonrpc: '2.0', method: 'call', id: 6,
            params: { session_id: getSessionId(), model: 'hr.employee', method: 'search_read', args: [[['user_id', '=', currentSession.uid]]], kwargs: { fields: ['id'], limit: 1 } },
          }),
        })
        const empData = await empRes.json()
        if (empData.result?.length > 0) employeeId = empData.result[0].id
      } catch { /* silent */ }
    }

    if (!employeeId) return

    // # Resolve ALL employee IDs for this user across all companies
    let allEmployeeIds: number[] = [employeeId]
    if (currentSession?.uid) {
      try {
        const empRes = await fetch('/web/dataset/call_kw/hr.employee/search_read', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({
            jsonrpc: '2.0', method: 'call', id: 62,
            params: { session_id: getSessionId(), model: 'hr.employee', method: 'search_read', args: [[['user_id', '=', currentSession.uid]]], kwargs: { fields: ['id'], limit: false } },
          }),
        })
        const empData = await empRes.json()
        if (empData.result?.length > 0) allEmployeeIds = empData.result.map((e: { id: number }) => e.id)
      } catch { /* silent */ }
    }

    try {
      const [allocRes, takenRes] = await Promise.all([
        fetch('/web/dataset/call_kw/hr.leave.allocation/search_read', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({
            jsonrpc: '2.0', method: 'call', id: 4,
            params: {
              session_id: getSessionId(), model: 'hr.leave.allocation', method: 'search_read',
              args: [[['employee_id', 'in', allEmployeeIds], ['state', '=', 'validate']]],
              kwargs: { fields: ['id', 'number_of_days', 'holiday_status_id', 'number_of_days_display'] },
            },
          }),
        }),
        fetch('/web/dataset/call_kw/hr.leave/search_read', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({
            jsonrpc: '2.0', method: 'call', id: 5,
            params: {
              session_id: getSessionId(), model: 'hr.leave', method: 'search_read',
              args: [[['employee_id', 'in', allEmployeeIds], ['state', '=', 'validate'], ['holiday_type', '=', 'employee']]],
              kwargs: { fields: ['id', 'number_of_days', 'holiday_status_id'] },
            },
          }),
        }),
      ])

      const allocData = await allocRes.json()
      const takenData = await takenRes.json()
      console.log('[DEBUG] allocations:', JSON.stringify(allocData.result, null, 2))

      if (!allocData.result) return

      const allocated: Record<string, number> = {}
      const typeIds: Record<string, number> = {}
      allocData.result.forEach((a: { holiday_status_id: [number, string]; number_of_days: number; number_of_days_display?: number }) => {
        if (!Array.isArray(a.holiday_status_id)) return
        const name = a.holiday_status_id[1]
        const id   = a.holiday_status_id[0]
        const days = a.number_of_days_display ?? a.number_of_days
        allocated[name] = (allocated[name] || 0) + Math.abs(days)
        typeIds[name] = id
      })

      const taken: Record<string, number> = {}
      if (takenData.result) {
        takenData.result.forEach((t: { holiday_status_id: [number, string]; number_of_days: number }) => {
          if (!Array.isArray(t.holiday_status_id)) return
          const name = t.holiday_status_id[1]
          taken[name] = (taken[name] || 0) + Math.abs(t.number_of_days)
        })
      }

      const types: LeaveType[] = Object.keys(allocated).map(name => {
        const max      = allocated[name]
        const usedDays = taken[name] || 0
        const remaining = Math.max(max - usedDays, 0)
        return { id: typeIds[name], name, max_leaves: max, leaves_taken: usedDays, remaining_leaves: remaining, virtual_remaining_leaves: remaining }
      })
      console.log('[DEBUG] leaveTypes built:', JSON.stringify(types, null, 2))
      setLeaveTypes(types)
    } catch (err) {
      console.error('fetchLeaveTypes error:', err)
    }
  }

  const fetchAwayToday = async () => {
    const today = new Date().toISOString().split('T')[0]
    try {
      const res = await fetch('/web/dataset/call_kw/hr.leave/search_read', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 20,
          params: {
            session_id: getSessionId(), model: 'hr.leave', method: 'search_read',
            args: [[['state', 'in', ['validate', 'validate1']], ['request_date_from', '<=', today], ['request_date_to', '>=', today], ['holiday_type', '=', 'employee']]],
            kwargs: { fields: ['id', 'employee_id', 'holiday_status_id', 'request_date_from', 'request_date_to'], order: 'employee_id asc', limit: 20 },
          },
        }),
      })
      const data = await res.json()
      if (data.result) setAwayToday(
        data.result.filter((r: AwayEmployee) =>
          Array.isArray(r.employee_id) && typeof r.employee_id[1] === 'string' &&
          Array.isArray(r.holiday_status_id)
        )
      )
    } catch (err) { console.error('fetchAwayToday error:', err) }
  }

  const fetchStressDays = async () => {
    try {
      // # Get employee's department first
      let deptId: number | null = null
      const currentSession = session || loadSession()
      let employeeId = currentSession?.employeeId

      // # Resolve employeeId via uid if not in session (same fallback as fetchLeaveTypes)
      if (!employeeId && currentSession?.uid) {
        try {
          const userRes = await fetch('/web/dataset/call_kw/res.users/read', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            body: JSON.stringify({
              jsonrpc: '2.0', method: 'call', id: 57,
              params: {
                session_id: getSessionId(), model: 'res.users', method: 'read',
                args: [[currentSession.uid], ['employee_id']], kwargs: {},
              },
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
              params: {
                session_id: getSessionId(), model: 'hr.employee', method: 'search_read',
                args: [[['user_id', '=', currentSession.uid]]],
                kwargs: { fields: ['id'], limit: 1 },
              },
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
      // # Company filter — admin sees all their companies, normal user sees active company only
      // # Every user sees only their active company's stress days
      let companyFilter: unknown[] = []
      let allowedCompanyIdsSD: number[] = []
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
          if (cid) { companyFilter = [['company_id', '=', cid]]; allowedCompanyIdsSD = [cid] }
        } catch { /* silent */ }
      }

      const year = new Date().getFullYear()
      const yearStart = `${year}-01-01`
      const yearEnd   = `${year}-12-31`
      const deptCondition = deptId
        ? ['|', ['department_ids', '=', false], ['department_ids', 'in', [deptId]]]
        : [['department_ids', '=', false]]
      const domain = [...companyFilter, ...deptCondition, ['start_date', '>=', yearStart], ['start_date', '<=', yearEnd]]
      const res = await fetch('/web/dataset/call_kw/hr.leave.stress.day/search_read', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 10,
          params: {
            session_id: getSessionId(), model: 'hr.leave.stress.day', method: 'search_read',
            args: [domain],
            kwargs: {
              fields: ['id', 'name', 'start_date', 'end_date', 'color'], order: 'start_date asc', limit: 10,
              context: allowedCompanyIdsSD.length > 0 ? { allowed_company_ids: allowedCompanyIdsSD } : {},
            },
          },
        }),
      })
      const data = await res.json()
      if (data.result) setStressDays(data.result)
    } catch (err) { console.error('fetchStressDays error:', err) }
  }

  const fetchPublicHolidays = async () => {
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

      // # Admin → all companies; normal user → active company only
      // # Every user sees only their active company's public holidays
      let domain: unknown[] = [['resource_id', '=', false]]
      let allowedCompanyIdsPH: number[] = []
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
          if (cid) { domain = [['company_id', '=', cid], ['resource_id', '=', false]]; allowedCompanyIdsPH = [cid] }
        } catch { /* silent */ }
      }

      const res = await fetch('/web/dataset/call_kw/resource.calendar.leaves/search_read', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 8,
          params: {
            session_id: getSessionId(), model: 'resource.calendar.leaves', method: 'search_read',
            args: [domain],
            kwargs: {
              fields: ['id', 'name', 'date_from', 'date_to'], order: 'date_from asc', limit: 5,
              context: allowedCompanyIdsPH.length > 0 ? { allowed_company_ids: allowedCompanyIdsPH } : {},
            },
          },
        }),
      })
      const data = await res.json()
      if (data.result) setPublicHolidays(data.result)
    } catch (err) { console.error('fetchPublicHolidays error:', err) }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const paidTimeOff  = leaveTypes.find(l => l.name.toLowerCase().includes('paid'))
  const businessTrip = leaveTypes.find(l => l.name.toLowerCase().includes('business'))
  const calcPct = (remaining: number, max: number) => max > 0 ? Math.round((remaining / max) * 100) : 0
  const ptoPct  = paidTimeOff  ? calcPct(paidTimeOff.virtual_remaining_leaves,  paidTimeOff.max_leaves)  : 0
  const tripPct = businessTrip ? calcPct(businessTrip.virtual_remaining_leaves, businessTrip.max_leaves) : 0
  // # Show decimals when value is fractional (e.g. 0.37), whole number otherwise
  const fmtDays = (n: number) => n % 1 === 0 ? n.toString() : parseFloat(n.toFixed(2)).toString()

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: colors.background }}>

      {/* ===== HEADER — compact ===== */}
      <div className="px-4 pt-4 pb-4 shadow-lg" style={{ background: colors.gradientHeader }}>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-xl font-bold text-white">Time Off</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Manage your leave requests</p>
          </div>
          <button onClick={() => setActiveScreen('profile')}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer' }}>
            <UserIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* # Stats Cards — compact 2-col */}
        <div className="grid grid-cols-2 gap-3">

          {/* # Paid Time Off */}
          <div className="rounded-xl p-3 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#e0e7ff' }}>
                <CalendarIcon className="w-3 h-3" style={{ color: colors.primary }} />
              </div>
              <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>Paid Time Off</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
              {loading ? '…' : (paidTimeOff ? fmtDays(paidTimeOff.virtual_remaining_leaves) : 0)}
            </p>
            <div style={{ marginTop: 6, height: 3, borderRadius: 99, backgroundColor: '#e0e7ff', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${loading ? 0 : ptoPct}%`, borderRadius: 99, backgroundColor: colors.primary, transition: 'width 0.5s ease' }} />
            </div>
            <p className="text-xs mt-0.5 font-semibold" style={{ color: colors.primary }}>{loading ? '' : `${ptoPct}%`}</p>
          </div>

          {/* # Business Trips */}
          <div className="rounded-xl p-3 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#fce7f3' }}>
                <CalendarIcon className="w-3 h-3" style={{ color: '#ec4899' }} />
              </div>
              <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>Business Trips</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
              {loading ? '…' : (businessTrip ? fmtDays(businessTrip.virtual_remaining_leaves) : 0)}
            </p>
            <div style={{ marginTop: 6, height: 3, borderRadius: 99, backgroundColor: '#fce7f3', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${loading ? 0 : tripPct}%`, borderRadius: 99, backgroundColor: '#ec4899', transition: 'width 0.5s ease' }} />
            </div>
            <p className="text-xs mt-0.5 font-semibold" style={{ color: '#ec4899' }}>{loading ? '' : `${tripPct}%`}</p>
          </div>

        </div>
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="flex-1 overflow-y-auto px-4 py-3">

        {/* 1. Who's Away Today — admin only */}
        {isAdmin && (
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold" style={{ color: colors.textPrimary }}>Who's Away Today</h2>
              <button onClick={() => setActiveScreen('whosAway')}
                className="text-sm font-semibold" style={{ color: colors.primary, background: 'none', border: 'none', cursor: 'pointer' }}>
                View All →
              </button>
            </div>
            {loading ? (
              <div className="rounded-xl p-3 text-center" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                <p className="text-sm" style={{ color: colors.textMuted }}>Loading...</p>
              </div>
            ) : awayToday.length === 0 ? (
              <div className="rounded-xl p-3 text-center" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                <p className="text-sm" style={{ color: colors.textMuted }}>No one is away today</p>
              </div>
            ) : (
              <div className="space-y-2">
                {awayToday.slice(0, 3).map((item) => (
                  <div key={item.id} className="rounded-xl p-3 shadow-sm"
                    style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: colors.gradientCard }}>
                        {item.employee_id[1].charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm" style={{ color: colors.textPrimary }}>{item.employee_id[1]}</p>
                        <p className="text-xs" style={{ color: colors.textSecondary }}>{item.holiday_status_id[1]}</p>
                        <p className="text-xs" style={{ color: colors.textMuted }}>
                          {formatDate(item.request_date_from)}{item.request_date_from !== item.request_date_to ? ` → ${formatDate(item.request_date_to)}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {awayToday.length > 3 && (
                  <button onClick={() => setActiveScreen('whosAway')}
                    className="w-full text-sm font-semibold py-1"
                    style={{ color: colors.primary, background: 'none', border: 'none', cursor: 'pointer' }}>
                    +{awayToday.length - 3} more people away
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. Quick Actions */}
        <div className="mb-5">
          <h2 className="text-base font-bold mb-2" style={{ color: colors.textPrimary }}>Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setActiveScreen('newRequest')}
              className="text-white p-3 rounded-xl shadow-md flex items-center justify-center gap-2"
              style={{ background: colors.gradientCard, border: 'none', cursor: 'pointer' }}>
              <PlusIcon className="w-4 h-4" />
              <span className="font-semibold text-sm">New Request</span>
            </button>
            <button onClick={() => setActiveScreen('allocations')}
              className="text-white p-3 rounded-xl shadow-md flex items-center justify-center gap-2"
              style={{ background: colors.gradientButton, border: 'none', cursor: 'pointer' }}>
              <FileTextIcon className="w-4 h-4" />
              <span className="font-semibold text-sm">My Allocations</span>
            </button>
          </div>
        </div>

        {/* 3. Stress Days */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-bold" style={{ color: colors.textPrimary }}>Stress Days</h2>
            <button onClick={() => setActiveScreen('allStressDays')}
              className="text-sm font-semibold" style={{ color: colors.primary, background: 'none', border: 'none', cursor: 'pointer' }}>
              View All →
            </button>
          </div>
          {loading ? (
            <div className="rounded-xl p-3 text-center" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <p className="text-sm" style={{ color: colors.textMuted }}>Loading...</p>
            </div>
          ) : stressDays.length === 0 ? (
            <div className="rounded-xl p-3 text-center" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <p className="text-sm" style={{ color: colors.textMuted }}>No stress days found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stressDays.slice(0, 3).map((day) => (
                <div key={day.id} className="rounded-xl p-3 shadow-sm"
                  style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: '#f59e0b' }} />
                    <div className="flex-1">
                      <p className="font-bold text-sm" style={{ color: colors.textPrimary }}>{day.name}</p>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" style={{ color: colors.textLight }} />
                        <p className="text-xs" style={{ color: colors.textMuted }}>
                          {formatDate(day.start_date)} → {formatDate(day.end_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Public Holidays */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-bold" style={{ color: colors.textPrimary }}>Public Holidays</h2>
            <button onClick={() => setActiveScreen('allPublicHolidays')}
              className="text-sm font-semibold" style={{ color: colors.primary, background: 'none', border: 'none', cursor: 'pointer' }}>
              View All →
            </button>
          </div>
          {loading ? (
            <div className="rounded-xl p-3 text-center" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <p className="text-sm" style={{ color: colors.textMuted }}>Loading...</p>
            </div>
          ) : publicHolidays.length === 0 ? (
            <div className="rounded-xl p-3 text-center" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <p className="text-sm" style={{ color: colors.textMuted }}>No public holidays found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {publicHolidays.slice(0, 3).map((holiday) => (
                <div key={holiday.id} className="rounded-xl p-3 shadow-sm"
                  style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: colors.primary }} />
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: colors.textPrimary }}>{holiday.name}</p>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" style={{ color: colors.textLight }} />
                        <p className="text-xs" style={{ color: colors.textMuted }}>{formatDate(holiday.date_from)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <BottomNav active="dashboard" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default DashboardScreen
