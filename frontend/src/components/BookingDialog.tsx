import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

export interface BookingDialogProps {
  open: boolean;
  initialStart?: Date;
  initialEnd?: Date;
  onClose: () => void;
  onSave: (data: { title: string; start: Date; end: Date }) => void;
}

export default function BookingDialog({ open, initialStart, initialEnd, onClose, onSave }: BookingDialogProps) {
  const [title, setTitle] = useState('Badminton booking');
  const [start, setStart] = useState(initialStart ? initialStart.toISOString().slice(0,16) : new Date().toISOString().slice(0,16));
  const [end, setEnd] = useState(initialEnd ? initialEnd.toISOString().slice(0,16) : new Date(Date.now()+60*60*1000).toISOString().slice(0,16));

  React.useEffect(()=>{
    if(initialStart) setStart(initialStart.toISOString().slice(0,16));
    if(initialEnd) setEnd(initialEnd.toISOString().slice(0,16));
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
        <TextField fullWidth label="Title" value={title} onChange={e=>setTitle(e.target.value)} margin="dense" />
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
