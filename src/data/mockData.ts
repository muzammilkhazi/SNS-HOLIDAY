// ============================================
// sns-holiday-app — Mock / Sample Data
// ============================================

import type { Stats, StressDay, PublicHoliday, Allocation, TimeOffRequest } from '../types'
// # Dashboard stats
export const stats: Stats = {
  paidTimeOff: 20,
  businessTrips: 5,
}

// # Stress days data — all stress days with reasons
export const stressDays: StressDay[] = [
  // # Existing stress days
  {
    name: 'Festivals',
    start: '10/01/2025', end: '10/09/2025', color: '#FF8C42',
    reason: 'Major festival season — high employee leave requests expected during this period.'
  },
  {
    name: 'Mandatory Days',
    start: '11/27/2025', end: '11/28/2025', color: '#E91E63',
    reason: 'Mandatory working days — all employees required to be present without exception.'
  },
  {
    name: 'Mandatory Days',
    start: '11/29/2025', end: '11/30/2025', color: '#6C63FF',
    reason: 'Final approval required before bulk production — attendance is compulsory.'
  },
  {
    name: 'Company Party',
    start: '12/01/2025', end: '12/02/2025', color: '#9C27B0',
    reason: 'Annual company celebration event — all staff are expected to participate.'
  },
  {
    name: 'Peak Season',
    start: '12/29/2025', end: '12/31/2025', color: '#E91E63',
    reason: 'Year-end peak production season — no leaves approved during this period.'
  },
  // # New stress days
  {
    name: 'Client Sample Approval',
    start: '04/10/2026', end: '04/11/2026', color: '#FF5733',
    reason: 'Client is reviewing samples for final approval — key team members must be available.'
  },
  {
    name: 'Bulk Production Start',
    start: '04/12/2026', end: '04/14/2026', color: '#33B5FF',
    reason: 'Bulk production launch phase — all production staff must report on time.'
  },
  {
    name: 'Production Deadline (Phase 1)',
    start: '04/15/2026', end: '04/16/2026', color: '#28A745',
    reason: 'Phase 1 production must be completed — critical deadline with no flexibility.'
  },
  {
    name: 'Final Production Deadline',
    start: '04/17/2026', end: '04/18/2026', color: '#FFC300',
    reason: 'Final production batch must be ready — entire team required for quality checks.'
  },
  {
    name: 'Quality Inspection',
    start: '04/19/2026', end: '04/20/2026', color: '#8E44AD',
    reason: 'Third-party quality inspection scheduled — production and QC teams must be present.'
  },
  {
    name: 'Fabric Dispatch',
    start: '04/22/2026', end: '04/23/2026', color: '#E67E22',
    reason: 'Fabric dispatch to manufacturing units — logistics and warehouse staff required.'
  },
  {
    name: 'Final Shipment Dispatch',
    start: '04/24/2026', end: '04/25/2026', color: '#16A085',
    reason: 'Final shipment leaving facility — all dispatch and documentation staff must be present.'
  },
  {
    name: 'Client Review Meeting',
    start: '05/05/2026', end: '05/06/2026', color: '#C0392B',
    reason: 'Important client review meeting — senior management and account teams required.'
  },
  {
    name: 'Season Planning Start',
    start: '06/01/2026', end: '06/03/2026', color: '#2980B9',
    reason: 'New season planning kickoff — design and product teams must attend planning sessions.'
  },
  {
    name: 'Mid-Season Review',
    start: '06/15/2026', end: '06/16/2026', color: '#D35400',
    reason: 'Mid-season performance and production review — department heads must be present.'
  },
]

// # Public holidays data — all Indian public holidays with colors
export const publicHolidays: PublicHoliday[] = [
  { name: "New Year's Day", start: '01/01/2026', end: '01/01/2026', color: '#FF5733' },
  { name: 'Makara Sankranti', start: '01/15/2026', end: '01/15/2026', color: '#FFC300' },
  { name: 'Republic Day', start: '01/26/2026', end: '01/26/2026', color: '#FF8C42' },
  { name: 'Maha Shivratri', start: '02/15/2026', end: '02/15/2026', color: '#8E44AD' },
  { name: 'Ugadi', start: '03/19/2026', end: '03/19/2026', color: '#28A745' },
  { name: 'Good Friday', start: '04/03/2026', end: '04/03/2026', color: '#C0392B' },
  { name: 'Ambedkar Jayanti', start: '04/14/2026', end: '04/14/2026', color: '#2980B9' },
  { name: 'Basava Jayanti', start: '04/20/2026', end: '04/20/2026', color: '#16A085' },
  { name: 'Labour Day', start: '05/01/2026', end: '05/01/2026', color: '#E67E22' },
  { name: 'Independence Day', start: '08/15/2026', end: '08/15/2026', color: '#FF8C42' },
  { name: 'Ganesh Chaturthi', start: '09/14/2026', end: '09/14/2026', color: '#D35400' },
  { name: 'Gandhi Jayanti', start: '10/02/2026', end: '10/02/2026', color: '#6C63FF' },
  { name: 'Vijayadashami', start: '10/21/2026', end: '10/21/2026', color: '#E91E63' },
  { name: 'Diwali', start: '11/08/2026', end: '11/08/2026', color: '#FFC300' },
  { name: 'Christmas', start: '12/25/2026', end: '12/25/2026', color: '#28A745' },
]
// # My allocations data
export const myAllocations: Allocation[] = [
  { type: 'Business Trips', description: 'Business Trips', duration: '5 days', status: 'Approved' },
  { type: 'Casual Leaves', description: 'Casual leaves', duration: '10 days', status: 'Approved' },
  { type: 'Paid Time Off', description: 'Sick Leaves', duration: '10 days', status: 'Approved' },
]

// # All time off requests data
export const timeOffRequests: TimeOffRequest[] = [
  { employee: 'ANAND', type: 'Sick Time Off', duration: '3 days', start: '12/17/2025', end: '12/19/2025', status: 'Approved' },
  { employee: 'Prashant', type: 'Sick Time Off', duration: '3 days', start: '12/02/2025', end: '12/04/2025', status: 'Approved' },
  { employee: 'ANAND', type: 'Unpaid', duration: '24 hours', start: '12/01/2025', end: '12/03/2025', status: 'Approved' },
  { employee: 'SUGUMAR', type: 'Sick Time Off', duration: '1 day', start: '11/28/2025', end: '11/30/2025', status: 'Approved' },
  { employee: 'SANDEEP', type: 'Unpaid', duration: '8 hours', start: '11/28/2025', end: '11/23/2025', status: 'Second Approval' },
  { employee: 'ADMINISTRATOR', type: 'Sick Time Off', duration: '5 days', start: '07/08/2023', end: '07/16/2023', status: 'Approved' },
]