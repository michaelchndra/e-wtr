'use client';
import { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [wtrs, setWtrs] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ wtr_id: '', result: 'accept', findings: '' });

  const fetchData = async () => {
    const resIns = await fetch('/api/inspections');
    const resWtr = await fetch('/api/wtrs');
    setInspections(await resIns.json());
    setWtrs(await resWtr.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        inspection_date: new Date().toISOString(),
      })
    });
    setOpen(false);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>Visual Inspections</Typography>
        <Button variant="contained" onClick={() => setOpen(true)} sx={{ bgcolor: '#111827', '&:hover': { bgcolor: '#374151' }, textTransform: 'none', boxShadow: 'none' }}>
          + Perform Inspection
        </Button>
      </div>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#f9fafb' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Joint Number</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Result</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Findings</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inspections.map((ins) => (
              <TableRow key={ins.id}>
                <TableCell>{new Date(ins.inspection_date).toLocaleDateString()}</TableCell>
                <TableCell>{ins.joint?.joint_number}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${ins.result === 'accept' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                    {ins.result.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>{ins.findings || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 3, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #e5e7eb', pb: 2 }}>QC Visual Inspection Form</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: '24px !important' }} className="space-y-5">
            <div>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Select WTR</Typography>
              <TextField fullWidth size="medium" select required
                value={formData.wtr_id} onChange={(e) => setFormData({...formData, wtr_id: e.target.value})}
                sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }} >
                {wtrs.filter(w => w.status === 'draft' && !w.visual_inspection_id).map(w => (
                  <MenuItem key={w.id} value={w.id}>{w.wtr_number} (Joint: {w.joint?.joint_number})</MenuItem>
                ))}
              </TextField>
            </div>
            <div>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Inspection Result</Typography>
              <TextField fullWidth size="medium" select required
                value={formData.result} onChange={(e) => setFormData({...formData, result: e.target.value})}
                sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }} >
                <MenuItem value="accept">Accept</MenuItem>
                <MenuItem value="reject">Reject</MenuItem>
              </TextField>
            </div>
            {formData.result === 'reject' && (
              <div>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Findings</Typography>
                <TextField fullWidth size="medium" multiline rows={3} placeholder="Describe the defect found..."
                  value={formData.findings} onChange={(e) => setFormData({...formData, findings: e.target.value})}
                  sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }} />
              </div>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
            <Button onClick={() => setOpen(false)} sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600, px: 3 }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#0f172a', textTransform: 'none', fontWeight: 600, px: 4, borderRadius: 2, '&:hover': { bgcolor: '#334155' } }}>Submit Report</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
