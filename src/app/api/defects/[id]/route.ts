import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const resolverId = Number(session.user.id);

    const { id } = await params;
    const body = await request.json();
    const { resolution_notes } = body;

    const defect = await prisma.defectReport.update({
      where: { id: Number(id) },
      data: {
        status: 'closed',
        resolution_notes,
        resolved_by: resolverId,
        resolved_at: new Date(),
      }
    });

    return NextResponse.json(defect);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to resolve defect:', message);
    return NextResponse.json({ error: 'Failed to resolve defect: ' + message }, { status: 500 });
  }
}
