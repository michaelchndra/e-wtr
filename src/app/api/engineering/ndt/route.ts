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
    const wtrId = searchParams.get('wtr_id');

    const ndtReports = await prisma.nDTReport.findMany({
      where: wtrId ? { wtr_id: Number(wtrId) } : undefined,
      include: { wtr: true },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(ndtReports);
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
    if (!['admin', 'qc'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { wtr_id, method, report_no, result, date, remarks } = await request.json();

    if (!wtr_id || !method || !report_no || !result || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ndt = await prisma.nDTReport.create({
      data: {
        wtr_id: Number(wtr_id),
        method,
        report_no,
        result,
        date: new Date(date),
        remarks
      }
    });

    return NextResponse.json(ndt, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
