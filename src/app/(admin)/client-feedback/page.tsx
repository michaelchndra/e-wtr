'use client';
import { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';

export default function ClientFeedbackPage() {
  const [wtrs, setWtrs] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedWtr, setSelectedWtr] = useState<number | null>(null);
  const [formData, setFormData] = useState({ status: 'client_accepted', message: '' });

  const fetchWtrs = async () => {
    const res = await fetch('/api/client-feedback');
    setWtrs(await res.json());
  };

  useEffect(() => {
    fetchWtrs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWtr) return;

    await fetch('/api/client-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wtr_id: selectedWtr, ...formData })
    });
    setOpen(false);
    fetchWtrs();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>Client Review & Feedback</Typography>
      </div>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#f9fafb' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Transmitted Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>WTR Number</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Joint Number</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {wtrs.map((wtr) => (
              <TableRow key={wtr.id}>
                <TableCell>{new Date(wtr.transmitted_at).toLocaleDateString()}</TableCell>
                <TableCell>{wtr.wtr_number}</TableCell>
                <TableCell>{wtr.joint?.joint_number}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${wtr.status === 'client_accepted' ? 'bg-green-100 text-green-700' : wtr.status === 'client_rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {wtr.status === 'transmitted' ? 'PENDING REVIEW' : wtr.status.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>
                  {wtr.status === 'transmitted' && (
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => { setSelectedWtr(wtr.id); setOpen(true); }}
                      sx={{ textTransform: 'none' }}
                    >
                      Review
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 3, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #e5e7eb', pb: 2 }}>Client Review</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: '24px !important' }} className="space-y-5">
            <div>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Decision</Typography>
              <TextField fullWidth size="medium" select required
                value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }} >
                <MenuItem value="client_accepted">Accept</MenuItem>
                <MenuItem value="client_rejected">Reject</MenuItem>
              </TextField>
            </div>
            <div>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Comments / Feedback</Typography>
              <TextField fullWidth size="medium" multiline rows={4} placeholder="Any specific remarks or reason for rejection..."
                value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }} />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
            <Button onClick={() => setOpen(false)} sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600, px: 3 }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#0f172a', textTransform: 'none', fontWeight: 600, px: 4, borderRadius: 2, '&:hover': { bgcolor: '#334155' } }}>Submit Review</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
