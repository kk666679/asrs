import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  warehouseId: z.string().optional(),
  zoneId: z.string().optional(),
  aisleId: z.string().optional(),
  rackId: z.string().optional(),
  active: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['code', 'name', 'utilization', 'capacity', 'createdAt']).default('code'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * GET /api/storage-management - Retrieve storage management data
 * Query parameters: page, limit, warehouseId, zoneId, aisleId, rackId, active, search, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, warehouseId, zoneId, aisleId, rackId, active, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Get zones (acting as storage types)
    const zonesWhere: any = {};
    if (warehouseId) zonesWhere.warehouseId = warehouseId;
    if (active !== undefined) zonesWhere.active = active;
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

    // Get aisles (acting as storage sections)
    const aislesWhere: any = {};
    if (zoneId) aislesWhere.zoneId = zoneId;
    if (active !== undefined) aislesWhere.active = active;

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

    // Get racks (acting as storage units)
    const racksWhere: any = {};
    if (aisleId) racksWhere.aisleId = aisleId;
    if (active !== undefined) racksWhere.active = active;

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

    // Get bins
    const binsWhere: any = {};
    if (rackId) binsWhere.rackId = rackId;
    if (active !== undefined) binsWhere.status = active ? 'ACTIVE' : 'INACTIVE';

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

    // Calculate utilization for each entity
    const zonesWithUtilization = zones.map(zone => {
      const totalCapacity = zone.aisles.reduce((sum, aisle) =>
        sum + aisle.racks.reduce((rackSum, rack) =>
          rackSum + rack.bins.reduce((binSum, bin) => binSum + bin.capacity, 0), 0), 0);
      const totalOccupied = zone.aisles.reduce((sum, aisle) =>
        sum + aisle.racks.reduce((rackSum, rack) =>
          rackSum + rack.bins.reduce((binSum, bin) => binSum + bin.currentLoad, 0), 0), 0);
      const utilization = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

      return {
        ...zone,
        capacity: totalCapacity,
        occupied: totalOccupied,
        utilization,
      };
    });

    const aislesWithUtilization = aisles.map(aisle => {
      const totalCapacity = aisle.racks.reduce((sum, rack) =>
        sum + rack.bins.reduce((binSum, bin) => binSum + bin.capacity, 0), 0);
      const totalOccupied = aisle.racks.reduce((sum, rack) =>
        sum + rack.bins.reduce((binSum, bin) => binSum + bin.currentLoad, 0), 0);
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

    // Calculate overall utilization
    const totalCapacity = bins.reduce((sum, bin) => sum + bin.capacity, 0);
    const totalOccupied = bins.reduce((sum, bin) => sum + bin.currentLoad, 0);
    const overallUtilization = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

    return NextResponse.json({
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
  } catch (error) {
    console.error('Error fetching storage management data:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/storage-management - Create storage entities
 * Body should include type: 'zone', 'aisle', 'rack', or 'bin'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    let result;
    switch (type) {
      case 'zone':
        const zoneData = z.object({
          code: z.string().min(1),
          name: z.string().min(1),
          temperature: z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']),
          securityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'RESTRICTED']),
          warehouseId: z.string().min(1),
        }).parse(data);

        // Check if zone code already exists
        const existingZone = await prisma.zone.findFirst({
          where: { code: zoneData.code },
        });
        if (existingZone) {
          return NextResponse.json(
            { error: 'Zone with this code already exists' },
            { status: 409 },
          );
        }

        result = await prisma.zone.create({ data: zoneData });
        break;

      case 'aisle':
        const aisleData = z.object({
          code: z.string().min(1),
          number: z.number().min(1),
          width: z.number().min(0),
          height: z.number().min(0),
          zoneId: z.string().min(1),
        }).parse(data);

        // Check if aisle code already exists
        const existingAisle = await prisma.aisle.findFirst({
          where: { code: aisleData.code },
        });
        if (existingAisle) {
          return NextResponse.json(
            { error: 'Aisle with this code already exists' },
            { status: 409 },
          );
        }

        result = await prisma.aisle.create({ data: aisleData });
        break;

      case 'rack':
        const rackData = z.object({
          code: z.string().min(1),
          level: z.number().min(1),
          orientation: z.enum(['FRONT', 'BACK', 'SIDE']),
          aisleId: z.string().min(1),
        }).parse(data);

        // Check if rack code already exists
        const existingRack = await prisma.rack.findFirst({
          where: { code: rackData.code },
        });
        if (existingRack) {
          return NextResponse.json(
            { error: 'Rack with this code already exists' },
            { status: 409 },
          );
        }

        result = await prisma.rack.create({ data: rackData });
        break;

      case 'bin':
        const binData = z.object({
          code: z.string().min(1),
          capacity: z.number().min(0),
          weightLimit: z.number().min(0),
          rackId: z.string().min(1),
          barcode: z.string().optional(),
        }).parse(data);

        // Check if bin code already exists
        const existingBin = await prisma.bin.findFirst({
          where: { code: binData.code },
        });
        if (existingBin) {
          return NextResponse.json(
            { error: 'Bin with this code already exists' },
            { status: 409 },
          );
        }

        result = await prisma.bin.create({ data: binData });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be zone, aisle, rack, or bin' },
          { status: 400 },
        );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating storage entity:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/storage-management - Update storage entities
 * Query params: id, type (zone, aisle, rack, bin)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json(
        { error: 'ID and type parameters are required' },
        { status: 400 },
      );
    }

    const body = await request.json();

    let result;
    switch (type) {
      case 'zone':
        const zoneData = z.object({
          code: z.string().min(1).optional(),
          name: z.string().min(1).optional(),
          temperature: z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']).optional(),
          securityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'RESTRICTED']).optional(),
          warehouseId: z.string().min(1).optional(),
        }).partial().parse(body);

        result = await prisma.zone.update({
          where: { id },
          data: zoneData,
        });
        break;

      case 'aisle':
        const aisleData = z.object({
          code: z.string().min(1).optional(),
          number: z.number().min(1).optional(),
          width: z.number().min(0).optional(),
          height: z.number().min(0).optional(),
          zoneId: z.string().min(1).optional(),
        }).partial().parse(body);

        result = await prisma.aisle.update({
          where: { id },
          data: aisleData,
        });
        break;

      case 'rack':
        const rackData = z.object({
          code: z.string().min(1).optional(),
          level: z.number().min(1).optional(),
          orientation: z.enum(['FRONT', 'BACK', 'SIDE']).optional(),
          aisleId: z.string().min(1).optional(),
        }).partial().parse(body);

        result = await prisma.rack.update({
          where: { id },
          data: rackData,
        });
        break;

      case 'bin':
        const binData = z.object({
          code: z.string().min(1).optional(),
          capacity: z.number().min(0).optional(),
          weightLimit: z.number().min(0).optional(),
          rackId: z.string().min(1).optional(),
          barcode: z.string().optional(),
          status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DAMAGED']).optional(),
        }).partial().parse(body);

        result = await prisma.bin.update({
          where: { id },
          data: binData,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 },
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating storage entity:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/storage-management - Delete storage entities
 * Query params: id, type (zone, aisle, rack, bin)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json(
        { error: 'ID and type parameters are required' },
        { status: 400 },
      );
    }

    switch (type) {
      case 'zone':
        // Check if zone has aisles
        const zoneUsage = await prisma.aisle.findFirst({
          where: { zoneId: id },
        });
        if (zoneUsage) {
          return NextResponse.json(
            { error: 'Cannot delete zone that contains aisles' },
            { status: 409 },
          );
        }
        await prisma.zone.delete({ where: { id } });
        break;

      case 'aisle':
        // Check if aisle has racks
        const aisleUsage = await prisma.rack.findFirst({
          where: { aisleId: id },
        });
        if (aisleUsage) {
          return NextResponse.json(
            { error: 'Cannot delete aisle that contains racks' },
            { status: 409 },
          );
        }
        await prisma.aisle.delete({ where: { id } });
        break;

      case 'rack':
        // Check if rack has bins
        const rackUsage = await prisma.bin.findFirst({
          where: { rackId: id },
        });
        if (rackUsage) {
          return NextResponse.json(
            { error: 'Cannot delete rack that contains bins' },
            { status: 409 },
          );
        }
        await prisma.rack.delete({ where: { id } });
        break;

      case 'bin':
        // Check if bin has items
        const binUsage = await prisma.binItem.findFirst({
          where: { binId: id },
        });
        if (binUsage) {
          return NextResponse.json(
            { error: 'Cannot delete bin that contains items' },
            { status: 409 },
          );
        }
        await prisma.bin.delete({ where: { id } });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 },
        );
    }

    return NextResponse.json({ message: 'Entity deleted successfully' });
  } catch (error) {
    console.error('Error deleting storage entity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
