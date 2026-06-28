export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'weekly';
    const totalWTR = await prisma.wTR.count();
    const approvedWTR = await prisma.wTR.count({ where: { status: 'approved' } });
    const pendingWTR = await prisma.wTR.count({ where: { status: 'draft' } });
    const totalInspections = await prisma.visualInspection.count();
    const rejectedInspections = await prisma.visualInspection.count({ where: { result: 'reject' } });

    const recentActivity = await prisma.wTR.findMany({
      take: 5,
      orderBy: { updated_at: 'desc' },
      include: { joint: true }
    });

    const now = new Date();
    let startDate = new Date();
    
    if (period === 'daily') {
      startDate.setDate(now.getDate() - 6);
    } else if (period === 'weekly') {
      startDate.setDate(now.getDate() - 28);
    } else if (period === 'monthly') {
      startDate.setMonth(now.getMonth() - 5);
    }
    
    startDate.setHours(0, 0, 0, 0);

    const wtrsInRange = await prisma.wTR.findMany({
      where: {
        created_at: {
          gte: startDate
        }
      },
      select: { created_at: true, status: true }
    });
    
    const chartData = generateChartData(wtrsInRange, period);

    return NextResponse.json({
      metrics: {
        totalWTR,
        approvedWTR,
        pendingWTR,
        totalInspections,
        rejectedInspections,
      },
      chartData,
      recentActivity: recentActivity.map(wtr => ({
        id: wtr.id,
        action: wtr.status === 'approved' ? `Approved WTR ${wtr.wtr_number}` : `Created draft WTR ${wtr.wtr_number}`,
        timestamp: wtr.updated_at.toISOString(),
      }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function generateChartData(wtrs: any[], period: string) {
  const data: Record<string, { wtrs: number, approved: number }> = {};
  const now = new Date();
  
  if (period === 'daily') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      data[label] = { wtrs: 0, approved: 0 };
    }
  } else if (period === 'weekly') {
    for (let i = 3; i >= 0; i--) {
      const label = `Week ${4 - i}`;
      data[label] = { wtrs: 0, approved: 0 };
    }
  } else if (period === 'monthly') {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      data[label] = { wtrs: 0, approved: 0 };
    }
  }

  wtrs.forEach(wtr => {
    const d = new Date(wtr.created_at);
    let label = '';
    
    if (period === 'daily') {
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
      if (diffDays <= 6 && diffDays >= 0) {
        label = d.toLocaleDateString('en-US', { weekday: 'short' });
      }
    } else if (period === 'weekly') {
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
      if (diffDays <= 28 && diffDays >= 0) {
        const weekIdx = 3 - Math.floor(diffDays / 7);
        label = `Week ${weekIdx + 1}`;
      }
    } else if (period === 'monthly') {
      const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
      if (diffMonths <= 5 && diffMonths >= 0) {
        label = d.toLocaleDateString('en-US', { month: 'short' });
      }
    }

    if (label && data[label]) {
      data[label].wtrs += 1;
      if (wtr.status === 'approved') {
        data[label].approved += 1;
      }
    }
  });

  return Object.keys(data).map(key => ({
    label: key,
    ...data[key]
  }));
}
