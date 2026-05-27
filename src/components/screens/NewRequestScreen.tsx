// ============================================
// sns-holiday-app — New Time Off Request Screen
// ============================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import type { ScreenName } from '../../types'
import type { UserSession } from '../../services/api'
import { getSessionId } from '../../services/api'
import { ChevronRightIcon } from '../icons/Icons'
import BottomNav from '../BottomNav'
import { colors } from '../../constants/colors'

interface LeaveType {
  id: number
  name: string
}

interface BusinessTrip {
  buyerName: string
  buyerPartnerId: number | false
  buyerResults: { id: number; name: string }[]
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

interface BuyerArticle {
  articleNumber: string
  priority: string
  itemDescription: string
}

interface NewRequestScreenProps {
  setActiveScreen: (screen: ScreenName) => void
  session: UserSession | null
}

const PRIORITY_OPTIONS = [
  { value: 'top',                label: 'Top Urgent' },
  { value: 'urgent',             label: 'Urgent' },
  { value: 'normal',             label: 'Normal' },
  { value: 'picked_but_on_hold', label: 'Picked but on hold' },
  { value: 'please_arrange',     label: 'Please arrange but do not send out' },
]

const PURPOSE_OPTIONS = [
  { value: 'personal',  label: 'Personal' },
  { value: 'factory',   label: 'Factory Visit' },
  { value: 'business',  label: 'Business Trip' },
  { value: 'others',    label: 'Others' },
]

const FACTORY_TYPES = ['RD', 'SALES', 'PRODUCTION']
const TRANSPORT_MODES = [
  { value: '',        label: 'Select mode' },
  { value: 'flight',  label: 'Flight' },
  { value: 'train',   label: 'Train' },
  { value: 'car',     label: 'Car' },
  { value: 'bus',     label: 'Bus' },
  { value: 'others',  label: 'Others' },
]
const TRAVEL_PURPOSES = [
  { value: '',               label: 'Select purpose' },
  { value: 'client_meeting', label: 'Client Meeting' },
  { value: 'conference',     label: 'Conference' },
  { value: 'training',       label: 'Training' },
  { value: 'exhibition',     label: 'Exhibition' },
  { value: 'others',         label: 'Others' },
]
const CURRENCIES = [
  'RMB', 'INR', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'IDR', 'MYR', 'SGD', 'THB', 'PKR', 'BDT', 'TRY', 'VND',
]

// # Returns YYYY-MM-DD in LOCAL time (avoids UTC off-by-one-day on IST/CST)
const getLocalDateStr = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const emptyBusinessTrip = (): BusinessTrip => ({
  buyerName: '', buyerPartnerId: false, buyerResults: [], canReach: '',
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
  const [reachBy, setReachBy]                         = useState({ phone: false, email: false, whatsApp: false })

  // # Factory
  const [factoryType, setFactoryType]                 = useState<string>('RD')
  const [factoryName, setFactoryName]                 = useState<string>('')
  const [factoryPartnerId, setFactoryPartnerId]       = useState<number | false>(false)
  const [factoryResults, setFactoryResults]           = useState<{ id: number; name: string }[]>([])
  const [factoryLocation, setFactoryLocation]         = useState<string>('')
  const [transportMode, setTransportMode]             = useState<string>('')
  const [transportCost, setTransportCost]             = useState<string>('')
  const [transportCurrency, setTransportCurrency]     = useState<string>('RMB')
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
  const [businessCountry, setBusinessCountry]           = useState<string>('')
  const [businessCountryId, setBusinessCountryId]       = useState<number | false>(false)
  const [countryResults, setCountryResults]             = useState<{ id: number; name: string }[]>([])
  const [countrySearching, setCountrySearching]         = useState(false)
  const [businessTravelPurpose, setBusinessTravelPurpose] = useState<string>('')
  const [businessLocation, setBusinessLocation]         = useState<string>('')
  const [businessDescription, setBusinessDescription]   = useState<string>('')
  const [businessTransportMode, setBusinessTransportMode] = useState<string>('')
  const [businessTransportCost, setBusinessTransportCost] = useState<string>('')
  const [businessTransportCurrency, setBusinessTransportCurrency] = useState<string>('RMB')
  const [businessTrips, setBusinessTrips]               = useState<BusinessTrip[]>([emptyBusinessTrip()])
  const [buyerArticles, setBuyerArticles]               = useState<BuyerArticle[]>([{ articleNumber: '', priority: '', itemDescription: '' }])
  const [meetingNotes, setMeetingNotes]                 = useState<string>('')
  const [scanningArticleIndex, setScanningArticleIndex] = useState<number | null>(null)
  const [scannerError, setScannerError]                 = useState<string | null>(null)

  // # Others
  const [othersVisitType, setOthersVisitType]         = useState<string>('')
  const [othersCanReach, setOthersCanReach]           = useState<string>('')
  const [othersLocation, setOthersLocation]           = useState<string>('')
  const [othersAgenda, setOthersAgenda]               = useState<string>('')

  // # Basic Info
  const [accompaniedWith, setAccompaniedWith]         = useState<string>('')

  // # Dates & Duration — default to today / tomorrow
  const [startDate, setStartDate]                     = useState<string>(() => getLocalDateStr(new Date()))
  const [endDate, setEndDate]                         = useState<string>(() => { const d = new Date(); d.setDate(d.getDate() + 1); return getLocalDateStr(d) })
  const [startTime, setStartTime]                     = useState<string>('09:30')
  const [endTime, setEndTime]                         = useState<string>('17:30')
  const [durationType, setDurationType]               = useState<'time' | 'duration'>('time')
  const [durationDescription, setDurationDescription] = useState<string>('morning')
  const [durationDays, setDurationDays]               = useState<string>('')

  // # Conflict check — existing leave on selected dates
  const [conflictLeaves, setConflictLeaves]           = useState<{ id: number; type: string; from: string; to: string }[]>([])
  const [conflictChecking, setConflictChecking]       = useState(false)

  // # Additional
  const [description, setDescription]                 = useState<string>('')
  const [attachmentFile, setAttachmentFile]           = useState<File | null>(null)

  // # Submit
  const [submitting, setSubmitting]                   = useState(false)
  const [popup, setPopup]                             = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const scrollRef                                     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchLeaveTypes()
    return () => {}
  }, [])

