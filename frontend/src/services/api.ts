const API_BASE = 'http://localhost:5000/api'

async function request(url: string, opts: any = {}) {
  opts.credentials = 'include'
  const res = await fetch(url, opts)
  if (res.status === 401) {
    // try refresh
    try {
      await refreshToken()
      // retry
      const retry = await fetch(url, { ...opts, credentials: 'include' })
      return retry
    } catch (e) {
      throw res
    }
  }
  return res
}

export async function fetchBookings() {
  try {
    const res = await request(`${API_BASE}/bookings`)
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    return await res.json()
  } catch (err) {
    console.error('fetchBookings error:', err)
    throw err
  }
}

export async function fetchCourts() {
  try {
    const res = await request(`${API_BASE}/courts`)
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    return await res.json()
  } catch (err) {
    console.error('fetchCourts error:', err)
    throw err
  }
}

export async function createBooking(payload: any) {
  const res = await request(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw res
  return await res.json()
}

export async function updateBooking(id: any, payload: any) {
  const res = await request(`${API_BASE}/bookings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw res
  return await res.json()
}

export async function deleteBooking(id: any) {
  const res = await request(`${API_BASE}/bookings/${id}`, { method: 'DELETE' })
  if (!res.ok) throw res
  return true
}

// Auth
export async function register(payload: { username: string; email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include'
  })
  if (!res.ok) throw res
  return await res.json()
}

export async function login(payload: { username: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include'
  })
  if (!res.ok) throw res
  const j = await res.json()
  // server sets httpOnly cookies for tokens; store user locally
  if (j.user) localStorage.setItem('user', JSON.stringify(j.user))
  return j
}

export async function refreshToken() {
  const res = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include' })
  if (!res.ok) throw res
  const j = await res.json()
  if (j.user) localStorage.setItem('user', JSON.stringify(j.user))
  return j
}

export async function logout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include' })
  } catch (e) { console.warn('logout error', e) }
  localStorage.removeItem('user')
}
