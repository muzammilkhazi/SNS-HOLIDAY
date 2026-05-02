// ============================================
// sns-holiday-app — New Time Off Request Screen
// ============================================

import { useState, useEffect, useRef } from 'react'
import type { ScreenName } from '../../types'
import type { UserSession } from '../../services/api'
import { ChevronRightIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'
import { colors } from '../../constants/colors'

interface LeaveType {
  id: number
  name: string
}

interface BusinessTrip {
  buyerName: string
  location: string
  canReach: string
  person1Name: string
  person1Dept: string
  person1Agenda: string
  person2Name: string
  person2Dept: string
  person2Agenda: string
  person3Name: string
  person3Dept: string
  person3Agenda: string
}

interface NewRequestScreenProps {
  setActiveScreen: (screen: ScreenName) => void
  session: UserSession | null
}

const PURPOSE_OPTIONS = [
  { value: 'personal',  label: 'Personal' },
  { value: 'factory',   label: 'Factory Visit' },
  { value: 'business',  label: 'Business Trip' },
  { value: 'others',    label: 'Others' },
]

const FACTORY_TYPES = ['RD', 'SALES', 'PRODUCTION']
const TRANSPORT_MODES = ['Select mode', 'Flight', 'Train', 'Car', 'Bus', 'Others']

const emptyBusinessTrip = (): BusinessTrip => ({
  buyerName: '', location: '', canReach: '',
  person1Name: '', person1Dept: '', person1Agenda: '',
  person2Name: '', person2Dept: '', person2Agenda: '',
  person3Name: '', person3Dept: '', person3Agenda: '',
})

const NewRequestScreen = ({ setActiveScreen, session }: NewRequestScreenProps) => {
  const [leaveTypes, setLeaveTypes]                   = useState<LeaveType[]>([])
  const [leaveTypesLoading, setLeaveTypesLoading]     = useState(true)
  const [timeOffTypeId, setTimeOffTypeId]             = useState<number | ''>('')

  const [purpose, setPurpose]                         = useState<string>('personal')

  // # Personal
  const [leaveNote, setLeaveNote]                     = useState<string>('')
  const [reachBy, setReachBy]                         = useState({ phone: false, email: false, whatsapp: false })

  // # Factory
  const [factoryType, setFactoryType]                 = useState<string>('RD')
  const [factoryName, setFactoryName]                 = useState<string>('')
  const [factoryLocation, setFactoryLocation]         = useState<string>('')
  const [transportMode, setTransportMode]             = useState<string>('')
  const [transportCost, setTransportCost]             = useState<string>('')
  const [factoryDescription, setFactoryDescription]   = useState<string>('')

  // # RD
  const [rdNewCollection, setRdNewCollection]         = useState(false)
  const [rdMillDevelopment, setRdMillDevelopment]     = useState(false)
  const [rdOthers, setRdOthers]                       = useState(false)
  const [rdOthersText, setRdOthersText]               = useState<string>('')

  // # SALES
  const [salesNewCollection, setSalesNewCollection]   = useState(false)
  const [salesFollowUp, setSalesFollowUp]             = useState(false)
  const [salesOthers, setSalesOthers]                 = useState(false)
  const [salesOthersText, setSalesOthersText]         = useState<string>('')

  // # PRODUCTION
  const [prodPurpose, setProdPurpose]                 = useState<string>('followOrder')
  const [prodOrderNumber, setProdOrderNumber]         = useState<string>('')
  const [prodIssues, setProdIssues]                   = useState<string[]>(['', '', ''])
  const [prodOthersText, setProdOthersText]           = useState<string>('')

  // # Business Trip
  const [businessTrips, setBusinessTrips]             = useState<BusinessTrip[]>([emptyBusinessTrip()])

  // # Others
  const [othersVisitType, setOthersVisitType]         = useState<string>('')
  const [othersCanReach, setOthersCanReach]           = useState<string>('')
  const [othersLocation, setOthersLocation]           = useState<string>('')
  const [othersAgenda, setOthersAgenda]               = useState<string>('')

  // # Basic Info
  const [applicant, setApplicant]                     = useState<'self' | 'onBehalf'>('self')
  const [accompaniedWith, setAccompaniedWith]         = useState<string>('')

  // # Dates & Duration
  const [startDate, setStartDate]                     = useState<string>('')
  const [endDate, setEndDate]                         = useState<string>('')
  const [startTime, setStartTime]                     = useState<string>('09:00')
  const [endTime, setEndTime]                         = useState<string>('17:00')
  const [durationType, setDurationType]               = useState<'time' | 'duration'>('time')
  const [durationDescription, setDurationDescription] = useState<string>('morning')
  const [durationDays, setDurationDays]               = useState<string>('')

  // # Additional
  const [description, setDescription]                 = useState<string>('')
  const [uploadedFile, setUploadedFile]               = useState<File | null>(null)
  const fileInputRef                                  = useRef<HTMLInputElement>(null)

  // # Submit
  const [submitting, setSubmitting]                   = useState(false)
  const [error, setError]                             = useState<string>('')
  const [success, setSuccess]                         = useState<string>('')

  useEffect(() => { fetchLeaveTypes() }, [])

  const fetchLeaveTypes = async () => {
    setLeaveTypesLoading(true)
    try {
      const res = await fetch('/web/dataset/call_kw/hr.leave.type/search_read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 11,
          params: {
            model: 'hr.leave.type', method: 'search_read',
            args: [[]], kwargs: { fields: ['id', 'name'], order: 'id asc' },
          },
        }),
      })
      const data = await res.json()
      if (data.result && data.result.length > 0) {
        const seen = new Set<string>()
        const unique = data.result.filter((t: LeaveType) => {
          if (seen.has(t.name)) return false
          seen.add(t.name)
          return true
        })
        setLeaveTypes(unique)
        setTimeOffTypeId(unique[0].id)
      }
    } catch (err) {
      console.error('Error fetching leave types:', err)
    } finally {
      setLeaveTypesLoading(false)
    }
  }

  const addProdIssue = () => setProdIssues(prev => [...prev, ''])
  const updateProdIssue = (i: number, val: string) =>
    setProdIssues(prev => prev.map((v, idx) => idx === i ? val : v))

  const updateBusinessTrip = (index: number, field: keyof BusinessTrip, value: string) => {
    setBusinessTrips(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setError('File size must be less than 5MB'); return }
      setUploadedFile(file)
      setError('')
    }
  }

  const handleSubmit = async () => {
    setError(''); setSuccess('')
    if (!timeOffTypeId) { setError('Please select a leave type'); return }
    if (!startDate) { setError('Please select a start date'); return }
    if (durationType === 'time') {
      if (!endDate) { setError('Please select an end date'); return }
      if (endDate < startDate) { setError('End date cannot be before start date'); return }
    }
    const employeeId = session?.employeeId
    if (!employeeId) { setError('Employee not found. Please log out and log back in.'); return }
    setSubmitting(true)
    const finalEndDate = durationType === 'duration' ? startDate : endDate
    try {
      const res = await fetch('/web/dataset/call_kw/hr.leave/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 12,
          params: {
            model: 'hr.leave', method: 'create',
            args: [{
              holiday_status_id: timeOffTypeId,
              request_date_from: startDate,
              request_date_to: finalEndDate,
              employee_id: employeeId,
              notes: description,
            }],
            kwargs: {},
          },
        }),
      })
      const data = await res.json()
      if (data.error) {
        const rawMsg: string = data.error.data?.message || 'Failed to submit request'
        if (rawMsg.toLowerCase().includes('overlap') || rawMsg.toLowerCase().includes('two time off')) {
          setError('A leave request already exists for these dates. Please choose different dates.')
        } else { setError(rawMsg) }
        return
      }
      if (data.result) {
        setSuccess(`✅ Request submitted! (ID: ${data.result})`)
        setTimeout(() => { setSuccess(''); setActiveScreen('dashboard') }, 2000)
      } else { setError('Unexpected response. Please try again.') }
    } catch { setError('Network error. Please check your connection.') }
    finally { setSubmitting(false) }
  }

  const inputStyle = {
    borderWidth: 1,
    borderColor: colors.borderMedium,
    backgroundColor: colors.cardBg,
    color: colors.textPrimary,
  }

  const fieldInput = {
    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13,
    borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#ffffff',
    color: colors.textPrimary, outline: 'none',
    boxSizing: 'border-box' as const, marginBottom: 10,
  }

  const divider = <div className="mb-5" style={{ borderTop: `1px solid ${colors.borderMedium}` }} />

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: colors.background }}>

      {/* # Header */}
      <div className="p-4 shadow-md" style={{ background: colors.gradientHeader }}>
        <div className="flex items-center justify-between">
          <button onClick={() => setActiveScreen('dashboard')}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer' }}>
            <ChevronRightIcon className="w-5 h-5 text-white rotate-180" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-white">New Time Off Request</h1>
          </div>
          <div className="w-9" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">

        {/* # Success */}
        {success !== '' && (
          <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 12, backgroundColor: '#f0fdf4', border: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: 8 }}>
            <p style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>{success}</p>
          </div>
        )}

        {/* # Error */}
        {error !== '' && (
          <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 12, backgroundColor: '#fef2f2', border: '1px solid #fca5a5', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 16, marginTop: 1 }}>⚠️</span>
            <p style={{ fontSize: 13, color: '#dc2626', fontWeight: 600, lineHeight: 1.5 }}>{error}</p>
          </div>
        )}

        {/* ================================================ */}
        {/* # SECTION 1 — Purpose                            */}
        {/* ================================================ */}
        <div className="mb-5">
          <h2 className="text-base font-bold mb-3" style={{ color: colors.textPrimary }}>Purpose</h2>

          {/* # Purpose buttons — 2x2 grid */}
          <label className="block text-xs font-semibold mb-2" style={{ color: colors.textSecondary }}>Purpose *</label>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {PURPOSE_OPTIONS.map((option) => (
              <button key={option.value} onClick={() => setPurpose(option.value)}
                className="p-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  border: `1px solid ${purpose === option.value ? colors.primary : colors.borderMedium}`,
                  backgroundColor: purpose === option.value ? colors.primary : colors.cardBg,
                  color: purpose === option.value ? '#ffffff' : colors.textSecondary,
                  cursor: 'pointer',
                }}>
                {option.label}
              </button>
            ))}
          </div>

          {/* # Time Off Type — fixed for mobile */}
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Time Off Type *</label>
            {leaveTypesLoading ? (
              <div className="w-full p-3 rounded-xl text-sm" style={{ ...inputStyle, color: colors.textMuted }}>
                Loading leave types...
              </div>
            ) : (
              <select
                value={String(timeOffTypeId)}
                onChange={(e) => setTimeOffTypeId(Number(e.target.value))}
                className="w-full p-3 rounded-xl text-sm focus:outline-none"
                style={{ ...inputStyle, width: '100%', appearance: 'auto' }}>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={String(type.id)}>{type.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* ===== PERSONAL ===== */}
          {purpose === 'personal' && (
            <div>
              <input type="text" value={leaveNote}
                onChange={(e) => setLeaveNote(e.target.value)}
                placeholder="Sick or Annual Personal Leave (optional)"
                className="w-full p-3 rounded-xl text-sm focus:outline-none mb-3"
                style={inputStyle} />
              <label className="block text-xs font-semibold mb-2" style={{ color: colors.textSecondary }}>
                Can Be Reached By
              </label>
              <div className="flex flex-col gap-2">
                {(['phone', 'email', 'whatsapp'] as const).map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={reachBy[key]}
                      onChange={() => setReachBy(prev => ({ ...prev, [key]: !prev[key] }))}
                      style={{ accentColor: colors.primary }} />
                    <span className="text-sm" style={{ color: colors.textPrimary }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ===== FACTORY VISIT ===== */}
          {purpose === 'factory' && (
            <div>

              {/* # RD / SALES / PRODUCTION buttons */}
              <label className="block text-xs font-semibold mb-2" style={{ color: colors.textSecondary }}>
                Factory Visit Type *
              </label>
              <div className="flex flex-col gap-1 mb-4">
                {FACTORY_TYPES.map((type) => (
                  <button key={type} onClick={() => setFactoryType(type)}
                    style={{
                      width: '100%', padding: '12px',
                      borderRadius: 8, fontSize: 13, fontWeight: 700,
                      border: `1px solid ${factoryType === type ? colors.primary : '#e5e7eb'}`,
                      backgroundColor: factoryType === type ? colors.primary : '#ffffff',
                      color: factoryType === type ? '#ffffff' : colors.textSecondary,
                      cursor: 'pointer', letterSpacing: 1,
                    }}>
                    {type}
                  </button>
                ))}
              </div>

              {/* # Factory Name */}
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>
                  Factory Name *{' '}
                  {factoryType === 'SALES' && (
                    <span style={{ color: colors.primary, fontWeight: 400 }}>(validated if exists)</span>
                  )}
                  {factoryType === 'PRODUCTION' && (
                    <span style={{ color: colors.primary, fontWeight: 400 }}>(from system)</span>
                  )}
                </label>
                <input type="text" value={factoryName}
                  onChange={(e) => setFactoryName(e.target.value)}
                  placeholder="Enter factory name"
                  className="w-full p-3 rounded-xl text-sm focus:outline-none"
                  style={inputStyle} />
              </div>

              {/* # Location */}
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Location</label>
                <input type="text" value={factoryLocation}
                  onChange={(e) => setFactoryLocation(e.target.value)}
                  placeholder="Factory location"
                  className="w-full p-3 rounded-xl text-sm focus:outline-none"
                  style={inputStyle} />
              </div>

              {/* ===== RD Purpose of Visit ===== */}
              {factoryType === 'RD' && (
                <div className="mb-3">
                  <label className="block text-xs font-semibold mb-2" style={{ color: colors.textSecondary }}>
                    Purpose of Visit * (select multiple)
                  </label>
                  <div className="flex flex-col gap-2 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={rdNewCollection}
                        onChange={(e) => setRdNewCollection(e.target.checked)}
                        style={{ accentColor: colors.primary }} />
                      <span className="text-sm" style={{ color: colors.textPrimary }}>New Collection</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={rdMillDevelopment}
                        onChange={(e) => setRdMillDevelopment(e.target.checked)}
                        style={{ accentColor: colors.primary }} />
                      <span className="text-sm" style={{ color: colors.textPrimary }}>Mill Development</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={rdOthers}
                        onChange={(e) => setRdOthers(e.target.checked)}
                        style={{ accentColor: colors.primary }} />
                      <span className="text-sm" style={{ color: colors.textPrimary }}>Others</span>
                    </label>
                  </div>
                  {/* # Always visible — specify if others */}
                  <input type="text" value={rdOthersText}
                    onChange={(e) => setRdOthersText(e.target.value)}
                    placeholder="Specify if others"
                    className="w-full p-3 rounded-xl text-sm focus:outline-none"
                    style={inputStyle} />
                </div>
              )}

              {/* ===== SALES Purpose of Visit ===== */}
              {factoryType === 'SALES' && (
                <div className="mb-3">
                  <label className="block text-xs font-semibold mb-2" style={{ color: colors.textSecondary }}>
                    Purpose of Visit * (select multiple)
                  </label>
                  <div className="flex flex-col gap-2 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={salesNewCollection}
                        onChange={(e) => setSalesNewCollection(e.target.checked)}
                        style={{ accentColor: colors.primary }} />
                      <span className="text-sm" style={{ color: colors.textPrimary }}>New Collection</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={salesFollowUp}
                        onChange={(e) => setSalesFollowUp(e.target.checked)}
                        style={{ accentColor: colors.primary }} />
                      <span className="text-sm" style={{ color: colors.textPrimary }}>Follow up Development</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={salesOthers}
                        onChange={(e) => setSalesOthers(e.target.checked)}
                        style={{ accentColor: colors.primary }} />
                      <span className="text-sm" style={{ color: colors.textPrimary }}>Others</span>
                    </label>
                  </div>
                  {/* # Always visible — specify if others */}
                  <input type="text" value={salesOthersText}
                    onChange={(e) => setSalesOthersText(e.target.value)}
                    placeholder="Specify if others"
                    className="w-full p-3 rounded-xl text-sm focus:outline-none"
                    style={inputStyle} />
                </div>
              )}

              {/* ===== PRODUCTION Purpose of Visit ===== */}
              {factoryType === 'PRODUCTION' && (
                <div className="mb-3">
                  <label className="block text-xs font-semibold mb-2" style={{ color: colors.textSecondary }}>
                    Purpose of Visit *
                  </label>
                  <div className="flex flex-col gap-3">

                    {/* # Follow up Order radio */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="prodPurpose" value="followOrder"
                        checked={prodPurpose === 'followOrder'}
                        onChange={() => setProdPurpose('followOrder')}
                        style={{ accentColor: colors.primary }} />
                      <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>Follow up Order</span>
                    </label>

                    {/* # Follow up Order fields */}
                    {prodPurpose === 'followOrder' && (
                      <div style={{ paddingLeft: 20 }}>
                        <input type="text" value={prodOrderNumber}
                          onChange={(e) => setProdOrderNumber(e.target.value)}
                          placeholder="Order Number (from database or enter current/previous)"
                          style={fieldInput} />
                        {prodIssues.map((issue, i) => (
                          <input key={i} type="text" value={issue}
                            onChange={(e) => updateProdIssue(i, e.target.value)}
                            placeholder={`Issue ${i + 1}`}
                            style={fieldInput} />
                        ))}
                        <button onClick={addProdIssue}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.primary, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: '0 0 10px' }}>
                          + Add More Issues
                        </button>
                      </div>
                    )}

                    {/* # Others radio */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="prodPurpose" value="others"
                        checked={prodPurpose === 'others'}
                        onChange={() => setProdPurpose('others')}
                        style={{ accentColor: colors.primary }} />
                      <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>Others</span>
                    </label>

                    {/* # Others field — always visible */}
                    <div style={{ paddingLeft: 20 }}>
                      <input type="text" value={prodOthersText}
                        onChange={(e) => setProdOthersText(e.target.value)}
                        placeholder="Specify if others"
                        style={fieldInput} />
                    </div>

                  </div>
                </div>
              )}

              {/* # Mode of Transportation */}
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>
                  Mode of Transportation
                </label>
                <select value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm focus:outline-none"
                  style={{ ...inputStyle, width: '100%', appearance: 'auto' }}>
                  {TRANSPORT_MODES.map((mode) => (
                    <option key={mode} value={mode === 'Select mode' ? '' : mode}>{mode}</option>
                  ))}
                </select>
              </div>

              {/* # Cost of Transportation */}
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>
                  Cost of Transportation
                </label>
                <input type="text" value={transportCost}
                  onChange={(e) => setTransportCost(e.target.value)}
                  placeholder="Enter cost"
                  className="w-full p-3 rounded-xl text-sm focus:outline-none"
                  style={inputStyle} />
              </div>

              {/* # Description */}
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>
                  Description
                </label>
                <textarea value={factoryDescription}
                  onChange={(e) => setFactoryDescription(e.target.value)}
                  placeholder="Additional details about the visit" rows={3}
                  className="w-full p-3 rounded-xl text-sm focus:outline-none resize-none"
                  style={inputStyle} />
              </div>

            </div>
          )}

          {/* ===== BUSINESS TRIP ===== */}
          {purpose === 'business' && (
            <div>
              {businessTrips.map((trip, index) => (
                <div key={index} style={{ marginBottom: 12, padding: 12, backgroundColor: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: colors.primary }}>✈️ Buyer {index + 1}</p>
                    {businessTrips.length > 1 && (
                      <button onClick={() => setBusinessTrips(prev => prev.filter((_, i) => i !== index))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 18, padding: 0 }}>✕</button>
                    )}
                  </div>
                  <input type="text" placeholder="Buyer Name" value={trip.buyerName} onChange={(e) => updateBusinessTrip(index, 'buyerName', e.target.value)} style={fieldInput} />
                  <input type="text" placeholder="Location (optional)" value={trip.location} onChange={(e) => updateBusinessTrip(index, 'location', e.target.value)} style={fieldInput} />
                  <select value={trip.canReach} onChange={(e) => updateBusinessTrip(index, 'canReach', e.target.value)} style={{ ...fieldInput, backgroundColor: '#ffffff', appearance: 'auto' }}>
                    <option value="">Can be reached by</option>
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                  <p style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, marginBottom: 6, marginTop: 4 }}>Person 1</p>
                  <input type="text" placeholder="Person to Meet" value={trip.person1Name} onChange={(e) => updateBusinessTrip(index, 'person1Name', e.target.value)} style={fieldInput} />
                  <input type="text" placeholder="Department" value={trip.person1Dept} onChange={(e) => updateBusinessTrip(index, 'person1Dept', e.target.value)} style={fieldInput} />
                  <input type="text" placeholder="Agenda" value={trip.person1Agenda} onChange={(e) => updateBusinessTrip(index, 'person1Agenda', e.target.value)} style={fieldInput} />
                  <p style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, marginBottom: 6, marginTop: 4 }}>Person 2</p>
                  <input type="text" placeholder="Person to Meet" value={trip.person2Name} onChange={(e) => updateBusinessTrip(index, 'person2Name', e.target.value)} style={fieldInput} />
                  <input type="text" placeholder="Department" value={trip.person2Dept} onChange={(e) => updateBusinessTrip(index, 'person2Dept', e.target.value)} style={fieldInput} />
                  <input type="text" placeholder="Agenda" value={trip.person2Agenda} onChange={(e) => updateBusinessTrip(index, 'person2Agenda', e.target.value)} style={fieldInput} />
                  <p style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, marginBottom: 6, marginTop: 4 }}>Person 3</p>
                  <input type="text" placeholder="Person to Meet" value={trip.person3Name} onChange={(e) => updateBusinessTrip(index, 'person3Name', e.target.value)} style={fieldInput} />
                  <input type="text" placeholder="Department" value={trip.person3Dept} onChange={(e) => updateBusinessTrip(index, 'person3Dept', e.target.value)} style={fieldInput} />
                  <input type="text" placeholder="Agenda" value={trip.person3Agenda} onChange={(e) => updateBusinessTrip(index, 'person3Agenda', e.target.value)} style={{ ...fieldInput, marginBottom: 0 }} />
                </div>
              ))}
              <button onClick={() => setBusinessTrips(prev => [...prev, emptyBusinessTrip()])}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.primary, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 0' }}>
                + Add Another Buyer
              </button>
            </div>
          )}

          {/* ===== OTHERS ===== */}
          {purpose === 'others' && (
            <div>
              <input type="text" placeholder="Visit Type (e.g., Bank Visit)" value={othersVisitType}
                onChange={(e) => setOthersVisitType(e.target.value)}
                className="w-full p-3 rounded-xl text-sm focus:outline-none mb-2" style={inputStyle} />
              <select value={othersCanReach} onChange={(e) => setOthersCanReach(e.target.value)}
                className="w-full p-3 rounded-xl text-sm focus:outline-none mb-2"
                style={{ ...inputStyle, appearance: 'auto' }}>
                <option value="">Can be reached by</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
              <input type="text" placeholder="Location (optional)" value={othersLocation}
                onChange={(e) => setOthersLocation(e.target.value)}
                className="w-full p-3 rounded-xl text-sm focus:outline-none mb-2" style={inputStyle} />
              <textarea placeholder="Agenda (optional)" value={othersAgenda}
                onChange={(e) => setOthersAgenda(e.target.value)} rows={3}
                className="w-full p-3 rounded-xl text-sm focus:outline-none resize-none" style={inputStyle} />
            </div>
          )}

        </div>

        {divider}

        {/* ================================================ */}
        {/* # SECTION 2 — Basic Information                  */}
        {/* ================================================ */}
        <div className="mb-5">
          <h2 className="text-base font-bold mb-3" style={{ color: colors.textPrimary }}>Basic Information</h2>

          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Applicant *</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="applicant" checked={applicant === 'self'}
                  onChange={() => setApplicant('self')} style={{ accentColor: colors.primary }} />
                <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>Self</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="applicant" checked={applicant === 'onBehalf'}
                  onChange={() => setApplicant('onBehalf')} style={{ accentColor: colors.primary }} />
                <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>On Behalf Of</span>
              </label>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Accompanied With</label>
            <input type="text" value={accompaniedWith}
              onChange={(e) => setAccompaniedWith(e.target.value)}
              placeholder="Enter names if accompanied"
              className="w-full p-3 rounded-xl text-sm focus:outline-none" style={inputStyle} />
          </div>
        </div>

        {divider}

        {/* ================================================ */}
        {/* # SECTION 3 — Dates & Duration                   */}
        {/* ================================================ */}
        <div className="mb-5">
          <h2 className="text-base font-bold mb-3" style={{ color: colors.textPrimary }}>Dates & Duration</h2>

          {/* # From Date — always visible */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>
              {durationType === 'time' ? 'From Date *' : 'Date *'}
            </label>
            <input type="date" value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setError('') }}
              className="w-full p-3 rounded-xl text-sm focus:outline-none" style={inputStyle} />
          </div>

          {/* # Time / Duration radio */}
          <div className="mb-3">
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="durationType"
                  checked={durationType === 'time'}
                  onChange={() => { setDurationType('time'); setDurationDescription('morning'); setDurationDays('') }}
                  style={{ accentColor: colors.primary }} />
                <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>🕐 Time</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="durationType"
                  checked={durationType === 'duration'}
                  onChange={() => { setDurationType('duration'); setEndDate('') }}
                  style={{ accentColor: colors.primary }} />
                <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>⏱ Duration</span>
              </label>
            </div>
          </div>

          {/* # TIME — To Date + times visible */}
          {durationType === 'time' && (
            <div>
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>To Date *</label>
                <input type="date" value={endDate} min={startDate || ''}
                  onChange={(e) => { setEndDate(e.target.value); setError('') }}
                  className="w-full p-3 rounded-xl text-sm focus:outline-none" style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs mb-1" style={{ color: colors.textMuted }}>Start Time</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-3 rounded-xl text-sm focus:outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: colors.textMuted }}>End Time</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-3 rounded-xl text-sm focus:outline-none" style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {/* # DURATION — single day, no To Date */}
          {durationType === 'duration' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Session</label>
                <select value={durationDescription}
                  onChange={(e) => setDurationDescription(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm focus:outline-none"
                  style={{ ...inputStyle, appearance: 'auto' }}>
                  <option value="morning">Morning Session</option>
                  <option value="afternoon">Afternoon Session</option>
                  <option value="full">Full Day</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Duration Description</label>
                <input type="text" value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  placeholder="e.g., Doctor visit"
                  className="w-full p-3 rounded-xl text-sm focus:outline-none" style={inputStyle} />
              </div>
            </div>
          )}
        </div>

        {divider}

        {/* ================================================ */}
        {/* # SECTION 4 — Additional Information             */}
        {/* ================================================ */}
        <div className="mb-5">
          <h2 className="text-base font-bold mb-3" style={{ color: colors.textPrimary }}>Additional Information</h2>

          <textarea value={description}
            onChange={(e) => { if (e.target.value.length <= 500) setDescription(e.target.value) }}
            placeholder="Add description..." rows={4}
            className="w-full p-3 rounded-xl text-sm focus:outline-none resize-none" style={inputStyle} />
          <p className="text-xs mt-1 mb-4" style={{ color: colors.textMuted }}>{description.length}/500 characters</p>

          {/* # File Upload */}
          <label className="block text-xs font-semibold mb-2" style={{ color: colors.textSecondary }}>Supporting Document</label>
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileChange} style={{ display: 'none' }} />
          {!uploadedFile ? (
            <button onClick={() => fileInputRef.current?.click()}
              style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 13, fontWeight: 600, border: `1.5px dashed ${colors.primary}`, backgroundColor: '#f5f3ff', color: colors.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>📎</span>+ Upload Supporting Document
            </button>
          ) : (
            <div style={{ padding: '12px 14px', borderRadius: 12, backgroundColor: '#f0fdf4', border: '1px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>📄</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>{uploadedFile.name}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button onClick={() => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#ef4444', padding: 4 }}>✕</button>
            </div>
          )}
          <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 6, marginBottom: 16 }}>
            Accepted: PDF, JPG, PNG, DOC, DOCX (max 5MB)
          </p>

          {/* # Cancel + Submit */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setActiveScreen('dashboard')}
              className="py-4 rounded-xl font-bold text-sm"
              style={{ border: `1px solid ${colors.borderMedium}`, backgroundColor: colors.cardBg, color: colors.textSecondary, cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="py-4 rounded-xl font-bold text-sm text-white"
              style={{ background: submitting ? '#d1d5db' : colors.gradientButton, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? '⏳ Submitting...' : '✓ Submit Request'}
            </button>
          </div>
        </div>

      </div>

      <BottomNav active="newRequest" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default NewRequestScreen