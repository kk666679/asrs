import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const robots = await prisma.robot.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(robots);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch robots' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const robot = await prisma.robot.create({ data });
    return NextResponse.json(robot, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create robot' }, { status: 500 });
  }
}
