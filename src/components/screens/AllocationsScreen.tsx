// ============================================
// sns-holiday-app — Allocations Screen
// ============================================

import { useState, useEffect, useRef } from 'react'
import type { ScreenName } from '../../types'
import type { UserSession } from '../../services/api'
import { loadSession, getSessionId } from '../../services/api'
import { ChevronRightIcon, FileTextIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'
import { colors } from '../../constants/colors'

interface Allocation {
  id: number
  name: string | false
  holiday_status_id: [number, string]
  number_of_days: number
  state: string
  employee_id: [number, string]
  date_from: string
  date_to: string | false
}

interface AllocationsScreenProps {
  setActiveScreen: (screen: ScreenName) => void
  session: UserSession | null
}

const STATE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  draft:    { label: 'Draft',    color: '#9ca3af', bg: '#f3f4f6' },
  confirm:  { label: 'Pending',  color: '#f59e0b', bg: '#fef3c7' },
  validate1:{ label: 'Approved', color: '#22c55e', bg: '#dcfce7' },
  validate: { label: 'Approved', color: '#22c55e', bg: '#dcfce7' },
  refuse:   { label: 'Refused',  color: '#ef4444', bg: '#fee2e2' },
}

const FilterIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24"
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)

const AllocationsScreen = ({ setActiveScreen, session }: AllocationsScreenProps) => {
  const [isAdmin, setIsAdmin]               = useState<boolean>(session?.isAdmin === true)
  const isAdminRef                          = useRef(session?.isAdmin === true)
  const [allocations, setAllocations]       = useState<Allocation[]>([])
  const [loading, setLoading]               = useState(true)
  const [statusFilter, setStatusFilter]     = useState<string>('all')

  // # Multi-select leave type filter (same pattern as AllTimeOffScreen)
  const [showFilterPopup, setShowFilterPopup]       = useState(false)
  const [selectedLeaveTypes, setSelectedLeaveTypes] = useState<Set<string>>(new Set())

  useEffect(() => {
    const init = async () => {
      let admin = session?.isAdmin === true
      if (session?.isAdmin === undefined) admin = await resolveAdminStatus()
      isAdminRef.current = admin
      await fetchAllocations()
    }
    init()
    const onVisible = () => { if (document.visibilityState === 'visible') fetchAllocations() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    const interval = setInterval(() => fetchAllocations(), 30000)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
      clearInterval(interval)
    }
  }, [])

  // # Returns resolved admin boolean and updates state
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

  const fetchAllocations = async () => {
    setLoading(true)
    try {
      const currentSession = session || loadSession()
      const uid = currentSession?.uid

      // # Fetch ALL employee records for this user across all companies
      let employeeIds: number[] = currentSession?.employeeId ? [currentSession.employeeId] : []
      if (uid) {
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
                args: [[['user_id', '=', uid]]],
                kwargs: { fields: ['id'], limit: false },
              },
            }),
          })
          const empData = await empRes.json()
          if (empData.result?.length > 0) employeeIds = empData.result.map((e: { id: number }) => e.id)
        } catch { /* silent */ }
      }

      // # No employee IDs — abort
      if (employeeIds.length === 0) {
        setLoading(false)
        return
      }
      // # Filter by ALL employee records (covers multi-company users)
      const domain = [['employee_id', 'in', employeeIds]]

      const res = await fetch('/web/dataset/call_kw/hr.leave.allocation/search_read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 9,
          params: {
            session_id: getSessionId(),
            model: 'hr.leave.allocation',
            method: 'search_read',
            args: [domain],
            kwargs: {
              fields: ['id', 'name', 'holiday_status_id', 'number_of_days', 'state', 'employee_id', 'date_from', 'date_to'],
              order: 'date_from desc',
              // # Admin: no limit to show all; normal user: cap at 200
              limit: 200,
            },
          },
        }),
      })
      const data = await res.json()
      if (data.result) setAllocations(
        data.result.filter((a: Allocation) =>
          Array.isArray(a.holiday_status_id) && Array.isArray(a.employee_id)
        )
      )
    } catch (err) {
      console.error('Error fetching allocations:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string | false) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // # Unique leave types derived from loaded data
  const leaveTypeOptions = Array.from(
    new Map(allocations.map(a => [a.holiday_status_id[0], a.holiday_status_id[1]])).entries()
  ).map(([id, name]) => ({ id, name }))

  const toggleLeaveType = (name: string) => {
    setSelectedLeaveTypes(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const clearLeaveTypes = () => setSelectedLeaveTypes(new Set())

  // # Apply both status + multi leave-type filter
  const filteredAllocations = allocations.filter(a => {
    const statusMatch = statusFilter === 'all' || a.state === statusFilter
    const typeMatch   = selectedLeaveTypes.size === 0 || selectedLeaveTypes.has(a.holiday_status_id[1])
    return statusMatch && typeMatch
  })

  const statusCounts = {
    all:      allocations.length,
    validate: allocations.filter(a => a.state === 'validate' || a.state === 'validate1').length,
    confirm:  allocations.filter(a => a.state === 'confirm').length,
    refuse:   allocations.filter(a => a.state === 'refuse').length,
  }

  const hasTypeFilter = selectedLeaveTypes.size > 0

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: colors.background }}>

      {/* # Multi-select Filter Popup */}
      {showFilterPopup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowFilterPopup(false)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430, padding: '12px 20px 32px', boxShadow: '0 -8px 32px rgba(0,0,0,0.15)' }}
            onClick={(e) => e.stopPropagation()}>

            <div style={{ width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 99, margin: '0 auto 16px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a1035', margin: 0 }}>Filter by Leave Type</h3>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Select one or multiple types</p>
              </div>
              <button onClick={() => setShowFilterPopup(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af' }}>✕</button>
            </div>

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

            {/* # All Leave Types */}
            <button onClick={clearLeaveTypes}
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
            {leaveTypeOptions.map(({ id, name }) => {
              const isSelected = selectedLeaveTypes.has(name)
              const count      = allocations.filter(a => a.holiday_status_id[0] === id).length
              const initials   = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
              return (
                <button key={id} onClick={() => toggleLeaveType(name)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1.5px solid ${isSelected ? colors.primary : '#e5e7eb'}`, backgroundColor: isSelected ? '#f5f3ff' : '#ffffff', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${isSelected ? colors.primary : '#d1d5db'}`, backgroundColor: isSelected ? colors.primary : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                      {isSelected && <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>✓</span>}
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: isSelected ? colors.primary : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: isSelected ? '#ffffff' : '#6b7280' }}>{initials}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: isSelected ? colors.primary : '#1a1035' }}>{name}</span>
                  </div>
                  <div style={{ backgroundColor: isSelected ? colors.primary : '#f3f4f6', borderRadius: 20, padding: '2px 8px' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? '#ffffff' : '#6b7280' }}>{count}</span>
                  </div>
                </button>
              )
            })}

            <button onClick={() => setShowFilterPopup(false)}
              className="w-full py-3 rounded-xl font-bold text-sm text-white mt-2"
              style={{ background: colors.gradientButton, border: 'none', cursor: 'pointer' }}>
              {hasTypeFilter ? `Show ${filteredAllocations.length} result${filteredAllocations.length !== 1 ? 's' : ''}` : 'Show All'}
            </button>
          </div>
        </div>
      )}

      {/* # Header */}
      <div className="px-4 pt-4 pb-3 shadow-md" style={{ background: colors.gradientHeader }}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setActiveScreen('dashboard')}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer' }}>
            <ChevronRightIcon className="w-5 h-5 text-white rotate-180" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-white">My Allocations</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {loading ? '...' : hasTypeFilter
                ? `${[...selectedLeaveTypes].join(', ')}`
                : `${allocations.length} Allocation${allocations.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={() => setShowFilterPopup(true)}
            className="p-2 rounded-full backdrop-blur-sm relative"
            style={{ backgroundColor: hasTypeFilter ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer' }}>
            <FilterIcon className="w-5 h-5" style={{ color: hasTypeFilter ? colors.primary : 'white' }} />
            {hasTypeFilter && (
              <div style={{ position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#fbbf24', border: '1.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#fff' }}>{selectedLeaveTypes.size}</span>
              </div>
            )}
          </button>
        </div>

        {/* # Status filter tabs — Approved/Pending/Refused admin only */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => setStatusFilter('all')}
            className="px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold transition-all"
            style={{ backgroundColor: statusFilter === 'all' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.2)', color: statusFilter === 'all' ? colors.primary : 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer' }}>
            All ({statusCounts.all})
          </button>
          {isAdmin && (
            <button onClick={() => setStatusFilter('validate')}
              className="px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold transition-all"
              style={{ backgroundColor: statusFilter === 'validate' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.2)', color: statusFilter === 'validate' ? colors.primary : 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer' }}>
              Approved ({statusCounts.validate})
            </button>
          )}
          {isAdmin && (
            <button onClick={() => setStatusFilter('confirm')}
              className="px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold transition-all"
              style={{ backgroundColor: statusFilter === 'confirm' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.2)', color: statusFilter === 'confirm' ? colors.primary : 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer' }}>
              Pending ({statusCounts.confirm})
            </button>
          )}
          {isAdmin && (
            <button onClick={() => setStatusFilter('refuse')}
              className="px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold transition-all"
              style={{ backgroundColor: statusFilter === 'refuse' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.2)', color: statusFilter === 'refuse' ? colors.primary : 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer' }}>
              Refused ({statusCounts.refuse})
            </button>
          )}
        </div>
      </div>

      {/* # Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-12">
            <p style={{ color: colors.textMuted }}>Loading...</p>
          </div>
        ) : filteredAllocations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.background }}>
              <FileTextIcon className="w-8 h-8" style={{ color: colors.textLight }} />
            </div>
            <p className="font-medium mb-2" style={{ color: colors.textSecondary }}>No allocations found</p>
            <p className="text-sm" style={{ color: colors.textMuted }}>Try changing the filters</p>
            {(hasTypeFilter || statusFilter !== 'all') && (
              <button onClick={() => { clearLeaveTypes(); setStatusFilter('all') }}
                className="mt-4 px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ background: colors.gradientButton, border: 'none', cursor: 'pointer' }}>
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAllocations.map((alloc) => {
              const stateInfo = STATE_LABELS[alloc.state] || { label: alloc.state, color: '#9ca3af', bg: '#f3f4f6' }
              return (
                <div key={alloc.id} className="rounded-2xl p-4 shadow-sm"
                  style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: 1 }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-sm" style={{ color: colors.textPrimary }}>
                        {alloc.holiday_status_id[1]}
                      </p>
                      <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                        {alloc.employee_id[1]}
                      </p>
                    </div>
                    <div className="px-3 py-1 rounded-full" style={{ backgroundColor: stateInfo.bg }}>
                      <span className="text-xs font-bold" style={{ color: stateInfo.color }}>
                        {stateInfo.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2"
                    style={{ borderTopWidth: 1, borderColor: colors.border }}>
                    <p className="text-xs" style={{ color: colors.textMuted }}>
                      {formatDate(alloc.date_from)} → {formatDate(alloc.date_to)}
                    </p>
                    <p className="text-sm font-bold" style={{ color: colors.primary }}>
                      {alloc.number_of_days} day{alloc.number_of_days !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav active="allocations" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default AllocationsScreen
