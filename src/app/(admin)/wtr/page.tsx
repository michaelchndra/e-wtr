'use client';
import { useState, useEffect } from 'react';
import { Typography, TextField, Card, CardContent, CardActionArea, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import { useRouter } from 'next/navigation';

export default function ProjectSelectionPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          setProjects(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.client_name && p.client_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-gray-200">
        <div>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>WTR - Select Project</Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>Choose a project to view or manage its Weld Traceability Records.</Typography>
        </div>
        <TextField
          size="small"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 300, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f8fafc' } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
            }
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, transition: 'all 0.2s', '&:hover': { borderColor: '#94a3b8', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' } }}>
            <CardActionArea onClick={() => router.push(`/wtr/${project.id}`)} sx={{ p: 2 }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <FolderIcon />
                  </div>
                  <div>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                      {project.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                      Client: {project.client_name || '-'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Location: {project.location || '-'}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#64748b' }}>No projects found</Typography>
        </div>
      )}
    </div>
  );
}
