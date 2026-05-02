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

interface LeaveRequest {
  id: number
  name: string | false
  holiday_status_id: [number, string]
  request_date_from: string
  request_date_to: string
  number_of_days: number
  state: string
  employee_id: [number, string]
}

interface PublicHoliday {
  id: number
  name: string
  date_from: string
  date_to: string
}

interface DashboardScreenProps {
  setActiveScreen: (screen: ScreenName) => void
  session?: UserSession | null
}

const STATE_LABELS: Record<string, { label: string; color: string }> = {
  draft:     { label: 'Draft',    color: '#9ca3af' },
  confirm:   { label: 'Pending',  color: '#f59e0b' },
  validate:  { label: 'Approved', color: '#22c55e' },
  validate1: { label: 'Approved', color: '#22c55e' },
  refuse:    { label: 'Refused',  color: '#ef4444' },
}

const DashboardScreen = ({ setActiveScreen, session }: DashboardScreenProps) => {
  const [leaveTypes, setLeaveTypes]         = useState<LeaveType[]>([])
  const [recentLeaves, setRecentLeaves]     = useState<LeaveRequest[]>([])
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>([])
  const [loading, setLoading]               = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchLeaveTypes(),
        fetchRecentLeaves(),
        fetchPublicHolidays(),
      ])
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaveTypes = async () => {
  const res = await fetch('/web/dataset/call_kw/hr.leave.type/search_read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      jsonrpc: '2.0', method: 'call', id: 4,
      params: {
        session_id: getSessionId(),
        model: 'hr.leave.type',
        method: 'search_read',
        args: [[]],
        kwargs: {
          fields: ['id', 'name'],
        },
      },
    }),
  })
  const data = await res.json()
  // # ADD THIS LINE TEMPORARILY
  if (data.result) setLeaveTypes(data.result)
}

  const fetchRecentLeaves = async () => {
    const currentSession = session || loadSession()
    const employeeId = currentSession?.employeeId

    const domain = employeeId
      ? [['holiday_type', '=', 'employee'], ['employee_id', '=', employeeId]]
      : [['holiday_type', '=', 'employee']]

    const res = await fetch('/web/dataset/call_kw/hr.leave/search_read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'call', id: 7,
        params: {
          session_id: getSessionId(),
          model: 'hr.leave',
          method: 'search_read',
          args: [domain],
          kwargs: {
            fields: ['id', 'name', 'holiday_status_id', 'request_date_from', 'request_date_to', 'number_of_days', 'state', 'employee_id'],
            order: 'request_date_from desc',
            limit: 5,
          },
        },
      }),
    })
    const data = await res.json()
    if (data.result) setRecentLeaves(data.result)
  }

  const fetchPublicHolidays = async () => {
    const res = await fetch('/web/dataset/call_kw/resource.calendar.leaves/search_read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'call', id: 8,
        params: {
          session_id: getSessionId(),
          model: 'resource.calendar.leaves',
          method: 'search_read',
          args: [[
            ['name', 'not ilike', 'Time Off'],
            ['name', 'not ilike', 'Test'],
            ['resource_id', '=', false],
          ]],
          kwargs: {
            fields: ['id', 'name', 'date_from', 'date_to'],
            order: 'date_from asc',
            limit: 5,
          },
        },
      }),
    })
    const data = await res.json()
    if (data.result) setPublicHolidays(data.result)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  const paidTimeOff = leaveTypes.find(l => l.name.toLowerCase().includes('paid'))
  const annualLeave = leaveTypes.find(l => l.name.toLowerCase().includes('annual'))

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: colors.background }}>

      {/* # Header */}
      <div className="p-6 pb-8 shadow-lg" style={{ background: colors.gradientHeader }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Time Off</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Manage your leave requests
            </p>
          </div>
          <button
            onClick={() => setActiveScreen('profile')}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <UserIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* # Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="backdrop-blur-md rounded-2xl p-4 shadow-md"
            style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#e0e7ff' }}>
                <CalendarIcon className="w-4 h-4" style={{ color: colors.primary }} />
              </div>
              <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>Paid Time Off</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
              {loading ? '...' : (paidTimeOff ? paidTimeOff.virtual_remaining_leaves : '0')}
            </p>
            <p className="text-xs mt-1" style={{ color: colors.textMuted }}>days remaining</p>
          </div>

          <div className="backdrop-blur-md rounded-2xl p-4 shadow-md"
            style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#f3e8ff' }}>
                <CalendarIcon className="w-4 h-4" style={{ color: colors.secondary }} />
              </div>
              <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>Annual Leave</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
              {loading ? '...' : (annualLeave ? annualLeave.virtual_remaining_leaves : '0')}
            </p>
            <p className="text-xs mt-1" style={{ color: colors.textMuted }}>days remaining</p>
          </div>
        </div>
      </div>

      {/* # Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {/* # Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: colors.textPrimary }}>Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setActiveScreen('newRequest')}
              className="text-white p-4 rounded-xl shadow-md flex items-center justify-center gap-2"
              style={{ background: colors.gradientCard }}>
              <PlusIcon className="w-5 h-5" />
              <span className="font-semibold text-sm">New Request</span>
            </button>
            <button onClick={() => setActiveScreen('allocations')}
              className="text-white p-4 rounded-xl shadow-md flex items-center justify-center gap-2"
              style={{ background: colors.gradientButton }}>
              <FileTextIcon className="w-5 h-5" />
              <span className="font-semibold text-sm">My Allocations</span>
            </button>
          </div>
        </div>

        {/* # Recent Requests */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold" style={{ color: colors.textPrimary }}>Recent Requests</h2>
            <button onClick={() => setActiveScreen('timeoff')}
              className="text-sm font-semibold" style={{ color: colors.primary }}>
              View All →
            </button>
          </div>

          {loading ? (
            <div className="rounded-xl p-4 text-center"
              style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <p style={{ color: colors.textMuted }}>Loading...</p>
            </div>
          ) : recentLeaves.length === 0 ? (
            <div className="rounded-xl p-4 text-center"
              style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <p style={{ color: colors.textMuted }}>No leave requests found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentLeaves.map((leave) => {
                const stateInfo = STATE_LABELS[leave.state] || { label: leave.state, color: '#9ca3af' }
                return (
                  <div key={leave.id} className="rounded-xl p-4 shadow-sm"
                    style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-12 rounded-full" style={{ backgroundColor: stateInfo.color }} />
                        <div>
                          <p className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
                            {leave.holiday_status_id[1]}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <CalendarIcon className="w-3 h-3" style={{ color: colors.textLight }} />
                            <p className="text-xs" style={{ color: colors.textMuted }}>
                              {formatDate(leave.request_date_from)} → {formatDate(leave.request_date_to)}
                            </p>
                          </div>
                          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                            {leave.number_of_days} day{leave.number_of_days !== 1 ? 's' : ''} • {leave.employee_id[1]}
                          </p>
                        </div>
                      </div>
                      <div className="px-2 py-1 rounded-lg"
                        style={{ backgroundColor: stateInfo.color + '20' }}>
                        <span className="text-xs font-bold" style={{ color: stateInfo.color }}>
                          {stateInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* # Public Holidays */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold" style={{ color: colors.textPrimary }}>Public Holidays</h2>
            <button onClick={() => setActiveScreen('allPublicHolidays')}
              className="text-sm font-semibold" style={{ color: colors.primary }}>
              View All →
            </button>
          </div>

          {loading ? (
            <div className="rounded-xl p-4 text-center"
              style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <p style={{ color: colors.textMuted }}>Loading...</p>
            </div>
          ) : publicHolidays.length === 0 ? (
            <div className="rounded-xl p-4 text-center"
              style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <p style={{ color: colors.textMuted }}>No public holidays found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {publicHolidays.slice(0, 3).map((holiday) => (
                <div key={holiday.id} className="rounded-xl p-4 shadow-sm"
                  style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-12 rounded-full" style={{ backgroundColor: colors.primary }} />
                      <div>
                        <p className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
                          {holiday.name}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <CalendarIcon className="w-3 h-3" style={{ color: colors.textLight }} />
                          <p className="text-xs" style={{ color: colors.textMuted }}>
                            {formatDate(holiday.date_from)}
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

      </div>

      <BottomNav active="dashboard" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default DashboardScreen