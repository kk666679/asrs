"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const querySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    warehouseId: zod_1.z.string().optional(),
    zoneId: zod_1.z.string().optional(),
    aisleId: zod_1.z.string().optional(),
    rackId: zod_1.z.string().optional(),
    active: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['code', 'name', 'utilization', 'capacity', 'createdAt']).default('code'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { page, limit, warehouseId, zoneId, aisleId, rackId, active, search, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const zonesWhere = {};
        if (warehouseId)
            zonesWhere.warehouseId = warehouseId;
        if (active !== undefined)
            zonesWhere.active = active;
        if (search) {
            zonesWhere.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
                { warehouse: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }
        const [zones, zonesTotal] = await Promise.all([
            prisma.zone.findMany({
                where: zonesWhere,
                include: {
                    warehouse: { select: { code: true, name: true } },
                    aisles: {
                        include: {
                            racks: {
                                include: {
                                    bins: {
                                        select: {
                                            id: true,
                                            capacity: true,
                                            currentLoad: true,
                                            status: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.zone.count({ where: zonesWhere }),
        ]);
        const aislesWhere = {};
        if (zoneId)
            aislesWhere.zoneId = zoneId;
        if (active !== undefined)
            aislesWhere.active = active;
        const [aisles, aislesTotal] = await Promise.all([
            prisma.aisle.findMany({
                where: aislesWhere,
                include: {
                    zone: {
                        include: {
                            warehouse: { select: { code: true, name: true } },
                        },
                    },
                    racks: {
                        include: {
                            bins: {
                                select: {
                                    id: true,
                                    capacity: true,
                                    currentLoad: true,
                                    status: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.aisle.count({ where: aislesWhere }),
        ]);
        const racksWhere = {};
        if (aisleId)
            racksWhere.aisleId = aisleId;
        if (active !== undefined)
            racksWhere.active = active;
        const [racks, racksTotal] = await Promise.all([
            prisma.rack.findMany({
                where: racksWhere,
                include: {
                    aisle: {
                        include: {
                            zone: {
                                include: {
                                    warehouse: { select: { code: true, name: true } },
                                },
                            },
                        },
                    },
                    bins: {
                        select: {
                            id: true,
                            capacity: true,
                            currentLoad: true,
                            status: true,
                        },
                    },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.rack.count({ where: racksWhere }),
        ]);
        const binsWhere = {};
        if (rackId)
            binsWhere.rackId = rackId;
        if (active !== undefined)
            binsWhere.status = active ? 'ACTIVE' : 'INACTIVE';
        const [bins, binsTotal] = await Promise.all([
            prisma.bin.findMany({
                where: binsWhere,
                include: {
                    rack: {
                        include: {
                            aisle: {
                                include: {
                                    zone: {
                                        include: {
                                            warehouse: { select: { code: true, name: true } },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    binItems: {
                        select: {
                            quantity: true,
                        },
                    },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.bin.count({ where: binsWhere }),
        ]);
        const zonesWithUtilization = zones.map(zone => {
            const totalCapacity = zone.aisles.reduce((sum, aisle) => sum + aisle.racks.reduce((rackSum, rack) => rackSum + rack.bins.reduce((binSum, bin) => binSum + bin.capacity, 0), 0), 0);
            const totalOccupied = zone.aisles.reduce((sum, aisle) => sum + aisle.racks.reduce((rackSum, rack) => rackSum + rack.bins.reduce((binSum, bin) => binSum + bin.currentLoad, 0), 0), 0);
            const utilization = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
            return {
                ...zone,
                capacity: totalCapacity,
                occupied: totalOccupied,
                utilization,
            };
        });
        const aislesWithUtilization = aisles.map(aisle => {
            const totalCapacity = aisle.racks.reduce((sum, rack) => sum + rack.bins.reduce((binSum, bin) => binSum + bin.capacity, 0), 0);
            const totalOccupied = aisle.racks.reduce((sum, rack) => sum + rack.bins.reduce((binSum, bin) => binSum + bin.currentLoad, 0), 0);
            const utilization = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
            return {
                ...aisle,
                capacity: totalCapacity,
                occupied: totalOccupied,
                utilization,
            };
        });
        const racksWithUtilization = racks.map(rack => {
            const totalCapacity = rack.bins.reduce((sum, bin) => sum + bin.capacity, 0);
            const totalOccupied = rack.bins.reduce((sum, bin) => sum + bin.currentLoad, 0);
            const utilization = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
            return {
                ...rack,
                capacity: totalCapacity,
                occupied: totalOccupied,
                utilization,
            };
        });
        const binsWithUtilization = bins.map(bin => {
            const utilization = bin.capacity > 0 ? Math.round((bin.currentLoad / bin.capacity) * 100) : 0;
            return {
                ...bin,
                occupied: bin.currentLoad,
                utilization,
            };
        });
        const totalCapacity = bins.reduce((sum, bin) => sum + bin.capacity, 0);
        const totalOccupied = bins.reduce((sum, bin) => sum + bin.currentLoad, 0);
        const overallUtilization = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
        return server_1.NextResponse.json({
            storageTypes: {
                data: zonesWithUtilization,
                pagination: {
                    page,
                    limit,
                    total: zonesTotal,
                    pages: Math.ceil(zonesTotal / limit),
                },
            },
            storageSections: {
                data: aislesWithUtilization,
                pagination: {
                    page,
                    limit,
                    total: aislesTotal,
                    pages: Math.ceil(aislesTotal / limit),
                },
            },
            storageUnits: {
                data: racksWithUtilization,
                pagination: {
                    page,
                    limit,
                    total: racksTotal,
                    pages: Math.ceil(racksTotal / limit),
                },
            },
            storageBins: {
                data: binsWithUtilization,
                pagination: {
                    page,
                    limit,
                    total: binsTotal,
                    pages: Math.ceil(binsTotal / limit),
                },
            },
            summary: {
                totalCapacity,
                totalOccupied,
                overallUtilization,
                activeStorageTypes: zonesWithUtilization.length,
                activeSections: aislesWithUtilization.length,
                activeUnits: racksWithUtilization.length,
                activeBins: binsWithUtilization.filter(b => b.status === 'ACTIVE').length,
            },
        });
    }
    catch (error) {
        console.error('Error fetching storage management data:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { type, ...data } = body;
        let result;
        switch (type) {
            case 'zone':
                const zoneData = zod_1.z.object({
                    code: zod_1.z.string().min(1),
                    name: zod_1.z.string().min(1),
                    temperature: zod_1.z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']),
                    securityLevel: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'RESTRICTED']),
                    warehouseId: zod_1.z.string().min(1),
                }).parse(data);
                const existingZone = await prisma.zone.findFirst({
                    where: { code: zoneData.code },
                });
                if (existingZone) {
                    return server_1.NextResponse.json({ error: 'Zone with this code already exists' }, { status: 409 });
                }
                result = await prisma.zone.create({ data: zoneData });
                break;
            case 'aisle':
                const aisleData = zod_1.z.object({
                    code: zod_1.z.string().min(1),
                    number: zod_1.z.number().min(1),
                    width: zod_1.z.number().min(0),
                    height: zod_1.z.number().min(0),
                    zoneId: zod_1.z.string().min(1),
                }).parse(data);
                const existingAisle = await prisma.aisle.findFirst({
                    where: { code: aisleData.code },
                });
                if (existingAisle) {
                    return server_1.NextResponse.json({ error: 'Aisle with this code already exists' }, { status: 409 });
                }
                result = await prisma.aisle.create({ data: aisleData });
                break;
            case 'rack':
                const rackData = zod_1.z.object({
                    code: zod_1.z.string().min(1),
                    level: zod_1.z.number().min(1),
                    orientation: zod_1.z.enum(['FRONT', 'BACK', 'SIDE']),
                    aisleId: zod_1.z.string().min(1),
                }).parse(data);
                const existingRack = await prisma.rack.findFirst({
                    where: { code: rackData.code },
                });
                if (existingRack) {
                    return server_1.NextResponse.json({ error: 'Rack with this code already exists' }, { status: 409 });
                }
                result = await prisma.rack.create({ data: rackData });
                break;
            case 'bin':
                const binData = zod_1.z.object({
                    code: zod_1.z.string().min(1),
                    capacity: zod_1.z.number().min(0),
                    weightLimit: zod_1.z.number().min(0),
                    rackId: zod_1.z.string().min(1),
                    barcode: zod_1.z.string().optional(),
                }).parse(data);
                const existingBin = await prisma.bin.findFirst({
                    where: { code: binData.code },
                });
                if (existingBin) {
                    return server_1.NextResponse.json({ error: 'Bin with this code already exists' }, { status: 409 });
                }
                result = await prisma.bin.create({ data: binData });
                break;
            default:
                return server_1.NextResponse.json({ error: 'Invalid type. Must be zone, aisle, rack, or bin' }, { status: 400 });
        }
        return server_1.NextResponse.json(result, { status: 201 });
    }
    catch (error) {
        console.error('Error creating storage entity:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const type = searchParams.get('type');
        if (!id || !type) {
            return server_1.NextResponse.json({ error: 'ID and type parameters are required' }, { status: 400 });
        }
        const body = await request.json();
        let result;
        switch (type) {
            case 'zone':
                const zoneData = zod_1.z.object({
                    code: zod_1.z.string().min(1).optional(),
                    name: zod_1.z.string().min(1).optional(),
                    temperature: zod_1.z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']).optional(),
                    securityLevel: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'RESTRICTED']).optional(),
                    warehouseId: zod_1.z.string().min(1).optional(),
                }).partial().parse(body);
                result = await prisma.zone.update({
                    where: { id },
                    data: zoneData,
                });
                break;
            case 'aisle':
                const aisleData = zod_1.z.object({
                    code: zod_1.z.string().min(1).optional(),
                    number: zod_1.z.number().min(1).optional(),
                    width: zod_1.z.number().min(0).optional(),
                    height: zod_1.z.number().min(0).optional(),
                    zoneId: zod_1.z.string().min(1).optional(),
                }).partial().parse(body);
                result = await prisma.aisle.update({
                    where: { id },
                    data: aisleData,
                });
                break;
            case 'rack':
                const rackData = zod_1.z.object({
                    code: zod_1.z.string().min(1).optional(),
                    level: zod_1.z.number().min(1).optional(),
                    orientation: zod_1.z.enum(['FRONT', 'BACK', 'SIDE']).optional(),
                    aisleId: zod_1.z.string().min(1).optional(),
                }).partial().parse(body);
                result = await prisma.rack.update({
                    where: { id },
                    data: rackData,
                });
                break;
            case 'bin':
                const binData = zod_1.z.object({
                    code: zod_1.z.string().min(1).optional(),
                    capacity: zod_1.z.number().min(0).optional(),
                    weightLimit: zod_1.z.number().min(0).optional(),
                    rackId: zod_1.z.string().min(1).optional(),
                    barcode: zod_1.z.string().optional(),
                    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DAMAGED']).optional(),
                }).partial().parse(body);
                result = await prisma.bin.update({
                    where: { id },
                    data: binData,
                });
                break;
            default:
                return server_1.NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
        }
        return server_1.NextResponse.json(result);
    }
    catch (error) {
        console.error('Error updating storage entity:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const type = searchParams.get('type');
        if (!id || !type) {
            return server_1.NextResponse.json({ error: 'ID and type parameters are required' }, { status: 400 });
        }
        switch (type) {
            case 'zone':
                const zoneUsage = await prisma.aisle.findFirst({
                    where: { zoneId: id },
                });
                if (zoneUsage) {
                    return server_1.NextResponse.json({ error: 'Cannot delete zone that contains aisles' }, { status: 409 });
                }
                await prisma.zone.delete({ where: { id } });
                break;
            case 'aisle':
                const aisleUsage = await prisma.rack.findFirst({
                    where: { aisleId: id },
                });
                if (aisleUsage) {
                    return server_1.NextResponse.json({ error: 'Cannot delete aisle that contains racks' }, { status: 409 });
                }
                await prisma.aisle.delete({ where: { id } });
                break;
            case 'rack':
                const rackUsage = await prisma.bin.findFirst({
                    where: { rackId: id },
                });
                if (rackUsage) {
                    return server_1.NextResponse.json({ error: 'Cannot delete rack that contains bins' }, { status: 409 });
                }
                await prisma.rack.delete({ where: { id } });
                break;
            case 'bin':
                const binUsage = await prisma.binItem.findFirst({
                    where: { binId: id },
                });
                if (binUsage) {
                    return server_1.NextResponse.json({ error: 'Cannot delete bin that contains items' }, { status: 409 });
                }
                await prisma.bin.delete({ where: { id } });
                break;
            default:
                return server_1.NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
        }
        return server_1.NextResponse.json({ message: 'Entity deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting storage entity:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map