// ============================================
// sns-holiday-app — All Time Off Screen (Dynamic)
// ============================================

import { useState, useEffect, useRef } from 'react'
import type { ScreenName } from '../../types'
import type { UserSession } from '../../services/api'
import { loadSession, getSessionId } from '../../services/api'
import { CalendarIcon, ClockIcon, ChevronRightIcon, FilterIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'
import { colors } from '../../constants/colors'

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

interface AllTimeOffScreenProps {
  setActiveScreen: (screen: ScreenName) => void
  session?: UserSession | null
}

type FilterType = 'all' | 'approved' | 'pending'

const STATE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Draft',           color: '#9ca3af', bg: '#f3f4f6' },
  confirm:   { label: 'Pending',         color: '#f59e0b', bg: '#fef3c7' },
  validate1: { label: 'Second Approval', color: '#f59e0b', bg: '#fef3c7' },
  validate:  { label: 'Approved',        color: '#22c55e', bg: '#dcfce7' },
  refuse:    { label: 'Refused',         color: '#ef4444', bg: '#fee2e2' },
}

const AllTimeOffScreen = ({ setActiveScreen, session }: AllTimeOffScreenProps) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(session?.isAdmin === true)
  const isAdminRef            = useRef(session?.isAdmin === true)

  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)

  // # Multi-select leave type filter
  const [showFilterPopup, setShowFilterPopup] = useState(false)
  const [selectedLeaveTypes, setSelectedLeaveTypes] = useState<Set<string>>(new Set())
  const [leaveTypeOptions, setLeaveTypeOptions] = useState<string[]>([])

  useEffect(() => {
    const init = async () => {
      let admin = session?.isAdmin === true
      if (session?.isAdmin === undefined) admin = await resolveAdminStatus()
      isAdminRef.current = admin
      await fetchLeaveRequests(admin)
    }
    init()
    const onVisible = () => { if (document.visibilityState === 'visible') fetchLeaveRequests(isAdminRef.current) }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    const interval = setInterval(() => fetchLeaveRequests(isAdminRef.current), 30000)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
      clearInterval(interval)
    }
  }, [])

  // # Returns the resolved admin boolean and updates state
  const resolveAdminStatus = async (): Promise<boolean> => {
    try {
      const res = await fetch('/web/dataset/call_kw/res.users/has_group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 99,
          params: { model: 'res.users', method: 'has_group', args: ['base.group_system'], kwargs: {} },
        }),
      })
      const data = await res.json()
      const result = data.result === true
      setIsAdmin(result)
      return result
    } catch {
      setIsAdmin(false)
      return false
    }
  }

  const fetchLeaveRequests = async (adminStatus: boolean) => {
    setLoading(true)
    try {
      const currentSession = session || loadSession()
      let employeeId = currentSession?.employeeId

      // # For non-admins: ensure we have the employee ID to filter by
      if (!adminStatus && !employeeId && currentSession?.uid) {
        try {
          const empRes = await fetch('/web/dataset/call_kw/hr.employee/search_read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              jsonrpc: '2.0', method: 'call', id: 3,
              params: {
                session_id: getSessionId(),
                model: 'hr.employee',
                method: 'search_read',
                args: [[['user_id', '=', currentSession.uid]]],
                kwargs: { fields: ['id'], limit: 1 },
              },
            }),
          })
          const empData = await empRes.json()
          if (empData.result?.length > 0) employeeId = empData.result[0].id
        } catch { /* silent */ }
      }

      // # Non-admin with no employee ID — abort to prevent data leak
      if (!adminStatus && !employeeId) {
        setLoading(false)
        return
      }
      // # Admin sees all; employee sees only their own
      const domain: unknown[] = adminStatus
        ? [['holiday_type', '=', 'employee']]
        : [['holiday_type', '=', 'employee'], ['employee_id', '=', employeeId]]

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
              limit: 100,
            },
          },
        }),
      })
      const data = await res.json()
      if (data.result) {
        setRequests(data.result)
        const types = [...new Set(data.result.map((r: LeaveRequest) => r.holiday_status_id[1]))] as string[]
        setLeaveTypeOptions(types)
      }
    } catch (err) {
      console.error('Error fetching leave requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // # Toggle a leave type in/out of the selection
  const toggleLeaveType = (type: string) => {
    setSelectedLeaveTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const clearLeaveTypes = () => setSelectedLeaveTypes(new Set())

  const approvedList = requests.filter(r => r.state === 'validate' || r.state === 'validate1')
  const pendingList  = requests.filter(r => r.state !== 'validate' && r.state !== 'validate1')

  // # Apply status + multi leave-type filter
  const filteredRequests = requests.filter(r => {
    const statusMatch =
      activeFilter === 'approved' ? (r.state === 'validate' || r.state === 'validate1') :
      activeFilter === 'pending'  ? (r.state !== 'validate' && r.state !== 'validate1') :
      true
    const typeMatch = selectedLeaveTypes.size === 0 || selectedLeaveTypes.has(r.holiday_status_id[1])
    return statusMatch && typeMatch
  })

  const hasTypeFilter = selectedLeaveTypes.size > 0

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: colors.background }}>

      {/* # Detail View Popup */}
      {selectedRequest && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}
          onClick={() => setSelectedRequest(null)}>
          <div style={{ backgroundColor: colors.cardBg, borderRadius: 24, width: '100%', maxWidth: 380, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="p-4" style={{ background: colors.gradientHeader }}>
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-base">Leave Details</h3>
                <button onClick={() => setSelectedRequest(null)}
                  style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
              </div>
            </div>
            <div className="p-5">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderColor: colors.border, marginBottom: 12 }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: colors.gradientCard }}>
                    {selectedRequest.employee_id[1].charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: colors.textPrimary }}>{selectedRequest.employee_id[1]}</p>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>{selectedRequest.holiday_status_id[1]}</p>
                  </div>
                </div>
                {(() => {
                  const stateInfo = STATE_LABELS[selectedRequest.state] || { label: selectedRequest.state, color: '#9ca3af', bg: '#f3f4f6' }
                  return (
                    <div className="px-3 py-1 rounded-full" style={{ backgroundColor: stateInfo.bg }}>
                      <span className="text-xs font-bold" style={{ color: stateInfo.color }}>{stateInfo.label}</span>
                    </div>
                  )
                })()}
              </div>
              {[
                { label: 'Leave Type', value: selectedRequest.holiday_status_id[1] },
                { label: 'From',       value: formatDate(selectedRequest.request_date_from) },
                { label: 'To',         value: formatDate(selectedRequest.request_date_to) },
                { label: 'Duration',   value: `${selectedRequest.number_of_days} day${selectedRequest.number_of_days !== 1 ? 's' : ''}` },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 8, borderBottomWidth: 1, borderColor: colors.border }}>
                  <span style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600 }}>{row.label}</span>
                  <span style={{ fontSize: 13, color: colors.textPrimary, fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
              {/* # Description — from the name field compiled during submission */}
              {!!selectedRequest.name && (
                <div style={{ paddingTop: 10, paddingBottom: 10, borderBottomWidth: 1, borderColor: colors.border }}>
                  <span style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600, display: 'block', marginBottom: 4 }}>Description</span>
                  <span style={{ fontSize: 12, color: colors.textPrimary, lineHeight: 1.6, display: 'block', whiteSpace: 'pre-line' }}>
                    {(selectedRequest.name as string).replace(/ \| /g, '\n')}
                  </span>
                </div>
              )}
              <button onClick={() => setSelectedRequest(null)}
                className="w-full py-3 rounded-xl font-bold text-sm text-white mt-4"
                style={{ background: colors.gradientButton, border: 'none', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* # Multi-select Filter Popup */}
      {showFilterPopup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowFilterPopup(false)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430, padding: '12px 20px 32px', boxShadow: '0 -8px 32px rgba(0,0,0,0.15)' }}
            onClick={(e) => e.stopPropagation()}>

            {/* # Drag handle */}
            <div style={{ width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 99, margin: '0 auto 16px' }} />

            {/* # Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a1035', margin: 0 }}>Filter by Leave Type</h3>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Select one or multiple types</p>
              </div>
              <button onClick={() => setShowFilterPopup(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af' }}>✕</button>
            </div>

            {/* # Selected count badge */}
            {hasTypeFilter && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 8 }}>
                <div style={{ backgroundColor: colors.primary + '15', borderRadius: 20, padding: '4px 12px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: colors.primary }}>
                    {selectedLeaveTypes.size} type{selectedLeaveTypes.size > 1 ? 's' : ''} selected
                  </span>
                </div>
                <button onClick={clearLeaveTypes}
                  style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Clear all
                </button>
              </div>
            )}

            {/* # All Leave Types — clears selection */}
            <button
              onClick={clearLeaveTypes}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1.5px solid ${!hasTypeFilter ? colors.primary : '#e5e7eb'}`, backgroundColor: !hasTypeFilter ? '#f5f3ff' : '#ffffff', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: colors.gradientButton, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#ffffff' }}>All</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: !hasTypeFilter ? colors.primary : '#1a1035' }}>All Leave Types</span>
              </div>
              {!hasTypeFilter && <span style={{ color: colors.primary, fontWeight: 700 }}>✓</span>}
            </button>

            {/* # Leave type options with checkboxes */}
            {leaveTypeOptions.map((type) => {
              const isSelected = selectedLeaveTypes.has(type)
              const count      = requests.filter(r => r.holiday_status_id[1] === type).length
              const initials   = type.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
              return (
                <button key={type} onClick={() => toggleLeaveType(type)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1.5px solid ${isSelected ? colors.primary : '#e5e7eb'}`, backgroundColor: isSelected ? '#f5f3ff' : '#ffffff', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* # Checkbox */}
                    <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${isSelected ? colors.primary : '#d1d5db'}`, backgroundColor: isSelected ? colors.primary : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                      {isSelected && <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>✓</span>}
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: isSelected ? colors.primary : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: isSelected ? '#ffffff' : '#6b7280' }}>{initials}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: isSelected ? colors.primary : '#1a1035', textAlign: 'left' }}>{type}</span>
                  </div>
                  <div style={{ backgroundColor: isSelected ? colors.primary : '#f3f4f6', borderRadius: 20, padding: '2px 8px' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? '#ffffff' : '#6b7280' }}>{count}</span>
                  </div>
                </button>
              )
            })}

            {/* # Apply button */}
            <button onClick={() => setShowFilterPopup(false)}
              className="w-full py-3 rounded-xl font-bold text-sm text-white mt-2"
              style={{ background: colors.gradientButton, border: 'none', cursor: 'pointer' }}>
              {hasTypeFilter ? `Show ${filteredRequests.length} result${filteredRequests.length !== 1 ? 's' : ''}` : 'Show All'}
            </button>
          </div>
        </div>
      )}

      {/* # Header */}
      <div className="p-4 shadow-lg" style={{ background: colors.gradientHeader }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setActiveScreen('dashboard')}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer' }}>
            <ChevronRightIcon className="w-5 h-5 text-white rotate-180" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-white">All Time Off</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {hasTypeFilter
                ? `${[...selectedLeaveTypes].join(', ')}`
                : 'All leave requests'}
            </p>
          </div>
          <button onClick={() => setShowFilterPopup(true)}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: hasTypeFilter ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)', position: 'relative', border: 'none', cursor: 'pointer' }}>
            <FilterIcon className="w-5 h-5 text-white" />
            {hasTypeFilter && (
              <div style={{ position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#fbbf24', border: '1.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#fff' }}>{selectedLeaveTypes.size}</span>
              </div>
            )}
          </button>
        </div>

        {/* # Status filter tabs — Approved & Pending admin only */}
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => setActiveFilter('all')}
            className="px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all"
            style={{ backgroundColor: activeFilter === 'all' ? colors.cardBg : 'rgba(255,255,255,0.2)', color: activeFilter === 'all' ? colors.primary : 'white', border: 'none', cursor: 'pointer' }}>
            All ({requests.length})
          </button>
          {isAdmin && (
            <button onClick={() => setActiveFilter('approved')}
              className="px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all"
              style={{ backgroundColor: activeFilter === 'approved' ? colors.cardBg : 'rgba(255,255,255,0.2)', color: activeFilter === 'approved' ? colors.success : 'white', border: 'none', cursor: 'pointer' }}>
              Approved ({approvedList.length})
            </button>
          )}
          {isAdmin && (
            <button onClick={() => setActiveFilter('pending')}
              className="px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all"
              style={{ backgroundColor: activeFilter === 'pending' ? colors.cardBg : 'rgba(255,255,255,0.2)', color: activeFilter === 'pending' ? colors.warning : 'white', border: 'none', cursor: 'pointer' }}>
              Pending ({pendingList.length})
            </button>
          )}
        </div>
      </div>

      {/* # Requests list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-12">
            <p style={{ color: colors.textMuted }}>Loading...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.background }}>
              <CalendarIcon className="w-8 h-8" style={{ color: colors.textLight }} />
            </div>
            <p className="font-medium mb-2" style={{ color: colors.textSecondary }}>No requests found</p>
            <p className="text-sm" style={{ color: colors.textMuted }}>Try changing the filters</p>
            {hasTypeFilter && (
              <button onClick={clearLeaveTypes}
                className="mt-3 px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ background: colors.gradientButton, border: 'none', cursor: 'pointer' }}>
                Clear Type Filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => {
              const stateInfo = STATE_LABELS[request.state] || { label: request.state, color: '#9ca3af', bg: '#f3f4f6' }
              return (
                <div key={request.id} className="rounded-2xl p-4 shadow-sm"
                  style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: 1 }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm"
                        style={{ background: colors.gradientCard }}>
                        {request.employee_id[1].charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm" style={{ color: colors.textPrimary }}>{request.employee_id[1]}</h3>
                        <p className="text-xs" style={{ color: colors.textSecondary }}>{request.holiday_status_id[1]}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full" style={{ backgroundColor: stateInfo.bg }}>
                      <span className="text-xs font-semibold" style={{ color: stateInfo.color }}>
                        {stateInfo.label === 'Approved' ? '✓ ' : '⏱ '}{stateInfo.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTopColor: colors.border, borderTopWidth: 1 }}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" style={{ color: colors.textSecondary }} />
                        <span className="text-xs" style={{ color: colors.textSecondary }}>{formatDate(request.request_date_from)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" style={{ color: colors.textSecondary }} />
                        <span className="text-xs" style={{ color: colors.textSecondary }}>{request.number_of_days} day{request.number_of_days !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedRequest(request)}
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{ color: colors.primary, background: 'none', border: 'none', cursor: 'pointer' }}>
                      View <ChevronRightIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav active="timeoff" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default AllTimeOffScreen
