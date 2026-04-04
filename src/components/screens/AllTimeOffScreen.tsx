// ============================================
// sns-holiday-app — All Time Off Requests Screen
// ============================================

import { useState } from 'react'
import type { ScreenName, TimeOffRequest } from '../../types'
import { timeOffRequests } from '../../data/mockData'
import { CalendarIcon, ClockIcon, ChevronRightIcon, FilterIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'
import { colors } from '../../constants/colors'

interface AllTimeOffScreenProps {
  setActiveScreen: (screen: ScreenName) => void
}

// # Filter type
type FilterType = 'all' | 'approved' | 'pending'

const AllTimeOffScreen = ({ setActiveScreen }: AllTimeOffScreenProps) => {
  // # Active filter state
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  // # Filter the requests based on active filter
  const filteredRequests = timeOffRequests.filter((req: TimeOffRequest) => {
    if (activeFilter === 'approved') return req.status === 'Approved'
    if (activeFilter === 'pending') return req.status !== 'Approved'
    return true // # 'all' shows everything
  })

  return (
    <div className="flex flex-col h-full"
      style={{ backgroundColor: colors.background }}>

      {/* # Header with filters */}
      <div className="p-4 shadow-lg"
        style={{ background: colors.gradientHeader }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setActiveScreen('dashboard')}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <ChevronRightIcon className="w-5 h-5 text-white rotate-180" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-white">All Time Off</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
              All leave requests
            </p>
          </div>
          <button className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <FilterIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* # Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {/* # All filter */}
          <button onClick={() => setActiveFilter('all')}
            className="px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeFilter === 'all' ? colors.cardBg : 'rgba(255,255,255,0.2)',
              color: activeFilter === 'all' ? colors.primary : 'white',
            }}>
            All ({timeOffRequests.length})
          </button>
          {/* # Approved filter */}
          <button onClick={() => setActiveFilter('approved')}
            className="px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeFilter === 'approved' ? colors.cardBg : 'rgba(255,255,255,0.2)',
              color: activeFilter === 'approved' ? colors.success : 'white',
            }}>
            Approved ({timeOffRequests.filter(r => r.status === 'Approved').length})
          </button>
          {/* # Pending filter */}
          <button onClick={() => setActiveFilter('pending')}
            className="px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeFilter === 'pending' ? colors.cardBg : 'rgba(255,255,255,0.2)',
              color: activeFilter === 'pending' ? colors.warning : 'white',
            }}>
            Pending ({timeOffRequests.filter(r => r.status !== 'Approved').length})
          </button>
        </div>
      </div>

      {/* # Requests list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filteredRequests.length === 0 ? (
          // # Empty state
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: colors.background }}>
              <CalendarIcon className="w-8 h-8"
                style={{ color: colors.textLight }} />
            </div>
            <p className="font-medium mb-2"
              style={{ color: colors.textSecondary }}>No {activeFilter} requests</p>
            <p className="text-sm"
              style={{ color: colors.textMuted }}>Try changing the filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request: TimeOffRequest, index: number) => (
              <div key={index} className="rounded-2xl p-4 shadow-sm"
                style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: 1 }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* # Employee avatar with gradient */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm"
                      style={{ background: colors.gradientCard }}>
                      {request.employee.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm"
                        style={{ color: colors.textPrimary }}>{request.employee}</h3>
                      <p className="text-xs"
                        style={{ color: colors.textSecondary }}>{request.type}</p>
                    </div>
                  </div>
                  {/* # Status badge */}
                  <div className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: request.status === 'Approved' ? colors.successBg : colors.warningBg }}>
                    <span className="text-xs font-semibold"
                      style={{ color: request.status === 'Approved' ? colors.success : colors.warning }}>
                      {request.status === 'Approved' ? '✓' : '⏱'} {request.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3"
                  style={{ borderTopColor: colors.border, borderTopWidth: 1 }}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="p-1 rounded"
                        style={{ backgroundColor: colors.background }}>
                        <CalendarIcon className="w-3 h-3"
                          style={{ color: colors.textSecondary }} />
                      </div>
                      <span className="text-xs"
                        style={{ color: colors.textSecondary }}>{request.start}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="p-1 rounded"
                        style={{ backgroundColor: colors.background }}>
                        <ClockIcon className="w-3 h-3"
                          style={{ color: colors.textSecondary }} />
                      </div>
                      <span className="text-xs"
                        style={{ color: colors.textSecondary }}>{request.duration}</span>
                    </div>
                  </div>
                  <button className="text-xs font-semibold flex items-center gap-1"
                    style={{ color: colors.primary }}>
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

export default AllTimeOffScreen