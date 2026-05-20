import { useEffect, useState } from 'react'
import { Container, Typography, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Button } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { fetchBookings } from '../services/api'

export default function OperatorDashboard({onDelete}:{onDelete?:()=>void}){
  const [bookings, setBookings] = useState<any[]>([])

  async function load(){
    try{ const b = await fetchBookings(); setBookings(b); }catch(e){console.error(e)}
  }

  useEffect(()=>{ load() },[])

  return (
    <Container sx={{mt:3}}>
      <Typography variant="h5">Operator Dashboard</Typography>
      <Button onClick={load} sx={{mt:2, mb:2}}>Reload</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Court</TableCell>
            <TableCell>Start</TableCell>
            <TableCell>End</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map(b=> (
            <TableRow key={b.id}>
              <TableCell>{b.id}</TableCell>
              <TableCell>{b.title}</TableCell>
              <TableCell>{b.courtId}</TableCell>
              <TableCell>{new Date(b.start).toLocaleString()}</TableCell>
              <TableCell>{new Date(b.end).toLocaleString()}</TableCell>
              <TableCell>
                <IconButton onClick={async ()=>{ try{ await fetch(`http://localhost:5000/api/bookings/${b.id}`,{method:'DELETE'}); load(); if(onDelete) onDelete(); }catch(e){alert('Delete failed')} }}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  )
}
