import AdminLayout from '@/components/layout/AdminLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return <AdminLayout session={session}>{children}</AdminLayout>;
}
