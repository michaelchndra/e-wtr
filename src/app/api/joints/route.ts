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
    const status = searchParams.get('status');

    const joints = await prisma.jointTemplate.findMany({
      where: status ? { status } : undefined,
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(joints);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch joints:', message);
    return NextResponse.json({ error: 'Failed to fetch joints: ' + message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userRole = session.user.role;
    if (!['admin', 'qc', 'engineering'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { joint_number, weld_type, material_spec, thickness, diameter, wps_number } = body;

    if (!joint_number || !weld_type || thickness == null) {
      return NextResponse.json({ error: 'Missing required fields (joint_number, weld_type, thickness)' }, { status: 400 });
    }

    const joint = await prisma.jointTemplate.create({
      data: {
        joint_number,
        weld_type,
        material_spec,
        thickness,
        diameter,
        wps_number,
      },
    });

    return NextResponse.json(joint, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to create joint:', message);
    return NextResponse.json({ error: 'Failed to create joint: ' + message }, { status: 500 });
  }
}
