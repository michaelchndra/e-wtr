export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const inspectorId = Number(session.user.id);

    const body = await request.json();
    const { wtr_id, inspection_date, result, findings } = body;

    if (!wtr_id || !inspection_date || !result) {
      return NextResponse.json({ error: 'wtr_id, inspection_date, result are required' }, { status: 400 });
    }

    const wtr = await prisma.wTR.findUnique({
      where: { id: Number(wtr_id) }
    });

    if (!wtr) {
      return NextResponse.json({ error: 'WTR not found' }, { status: 404 });
    }

    const inspection = await prisma.visualInspection.create({
      data: {
        joint_id: wtr.joint_id,
        inspector_id: inspectorId,
        inspection_date: new Date(inspection_date),
        result,
        findings,
      },
    });

    await prisma.wTR.update({
      where: { id: wtr.id },
      data: { visual_inspection_id: inspection.id }
    });

    if (result === 'reject') {
      await prisma.defectReport.create({
        data: {
          wtr_id: wtr.id,
          reporter_id: inspectorId,
          defect_type: 'welding_defect',
          severity: 'major',
          description: findings || 'Visual Inspection failed.',
        }
      });
    }

    return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to create inspection:', message);
    return NextResponse.json({ error: 'Failed to create inspection: ' + message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const inspections = await prisma.visualInspection.findMany({
      include: {
        joint: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json(inspections);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch inspections: ' + message }, { status: 500 });
  }
}
