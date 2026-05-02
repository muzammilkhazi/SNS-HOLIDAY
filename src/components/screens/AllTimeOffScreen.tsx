// ============================================
// sns-holiday-app — All Time Off Screen (Dynamic)
// ============================================

import { useState, useEffect } from 'react'
import type { ScreenName } from '../../types'
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
  session?: unknown
}

type FilterType = 'all' | 'approved' | 'pending'

const STATE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Draft',           color: '#9ca3af', bg: '#f3f4f6' },
  confirm:   { label: 'Pending',         color: '#f59e0b', bg: '#fef3c7' },
  validate1: { label: 'Second Approval', color: '#f59e0b', bg: '#fef3c7' },
  validate:  { label: 'Approved',        color: '#22c55e', bg: '#dcfce7' },
  refuse:    { label: 'Refused',         color: '#ef4444', bg: '#fee2e2' },
}

const AllTimeOffScreen = ({ setActiveScreen }: AllTimeOffScreenProps) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)

  // # Filter popup state
  const [showFilterPopup, setShowFilterPopup] = useState(false)
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('all')
  const [leaveTypeOptions, setLeaveTypeOptions] = useState<string[]>([])

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    setLoading(true)
    try {
      const res = await fetch('/web/dataset/call_kw/hr.leave/search_read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 7,
          params: {
            model: 'hr.leave',
            method: 'search_read',
            args: [[['holiday_type', '=', 'employee']]],
            kwargs: {
              fields: [
                'id', 'name', 'holiday_status_id',
                'request_date_from', 'request_date_to',
                'number_of_days', 'state', 'employee_id',
              ],
              order: 'request_date_from desc',
              limit: 50,
            },
          },
        }),
      })
      const data = await res.json()
      if (data.result) {
        setRequests(data.result)
        // # Extract unique leave type names for filter options
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
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  const approvedList = requests.filter(r => r.state === 'validate' || r.state === 'validate1')
  const pendingList = requests.filter(r => r.state !== 'validate' && r.state !== 'validate1')

  // # Apply both status filter and leave type filter
  const filteredRequests = requests.filter(r => {
    const statusMatch =
      activeFilter === 'approved' ? (r.state === 'validate' || r.state === 'validate1') :
      activeFilter === 'pending' ? (r.state !== 'validate' && r.state !== 'validate1') :
      true
    const typeMatch = selectedLeaveType === 'all' || r.holiday_status_id[1] === selectedLeaveType
    return statusMatch && typeMatch
  })

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: colors.background }}>

      {/* # Detail View Popup */}
      {selectedRequest && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}
          onClick={() => setSelectedRequest(null)}>
          <div
            style={{ backgroundColor: colors.cardBg, borderRadius: 24, width: '100%', maxWidth: 380, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
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
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: colors.gradientCard }}>
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
                { label: 'From', value: formatDate(selectedRequest.request_date_from) },
                { label: 'To', value: formatDate(selectedRequest.request_date_to) },
                { label: 'Duration', value: `${selectedRequest.number_of_days} day${selectedRequest.number_of_days !== 1 ? 's' : ''}` },
                { label: 'Request ID', value: `#${selectedRequest.id}` },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 8, borderBottomWidth: 1, borderColor: colors.border }}>
                  <span style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600 }}>{row.label}</span>
                  <span style={{ fontSize: 13, color: colors.textPrimary, fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}

              <button onClick={() => setSelectedRequest(null)}
                className="w-full py-3 rounded-xl font-bold text-sm text-white mt-4"
                style={{ background: colors.gradientButton, border: 'none', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* # Filter Popup */}
{showFilterPopup && (
  <div
    style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    onClick={() => setShowFilterPopup(false)}>
    <div
      style={{ backgroundColor: '#ffffff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430, padding: '12px 20px 32px', boxShadow: '0 -8px 32px rgba(0,0,0,0.15)' }}
      onClick={(e) => e.stopPropagation()}>

      {/* # Drag handle */}
      <div style={{ width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 99, margin: '0 auto 20px' }} />

      {/* # Popup header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a1035' }}>Filter by Leave Type</h3>
        <button onClick={() => setShowFilterPopup(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af' }}>
          ✕
        </button>
      </div>

      {/* # All option */}
      <button
        onClick={() => { setSelectedLeaveType('all'); setShowFilterPopup(false) }}
        style={{
          width: '100%', padding: '12px 16px',
          borderRadius: 12, marginBottom: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: `1.5px solid ${selectedLeaveType === 'all' ? colors.primary : '#e5e7eb'}`,
          backgroundColor: selectedLeaveType === 'all' ? '#f5f3ff' : '#ffffff',
          cursor: 'pointer',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* # Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: colors.gradientButton,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#ffffff' }}>All</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: selectedLeaveType === 'all' ? colors.primary : '#1a1035' }}>
            All Leave Types
          </span>
        </div>
        {selectedLeaveType === 'all' && (
          <span style={{ color: colors.primary, fontWeight: 700, fontSize: 16 }}>✓</span>
        )}
      </button>

      {/* # Leave type options */}
      {leaveTypeOptions.map((type) => {
        const count = requests.filter(r => r.holiday_status_id[1] === type).length
        const initials = type.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
        const isSelected = selectedLeaveType === type
        return (
          <button
            key={type}
            onClick={() => { setSelectedLeaveType(type); setShowFilterPopup(false) }}
            style={{
              width: '100%', padding: '12px 16px',
              borderRadius: 12, marginBottom: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              border: `1.5px solid ${isSelected ? colors.primary : '#e5e7eb'}`,
              backgroundColor: isSelected ? '#f5f3ff' : '#ffffff',
              cursor: 'pointer',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* # Initials avatar */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                backgroundColor: isSelected ? colors.primary : '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: isSelected ? '#ffffff' : '#6b7280' }}>
                  {initials}
                </span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: isSelected ? colors.primary : '#1a1035', textAlign: 'left' }}>
                {type}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* # Count badge */}
              <div style={{
                backgroundColor: isSelected ? colors.primary : '#f3f4f6',
                borderRadius: 20, paddingLeft: 8, paddingRight: 8,
                paddingTop: 2, paddingBottom: 2,
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? '#ffffff' : '#6b7280' }}>
                  {count}
                </span>
              </div>
              {isSelected && (
                <span style={{ color: colors.primary, fontWeight: 700, fontSize: 16 }}>✓</span>
              )}
            </div>
          </button>
        )
      })}

      {/* # Clear filter button */}
      {selectedLeaveType !== 'all' && (
        <button
          onClick={() => { setSelectedLeaveType('all'); setShowFilterPopup(false) }}
          style={{
            width: '100%', padding: '14px',
            borderRadius: 12, marginTop: 4,
            border: 'none', cursor: 'pointer',
            backgroundColor: '#fef2f2', color: '#dc2626',
            fontSize: 14, fontWeight: 600,
          }}>
          🗑️ Clear Filter
        </button>
      )}
    </div>
  </div>
)}

      {/* # Header */}
      <div className="p-4 shadow-lg" style={{ background: colors.gradientHeader }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setActiveScreen('dashboard')}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <ChevronRightIcon className="w-5 h-5 text-white rotate-180" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-white">All Time Off</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {selectedLeaveType !== 'all' ? `Filtered: ${selectedLeaveType}` : 'All leave requests'}
            </p>
          </div>
          {/* # Filter button — shows dot if filter active */}
          <button
            onClick={() => setShowFilterPopup(true)}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: selectedLeaveType !== 'all' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)', position: 'relative' }}>
            <FilterIcon className="w-5 h-5 text-white" />
            {selectedLeaveType !== 'all' && (
              <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fbbf24', border: '1.5px solid white' }} />
            )}
          </button>
        </div>

        {/* # Status filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => setActiveFilter('all')}
            className="px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all"
            style={{ backgroundColor: activeFilter === 'all' ? colors.cardBg : 'rgba(255,255,255,0.2)', color: activeFilter === 'all' ? colors.primary : 'white' }}>
            All ({requests.length})
          </button>
          <button onClick={() => setActiveFilter('approved')}
            className="px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all"
            style={{ backgroundColor: activeFilter === 'approved' ? colors.cardBg : 'rgba(255,255,255,0.2)', color: activeFilter === 'approved' ? colors.success : 'white' }}>
            Approved ({approvedList.length})
          </button>
          <button onClick={() => setActiveFilter('pending')}
            className="px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all"
            style={{ backgroundColor: activeFilter === 'pending' ? colors.cardBg : 'rgba(255,255,255,0.2)', color: activeFilter === 'pending' ? colors.warning : 'white' }}>
            Pending ({pendingList.length})
          </button>
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
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: colors.background }}>
              <CalendarIcon className="w-8 h-8" style={{ color: colors.textLight }} />
            </div>
            <p className="font-medium mb-2" style={{ color: colors.textSecondary }}>
              No {selectedLeaveType !== 'all' ? selectedLeaveType : activeFilter} requests found
            </p>
            <p className="text-sm" style={{ color: colors.textMuted }}>Try changing the filter</p>
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

                  <div className="flex items-center justify-between pt-3"
                    style={{ borderTopColor: colors.border, borderTopWidth: 1 }}>
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
                      View
                      <ChevronRightIcon className="w-3 h-3" />
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