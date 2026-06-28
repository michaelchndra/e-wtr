export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ndts = await prisma.inspectionSchedule.findMany({
      where: { type: 'ndt' },
      include: {
        wtr: { include: { joint: true } },
        inspector: true,
      },
      orderBy: { scheduled_date: 'desc' },
    });
    return NextResponse.json(ndts);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch NDTs:', message);
    return NextResponse.json({ error: 'Failed to fetch NDTs: ' + message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { wtr_id, scheduled_date, notes } = body;

    const ndt = await prisma.inspectionSchedule.create({
      data: {
        wtr_id: Number(wtr_id),
        type: 'ndt',
        status: 'scheduled',
        scheduled_date: new Date(scheduled_date),
        notes,
      },
    });

    return NextResponse.json(ndt, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to schedule NDT: ' + message }, { status: 500 });
  }
}
