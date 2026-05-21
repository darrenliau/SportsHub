import { useState } from 'react'
import { TextField, Button, Box } from '@mui/material'
import { login } from '../services/api'

export default function Login({ onSuccess }:{ onSuccess?:()=>void }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e:any){
    e.preventDefault()
    setLoading(true)
    try{
      await login({ username, password })
      onSuccess && onSuccess()
    }catch(e){ alert('Login failed') }
    setLoading(false)
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{display:'flex', flexDirection:'column', gap:2, width:320}}>
      <TextField label="Username or Email" value={username} onChange={e=>setUsername(e.target.value)} />
      <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <Button type="submit" variant="contained" disabled={loading}>Login</Button>
    </Box>
  )
}
