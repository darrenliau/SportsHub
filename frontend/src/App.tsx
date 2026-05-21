import './App.css'
import { useState, useEffect } from 'react'
import { Typography, Button, Box, CircularProgress } from '@mui/material'
import CourtGrid from './components/CourtGrid'
import BookingDialog from './components/BookingDialog'
import ManagementDashboard from './pages/ManagementDashboard'
import BookingDashboard from './pages/BookingDashboard'
import Sidebar from './components/Sidebar'
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
  const [view, setView] = useState<'calendar'|'dashboard'|'management'>('calendar')
  const [events, setEvents] = useState<Event[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [slotInfo, setSlotInfo] = useState<{ start?: Date; end?: Date; courtId?: number } | null>(null)
  const [courts, setCourts] = useState<any[]>([])
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null)

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
    try {
      // Convert local dates to ISO strings (local time, not UTC)
      const toLocalISOString = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };
      await createBooking({ 
        title: data.title, 
        start: toLocalISOString(data.start), 
        end: toLocalISOString(data.end), 
        courtId 
      }); 
      await loadBookings(); 
      setDialogOpen(false); 
    } catch (err) { 
      const message = await getErrorMessage(err); 
      alert('Failed to create booking: ' + message) 
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setUser(null)
      setAuthMode('login')
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
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar user={user} view={view} onNavigate={(newView) => setView(newView)} onLogout={handleLogout} />
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {view === 'calendar' ? (
          <Box sx={{ flex: 1 }}>
            <CourtGrid courts={courts} bookings={events} weekStart={new Date()} onSlotClick={(start, end, courtId) => handleSelectSlot({ start, end, courtId })} />
          </Box>
        ) : view === 'management' ? (
          <ManagementDashboard />
        ) : (
          <BookingDashboard onDelete={loadBookings} />
        )}
      </Box>

      <BookingDialog open={dialogOpen} initialStart={slotInfo?.start} initialEnd={slotInfo?.end} username={user?.username} onClose={() => setDialogOpen(false)} onSave={handleSaveBooking} />
    </Box>
  )
}
