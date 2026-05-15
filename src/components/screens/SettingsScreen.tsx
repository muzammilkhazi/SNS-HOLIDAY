// ============================================
// sns-holiday-app — Settings Screen
// ============================================

import { useState } from 'react'
import type { ScreenName } from '../../types'
import type { UserSession } from '../../services/api'
import { ChevronRightIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'
import { colors } from '../../constants/colors'

interface SettingsScreenProps {
  setActiveScreen: (screen: ScreenName) => void
  session: UserSession | null
}

const APP_VERSION = '1.0.0'

const TERMS_TEXT = `Terms & Conditions

Last updated: January 2025

1. Acceptance of Terms
By using the SNS Holiday App, you agree to these terms and conditions.

2. Use of the App
This app is intended for authorized employees only. You must not share your login credentials with anyone.

3. Leave Requests
All leave requests submitted through this app are subject to manager approval. Submitting a request does not guarantee approval.

4. Data Accuracy
You are responsible for ensuring all information submitted through the app is accurate and truthful.

5. Changes to Terms
SNS reserves the right to update these terms at any time. Continued use of the app constitutes acceptance of updated terms.

6. Contact
For any queries regarding these terms, please contact your HR department.`

const PRIVACY_TEXT = `Privacy Policy

Last updated: January 2025

1. Information We Collect
We collect your name, email address, employee ID, and leave request data to operate this application.

2. How We Use Your Data
Your data is used solely to manage leave requests and display relevant information within the app. We do not sell or share your data with third parties.

3. Data Storage
All data is stored securely on your organization's Odoo server. Session data is stored locally on your device.

4. Data Retention
Your data is retained as long as you are an active employee. Upon leaving the organization, your data will be handled per company policy.

5. Your Rights
You have the right to access, correct, or request deletion of your personal data. Contact your HR department for such requests.

6. Security
We implement industry-standard security measures to protect your data. However, no system is completely secure.

7. Contact
For privacy-related queries, please contact your HR department.`

const SettingsScreen = ({ setActiveScreen, session }: SettingsScreenProps) => {
  const [modal, setModal] = useState<'terms' | 'privacy' | null>(null)

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: colors.background }}>

      {/* # Header */}
      <div style={{
        background: colors.gradientHeader,
        padding: '16px 20px 20px',
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
          <h1 style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', letterSpacing: 0.5 }}>
            Settings
          </h1>
          <div style={{ width: 36 }} />
        </div>
      </div>

      {/* # Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5">

        {/* # About Section */}
        <p style={{
          fontSize: 11, fontWeight: 700, color: colors.textMuted,
          letterSpacing: 1, textTransform: 'uppercase',
          marginBottom: 8, paddingLeft: 4,
        }}>
          About
        </p>

        <div style={{
          backgroundColor: colors.cardBg,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
          marginBottom: 24,
        }}>

          {/* # Terms & Conditions */}
          <button
            onClick={() => setModal('terms')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '15px 16px',
              backgroundColor: 'transparent',
              border: 'none', cursor: 'pointer',
              borderBottomWidth: 1, borderBottomColor: colors.border,
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: '#ede9fe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                📋
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
                Terms & Conditions
              </span>
            </div>
            <ChevronRightIcon className="w-4 h-4" style={{ color: colors.textLight }} />
          </button>

          {/* # Privacy Policy */}
          <button
            onClick={() => setModal('privacy')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '15px 16px',
              backgroundColor: 'transparent',
              border: 'none', cursor: 'pointer',
              borderBottomWidth: 1, borderBottomColor: colors.border,
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: '#dbeafe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                🔒
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
                Privacy Policy
              </span>
            </div>
            <ChevronRightIcon className="w-4 h-4" style={{ color: colors.textLight }} />
          </button>

          {/* # App Version */}
          <div style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '15px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: '#dcfce7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                📱
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
                App Version
              </span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted }}>
              v{APP_VERSION}
            </span>
          </div>

        </div>

        {/* # Logged in as */}
        {session?.name && (
          <p style={{
            textAlign: 'center', fontSize: 12,
            color: colors.textMuted, marginTop: 4,
          }}>
            Signed in as {session.name}
          </p>
        )}

      </div>

      {/* # Terms / Privacy Modal */}
      {modal !== null && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end',
          zIndex: 50,
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px 24px 0 0',
            width: '100%',
            maxHeight: '80%',
            display: 'flex', flexDirection: 'column',
          }}>

            {/* # Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottomWidth: 1, borderBottomColor: colors.border,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>
                {modal === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
              </h2>
              <button
                onClick={() => setModal(null)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  backgroundColor: colors.background,
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: colors.textSecondary,
                }}>
                ✕
              </button>
            </div>

            {/* # Modal Content */}
            <div style={{
              flex: 1, overflowY: 'auto',
              padding: '16px 20px',
            }}>
              <p style={{
                fontSize: 13, color: colors.textSecondary,
                lineHeight: 1.7, whiteSpace: 'pre-line',
              }}>
                {modal === 'terms' ? TERMS_TEXT : PRIVACY_TEXT}
              </p>
            </div>

            {/* # Modal Close Button */}
            <div style={{ padding: '12px 20px 24px' }}>
              <button
                onClick={() => setModal(null)}
                style={{
                  width: '100%', padding: '14px',
                  borderRadius: 14,
                  background: colors.gradientButton,
                  border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 700, color: '#ffffff',
                }}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      <BottomNav active="settings" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default SettingsScreen
