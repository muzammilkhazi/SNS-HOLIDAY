// ============================================
// sns-holiday-app — Root App Component
// ============================================

import { useState } from 'react'
import type { ScreenName } from './types'
import LoginScreen from './components/screens/LoginScreen'
import LogoutScreen from './components/screens/LogoutScreen'
import DashboardScreen from './components/screens/DashboardScreen'
import AllocationsScreen from './components/screens/AllocationsScreen'
import NewRequestScreen from './components/screens/NewRequestScreen'
import AllTimeOffScreen from './components/screens/AllTimeOffScreen'
import AllStressDaysScreen from './components/screens/AllStressDaysScreen'
import AllPublicHolidaysScreen from './components/screens/AllPublicHolidaysScreen'
import EditProfileScreen from './components/screens/EditProfileScreen'
import ProfileScreen from './components/screens/ProfileScreen'
import SettingsScreen from './components/screens/SettingsScreen'
const App = () => {
  // # Start from login screen
  const [activeScreen, setActiveScreen] = useState<ScreenName>('login')

  return (
    // # Mobile frame wrapper
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full h-screen max-w-[430px] max-h-screen md:max-h-[844px] bg-white overflow-hidden shadow-2xl md:rounded-[40px] flex flex-col">

        {/* # Login screen */}
        {activeScreen === 'login' && <LoginScreen setActiveScreen={setActiveScreen} />}

        {/* # Main app screens */}
        {activeScreen === 'dashboard' && <DashboardScreen setActiveScreen={setActiveScreen} />}
        {activeScreen === 'allocations' && <AllocationsScreen setActiveScreen={setActiveScreen} />}
        {activeScreen === 'newRequest' && <NewRequestScreen setActiveScreen={setActiveScreen} />}
        {activeScreen === 'timeoff' && <AllTimeOffScreen setActiveScreen={setActiveScreen} />}

        {/* # View All screens */}
        {activeScreen === 'allStressDays' && <AllStressDaysScreen setActiveScreen={setActiveScreen} />}
        {activeScreen === 'allPublicHolidays' && <AllPublicHolidaysScreen setActiveScreen={setActiveScreen} />}
        {/* # Logout screen */}
        {activeScreen === 'logout' && <LogoutScreen setActiveScreen={setActiveScreen} />}
        {/* # Profile screen */}
        {activeScreen === 'profile' && <ProfileScreen setActiveScreen={setActiveScreen} />}
        {/* # Edit Profile screen */}
        {activeScreen === 'editProfile' && <EditProfileScreen setActiveScreen={setActiveScreen} />}
        {/* # Settings screen */}
        {activeScreen === 'settings' && <SettingsScreen setActiveScreen={setActiveScreen} />}
      </div>
    </div>
  )
}

export default App