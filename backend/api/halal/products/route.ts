import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createHalalProductSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.enum(['MEAT', 'POULTRY', 'SEAFOOD', 'DAIRY', 'BEVERAGES', 'SNACKS', 'COSMETICS', 'PHARMACEUTICALS', 'SUPPLEMENTS', 'PROCESSED_FOOD']),
  subcategory: z.string().optional(),
  weight: z.number().positive('Weight must be positive'),
  dimensions: z.string().min(1, 'Dimensions are required'),
  sourceCountry: z.string().min(1, 'Source country is required'),
  manufacturerId: z.string().min(1, 'Manufacturer ID is required'),
  halalComplianceScore: z.number().min(0).max(100).optional(),
  isHalalCertified: z.boolean().default(false),
  certificationStatus: z.enum(['VALID', 'EXPIRED', 'PENDING_RENEWAL', 'SUSPENDED', 'REVOKED']).default('PENDING_RENEWAL'),
});

const updateHalalProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.enum(['MEAT', 'POULTRY', 'SEAFOOD', 'DAIRY', 'BEVERAGES', 'SNACKS', 'COSMETICS', 'PHARMACEUTICALS', 'SUPPLEMENTS', 'PROCESSED_FOOD']).optional(),
  subcategory: z.string().optional(),
  weight: z.number().positive().optional(),
  dimensions: z.string().min(1).optional(),
  sourceCountry: z.string().min(1).optional(),
  halalComplianceScore: z.number().min(0).max(100).optional(),
  isHalalCertified: z.boolean().optional(),
  certificationStatus: z.enum(['VALID', 'EXPIRED', 'PENDING_RENEWAL', 'SUSPENDED', 'REVOKED']).optional(),
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  category: z.enum(['MEAT', 'POULTRY', 'SEAFOOD', 'DAIRY', 'BEVERAGES', 'SNACKS', 'COSMETICS', 'PHARMACEUTICALS', 'SUPPLEMENTS', 'PROCESSED_FOOD']).optional(),
  isHalalCertified: z.coerce.boolean().optional(),
  certificationStatus: z.enum(['VALID', 'EXPIRED', 'PENDING_RENEWAL', 'SUSPENDED', 'REVOKED']).optional(),
  manufacturerId: z.string().optional(),
  sortBy: z.enum(['sku', 'name', 'halalComplianceScore', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/halal/products - Retrieve all halal products
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, category, isHalalCertified, certificationStatus, manufacturerId, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (isHalalCertified !== undefined) where.isHalalCertified = isHalalCertified;
    if (certificationStatus) where.certificationStatus = certificationStatus;
    if (manufacturerId) where.manufacturerId = manufacturerId;

    const [products, total] = await Promise.all([
      prisma.halalProduct.findMany({
        where,
        include: {
          manufacturer: { select: { id: true, name: true, country: true } },
          certifications: { select: { id: true, certificateNumber: true, status: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.halalProduct.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching halal products:', error);
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
 * POST /api/halal/products - Create a new halal product
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createHalalProductSchema.parse(body);

    // Check if SKU already exists
    const existingProduct = await prisma.halalProduct.findUnique({
      where: { sku: data.sku },
    });
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product SKU already exists' },
        { status: 409 },
      );
    }

    const product = await prisma.halalProduct.create({
      data,
      include: {
        manufacturer: { select: { id: true, name: true, country: true } },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating halal product:', error);
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
 * PUT /api/halal/products - Update a halal product
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateHalalProductSchema.parse(body);

    const existingProduct = await prisma.halalProduct.findUnique({
      where: { id },
    });
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updatedProduct = await prisma.halalProduct.update({
      where: { id },
      data,
      include: {
        manufacturer: { select: { id: true, name: true, country: true } },
        certifications: { select: { id: true, certificateNumber: true, status: true } },
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating halal product:', error);
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
 * DELETE /api/halal/products - Delete a halal product
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await prisma.halalProduct.findUnique({
      where: { id },
      include: { certifications: true, inventory: true },
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product has active inventory
    if (product.inventory.some(inv => inv.quantityOnHand > 0)) {
      return NextResponse.json(
        { error: 'Cannot delete product with active inventory' },
        { status: 409 },
      );
    }

    await prisma.halalProduct.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting halal product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
