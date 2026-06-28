'use client';
import { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';

export default function NDTPage() {
  const [ndts, setNdts] = useState<any[]>([]);
  const [wtrs, setWtrs] = useState<any[]>([]);
  const [openSchedule, setOpenSchedule] = useState(false);
  const [openResult, setOpenResult] = useState(false);
  const [selectedNdt, setSelectedNdt] = useState<number | null>(null);
  const [formData, setFormData] = useState({ wtr_id: '', scheduled_date: '', notes: '' });
  const [resultData, setResultData] = useState({ status: 'passed', notes: '' });

  const fetchData = async () => {
    const res = await fetch('/api/ndt');
    setNdts(await res.json());
    
    const resWtr = await fetch('/api/wtrs');
    const wtrData = await resWtr.json();
    setWtrs(wtrData.filter((w: any) => w.visual_inspection?.result === 'accept'));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/ndt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setOpenSchedule(false);
    fetchData();
  };

  const handleResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNdt) return;

    await fetch(`/api/ndt/${selectedNdt}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultData)
    });
    setOpenResult(false);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>Non-Destructive Testing (NDT)</Typography>
        <Button variant="contained" onClick={() => setOpenSchedule(true)} sx={{ bgcolor: '#111827', '&:hover': { bgcolor: '#374151' }, textTransform: 'none', boxShadow: 'none' }}>
          + Schedule NDT
        </Button>
      </div>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#f9fafb' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Scheduled Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>WTR Number</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Notes</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ndts.map((ndt) => (
              <TableRow key={ndt.id}>
                <TableCell>{new Date(ndt.scheduled_date).toLocaleDateString()}</TableCell>
                <TableCell>{ndt.wtr?.wtr_number}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${ndt.status === 'passed' ? 'bg-green-100 text-green-700' : ndt.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {ndt.status.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>{ndt.notes}</TableCell>
                <TableCell>
                  {ndt.status === 'scheduled' && (
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => { setSelectedNdt(ndt.id); setOpenResult(true); }}
                      sx={{ textTransform: 'none' }}
                    >
                      Update Result
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openSchedule} onClose={() => setOpenSchedule(false)} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 3, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #e5e7eb', pb: 2 }}>Schedule NDT</DialogTitle>
        <form onSubmit={handleSchedule}>
          <DialogContent sx={{ pt: '24px !important' }} className="space-y-5">
            <div>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Select WTR (Visual Passed)</Typography>
              <TextField fullWidth size="medium" select required
                value={formData.wtr_id} onChange={(e) => setFormData({...formData, wtr_id: e.target.value})}
                sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }} >
                {wtrs.map(w => (
                  <MenuItem key={w.id} value={w.id}>{w.wtr_number}</MenuItem>
                ))}
              </TextField>
            </div>
            <div>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Scheduled Date</Typography>
              <TextField fullWidth size="medium" type="date" required
                value={formData.scheduled_date} onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }} />
            </div>
            <div>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Notes / Type (e.g. RT 10%)</Typography>
              <TextField fullWidth size="medium" placeholder="RT, UT, MT, PT..."
                value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
                sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }} />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
            <Button onClick={() => setOpenSchedule(false)} sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600, px: 3 }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#0f172a', textTransform: 'none', fontWeight: 600, px: 4, borderRadius: 2, '&:hover': { bgcolor: '#334155' } }}>Schedule</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openResult} onClose={() => setOpenResult(false)} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 3, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #e5e7eb', pb: 2 }}>Update NDT Result</DialogTitle>
        <form onSubmit={handleResult}>
          <DialogContent sx={{ pt: '24px !important' }} className="space-y-5">
            <div>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Result</Typography>
              <TextField fullWidth size="medium" select required
                value={resultData.status} onChange={(e) => setResultData({...resultData, status: e.target.value})}
                sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }} >
                <MenuItem value="passed">Passed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </TextField>
            </div>
            <div>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Findings / Notes</Typography>
              <TextField fullWidth size="medium" multiline rows={3} placeholder="Add any specific defect findings or film numbers..."
                value={resultData.notes} onChange={(e) => setResultData({...resultData, notes: e.target.value})}
                sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }} />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
            <Button onClick={() => setOpenResult(false)} sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600, px: 3 }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#0f172a', textTransform: 'none', fontWeight: 600, px: 4, borderRadius: 2, '&:hover': { bgcolor: '#334155' } }}>Save Result</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
