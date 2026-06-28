'use client';
import { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'qc' });

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setOpen(false);
    setFormData({ name: '', email: '', password: '', role: 'qc' });
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>Users Management</Typography>
        <Button variant="contained" onClick={() => setOpen(true)} sx={{ bgcolor: '#111827', '&:hover': { bgcolor: '#374151' }, textTransform: 'none', boxShadow: 'none' }}>
          + Add User
        </Button>
      </div>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#f9fafb' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {user.role}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 3, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #e5e7eb', pb: 2 }}>Create New User</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: '24px !important' }} className="space-y-5">
            <div>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Full Name</Typography>
              <TextField fullWidth size="medium" placeholder="e.g. John Doe" required
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }} />
            </div>
            <div>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Email Address</Typography>
              <TextField fullWidth size="medium" type="email" placeholder="john@company.com" required
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
                sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }} />
            </div>
            <div>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Password</Typography>
              <TextField fullWidth size="medium" type="password" placeholder="••••••••" required
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} 
                sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }} />
            </div>
            <div>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>Role</Typography>
              <TextField fullWidth size="medium" select required
                value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                sx={{ '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#f8fafc' } }} >
                <MenuItem value="admin">Administrator</MenuItem>
                <MenuItem value="supervisor">QC Supervisor</MenuItem>
                <MenuItem value="document_control">Document Control</MenuItem>
                <MenuItem value="qc">QC Inspector</MenuItem>
                <MenuItem value="client">Client Representative</MenuItem>
              </TextField>
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
            <Button onClick={() => setOpen(false)} sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600, px: 3 }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#0f172a', textTransform: 'none', fontWeight: 600, px: 4, borderRadius: 2, '&:hover': { bgcolor: '#334155' } }}>Save User</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
