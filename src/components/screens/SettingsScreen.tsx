// ============================================
// sns-holiday-app — Settings Screen
// ============================================

import { useState } from 'react'
import type { ScreenName } from '../../types'
import { ChevronRightIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'

interface SettingsScreenProps {
  setActiveScreen: (screen: ScreenName) => void
}

const SettingsScreen = ({ setActiveScreen }: SettingsScreenProps) => {

  // # Notifications state
  const [pushNotifications, setPushNotifications] = useState<boolean>(true)
  const [leaveApprovalAlerts, setLeaveApprovalAlerts] = useState<boolean>(true)
  const [stressDayReminders, setStressDayReminders] = useState<boolean>(true)
  const [holidayReminders, setHolidayReminders] = useState<boolean>(false)

  // # App Preferences state
  const [language, setLanguage] = useState<string>('English')
  const [dateFormat, setDateFormat] = useState<string>('DD/MM/YYYY')
  const [timeFormat, setTimeFormat] = useState<string>('12hr')
  const [theme, setTheme] = useState<string>('Light')

  // # Privacy & Security state
  const [biometricLogin, setBiometricLogin] = useState<boolean>(false)
  const [autoLogout, setAutoLogout] = useState<string>('15 min')

  // # Toggle switch component
  const Toggle = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      style={{
        width: 46,
        height: 26,
        borderRadius: 13,
        backgroundColor: value ? '#7c3aed' : '#e5e7eb',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}>
      <div style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        position: 'absolute',
        top: 3,
        left: value ? 23 : 3,
        transition: 'all 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  )

  // # Setting row with toggle
  const ToggleRow = ({
    emoji, title, subtitle, value, onToggle
  }: {
    emoji: string; title: string; subtitle: string;
    value: boolean; onToggle: () => void
  }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 0',
      borderBottomWidth: 1,
      borderColor: '#f3f4f6',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          backgroundColor: '#f3f0ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 16 }}>{emoji}</span>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1035', marginBottom: 2 }}>{title}</p>
          <p style={{ fontSize: 11, color: '#9ca3af' }}>{subtitle}</p>
        </div>
      </div>
      <Toggle value={value} onToggle={onToggle} />
    </div>
  )

  // # Setting row with select dropdown
  const SelectRow = ({
    emoji, title, value, options, onChange
  }: {
    emoji: string; title: string; value: string;
    options: string[]; onChange: (val: string) => void
  }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 0',
      borderBottomWidth: 1,
      borderColor: '#f3f4f6',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          backgroundColor: '#f3f0ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 16 }}>{emoji}</span>
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1035' }}>{title}</p>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#7c3aed',
          backgroundColor: '#f3f0ff',
          border: 'none',
          borderRadius: 8,
          padding: '6px 10px',
          cursor: 'pointer',
          outline: 'none',
        }}>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )

  // # Setting row with arrow (navigate)
  const ArrowRow = ({
    emoji, title, subtitle, bgColor, textColor, onClick
  }: {
    emoji: string; title: string; subtitle: string;
    bgColor: string; textColor: string; onClick?: () => void
  }) => (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 0',
        borderBottomWidth: 1, borderColor: '#f3f4f6',
        backgroundColor: 'transparent',
        border: 'none', cursor: 'pointer',
        textAlign: 'left' as const,
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          backgroundColor: bgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 16 }}>{emoji}</span>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: textColor, marginBottom: 2 }}>{title}</p>
          <p style={{ fontSize: 11, color: '#9ca3af' }}>{subtitle}</p>
        </div>
      </div>
      <ChevronRightIcon className="w-4 h-4" style={{ color: '#9ca3af', flexShrink: 0 }} />
    </button>
  )

  // # Section card
  const SectionCard = ({ title, emoji, children }: {
    title: string; emoji: string; children: React.ReactNode
  }) => (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: '4px 16px',
      marginBottom: 16,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      borderWidth: 1, borderColor: '#f3f4f6',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        paddingTop: 14, paddingBottom: 4,
      }}>
        <span style={{ fontSize: 16 }}>{emoji}</span>
        <span style={{
          fontSize: 13, fontWeight: 700,
          color: '#4f46e5', letterSpacing: 0.5,
        }}>{title}</span>
      </div>
      {children}
    </div>
  )

  return (
    <div className="flex flex-col h-full"
      style={{ backgroundColor: '#f8f7fc' }}>

      {/* # Header */}
      <div style={{
        background: 'linear-gradient(160deg, #4f46e5 0%, #7c3aed 45%, #db2777 100%)',
        padding: '16px 20px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* # Decorative circle */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 140, height: 140, borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.07)',
          pointerEvents: 'none',
        }} />

        {/* # Back button + title */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1, position: 'relative',
        }}>
          <button
            onClick={() => setActiveScreen('dashboard')}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              border: 'none', cursor: 'pointer',
            }}>
            <ChevronRightIcon className="w-5 h-5 text-white rotate-180" />
          </button>
          <h1 style={{
            fontSize: 17, fontWeight: 700,
            color: '#ffffff', letterSpacing: 0.5,
          }}>Settings</h1>
          <div style={{ width: 36 }} />
        </div>
      </div>

      {/* # Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }}>

        {/* # Section 1 — Notifications */}
        <SectionCard title="Notifications" emoji="🔔">
          <ToggleRow
            emoji="📱" title="Push Notifications"
            subtitle="Receive app notifications"
            value={pushNotifications}
            onToggle={() => setPushNotifications(!pushNotifications)} />
          <ToggleRow
            emoji="✅" title="Leave Approval Alerts"
            subtitle="Get notified on leave updates"
            value={leaveApprovalAlerts}
            onToggle={() => setLeaveApprovalAlerts(!leaveApprovalAlerts)} />
          <ToggleRow
            emoji="⚠️" title="Stress Day Reminders"
            subtitle="Alert before stress days"
            value={stressDayReminders}
            onToggle={() => setStressDayReminders(!stressDayReminders)} />
          <ToggleRow
            emoji="🎉" title="Holiday Reminders"
            subtitle="Remind before public holidays"
            value={holidayReminders}
            onToggle={() => setHolidayReminders(!holidayReminders)} />
        </SectionCard>

        {/* # Section 2 — App Preferences */}
        <SectionCard title="App Preferences" emoji="🌍">
          <SelectRow
            emoji="🌐" title="Language"
            value={language}
            options={['English', 'Hindi', 'Kannada']}
            onChange={setLanguage} />
          <SelectRow
            emoji="📅" title="Date Format"
            value={dateFormat}
            options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD']}
            onChange={setDateFormat} />
          <SelectRow
            emoji="🕐" title="Time Format"
            value={timeFormat}
            options={['12hr', '24hr']}
            onChange={setTimeFormat} />
          <SelectRow
            emoji="🎨" title="Theme"
            value={theme}
            options={['Light', 'Dark']}
            onChange={setTheme} />
        </SectionCard>

        {/* # Section 3 — Privacy & Security */}
        <SectionCard title="Privacy & Security" emoji="🔒">
          <ToggleRow
            emoji="👆" title="Biometric Login"
            subtitle="Use fingerprint or face ID"
            value={biometricLogin}
            onToggle={() => setBiometricLogin(!biometricLogin)} />
          <SelectRow
            emoji="⏱️" title="Auto Logout"
            value={autoLogout}
            options={['5 min', '15 min', '30 min', '1 hour', 'Never']}
            onChange={setAutoLogout} />
          <ArrowRow
            emoji="🔑" title="Change Password"
            subtitle="Update your login password"
            bgColor="#fef3c7" textColor="#1a1035"
            onClick={() => setActiveScreen('profile')} />
        </SectionCard>

        {/* # Section 4 — App Info */}
        <SectionCard title="App Info" emoji="📱">
          <ArrowRow
            emoji="📄" title="Terms & Conditions"
            subtitle="Read our terms of service"
            bgColor="#ede9fe" textColor="#1a1035" />
          <ArrowRow
            emoji="🔐" title="Privacy Policy"
            subtitle="How we handle your data"
            bgColor="#dbeafe" textColor="#1a1035" />
          <ArrowRow
            emoji="🎧" title="Contact Support"
            subtitle="Get help from our team"
            bgColor="#dcfce7" textColor="#1a1035" />
          <ArrowRow
            emoji="⭐" title="Rate the App"
            subtitle="Share your feedback"
            bgColor="#fef3c7" textColor="#1a1035" />

          {/* # App version info */}
          <div style={{
            padding: '14px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 16 }}>ℹ️</span>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1035', marginBottom: 2 }}>
                  App Version
                </p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>SNS Holiday App</p>
              </div>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: '#7c3aed',
              backgroundColor: '#f3f0ff',
              padding: '4px 10px', borderRadius: 8,
            }}>v1.0.0</span>
          </div>
        </SectionCard>

        {/* # Footer */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#d1d5db', paddingBottom: 8 }}>
          © 2026 SNS Fashion Ltd. All rights reserved.
        </p>

      </div>

      <BottomNav active="dashboard" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default SettingsScreen