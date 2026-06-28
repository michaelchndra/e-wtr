'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress
} from '@mui/material';
import { Add, Assignment } from '@mui/icons-material';

export default function WPSPage() {
  const [wpsList, setWpsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ wps_no: '', material_class: '' });

  useEffect(() => {
    fetchWPS();
  }, []);

  const fetchWPS = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/engineering/wps');
      if (res.ok) setWpsList(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/engineering/wps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setDialogOpen(false);
        setFormData({ wps_no: '', material_class: '' });
        fetchWPS();
      } else {
        const { error } = await res.json();
        alert(error);
      }
    } catch (err) {
      alert('Error creating WPS');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Assignment fontSize="large" /> WPS Masterlist
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
          Register WPS
        </Button>
      </Box>

      <Paper sx={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>WPS Number</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Material Class</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Registered Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3} align="center"><CircularProgress /></TableCell></TableRow>
              ) : wpsList.length === 0 ? (
                <TableRow><TableCell colSpan={3} align="center" sx={{ color: 'gray' }}>No WPS registered.</TableCell></TableRow>
              ) : (
                wpsList.map((w) => (
                  <TableRow key={w.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{w.wps_no}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{w.material_class || '-'}</TableCell>
                    <TableCell sx={{ color: 'gray' }}>{new Date(w.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} sx={{ '& .MuiDialog-paper': { backgroundColor: '#1e293b', color: 'white' } }}>
        <DialogTitle>Register New WPS</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 400 }}>
          <TextField label="WPS Number (e.g. WPS-CS-001)" fullWidth variant="outlined" 
            value={formData.wps_no} onChange={e => setFormData({...formData, wps_no: e.target.value})} 
            sx={{ input: { color: 'white' }, label: { color: 'gray' }, fieldset: { borderColor: 'rgba(255,255,255,0.2)' } }}/>
          <TextField label="Material Class (e.g. Carbon Steel, SS316)" fullWidth variant="outlined" 
            value={formData.material_class} onChange={e => setFormData({...formData, material_class: e.target.value})}
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
