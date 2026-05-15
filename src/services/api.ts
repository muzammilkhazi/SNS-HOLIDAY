// ============================================
// sns-holiday-app — Odoo API Service
// ============================================

// # Odoo database name
const DB = 'sns_qc_v1'

// # User session type
export interface UserSession {
  uid: number
  name: string
  username: string
  partnerId: number
  sessionId: string
  employeeId: number | null
  isAdmin: boolean
}

// # Get session id from localStorage
export const getSessionId = (): string => {
  const data = localStorage.getItem('sns_session')
  if (!data) return ''
  try {
    const session = JSON.parse(data)
    return session?.sessionId || ''
  } catch {
    return ''
  }
}

// # Save session to localStorage
export const saveSession = (session: UserSession): void => {
  localStorage.setItem('sns_session', JSON.stringify(session))
}

// # Load session from localStorage
export const loadSession = (): UserSession | null => {
  const data = localStorage.getItem('sns_session')
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

// # Clear session from localStorage
export const clearSession = (): void => {
  localStorage.removeItem('sns_session')
}

// # Check if current session user belongs to the admin group
const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const res = await fetch('/web/dataset/call_kw/res.users/has_group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'call', id: 99,
        params: {
          model: 'res.users',
          method: 'has_group',
          args: ['base.group_system'],
          kwargs: {},
        },
      }),
    })
    const data = await res.json()
    return data.result === true
  } catch {
    return false
  }
}

// # Login — calls Odoo authenticate endpoint
export const loginApi = async (
  login: string,
  password: string
): Promise<UserSession> => {

  const response = await fetch('/web/session/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      id: 1,
      params: {
        db: DB,
        login,
        password,
      },
    }),
  })

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error.data?.message || 'Login failed')
  }

  if (!data.result || !data.result.uid) {
    throw new Error('Invalid username or password. Please try again.')
  }

  const result = data.result

  const employeeId = await fetchEmployeeId(result.uid, result.session_id)

  // # Save a preliminary session first so checkIsAdmin()/getSessionId() works
  const prelimSession: UserSession = {
    uid: result.uid,
    name: result.name,
    username: result.username,
    partnerId: result.partner_id,
    sessionId: result.session_id,
    employeeId,
    isAdmin: false,
  }
  saveSession(prelimSession)

  // # Now check admin — session cookie and getSessionId() are both ready
  const isAdmin = result.is_system === true || result.is_superuser === true || await checkIsAdmin()

  const session: UserSession = { ...prelimSession, isAdmin }
  saveSession(session)

  return session
}

// # Fetch employee ID linked to Odoo user — tries 2 methods
const fetchEmployeeId = async (
  userId: number,
  sessionId: string
): Promise<number | null> => {
  // # Method 1: read employee_id directly from res.users (most reliable)
  try {
    const response = await fetch('/web/dataset/call_kw/res.users/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'call', id: 2,
        params: {
          session_id: sessionId,
          model: 'res.users',
          method: 'read',
          args: [[userId], ['employee_id']],
          kwargs: {},
        },
      }),
    })
    const data = await response.json()
    const empField = data.result?.[0]?.employee_id
    if (empField && empField !== false) {
      return Array.isArray(empField) ? empField[0] : empField
    }
  } catch { /* fall through to method 2 */ }

  // # Method 2: search hr.employee by user_id (fallback)
  try {
    const response = await fetch('/web/dataset/call_kw/hr.employee/search_read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'call', id: 2,
        params: {
          session_id: sessionId,
          model: 'hr.employee',
          method: 'search_read',
          args: [[['user_id', '=', userId]]],
          kwargs: { fields: ['id', 'name'] },
        },
      }),
    })
    const data = await response.json()
    if (data.result && data.result.length > 0) {
      return data.result[0].id
    }
  } catch { /* silent */ }

  return null
}

// # Logout — calls Odoo session destroy endpoint
export const logoutApi = async (): Promise<void> => {
  try {
    await fetch('/web/session/destroy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        id: 3,
        params: {
          session_id: getSessionId(),
        },
      }),
    })
  } catch {
    // # Silent fail — clear session regardless
  }
}
