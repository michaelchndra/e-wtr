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
      where: { status: { in: ['transmitted', 'client_accepted', 'client_rejected'] } },
      include: {
        joint: true,
      },
      orderBy: { transmitted_at: 'desc' },
    });
    return NextResponse.json(wtrs);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch WTRs: ' + message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const clientId = Number(session.user.id);

    const body = await request.json();
    const { wtr_id, status, message } = body; // status = 'client_accepted' or 'client_rejected'

    const wtr = await prisma.wTR.update({
      where: { id: Number(wtr_id) },
      data: { status }
    });

    if (message) {
      await prisma.feedback.create({
        data: {
          wtr_id: wtr.id,
          client_id: clientId,
          wtr_number: wtr.wtr_number,
          message,
          status: status === 'client_rejected' ? 'open' : 'closed',
        }
      });
    }

    return NextResponse.json(wtr);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to submit feedback: ' + message }, { status: 500 });
  }
}
