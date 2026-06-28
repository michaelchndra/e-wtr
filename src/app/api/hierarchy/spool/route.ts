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
    const isoId = searchParams.get('iso_id');

    if (!isoId) {
      return NextResponse.json({ error: 'iso_id is required' }, { status: 400 });
    }

    const spools = await prisma.spool.findMany({
      where: { iso_id: Number(isoId) },
      include: { joints: true },
      orderBy: { spool_no: 'asc' },
    });

    return NextResponse.json(spools);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userRole = session.user.role;
    if (!['admin', 'engineering'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { spool_no, iso_id } = await request.json();

    if (!spool_no || !iso_id) {
      return NextResponse.json({ error: 'spool_no and iso_id are required' }, { status: 400 });
    }

    const spool = await prisma.spool.create({
      data: {
        spool_no,
        iso_id: Number(iso_id)
      }
    });

    return NextResponse.json(spool, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
