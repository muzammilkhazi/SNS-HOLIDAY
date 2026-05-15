// ============================================
// sns-holiday-app — TypeScript Types
// ============================================

// # Screen navigation type
export type ScreenName = 'login' | 'logout' | 'dashboard' | 'allocations' | 'newRequest' | 'timeoff' | 'allStressDays' | 'allPublicHolidays' | 'profile' | 'settings' | 'whosAway'

// # Stats data type
export interface Stats {
  paidTimeOff: number
  businessTrips: number
}

// # Stress day type
export interface StressDay {
  name: string
  start: string
  end: string
  color: string
  reason: string
}

// # Public holiday type
export interface PublicHoliday {
  name: string
  start: string
  end: string
  color: string
}

// # Allocation type
export interface Allocation {
  type: string
  description: string
  duration: string
  status: string
}

// # Time off request type
export interface TimeOffRequest {
  employee: string
  type: string
  duration: string
  start: string
  end: string
  status: string
}