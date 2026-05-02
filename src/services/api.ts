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

  // # Fetch employee id using the fresh session id
  const employeeId = await fetchEmployeeId(result.uid, result.session_id)

  const session: UserSession = {
    uid: result.uid,
    name: result.name,
    username: result.username,
    partnerId: result.partner_id,
    sessionId: result.session_id,
    employeeId,
  }

  // # Save session immediately so getSessionId() works everywhere
  saveSession(session)

  return session
}

// # Fetch employee ID linked to Odoo user
const fetchEmployeeId = async (
  userId: number,
  sessionId: string
): Promise<number | null> => {
  try {
    const response = await fetch(
      '/web/dataset/call_kw/hr.employee/search_read',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          id: 2,
          params: {
            session_id: sessionId,
            model: 'hr.employee',
            method: 'search_read',
            args: [[['user_id', '=', userId]]],
            kwargs: { fields: ['id', 'name'] },
          },
        }),
      }
    )
    const data = await response.json()
    if (data.result && data.result.length > 0) {
      return data.result[0].id
    }
    return null
  } catch {
    return null
  }
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
// # Make Odoo API call — works on both PC and mobile
export const odooCall = async (
  model: string,
  method: string,
  args: unknown[],
  kwargs: Record<string, unknown> = {},
  id: number = 1
): Promise<unknown> => {
  const sessionId = getSessionId()
  const response = await fetch(
    `/web/dataset/call_kw/${model}/${method}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        id,
        params: {
          model,
          method,
          args,
          kwargs,
          session_id: sessionId,
        },
      }),
    }
  )
  const data = await response.json()
  if (data.error) {
    throw new Error(data.error.data?.message || data.error.message || 'API Error')
  }
  return data.result
}