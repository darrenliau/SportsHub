import { useState, useEffect } from 'react'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, Typography, Card, CardContent, IconButton, List, ListItem, ListItemText, CircularProgress, MenuItem } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { fetchAllCourts, createCourt, updateCourt, fetchBlackoutDates, createBlackoutDate, deleteBlackoutDate, fetchLocations } from '../services/api'

type Location = { locationId: number; locationName: string; address: string }
type Court = { courtId: number; courtName: string; enabled: boolean; locationId: number; location: { locationId: number; locationName: string } }
type BlackoutDate = { blackoutDateId: number; courtId: number; dateStart: string; dateEnd: string; reason: string; createdAt: string }

export default function OperatorDashboard() {
  const [courts, setCourts] = useState<Court[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [blackouts, setBlackouts] = useState<BlackoutDate[]>([])
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [loading, setLoading] = useState(false)
  const [openCourtDialog, setOpenCourtDialog] = useState(false)
  const [openBlackoutDialog, setOpenBlackoutDialog] = useState(false)
  const [courtForm, setCourtForm] = useState({ courtName: '', locationId: 1 })
  const [blackoutForm, setBlackoutForm] = useState({ dateStart: '', dateEnd: '', reason: '' })
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)

  useEffect(() => {
    loadLocations()
    loadCourts()
  }, [])

  useEffect(() => {
    if (selectedCourt) {
      loadBlackouts(selectedCourt.courtId)
    }
  }, [selectedCourt])

  const loadLocations = async () => {
    try {
      const data = await fetchLocations()
      setLocations(data)
      if (data.length > 0 && courtForm.locationId === 1) {
        setCourtForm({ ...courtForm, locationId: data[0].locationId })
      }
    } catch (err) {
      console.error('Failed to load locations:', err)
    }
  }

  const loadCourts = async () => {
    try {
      setLoading(true)
      const data = await fetchAllCourts()
      setCourts(data)
    } catch (err) {
      console.error('Failed to load courts:', err)
      alert('Failed to load courts')
    } finally {
      setLoading(false)
    }
  }

  const loadBlackouts = async (courtId: number) => {
    try {
      const data = await fetchBlackoutDates(courtId)
      setBlackouts(data)
    } catch (err) {
      console.error('Failed to load blackouts:', err)
    }
  }

  const handleAddCourt = async () => {
    if (!courtForm.courtName.trim()) {
      alert('Court name is required')
      return
    }
    try {
      await createCourt(courtForm.courtName, courtForm.locationId)
      setCourtForm({ courtName: '', locationId: 1 })
      setOpenCourtDialog(false)
      loadCourts()
      alert('Court created successfully')
    } catch (err: any) {
      alert('Failed to create court: ' + (await err.text()))
    }
  }

  const handleEditCourt = async (court: Court) => {
    setEditingCourt(court)
    setCourtForm({ courtName: court.courtName, locationId: court.locationId })
    setOpenCourtDialog(true)
  }

  const handleSaveEditCourt = async () => {
    if (!editingCourt || !courtForm.courtName.trim()) {
      alert('Court name is required')
      return
    }
    try {
      await updateCourt(editingCourt.courtId, courtForm.courtName, courtForm.locationId)
      setCourtForm({ courtName: '', locationId: 1 })
      setEditingCourt(null)
      setOpenCourtDialog(false)
      loadCourts()
      alert('Court updated successfully')
    } catch (err: any) {
      alert('Failed to update court: ' + (await err.text()))
    }
  }

  const handleToggleCourt = async (court: Court) => {
    try {
      await updateCourt(court.courtId, undefined, undefined, !court.enabled)
      loadCourts()
    } catch (err: any) {
      alert('Failed to toggle court: ' + (await err.text()))
    }
  }

  const handleAddBlackout = async () => {
    if (!selectedCourt || !blackoutForm.dateStart || !blackoutForm.dateEnd) {
      alert('Both start and end dates are required')
      return
    }
    try {
      await createBlackoutDate(selectedCourt.courtId, blackoutForm.dateStart, blackoutForm.dateEnd, blackoutForm.reason)
      setBlackoutForm({ dateStart: '', dateEnd: '', reason: '' })
      setOpenBlackoutDialog(false)
      loadBlackouts(selectedCourt.courtId)
      alert('Blackout date created successfully')
    } catch (err: any) {
      alert('Failed to create blackout date: ' + (await err.text()))
    }
  }

  const handleDeleteBlackout = async (blackoutId: number) => {
    if (!selectedCourt) return
    if (!confirm('Are you sure you want to delete this blackout date?')) return
    try {
      await deleteBlackoutDate(selectedCourt.courtId, blackoutId)
      loadBlackouts(selectedCourt.courtId)
    } catch (err: any) {
      alert('Failed to delete blackout date: ' + (await err.text()))
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Court Management
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {/* Courts Section */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Courts
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingCourt(null)
                setCourtForm({ courtName: '', locationId: 1 })
                setOpenCourtDialog(true)
              }}
              sx={{ mb: 2 }}
            >
              Add Court
            </Button>

            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Court Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courts.map((court) => (
                    <TableRow key={court.courtId} onClick={() => setSelectedCourt(court)} sx={{ backgroundColor: selectedCourt?.courtId === court.courtId ? '#f0f7ff' : 'transparent', cursor: 'pointer' }}>
                      <TableCell>{court.courtName}</TableCell>
                      <TableCell>{court.location.locationName}</TableCell>
                      <TableCell>
                        <Switch checked={court.enabled} onChange={() => handleToggleCourt(court)} />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditCourt(court) }}>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Blackout Dates Section */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {selectedCourt ? `Blackout Dates - ${selectedCourt.courtName}` : 'Select a Court'}
            </Typography>
            {selectedCourt && (
              <>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setBlackoutForm({ dateStart: '', dateEnd: '', reason: '' })
                    setOpenBlackoutDialog(true)
                  }}
                  sx={{ mb: 2 }}
                >
                  Add Blackout
                </Button>

                <Card>
                  <CardContent>
                    {blackouts.length === 0 ? (
                      <Typography sx={{ color: '#999' }}>No blackout dates</Typography>
                    ) : (
                      <List>
                        {blackouts.map((blackout) => (
                          <ListItem key={blackout.blackoutDateId} secondaryAction={<IconButton edge="end" onClick={() => handleDeleteBlackout(blackout.blackoutDateId)}><DeleteIcon /></IconButton>}>
                            <ListItemText
                              primary={`${new Date(blackout.dateStart).toLocaleDateString()} - ${new Date(blackout.dateEnd).toLocaleDateString()}`}
                              secondary={blackout.reason || 'No reason provided'}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </Box>
        </Box>
      )}

      {/* Court Dialog */}
      <Dialog open={openCourtDialog} onClose={() => setOpenCourtDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCourt ? 'Edit Court' : 'Add Court'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Court Name"
            value={courtForm.courtName}
            onChange={(e) => setCourtForm({ ...courtForm, courtName: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            select
            label="Location"
            value={courtForm.locationId}
            onChange={(e) => setCourtForm({ ...courtForm, locationId: parseInt(e.target.value) })}
            margin="dense"
          >
            {locations.map((loc) => (
              <MenuItem key={loc.locationId} value={loc.locationId}>
                {loc.locationName} {loc.address && `- ${loc.address}`}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCourtDialog(false)}>Cancel</Button>
          <Button onClick={editingCourt ? handleSaveEditCourt : handleAddCourt} variant="contained">
            {editingCourt ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Blackout Dialog */}
      <Dialog open={openBlackoutDialog} onClose={() => setOpenBlackoutDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Blackout Date</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            type="datetime-local"
            label="Start Date"
            value={blackoutForm.dateStart}
            onChange={(e) => setBlackoutForm({ ...blackoutForm, dateStart: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            type="datetime-local"
            label="End Date"
            value={blackoutForm.dateEnd}
            onChange={(e) => setBlackoutForm({ ...blackoutForm, dateEnd: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Reason (optional)"
            value={blackoutForm.reason}
            onChange={(e) => setBlackoutForm({ ...blackoutForm, reason: e.target.value })}
            margin="dense"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBlackoutDialog(false)}>Cancel</Button>
          <Button onClick={handleAddBlackout} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
