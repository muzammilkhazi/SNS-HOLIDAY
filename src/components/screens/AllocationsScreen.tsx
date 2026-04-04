// ============================================
// sns-holiday-app — My Allocations Screen
// ============================================

import type { ScreenName, Allocation } from '../../types'
import { myAllocations } from '../../data/mockData'
import { ChevronRightIcon, ClockIcon, FileTextIcon, FilterIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'
import { colors } from '../../constants/colors'

interface AllocationsScreenProps {
  setActiveScreen: (screen: ScreenName) => void
}

const AllocationsScreen = ({ setActiveScreen }: AllocationsScreenProps) => {
  return (
    <div className="flex flex-col h-full"
      style={{ backgroundColor: colors.background }}>

      {/* # Header */}
      <div className="p-4 shadow-md"
        style={{ background: colors.gradientButton }}>
        <div className="flex items-center justify-between">
          <button onClick={() => setActiveScreen('dashboard')}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <ChevronRightIcon className="w-5 h-5 text-white rotate-180" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-white">My Allocations</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Your approved time off
            </p>
          </div>
          <button className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <FilterIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* # Content list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {myAllocations.map((allocation: Allocation, index: number) => (
            <div key={index} className="rounded-2xl p-5 shadow-md"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: 1 }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {/* # Green dot indicator */}
                    <div className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.success }} />
                    <h3 className="font-bold"
                      style={{ color: colors.textPrimary }}>{allocation.type}</h3>
                  </div>
                  <p className="text-sm"
                    style={{ color: colors.textSecondary }}>{allocation.description}</p>
                </div>
                {/* # Status badge */}
                <div className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: colors.successBg }}>
                  <span className="text-xs font-semibold"
                    style={{ color: colors.success }}>✓ {allocation.status}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3"
                style={{ borderTopColor: colors.border, borderTopWidth: 1 }}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg"
                    style={{ backgroundColor: '#e0e7ff' }}>
                    <ClockIcon className="w-4 h-4"
                      style={{ color: colors.primary }} />
                  </div>
                  <span className="text-sm font-medium"
                    style={{ color: colors.textPrimary }}>{allocation.duration}</span>
                </div>
                <button className="text-sm font-semibold flex items-center gap-1"
                  style={{ color: colors.primary }}>
                  Details
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* # Empty state */}
        {myAllocations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: colors.background }}>
              <FileTextIcon className="w-8 h-8"
                style={{ color: colors.textLight }} />
            </div>
            <p className="font-medium mb-2"
              style={{ color: colors.textSecondary }}>No allocations yet</p>
            <p className="text-sm"
              style={{ color: colors.textMuted }}>Your approved time off will appear here</p>
          </div>
        )}
      </div>

      <BottomNav active="allocations" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default AllocationsScreen