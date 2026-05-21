import { useState } from 'react'
import { TextField, Button, Box } from '@mui/material'
import { register } from '../services/api'

export default function Register({ onSuccess }:{ onSuccess?:()=>void }){
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e:any){
    e.preventDefault()
    setLoading(true)
    try{
      await register({ username, email, password })
      onSuccess && onSuccess()
      alert('Registered successfully, please login')
    }catch(e){ alert('Registration failed') }
    setLoading(false)
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{display:'flex', flexDirection:'column', gap:2, width:320}}>
      <TextField label="Username" value={username} onChange={e=>setUsername(e.target.value)} />
      <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <Button type="submit" variant="contained" disabled={loading}>Register</Button>
    </Box>
  )
}
