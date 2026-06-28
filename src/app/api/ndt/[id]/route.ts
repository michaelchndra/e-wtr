import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, inspector_id, notes } = body;

    const ndt = await prisma.inspectionSchedule.update({
      where: { id: Number(id) },
      data: {
        status, // 'passed' or 'failed'
        inspector_id: inspector_id ? Number(inspector_id) : 1, // fallback
        notes,
      }
    });

    if (status === 'failed') {
      await prisma.defectReport.create({
        data: {
          wtr_id: ndt.wtr_id,
          reporter_id: ndt.inspector_id || 1,
          defect_type: 'ndt_defect',
          severity: 'major',
          description: notes || 'NDT failed.',
        }
      });
    }

    return NextResponse.json(ndt);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update NDT' }, { status: 500 });
  }
}
