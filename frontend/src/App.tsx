import './App.css'
import { useState, useEffect } from 'react'
import { Container, AppBar, Toolbar, Typography, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import CourtGrid from './components/CourtGrid'
import BookingDialog from './components/BookingDialog'
import OperatorDashboard from './pages/OperatorDashboard'
import { fetchBookings, fetchCourts, createBooking } from './services/api'

type Event = { id: string; title: string; start: Date; end: Date; courtId: number }

function toEvent(b: any): Event { return { id: String(b.id), title: b.title, start: new Date(b.start), end: new Date(b.end), courtId: b.courtId } }

export default function App() {
  const [view, setView] = useState<'calendar'|'dashboard'>('calendar')
  const [events, setEvents] = useState<Event[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [slotInfo, setSlotInfo] = useState<{ start?: Date; end?: Date } | null>(null)
  const [courts, setCourts] = useState<any[]>([])
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null)

  useEffect(() => { loadCourts(); loadBookings(); }, [])

  async function loadCourts() { try { const c = await fetchCourts(); setCourts(c); if (c.length) setSelectedCourt(c[0].id); } catch (e) { console.error(e) } }
  async function loadBookings() { try { const b = await fetchBookings(); setEvents(b.map(toEvent)); } catch (e) { console.error(e) } }

  const handleSelectSlot = (slot: any) => { setSlotInfo({ start: new Date(slot.start), end: new Date(slot.end) }); setDialogOpen(true) }

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
    if (!selectedCourt) return alert('Select a court');
    try { await createBooking({ title: data.title, start: data.start, end: data.end, courtId: selectedCourt }); await loadBookings(); } catch (err) { const message = await getErrorMessage(err); alert('Failed to create booking: ' + message) }
  }



  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>SportsHub — Badminton Booking (MUI+Calendar demo)</Typography>
          <FormControl variant="standard" sx={{ mr: 2, minWidth: 140 }}>
            <InputLabel id="court-select-label">Court</InputLabel>
            <Select labelId="court-select-label" value={selectedCourt ?? ''} onChange={e=>setSelectedCourt(Number(e.target.value))}>
              {courts.map(c => <MenuItem key={c.courtId} value={c.courtId}>{c.courtName}</MenuItem>)}
            </Select>
          </FormControl>
          <Button color="inherit" onClick={() => { loadBookings() }}>Reload</Button>
          <Button color="inherit" onClick={()=>setView(view==='calendar' ? 'dashboard' : 'calendar')}>{view==='calendar' ? 'Dashboard' : 'Calendar'}</Button>
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
