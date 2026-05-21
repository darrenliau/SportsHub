import React, { useState, useEffect } from 'react'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, CircularProgress, TablePagination } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { fetchBookings, deleteBooking } from '../services/api'

type Booking = { id: string; title: string; start: string; end: string; courtId: number; userId: number; status: string }
type User = { id: number; username: string; role: string }

interface BookingDashboardProps {
  user: User | null
  onDelete: () => void
}

export default function BookingDashboard({ user, onDelete }: BookingDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const data = await fetchBookings()
      setBookings(data)
    } catch (err) {
      console.error('Failed to load bookings:', err)
      alert('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const canCancelBooking = (booking: Booking): boolean => {
    if (!user) return false
    return booking.userId === user.id || user.role === 'operator'
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    try {
      await deleteBooking(bookingId)
      loadBookings()
      onDelete()
    } catch (err: any) {
      alert('Failed to cancel booking')
    }
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const upcomingBookings = bookings.filter(b => b.status !== 'deleted').sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  const paginatedBookings = upcomingBookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        My Bookings
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : upcomingBookings.length === 0 ? (
        <Typography sx={{ color: '#999', textAlign: 'center', py: 5 }}>
          No bookings yet. Start booking a court!
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Start</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>End</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Court ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.title}</TableCell>
                    <TableCell>{new Date(booking.start).toLocaleString()}</TableCell>
                    <TableCell>{new Date(booking.end).toLocaleString()}</TableCell>
                    <TableCell>{booking.courtId}</TableCell>
                    <TableCell>
                      {canCancelBooking(booking) ? (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteBooking(booking.id)}
                        >
                          Cancel
                        </Button>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          No actions
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={upcomingBookings.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Box>
  )
}
