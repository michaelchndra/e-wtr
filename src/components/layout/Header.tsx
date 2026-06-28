'use client';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Box, Button, Drawer, List, ListItem, ListItemButton, ListItemText, Collapse } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, MouseEvent } from 'react';
import { signOut } from 'next-auth/react';
import { Session } from 'next-auth';

const menuGroups = [
  {
    title: 'Main',
    roles: ['admin', 'qc', 'supervisor', 'document_control', 'client'],
    items: [
      { text: 'Overview', path: '/dashboard' }
    ]
  },
  {
    title: 'Project Documents',
    roles: ['admin', 'qc', 'supervisor', 'document_control'],
    items: [
      { text: 'Joints', path: '/templates/joints' },
      { text: 'WTRs', path: '/wtr' },
      { text: 'Visual Inspections', path: '/inspections' },
      { text: 'NDT', path: '/ndt' },
      { text: 'Defects / Repairs', path: '/defects' },
      { text: 'Transmittals', path: '/transmittals' },
    ]
  },
  {
    title: 'Client',
    roles: ['admin', 'client'],
    items: [
      { text: 'Client Feedback', path: '/client-feedback' },
    ]
  },
  {
    title: 'System',
    roles: ['admin'],
    items: [
      { text: 'Users Management', path: '/users' },
    ]
  },
  {
    title: 'Engineering Data',
    roles: ['admin', 'engineering'],
    items: [
      { text: 'EPC Hierarchy', path: '/hierarchy' },
      { text: 'Welder Directory', path: '/engineering/welders' },
      { text: 'WPS Masterlist', path: '/engineering/wps' },
    ]
  }
];

export default function Header({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const userRole = session?.user?.role || 'client';

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
    const [submenuAnchor, setSubmenuAnchor] = useState<{ [key: string]: HTMLElement | null }>({});
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<{ [key: string]: boolean }>({});

  const handleProfileMenu = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleProfileClose = () => setAnchorEl(null);

  const handleSubmenuOpen = (event: MouseEvent<HTMLElement>, title: string) => {
    setSubmenuAnchor({ ...submenuAnchor, [title]: event.currentTarget });
  };
  const handleSubmenuClose = (title: string) => {
    setSubmenuAnchor({ ...submenuAnchor, [title]: null });
  };

  const toggleMobileSubmenu = (title: string) => {
    setMobileSubmenuOpen({ ...mobileSubmenuOpen, [title]: !mobileSubmenuOpen[title] });
  };

  const filteredGroups = menuGroups.filter(g => g.roles.includes(userRole));

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: '100%',
        backgroundColor: '#ffffff',
        color: '#111827',
        borderBottom: '1px solid #e5e7eb',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ height: 64, px: { xs: 2, md: 4 } }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={() => setMobileOpen(true)}
          sx={{ mr: 2, display: { md: 'none' }, color: '#111827' }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 5 }}>
          <img src="/logo.png" alt="E-WTR Logo" className="w-8 h-8 object-contain" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827', display: { xs: 'none', sm: 'block' }, letterSpacing: '-0.02em' }}>
            E-WTR
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
          {filteredGroups.map((group) => {
            if (group.items.length === 1) {
              const item = group.items[0];
              const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/');
              return (
                <Button
                  key={item.text}
                  component={Link}
                  href={item.path}
                  disableRipple
                  sx={{
                    textTransform: 'none',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.875rem',
                    color: isActive ? '#111827' : '#6b7280',
                    minWidth: 'auto',
                    p: 0,
                    '&:hover': { color: '#111827', backgroundColor: 'transparent' }
                  }}
                >
                  {group.title}
                </Button>
              );
            } else {
              const isAnyChildActive = group.items.some(i => pathname === i.path || (pathname.startsWith(i.path) && i.path !== '/'));
              return (
                <div key={group.title}>
                  <Button
                    disableRipple
                    onClick={(e) => handleSubmenuOpen(e, group.title)}
                    endIcon={<KeyboardArrowDownIcon />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: isAnyChildActive ? 600 : 400,
                      fontSize: '0.875rem',
                      color: isAnyChildActive ? '#111827' : '#6b7280',
                      minWidth: 'auto',
                      p: 0,
                      '&:hover': { color: '#111827', backgroundColor: 'transparent' }
                    }}
                  >
                    {group.title}
                  </Button>
                  <Menu
                    anchorEl={submenuAnchor[group.title]}
                    open={Boolean(submenuAnchor[group.title])}
                    onClose={() => handleSubmenuClose(group.title)}
                    elevation={0}
                    sx={{ '& .MuiPaper-root': { border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', mt: 1, minWidth: 180 } }}
                  >
                    {group.items.map((item) => (
                      <MenuItem 
                        key={item.text} 
                        component={Link} 
                        href={item.path}
                        onClick={() => handleSubmenuClose(group.title)}
                        sx={{ fontSize: '0.875rem', color: '#374151', py: 1 }}
                      >
                        {item.text}
                      </MenuItem>
                    ))}
                  </Menu>
                </div>
              );
            }
          })}
        </Box>

        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box 
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }} 
            onClick={handleProfileMenu}
          >
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, color: '#374151', fontWeight: 500 }}>
              {session?.user?.name || 'User'}
            </Typography>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#f3f4f6', color: '#374151', fontSize: '0.875rem', fontWeight: 500 }}>
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                elevation: 0,
                sx: { mt: 1, borderRadius: 1, border: '1px solid #e5e7eb', minWidth: 160, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
              }
            }}
          >
            <MenuItem onClick={handleProfileClose} sx={{ fontSize: '0.875rem', py: 1 }}>Role: {userRole}</MenuItem>
            <MenuItem onClick={() => { handleProfileClose(); signOut(); }} sx={{ fontSize: '0.875rem', py: 1, color: '#dc2626' }}>Log out</MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 260, bgcolor: '#ffffff' } }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <img src="/logo.png" alt="E-WTR Logo" className="w-8 h-8 object-contain" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>E-WTR</Typography>
        </Box>
        <List sx={{ px: 1 }}>
          {filteredGroups.map((group) => {
            if (group.items.length === 1) {
              const item = group.items[0];
              const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/');
              return (
                <ListItem key={group.title} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton component={Link} href={item.path} onClick={() => setMobileOpen(false)} sx={{ borderRadius: 1, bgcolor: isActive ? '#f3f4f6' : 'transparent', '&:hover': { bgcolor: '#e5e7eb' } }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 500, color: isActive ? '#111827' : '#4b5563' }}>
                      {group.title}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              );
            } else {
              const isOpen = mobileSubmenuOpen[group.title];
              return (
                <div key={group.title}>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton onClick={() => toggleMobileSubmenu(group.title)} sx={{ borderRadius: 1 }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#4b5563', flexGrow: 1 }}>
                        {group.title}
                      </Typography>
                      {isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 2 }}>
                      {group.items.map((item) => {
                        const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/');
                        return (
                          <ListItemButton key={item.text} component={Link} href={item.path} onClick={() => setMobileOpen(false)} sx={{ borderRadius: 1, py: 0.5, mb: 0.5, bgcolor: isActive ? '#f3f4f6' : 'transparent' }}>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400, color: isActive ? '#111827' : '#6b7280' }}>
                              {item.text}
                            </Typography>
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </div>
              );
            }
          })}
        </List>
      </Drawer>
    </AppBar>
  );
}
