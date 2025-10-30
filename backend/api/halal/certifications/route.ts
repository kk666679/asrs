import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createCertificationSchema = z.object({
  certificateNumber: z.string().min(1, 'Certificate number is required'),
  productId: z.string().min(1, 'Product ID is required'),
  certificationBodyId: z.string().min(1, 'Certification body ID is required'),
  issueDate: z.string(),
  expiryDate: z.string(),
  complianceScore: z.number().min(0).max(100).optional(),
});

const updateCertificationSchema = z.object({
  status: z.enum(['VALID', 'EXPIRED', 'PENDING_RENEWAL', 'SUSPENDED', 'REVOKED']).optional(),
  complianceScore: z.number().min(0).max(100).optional(),
  renewalNotified: z.boolean().optional(),
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  productId: z.string().optional(),
  certificationBodyId: z.string().optional(),
  status: z.enum(['VALID', 'EXPIRED', 'PENDING_RENEWAL', 'SUSPENDED', 'REVOKED']).optional(),
  sortBy: z.enum(['certificateNumber', 'issueDate', 'expiryDate']).default('issueDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/halal/certifications - Retrieve all halal certifications
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, productId, certificationBodyId, status, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId) where.productId = productId;
    if (certificationBodyId) where.certificationBodyId = certificationBodyId;
    if (status) where.status = status;

    const [certifications, total] = await Promise.all([
      prisma.halalCertification.findMany({
        where,
        include: {
          product: { select: { id: true, sku: true, name: true } },
          certificationBody: { select: { id: true, name: true, country: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.halalCertification.count({ where }),
    ]);

    return NextResponse.json({
      certifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching certifications:', error);
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
 * POST /api/halal/certifications - Create a new halal certification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createCertificationSchema.parse(body);

    // Check if certificate number already exists
    const existingCert = await prisma.halalCertification.findUnique({
      where: { certificateNumber: data.certificateNumber },
    });
    if (existingCert) {
      return NextResponse.json(
        { error: 'Certificate number already exists' },
        { status: 409 },
      );
    }

    const certification = await prisma.halalCertification.create({
      data: {
        ...data,
        issueDate: new Date(data.issueDate),
        expiryDate: new Date(data.expiryDate),
      },
      include: {
        product: { select: { id: true, sku: true, name: true } },
        certificationBody: { select: { id: true, name: true, country: true } },
      },
    });

    return NextResponse.json(certification, { status: 201 });
  } catch (error) {
    console.error('Error creating certification:', error);
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
 * PUT /api/halal/certifications - Update a halal certification
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Certification ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateCertificationSchema.parse(body);

    const existingCert = await prisma.halalCertification.findUnique({
      where: { id },
    });
    if (!existingCert) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    const updatedCert = await prisma.halalCertification.update({
      where: { id },
      data,
      include: {
        product: { select: { id: true, sku: true, name: true } },
        certificationBody: { select: { id: true, name: true, country: true } },
      },
    });

    return NextResponse.json(updatedCert);
  } catch (error) {
    console.error('Error updating certification:', error);
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
 * DELETE /api/halal/certifications - Delete a halal certification
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Certification ID is required' }, { status: 400 });
    }

    const cert = await prisma.halalCertification.findUnique({
      where: { id },
    });
    if (!cert) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    await prisma.halalCertification.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Certification deleted successfully' });
  } catch (error) {
    console.error('Error deleting certification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
