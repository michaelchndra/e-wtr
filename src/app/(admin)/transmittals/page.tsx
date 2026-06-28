'use client';
import { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

export default function TransmittalsPage() {
  const [wtrs, setWtrs] = useState<any[]>([]);

  const fetchTransmittals = async () => {
    const res = await fetch('/api/transmittals');
    setWtrs(await res.json());
  };

  useEffect(() => {
    fetchTransmittals();
  }, []);

  const handleTransmit = async (id: number) => {
    await fetch('/api/transmittals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wtr_id: id })
    });
    fetchTransmittals();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>Document Transmittals</Typography>
      </div>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#f9fafb' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>WTR Number</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Joint Number</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Approved By</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {wtrs.map((wtr) => (
              <TableRow key={wtr.id}>
                <TableCell>{wtr.wtr_number}</TableCell>
                <TableCell>{wtr.joint?.joint_number}</TableCell>
                <TableCell>{wtr.approver?.name || 'Supervisor'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${wtr.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {wtr.status.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>
                  {wtr.status === 'approved' && (
                    <Button 
                      size="small" 
                      variant="contained" 
                      onClick={() => handleTransmit(wtr.id)}
                      sx={{ bgcolor: '#111827', '&:hover': { bgcolor: '#374151' }, textTransform: 'none' }}
                    >
                      Transmit to Client
                    </Button>
                  )}
                  {wtr.status !== 'approved' && (
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      Transmitted on {new Date(wtr.transmitted_at).toLocaleDateString()}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
