'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, ListItemIcon,
  Collapse, CircularProgress, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { 
  Folder, FolderOpen, AccountTree, FormatLineSpacing, Note, 
  Settings, BuildCircle, Add
} from '@mui/icons-material';

export default function HierarchyPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [systems, setSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<any>({ type: '', parentId: null });
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0].id.toString());
          fetchSystems(data[0].id.toString());
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSystems = async (projectId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hierarchy/system?project_id=${projectId}`);
      if (res.ok) {
        setSystems(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (e: any) => {
    const pid = e.target.value;
    setSelectedProjectId(pid);
    fetchSystems(pid);
  };

  const openCreateDialog = (type: string, parentId: string) => {
    setDialogConfig({ type, parentId });
    setFormData({});
    setDialogOpen(true);
  };

  const handleCreateSubmit = async () => {
    let endpoint = '';
    let payload = { ...formData };

    if (dialogConfig.type === 'system') {
      endpoint = '/api/hierarchy/system';
      payload.project_id = selectedProjectId;
    } else if (dialogConfig.type === 'line') {
      endpoint = '/api/hierarchy/line';
      payload.system_id = dialogConfig.parentId;
    } else if (dialogConfig.type === 'isometric') {
      endpoint = '/api/hierarchy/isometric';
      payload.line_id = dialogConfig.parentId;
    } else if (dialogConfig.type === 'spool') {
      endpoint = '/api/hierarchy/spool';
      payload.iso_id = dialogConfig.parentId;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setDialogOpen(false);
        fetchSystems(selectedProjectId);
      } else {
        const { error } = await res.json();
        alert(error);
      }
    } catch (err) {
      alert('Error creating node');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>
          EPC Hierarchy
        </Typography>
        
        <FormControl variant="filled" sx={{ minWidth: 200, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
          <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Select Project</InputLabel>
          <Select
            value={selectedProjectId}
            onChange={handleProjectChange}
            sx={{ color: 'white' }}
          >
            {projects.map((p) => (
              <MenuItem key={p.id} value={p.id.toString()}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ p: 3, backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', minHeight: '60vh' }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountTree /> Project Breakdown Structure
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => openCreateDialog('system', selectedProjectId)}
            disabled={!selectedProjectId}
          >
            Add System
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
        ) : (
          <List>
            {systems.length === 0 && <Typography color="gray" sx={{ p: 2 }}>No systems found for this project.</Typography>}
            {systems.map(sys => (
              <SystemNode key={sys.id} system={sys} openCreateDialog={openCreateDialog} />
            ))}
          </List>
        )}
      </Paper>

      {/* Dynamic Creation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} sx={{ '& .MuiDialog-paper': { backgroundColor: '#1e293b', color: 'white' } }}>
        <DialogTitle>Create New {dialogConfig.type.charAt(0).toUpperCase() + dialogConfig.type.slice(1)}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 400 }}>
          {dialogConfig.type === 'system' && (
            <>
              <TextField label="System Number" fullWidth variant="outlined" 
                value={formData.system_no || ''} onChange={e => setFormData({...formData, system_no: e.target.value})} 
                sx={{ input: { color: 'white' }, label: { color: 'gray' }, fieldset: { borderColor: 'rgba(255,255,255,0.2)' } }}/>
              <TextField label="Description" fullWidth variant="outlined" 
                value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}
                sx={{ input: { color: 'white' }, label: { color: 'gray' }, fieldset: { borderColor: 'rgba(255,255,255,0.2)' } }}/>
            </>
          )}
          {dialogConfig.type === 'line' && (
            <TextField label="Line Number" fullWidth variant="outlined" 
              value={formData.line_no || ''} onChange={e => setFormData({...formData, line_no: e.target.value})}
              sx={{ input: { color: 'white' }, label: { color: 'gray' }, fieldset: { borderColor: 'rgba(255,255,255,0.2)' } }}/>
          )}
          {dialogConfig.type === 'isometric' && (
            <>
              <TextField label="Isometric Number" fullWidth variant="outlined" 
                value={formData.iso_no || ''} onChange={e => setFormData({...formData, iso_no: e.target.value})}
                sx={{ input: { color: 'white' }, label: { color: 'gray' }, fieldset: { borderColor: 'rgba(255,255,255,0.2)' } }}/>
              <TextField label="Revision" fullWidth variant="outlined" 
                value={formData.revision || ''} onChange={e => setFormData({...formData, revision: e.target.value})}
                sx={{ input: { color: 'white' }, label: { color: 'gray' }, fieldset: { borderColor: 'rgba(255,255,255,0.2)' } }}/>
            </>
          )}
          {dialogConfig.type === 'spool' && (
             <TextField label="Spool Number" fullWidth variant="outlined" 
             value={formData.spool_no || ''} onChange={e => setFormData({...formData, spool_no: e.target.value})}
             sx={{ input: { color: 'white' }, label: { color: 'gray' }, fieldset: { borderColor: 'rgba(255,255,255,0.2)' } }}/>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: 'gray' }}>Cancel</Button>
          <Button onClick={handleCreateSubmit} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function SystemNode({ system, openCreateDialog }: { system: any, openCreateDialog: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ListItem sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} secondaryAction={
        <IconButton edge="end" color="primary" onClick={() => openCreateDialog('line', system.id.toString())}><Add /></IconButton>
      }>
        <ListItemIcon sx={{ color: '#0284c7' }}>
          <IconButton onClick={() => setOpen(!open)} sx={{ color: 'inherit', p: 0 }}>
            {open ? <FolderOpen /> : <Folder />}
          </IconButton>
        </ListItemIcon>
        <ListItemText 
          primary={<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>System: {system.system_no}</Typography>} 
          secondary={<Typography variant="body2" color="gray">{system.description || 'No description'}</Typography>} 
          sx={{ color: 'white' }} 
        />
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 4, borderLeft: '1px dashed rgba(255,255,255,0.2)', ml: 2 }}>
          {system.lines?.length === 0 && <Typography color="gray" variant="body2" sx={{ p: 1 }}>No lines attached.</Typography>}
          {system.lines?.map((line: any) => (
            <LineNode key={line.id} line={line} openCreateDialog={openCreateDialog} />
          ))}
        </List>
      </Collapse>
    </>
  );
}

function LineNode({ line, openCreateDialog }: { line: any, openCreateDialog: any }) {
  const [open, setOpen] = useState(false);
  const [isometrics, setIsometrics] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const toggleOpen = async () => {
    if (!open && !loaded) {
      const res = await fetch(`/api/hierarchy/isometric?line_id=${line.id}`);
      if (res.ok) {
        setIsometrics(await res.json());
        setLoaded(true);
      }
    }
    setOpen(!open);
  };

  return (
    <>
      <ListItem sx={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} secondaryAction={
        <IconButton edge="end" color="primary" onClick={() => openCreateDialog('isometric', line.id.toString())}><Add /></IconButton>
      }>
        <ListItemIcon sx={{ color: '#10b981' }}>
          <IconButton onClick={toggleOpen} sx={{ color: 'inherit', p: 0 }}>
            {open ? <FolderOpen /> : <FormatLineSpacing />}
          </IconButton>
        </ListItemIcon>
        <ListItemText 
          primary={<Typography variant="body1">Line: {line.line_no}</Typography>} 
          sx={{ color: 'white' }} 
        />
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 4, borderLeft: '1px dashed rgba(255,255,255,0.2)', ml: 2 }}>
           {loaded && isometrics.length === 0 && <Typography color="gray" variant="body2" sx={{ p: 1 }}>No isometrics attached.</Typography>}
           {isometrics.map(iso => (
             <IsoNode key={iso.id} iso={iso} openCreateDialog={openCreateDialog} />
           ))}
        </List>
      </Collapse>
    </>
  );
}

function IsoNode({ iso, openCreateDialog }: { iso: any, openCreateDialog: any }) {
  const [open, setOpen] = useState(false);
  const [spools, setSpools] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const toggleOpen = async () => {
    if (!open && !loaded) {
      const res = await fetch(`/api/hierarchy/spool?iso_id=${iso.id}`);
      if (res.ok) {
        setSpools(await res.json());
        setLoaded(true);
      }
    }
    setOpen(!open);
  };

  return (
    <>
      <ListItem sx={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} secondaryAction={
        <IconButton edge="end" color="primary" onClick={() => openCreateDialog('spool', iso.id.toString())}><Add /></IconButton>
      }>
        <ListItemIcon sx={{ color: '#f59e0b' }}>
          <IconButton onClick={toggleOpen} sx={{ color: 'inherit', p: 0 }}>
             {open ? <FolderOpen /> : <Note />}
          </IconButton>
        </ListItemIcon>
        <ListItemText 
          primary={<Typography variant="body2">Iso: {iso.iso_no} (Rev {iso.revision})</Typography>} 
          sx={{ color: 'white' }} 
        />
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 4, borderLeft: '1px dashed rgba(255,255,255,0.2)', ml: 2 }}>
           {loaded && spools.length === 0 && <Typography color="gray" variant="body2" sx={{ p: 1 }}>No spools attached.</Typography>}
           {spools.map(sp => (
             <SpoolNode key={sp.id} spool={sp} />
           ))}
        </List>
      </Collapse>
    </>
  );
}

function SpoolNode({ spool }: { spool: any }) {
  return (
    <ListItem>
      <ListItemIcon sx={{ color: '#8b5cf6' }}>
        <Settings sx={{ fontSize: 18 }} />
      </ListItemIcon>
      <ListItemText 
        primary={<Typography variant="body2">Spool: {spool.spool_no}</Typography>} 
        secondary={<Typography variant="caption" color="gray">{spool.joints?.length || 0} Joints mapped</Typography>}
        sx={{ color: 'white' }} 
      />
    </ListItem>
  );
}
