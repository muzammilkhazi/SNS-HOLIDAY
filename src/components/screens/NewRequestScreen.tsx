// ============================================
// sns-holiday-app — New Time Off Request Screen
// ============================================

import { useState, useEffect, useRef } from 'react'
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
  'Top Urgent',
  'Urgent',
  'Normal',
  'Picked but on hold',
  'Please arrange but do not send out',
]

const PURPOSE_OPTIONS = [
  { value: 'personal',  label: 'Personal' },
  { value: 'factory',   label: 'Factory Visit' },
  { value: 'business',  label: 'Business Trip' },
  { value: 'others',    label: 'Others' },
]

const FACTORY_TYPES = ['RD', 'SALES', 'PRODUCTION']
const TRANSPORT_MODES = ['Select mode', 'Flight', 'Train', 'Car', 'Bus', 'Others']
const TRAVEL_PURPOSES = ['Select purpose', 'Buyer Meeting', 'Trade Show', 'Product Presentation', 'Contract Negotiation', 'Market Research', 'Others']
const CURRENCIES = [
  'INR', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'IDR', 'MYR', 'SGD', 'THB', 'PKR', 'BDT', 'TRY', 'VND',
]

const emptyBusinessTrip = (): BusinessTrip => ({
  buyerName: '', canReach: '',
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
  const [transportCurrency, setTransportCurrency]     = useState<string>('INR')
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
  const [businessTravelPurpose, setBusinessTravelPurpose] = useState<string>('')
  const [businessLocation, setBusinessLocation]         = useState<string>('')
  const [businessDescription, setBusinessDescription]   = useState<string>('')
  const [businessTransportMode, setBusinessTransportMode] = useState<string>('')
  const [businessTransportCost, setBusinessTransportCost] = useState<string>('')
  const [businessTransportCurrency, setBusinessTransportCurrency] = useState<string>('INR')
  const [businessTrips, setBusinessTrips]               = useState<BusinessTrip[]>([emptyBusinessTrip()])
  const [buyerArticles, setBuyerArticles]               = useState<BuyerArticle[]>([{ articleNumber: '', priority: '', itemDescription: '' }])
  const [meetingNotes, setMeetingNotes]                 = useState<string>('')

  // # Others
  const [othersVisitType, setOthersVisitType]         = useState<string>('')
  const [othersCanReach, setOthersCanReach]           = useState<string>('')
  const [othersLocation, setOthersLocation]           = useState<string>('')
  const [othersAgenda, setOthersAgenda]               = useState<string>('')

  // # Basic Info
  const [accompaniedWith, setAccompaniedWith]         = useState<string>('')

  // # Dates & Duration
  const [startDate, setStartDate]                     = useState<string>('')
  const [endDate, setEndDate]                         = useState<string>('')
  const [startTime, setStartTime]                     = useState<string>('09:30')
  const [endTime, setEndTime]                         = useState<string>('17:30')
  const [durationType, setDurationType]               = useState<'time' | 'duration'>('time')
  const [durationDescription, setDurationDescription] = useState<string>('morning')
  const [durationDays, setDurationDays]               = useState<string>('')

  // # Additional
  const [description, setDescription]                 = useState<string>('')
  const [attachmentFile, setAttachmentFile]           = useState<File | null>(null)

  // # Submit
  const [submitting, setSubmitting]                   = useState(false)
  const [popup, setPopup]                             = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const scrollRef                                     = useRef<HTMLDivElement>(null)

  // # Discovered custom field names and types from hr.leave/fields_get
  const [customFields, setCustomFields]               = useState<Record<string, string>>({})
  const [customFieldTypes, setCustomFieldTypes]       = useState<Record<string, string>>({})

  useEffect(() => {
    fetchLeaveTypes()
    discoverCustomFields()
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

  // # Discover custom hr.leave field names dynamically so we can populate them on submit
  const discoverCustomFields = async () => {
    try {
      const res = await fetch('/web/dataset/call_kw/hr.leave/fields_get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'call', id: 14,
          params: {
            session_id: getSessionId(),
            model: 'hr.leave', method: 'fields_get',
            args: [], kwargs: { attributes: ['string', 'type'] },
          },
        }),
      })
      const data = await res.json()
      if (!data.result) return
      const map: Record<string, string> = {}
      const LABEL_MAP: Record<string, string> = {
        'purpose': 'purpose',
        'leave purpose': 'purpose',
        'description': 'description',
        'leave description': 'description',
        'additional description': 'description',
        'can be reached by': 'canBeReached',
        'reachable by': 'canBeReached',
        'contact via': 'canBeReached',
        'accompanied with': 'accompanied',
        'accompanied by': 'accompanied',
        'factory type': 'factoryType',
        'factory visit type': 'factoryType',
        'factory name': 'factoryName',
        'country': 'country',
        'location': 'location',
        'city': 'location',
        'mode of transportation': 'transportMode',
        'transport mode': 'transportMode',
        'cost of transportation': 'transportCost',
        'transport cost': 'transportCost',
        'supporting document': 'supportingDoc',
        'supporting documents': 'supportingDoc',
        'support document': 'supportingDoc',
        'attachment': 'supportingDoc',
      }
      const typeMap: Record<string, string> = {}
      const fields = data.result as Record<string, { string: string; type: string }>
      for (const [key, val] of Object.entries(fields)) {
        const label = (val.string || '').toLowerCase().trim()
        const mapped = LABEL_MAP[label]
        if (mapped && (key.startsWith('x_') || ['purpose','accompanied_with','location','country'].includes(key))) {
          map[mapped] = key
          typeMap[mapped] = val.type
        }
      }
      setCustomFields(map)
      setCustomFieldTypes(typeMap)
    } catch { /* silent — fall back to name-only submission */ }
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

  const handleBarcodeCapture = async (file: File, index: number) => {
    try {
      if ('BarcodeDetector' in window) {
        type BarcodeDetectorType = new (opts: { formats: string[] }) => { detect: (img: ImageBitmap) => Promise<{ rawValue: string }[]> }
        const Detector = (window as unknown as { BarcodeDetector: BarcodeDetectorType }).BarcodeDetector
        const detector = new Detector({ formats: ['qr_code', 'code_39', 'code_93', 'code_128', 'ean_13', 'ean_8', 'upc_a'] })
        const img = await createImageBitmap(file)
        const barcodes = await detector.detect(img)
        if (barcodes.length > 0) {
          updateBuyerArticle(index, 'articleNumber', barcodes[0].rawValue)
        } else {
          showError('No barcode found in image. Please enter the article number manually.')
        }
      } else {
        showError('Barcode scanning not supported on this browser. Please enter manually.')
      }
    } catch {
      showError('Could not scan barcode. Please enter manually.')
    }
  }


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
      const docField = customFields.supportingDoc
      const docType  = customFieldTypes.supportingDoc

      if (docField && docType === 'binary') {
        // # Binary field — write base64 directly to the field
        await fetch('/web/dataset/call_kw/hr.leave/write', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({
            jsonrpc: '2.0', method: 'call', id: 15,
            params: {
              session_id: getSessionId(), model: 'hr.leave', method: 'write',
              args: [[leaveId], { [docField]: base64Data }],
              kwargs: {},
            },
          }),
        })
      } else {
        // # Many2many / fallback — create ir.attachment then link to field
        const attachRes = await fetch('/web/dataset/call_kw/ir.attachment/create', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({
            jsonrpc: '2.0', method: 'call', id: 13,
            params: {
              session_id: getSessionId(), model: 'ir.attachment', method: 'create',
              args: [{ name: file.name, res_model: 'hr.leave', res_id: leaveId, datas: base64Data, type: 'binary' }],
              kwargs: {},
            },
          }),
        })
        // # If a Many2many field exists, also link the new attachment to it
        if (docField && (docType === 'many2many' || docType === 'one2many')) {
          const attachData = await attachRes.json()
          const attachId = attachData.result
          if (attachId) {
            await fetch('/web/dataset/call_kw/hr.leave/write', {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
              body: JSON.stringify({
                jsonrpc: '2.0', method: 'call', id: 16,
                params: {
                  session_id: getSessionId(), model: 'hr.leave', method: 'write',
                  args: [[leaveId], { [docField]: [[4, attachId]] }],
                  kwargs: {},
                },
              }),
            })
          }
        }
      }
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
    }
    const employeeId = session?.employeeId
    if (!employeeId) { showError('Employee not found. Please log out and log back in.'); return }
    setSubmitting(true)

    // # Fetch fresh balance + check pending allocations — bypasses session cache
    let freshBalance: number | null = null
    let leaveTypeName = ''
    let hasPendingAllocation = false
    try {
      const [balRes, allocRes] = await Promise.all([
        // Fresh balance for this leave type
        fetch('/web/dataset/call_kw/hr.leave.type/search_read', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({
            jsonrpc: '2.0', method: 'call', id: 77,
            params: {
              session_id: getSessionId(), model: 'hr.leave.type', method: 'search_read',
              args: [[['id', '=', timeOffTypeId]]],
              kwargs: { fields: ['id', 'name', 'virtual_remaining_leaves'], context: { employee_id: employeeId } },
            },
          }),
        }),
        // Check if employee has allocations waiting for approval (draft/confirm)
        fetch('/web/dataset/call_kw/hr.leave.allocation/search_read', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({
            jsonrpc: '2.0', method: 'call', id: 78,
            params: {
              session_id: getSessionId(), model: 'hr.leave.allocation', method: 'search_read',
              args: [[['employee_id', '=', employeeId], ['holiday_status_id', '=', timeOffTypeId], ['state', 'in', ['draft', 'confirm']]]],
              kwargs: { fields: ['id', 'state'], limit: 1 },
            },
          }),
        }),
      ])
      const balData = await balRes.json()
      const allocData = await allocRes.json()
      if (balData.result?.length > 0) {
        freshBalance = balData.result[0].virtual_remaining_leaves
        leaveTypeName = balData.result[0].name
      }
      hasPendingAllocation = (allocData.result?.length ?? 0) > 0
    } catch { /* silent — will still attempt create */ }

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

    // # Build structured reason from all form fields
    const parts: string[] = []
    if (purpose === 'personal') {
      parts.push('Personal Leave')
      if (leaveNote) parts.push(`Note: ${leaveNote}`)
      const reaches = Object.entries(reachBy).filter(([, v]) => v).map(([k]) => k)
      if (reaches.length > 0) parts.push(`Reachable by: ${reaches.join(', ')}`)
    } else if (purpose === 'factory') {
      parts.push(`Factory Visit (${factoryType})`)
      if (factoryName) parts.push(`Factory: ${factoryName}`)
      if (factoryLocation) parts.push(`Location: ${factoryLocation}`)
      if (factoryType === 'RD') {
        const ps = [...(rdNewCollection ? ['New Collection'] : []), ...(rdMillDevelopment ? ['Mill Development'] : []), ...(rdOthers && rdOthersText ? [rdOthersText] : [])]
        if (ps.length > 0) parts.push(`Purpose: ${ps.join(', ')}`)
      } else if (factoryType === 'SALES') {
        const ps = [...(salesNewCollection ? ['New Collection'] : []), ...(salesFollowUp ? ['Follow up Development'] : []), ...(salesOthers && salesOthersText ? [salesOthersText] : [])]
        if (ps.length > 0) parts.push(`Purpose: ${ps.join(', ')}`)
      } else if (factoryType === 'PRODUCTION') {
        if (prodPurpose === 'followOrder') {
          if (prodOrderNumber) parts.push(`Order: ${prodOrderNumber}`)
          const issues = prodIssues.filter(Boolean)
          if (issues.length > 0) parts.push(`Issues: ${issues.join(', ')}`)
        }
        if (prodOthersText) parts.push(`Other: ${prodOthersText}`)
      }
      if (transportMode) parts.push(`Transport: ${transportMode}`)
      if (transportCost) parts.push(`Transport Cost: ${transportCurrency} ${transportCost}`)
      if (factoryDescription) parts.push(`Details: ${factoryDescription}`)
    } else if (purpose === 'business') {
      parts.push('Business Trip')
      if (businessCountry) parts.push(`Country: ${businessCountry}`)
      if (businessTravelPurpose) parts.push(`Travel Purpose: ${businessTravelPurpose}`)
      if (businessLocation) parts.push(`Location: ${businessLocation}`)
      if (businessTransportMode) parts.push(`Transport: ${businessTransportMode}`)
      if (businessTransportCost) parts.push(`Transport Cost: ${businessTransportCurrency} ${businessTransportCost}`)
      if (businessDescription) parts.push(`Details: ${businessDescription}`)
      businessTrips.forEach((trip, i) => {
        if (trip.buyerName || trip.person1Name) {
          parts.push(`Buyer ${i + 1}: ${trip.buyerName}${trip.canReach ? ` (reach: ${trip.canReach})` : ''}`)
          if (trip.person1Name) parts.push(`  P1: ${trip.person1Name}/${trip.person1Dept}/${trip.person1Agenda}`)
          if (trip.person2Name) parts.push(`  P2: ${trip.person2Name}/${trip.person2Dept}/${trip.person2Agenda}`)
          if (trip.person3Name) parts.push(`  P3: ${trip.person3Name}/${trip.person3Dept}/${trip.person3Agenda}`)
        }
      })
      buyerArticles.forEach((a, i) => {
        if (a.articleNumber || a.priority) {
          parts.push(`Article ${i + 1}: ${a.articleNumber}${a.priority ? ` | ${a.priority}` : ''}${a.itemDescription ? ` | ${a.itemDescription}` : ''}`)
        }
      })
      if (meetingNotes) parts.push(`Meeting Notes: ${meetingNotes}`)
    } else if (purpose === 'others') {
      parts.push(`Other: ${othersVisitType || 'Visit'}`)
      if (othersCanReach) parts.push(`Reachable by: ${othersCanReach}`)
      if (othersLocation) parts.push(`Location: ${othersLocation}`)
      if (othersAgenda) parts.push(`Agenda: ${othersAgenda}`)
    }
    if (accompaniedWith) parts.push(`Accompanied with: ${accompaniedWith}`)
    if (description) parts.push(`Additional: ${description}`)

    const leaveName = parts.join(' | ')

    // # Half-day fields for duration mode
    const isHalfDay = durationType === 'duration' && durationDescription !== 'full'

    // # Build explicit date_from / date_to datetimes so Odoo never defaults to today.
    // # Odoo stores datetimes in UTC — we send local times directly (cosmetic offset only;
    // # the DATE portion is always correct which is what the overlap check uses).
    // # Always use fixed safe times (09:00 / 18:00) so date_from never hits
    // # midnight, which causes false overlap with leaves ending end-of-previous-day.
    let dateFrom: string
    let dateTo: string
    if (durationType === 'duration') {
      if (durationDescription === 'morning') {
        dateFrom = `${safeStart} 09:30:00`
        dateTo   = `${safeStart} 13:00:00`
      } else if (durationDescription === 'afternoon') {
        dateFrom = `${safeStart} 13:00:00`
        dateTo   = `${safeStart} 17:30:00`
      } else {
        dateFrom = `${safeStart} 09:30:00`
        dateTo   = `${safeStart} 17:30:00`
      }
    } else {
      dateFrom = `${safeStart} 09:30:00`
      dateTo   = `${finalEndDate} 17:30:00`
    }

    const leavePayload: Record<string, unknown> = {
      holiday_status_id: timeOffTypeId,
      request_date_from: safeStart,
      request_date_to: finalEndDate,
      date_from: dateFrom,
      date_to: dateTo,
      employee_id: employeeId,
      name: leaveName,
    }
    if (isHalfDay) {
      leavePayload.request_unit_half = true
      leavePayload.request_date_from_period = durationDescription === 'morning' ? 'am' : 'pm'
    }

    // # Populate custom Odoo fields using dynamically discovered field names
    const cf = customFields
    if (cf.purpose)       leavePayload[cf.purpose]    = purpose
    if (cf.accompanied && accompaniedWith) leavePayload[cf.accompanied] = accompaniedWith
    if (cf.description && description)    leavePayload[cf.description]  = description
    if (cf.canBeReached) {
      const reaches = Object.entries(reachBy).filter(([, v]) => v).map(([k]) => k).join(', ')
      if (reaches) leavePayload[cf.canBeReached] = reaches
    }
    if (cf.factoryType && purpose === 'factory')    leavePayload[cf.factoryType]    = factoryType
    if (cf.factoryName && factoryName)              leavePayload[cf.factoryName]    = factoryName
    if (cf.transportMode && transportMode)          leavePayload[cf.transportMode]  = transportMode
    if (cf.transportCost && transportCost)          leavePayload[cf.transportCost]  = `${transportCurrency} ${transportCost}`
    if (cf.country && businessCountry)              leavePayload[cf.country]        = businessCountry
    if (cf.location) {
      const loc = purpose === 'factory' ? factoryLocation : businessLocation
      if (loc) leavePayload[cf.location] = loc
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
          const balLine = freshBalance !== null
            ? `Your current ${leaveTypeName} balance: ${freshBalance} day${freshBalance !== 1 ? 's' : ''}.`
            : ''
          errorMsg = hasPendingAllocation
            ? `Your ${leaveTypeName} allocation is waiting for approval.\n\n${balLine}\n\nPlease ask HR to approve your allocation in Odoo, then try again.`
            : `Insufficient leave balance.\n\n${balLine}\n\nPlease contact HR to add or approve your allocation.`
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
                <div style={{ position: 'relative' }}>
                  <select value={transportMode}
                    onChange={(e) => setTransportMode(e.target.value)}
                    className="w-full p-3 rounded-xl text-sm focus:outline-none"
                    style={{ ...inputStyle, width: '100%', appearance: 'none', paddingRight: 40 }}>
                    {TRANSPORT_MODES.map((mode) => (
                      <option key={mode} value={mode === 'Select mode' ? '' : mode}>{mode}</option>
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

              {/* # Top-level trip fields */}
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Country *</label>
                <input type="text" value={businessCountry}
                  onChange={(e) => setBusinessCountry(e.target.value)}
                  placeholder="Enter country"
                  className="w-full p-3 rounded-xl text-sm focus:outline-none"
                  style={inputStyle} />
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Travel Purpose</label>
                <div style={{ position: 'relative' }}>
                  <select value={businessTravelPurpose}
                    onChange={(e) => setBusinessTravelPurpose(e.target.value)}
                    className="w-full p-3 rounded-xl text-sm focus:outline-none"
                    style={{ ...inputStyle, width: '100%', appearance: 'none', paddingRight: 40 }}>
                    {TRAVEL_PURPOSES.map((p) => (
                      <option key={p} value={p === 'Select purpose' ? '' : p}>{p}</option>
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
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="Details about the business trip" rows={3}
                  className="w-full p-3 rounded-xl text-sm focus:outline-none resize-none"
                  style={inputStyle} />
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: colors.textSecondary }}>Mode of Transportation</label>
                <div style={{ position: 'relative' }}>
                  <select value={businessTransportMode}
                    onChange={(e) => setBusinessTransportMode(e.target.value)}
                    className="w-full p-3 rounded-xl text-sm focus:outline-none"
                    style={{ ...inputStyle, width: '100%', appearance: 'none', paddingRight: 40 }}>
                    {TRANSPORT_MODES.map((mode) => (
                      <option key={mode} value={mode === 'Select mode' ? '' : mode}>{mode}</option>
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
                  <input type="text" placeholder="Buyer Name" value={trip.buyerName} onChange={(e) => updateBusinessTrip(index, 'buyerName', e.target.value)} style={fieldInput} />
                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    <select value={trip.canReach} onChange={(e) => updateBusinessTrip(index, 'canReach', e.target.value)}
                      style={{ ...fieldInput, marginBottom: 0, backgroundColor: '#ffffff', appearance: 'none', paddingRight: 40, width: '100%' }}>
                      <option value="">Can be reached by</option>
                      <option value="phone">Phone</option>
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
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
                      <label style={{
                        width: 44, height: 44, borderRadius: 8, flexShrink: 0, cursor: 'pointer',
                        backgroundColor: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <input
                          type="file" accept="image/*" capture="environment"
                          style={{ display: 'none' }}
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBarcodeCapture(f, index) }}
                        />
                        <span style={{ fontSize: 20 }}>📷</span>
                      </label>
                    </div>

                    {/* # Priority dropdown */}
                    <div style={{ position: 'relative', marginBottom: 8 }}>
                      <select
                        value={article.priority}
                        onChange={(e) => updateBuyerArticle(index, 'priority', e.target.value)}
                        style={{ ...fieldInput, marginBottom: 0, width: '100%', backgroundColor: '#ffffff', appearance: 'none', paddingRight: 40 }}>
                        <option value="">Select priority</option>
                        {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <ChevronRightIcon className="w-4 h-4" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: colors.textLight, pointerEvents: 'none' }} />
                    </div>

                    {/* # Item description */}
                    <textarea
                      placeholder="Description"
                      value={article.itemDescription}
                      onChange={(e) => updateBuyerArticle(index, 'itemDescription', e.target.value)}
                      rows={2}
                      style={{ ...fieldInput, marginBottom: 0, resize: 'none' as const }}
                    />
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
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-xl text-sm focus:outline-none resize-none"
                  style={inputStyle}
                />
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
                  <option value="whatsapp">WhatsApp</option>
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
              onChange={(e) => setStartDate(e.target.value)}
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
                <input type="date" value={endDate} min={startDate || ''}
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