// ============================================
// sns-holiday-app — Dashboard / Home Screen
// ============================================

import { useState } from 'react'
import type { ScreenName, StressDay, PublicHoliday } from '../../types'
import { stats, stressDays, publicHolidays } from '../../data/mockData'
import { BellIcon, UserIcon, CalendarIcon, PlusIcon, FileTextIcon, AlertCircleIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'
import { colors } from '../../constants/colors'

interface DashboardScreenProps {
  setActiveScreen: (screen: ScreenName) => void
}

const DashboardScreen = ({ setActiveScreen }: DashboardScreenProps) => {
  // State for the Info Popup Modal
  const [selectedStressDay, setSelectedStressDay] = useState<StressDay | null>(null)

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: colors.background }}>

      {/* --- Info Popup Modal --- */}
      {selectedStressDay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedStressDay(null)}>
          <div
            className="w-full rounded-2xl p-5 shadow-xl"
            style={{ backgroundColor: colors.cardBg, maxWidth: 380 }}
            onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-12 rounded-full"
                style={{ backgroundColor: selectedStressDay.color }} />
              <div>
                <h3 className="font-bold text-base" style={{ color: colors.textPrimary }}>
                  {selectedStressDay.name}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <CalendarIcon className="w-3 h-3" style={{ color: colors.textLight }} />
                  <p className="text-xs" style={{ color: colors.textMuted }}>
                    {selectedStressDay.start} - {selectedStressDay.end}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ borderTopWidth: 1, borderColor: colors.borderMedium }} className="mb-3" />

            <div className="mb-4">
              <p className="text-xs font-bold mb-1" style={{ color: colors.textSecondary }}>Reason</p>
              <p className="text-sm" style={{ color: colors.textPrimary }}>
                {selectedStressDay.reason}
              </p>
            </div>

            <button
              onClick={() => setSelectedStressDay(null)}
              className="w-full py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: colors.gradientButton }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- Header Section --- */}
      <div className="p-6 pb-8 shadow-lg" style={{ background: colors.gradientHeader }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Time Off</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Manage your leave requests
            </p>
          </div>

          {/* Header Action Buttons (Updated) */}
          <div className="flex gap-3">
            <button className="p-2 rounded-full backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <BellIcon className="w-5 h-5 text-white" />
            </button>
            {/* # User icon — goes to profile screen */}
            <button
              onClick={() => setActiveScreen('profile')}
              className="p-2 rounded-full backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <UserIcon className="w-5 h-5 text-white" />
           </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Paid Time Off */}
          <div className="backdrop-blur-md rounded-2xl p-4 shadow-md" style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#e0e7ff' }}>
                <CalendarIcon className="w-4 h-4" style={{ color: colors.primary }} />
              </div>
              <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>Paid Time Off</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>{stats.paidTimeOff}</p>
            <div className="flex items-center gap-1 mt-2">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.borderMedium }}>
                <div className="h-full rounded-full" style={{ width: '80%', background: colors.gradientCard }} />
              </div>
              <span className="text-xs" style={{ color: colors.textMuted }}>80%</span>
            </div>
          </div>

          {/* Business Trips */}
          <div className="backdrop-blur-md rounded-2xl p-4 shadow-md" style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#f3e8ff' }}>
                <CalendarIcon className="w-4 h-4" style={{ color: colors.secondary }} />
              </div>
              <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>Business Trips</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>{stats.businessTrips}</p>
            <div className="flex items-center gap-1 mt-2">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.borderMedium }}>
                <div className="h-full rounded-full" style={{ width: '50%', background: colors.gradientButton }} />
              </div>
              <span className="text-xs" style={{ color: colors.textMuted }}>50%</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Scrollable Content --- */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {/* Quick Actions */}
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

        {/* Stress Days */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold" style={{ color: colors.textPrimary }}>Stress Days</h2>
            <button onClick={() => setActiveScreen('allStressDays')} className="text-sm font-semibold" style={{ color: colors.primary }}>
              View All →
            </button>
          </div>
          <div className="space-y-2">
            {stressDays.slice(0, 3).map((day: StressDay, index: number) => (
              <div key={index} className="rounded-xl p-4 shadow-sm border" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-12 rounded-full" style={{ backgroundColor: day.color }} />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: colors.textPrimary }}>{day.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <CalendarIcon className="w-3 h-3" style={{ color: colors.textLight }} />
                        <p className="text-xs" style={{ color: colors.textMuted }}>{day.start} - {day.end}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedStressDay(day)} className="p-1 rounded-full hover:bg-gray-100 transition-all">
                    <AlertCircleIcon className="w-5 h-5" style={{ color: colors.primary }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Public Holidays */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold" style={{ color: colors.textPrimary }}>Public Holidays</h2>
            <button onClick={() => setActiveScreen('allPublicHolidays')} className="text-sm font-semibold" style={{ color: colors.primary }}>
              View All →
            </button>
          </div>
          <div className="space-y-2">
            {publicHolidays.slice(0, 3).map((holiday: PublicHoliday, index: number) => (
              <div key={index} className="rounded-xl p-4 shadow-sm border" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-12 rounded-full" style={{ backgroundColor: holiday.color }} />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: colors.textPrimary }}>{holiday.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <CalendarIcon className="w-3 h-3" style={{ color: colors.textLight }} />
                        <p className="text-xs" style={{ color: colors.textMuted }}>{holiday.start} - {holiday.end}</p>
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
        </div>
      </div>

      <BottomNav active="dashboard" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default DashboardScreen