import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
  try {
    let barcode: string = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    // Generate unique barcode
    while (!isUnique && attempts < maxAttempts) {
      // Generate 12-character alphanumeric barcode
      barcode = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();

      // Check uniqueness across Item, Bin, and Shipment models
      const existingItem = await prisma.item.findUnique({ where: { barcode } });
      const existingBin = await prisma.bin.findUnique({ where: { barcode } });
      const existingShipment = await prisma.shipment.findUnique({ where: { barcode } });

      if (!existingItem && !existingBin && !existingShipment) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique barcode after multiple attempts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ barcode });
  } catch (error) {
    console.error('Failed to generate barcode:', error);
    return NextResponse.json(
      { error: 'Failed to generate barcode' },
      { status: 500 }
    );
  }
}
