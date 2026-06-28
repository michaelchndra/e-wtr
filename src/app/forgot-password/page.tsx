'use client';
import { useState, useEffect } from 'react';
import { TextField, Button, Typography, Alert, InputAdornment, CircularProgress } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import Link from 'next/link';
import { LockReset } from '@mui/icons-material';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [bgIndex, setBgIndex] = useState(0);

  const backgrounds = ['/bg-rig.png', '/bg-rig2.png', '/bg-rig3.png'];

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to request reset');
      }

      setStatus('success');
      setMessage(data.message);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      <div className="w-full md:w-[480px] flex flex-col justify-center bg-white px-8 md:px-16 shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-10 relative">
        <div className="w-full max-w-[320px] mx-auto">
          <div className="mb-12 flex items-center gap-3">
            <img src="/logo.png" alt="E-WTR Logo" className="w-10 h-10 object-contain drop-shadow-md" />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', fontSize: '1.4rem' }}>
              E-WTR
            </Typography>
          </div>
          
          <div className="flex items-center gap-2 mb-1">
            <LockReset sx={{ color: '#0f172a' }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>
              Forgot Password
            </Typography>
          </div>
          <Typography variant="body2" sx={{ mb: 6, color: '#64748b' }}>
            Enter your email to receive a reset link
          </Typography>

          {status === 'success' ? (
            <div className="space-y-6">
              <Alert severity="success" sx={{ borderRadius: 1.5, py: 0, '& .MuiAlert-message': { width: '100%' } }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {message}
                </Typography>
              </Alert>
              <Link href="/login" style={{ textDecoration: 'none', display: 'block' }}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  sx={{ 
                    py: 1.5, 
                    borderRadius: '12px', 
                    textTransform: 'none', 
                    fontWeight: 600,
                    borderColor: '#e2e8f0',
                    color: '#0f172a',
                    '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                  }}
                >
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {status === 'error' && (
                <Alert severity="error" sx={{ mb: 4, borderRadius: 1.5, py: 0 }}>{message}</Alert>
              )}
              
              <TextField 
                fullWidth 
                variant="outlined"
                type="email" 
                placeholder="Email Address"
                required
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: { fontSize: '0.95rem' }
                  }
                }}
              />
              
              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                disabled={status === 'loading'}
                sx={{ 
                  mt: 1, 
                  py: 1.5, 
                  bgcolor: '#0f172a', 
                  borderRadius: '12px',
                  '&:hover': { bgcolor: '#334155', transform: 'translateY(-1px)', boxShadow: '0 8px 15px -3px rgba(0,0,0,0.1)' }, 
                  textTransform: 'none', 
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {status === 'loading' ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Send Reset Link'}
              </Button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors" style={{ textDecoration: 'none' }}>
                  &larr; Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="hidden md:flex flex-1 relative bg-slate-900 overflow-hidden">
        {backgrounds.map((bg, idx) => (
          <div 
            key={bg}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${idx === bgIndex ? 'opacity-90' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${bg})` }}
          ></div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
      </div>
    </div>
  );
}
