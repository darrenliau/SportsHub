import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Button, Avatar } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import BookmarksIcon from '@mui/icons-material/Bookmarks'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'

type User = { id: number; username: string; email: string; role: string }

interface SidebarProps {
  user: User | null
  view: 'calendar' | 'dashboard' | 'management'
  onNavigate: (view: 'calendar' | 'dashboard' | 'management') => void
  onLogout: () => void
}

const DRAWER_WIDTH = 250

export default function Sidebar({ user, view, onNavigate, onLogout }: SidebarProps) {
  const navItems: Array<{ label: string; icon: any; view: 'calendar' | 'dashboard' | 'management' }> = [
    { label: 'Home', icon: HomeIcon, view: 'calendar' as const },
    { label: 'Bookings', icon: BookmarksIcon, view: 'dashboard' as const },
  ]

  // Add Management item only for operators
  if (user?.role === 'operator') {
    navItems.push({ label: 'Management', icon: SettingsIcon, view: 'management' as const })
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#f5f5f5',
          borderRight: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
          SportsHub
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, pt: 2 }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = view === item.view
          return (
            <ListItemButton
              key={item.view}
              onClick={() => onNavigate(item.view)}
              sx={{
                mx: 1,
                mb: 1,
                borderRadius: 1,
                backgroundColor: isActive ? '#e3f2fd' : 'transparent',
                color: isActive ? '#1976d2' : '#666',
                '&:hover': {
                  backgroundColor: isActive ? '#e3f2fd' : '#f0f0f0',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        })}
      </List>

      {/* Footer - User Profile */}
      {user && (
        <Box sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar sx={{ width: 40, height: 40, backgroundColor: '#1976d2' }}>
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                {user.username}
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                {user.role}
              </Typography>
            </Box>
          </Box>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<LogoutIcon />}
            onClick={onLogout}
            sx={{
              color: '#d32f2f',
              borderColor: '#d32f2f',
              '&:hover': {
                borderColor: '#d32f2f',
                backgroundColor: 'rgba(211, 47, 47, 0.05)',
              },
            }}
          >
            Logout
          </Button>
        </Box>
      )}
    </Drawer>
  )
}
