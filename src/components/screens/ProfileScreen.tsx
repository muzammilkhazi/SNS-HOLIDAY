// ============================================
// sns-holiday-app — Profile Screen (Simplified)
// ============================================

import type { ScreenName } from '../../types'
import type { UserSession } from '../../services/api'
import { ChevronRightIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'

interface ProfileScreenProps {
  setActiveScreen: (screen: ScreenName) => void
  session: UserSession | null
}

const ProfileScreen = ({ setActiveScreen, session }: ProfileScreenProps) => {
  return (
    <div className="flex flex-col h-full"
      style={{ backgroundColor: '#f8f7fc' }}>

      {/* # Header — same gradient as login */}
      <div style={{
        background: 'linear-gradient(160deg, #4f46e5 0%, #7c3aed 45%, #db2777 100%)',
        padding: '16px 20px 70px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* # Decorative circles */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 140, height: 140, borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.07)',
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

        {/* # Avatar */}
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
          {/* # Real name from Odoo session */}
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
            {session?.name || 'Employee'}
          </h2>
        </div>
      </div>

      {/* # Content — overlaps header */}
      <div style={{
        flex: 1, overflowY: 'auto',
        marginTop: -40, padding: '0 16px 16px', zIndex: 1,
      }}>

        {/* # Personal Information card */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: 16,
          padding: '16px', marginBottom: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          borderWidth: 1, borderColor: '#f3f4f6',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 16 }}>👤</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5', letterSpacing: 0.5 }}>
              Personal Information
            </span>
          </div>

          {/* # Name row — real name from Odoo */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', paddingTop: 10, paddingBottom: 10,
            borderBottomWidth: 1, borderColor: '#f3f4f6',
          }}>
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Name</span>
            <span style={{ fontSize: 13, color: '#1a1035', fontWeight: 600 }}>
              {session?.name || 'Employee'}
            </span>
          </div>

          {/* # Email row — real email from Odoo */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', paddingTop: 10, paddingBottom: 4,
          }}>
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Email ID</span>
            <span style={{ fontSize: 13, color: '#1a1035', fontWeight: 600 }}>
              {session?.username || ''}
            </span>
          </div>
        </div>

        {/* # Sign Out card */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: 16,
          overflow: 'hidden', marginBottom: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          borderWidth: 1, borderColor: '#f3f4f6',
        }}>
          <button
            onClick={() => setActiveScreen('logout')}
            style={{
              width: '100%', padding: '16px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'transparent', border: 'none',
              cursor: 'pointer',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                backgroundColor: '#fef2f2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 18 }}>🚪</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#dc2626', marginBottom: 2 }}>
                  Sign Out
                </p>
                <p style={{ fontSize: 12, color: '#9ca3af' }}>
                  Sign out of your account
                </p>
              </div>
            </div>
            <ChevronRightIcon className="w-4 h-4" style={{ color: '#dc2626' }} />
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#d1d5db', paddingBottom: 8 }}>
          SNS Holiday App v1.0.0 • © 2026 SNS Fashion Ltd
        </p>
      </div>

      <BottomNav active="dashboard" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default ProfileScreen