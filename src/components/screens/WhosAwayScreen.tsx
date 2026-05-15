// ============================================
// sns-holiday-app — Who's Away Screen
// ============================================

import { useState, useEffect } from 'react'
import type { ScreenName } from '../../types'
import type { UserSession } from '../../services/api'
import { CalendarIcon, ChevronRightIcon, FilterIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'
import { colors } from '../../constants/colors'
import { getSessionId } from '../../services/api'

interface AwayRecord {
  id: number
  employee_id: [number, string]
  holiday_status_id: [number, string]
  request_date_from: string
  request_date_to: string
  state: string
}

interface WhosAwayScreenProps {
  setActiveScreen: (screen: ScreenName) => void
  session?: UserSession | null
}

const WhosAwayScreen = ({ setActiveScreen, session }: WhosAwayScreenProps) => {
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today')
  const [todayList, setTodayList] = useState<AwayRecord[]>([])
  const [tomorrowList, setTomorrowList] = useState<AwayRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<AwayRecord | null>(null)

  // # Filter popup
  const [showFilterPopup, setShowFilterPopup] = useState(false)
  const [leaveTypeOptions, setLeaveTypeOptions] = useState<string[]>([])
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('all')

  useEffect(() => {
    // # Guard: redirect non-admins back to dashboard
    if (session?.isAdmin === false) {
      setActiveScreen('dashboard')
      return
    }
    fetchData()
  }, [])

  const toDateStr = (d: Date) => d.toISOString().split('T')[0]

  const fetchData = async () => {
    setLoading(true)
    try {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)

      const [todayRes, tomorrowRes] = await Promise.all([
        fetchAway(toDateStr(today)),
        fetchAway(toDateStr(tomorrow)),
      ])
      setTodayList(todayRes)
      setTomorrowList(tomorrowRes)

      // # Collect unique leave type names for filter
      const all = [...todayRes, ...tomorrowRes]
      const types = [...new Set(all.map((r) => r.holiday_status_id[1]))] as string[]
      setLeaveTypeOptions(types)
    } catch (err) {
      console.error('WhosAway fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAway = async (dateStr: string): Promise<AwayRecord[]> => {
    try {
      const res = await fetch('/web/dataset/call_kw/hr.leave/search_read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 21,
          params: {
            session_id: getSessionId(),
            model: 'hr.leave',
            method: 'search_read',
            args: [[
              ['state', 'in', ['validate', 'validate1']],
              ['request_date_from', '<=', dateStr],
              ['request_date_to', '>=', dateStr],
              ['holiday_type', '=', 'employee'],
            ]],
            kwargs: {
              fields: ['id', 'employee_id', 'holiday_status_id', 'request_date_from', 'request_date_to', 'state'],
              order: 'employee_id asc',
              limit: 100,
            },
          },
        }),
      })
      const data = await res.json()
      return data.result || []
    } catch {
      return []
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  const currentList = (activeTab === 'today' ? todayList : tomorrowList).filter(
    (r) => selectedLeaveType === 'all' || r.holiday_status_id[1] === selectedLeaveType
  )

  const activeCount = activeTab === 'today' ? todayList.length : tomorrowList.length

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: colors.background }}>

      {/* # Detail Popup */}
      {selectedRecord && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}
          onClick={() => setSelectedRecord(null)}>
          <div
            style={{ backgroundColor: colors.cardBg, borderRadius: 24, width: '100%', maxWidth: 380, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="p-4" style={{ background: colors.gradientHeader }}>
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-base">Leave Details</h3>
                <button onClick={() => setSelectedRecord(null)}
                  style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
              </div>
            </div>
            <div className="p-5">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottomWidth: 1, borderColor: colors.border, marginBottom: 12 }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: colors.gradientCard, flexShrink: 0 }}>
                  {selectedRecord.employee_id[1].charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: colors.textPrimary }}>{selectedRecord.employee_id[1]}</p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>{selectedRecord.holiday_status_id[1]}</p>
                </div>
              </div>
              {[
                { label: 'Leave Type', value: selectedRecord.holiday_status_id[1] },
                { label: 'From', value: formatDate(selectedRecord.request_date_from) },
                { label: 'To', value: formatDate(selectedRecord.request_date_to) },
                { label: 'Status', value: '✓ Approved' },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 8, borderBottomWidth: 1, borderColor: colors.border }}>
                  <span style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600 }}>{row.label}</span>
                  <span style={{ fontSize: 13, color: colors.textPrimary, fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
              <button onClick={() => setSelectedRecord(null)}
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
            <div style={{ width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 99, margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a1035' }}>Filter by Leave Type</h3>
              <button onClick={() => setShowFilterPopup(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af' }}>✕</button>
            </div>

            {/* # All option */}
            <button
              onClick={() => { setSelectedLeaveType('all'); setShowFilterPopup(false) }}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1.5px solid ${selectedLeaveType === 'all' ? colors.primary : '#e5e7eb'}`, backgroundColor: selectedLeaveType === 'all' ? '#f5f3ff' : '#ffffff', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: colors.gradientButton, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#ffffff' }}>All</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: selectedLeaveType === 'all' ? colors.primary : '#1a1035' }}>All Leave Types</span>
              </div>
              {selectedLeaveType === 'all' && <span style={{ color: colors.primary, fontWeight: 700 }}>✓</span>}
            </button>

            {/* # Leave type options */}
            {leaveTypeOptions.map((type) => {
              const isSelected = selectedLeaveType === type
              const initials = type.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
              return (
                <button key={type}
                  onClick={() => { setSelectedLeaveType(type); setShowFilterPopup(false) }}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1.5px solid ${isSelected ? colors.primary : '#e5e7eb'}`, backgroundColor: isSelected ? '#f5f3ff' : '#ffffff', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: isSelected ? colors.primary : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: isSelected ? '#ffffff' : '#6b7280' }}>{initials}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: isSelected ? colors.primary : '#1a1035' }}>{type}</span>
                  </div>
                  {isSelected && <span style={{ color: colors.primary, fontWeight: 700 }}>✓</span>}
                </button>
              )
            })}

            {selectedLeaveType !== 'all' && (
              <button onClick={() => { setSelectedLeaveType('all'); setShowFilterPopup(false) }}
                style={{ width: '100%', padding: '14px', borderRadius: 12, marginTop: 4, border: 'none', cursor: 'pointer', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: 14, fontWeight: 600 }}>
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
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer' }}>
            <ChevronRightIcon className="w-5 h-5 text-white rotate-180" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-white">Who's Away</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {activeCount} {activeCount === 1 ? 'person' : 'people'} away
            </p>
          </div>
          <button
            onClick={() => setShowFilterPopup(true)}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: selectedLeaveType !== 'all' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', position: 'relative' }}>
            <FilterIcon className="w-5 h-5 text-white" />
            {selectedLeaveType !== 'all' && (
              <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fbbf24', border: '1.5px solid white' }} />
            )}
          </button>
        </div>

        {/* # Today / Tomorrow tabs */}
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('today')}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
            style={{ backgroundColor: activeTab === 'today' ? colors.cardBg : 'rgba(255,255,255,0.2)', color: activeTab === 'today' ? colors.primary : 'white', border: 'none', cursor: 'pointer' }}>
            Today ({todayList.length})
          </button>
          <button onClick={() => setActiveTab('tomorrow')}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
            style={{ backgroundColor: activeTab === 'tomorrow' ? colors.cardBg : 'rgba(255,255,255,0.2)', color: activeTab === 'tomorrow' ? colors.primary : 'white', border: 'none', cursor: 'pointer' }}>
            Tomorrow ({tomorrowList.length})
          </button>
        </div>
      </div>

      {/* # List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-12">
            <p style={{ color: colors.textMuted }}>Loading...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: colors.background }}>
              <CalendarIcon className="w-8 h-8" style={{ color: colors.textLight }} />
            </div>
            <p className="font-medium mb-1" style={{ color: colors.textSecondary }}>
              No one is away {activeTab === 'today' ? 'today' : 'tomorrow'}
            </p>
            <p className="text-sm" style={{ color: colors.textMuted }}>Everyone is in office</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((record) => (
              <div key={record.id} className="rounded-2xl shadow-sm"
                style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>

                {/* # Top row — avatar, name, status */}
                <div className="flex items-center justify-between p-4 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: colors.gradientCard }}>
                      {record.employee_id[1].charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: colors.textPrimary }}>
                        {record.employee_id[1]}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <CalendarIcon className="w-3 h-3" style={{ color: colors.textLight }} />
                        <p className="text-xs" style={{ color: colors.textMuted }}>
                          {formatDate(record.request_date_from)}
                          {record.request_date_from !== record.request_date_to
                            ? ` - ${formatDate(record.request_date_to)}`
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full" style={{ backgroundColor: '#dcfce7' }}>
                    <span className="text-xs font-bold" style={{ color: '#22c55e' }}>✓ Approved</span>
                  </div>
                </div>

                {/* # Bottom row — leave type + View button */}
                <div className="flex items-center justify-between px-4 py-2"
                  style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                  <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                    {record.holiday_status_id[1]}
                  </p>
                  <button onClick={() => setSelectedRecord(record)}
                    className="text-xs font-semibold flex items-center gap-1"
                    style={{ color: colors.primary, background: 'none', border: 'none', cursor: 'pointer' }}>
                    View
                    <ChevronRightIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="timeoff" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default WhosAwayScreen
