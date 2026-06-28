import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userRole = session.user.role;
    const userId = Number(session.user.id);

    const { id: paramId } = await params;
    const id = Number(paramId);
    const body = await request.json();
    const { status, remarks } = body;

    const wtr = await prisma.wTR.findUnique({
      where: { id },
      include: { visual_inspection: true }
    });

    if (!wtr) {
      return NextResponse.json({ error: 'WTR not found' }, { status: 404 });
    }

    if (status === 'approved' && wtr.status !== 'approved') {
      if (!['admin', 'supervisor'].includes(userRole)) {
        return NextResponse.json({ error: 'Forbidden. Only Supervisor or Admin can approve WTRs.' }, { status: 403 });
      }
      if (!wtr.visual_inspection_id) {
        return NextResponse.json({ error: 'Cannot approve: Missing Visual Inspection.' }, { status: 400 });
      }
      if (wtr.visual_inspection?.result !== 'accept') {
        return NextResponse.json({ error: 'Cannot approve: Visual Inspection was not accepted.' }, { status: 400 });
      }
    }

    if (status === 'transmitted' && wtr.status !== 'transmitted') {
      if (!['admin', 'document_control'].includes(userRole)) {
        return NextResponse.json({ error: 'Forbidden. Only Document Control or Admin can transmit WTRs.' }, { status: 403 });
      }
      if (wtr.status !== 'approved') {
        return NextResponse.json({ error: 'Cannot transmit: WTR must be approved first.' }, { status: 400 });
      }
    }

    const updatedWtr = await prisma.wTR.update({
      where: { id },
      data: {
        status,
        remarks: remarks || wtr.remarks,
        approved_by: status === 'approved' && wtr.status !== 'approved' ? userId : wtr.approved_by,
        approval_date: status === 'approved' && wtr.status !== 'approved' ? new Date() : wtr.approval_date,
        transmitted_by: status === 'transmitted' && wtr.status !== 'transmitted' ? userId : wtr.transmitted_by,
        transmitted_at: status === 'transmitted' && wtr.status !== 'transmitted' ? new Date() : wtr.transmitted_at,
      },
    });

    await prisma.activityLog.create({
      data: {
        user_id: userId,
        model_type: 'WTR',
        model_id: wtr.id,
        action: `Updated status to ${status}`,
        old_values: JSON.stringify({ status: wtr.status }),
        new_values: JSON.stringify({ status: updatedWtr.status }),
      }
    });

    return NextResponse.json(updatedWtr);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to update WTR:', message);
    return NextResponse.json({ error: 'Failed to update WTR: ' + message }, { status: 500 });
  }
}
