// ============================================
// sns-holiday-app — Login Screen (Final)
// ============================================

import { useState } from 'react'
import type { ScreenName } from '../../types'

interface LoginScreenProps {
  setActiveScreen: (screen: ScreenName) => void
}

const LoginScreen = ({ setActiveScreen }: LoginScreenProps) => {
  // # Form state
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [focusedField, setFocusedField] = useState<string>('')

  // # Handle login submit
  const handleLogin = () => {
    if (!username.trim()) { setError('Please enter your username'); return }
    if (!password.trim()) { setError('Please enter your password'); return }
    setError('')
    setLoading(true)
    // # Will connect to Odoo backend later
    setTimeout(() => {
      setLoading(false)
      setActiveScreen('dashboard')
    }, 1500)
  }

  return (
    // # Full screen gradient background
    <div className="flex flex-col h-full"
      style={{
        background: 'linear-gradient(160deg, #4f46e5 0%, #7c3aed 45%, #db2777 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>

      {/* # Decorative background circles for depth */}
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

      {/* # TOP — Branding section */}
      <div className="flex flex-col items-center"
        style={{ paddingTop: 52, paddingBottom: 0, zIndex: 1 }}>

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

      {/* # MIDDLE — flexible space to push form to center */}
      <div style={{ flex: 1 }} />

      {/* # CENTER — Floating form card */}
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

        {/* # Welcome text */}
        <h2 style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#1a1035',
          marginBottom: 3,
          fontFamily: 'Inter, sans-serif',
        }}>Welcome Back 👋</h2>
        <p style={{
          fontSize: 12,
          color: '#9ca3af',
          marginBottom: 20,
        }}>Sign in to manage your time off</p>

        {/* # Error message */}
        {error !== '' && (
          <div style={{
            marginBottom: 14,
            padding: '10px 12px',
            borderRadius: 10,
            backgroundColor: '#fef2f2',
            borderWidth: 1,
            borderColor: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ fontSize: 13 }}>⚠</span>
            <p style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{error}</p>
          </div>
        )}

        {/* # Username field */}
        <div style={{ marginBottom: 14 }}>
          <label style={{
            display: 'block',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase' as const,
            color: '#9ca3af',
            marginBottom: 6,
          }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError('') }}
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField('')}
            placeholder="Enter your username"
            className="w-full focus:outline-none"
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: focusedField === 'username' ? '#7c3aed' : '#e5e7eb',
              backgroundColor: focusedField === 'username' ? '#faf8ff' : '#f9fafb',
              color: '#1a1035',
              fontSize: 14,
              transition: 'all 0.2s',
              width: '100%',
            }} />
        </div>

        {/* # Password field */}
        <div style={{ marginBottom: 14 }}>
          <label style={{
            display: 'block',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase' as const,
            color: '#9ca3af',
            marginBottom: 6,
          }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              placeholder="Enter your password"
              className="w-full focus:outline-none"
              style={{
                padding: '12px 52px 12px 14px',
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: focusedField === 'password' ? '#7c3aed' : '#e5e7eb',
                backgroundColor: focusedField === 'password' ? '#faf8ff' : '#f9fafb',
                color: '#1a1035',
                fontSize: 14,
                transition: 'all 0.2s',
                width: '100%',
              }} />
            {/* # Show / Hide password */}
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 10,
                fontWeight: 700,
                color: '#7c3aed',
                letterSpacing: 1,
                textTransform: 'uppercase' as const,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* # Remember Me + Forgot Password */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 22,
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              style={{ accentColor: '#7c3aed' }}
            />
            <span style={{ fontSize: 13, color: '#6b7280' }}>Remember Me</span>
          </label>
          <button style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#7c3aed',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}>
            Forgot Password?
          </button>
        </div>

        {/* # Sign In button */}
        <button
          onClick={handleLogin}
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
              : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading
              ? 'none'
              : '0 6px 24px rgba(124,58,237,0.4)',
            border: 'none',
            transition: 'all 0.2s',
          }}>
          {loading ? '⏳ Signing in...' : 'Sign In →'}
        </button>

      </div>

      {/* # BOTTOM — flexible space below form */}
      <div style={{ flex: 1 }} />

      {/* # Footer at very bottom */}
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

export default LoginScreen