'use client';
import { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

export default function DefectsPage() {
  const [defects, setDefects] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedDefect, setSelectedDefect] = useState<number | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchDefects = async () => {
    const res = await fetch('/api/defects');
    setDefects(await res.json());
  };

  useEffect(() => {
    fetchDefects();
  }, []);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDefect) return;

    await fetch(`/api/defects/${selectedDefect}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution_notes: resolutionNotes })
    });
    
    setOpen(false);
    setSelectedDefect(null);
    setResolutionNotes('');
    fetchDefects();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>Defect Reports</Typography>
      </div>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#f9fafb' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>WTR Number</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Defect Description</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {defects.map((defect) => (
              <TableRow key={defect.id}>
                <TableCell>{new Date(defect.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{defect.wtr?.wtr_number}</TableCell>
                <TableCell>{defect.description}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${defect.status === 'closed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {defect.status.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>
                  {defect.status === 'open' ? (
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="primary"
                      onClick={() => { setSelectedDefect(defect.id); setOpen(true); }}
                      sx={{ textTransform: 'none' }}
                    >
                      Resolve
                    </Button>
                  ) : (
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      Resolved: {defect.resolution_notes}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 3, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #e5e7eb', pb: 2 }}>Resolve Defect</DialogTitle>
        <form onSubmit={handleResolve}>
          <DialogContent sx={{ pt: '24px !important' }} className="space-y-5">
            <div>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Resolution Notes / Repair Action</Typography>
              <TextField 
                fullWidth 
                size="medium" 
                placeholder="Detail the steps taken to fix this defect..." 
                multiline 
                rows={4} 
                required
                value={resolutionNotes} 
                onChange={(e) => setResolutionNotes(e.target.value)} 
                sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
              />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
            <Button onClick={() => setOpen(false)} sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600, px: 3 }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#0f172a', textTransform: 'none', fontWeight: 600, px: 4, borderRadius: 2, '&:hover': { bgcolor: '#334155' } }}>Submit Resolution</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
