import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

export interface BookingDialogProps {
  open: boolean;
  initialStart?: Date;
  initialEnd?: Date;
  username?: string;
  onClose: () => void;
  onSave: (data: { title: string; start: Date; end: Date }) => void;
}

export default function BookingDialog({ open, initialStart, initialEnd, username, onClose, onSave }: BookingDialogProps) {
  const title = username || 'Booking';
  
  const formatLocalDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [start, setStart] = useState(initialStart ? formatLocalDateTime(initialStart) : formatLocalDateTime(new Date()));
  const [end, setEnd] = useState(initialEnd ? formatLocalDateTime(initialEnd) : formatLocalDateTime(new Date(Date.now()+60*60*1000)));

  React.useEffect(()=>{
    if(initialStart) setStart(formatLocalDateTime(initialStart));
    if(initialEnd) setEnd(formatLocalDateTime(initialEnd));
  },[initialStart, initialEnd, open]);

  const handleSave = () => {
    const s = new Date(start);
    const e = new Date(end);
    onSave({ title, start: s, end: e });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create booking</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          type="datetime-local"
          label="Start"
          value={start}
          onChange={e=>setStart(e.target.value)}
          margin="dense"
        />
        <TextField
          fullWidth
          type="datetime-local"
          label="End"
          value={end}
          onChange={e=>setEnd(e.target.value)}
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
