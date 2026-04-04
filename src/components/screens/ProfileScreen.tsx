// ============================================
// sns-holiday-app — Profile Screen
// ============================================

import { useState } from 'react'
import type { ScreenName } from '../../types'
import { ChevronRightIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'

interface ProfileScreenProps {
  setActiveScreen: (screen: ScreenName) => void
}

const ProfileScreen = ({ setActiveScreen }: ProfileScreenProps) => {
  // # Change password modal state
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false)
  const [currentPassword, setCurrentPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [showCurrent, setShowCurrent] = useState<boolean>(false)
  const [showNew, setShowNew] = useState<boolean>(false)
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [passwordError, setPasswordError] = useState<string>('')
  const [passwordSuccess, setPasswordSuccess] = useState<string>('')
  const [savingPassword, setSavingPassword] = useState<boolean>(false)
  const [focusedField, setFocusedField] = useState<string>('')

  // # Handle change password submit
  const handleChangePassword = () => {
    // # Validation
    if (!currentPassword.trim()) { setPasswordError('Please enter current password'); return }
    if (!newPassword.trim()) { setPasswordError('Please enter new password'); return }
    if (newPassword.length < 6) { setPasswordError('New password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return }

    setPasswordError('')
    setSavingPassword(true)
    // # Will connect to Odoo API later
    setTimeout(() => {
      setSavingPassword(false)
      setPasswordSuccess('Password changed successfully!')
      setTimeout(() => {
        setPasswordSuccess('')
        setShowPasswordModal(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }, 1500)
    }, 1500)
  }

  // # Password input style
  const pwdInputStyle = (field: string) => ({
    padding: '12px 48px 12px 14px',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: focusedField === field ? '#7c3aed' : '#e5e7eb',
    backgroundColor: focusedField === field ? '#faf8ff' : '#f9fafb',
    color: '#1a1035',
    fontSize: 14,
    transition: 'all 0.2s',
    width: '100%',
    outline: 'none',
  })

  // # Label style
  const labelStyle = {
    display: 'block' as const,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    color: '#9ca3af',
    marginBottom: 6,
  }

  // # Info row component
  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderColor: '#f3f4f6',
    }}>
      <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, letterSpacing: 0.5 }}>
        {label}
      </span>
      <span style={{ fontSize: 13, color: '#1a1035', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>
        {value}
      </span>
    </div>
  )

  // # Section card component
  const SectionCard = ({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) => (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: '16px 16px 4px',
      marginBottom: 16,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      borderWidth: 1,
      borderColor: '#f3f4f6',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
      }}>
        <span style={{ fontSize: 16 }}>{emoji}</span>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#4f46e5',
          letterSpacing: 0.5,
        }}>{title}</span>
      </div>
      {children}
    </div>
  )

  return (
    <div className="flex flex-col h-full"
      style={{ backgroundColor: '#f8f7fc' }}>

      {/* # Change Password Modal */}
      {showPasswordModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '0 20px',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
          onClick={() => setShowPasswordModal(false)}>
          <div
            style={{
              width: '100%', maxWidth: 380,
              backgroundColor: '#ffffff',
              borderRadius: 24, padding: '24px 20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}>

            {/* # Modal header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                backgroundColor: '#fef3c7',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: 12,
              }}>
                <span style={{ fontSize: 22 }}>🔒</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1035', marginBottom: 4 }}>
                Change Password
              </h3>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>
                Enter your current and new password
              </p>
            </div>

            {/* # Error message */}
            {passwordError !== '' && (
              <div style={{
                marginBottom: 14, padding: '10px 12px',
                borderRadius: 10, backgroundColor: '#fef2f2',
                borderWidth: 1, borderColor: '#fca5a5',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 12 }}>⚠</span>
                <p style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{passwordError}</p>
              </div>
            )}

            {/* # Success message */}
            {passwordSuccess !== '' && (
              <div style={{
                marginBottom: 14, padding: '10px 12px',
                borderRadius: 10, backgroundColor: '#f0fdf4',
                borderWidth: 1, borderColor: '#86efac',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 12 }}>✅</span>
                <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>{passwordSuccess}</p>
              </div>
            )}

            {/* # Current Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError('') }}
                  onFocus={() => setFocusedField('current')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Enter current password"
                  className="w-full focus:outline-none"
                  style={pwdInputStyle('current')} />
                <button onClick={() => setShowCurrent(!showCurrent)}
                  style={{
                    position: 'absolute', right: 12,
                    top: '50%', transform: 'translateY(-50%)',
                    fontSize: 10, fontWeight: 700,
                    color: '#7c3aed', background: 'none',
                    border: 'none', cursor: 'pointer',
                    letterSpacing: 1,
                    textTransform: 'uppercase' as const,
                  }}>
                  {showCurrent ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* # New Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError('') }}
                  onFocus={() => setFocusedField('new')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Enter new password"
                  className="w-full focus:outline-none"
                  style={pwdInputStyle('new')} />
                <button onClick={() => setShowNew(!showNew)}
                  style={{
                    position: 'absolute', right: 12,
                    top: '50%', transform: 'translateY(-50%)',
                    fontSize: 10, fontWeight: 700,
                    color: '#7c3aed', background: 'none',
                    border: 'none', cursor: 'pointer',
                    letterSpacing: 1,
                    textTransform: 'uppercase' as const,
                  }}>
                  {showNew ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* # Confirm Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError('') }}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Confirm new password"
                  className="w-full focus:outline-none"
                  style={pwdInputStyle('confirm')} />
                <button onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute', right: 12,
                    top: '50%', transform: 'translateY(-50%)',
                    fontSize: 10, fontWeight: 700,
                    color: '#7c3aed', background: 'none',
                    border: 'none', cursor: 'pointer',
                    letterSpacing: 1,
                    textTransform: 'uppercase' as const,
                  }}>
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* # Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordError('')
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                style={{
                  flex: 1, padding: '13px',
                  borderRadius: 12, fontSize: 14,
                  fontWeight: 700, color: '#7c3aed',
                  backgroundColor: '#f3f0ff',
                  border: 'none', cursor: 'pointer',
                }}>
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={savingPassword}
                style={{
                  flex: 2, padding: '13px',
                  borderRadius: 12, fontSize: 14,
                  fontWeight: 700, color: '#ffffff',
                  background: savingPassword ? '#d1d5db'
                    : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
                  border: 'none',
                  cursor: savingPassword ? 'not-allowed' : 'pointer',
                  boxShadow: savingPassword ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
                  transition: 'all 0.2s',
                }}>
                {savingPassword ? '⏳ Saving...' : '🔒 Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* # Header */}
      <div style={{
        background: 'linear-gradient(160deg, #4f46e5 0%, #7c3aed 45%, #db2777 100%)',
        padding: '16px 20px 70px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 140, height: 140, borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.07)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, left: -30,
          width: 120, height: 120, borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }} />

        {/* # Back + title */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24, zIndex: 1, position: 'relative',
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
          <h1 style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', letterSpacing: 0.5 }}>
            My Profile
          </h1>
          <div style={{ width: 36 }} />
        </div>

        {/* # Avatar + name */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', zIndex: 1, position: 'relative',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(10px)',
            borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', marginBottom: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}>
            <span style={{ fontSize: 32 }}>👤</span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
            Mohammad Muzammil
          </h2>
          <div style={{
            paddingLeft: 12, paddingRight: 12,
            paddingTop: 4, paddingBottom: 4,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
          }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
              Frontend Developer • SNS Fashion
            </span>
          </div>
        </div>
      </div>

      {/* # Scrollable content */}
      <div style={{
        flex: 1, overflowY: 'auto',
        marginTop: -40, padding: '0 16px 16px', zIndex: 1,
      }}>

        {/* # Personal Info */}
        <SectionCard title="Personal Information" emoji="👤">
          <InfoRow label="Full Name" value="Mohammad Muzammil" />
          <InfoRow label="Employee ID" value="SNS-2024-047" />
          <InfoRow label="Date of Birth" value="15 Aug 1998" />
          <InfoRow label="Gender" value="Male" />
          <InfoRow label="Blood Group" value="B+" />
        </SectionCard>

        {/* # Work Info */}
        <SectionCard title="Work Information" emoji="🏢">
          <InfoRow label="Department" value="Technology" />
          <InfoRow label="Designation" value="Frontend Developer" />
          <InfoRow label="Reporting Manager" value="Mr. Sugumar" />
          <InfoRow label="Date of Joining" value="01 Jan 2024" />
          <InfoRow label="Work Location" value="Belagavi, Karnataka" />
          <InfoRow label="Employment Type" value="Full Time" />
        </SectionCard>

        {/* # Contact Info */}
        <SectionCard title="Contact Information" emoji="📞">
          <InfoRow label="Email" value="muzammil@snsfashion.com" />
          <InfoRow label="Phone" value="+91 98765 43210" />
          <InfoRow label="WhatsApp" value="+91 98765 43210" />
          <InfoRow label="Emergency Contact" value="+91 91234 56789" />
        </SectionCard>

        {/* # Quick Actions */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: 16,
          overflow: 'hidden', marginBottom: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          borderWidth: 1, borderColor: '#f3f4f6',
        }}>
          <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>⚙️</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5', letterSpacing: 0.5 }}>
              Quick Actions
            </span>
          </div>

          {/* # Edit Profile */}
          <button
            onClick={() => setActiveScreen('editProfile')}
            style={{
              width: '100%', padding: '14px 16px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'transparent', border: 'none',
              borderTopWidth: 1, borderColor: '#f3f4f6',
              cursor: 'pointer',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: '#ede9fe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 16 }}>✏️</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1035' }}>Edit Profile</p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>Update your personal details</p>
              </div>
            </div>
            <ChevronRightIcon className="w-4 h-4" style={{ color: '#9ca3af' }} />
          </button>

          {/* # Change Password */}
          <button
            onClick={() => setShowPasswordModal(true)}
            style={{
              width: '100%', padding: '14px 16px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'transparent', border: 'none',
              borderTopWidth: 1, borderColor: '#f3f4f6',
              cursor: 'pointer',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: '#fef3c7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 16 }}>🔒</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1035' }}>Change Password</p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>Update your login password</p>
              </div>
            </div>
            <ChevronRightIcon className="w-4 h-4" style={{ color: '#9ca3af' }} />
          </button>

          {/* # Sign Out */}
          <button
            onClick={() => setActiveScreen('logout')}
            style={{
              width: '100%', padding: '14px 16px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'transparent', border: 'none',
              borderTopWidth: 1, borderColor: '#f3f4f6',
              cursor: 'pointer',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: '#fef2f2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 16 }}>🚪</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>Sign Out</p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>Sign out of your account</p>
              </div>
            </div>
            <ChevronRightIcon className="w-4 h-4" style={{ color: '#dc2626' }} />
          </button>
        </div>

        {/* # Version */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#d1d5db', paddingBottom: 8 }}>
          SNS Holiday App v1.0.0 • © 2026 SNS Fashion Ltd
        </p>

      </div>

      <BottomNav active="dashboard" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default ProfileScreen