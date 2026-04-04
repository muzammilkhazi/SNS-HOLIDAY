// ============================================
// sns-holiday-app — New Time Off Request Screen
// ============================================

import { useState } from 'react'
import type { ScreenName } from '../../types'
import { ChevronRightIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'
import { colors } from '../../constants/colors'

interface NewRequestScreenProps {
  setActiveScreen: (screen: ScreenName) => void
}

const NewRequestScreen = ({ setActiveScreen }: NewRequestScreenProps) => {
  // # Form state
  const [timeOffType, setTimeOffType] = useState<string>('paid')
  const [applicant, setApplicant] = useState<'self' | 'onBehalf'>('self')
  const [accompaniedWith, setAccompaniedWith] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('09:00')
  const [endTime, setEndTime] = useState<string>('17:00')
  const [durationDays, setDurationDays] = useState<string>('')
  const [durationDescription, setDurationDescription] = useState<string>('')
  const [purpose, setPurpose] = useState<string>('personal')
  const [leaveNote, setLeaveNote] = useState<string>('')
  const [reachBy, setReachBy] = useState({ phone: false, email: false, whatsapp: false })
  const [description, setDescription] = useState<string>('')

  // # Time off type options for dropdown
  const timeOffTypes = [
    { value: 'paid', label: 'Paid Time Off' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'unpaid', label: 'Unpaid Leave' },
    { value: 'business', label: 'Business Trip' },
    { value: 'casual', label: 'Casual Leave' },
  ]

  // # Purpose options
  const purposeOptions = [
    { value: 'personal', label: 'Personal' },
    { value: 'factory', label: 'Factory Visit' },
    { value: 'business', label: 'Business Trip' },
    { value: 'others', label: 'Others' },
  ]

  // # Handle reach by checkbox toggle
  const toggleReachBy = (key: 'phone' | 'email' | 'whatsapp') => {
    setReachBy(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // # Handle form submit
  const handleSubmit = () => {
    alert('Request Submitted Successfully!')
  }

  // # Shared input style
  const inputStyle = {
    borderWidth: 1,
    borderColor: colors.borderMedium,
    backgroundColor: colors.cardBg,
    color: colors.textPrimary,
  }

  return (
    <div className="flex flex-col h-full"
      style={{ backgroundColor: colors.background }}>

      {/* # Header */}
      <div className="p-4 shadow-md"
        style={{ background: colors.gradientHeader }}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveScreen('dashboard')}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <ChevronRightIcon className="w-5 h-5 text-white rotate-180" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-white">New Time Off Request</h1>
          </div>
          <div className="w-9" />
        </div>
      </div>

      {/* # Scrollable form content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {/* # Section 1 — Basic Information */}
        <div className="mb-5">
          <h2 className="text-base font-bold mb-3"
            style={{ color: colors.textPrimary }}>Basic Information</h2>

          {/* # Time Off Type dropdown */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1"
              style={{ color: colors.textSecondary }}>Time Off Type</label>
            <select
              value={timeOffType}
              onChange={(e) => setTimeOffType(e.target.value)}
              className="w-full p-3 rounded-xl text-sm focus:outline-none"
              style={inputStyle}>
              {timeOffTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* # Applicant radio buttons */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1"
              style={{ color: colors.textSecondary }}>Applicant *</label>
            <div className="flex gap-6">
              {/* # Self option */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="applicant"
                  checked={applicant === 'self'}
                  onChange={() => setApplicant('self')}
                  style={{ accentColor: colors.primary }}
                />
                <span className="text-sm font-medium"
                  style={{ color: colors.textPrimary }}>Self</span>
              </label>
              {/* # On Behalf Of option */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="applicant"
                  checked={applicant === 'onBehalf'}
                  onChange={() => setApplicant('onBehalf')}
                  style={{ accentColor: colors.primary }}
                />
                <span className="text-sm font-medium"
                  style={{ color: colors.textPrimary }}>On Behalf Of</span>
              </label>
            </div>
          </div>

          {/* # Accompanied With */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1"
              style={{ color: colors.textSecondary }}>Accompanied With</label>
            <input
              type="text"
              value={accompaniedWith}
              onChange={(e) => setAccompaniedWith(e.target.value)}
              placeholder="Enter names if accompanied"
              className="w-full p-3 rounded-xl text-sm focus:outline-none"
              style={inputStyle} />
          </div>
        </div>

        {/* # Divider */}
        <div className="mb-5"
          style={{ borderTopWidth: 1, borderColor: colors.borderMedium }} />

        {/* # Section 2 — Dates & Duration */}
        <div className="mb-5">
          <h2 className="text-base font-bold mb-3"
            style={{ color: colors.textPrimary }}>Dates & Duration</h2>

          {/* # Date Range — 2 pickers side by side */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1"
              style={{ color: colors.textSecondary }}>Date Range *</label>
            <div className="grid grid-cols-2 gap-2">
              {/* # Start date - restricted to 4 digit year */}
              <input
                type="date"
                value={startDate}
                min="2020-01-01"
                max="2099-12-31"
                onChange={(e) => {
                  // # Only allow valid 4 digit year dates
                  const val = e.target.value
                  const year = parseInt(val.split('-')[0])
                  if (year >= 2020 && year <= 2099) setStartDate(val)
                }}
                className="w-full p-3 rounded-xl text-sm focus:outline-none"
                style={inputStyle} />
              {/* # End date - restricted to 4 digit year */}
              <input
                type="date"
                value={endDate}
                min="2020-01-01"
                max="2099-12-31"
                onChange={(e) => {
                  // # Only allow valid 4 digit year dates
                  const val = e.target.value
                  const year = parseInt(val.split('-')[0])
                  if (year >= 2020 && year <= 2099) setEndDate(val)
                }}
                className="w-full p-3 rounded-xl text-sm focus:outline-none"
                style={inputStyle} />
            </div>
          </div>

          {/* # Time — 2 pickers side by side */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1"
              style={{ color: colors.textSecondary }}>Time</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-3 rounded-xl text-sm focus:outline-none"
                style={inputStyle} />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-3 rounded-xl text-sm focus:outline-none"
                style={inputStyle} />
            </div>
          </div>

          {/* # Duration — 2 inputs side by side */}
          <div className="mb-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1"
                  style={{ color: colors.textSecondary }}>Duration (Days)</label>
                {/* # min=0 max=365 prevents negative numbers */}
                <input
                  type="number"
                  value={durationDays}
                  min="0"
                  max="365"
                  onChange={(e) => {
                    // # Prevent negative values
                    const val = parseFloat(e.target.value)
                    if (val >= 0 || e.target.value === '') setDurationDays(e.target.value)
                  }}
                  placeholder="e.g., 1.00"
                  className="w-full p-3 rounded-xl text-sm focus:outline-none"
                  style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1"
                  style={{ color: colors.textSecondary }}>Duration Description</label>
                <input
                  type="text"
                  value={durationDescription}
                  onChange={(e) => setDurationDescription(e.target.value)}
                  placeholder="e.g., morning session"
                  className="w-full p-3 rounded-xl text-sm focus:outline-none"
                  style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        {/* # Divider */}
        <div className="mb-5"
          style={{ borderTopWidth: 1, borderColor: colors.borderMedium }} />

        {/* # Section 3 — Purpose */}
        <div className="mb-5">
          <h2 className="text-base font-bold mb-3"
            style={{ color: colors.textPrimary }}>Purpose</h2>

          {/* # Purpose grid buttons */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-2"
              style={{ color: colors.textSecondary }}>Purpose *</label>
            <div className="grid grid-cols-2 gap-2">
              {purposeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPurpose(option.value)}
                  className="p-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    borderWidth: 1,
                    borderColor: purpose === option.value
                      ? colors.primary : colors.borderMedium,
                    backgroundColor: purpose === option.value
                      ? colors.primary : colors.cardBg,
                    color: purpose === option.value
                      ? '#ffffff' : colors.textSecondary,
                  }}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* # Sick or Annual Personal Leave note */}
          <div className="mb-3">
            <input
              type="text"
              value={leaveNote}
              onChange={(e) => setLeaveNote(e.target.value)}
              placeholder="Sick or Annual Personal Leave (optional)"
              className="w-full p-3 rounded-xl text-sm focus:outline-none"
              style={inputStyle} />
          </div>

          {/* # Can Be Reached By checkboxes */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-2"
              style={{ color: colors.textSecondary }}>Can Be Reached By</label>
            <div className="flex flex-col gap-2">
              {/* # Phone checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reachBy.phone}
                  onChange={() => toggleReachBy('phone')}
                  style={{ accentColor: colors.primary }}
                />
                <span className="text-sm"
                  style={{ color: colors.textPrimary }}>Phone</span>
              </label>
              {/* # Email checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reachBy.email}
                  onChange={() => toggleReachBy('email')}
                  style={{ accentColor: colors.primary }}
                />
                <span className="text-sm"
                  style={{ color: colors.textPrimary }}>Email</span>
              </label>
              {/* # WhatsApp checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reachBy.whatsapp}
                  onChange={() => toggleReachBy('whatsapp')}
                  style={{ accentColor: colors.primary }}
                />
                <span className="text-sm"
                  style={{ color: colors.textPrimary }}>WhatsApp</span>
              </label>
            </div>
          </div>
        </div>

        {/* # Divider */}
        <div className="mb-5"
          style={{ borderTopWidth: 1, borderColor: colors.borderMedium }} />

        {/* # Section 4 — Additional Information */}
        <div className="mb-5">
          <h2 className="text-base font-bold mb-3"
            style={{ color: colors.textPrimary }}>Additional Information</h2>

          {/* # Description textarea with character counter */}
          <div className="mb-3">
            <textarea
              value={description}
              onChange={(e) => {
                // # Limit to 500 characters only
                if (e.target.value.length <= 500) setDescription(e.target.value)
              }}
              placeholder="Add description..."
              rows={4}
              className="w-full p-3 rounded-xl text-sm focus:outline-none resize-none"
              style={inputStyle} />
            {/* # Character counter */}
            <p className="text-xs mt-1"
              style={{ color: colors.textMuted }}>
              {description.length}/500 characters
            </p>
          </div>

          {/* # Upload Supporting Document */}
          <button
            className="w-full p-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mb-5"
            style={{
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: colors.primary,
              backgroundColor: colors.cardBg,
              color: colors.primary,
            }}>
            + Upload Supporting Document
          </button>

          {/* # Cancel and Submit buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveScreen('dashboard')}
              className="py-4 rounded-xl font-bold text-sm"
              style={{
                borderWidth: 1,
                borderColor: colors.borderMedium,
                backgroundColor: colors.cardBg,
                color: colors.textSecondary,
              }}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
              style={{ background: colors.gradientButton }}>
              ✓ Submit Request
            </button>
          </div>
        </div>

      </div>

      <BottomNav active="newRequest" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default NewRequestScreen