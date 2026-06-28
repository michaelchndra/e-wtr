'use client';
import { useState, Suspense, useEffect } from 'react';
import { TextField, Button, Typography, Alert, IconButton, InputAdornment } from '@mui/material';
import { LockReset, Visibility, VisibilityOff } from '@mui/icons-material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing reset token.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters long');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setStatus('success');
      setMessage(data.message);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong');
    }
  };

  return (
    <>
      <div className="w-full max-w-[320px] mx-auto">
        {/* Logo Area */}
        <div className="mb-12 flex items-center gap-3">
          <img src="/logo.png" alt="E-WTR Logo" className="w-10 h-10 object-contain drop-shadow-md" />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', fontSize: '1.4rem' }}>
            E-WTR
          </Typography>
        </div>
        
        <div className="flex items-center gap-2 mb-1">
          <LockReset sx={{ color: '#0f172a' }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>
            Set New Password
          </Typography>
        </div>
        <Typography variant="body2" sx={{ mb: 6, color: '#64748b' }}>
          Enter your new password to regain access
        </Typography>

        {!token ? (
          <div className="space-y-6">
            <Alert severity="error" sx={{ borderRadius: 1.5, py: 0 }}>
              Missing reset token. Please use the link sent to your email.
            </Alert>
            <Link href="/login" style={{ textDecoration: 'none', display: 'block' }}>
              <Button fullWidth variant="outlined" sx={{ py: 1.5, borderRadius: '50px', textTransform: 'none', fontWeight: 600 }}>
                Back to Login
              </Button>
            </Link>
          </div>
        ) : status === 'success' ? (
          <div className="space-y-6">
            <Alert severity="success" sx={{ borderRadius: 1.5, py: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {message}
              </Typography>
            </Alert>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={() => router.push('/login')}
              sx={{ py: 1.5, borderRadius: '50px', bgcolor: '#0f172a', '&:hover': { bgcolor: '#334155' }, textTransform: 'none', fontWeight: 600 }}
            >
              Continue to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 1.5, py: 0 }}>{message}</Alert>
            )}
            
            <TextField
              fullWidth
              variant="standard"
              placeholder="New Password (Min 8 chars)"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20, mb: 0.5 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ mb: 0.5 }}>
                        {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { pb: 1, fontSize: '0.95rem' }
                }
              }}
            />

            <TextField
              fullWidth
              variant="standard"
              placeholder="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20, mb: 0.5 }} />
                    </InputAdornment>
                  ),
                  sx: { pb: 1, fontSize: '0.95rem' }
                }
              }}
            />
            
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              disabled={status === 'loading'}
              sx={{ 
                mt: 4, 
                py: 1.5, 
                bgcolor: '#0f172a', 
                borderRadius: '50px',
                '&:hover': { bgcolor: '#334155', transform: 'translateY(-1px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }, 
                textTransform: 'none', 
                fontWeight: 600,
                fontSize: '0.95rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {status === 'loading' ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  const [bgIndex, setBgIndex] = useState(0);
  const backgrounds = ['/bg-rig.png', '/bg-rig2.png', '/bg-rig3.png'];

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Aside (Form) */}
      <div className="w-full md:w-[480px] flex flex-col justify-center bg-white px-8 md:px-16 shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-10 relative">
        <Suspense fallback={<div className="w-full max-w-[320px] mx-auto text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>

      {/* Right Aside (Background Carousel) */}
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
