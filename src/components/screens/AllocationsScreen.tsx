// ============================================
// sns-holiday-app — Allocations Screen (Dynamic + Filter)
// ============================================

import { useState, useEffect } from 'react'
import type { ScreenName } from '../../types'
import type { UserSession } from '../../services/api'
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
  validate: { label: 'Approved', color: '#22c55e', bg: '#dcfce7' },
  refuse:   { label: 'Refused',  color: '#ef4444', bg: '#fee2e2' },
}

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24"
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const FilterIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24"
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)

const CheckIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24"
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const AllocationsScreen = ({ setActiveScreen }: AllocationsScreenProps) => {
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilter, setShowFilter] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchAllocations()
  }, [])

  const fetchAllocations = async () => {
    setLoading(true)
    try {
      const res = await fetch('/web/dataset/call_kw/hr.leave.allocation/search_read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 9,
          params: {
            model: 'hr.leave.allocation',
            method: 'search_read',
            args: [[]],
            kwargs: {
              fields: ['id', 'name', 'holiday_status_id', 'number_of_days', 'state', 'employee_id', 'date_from', 'date_to'],
              order: 'date_from desc',
              limit: 50,
            },
          },
        }),
      })
      const data = await res.json()
      if (data.result) setAllocations(data.result)
    } catch (err) {
      console.error('Error fetching allocations:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string | false) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  // Unique leave types derived from fetched data
  const leaveTypeOptions = Array.from(
    new Map(allocations.map(a => [a.holiday_status_id[0], a.holiday_status_id[1]])).entries()
  ).map(([id, name]) => ({ id, name }))

  // Client-side filtering
  const filteredAllocations = selectedFilter === null
    ? allocations
    : allocations.filter(a => String(a.holiday_status_id[0]) === selectedFilter)

  const activeFilterName = selectedFilter
    ? leaveTypeOptions.find(o => String(o.id) === selectedFilter)?.name ?? null
    : null

  return (
    <div className="flex flex-col h-full relative" style={{ backgroundColor: colors.background }}>

      {/* Header */}
      <div className="p-4 shadow-md" style={{ background: colors.gradientHeader }}>
        <div className="flex items-center justify-between">
          <button onClick={() => setActiveScreen('dashboard')}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <ChevronRightIcon className="w-5 h-5 text-white rotate-180" />
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-white">My Allocations</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {loading
                ? '...'
                : activeFilterName
                  ? `${filteredAllocations.length} · ${activeFilterName}`
                  : `${allocations.length} allocations`}
            </p>
          </div>

          {/* Filter button */}
          <button
            onClick={() => setShowFilter(true)}
            className="p-2 rounded-full backdrop-blur-sm relative"
            style={{ backgroundColor: selectedFilter ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)' }}
          >
            <FilterIcon
              className="w-5 h-5"
              style={{ color: selectedFilter ? colors.primary : 'white' }}
            />
            {selectedFilter && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: '#ef4444' }} />
            )}
          </button>
        </div>
      </div>

      {/* Active filter pill */}
      {activeFilterName && (
        <div className="px-4 pt-3 flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: colors.textSecondary }}>Filtering by:</span>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full"
            style={{ backgroundColor: colors.primary + '20' }}>
            <span className="text-xs font-bold" style={{ color: colors.primary }}>{activeFilterName}</span>
            <button onClick={() => setSelectedFilter(null)} className="ml-1" style={{ color: colors.primary }}>
              <XIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-12">
            <p style={{ color: colors.textMuted }}>Loading...</p>
          </div>
        ) : filteredAllocations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: colors.background }}>
              <FileTextIcon className="w-8 h-8" style={{ color: colors.textLight }} />
            </div>
            <p className="font-medium mb-2" style={{ color: colors.textSecondary }}>
              {selectedFilter ? 'No allocations for this type' : 'No allocations found'}
            </p>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              {selectedFilter ? 'Try a different filter or clear it' : 'Your leave allocations will appear here'}
            </p>
            {selectedFilter && (
              <button onClick={() => setSelectedFilter(null)}
                className="mt-4 px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: colors.primary }}>
                Clear Filter
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
                      {alloc.number_of_days} days
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav active="allocations" setActiveScreen={setActiveScreen} />

      {/* Filter Bottom Sheet */}
      {showFilter && (
        <>
          {/* Backdrop */}
          <div className="absolute inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowFilter(false)} />

          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl pb-8"
            style={{ backgroundColor: '#fff', boxShadow: '0 -8px 30px rgba(0,0,0,0.15)' }}>

            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#e5e7eb' }} />
            </div>

            {/* Sheet header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-4"
              style={{ borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
              <h2 className="text-base font-bold" style={{ color: colors.textPrimary }}>
                Filter by Leave Type
              </h2>
              <button onClick={() => setShowFilter(false)} className="p-1 rounded-full"
                style={{ backgroundColor: '#f3f4f6' }}>
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Options */}
            <div className="px-4 pt-3 space-y-2">

              {/* All option */}
              <button
                onClick={() => { setSelectedFilter(null); setShowFilter(false) }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: selectedFilter === null ? colors.primary + '15' : '#f9fafb',
                  borderWidth: 1,
                  borderColor: selectedFilter === null ? colors.primary : '#f3f4f6',
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: selectedFilter === null ? colors.primary : '#e5e7eb',
                      color: selectedFilter === null ? '#fff' : colors.textSecondary,
                    }}>
                    All
                  </div>
                  <span className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
                    All Leave Types
                  </span>
                </div>
                {selectedFilter === null && (
                  <CheckIcon className="w-4 h-4" style={{ color: colors.primary }} />
                )}
              </button>

              {/* Dynamic leave type options */}
              {leaveTypeOptions.map(option => {
                const isSelected = selectedFilter === String(option.id)
                return (
                  <button
                    key={option.id}
                    onClick={() => { setSelectedFilter(String(option.id)); setShowFilter(false) }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: isSelected ? colors.primary + '15' : '#f9fafb',
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primary : '#f3f4f6',
                    }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: isSelected ? colors.primary : '#e5e7eb',
                          color: isSelected ? '#fff' : colors.textSecondary,
                        }}>
                        {option.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-sm text-left" style={{ color: colors.textPrimary }}>
                        {option.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isSelected ? colors.primary : '#f3f4f6',
                          color: isSelected ? '#fff' : colors.textSecondary,
                        }}>
                        {allocations.filter(a => a.holiday_status_id[0] === option.id).length}
                      </span>
                      {isSelected && (
                        <CheckIcon className="w-4 h-4" style={{ color: colors.primary }} />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AllocationsScreen