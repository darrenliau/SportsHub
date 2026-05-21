import './App.css'
import { useState, useEffect } from 'react'
import { Container, AppBar, Toolbar, Typography, Button, FormControl, InputLabel, Select, MenuItem, Box, Menu, Avatar, CircularProgress } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import CourtGrid from './components/CourtGrid'
import BookingDialog from './components/BookingDialog'
import OperatorDashboard from './pages/OperatorDashboard'
import Login from './components/Login'
import Register from './components/Register'
import { fetchBookings, fetchCourts, createBooking, logout, refreshToken } from './services/api'

type Event = { id: string; title: string; start: Date; end: Date; courtId: number }
type User = { id: number; username: string; email: string; role: string }

function toEvent(b: any): Event { return { id: String(b.id), title: b.title, start: new Date(b.start), end: new Date(b.end), courtId: b.courtId } }

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'login'|'register'>('login')
  const [view, setView] = useState<'calendar'|'dashboard'>('calendar')
  const [events, setEvents] = useState<Event[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [slotInfo, setSlotInfo] = useState<{ start?: Date; end?: Date; courtId?: number } | null>(null)
  const [courts, setCourts] = useState<any[]>([])
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)

  useEffect(() => { 
    const initAuth = async () => {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr)
          setUser(parsed)
          try { await refreshToken() } catch (e) { console.warn('refresh failed', e) }
        } catch (e) { console.error(e) }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  useEffect(() => { if (user) { loadCourts(); loadBookings(); } }, [user])

  async function loadCourts() { try { const c = await fetchCourts(); setCourts(c); if (c.length) setSelectedCourt(c[0].id); } catch (e) { console.error(e) } }
  async function loadBookings() { try { const b = await fetchBookings(); setEvents(b.map(toEvent)); } catch (e) { console.error(e) } }

  const handleSelectSlot = (slot: any) => { setSlotInfo({ start: new Date(slot.start), end: new Date(slot.end), courtId: slot.courtId }); setDialogOpen(true) }

  const getErrorMessage = async (err:any) => {
    try {
      if (err && typeof err.json === 'function') {
        const j = await err.json();
        return j?.message || JSON.stringify(j);
      }
    } catch {}
    return err?.message || String(err) || 'Error';
  }

  const handleSaveBooking = async (data: { title: string; start: Date; end: Date }) => {
    const courtId = slotInfo?.courtId || selectedCourt;
    if (!courtId) return alert('Select a court');
    try { await createBooking({ title: data.title, start: data.start, end: data.end, courtId }); await loadBookings(); setDialogOpen(false); } catch (err) { const message = await getErrorMessage(err); alert('Failed to create booking: ' + message) }
  }

  const handleUserMenuOpen = (e: React.MouseEvent<HTMLElement>) => setUserMenuAnchor(e.currentTarget)
  const handleUserMenuClose = () => setUserMenuAnchor(null)

  const handleLogout = async () => {
    try {
      await logout()
      setUser(null)
      setAuthMode('login')
      setUserMenuAnchor(null)
    } catch (e) {
      alert('Logout failed')
    }
  }

  const handleLoginSuccess = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (e) { console.error(e) }
    }
  }

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>SportsHub</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button variant={authMode === 'login' ? 'contained' : 'outlined'} onClick={() => setAuthMode('login')}>Login</Button>
          <Button variant={authMode === 'register' ? 'contained' : 'outlined'} onClick={() => setAuthMode('register')}>Register</Button>
        </Box>
        {authMode === 'login' ? <Login onSuccess={handleLoginSuccess} /> : <Register onSuccess={() => { alert('Registered! Please login.'); setAuthMode('login') }} />}
      </Box>
    )
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>SportsHub — Badminton Booking</Typography>
          <FormControl variant="standard" sx={{ mr: 2, minWidth: 140 }}>
            <InputLabel id="court-select-label">Court</InputLabel>
            <Select labelId="court-select-label" value={selectedCourt ?? ''} onChange={e=>setSelectedCourt(Number(e.target.value))}>
              {courts.map(c => <MenuItem key={c.courtId} value={c.courtId}>{c.courtName}</MenuItem>)}
            </Select>
          </FormControl>
          <Button color="inherit" onClick={() => { loadBookings() }}>Reload</Button>
          <Button color="inherit" onClick={()=>setView(view==='calendar' ? 'dashboard' : 'calendar')}>{view==='calendar' ? 'Dashboard' : 'Calendar'}</Button>
          <Button color="inherit" onClick={handleUserMenuOpen} sx={{ ml: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>{user.username.charAt(0).toUpperCase()}</Avatar>
            {user.username}
          </Button>
          <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={handleUserMenuClose}>
            <MenuItem disabled>{user.email}</MenuItem>
            <MenuItem disabled>Role: {user.role}</MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}><LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      {view==='calendar' ? (
        <Container sx={{ mt: 3 }}>
          <CourtGrid courts={courts} bookings={events} weekStart={new Date()} onSlotClick={(start, end, courtId) => handleSelectSlot({ start, end, courtId })} />
        </Container>
      ) : (
        <OperatorDashboard onDelete={loadBookings} />
      )}

      <BookingDialog open={dialogOpen} initialStart={slotInfo?.start} initialEnd={slotInfo?.end} onClose={() => setDialogOpen(false)} onSave={handleSaveBooking} />
    </div>
  )
}
