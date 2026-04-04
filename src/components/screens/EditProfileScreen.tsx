// ============================================
// sns-holiday-app — Edit Profile Screen
// ============================================

import { useState } from 'react'
import type { ScreenName } from '../../types'
import { ChevronRightIcon } from '../icons/Icons'
import { colors } from '../../constants/colors'

interface EditProfileScreenProps {
  setActiveScreen: (screen: ScreenName) => void
}

const EditProfileScreen = ({ setActiveScreen }: EditProfileScreenProps) => {
  // # Form state — pre-filled with existing data
  const [fullName, setFullName] = useState<string>('Mohammad Muzammil')
  const [employeeId] = useState<string>('SNS-2024-047') // # Read only
  const [dob, setDob] = useState<string>('1998-08-15')
  const [gender, setGender] = useState<string>('Male')
  const [bloodGroup, setBloodGroup] = useState<string>('B+')
  const [department, setDepartment] = useState<string>('Technology')
  const [designation, setDesignation] = useState<string>('Frontend Developer')
  const [reportingManager, setReportingManager] = useState<string>('Mr. Sugumar')
  const [workLocation, setWorkLocation] = useState<string>('Belagavi, Karnataka')
  const [email, setEmail] = useState<string>('muzammil@snsfashion.com')
  const [phone, setPhone] = useState<string>('+91 98765 43210')
  const [whatsapp, setWhatsapp] = useState<string>('+91 98765 43210')
  const [focusedField, setFocusedField] = useState<string>('')
  const [saving, setSaving] = useState<boolean>(false)
  const [successMsg, setSuccessMsg] = useState<string>('')

  // # Shared input style
  const inputStyle = (field: string) => ({
    padding: '12px 14px',
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

  // # Read only input style
  const readOnlyStyle = {
    padding: '12px 14px',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
    fontSize: 14,
    width: '100%',
    outline: 'none',
    cursor: 'not-allowed',
  }

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

  // # Section title style
  const sectionTitleStyle = {
    fontSize: 13,
    fontWeight: 700,
    color: '#4f46e5',
    letterSpacing: 0.5,
    marginBottom: 14,
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 8,
  }

  // # Handle save
  const handleSave = () => {
    setSaving(true)
    // # Will connect to Odoo API later
    setTimeout(() => {
      setSaving(false)
      setSuccessMsg('Profile updated successfully!')
      setTimeout(() => {
        setSuccessMsg('')
        setActiveScreen('profile')
      }, 1500)
    }, 1500)
  }

  return (
    <div className="flex flex-col h-full"
      style={{ backgroundColor: '#f8f7fc' }}>

      {/* # Header — same gradient as login */}
      <div style={{
        background: 'linear-gradient(160deg, #4f46e5 0%, #7c3aed 45%, #db2777 100%)',
        padding: '16px 20px 20px',
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

        {/* # Back button + title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1,
          position: 'relative',
        }}>
          <button
            onClick={() => setActiveScreen('profile')}
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
          }}>Edit Profile</h1>
          <div style={{ width: 36 }} />
        </div>
      </div>

      {/* # Scrollable form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }}>

        {/* # Success message */}
        {successMsg !== '' && (
          <div style={{
            marginBottom: 16, padding: '12px 16px',
            borderRadius: 12, backgroundColor: '#f0fdf4',
            borderWidth: 1, borderColor: '#86efac',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>✅</span>
            <p style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>{successMsg}</p>
          </div>
        )}

        {/* # Avatar section */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: 16,
          padding: 16, marginBottom: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          borderWidth: 1, borderColor: '#f3f4f6',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
          }}>
            <span style={{ fontSize: 28 }}>👤</span>
          </div>
          <button style={{
            fontSize: 12, fontWeight: 700,
            color: '#7c3aed', background: '#f3f0ff',
            border: 'none', cursor: 'pointer',
            padding: '6px 16px', borderRadius: 20,
          }}>
            📷 Change Photo
          </button>
        </div>

        {/* # Personal Information */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: 16,
          padding: '16px', marginBottom: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          borderWidth: 1, borderColor: '#f3f4f6',
        }}>
          <div style={sectionTitleStyle}>
            <span>👤</span> Personal Information
          </div>

          {/* # Full Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Full Name</label>
            <input type="text" value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onFocus={() => setFocusedField('fullName')}
              onBlur={() => setFocusedField('')}
              className="w-full focus:outline-none"
              style={inputStyle('fullName')} />
          </div>

          {/* # Employee ID — read only */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Employee ID <span style={{ color: '#d1d5db' }}>(Read Only)</span></label>
            <input type="text" value={employeeId}
              readOnly
              style={readOnlyStyle} />
          </div>

          {/* # Date of Birth */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Date of Birth</label>
            <input type="date" value={dob}
              min="1950-01-01"
              max="2005-12-31"
              onChange={(e) => setDob(e.target.value)}
              onFocus={() => setFocusedField('dob')}
              onBlur={() => setFocusedField('')}
              className="w-full focus:outline-none"
              style={inputStyle('dob')} />
          </div>

          {/* # Gender */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Gender</label>
            <select value={gender}
              onChange={(e) => setGender(e.target.value)}
              onFocus={() => setFocusedField('gender')}
              onBlur={() => setFocusedField('')}
              className="w-full focus:outline-none"
              style={inputStyle('gender')}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* # Blood Group */}
          <div>
            <label style={labelStyle}>Blood Group</label>
            <select value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              onFocus={() => setFocusedField('bloodGroup')}
              onBlur={() => setFocusedField('')}
              className="w-full focus:outline-none"
              style={inputStyle('bloodGroup')}>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>

        {/* # Work Information */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: 16,
          padding: '16px', marginBottom: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          borderWidth: 1, borderColor: '#f3f4f6',
        }}>
          <div style={sectionTitleStyle}>
            <span>🏢</span> Work Information
          </div>

          {/* # Department */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Department</label>
            <input type="text" value={department}
              onChange={(e) => setDepartment(e.target.value)}
              onFocus={() => setFocusedField('department')}
              onBlur={() => setFocusedField('')}
              className="w-full focus:outline-none"
              style={inputStyle('department')} />
          </div>

          {/* # Designation */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Designation</label>
            <input type="text" value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              onFocus={() => setFocusedField('designation')}
              onBlur={() => setFocusedField('')}
              className="w-full focus:outline-none"
              style={inputStyle('designation')} />
          </div>

          {/* # Reporting Manager */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Reporting Manager</label>
            <input type="text" value={reportingManager}
              onChange={(e) => setReportingManager(e.target.value)}
              onFocus={() => setFocusedField('reportingManager')}
              onBlur={() => setFocusedField('')}
              className="w-full focus:outline-none"
              style={inputStyle('reportingManager')} />
          </div>

          {/* # Work Location */}
          <div>
            <label style={labelStyle}>Work Location</label>
            <input type="text" value={workLocation}
              onChange={(e) => setWorkLocation(e.target.value)}
              onFocus={() => setFocusedField('workLocation')}
              onBlur={() => setFocusedField('')}
              className="w-full focus:outline-none"
              style={inputStyle('workLocation')} />
          </div>
        </div>

        {/* # Contact Information */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: 16,
          padding: '16px', marginBottom: 20,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          borderWidth: 1, borderColor: '#f3f4f6',
        }}>
          <div style={sectionTitleStyle}>
            <span>📞</span> Contact Information
          </div>

          {/* # Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              className="w-full focus:outline-none"
              style={inputStyle('email')} />
          </div>

          {/* # Phone */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Phone</label>
            <input type="tel" value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField('')}
              className="w-full focus:outline-none"
              style={inputStyle('phone')} />
          </div>

          {/* # WhatsApp */}
          <div>
            <label style={labelStyle}>WhatsApp</label>
            <input type="tel" value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              onFocus={() => setFocusedField('whatsapp')}
              onBlur={() => setFocusedField('')}
              className="w-full focus:outline-none"
              style={inputStyle('whatsapp')} />
          </div>
        </div>

        {/* # Save + Cancel buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setActiveScreen('profile')}
            style={{
              flex: 1, padding: '14px',
              borderRadius: 12, fontSize: 14,
              fontWeight: 700, color: '#7c3aed',
              backgroundColor: '#f3f0ff',
              border: 'none', cursor: 'pointer',
            }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 2, padding: '14px',
              borderRadius: 12, fontSize: 14,
              fontWeight: 700, color: '#ffffff',
              background: saving ? '#d1d5db'
                : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
              transition: 'all 0.2s',
            }}>
            {saving ? '⏳ Saving...' : '✅ Save Changes'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default EditProfileScreen