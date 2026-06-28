export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const wtrs = await prisma.wTR.findMany({
      where: projectId ? { project_id: Number(projectId) } : undefined,
      include: {
        project: true,
        joint: true,
        visual_inspection: true,
        weld_passes: {
          include: { welder: true, wps: true }
        },
        ndt_reports: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json(wtrs);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch WTRs:', message);
    return NextResponse.json({ error: 'Failed to fetch WTRs: ' + message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userRole = session.user.role;
    if (!['admin', 'qc'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden. Only Admin or QC can create WTRs.' }, { status: 403 });
    }

    const body = await request.json();
    const { wtr_number, project_id, joint_id, weld_date, weld_passes } = body;

    if (!wtr_number || !joint_id || !project_id) {
      return NextResponse.json({ error: 'wtr_number, project_id and joint_id are required' }, { status: 400 });
    }

    const wtr = await prisma.wTR.create({
      data: {
        wtr_number,
        project_id: Number(project_id),
        joint_id: Number(joint_id),
        weld_date: weld_date ? new Date(weld_date) : undefined,
        status: 'draft', 
        created_by: Number(session.user.id),
        weld_passes: {
          create: weld_passes ? weld_passes.map((wp: any) => ({
            welder_id: Number(wp.welder_id),
            wps_id: wp.wps_id ? Number(wp.wps_id) : undefined,
            pass_type: wp.pass_type || 'root'
          })) : []
        }
      },
    });

    await prisma.activityLog.create({
      data: {
        user_id: Number(session.user.id),
        model_type: 'WTR',
        model_id: wtr.id,
        action: 'Created',
        new_values: JSON.stringify(wtr),
      }
    });

    return NextResponse.json(wtr, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to create WTR:', message);
    return NextResponse.json({ error: 'Failed to create WTR: ' + message }, { status: 500 });
  }
}
