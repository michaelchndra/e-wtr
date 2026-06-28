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
    const lineId = searchParams.get('line_id');

    if (!lineId) {
      return NextResponse.json({ error: 'line_id is required' }, { status: 400 });
    }

    const isometrics = await prisma.isometric.findMany({
      where: { line_id: Number(lineId) },
      include: { spools: true },
      orderBy: { iso_no: 'asc' },
    });

    return NextResponse.json(isometrics);
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

    const { iso_no, revision, line_id } = await request.json();

    if (!iso_no || !line_id) {
      return NextResponse.json({ error: 'iso_no and line_id are required' }, { status: 400 });
    }

    const isometric = await prisma.isometric.create({
      data: {
        iso_no,
        revision: revision || '0',
        line_id: Number(line_id)
      }
    });

    return NextResponse.json(isometric, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
