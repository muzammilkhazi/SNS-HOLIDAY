// ============================================
// sns-holiday-app — Login Screen (Dynamic)
// ============================================

import { useState, useRef, useEffect } from 'react'
import type { ScreenName } from '../../types'
import { loginApi, clearSession } from '../../services/api'
import type { UserSession } from '../../services/api'

interface LoginScreenProps {
  setActiveScreen: (screen: ScreenName) => void
  setSession: (session: UserSession) => void
}

const LoginScreen = ({ setActiveScreen, setSession }: LoginScreenProps) => {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [focusedField, setFocusedField] = useState<string>('')

  // # Forgot password states
  const [showForgotPopup, setShowForgotPopup] = useState<boolean>(false)
  const [forgotEmail, setForgotEmail] = useState<string>('')
  const [forgotLoading, setForgotLoading] = useState<boolean>(false)
  const [forgotSuccess, setForgotSuccess] = useState<string>('')
  const [forgotError, setForgotError] = useState<string>('')
  const forgotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // # Cleanup timer on unmount to prevent setState on unmounted component
  useEffect(() => {
    return () => { if (forgotTimerRef.current) clearTimeout(forgotTimerRef.current) }
  }, [])

  // # Handle login — calls real Odoo API
  const handleLogin = async () => {
    if (!username.trim()) { setError('Please enter your username'); return }
    if (!password.trim()) { setError('Please enter your password'); return }
    setError('')
    setLoading(true)
    // # Clear any previous session before writing a new one
    clearSession()
    try {
      const session = await loginApi(username, password)
      // # loginApi already calls saveSession internally — do not call again
      setSession(session)
      setActiveScreen('dashboard')
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : ''
      if (
        raw.toLowerCase().includes('access denied') ||
        raw.toLowerCase().includes('wrong') ||
        raw.toLowerCase().includes('invalid') ||
        raw.toLowerCase().includes('authentication failed') ||
        raw === ''
      ) {
        setError('Invalid username or password. Please try again.')
      } else {
        setError(raw)
      }
    } finally {
      setLoading(false)
    }
  }

  // # Handle forgot password — calls Odoo reset password API
  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address')
      return
    }
    setForgotError('')
    setForgotLoading(true)
    try {
      const res = await fetch('/web/dataset/call_kw/res.users/reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          id: 20,
          params: {
            model: 'res.users',
            method: 'reset_password',
            args: [forgotEmail],
            kwargs: {},
          },
        }),
      })
      const data = await res.json()
      if (data.error) {
        const msg = data.error.data?.message || ''
        if (
          msg.toLowerCase().includes('no account') ||
          msg.toLowerCase().includes('not found') ||
          msg.toLowerCase().includes('does not exist')
        ) {
          setForgotError('No account found with this email. Please check and try again.')
        } else {
          setForgotError('Could not send reset email. Please contact your administrator.')
        }
      } else {
        setForgotSuccess('✅ Password reset email sent! Please check your inbox.')
        // # Store timer ref so it can be cancelled if component unmounts
        forgotTimerRef.current = setTimeout(() => {
          setShowForgotPopup(false)
          setForgotSuccess('')
          setForgotEmail('')
        }, 3000)
      }
    } catch {
      setForgotError('Network error. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  // # Close forgot popup and reset states
  const closeForgotPopup = () => {
    if (forgotTimerRef.current) clearTimeout(forgotTimerRef.current)
    setShowForgotPopup(false)
    setForgotEmail('')
    setForgotError('')
    setForgotSuccess('')
  }

  return (
    <div className="flex flex-col h-full"
      style={{
        background: 'linear-gradient(160deg, #4f46e5 0%, #7c3aed 45%, #db2877 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>

      {/* # Decorative circles */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 80, left: -80, width: 260, height: 260, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 200, right: -40, width: 140, height: 140, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

      {/* # TOP — Branding */}
      <div className="flex flex-col items-center"
        style={{ paddingTop: 52, zIndex: 1 }}>
        <div style={{
          width: 78, height: 78, borderRadius: 22,
          backgroundColor: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: 14,
        }}>
          <span style={{ fontSize: 27, fontWeight: 900, color: '#ffffff', fontFamily: 'Georgia, serif', fontStyle: 'italic', letterSpacing: -2, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>SS</span>
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: 4, fontFamily: 'Inter, Montserrat, sans-serif', textAlign: 'center', textShadow: '0 2px 12px rgba(0,0,0,0.15)', marginBottom: 7 }}>
          SNS FASHION LTD
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ height: 1, width: 18, backgroundColor: 'rgba(255,255,255,0.4)' }} />
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', letterSpacing: 2, fontStyle: 'italic' }}>The Name You Can Trust</p>
          <div style={{ height: 1, width: 18, backgroundColor: 'rgba(255,255,255,0.4)' }} />
        </div>
      </div>

      {/* # MIDDLE spacer */}
      <div style={{ flex: 1 }} />

      {/* # CENTER — Form card */}
      <div style={{
        zIndex: 1, marginLeft: 20, marginRight: 20,
        backgroundColor: '#ffffff', borderRadius: 28,
        padding: '28px 22px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
      }}>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1035', marginBottom: 3, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
          Welcome Back 👋
        </h2>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20, textAlign: 'center' }}>
          Sign in to manage your time off
        </p>

        {/* # Error message */}
        {error !== '' && (
          <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 10, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13 }}>⚠</span>
            <p style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{error}</p>
          </div>
        )}

        {/* # Username */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: '#9ca3af', marginBottom: 6 }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError('') }}
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField('')}
            placeholder="Enter your username"
            className="w-full focus:outline-none"
            style={{ padding: '12px 14px', borderRadius: 10, borderWidth: 1.5, borderColor: focusedField === 'username' ? '#7c3aed' : '#e5e7eb', backgroundColor: focusedField === 'username' ? '#faf8ff' : '#f9fafb', color: '#1a1035', fontSize: 14, transition: 'all 0.2s', width: '100%' }} />
        </div>

        {/* # Password */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: '#9ca3af', marginBottom: 6 }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              placeholder="Enter your password"
              className="w-full focus:outline-none"
              style={{ padding: '12px 52px 12px 14px', borderRadius: 10, borderWidth: 1.5, borderColor: focusedField === 'password' ? '#7c3aed' : '#e5e7eb', backgroundColor: focusedField === 'password' ? '#faf8ff' : '#f9fafb', color: '#1a1035', fontSize: 14, transition: 'all 0.2s', width: '100%' }} />
            <button onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 700, color: '#7c3aed', letterSpacing: 1, textTransform: 'uppercase' as const, background: 'none', border: 'none', cursor: 'pointer' }}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* # Spacer before Sign In button */}
        <div style={{ marginBottom: 22 }} />

        {/* # Sign In button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: 12,
            fontSize: 15, fontWeight: 700, letterSpacing: 0.5,
            color: '#ffffff',
            background: loading ? '#d1d5db' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 24px rgba(124,58,237,0.4)',
            border: 'none', transition: 'all 0.2s',
          }}>
          {loading ? '⏳ Signing in...' : 'Sign In →'}
        </button>
      </div>

      {/* # BOTTOM spacer */}
      <div style={{ flex: 1 }} />

      <div style={{ textAlign: 'center', paddingBottom: 24, zIndex: 1 }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
          © 2026 SNS Fashion Ltd. All rights reserved.
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>
          Version 1.0.0
        </p>
      </div>

      {/* # Forgot Password Popup */}
      {showForgotPopup && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '0 24px',
          }}
          onClick={closeForgotPopup}>
          <div
            style={{
              backgroundColor: '#ffffff', borderRadius: 24,
              padding: '28px 24px', width: '100%', maxWidth: 340,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}>

            {/* # Icon */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                backgroundColor: '#f3f0ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: '#e9d5ff',
              }}>
                <span style={{ fontSize: 28 }}>🔑</span>
              </div>
            </div>

            {/* # Title */}
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1035', textAlign: 'center', marginBottom: 8 }}>
              Forgot Password?
            </h3>
            <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', lineHeight: 1.6, marginBottom: 20 }}>
              Enter your email address and we'll send you a password reset link.
            </p>

            {/* # Success message */}
            {forgotSuccess !== '' && (
              <div style={{
                marginBottom: 16, padding: '12px 16px',
                borderRadius: 12, backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>✅</span>
                <p style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>{forgotSuccess}</p>
              </div>
            )}

            {/* # Error message */}
            {forgotError !== '' && (
              <div style={{
                marginBottom: 16, padding: '12px 16px',
                borderRadius: 12, backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>⚠️</span>
                <p style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>{forgotError}</p>
              </div>
            )}

            {/* # Email input and buttons */}
            {forgotSuccess === '' && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{
                    display: 'block', fontSize: 10, fontWeight: 700,
                    letterSpacing: 1.5, textTransform: 'uppercase' as const,
                    color: '#9ca3af', marginBottom: 6,
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => { setForgotEmail(e.target.value); setForgotError('') }}
                    placeholder="Enter your email"
                    style={{
                      width: '100%', padding: '12px 14px',
                      borderRadius: 10, borderWidth: 1.5,
                      borderColor: '#e5e7eb',
                      backgroundColor: '#f9fafb',
                      color: '#1a1035', fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box' as const,
                    }} />
                </div>

                {/* # Send button */}
                <button
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                  style={{
                    width: '100%', padding: '14px',
                    borderRadius: 12, fontSize: 15,
                    fontWeight: 700, color: '#ffffff',
                    background: forgotLoading ? '#d1d5db' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                    border: 'none', marginBottom: 10,
                    boxShadow: forgotLoading ? 'none' : '0 4px 16px rgba(124,58,237,0.3)',
                  }}>
                  {forgotLoading ? '⏳ Sending...' : '📧 Send Reset Link'}
                </button>

                {/* # Cancel button */}
                <button
                  onClick={closeForgotPopup}
                  style={{
                    width: '100%', padding: '14px',
                    borderRadius: 12, fontSize: 15,
                    fontWeight: 700, color: '#7c3aed',
                    background: '#f3f0ff', cursor: 'pointer',
                    border: 'none',
                  }}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default LoginScreen