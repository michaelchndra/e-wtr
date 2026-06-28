'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Skeleton, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { FileCheck, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [chartPeriod, setChartPeriod] = useState('weekly');

  useEffect(() => {
    fetch(`/api/dashboard?period=${chartPeriod}`)
      .then(res => res.json())
      .then(d => setData(d));
  }, [chartPeriod]);

  if (!data) return <Box sx={{ p: 4 }}><Skeleton variant="rectangular" width="100%" height={400} /></Box>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>
          Dashboard Overview
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
          <div className="flex items-center gap-3 mb-2">
            <FileCheck className="w-5 h-5 text-gray-500" />
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#6b7280' }}>Total WTRs</Typography>
          </div>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>{data.metrics?.totalWTR || 0}</Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#6b7280' }}>Approved WTRs</Typography>
          </div>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>{data.metrics?.approvedWTR || 0}</Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#6b7280' }}>Pending Inspections</Typography>
          </div>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>{data.metrics?.pendingWTR || 0}</Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#6b7280' }}>Defects (Rejected)</Typography>
          </div>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>{data.metrics?.rejectedInspections || 0}</Typography>
        </Paper>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Paper elevation={0} sx={{ p: 4, border: '1px solid #e5e7eb', borderRadius: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                Activity Chart
              </Typography>
              <ToggleButtonGroup
                value={chartPeriod}
                exclusive
                onChange={(e, val) => val && setChartPeriod(val)}
                size="small"
                sx={{ '& .MuiToggleButton-root': { textTransform: 'none' } }}
              >
                <ToggleButton value="daily">Daily</ToggleButton>
                <ToggleButton value="weekly">Weekly</ToggleButton>
                <ToggleButton value="monthly">Monthly</ToggleButton>
              </ToggleButtonGroup>
            </div>
            
            <div className="flex-1 w-full h-full min-h-[250px]">
              {data.chartData && data.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid stroke="#f3f4f6" strokeDasharray="5 5" vertical={false} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="wtrs" name="WTRs Created" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="approved" name="Approved" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No data available for this period.
                </div>
              )}
            </div>
          </Paper>
        </div>

        <div className="lg:col-span-1">
          <Paper elevation={0} sx={{ p: 4, border: '1px solid #e5e7eb', borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 3 }}>
              Recent Activity
            </Typography>
            <div className="space-y-4">
              {data.recentActivity?.map((act: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
                  <div>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                      {act.action}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      {new Date(act.timestamp).toLocaleString()}
                    </Typography>
                  </div>
                </div>
              ))}
              {(!data.recentActivity || data.recentActivity.length === 0) && (
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>No recent activity.</Typography>
              )}
            </div>
          </Paper>
        </div>
      </div>
    </div>
  );
}
