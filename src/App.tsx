// ============================================
// sns-holiday-app — Root App Component
// ============================================

import { useState, useEffect } from 'react'
import type { ScreenName } from './types'
import type { UserSession } from './services/api'
import { loadSession } from './services/api'
import LoginScreen from './components/screens/LoginScreen'
import LogoutScreen from './components/screens/LogoutScreen'
import DashboardScreen from './components/screens/DashboardScreen'
import AllocationsScreen from './components/screens/AllocationsScreen'
import NewRequestScreen from './components/screens/NewRequestScreen'
import AllTimeOffScreen from './components/screens/AllTimeOffScreen'
import AllStressDaysScreen from './components/screens/AllStressDaysScreen'
import AllPublicHolidaysScreen from './components/screens/AllPublicHolidaysScreen'
import ProfileScreen from './components/screens/ProfileScreen'
import SettingsScreen from './components/screens/SettingsScreen'
import WhosAwayScreen from './components/screens/WhosAwayScreen'

const App = () => {
  const [activeScreen, setActiveScreen] = useState<ScreenName>('login')
  const [session, setSession] = useState<UserSession | null>(null)

  useEffect(() => {
    const saved = loadSession()
    if (saved) {
      setSession(saved)
      setActiveScreen('dashboard')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full h-screen max-w-[430px] max-h-screen md:max-h-[844px] bg-white overflow-hidden shadow-2xl md:rounded-[40px] flex flex-col">

        {activeScreen === 'login' && (
          <LoginScreen
            setActiveScreen={setActiveScreen}
            setSession={setSession}
          />
        )}
        {activeScreen === 'logout' && (
          <LogoutScreen
            setActiveScreen={setActiveScreen}
            setSession={setSession}
            session={session}
          />
        )}
        {activeScreen === 'dashboard' && (
  <DashboardScreen
    setActiveScreen={setActiveScreen}
    session={session}
  />
)}
        {activeScreen === 'allocations' && (
          <AllocationsScreen
            setActiveScreen={setActiveScreen}
            session={session}
          />
        )}
        {activeScreen === 'newRequest' && (
          <NewRequestScreen
            setActiveScreen={setActiveScreen}
            session={session}
          />
        )}
        {activeScreen === 'timeoff' && (
          <AllTimeOffScreen
            setActiveScreen={setActiveScreen}
            session={session}
          />
        )}
        {activeScreen === 'allStressDays' && (
          <AllStressDaysScreen
            setActiveScreen={setActiveScreen}
            session={session}
          />
        )}
        {activeScreen === 'allPublicHolidays' && (
          <AllPublicHolidaysScreen
            setActiveScreen={setActiveScreen}
          />
        )}
        {activeScreen === 'profile' && (
          <ProfileScreen
            setActiveScreen={setActiveScreen}
            session={session}
          />
        )}
        {activeScreen === 'settings' && (
          <SettingsScreen
            setActiveScreen={setActiveScreen}
            session={session}
          />
        )}
        {activeScreen === 'whosAway' && (
          <WhosAwayScreen
            setActiveScreen={setActiveScreen}
            session={session}
          />
        )}

      </div>
    </div>
  )
}

export default App