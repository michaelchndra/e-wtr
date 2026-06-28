export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wtrs = await prisma.wTR.findMany({
      where: { status: { in: ['approved', 'transmitted', 'client_accepted', 'client_rejected'] } },
      include: {
        joint: true,
        approver: true,
      },
      orderBy: { updated_at: 'desc' },
    });
    return NextResponse.json(wtrs);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch transmittals: ' + message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const transmitterId = Number(session.user.id);

    const body = await request.json();
    const { wtr_id } = body;

    const wtr = await prisma.wTR.update({
      where: { id: Number(wtr_id) },
      data: {
        status: 'transmitted',
        transmitted_by: transmitterId,
        transmitted_at: new Date(),
      }
    });

    return NextResponse.json(wtr);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to transmit WTR: ' + message }, { status: 500 });
  }
}
