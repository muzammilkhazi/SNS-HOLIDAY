// ============================================
// sns-holiday-app — Bottom Navigation Bar
// ============================================

import type { ScreenName } from '../types'
import { HomeIcon, FileTextIcon, PlusIcon, CalendarIcon, SettingsIcon } from './icons/Icons'
import { colors } from '../constants/colors'

interface BottomNavProps {
  active: ScreenName
  setActiveScreen: (screen: ScreenName) => void
}

const BottomNav = ({ active, setActiveScreen }: BottomNavProps) => {
  return (
    <div style={{ backgroundColor: colors.cardBg, borderTopColor: colors.borderMedium, paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
      className="border-t px-4 pt-3 shadow-lg">
      <div className="flex justify-around items-center">

        {/* # Home tab */}
        <button onClick={() => setActiveScreen('dashboard')}
          className="flex flex-col items-center gap-1"
          style={{ color: active === 'dashboard' ? colors.primary : colors.textLight }}>
          <HomeIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Home</span>
        </button>

        {/* # Allocations tab */}
        <button onClick={() => setActiveScreen('allocations')}
          className="flex flex-col items-center gap-1"
          style={{ color: active === 'allocations' ? colors.primary : colors.textLight }}>
          <FileTextIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Allocations</span>
        </button>

        {/* # Center + button */}
        <button onClick={() => setActiveScreen('newRequest')}
          className="flex flex-col items-center gap-1 -mt-4">
          <div className="p-3 rounded-full shadow-lg"
            style={{ background: colors.gradientButton }}>
            <PlusIcon className="w-6 h-6 text-white" />
          </div>
        </button>

        {/* # Time Off tab */}
        <button onClick={() => setActiveScreen('timeoff')}
          className="flex flex-col items-center gap-1"
          style={{ color: active === 'timeoff' ? colors.primary : colors.textLight }}>
          <CalendarIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Time Off</span>
        </button>

        {/* # Settings tab — navigates to settings screen */}
        <button
          onClick={() => setActiveScreen('settings')}
          className="flex flex-col items-center gap-1"
          style={{ color: active === 'settings' ? colors.primary : colors.textLight }}>
         <SettingsIcon className="w-6 h-6" />
         <span className="text-xs font-medium">Settings</span>
        </button>
      </div>
    </div>
  )
}

export default BottomNav