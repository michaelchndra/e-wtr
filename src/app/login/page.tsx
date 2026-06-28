'use client';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Typography, TextField, Button, Alert, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const router = useRouter();

  const backgrounds = ['/bg-rig.png', '/bg-rig2.png', '/bg-rig3.png'];

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError('Invalid username or password');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
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
          
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: '#111827' }}>
            Sign In To Portal
          </Typography>
          <Typography variant="body2" sx={{ mb: 5, color: '#64748b' }}>
            Project Control Management System
          </Typography>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <TextField 
              fullWidth 
              variant="outlined"
              type="email" 
              placeholder="Username or Email"
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
            
            <TextField 
              fullWidth 
              variant="outlined"
              type={showPassword ? 'text' : 'password'} 
              placeholder="Password"
              required
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { fontSize: '0.95rem' }
                }
              }}
            />
            
            <div className="flex justify-end -mt-2">
              <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
                <Typography variant="caption" sx={{ color: '#0284c7', cursor: 'pointer', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}>
                  Forgot Password?
                </Typography>
              </Link>
            </div>
            
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              disabled={loading}
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
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign In'}
            </Button>
          </form>
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
