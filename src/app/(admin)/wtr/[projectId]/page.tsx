'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Box, Tabs, Tab } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getSession } from 'next-auth/react';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import FolderIcon from '@mui/icons-material/Folder';

export default function WTRProjectPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const [wtrs, setWtrs] = useState<any[]>([]);
  const [joints, setJoints] = useState<any[]>([]);
  const [projectName, setProjectName] = useState('');
  const [open, setOpen] = useState(false);
  const [userRole, setUserRole] = useState('client');
  const [welders, setWelders] = useState<any[]>([]);
  const [wpsList, setWpsList] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({ wtr_number: '', joint_id: '', project_id: projectId, weld_passes: [] });
  const [activeTab, setActiveTab] = useState(1);

  const fetchData = async () => {
    try {
      const resWtr = await fetch(`/api/wtrs?projectId=${projectId}`);
      const resJoint = await fetch('/api/joints');
      const resProj = await fetch('/api/projects');
      
      if (resWtr.ok) setWtrs(await resWtr.json());
      if (resJoint.ok) setJoints(await resJoint.json());
      
      const resWelders = await fetch('/api/engineering/welders');
      const resWps = await fetch('/api/engineering/wps');
      if (resWelders.ok) setWelders(await resWelders.json());
      if (resWps.ok) setWpsList(await resWps.json());
      if (resProj.ok) {
        const projs = await resProj.json();
        const current = projs.find((p: any) => p.id.toString() === projectId);
        if (current) setProjectName(current.name);
      }
      
      const session = await getSession();
      setUserRole(session?.user?.role || 'client');
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  useEffect(() => {
    if (projectId) fetchData();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/wtrs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, project_id: projectId })
    });
    setOpen(false);
    fetchData();
  };

  const handleApprove = async (id: number) => {
    const res = await fetch(`/api/wtrs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' })
    });
    if (!res.ok) {
      const error = await res.json();
      alert(`Approval Failed: ${error.error}`);
    } else {
      fetchData();
    }
  };

  const columns: GridColDef[] = [
    { field: 'wtr_number', headerName: 'WTR No.', width: 130 },
    { field: 'joint_number', headerName: 'Joint No.', width: 130, valueGetter: (params, row) => row.joint?.joint_number || '-' },
    { field: 'weld_type', headerName: 'Type', width: 100, valueGetter: (params, row) => row.joint?.weld_type || '-' },
    { field: 'material_spec', headerName: 'Material', width: 130, valueGetter: (params, row) => row.joint?.material_spec || '-' },
    { field: 'thickness', headerName: 'Thk', width: 80, valueGetter: (params, row) => row.joint?.thickness || '-' },
    { 
      field: 'welders', 
      headerName: 'Welders', 
      width: 180,
      renderCell: (params) => {
        const passes = params.row.weld_passes || [];
        if (passes.length === 0) return '-';
        return <span className="text-xs">{passes.map((p: any) => `${p.welder?.stamp_no} (${p.pass_type})`).join(', ')}</span>;
      }
    },
    { 
      field: 'wps', 
      headerName: 'WPS', 
      width: 130,
      renderCell: (params) => {
        const passes = params.row.weld_passes || [];
        if (passes.length === 0) return '-';
        const wpsNos = Array.from(new Set(passes.map((p: any) => p.wps?.wps_no).filter(Boolean)));
        return <span className="text-xs">{wpsNos.join(', ')}</span>;
      }
    },
    { 
      field: 'visual', 
      headerName: 'Visual', 
      width: 120,
      renderCell: (params) => {
        const vi = params.row.visual_inspection;
        if (!vi) return <span className="text-gray-400 text-xs">Pending</span>;
        return <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ${vi.result === 'accept' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{vi.result}</span>;
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ${params.row.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {params.row.status}
        </span>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        params.row.status === 'draft' && ['admin', 'supervisor'].includes(userRole) ? (
          <Button size="small" variant="outlined" onClick={() => handleApprove(params.row.id)} sx={{ textTransform: 'none', py: 0, minWidth: 'auto' }}>
            Approve
          </Button>
        ) : null
      )
    }
  ];

  const jointColumns: GridColDef[] = [
    { field: 'joint_number', headerName: 'Joint No.', width: 150 },
    { field: 'weld_type', headerName: 'Weld Type', width: 120 },
    { field: 'material_spec', headerName: 'Material', width: 150 },
    { field: 'thickness', headerName: 'Thickness (mm)', width: 130 },
    { field: 'diameter', headerName: 'Dia (in)', width: 100 },
    { field: 'wps_number', headerName: 'WPS No', width: 150 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <span className="px-2 py-0.5 text-xs font-medium rounded-sm bg-blue-50 text-blue-700 border border-blue-100">
          {params.row.status}
        </span>
      )
    },
  ];

  const ndtColumns: GridColDef[] = [
    { field: 'report_no', headerName: 'Report No.', width: 150 },
    { field: 'type', headerName: 'NDT Type', width: 120 },
    { field: 'date', headerName: 'Inspection Date', width: 150 },
    { field: 'result', headerName: 'Result', width: 120 },
  ];

  const dataGridStyles = {
    border: 'none',
    '& .MuiDataGrid-toolbarContainer': {
      padding: '12px 16px',
      borderBottom: '1px solid #f1f5f9',
      '& .MuiButton-root': { color: '#64748b', textTransform: 'none', fontWeight: 500 }
    },
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: '#f8fafc',
      color: '#334155',
      fontWeight: 600,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: '1px solid #e2e8f0'
    },
    '& .MuiDataGrid-cell': {
      fontSize: '0.875rem',
      color: '#334155',
      borderBottom: '1px solid #f1f5f9'
    },
    '& .MuiDataGrid-row:hover': {
      backgroundColor: '#f8fafc'
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden transition-all">
      {/* Top Header / Breadcrumb area */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <IconButton onClick={() => router.push('/wtr')} size="small" sx={{ color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
            <FolderIcon sx={{ color: '#fff' }} />
          </div>
          <div>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff', lineHeight: 1.2, letterSpacing: '-0.01em' }}>{projectName || 'Loading...'}</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5, fontWeight: 400 }}>Project Workspace Directory</Typography>
          </div>
        </div>
        <div>
          {['admin', 'qc'].includes(userRole) && activeTab === 1 && (
            <Button variant="contained" onClick={() => setOpen(true)} sx={{ bgcolor: '#ffffff', color: '#0f172a', '&:hover': { bgcolor: '#f8fafc' }, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3, py: 1, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              + Create WTR
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-6 pt-2">
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ minHeight: 48, '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', bgcolor: '#2563eb' }, '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 600, fontSize: '0.9rem', color: '#64748b', '&.Mui-selected': { color: '#1e293b' } } }}>
          <Tab label="Isometrics" />
          <Tab label="WTR Records" />
          <Tab label="NDT Reports" />
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-6 bg-slate-50/50">
        {activeTab === 0 && (
          <div className="bg-white h-full border border-gray-200/60 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <DataGrid
              rows={joints}
              columns={jointColumns}
              density="compact"
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, printOptions: { disableToolbarButton: true } } }}
              sx={dataGridStyles}
            />
          </div>
        )}
        {activeTab === 1 && (
          <div className="bg-white h-full border border-gray-200/60 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <DataGrid
              rows={wtrs}
              columns={columns}
              density="compact"
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, printOptions: { disableToolbarButton: true } } }}
              sx={dataGridStyles}
            />
          </div>
        )}
        {activeTab === 2 && (
          <div className="bg-white h-full border border-gray-200/60 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <DataGrid
              rows={[]}
              columns={ndtColumns}
              density="compact"
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, printOptions: { disableToolbarButton: true } } }}
              sx={dataGridStyles}
            />
          </div>
        )}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1rem', borderBottom: '1px solid #e5e7eb', pb: 2, pt: 2 }}>Draft New WTR</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: '20px !important' }} className="space-y-4">
            <div>
              <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: '#475569', display: 'block' }}>Project</Typography>
              <TextField fullWidth size="small" value={projectName} disabled 
                sx={{ '& .MuiInputBase-root': { bgcolor: '#f1f5f9' } }} />
            </div>
            <div>
              <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: '#475569', display: 'block' }}>WTR Number</Typography>
              <TextField fullWidth size="small" placeholder="e.g. WTR-001" required
                value={formData.wtr_number} onChange={(e) => setFormData({...formData, wtr_number: e.target.value})} />
            </div>
            <div>
              <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: '#475569', display: 'block' }}>Select Joint</Typography>
              <TextField fullWidth size="small" select required
                value={formData.joint_id} onChange={(e) => setFormData({...formData, joint_id: e.target.value})}>
                {joints.map(j => (
                  <MenuItem key={j.id} value={j.id}>{j.joint_number}</MenuItem>
                ))}
              </TextField>
            </div>
            
            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>Weld Passes</Typography>
                <Button size="small" onClick={() => setFormData({...formData, weld_passes: [...formData.weld_passes, { welder_id: '', wps_id: '', pass_type: 'root' }]})} sx={{ textTransform: 'none' }}>+ Add Pass</Button>
              </div>
              {formData.weld_passes.map((pass: any, idx: number) => (
                <div key={idx} className="flex gap-2 mb-2 p-2 bg-slate-50 border border-slate-200 rounded">
                  <TextField select size="small" label="Pass" value={pass.pass_type} onChange={e => {
                    const newPasses = [...formData.weld_passes];
                    newPasses[idx].pass_type = e.target.value;
                    setFormData({...formData, weld_passes: newPasses});
                  }} sx={{ minWidth: 80 }}>
                    <MenuItem value="root">Root</MenuItem>
                    <MenuItem value="hot">Hot</MenuItem>
                    <MenuItem value="fill">Fill</MenuItem>
                    <MenuItem value="cap">Cap</MenuItem>
                  </TextField>
                  <TextField select size="small" label="Welder" value={pass.welder_id} onChange={e => {
                    const newPasses = [...formData.weld_passes];
                    newPasses[idx].welder_id = e.target.value;
                    setFormData({...formData, weld_passes: newPasses});
                  }} fullWidth>
                    {welders.map(w => <MenuItem key={w.id} value={w.id}>{w.stamp_no} - {w.name}</MenuItem>)}
                  </TextField>
                  <TextField select size="small" label="WPS" value={pass.wps_id} onChange={e => {
                    const newPasses = [...formData.weld_passes];
                    newPasses[idx].wps_id = e.target.value;
                    setFormData({...formData, weld_passes: newPasses});
                  }} fullWidth>
                    {wpsList.map(w => <MenuItem key={w.id} value={w.id}>{w.wps_no}</MenuItem>)}
                  </TextField>
                  <Button color="error" size="small" onClick={() => {
                    const newPasses = formData.weld_passes.filter((_: any, i: number) => i !== idx);
                    setFormData({...formData, weld_passes: newPasses});
                  }}>X</Button>
                </div>
              ))}
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
            <Button onClick={() => setOpen(false)} sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
            <Button type="submit" variant="contained" disableElevation sx={{ bgcolor: '#0f172a', textTransform: 'none', fontWeight: 600 }}>Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
