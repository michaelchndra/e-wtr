'use client';
import Header from './Header';
import { Toolbar } from '@mui/material';
import { Session } from 'next-auth';

export default function AdminLayout({ children, session }: { children: React.ReactNode, session: Session | null }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa] flex-col">
      <Header session={session} />
      <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8 w-full bg-[#f8fafc]">
        <Toolbar sx={{ height: 64 }} />
        <div className="max-w-[1400px] mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
