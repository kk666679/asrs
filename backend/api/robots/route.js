"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const robotics_1 = require("@/lib/services/robotics");
const db_1 = require("@/lib/db");
const roboticsService = new robotics_1.RoboticsService();
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const type = searchParams.get('type');
        const status = searchParams.get('status');
        const zoneId = searchParams.get('zoneId');
        const search = searchParams.get('search');
        const where = {};
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        if (zoneId)
            where.zoneId = zoneId;
        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [robots, total] = await Promise.all([
            db_1.prisma.robot.findMany({
                where,
                include: {
                    zone: { select: { id: true, code: true, name: true } },
                    commands: {
                        where: { status: { in: ['PENDING', 'EXECUTING'] } },
                        select: { id: true, type: true, status: true, priority: true, createdAt: true },
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            db_1.prisma.robot.count({ where }),
        ]);
        return server_1.NextResponse.json({
            robots,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching robots:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { code, name, type, status, location, zoneId, batteryLevel, specifications } = body;
        const existingRobot = await db_1.prisma.robot.findUnique({
            where: { code },
        });
        if (existingRobot) {
            return server_1.NextResponse.json({ error: 'Robot code already exists' }, { status: 409 });
        }
        const robot = await db_1.prisma.robot.create({
            data: {
                code,
                name,
                type,
                status: status || 'IDLE',
                location,
                zoneId,
                batteryLevel: batteryLevel || 100,
                specifications,
            },
            include: {
                zone: { select: { id: true, code: true, name: true } },
            },
        });
        return server_1.NextResponse.json(robot, { status: 201 });
    }
    catch (error) {
        console.error('Error creating robot:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return server_1.NextResponse.json({ error: 'Robot ID required' }, { status: 400 });
        }
        const body = await request.json();
        const robot = await db_1.prisma.robot.update({
            where: { id },
            data: body,
            include: {
                zone: { select: { id: true, code: true, name: true } },
                commands: {
                    where: { status: { in: ['PENDING', 'EXECUTING'] } },
                    select: { id: true, type: true, status: true, priority: true, createdAt: true },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
            },
        });
        return server_1.NextResponse.json(robot);
    }
    catch (error) {
        console.error('Error updating robot:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return server_1.NextResponse.json({ error: 'Robot ID required' }, { status: 400 });
        }
        const activeCommands = await db_1.prisma.robotCommand.count({
            where: {
                robotId: id,
                status: { in: ['PENDING', 'EXECUTING'] },
            },
        });
        if (activeCommands > 0) {
            return server_1.NextResponse.json({ error: 'Cannot delete robot with active commands' }, { status: 409 });
        }
        await db_1.prisma.robot.delete({
            where: { id },
        });
        return server_1.NextResponse.json({ message: 'Robot deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting robot:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map