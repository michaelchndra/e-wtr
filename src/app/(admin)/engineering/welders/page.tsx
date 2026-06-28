'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Chip
} from '@mui/material';
import { Add, Badge } from '@mui/icons-material';

export default function WeldersPage() {
  const [welders, setWelders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ stamp_no: '', name: '', qualifications: '' });

  useEffect(() => {
    fetchWelders();
  }, []);

  const fetchWelders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/engineering/welders');
      if (res.ok) setWelders(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/engineering/welders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setDialogOpen(false);
        setFormData({ stamp_no: '', name: '', qualifications: '' });
        fetchWelders();
      } else {
        const { error } = await res.json();
        alert(error);
      }
    } catch (err) {
      alert('Error creating welder');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Badge fontSize="large" /> Welder Directory
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
          Register Welder
        </Button>
      </Box>

      <Paper sx={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Stamp No</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Qualifications</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow>
              ) : welders.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center" sx={{ color: 'gray' }}>No welders registered.</TableCell></TableRow>
              ) : (
                welders.map((w) => (
                  <TableRow key={w.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{w.stamp_no}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{w.name}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{w.qualifications || '-'}</TableCell>
                    <TableCell>
                      <Chip label={w.status} color={w.status === 'active' ? 'success' : 'default'} size="small" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} sx={{ '& .MuiDialog-paper': { backgroundColor: '#1e293b', color: 'white' } }}>
        <DialogTitle>Register New Welder</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 400 }}>
          <TextField label="Stamp Number (e.g. W-001)" fullWidth variant="outlined" 
            value={formData.stamp_no} onChange={e => setFormData({...formData, stamp_no: e.target.value})} 
            sx={{ input: { color: 'white' }, label: { color: 'gray' }, fieldset: { borderColor: 'rgba(255,255,255,0.2)' } }}/>
          <TextField label="Full Name" fullWidth variant="outlined" 
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            sx={{ input: { color: 'white' }, label: { color: 'gray' }, fieldset: { borderColor: 'rgba(255,255,255,0.2)' } }}/>
          <TextField label="Qualifications (6G, SMAW, GTAW)" fullWidth variant="outlined" 
            value={formData.qualifications} onChange={e => setFormData({...formData, qualifications: e.target.value})}
            sx={{ input: { color: 'white' }, label: { color: 'gray' }, fieldset: { borderColor: 'rgba(255,255,255,0.2)' } }}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: 'gray' }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Register</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
