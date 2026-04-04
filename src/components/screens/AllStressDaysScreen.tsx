// ============================================
// sns-holiday-app — All Stress Days Screen
// ============================================

import { useState } from 'react'
import type { ScreenName, StressDay } from '../../types'
import { stressDays } from '../../data/mockData'
import { CalendarIcon, ChevronRightIcon, AlertCircleIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'
import { colors } from '../../constants/colors'

interface AllStressDaysScreenProps {
  setActiveScreen: (screen: ScreenName) => void
}

const AllStressDaysScreen = ({ setActiveScreen }: AllStressDaysScreenProps) => {
  // # State for info popup
  const [selectedStressDay, setSelectedStressDay] = useState<StressDay | null>(null)

  return (
    <div className="flex flex-col h-full"
      style={{ backgroundColor: colors.background }}>

      {/* # Info Popup Modal */}
      {selectedStressDay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedStressDay(null)}>
          <div
            className="w-full rounded-2xl p-5 shadow-xl"
            style={{ backgroundColor: colors.cardBg, maxWidth: 380 }}
            onClick={(e) => e.stopPropagation()}>

            {/* # Popup header with colored bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-12 rounded-full"
                style={{ backgroundColor: selectedStressDay.color }} />
              <div>
                <h3 className="font-bold text-base"
                  style={{ color: colors.textPrimary }}>
                  {selectedStressDay.name}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <CalendarIcon className="w-3 h-3"
                    style={{ color: colors.textLight }} />
                  <p className="text-xs"
                    style={{ color: colors.textMuted }}>
                    {selectedStressDay.start} - {selectedStressDay.end}
                  </p>
                </div>
              </div>
            </div>

            {/* # Divider */}
            <div style={{ borderTopWidth: 1, borderColor: colors.borderMedium }}
              className="mb-3" />

            {/* # Reason section */}
            <div className="mb-4">
              <p className="text-xs font-bold mb-1"
                style={{ color: colors.textSecondary }}>Reason</p>
              <p className="text-sm"
                style={{ color: colors.textPrimary }}>
                {selectedStressDay.reason}
              </p>
            </div>

            {/* # Close button */}
            <button
              onClick={() => setSelectedStressDay(null)}
              className="w-full py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: colors.gradientButton }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* # Header */}
      <div className="p-4 shadow-md"
        style={{ background: colors.gradientHeader }}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveScreen('dashboard')}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <ChevronRightIcon className="w-5 h-5 text-white rotate-180" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-white">All Stress Days</h1>
            <p className="text-xs"
              style={{ color: 'rgba(255,255,255,0.8)' }}>
              {stressDays.length} total stress days
            </p>
          </div>
          <div className="w-9" />
        </div>
      </div>

      {/* # Stress days list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-2">
          {stressDays.map((day: StressDay, index: number) => (
            <div key={index} className="rounded-xl p-4 shadow-sm"
              style={{
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
                borderWidth: 1,
              }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* # Colored left accent bar */}
                  <div className="w-1 h-12 rounded-full"
                    style={{ backgroundColor: day.color }} />
                  <div>
                    <p className="font-semibold text-sm"
                      style={{ color: colors.textPrimary }}>{day.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CalendarIcon className="w-3 h-3"
                        style={{ color: colors.textLight }} />
                      <p className="text-xs"
                        style={{ color: colors.textMuted }}>
                        {day.start} - {day.end}
                      </p>
                    </div>
                  </div>
                </div>
                {/* # Info icon — click to show popup */}
                <button
                  onClick={() => setSelectedStressDay(day)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-all">
                  <AlertCircleIcon className="w-5 h-5"
                    style={{ color: colors.primary }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="dashboard" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default AllStressDaysScreen