'use client';
import { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

export default function JointTemplatesPage() {
  const [joints, setJoints] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ joint_number: '', weld_type: '', thickness: '' });

  const fetchJoints = async () => {
    const res = await fetch('/api/joints');
    const data = await res.json();
    setJoints(data);
  };

  useEffect(() => {
    fetchJoints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/joints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        thickness: parseFloat(formData.thickness)
      })
    });
    setOpen(false);
    fetchJoints();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>Joint Templates</Typography>
        <Button variant="contained" onClick={() => setOpen(true)} sx={{ bgcolor: '#111827', '&:hover': { bgcolor: '#374151' }, textTransform: 'none', boxShadow: 'none' }}>
          + New Joint
        </Button>
      </div>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#f9fafb' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Joint Number</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Weld Type</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Thickness</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {joints.map((joint) => (
              <TableRow key={joint.id}>
                <TableCell>{joint.joint_number}</TableCell>
                <TableCell>{joint.weld_type}</TableCell>
                <TableCell>{joint.thickness}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    {joint.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 3, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #e5e7eb', pb: 2 }}>Add New Joint Template</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: '24px !important' }} className="space-y-5">
            <div>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Joint Number</Typography>
              <TextField fullWidth size="medium" placeholder="e.g. FW-001" required
                value={formData.joint_number} onChange={(e) => setFormData({...formData, joint_number: e.target.value})} 
                sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }} />
            </div>
            <div>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Weld Type</Typography>
              <TextField fullWidth size="medium" placeholder="e.g. Butt Weld" required
                value={formData.weld_type} onChange={(e) => setFormData({...formData, weld_type: e.target.value})} 
                sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }} />
            </div>
            <div>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Thickness (mm)</Typography>
              <TextField fullWidth size="medium" type="number" slotProps={{ htmlInput: { step: "0.1" } }} placeholder="e.g. 10.5" required
                value={formData.thickness} onChange={(e) => setFormData({...formData, thickness: e.target.value})} 
                sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }} />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
            <Button onClick={() => setOpen(false)} sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600, px: 3 }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#0f172a', textTransform: 'none', fontWeight: 600, px: 4, borderRadius: 2, '&:hover': { bgcolor: '#334155' } }}>Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
