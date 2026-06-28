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
    const systemId = searchParams.get('system_id');

    if (!systemId) {
      return NextResponse.json({ error: 'system_id is required' }, { status: 400 });
    }

    const lines = await prisma.lineNumber.findMany({
      where: { system_id: Number(systemId) },
      include: { isometrics: true },
      orderBy: { line_no: 'asc' },
    });

    return NextResponse.json(lines);
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

    const { line_no, system_id } = await request.json();

    if (!line_no || !system_id) {
      return NextResponse.json({ error: 'line_no and system_id are required' }, { status: 400 });
    }

    const line = await prisma.lineNumber.create({
      data: {
        line_no,
        system_id: Number(system_id)
      }
    });

    return NextResponse.json(line, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
