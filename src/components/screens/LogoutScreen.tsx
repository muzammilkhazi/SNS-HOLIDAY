// ============================================
// sns-holiday-app — Logout Screen
// ============================================

import { useState } from 'react'
import type { ScreenName } from '../../types'

interface LogoutScreenProps {
  setActiveScreen: (screen: ScreenName) => void
}

const LogoutScreen = ({ setActiveScreen }: LogoutScreenProps) => {
  // # Loading state for logout button
  const [loading, setLoading] = useState<boolean>(false)

  // # Handle logout confirm
  const handleLogout = () => {
    setLoading(true)
    // # Will clear Odoo session later
    setTimeout(() => {
      setLoading(false)
      // # Go back to login screen
      setActiveScreen('login')
    }, 1500)
  }

  // # Handle cancel — go back to dashboard
  const handleCancel = () => {
    setActiveScreen('dashboard')
  }

  return (
    // # Same gradient background as login
    <div className="flex flex-col h-full"
      style={{
        background: 'linear-gradient(160deg, #4f46e5 0%, #7c3aed 45%, #db2777 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>

      {/* # Decorative background circles — same as login */}
      <div style={{
        position: 'absolute',
        top: -60,
        right: -60,
        width: 200,
        height: 200,
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.07)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: 80,
        left: -80,
        width: 260,
        height: 260,
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.04)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 200,
        right: -40,
        width: 140,
        height: 140,
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        pointerEvents: 'none',
      }} />

      {/* # TOP — Branding section same as login */}
      <div className="flex flex-col items-center"
        style={{ paddingTop: 52, zIndex: 1 }}>

        {/* # Logo box — frosted glass */}
        <div style={{
          width: 78,
          height: 78,
          borderRadius: 22,
          backgroundColor: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.25)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}>
          <span style={{
            fontSize: 27,
            fontWeight: 900,
            color: '#ffffff',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            letterSpacing: -2,
            textShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>SS</span>
        </div>

        {/* # Company name */}
        <h1 style={{
          fontSize: 18,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: 4,
          fontFamily: 'Inter, Montserrat, sans-serif',
          textAlign: 'center',
          textShadow: '0 2px 12px rgba(0,0,0,0.15)',
          marginBottom: 7,
        }}>SNS FASHION LTD</h1>

        {/* # Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ height: 1, width: 18, backgroundColor: 'rgba(255,255,255,0.4)' }} />
          <p style={{
            fontSize: 9,
            color: 'rgba(255,255,255,0.75)',
            letterSpacing: 2,
            fontStyle: 'italic',
          }}>The Name You Can Trust</p>
          <div style={{ height: 1, width: 18, backgroundColor: 'rgba(255,255,255,0.4)' }} />
        </div>
      </div>

      {/* # MIDDLE spacer */}
      <div style={{ flex: 1 }} />

      {/* # CENTER — Floating logout card */}
      <div style={{
        zIndex: 1,
        marginLeft: 20,
        marginRight: 20,
        backgroundColor: '#ffffff',
        borderRadius: 28,
        padding: '28px 22px 28px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
      }}>

        {/* # App badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <div style={{
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 5,
            paddingBottom: 5,
            borderRadius: 20,
            backgroundColor: '#f3f0ff',
            borderWidth: 1,
            borderColor: '#e9d5ff',
          }}>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#7c3aed',
              letterSpacing: 1,
            }}>⏰ TIME OFF MANAGEMENT</span>
          </div>
        </div>

        {/* # Logout icon */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: '#fef2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#fecaca',
        }}>
          <span style={{ fontSize: 28 }}>🚪</span>
        </div>

        {/* # Logout title */}
        <h2 style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#1a1035',
          marginBottom: 6,
          fontFamily: 'Inter, sans-serif',
        }}>Sign Out</h2>
        <p style={{
          fontSize: 13,
          color: '#9ca3af',
          marginBottom: 8,
          lineHeight: 1.6,
        }}>Are you sure you want to sign out of your account?</p>

        {/* # Logged in user info card */}
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 24,
          borderWidth: 1,
          borderColor: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          {/* # Avatar */}
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: 16,
              fontWeight: 800,
              color: '#ffffff',
            }}>👤</span>
          </div>
          <div>
            <p style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#1a1035',
              marginBottom: 2,
            }}>SNS Employee</p>
            <p style={{
              fontSize: 11,
              color: '#9ca3af',
            }}>Currently signed in</p>
          </div>
          {/* # Green online dot */}
          <div style={{
            marginLeft: 'auto',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            boxShadow: '0 0 6px rgba(34,197,94,0.5)',
          }} />
        </div>

        {/* # Sign Out button — red gradient */}
        <button
          onClick={handleLogout}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 0.5,
            color: '#ffffff',
            background: loading
              ? '#d1d5db'
              : 'linear-gradient(135deg, #dc2626 0%, #db2777 100%)',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading
              ? 'none'
              : '0 6px 24px rgba(220,38,38,0.35)',
            border: 'none',
            transition: 'all 0.2s',
            marginBottom: 12,
          }}>
          {loading ? '⏳ Signing out...' : '🚪 Sign Out'}
        </button>

        {/* # Cancel button */}
        <button
          onClick={handleCancel}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 0.5,
            color: '#7c3aed',
            background: '#f3f0ff',
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.2s',
          }}>
          Cancel — Stay Signed In
        </button>

      </div>

      {/* # BOTTOM spacer */}
      <div style={{ flex: 1 }} />

      {/* # Footer */}
      <p style={{
        textAlign: 'center',
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        paddingBottom: 24,
        zIndex: 1,
      }}>
        © 2026 SNS Fashion Ltd. All rights reserved.
      </p>

    </div>
  )
}

export default LogoutScreen