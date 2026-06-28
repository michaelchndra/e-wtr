export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const defects = await prisma.defectReport.findMany({
      include: {
        wtr: { include: { joint: true } },
        reporter: true,
        resolver: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json(defects);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch defects:', message);
    return NextResponse.json({ error: 'Failed to fetch defects: ' + message }, { status: 500 });
  }
}
