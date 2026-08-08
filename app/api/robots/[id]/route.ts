import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const robot = await prisma.robot.findUnique({ where: { id } });
    if (!robot) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(robot);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch robot' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const robot = await prisma.robot.update({ where: { id }, data });
    return NextResponse.json(robot);
  } catch {
    return NextResponse.json({ error: 'Failed to update robot' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.robot.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Failed to delete robot' }, { status: 500 });
  }
}
