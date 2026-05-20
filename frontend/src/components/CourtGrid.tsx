import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

type Court = { id: number; name: string }
type Booking = { id: string; title: string; start: Date | string; end: Date | string; courtId: number }

function fmtTime(h: number) {
  return (h < 10 ? '0' + h : '' + h) + ':00'
}

export default function CourtGrid({ courts, bookings, onSlotClick, weekStart = new Date() }: { courts: Court[]; bookings: Booking[]; onSlotClick: (start: Date, end: Date, courtId: number) => void; weekStart?: Date }) {
  // show 7 days starting from weekStart
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const hours = Array.from({ length: 17 }).map((_, i) => 6 + i) // 6:00 - 22:00

  const bookingForCell = (courtId: number, slotStart: Date) => {
    return bookings.find((b: any) => {
      const s = new Date(b.start)
      const e = new Date(b.end)
      return b.courtId === courtId && s <= slotStart && e > slotStart
    })
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
      {/* Left column: date headers stacked and times column */}
      <Box sx={{ flex: '0 0 160px' }}>
        <Box sx={{ height: 64, display: 'flex', alignItems: 'center', pl: 2 }}>
          <Typography variant="h5">Book a Court</Typography>
        </Box>
        <Box sx={{ borderTop: '1px solid #e0e0e0' }}>
          {hours.map((h) => (
            <Box key={h} sx={{ height: 64, display: 'flex', alignItems: 'center', pl: 2, color: '#667085' }}>
              <Typography variant="body2">{fmtTime(h)}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right: main grid with horizontal scroll */}
      <Box sx={{ overflowX: 'auto', flex: 1 }}>
        {/* Top: date headers */}
        <Box sx={{ display: 'flex', minWidth: Math.max(800, courts.length * 160), borderBottom: '1px solid #e6eef6', pl: 2 }}>
          {days.map((d, idx) => (
            <Box key={idx} sx={{ flex: '0 0 160px', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
              <Typography variant="subtitle1">{d.toLocaleDateString(undefined, { weekday: 'short' })}</Typography>
              <Box sx={{ ml: 1 }}>
                <Typography variant="subtitle2">{d.toLocaleDateString()}</Typography>
              </Box>
            </Box>
          ))}
          {/* extra spacer to show whole week header area */}
        </Box>

        {/* Court column headers */}
        <Box sx={{ display: 'flex', minWidth: Math.max(800, courts.length * 160), borderBottom: '1px solid #f0f4f8', pl: 2 }}>
          {days.map((d, idx) => (
            <Box key={idx} sx={{ display: 'flex' }}>
              {courts.map((c: Court) => (
                <Box key={`${idx}-${c.id}`} sx={{ flex: '0 0 160px', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{c.name}</Typography>
                </Box>
              ))}
            </Box>
          ))}
        </Box>

        {/* Grid body: for each hour, render a row with a cell per day per court */}
        <Box sx={{ minWidth: Math.max(800, courts.length * 160), pl: 2 }}>
          {hours.map((h) => (
            <Box key={h} sx={{ display: 'flex' }}>
              {days.map((d, dayIdx) => (
                <Box key={dayIdx} sx={{ display: 'flex' }}>
                  {courts.map((c: Court) => {
                    const slotStart = new Date(d)
                    slotStart.setHours(h, 0, 0, 0)
                    const booking = bookingForCell(c.id, slotStart)
                    return (
                      <Box key={`${dayIdx}-${c.id}-${h}`} sx={{ flex: '0 0 160px', p: 1 }}>
                        <Paper elevation={0} sx={{ height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: booking ? '#FEEBD4' : '#E9EEF6', cursor: 'pointer' }} onClick={() => onSlotClick(slotStart, new Date(slotStart.getTime() + 60 * 60 * 1000), c.id)}>
                          <Typography variant="body2" sx={{ color: booking ? '#BF4A00' : '#7D8FA8', fontWeight: 700 }}>
                            {booking ? booking.title : 'N/A'}
                          </Typography>
                        </Paper>
                      </Box>
                    )
                  })}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