  const fetchLeaveTypes = async () => {
    setLeaveTypesLoading(true)
    const employeeId = session?.employeeId
    try {
      const res = await fetch('/web/dataset/call_kw/hr.leave.type/search_read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 11,
          params: {
            session_id: getSessionId(),
            model: 'hr.leave.type', method: 'search_read',
            args: [[['active', '=', true]]],
            kwargs: {
              fields: ['id', 'name'],
              order: 'name asc',
              // # Pass employee context so Odoo returns ALL leave types for this
              // # employee, not just those with active allocations
              context: employeeId ? { employee_id: employeeId, active_test: true } : {},
            },
          },
        }),
      })
      const data = await res.json()
      let allTypes: LeaveType[] = data.result || []

      // # Explicitly fetch Business Trip by name in case Odoo hides it for this user
      const btRes = await fetch('/web/dataset/call_kw/hr.leave.type/search_read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 111,
          params: {
            session_id: getSessionId(),
            model: 'hr.leave.type', method: 'search_read',
            args: [[['name', 'ilike', 'business']]],
            kwargs: { fields: ['id', 'name'], context: { active_test: false } },
          },
        }),
      })
      const btData = await btRes.json()
      if (btData.result?.length > 0) {
        const existingIds = new Set(allTypes.map((t: LeaveType) => t.id))
        btData.result.forEach((t: LeaveType) => {
          if (!existingIds.has(t.id)) allTypes = [...allTypes, t]
        })
      }

      if (allTypes.length > 0) {
        const seen = new Set<string>()
        const unique = allTypes.filter((t: LeaveType) => {
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

  // # Check if this employee already has an approved/pending leave overlapping the selected dates
  const checkConflicts = async (from: string, to: string) => {
    const empId = session?.employeeId
    if (!empId || !from) { setConflictLeaves([]); return }
    setConflictChecking(true)
    try {
      const res = await fetch('/web/dataset/call_kw/hr.leave/search_read', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 70,
          params: {
            session_id: getSessionId(),
            model: 'hr.leave', method: 'search_read',
            args: [[
              ['employee_id', '=', empId],
              ['state', 'in', ['validate', 'validate1', 'confirm']],
              ['date_from', '<=', to + ' 23:59:59'],
              ['date_to',   '>=', from + ' 00:00:00'],
            ]],
            kwargs: { fields: ['id', 'holiday_status_id', 'date_from', 'date_to'], limit: 5 },
          },
        }),
      })
      const data = await res.json()
      const hits = (data.result || []).filter(
        (r: { holiday_status_id: unknown }) => Array.isArray(r.holiday_status_id)
      )
      setConflictLeaves(hits.map((r: { id: number; holiday_status_id: [number, string]; date_from: string; date_to: string }) => ({
        id: r.id, type: r.holiday_status_id[1], from: r.date_from, to: r.date_to,
      })))
    } catch {
      setConflictLeaves([])
    } finally {
      setConflictChecking(false)
    }
  }

  // # Re-run conflict check whenever dates or duration mode changes
  useEffect(() => {
    setConflictLeaves([]) // clear immediately so old conflicts don't block the form
    if (!startDate) return
    const toDate = durationType === 'time' && endDate ? endDate : startDate
    checkConflicts(startDate, toDate)
  }, [startDate, endDate, durationType])

  const lookupEmployeeByName = async (name: string): Promise<number | false> => {
    if (!name.trim()) return false
    try {
      const res = await fetch('/web/dataset/call_kw/hr.employee/search_read', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 92,
          params: { session_id: getSessionId(), model: 'hr.employee', method: 'search_read', args: [[['name', 'ilike', name.trim()]]], kwargs: { fields: ['id'], limit: 1 } },
        }),
      })
      const data = await res.json()
      return data.result?.[0]?.id || false
    } catch { return false }
  }

  const searchFactories = async (query: string) => {
    if (!query.trim()) { setFactoryResults([]); return }
    try {
      const res = await fetch('/web/dataset/call_kw/res.partner/search_read', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 95,
          params: { session_id: getSessionId(), model: 'res.partner', method: 'search_read', args: [[['name', 'ilike', query.trim()]]], kwargs: { fields: ['id', 'name'], limit: 8 } },
        }),
      })
      const data = await res.json()
      setFactoryResults(data.result || [])
    } catch { setFactoryResults([]) }
  }

  const searchBuyers = async (query: string, tripIndex: number) => {
    if (!query.trim()) {
      setBusinessTrips(prev => prev.map((t, i) => i === tripIndex ? { ...t, buyerResults: [] } : t))
      return
    }
    try {
      const res = await fetch('/web/dataset/call_kw/res.partner/search_read', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 94,
          params: { session_id: getSessionId(), model: 'res.partner', method: 'search_read', args: [[['name', 'ilike', query.trim()]]], kwargs: { fields: ['id', 'name'], limit: 8 } },
        }),
      })
      const data = await res.json()
      setBusinessTrips(prev => prev.map((t, i) => i === tripIndex ? { ...t, buyerResults: data.result || [] } : t))
    } catch {
      setBusinessTrips(prev => prev.map((t, i) => i === tripIndex ? { ...t, buyerResults: [] } : t))
    }
  }

  const searchCountries = async (query: string) => {
    if (!query.trim()) { setCountryResults([]); return }
    setCountrySearching(true)
    try {
      const res = await fetch('/web/dataset/call_kw/res.country/search_read', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 93,
          params: { session_id: getSessionId(), model: 'res.country', method: 'search_read', args: [[['name', 'ilike', query.trim()]]], kwargs: { fields: ['id', 'name'], limit: 8 } },
        }),
      })
      const data = await res.json()
      setCountryResults(data.result || [])
    } catch { setCountryResults([]) }
    finally { setCountrySearching(false) }
  }

  const addProdIssue = () => setProdIssues(prev => [...prev, ''])
  const updateProdIssue = (i: number, val: string) =>
    setProdIssues(prev => prev.map((v, idx) => idx === i ? val : v))

  const updateBusinessTrip = (index: number, field: keyof BusinessTrip, value: string) => {
    setBusinessTrips(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t))
  }

  const updateBuyerArticle = (index: number, field: keyof BuyerArticle, value: string) => {
    setBuyerArticles(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a))
  }

  const addBuyerArticle = () =>
    setBuyerArticles(prev => [...prev, { articleNumber: '', priority: '', itemDescription: '' }])

  const removeBuyerArticle = (index: number) =>
    setBuyerArticles(prev => prev.filter((_, i) => i !== index))

  const qrScannerRef    = useRef<Html5Qrcode | null>(null)
  const scannerStarted  = useRef(false)

  const stopScanner = useCallback(async () => {
    if (qrScannerRef.current && scannerStarted.current) {
      try { await qrScannerRef.current.stop() } catch { /* ignore */ }
      scannerStarted.current = false
    }
    qrScannerRef.current = null
    setScanningArticleIndex(null)
    setScannerError(null)
  }, [])

  useEffect(() => {
    if (scanningArticleIndex === null) return

    const scanner = new Html5Qrcode('qr-scanner-view', { verbose: false })
    qrScannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 12, qrbox: { width: 260, height: 260 } },
      (decodedText) => {
        updateBuyerArticle(scanningArticleIndex, 'articleNumber', decodedText)
        scanner.stop().catch(() => {}).finally(() => {
          scannerStarted.current = false
          setScanningArticleIndex(null)
          setScannerError(null)
        })
      },
      () => { /* scanning frame — no action needed */ }
    ).then(() => {
      scannerStarted.current = true
    }).catch((err: unknown) => {
      const msg = (err instanceof Error ? err.message : String(err)).toLowerCase()
      if (msg.includes('permission') || msg.includes('denied') || msg.includes('notallowed')) {
        setScannerError('Camera permission denied. Please tap Allow when the browser asks for camera access.')
      } else if (msg.includes('notfound') || msg.includes('no camera')) {
        setScannerError('No camera found on this device.')
      } else {
        setScannerError(`Could not start camera: ${err instanceof Error ? err.message : String(err)}`)
      }
    })

    return () => {
      if (scannerStarted.current) {
        scanner.stop().catch(() => {})
        scannerStarted.current = false
      }
    }
  }, [scanningArticleIndex])


  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const uploadAttachment = async (leaveId: number, file: File) => {
    try {
      const dataUrl = await fileToBase64(file)
      const base64Data = dataUrl.split(',')[1]
      await fetch('/web/dataset/call_kw/hr.leave/write', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 15,
          params: {
            session_id: getSessionId(), model: 'hr.leave', method: 'write',
            args: [[leaveId], { supporting_document: base64Data }],
            kwargs: {},
          },
        }),
      })
    } catch (err) {
      console.error('Attachment upload failed:', err)
    }
  }

  const showError = (msg: string) => setPopup({ type: 'error', message: msg })

  const handleSubmit = async () => {
    setPopup(null)
    if (!timeOffTypeId) { showError('Please select a leave type.'); return }
    if (!startDate)     { showError('Please select a From Date.'); return }
    if (durationType === 'time') {
      if (!endDate)            { showError('Please select a To Date.'); return }
      if (endDate < startDate) { showError('To Date cannot be before From Date.'); return }
      if (endDate === startDate && endTime <= startTime) {
        showError('End time cannot be earlier than or equal to start time for the same day.'); return
      }
    }
    if (conflictChecking) { showError('Please wait — checking for existing leaves on selected dates.'); return }
    if (conflictLeaves.length > 0) { showError('You already have an approved or pending leave on the selected dates. Please choose different dates.'); return }
    const employeeId = session?.employeeId
    if (!employeeId) { showError('Employee not found. Please log out and log back in.'); return }
    setSubmitting(true)

    // # Normalize dates to YYYY-MM-DD — Android browsers sometimes return DD/MM/YYYY
    const toISO = (d: string): string => {
      if (!d) return d
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
      const m = d.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/)
      if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
      return d
    }
    const safeStart = toISO(startDate)
    const safeEnd   = toISO(endDate)

    const finalEndDate = durationType === 'duration' ? safeStart : safeEnd

    // # Half-day fields for duration mode
    const isHalfDay = durationType === 'duration' && durationDescription !== 'full'


    // # Purpose → Odoo selection value
    const purposeMap: Record<string, string> = { personal: 'personal', factory: 'factory_visit', business: 'business_trip', others: 'others' }
    const factoryTypeMap: Record<string, string> = { RD: 'rd', SALES: 'sales', PRODUCTION: 'production' }

    // # Single selection — Odoo others_reachable_by is a selection field
    const reachByValue = reachBy.phone ? 'phone' : reachBy.email ? 'email' : reachBy.whatsApp ? 'whatsapp' : false

    // # name = the actual description text (required by Odoo)
    const leaveName = description || leaveNote || `${PURPOSE_OPTIONS.find(p => p.value === purpose)?.label ?? 'Leave'} Request`

    // # Accompanied With — many2many hr.employee
    const accompaniedEmpId = accompaniedWith ? await lookupEmployeeByName(accompaniedWith) : false

    const leavePayload: Record<string, unknown> = {
      holiday_status_id: timeOffTypeId,
      request_date_from: safeStart,
      request_date_to:   finalEndDate,
      employee_id:       employeeId,
      name:              leaveName,
      leave_purpose:     purposeMap[purpose] || purpose,
    }

    if (isHalfDay) {
      leavePayload.request_unit_half = true
      leavePayload.request_date_from_period = durationDescription === 'morning' ? 'am' : 'pm'
      leavePayload.duration_text = durationDescription === 'morning' ? 'Morning Session' : 'Afternoon Session'
    } else if (durationType === 'duration' && durationDescription === 'full') {
      leavePayload.duration_text = 'Full Day'
    }

    // # Accompanied With (many2many hr.employee)
    if (accompaniedEmpId) leavePayload.employee_ids = [[4, accompaniedEmpId]]

    // # Can Be Reached By — Personal uses checkboxes, Others uses dropdown
    if (purpose === 'others' && othersCanReach) leavePayload.others_reachable_by = othersCanReach
    else if (reachByValue) leavePayload.others_reachable_by = reachByValue

    // # Others purpose sub-fields
    if (purpose === 'others') {
      if (othersVisitType) leavePayload.others_purpose  = othersVisitType
      if (othersLocation)  leavePayload.others_location = othersLocation
      if (othersAgenda)    leavePayload.others_agenda   = othersAgenda
    }

    // # Factory Visit
    if (purpose === 'factory') {
      if (!factoryPartnerId) {
        setPopup({ type: 'error', message: factoryName.trim() ? `Factory "${factoryName}" not found. Please search and select from the dropdown.` : 'Please search and select a Factory Name.' })
        setSubmitting(false); return
      }
      leavePayload.factory_visit_type = factoryTypeMap[factoryType] || factoryType.toLowerCase()
      const lineData: Record<string, unknown> = {
        partner_id:        factoryPartnerId,
        location:          factoryLocation || false,
        mode_of_transport: transportMode   || false,
        cost_of_transport: transportCost   ? parseFloat(transportCost) : 0,
      }
      if (factoryType === 'RD') {
        lineData.new_collection  = rdNewCollection
        lineData.mill_development = rdMillDevelopment
        lineData.others          = rdOthers
        lineData.specify_others  = rdOthersText  || false
      } else if (factoryType === 'SALES') {
        lineData.new_collection  = salesNewCollection
        lineData.follow_up_div   = salesFollowUp
        lineData.others          = salesOthers
        lineData.specify_others  = salesOthersText || false
      } else {
        // PRODUCTION — map to proper backend fields
        lineData.order_number   = prodOrderNumber || false
        lineData.issue_1        = [...prodIssues.filter(Boolean), prodOthersText].filter(Boolean).join(', ') || false
        lineData.others         = !!(prodOthersText)
        lineData.specify_others = prodOthersText || false
      }
      lineData.visit_description = factoryDescription || false
      leavePayload.factory_visit_line_ids = [[0, 0, lineData]]
    }

    // # Business Trip
    if (purpose === 'business') {
      if (!businessCountryId) {
        setPopup({ type: 'error', message: 'Please select a Country from the dropdown for the Business Trip.' })
        setSubmitting(false); return
      }
      const countryId = businessCountryId

      // # Validate all required business.lines fields before sending
      if (!businessTravelPurpose) {
        setPopup({ type: 'error', message: 'Please select a Travel Purpose for the Business Trip.' })
        setSubmitting(false); return
      }

      const lines: unknown[] = []
      const notFoundBuyers: string[] = []

      for (const trip of businessTrips) {
        if (!trip.buyerName) continue
        if (!trip.buyerPartnerId) { notFoundBuyers.push(trip.buyerName); continue }
        if (!trip.person1Name.trim()) {
          setPopup({ type: 'error', message: `Please enter "Person to Meet" for buyer "${trip.buyerName}".` })
          setSubmitting(false); return
        }
        const partnerId = trip.buyerPartnerId

        const persons = [
          { name: trip.person1Name, dept: trip.person1Dept, agenda: trip.person1Agenda },
          { name: trip.person2Name, dept: trip.person2Dept, agenda: trip.person2Agenda },
          { name: trip.person3Name, dept: trip.person3Dept, agenda: trip.person3Agenda },
        ].filter(p => p.name)

        // # All required fields in every business.lines record
        const baseLine: Record<string, unknown> = {
          partner_id:       partnerId,
          country_id:       countryId,
          travel_purpose:   businessTravelPurpose,
          location:         businessLocation        || false,
          description:      businessDescription     || false,
          mode_of_transport: businessTransportMode  || false,
          cost_of_transport: businessTransportCost  ? parseFloat(businessTransportCost) : 0,
          meeting_notes:    meetingNotes             || false,
        }

        // # Meeting lines — one per person
        for (const p of persons) {
          lines.push([0, 0, { ...baseLine, person_to_meet: p.name, department: p.dept || false, agenda: p.agenda || false }])
        }

        // # Article lines — all required fields included
        for (const article of buyerArticles) {
          if (!article.articleNumber && !article.priority) continue
          lines.push([0, 0, {
            ...baseLine,
            person_to_meet:    trip.person1Name,
            article_no:        article.articleNumber   || false,
            select_priority:   article.priority        || false,
            buyer_description: article.itemDescription || false,
          }])
        }
      }

      if (lines.length === 0) {
        const msg = notFoundBuyers.length > 0
          ? `Buyer "${notFoundBuyers[0]}" not found in the system. Please enter the exact registered buyer name.`
          : 'Please enter at least one Buyer Name for the Business Trip.'
        setPopup({ type: 'error', message: msg })
        setSubmitting(false)
        return
      }
      leavePayload.business_line_ids = lines
    }

    try {
      const res = await fetch('/web/dataset/call_kw/hr.leave/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 12,
          params: {
            session_id: getSessionId(),
            model: 'hr.leave', method: 'create',
            args: [leavePayload],
            kwargs: {},
          },
        }),
      })
      const data = await res.json()
      if (data.error) {
        const rawMsg: string = data.error.data?.message || data.error.message || 'Failed to submit request'
        const isOverlap = rawMsg.toLowerCase().includes('overlap') || rawMsg.toLowerCase().includes('two time off') || rawMsg.toLowerCase().includes('already') || rawMsg.toLowerCase().includes('conflicting')
        const isInsufficient = rawMsg.toLowerCase().includes('sufficient') || rawMsg.toLowerCase().includes('not enough')
        let errorMsg = rawMsg
        if (isOverlap) {
          errorMsg = 'Leave already exists for these dates. Please check your existing request.'
        } else if (isInsufficient) {
          errorMsg = 'Insufficient leave balance. Please contact HR to add or approve your allocation.'
        }
        setPopup({ type: 'error', message: errorMsg })
        return
      }
      if (data.result) {
        const leaveId = data.result as number
        if (attachmentFile) await uploadAttachment(leaveId, attachmentFile)
        setPopup({ type: 'success', message: 'Your leave request has been submitted successfully!' })
      } else {
        setPopup({ type: 'error', message: 'Unexpected response from server. Please try again.' })
      }
    } catch {
      setPopup({ type: 'error', message: 'Network error. Please check your connection and try again.' })
    }
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

      {/* ===== SUBMIT RESULT POPUP ===== */}
      {popup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 28px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: 24, width: '100%', maxWidth: 360, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', animation: 'fadeIn 0.2s ease' }}>

            {/* # Coloured top bar */}
            <div style={{ height: 6, background: popup.type === 'success' ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#ef4444,#dc2626)' }} />

            <div style={{ padding: '28px 24px 24px' }}>
              {/* # Icon + title */}
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: popup.type === 'success' ? '#dcfce7' : '#fee2e2' }}>
                  <span style={{ fontSize: 32 }}>{popup.type === 'success' ? '✅' : '⚠️'}</span>
                </div>
                <p style={{ fontSize: 17, fontWeight: 800, color: popup.type === 'success' ? '#16a34a' : '#dc2626', margin: 0 }}>
                  {popup.type === 'success' ? 'Request Submitted!' : 'Submission Failed'}
                </p>
              </div>

              {/* # Message */}
              <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.7, textAlign: 'center', whiteSpace: 'pre-line', marginBottom: 24 }}>
                {popup.message}
              </p>

              {/* # Action button */}
              {popup.type === 'success' ? (
                <button
                  onClick={() => { setPopup(null); setActiveScreen('dashboard') }}
                  style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                  Go to Dashboard
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setPopup(null)}
                    style={{ flex: 1, padding: '13px', borderRadius: 14, backgroundColor: '#f3f4f6', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#374151' }}>
                    Fix & Retry
                  </button>
                  <button
                    onClick={() => { setPopup(null); setActiveScreen('dashboard') }}
                    style={{ flex: 1, padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg,#ef4444,#dc2626)', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                    Go Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


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

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">


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
              <div style={{ position: 'relative' }}>
                <select
                  value={String(timeOffTypeId)}
                  onChange={(e) => setTimeOffTypeId(Number(e.target.value))}
                  className="w-full p-3 rounded-xl text-sm focus:outline-none"
                  style={{ ...inputStyle, width: '100%', appearance: 'none', paddingRight: 40 }}>
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={String(type.id)}>{type.name}</option>
                  ))}
                </select>
                <ChevronRightIcon
                  className="w-4 h-4 rotate-90"
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%) rotate(90deg)',
                    color: colors.textLight, pointerEvents: 'none',
                  }}
                />
              </div>
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
                {([['phone', 'Phone'], ['email', 'Email'], ['whatsApp', 'WhatsApp']] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="reachBy"
                      checked={reachBy[key]}
                      onChange={() => setReachBy({ phone: false, email: false, whatsApp: false, [key]: true })}
                      style={{ accentColor: colors.primary }} />
                    <span className="text-sm" style={{ color: colors.textPrimary }}>{label}</span>
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

              {/* # Factory Name — search dropdown */}
              <div className="mb-3" style={{ position: 'relative' }}>
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>
                  Factory Name *
                </label>
                <input
                  type="text"
                  value={factoryName}
                  onChange={(e) => {
                    setFactoryName(e.target.value)
                    setFactoryPartnerId(false)
                    searchFactories(e.target.value)
                  }}
                  placeholder="Search factory name..."
                  className="w-full p-3 rounded-xl text-sm focus:outline-none"
                  style={{ ...inputStyle, borderColor: factoryPartnerId ? '#22c55e' : inputStyle.borderColor }}
                />
                {factoryResults.length > 0 && !factoryPartnerId && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', maxHeight: 180, overflowY: 'auto' }}>
                    {factoryResults.map((f) => (
                      <button key={f.id}
                        onPointerDown={(e) => {
                          e.preventDefault()
                          setFactoryName(f.name)
                          setFactoryPartnerId(f.id)
                          setFactoryResults([])
                        }}
                        style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#1a1035', borderBottom: '1px solid #f3f4f6' }}>
                        {f.name}
                      </button>
                    ))}
                  </div>
                )}
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
                <div style={{ position: 'relative' }}>
                  <select value={transportMode}
                    onChange={(e) => setTransportMode(e.target.value)}
                    className="w-full p-3 rounded-xl text-sm focus:outline-none"
                    style={{ ...inputStyle, width: '100%', appearance: 'none', paddingRight: 40 }}>
                    {TRANSPORT_MODES.map((mode) => (
                      <option key={mode.value} value={mode.value}>{mode.label}</option>
                    ))}
                  </select>
                  <ChevronRightIcon className="w-4 h-4" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: colors.textLight, pointerEvents: 'none' }} />
                </div>
              </div>

              {/* # Cost of Transportation */}
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>
                  Cost of Transportation
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ position: 'relative', width: 90, flexShrink: 0 }}>
                    <select value={transportCurrency} onChange={(e) => setTransportCurrency(e.target.value)}
                      className="p-3 rounded-xl text-sm focus:outline-none"
                      style={{ ...inputStyle, width: '100%', appearance: 'none', paddingRight: 28 }}>
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronRightIcon className="w-3 h-3" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: colors.textLight, pointerEvents: 'none' }} />
                  </div>
                  <input type="number" value={transportCost}
                    onChange={(e) => setTransportCost(e.target.value)}
                    placeholder="Amount"
                    className="flex-1 p-3 rounded-xl text-sm focus:outline-none"
                    style={{ ...inputStyle, width: '100%' }} />
                </div>
              </div>

              {/* # Description */}
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>
                  Description
                </label>
                <textarea value={factoryDescription}
                  onChange={(e) => { if (e.target.value.length <= 500) setFactoryDescription(e.target.value) }}
                  placeholder="Additional details about the visit" rows={3}
                  className="w-full p-3 rounded-xl text-sm focus:outline-none resize-none"
                  style={inputStyle} />
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{factoryDescription.length}/500 characters</p>
              </div>

            </div>
          )}

          {/* ===== BUSINESS TRIP ===== */}
          {purpose === 'business' && (
            <div>

              {/* # Top-level trip fields */}
              <div className="mb-3" style={{ position: 'relative' }}>
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Country *</label>
                <input
                  type="text"
                  value={businessCountry}
                  onChange={(e) => {
                    setBusinessCountry(e.target.value)
                    setBusinessCountryId(false)
                    searchCountries(e.target.value)
                  }}
                  placeholder="Search country..."
                  className="w-full p-3 rounded-xl text-sm focus:outline-none"
                  style={{ ...inputStyle, borderColor: businessCountryId ? '#22c55e' : inputStyle.borderColor }}
                />
                {countrySearching && (
                  <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>Searching...</p>
                )}
                {countryResults.length > 0 && !businessCountryId && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', maxHeight: 200, overflowY: 'auto' }}>
                    {countryResults.map((c) => (
                      <button key={c.id}
                        onPointerDown={(e) => {
                          e.preventDefault()
                          setBusinessCountry(c.name)
                          setBusinessCountryId(c.id)
                          setCountryResults([])
                        }}
                        style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: colors.textPrimary, borderBottom: '1px solid #f3f4f6' }}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Travel Purpose</label>
                <div style={{ position: 'relative' }}>
                  <select value={businessTravelPurpose}
                    onChange={(e) => setBusinessTravelPurpose(e.target.value)}
                    className="w-full p-3 rounded-xl text-sm focus:outline-none"
                    style={{ ...inputStyle, width: '100%', appearance: 'none', paddingRight: 40 }}>
                    {TRAVEL_PURPOSES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <ChevronRightIcon className="w-4 h-4" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: colors.textLight, pointerEvents: 'none' }} />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Location</label>
                <input type="text" value={businessLocation}
                  onChange={(e) => setBusinessLocation(e.target.value)}
                  placeholder="City/Location"
                  className="w-full p-3 rounded-xl text-sm focus:outline-none"
                  style={inputStyle} />
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Description</label>
                <textarea value={businessDescription}
                  onChange={(e) => { if (e.target.value.length <= 500) setBusinessDescription(e.target.value) }}
                  placeholder="Details about the business trip" rows={3}
                  className="w-full p-3 rounded-xl text-sm focus:outline-none resize-none"
                  style={inputStyle} />
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{businessDescription.length}/500 characters</p>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Mode of Transportation</label>
                <div style={{ position: 'relative' }}>
                  <select value={businessTransportMode}
                    onChange={(e) => setBusinessTransportMode(e.target.value)}
                    className="w-full p-3 rounded-xl text-sm focus:outline-none"
                    style={{ ...inputStyle, width: '100%', appearance: 'none', paddingRight: 40 }}>
                    {TRANSPORT_MODES.map((mode) => (
                      <option key={mode.value} value={mode.value}>{mode.label}</option>
                    ))}
                  </select>
                  <ChevronRightIcon className="w-4 h-4" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: colors.textLight, pointerEvents: 'none' }} />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Cost of Transportation</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ position: 'relative', width: 90, flexShrink: 0 }}>
                    <select value={businessTransportCurrency}
                      onChange={(e) => setBusinessTransportCurrency(e.target.value)}
                      className="p-3 rounded-xl text-sm focus:outline-none"
                      style={{ ...inputStyle, width: '100%', appearance: 'none', paddingRight: 28 }}>
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronRightIcon className="w-3 h-3" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: colors.textLight, pointerEvents: 'none' }} />
                  </div>
                  <input type="number" value={businessTransportCost}
                    onChange={(e) => setBusinessTransportCost(e.target.value)}
                    placeholder="Amount"
                    className="flex-1 p-3 rounded-xl text-sm focus:outline-none"
                    style={{ ...inputStyle, width: '100%' }} />
                </div>
              </div>

              {/* # Buyer cards */}
              {businessTrips.map((trip, index) => (
                <div key={index} style={{ marginBottom: 12, padding: 12, backgroundColor: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: colors.primary }}>Buyer {index + 1}</p>
                    {businessTrips.length > 1 && (
                      <button onClick={() => setBusinessTrips(prev => prev.filter((_, i) => i !== index))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 18, padding: 0 }}>✕</button>
                    )}
                  </div>
                  {/* # Buyer Name search dropdown */}
                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    <input
                      type="text"
                      placeholder="Search Buyer Name..."
                      value={trip.buyerName}
                      onChange={(e) => {
                        updateBusinessTrip(index, 'buyerName', e.target.value)
                        setBusinessTrips(prev => prev.map((t, i) => i === index ? { ...t, buyerPartnerId: false } : t))
                        searchBuyers(e.target.value, index)
                      }}
                      style={{ ...fieldInput, marginBottom: 0, borderColor: trip.buyerPartnerId ? '#22c55e' : '#e5e7eb' }}
                    />
                    {trip.buyerResults.length > 0 && !trip.buyerPartnerId && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', maxHeight: 180, overflowY: 'auto' }}>
                        {trip.buyerResults.map((b) => (
                          <button key={b.id}
                            onPointerDown={(e) => {
                              e.preventDefault()
                              setBusinessTrips(prev => prev.map((t, i) => i === index ? { ...t, buyerName: b.name, buyerPartnerId: b.id, buyerResults: [] } : t))
                            }}
                            style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#1a1035', borderBottom: '1px solid #f3f4f6' }}>
                            {b.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    <select value={trip.canReach} onChange={(e) => updateBusinessTrip(index, 'canReach', e.target.value)}
                      style={{ ...fieldInput, marginBottom: 0, backgroundColor: '#ffffff', appearance: 'none', paddingRight: 40, width: '100%' }}>
                      <option value="">Can be reached by</option>
                      <option value="phone">Phone</option>
                      <option value="email">Email</option>
                      <option value="whatsApp">WhatsApp</option>
                    </select>
                    <ChevronRightIcon className="w-4 h-4" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: colors.textLight, pointerEvents: 'none' }} />
                  </div>
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

              {/* ===== BUYER SELECTION ===== */}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${colors.border}` }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary, marginBottom: 10 }}>
                  Buyer Selection
                </p>

                {buyerArticles.map((article, index) => (
                  <div key={index} style={{ marginBottom: 10, padding: 12, backgroundColor: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: colors.primary }}>Article {index + 1}</p>
                      {buyerArticles.length > 1 && (
                        <button onClick={() => removeBuyerArticle(index)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16, padding: 0 }}>✕</button>
                      )}
                    </div>

                    {/* # Article number + scan button */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input
                        type="text"
                        placeholder="Article / Barcode number"
                        value={article.articleNumber}
                        onChange={(e) => updateBuyerArticle(index, 'articleNumber', e.target.value)}
                        style={{ ...fieldInput, flex: 1, marginBottom: 0 }}
                      />
                      <button
                        type="button"
                        onClick={() => { setScannerError(null); setScanningArticleIndex(index) }}
                        style={{
                          width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                          backgroundColor: colors.primary, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', border: 'none', cursor: 'pointer',
                        }}>
                        <span style={{ fontSize: 20 }}>📷</span>
                      </button>
                    </div>

                    {/* # Priority dropdown */}
                    <div style={{ position: 'relative', marginBottom: 8 }}>
                      <select
                        value={article.priority}
                        onChange={(e) => updateBuyerArticle(index, 'priority', e.target.value)}
                        style={{ ...fieldInput, marginBottom: 0, width: '100%', backgroundColor: '#ffffff', appearance: 'none', paddingRight: 40 }}>
                        <option value="">Select priority</option>
                        {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                      <ChevronRightIcon className="w-4 h-4" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: colors.textLight, pointerEvents: 'none' }} />
                    </div>

                    {/* # Item description */}
                    <textarea
                      placeholder="Description"
                      value={article.itemDescription}
                      onChange={(e) => { if (e.target.value.length <= 500) updateBuyerArticle(index, 'itemDescription', e.target.value) }}
                      rows={2}
                      style={{ ...fieldInput, marginBottom: 0, resize: 'none' as const }}
                    />
                    <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{article.itemDescription.length}/500</p>
                  </div>
                ))}

                <button onClick={addBuyerArticle}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.primary, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 0 12px' }}>
                  + Add Article
                </button>
              </div>

              {/* ===== MEETING NOTES ===== */}
              <div style={{ paddingTop: 14, borderTop: `1px solid ${colors.border}` }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary, marginBottom: 8 }}>
                  Meeting Notes
                </p>
                <textarea
                  placeholder="Notes from the meeting..."
                  value={meetingNotes}
                  onChange={(e) => { if (e.target.value.length <= 500) setMeetingNotes(e.target.value) }}
                  rows={4}
                  className="w-full p-3 rounded-xl text-sm focus:outline-none resize-none"
                  style={inputStyle}
                />
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{meetingNotes.length}/500 characters</p>
              </div>

            </div>
          )}

          {/* ===== OTHERS ===== */}
          {purpose === 'others' && (
            <div>
              <input type="text" placeholder="Visit Type (e.g., Bank Visit)" value={othersVisitType}
                onChange={(e) => setOthersVisitType(e.target.value)}
                className="w-full p-3 rounded-xl text-sm focus:outline-none mb-2" style={inputStyle} />
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <select value={othersCanReach} onChange={(e) => setOthersCanReach(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm focus:outline-none"
                  style={{ ...inputStyle, width: '100%', appearance: 'none', paddingRight: 40 }}>
                  <option value="">Can be reached by</option>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="whatsApp">WhatsApp</option>
                  <option value="other">Other</option>
                </select>
                <ChevronRightIcon className="w-4 h-4" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: colors.textLight, pointerEvents: 'none' }} />
              </div>
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
            <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Applicant</label>
            <p className="text-sm font-medium p-3 rounded-xl" style={{ ...inputStyle, color: colors.textPrimary }}>
              Self
            </p>
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
              min={getLocalDateStr(new Date())} max="2029-12-31"
              onChange={(e) => {
                const newStart = e.target.value
                setStartDate(newStart)
                // Always set To Date to next day when From Date changes
                if (newStart) {
                  const d = new Date(newStart + 'T00:00:00')
                  d.setDate(d.getDate() + 1)
                  setEndDate(getLocalDateStr(d))
                }
              }}
              className="w-full p-3 rounded-xl text-sm focus:outline-none"
              style={{ ...inputStyle, width: '100%' }} />
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
                <input type="date" value={endDate} min={startDate || ''} max="2029-12-31"
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-3 rounded-xl text-sm focus:outline-none"
                  style={{ ...inputStyle, width: '100%' }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs mb-1" style={{ color: colors.textMuted }}>Start Time</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-3 rounded-xl text-sm focus:outline-none"
                    style={{ ...inputStyle, width: '100%' }} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: colors.textMuted }}>End Time</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-3 rounded-xl text-sm focus:outline-none"
                    style={{ ...inputStyle, width: '100%' }} />
                </div>
              </div>
              {/* # Live time error — same day with end ≤ start */}
              {startDate && endDate && startDate === endDate && startTime && endTime && endTime <= startTime && (
                <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5' }}>
                  <p className="text-xs font-semibold" style={{ color: '#dc2626' }}>
                    ⚠ End time must be after start time when both dates are the same.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* # Conflict warning — existing leave on selected dates */}
          {conflictChecking && (
            <div className="mt-2 p-3 rounded-xl" style={{ backgroundColor: '#fef9c3', border: '1px solid #fbbf24' }}>
              <p className="text-xs font-medium" style={{ color: '#92400e' }}>⏳ Checking for existing leave on these dates...</p>
            </div>
          )}
          {!conflictChecking && conflictLeaves.length > 0 && (
            <div className="mt-2 p-3 rounded-xl" style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#dc2626' }}>⚠ You already have leave on these dates:</p>
              {conflictLeaves.map(c => (
                <p key={c.id} className="text-xs mt-1" style={{ color: '#991b1b' }}>
                  • {c.type}: {new Date(c.from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} → {new Date(c.to).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              ))}
              <p className="text-xs mt-2 font-semibold" style={{ color: '#dc2626' }}>Please select different dates to proceed.</p>
            </div>
          )}

          {/* # DURATION — single day, no To Date */}
          {durationType === 'duration' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Session</label>
                <div style={{ position: 'relative' }}>
                  <select value={durationDescription}
                    onChange={(e) => setDurationDescription(e.target.value)}
                    className="w-full p-3 rounded-xl text-sm focus:outline-none"
                    style={{ ...inputStyle, width: '100%', appearance: 'none', paddingRight: 40 }}>
                    <option value="morning">Morning Session</option>
                    <option value="afternoon">Afternoon Session</option>
                    <option value="full">Full Day</option>
                  </select>
                  <ChevronRightIcon className="w-4 h-4" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: colors.textLight, pointerEvents: 'none' }} />
                </div>
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

          {/* # Supporting Document — action button style */}
          <div style={{ marginBottom: 16 }}>
            <label className="block text-xs font-semibold mb-2" style={{ color: colors.textSecondary }}>
              Supporting Document (optional)
            </label>

            {attachmentFile ? (
              /* # File selected state */
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, backgroundColor: '#f9fafb', border: `1.5px solid ${colors.primary}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 18 }}>📄</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {attachmentFile.name}
                  </p>
                  <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                    {(attachmentFile.size / 1024).toFixed(1)} KB · Ready to upload
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachmentFile(null)}
                  style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  ✕
                </button>
              </div>
            ) : (
              /* # No file — clean outlined upload button */
              <label style={{ display: 'block', cursor: 'pointer' }}>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                />
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px', borderRadius: 12,
                  backgroundColor: '#f9fafb',
                  border: `1.5px dashed ${colors.borderMedium}`,
                }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 20 }}>📎</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>Attach a Document</p>
                    <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>Image, PDF or Word document</p>
                  </div>
                </div>
              </label>
            )}
          </div>

          {/* # Cancel + Submit */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setActiveScreen('dashboard')}
              className="py-4 rounded-xl font-bold text-sm"
              style={{ border: `1px solid ${colors.borderMedium}`, backgroundColor: colors.cardBg, color: colors.textSecondary, cursor: 'pointer' }}>
              Cancel
            </button>
            {(() => {
              const timeConflict = durationType === 'time' && startDate === endDate && !!startTime && !!endTime && endTime <= startTime
              const blocked = submitting || conflictChecking || conflictLeaves.length > 0 || timeConflict
              return (
                <button onClick={handleSubmit} disabled={blocked}
                  className="py-4 rounded-xl font-bold text-sm text-white"
                  style={{ background: blocked ? '#d1d5db' : colors.gradientButton, border: 'none', cursor: blocked ? 'not-allowed' : 'pointer' }}>
                  {submitting ? '⏳ Submitting...' : '✓ Submit Request'}
                </button>
              )
            })()}
          </div>
        </div>

      </div>

      {/* ===== LIVE QR SCANNER OVERLAY ===== */}
      {scanningArticleIndex !== null && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: '#000',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: colors.gradientHeader,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Scan QR Code</span>
            <button onClick={stopScanner} style={{
              background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%',
              width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>

          {/* Scanner viewfinder */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {scannerError ? (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center',
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Camera Error</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{scannerError}</p>
              </div>
            ) : (
              <>
                <div id="qr-scanner-view" style={{ width: '100%', height: '100%' }} />
                <p style={{
                  position: 'absolute', bottom: 20, left: 0, right: 0,
                  textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.8)',
                }}>
                  Point at the QR code — it will scan automatically
                </p>
              </>
            )}
          </div>

          {/* Enter manually button */}
          <div style={{ padding: '12px 20px', paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 12px)', background: '#000' }}>
            <button onClick={stopScanner} style={{
              width: '100%', padding: '14px', borderRadius: 14,
              border: '1.5px solid rgba(255,255,255,0.3)', background: 'transparent',
              cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#fff',
            }}>
              Enter Manually Instead
            </button>
          </div>
        </div>
      )}

      <BottomNav active="newRequest" setActiveScreen={setActiveScreen} />
    </div>
  )
}

export default NewRequestScreen