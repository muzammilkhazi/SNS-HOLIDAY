// ============================================
// sns-holiday-app — All Public Holidays Screen
// ============================================

import type { ScreenName, PublicHoliday } from '../../types'
import { publicHolidays } from '../../data/mockData'
import { CalendarIcon, ChevronRightIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'
import { colors } from '../../constants/colors'

// # Props
interface AllPublicHolidaysScreenProps {
  setActiveScreen: (screen: ScreenName) => void
}

const AllPublicHolidaysScreen = ({ setActiveScreen }: AllPublicHolidaysScreenProps) => {
  return (
    <div className="flex flex-col h-full"
      style={{ backgroundColor: colors.background }}>

      {/* # Header */}
      <div className="p-4 shadow-md"
        style={{ background: colors.gradientHeader }}>
        <div className="flex items-center justify-between">
          {/* # Back button goes to dashboard */}
          <button
            onClick={() => setActiveScreen('dashboard')}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <ChevronRightIcon className="w-5 h-5 text-white rotate-180" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-white">Public Holidays</h1>
            <p className="text-xs"
              style={{ color: 'rgba(255,255,255,0.8)' }}>
              {publicHolidays.length} holidays in 2026
            </p>
          </div>
          <div className="w-9" />
        </div>
      </div>

      {/* # Public holidays list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-2">
          {publicHolidays.map((holiday: PublicHoliday, index: number) => (
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
                    style={{ backgroundColor: holiday.color }} />
                  <div>
                    <p className="font-semibold text-sm"
                      style={{ color: colors.textPrimary }}>{holiday.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CalendarIcon className="w-3 h-3"
                        style={{ color: colors.textLight }} />
                      <p className="text-xs"
                        style={{ color: colors.textMuted }}>
                        {holiday.start} - {holiday.end}
                      </p>
                    </div>
                  </div>
                </div>
                {/* # Colored calendar icon on right */}
                <div className="p-2 rounded-lg"
                  style={{ backgroundColor: '#e0e7ff' }}>
                  <CalendarIcon className="w-5 h-5"
                    style={{ color: colors.primary }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="dashboard" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default AllPublicHolidaysScreen