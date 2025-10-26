import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barcode } = body;

    if (!barcode) {
      return NextResponse.json(
        { error: 'Barcode is required' },
        { status: 400 }
      );
    }

    // Basic validation rules
    const errors: string[] = [];

    // Check length (12 characters for our system)
    if (barcode.length !== 12) {
      errors.push('Barcode must be exactly 12 characters long');
    }

    // Check if alphanumeric
    if (!/^[A-Z0-9]+$/.test(barcode)) {
      errors.push('Barcode must contain only uppercase letters and numbers');
    }

    // Check if not all zeros or all same character
    if (/^0+$/.test(barcode)) {
      errors.push('Barcode cannot be all zeros');
    }

    if (/^(.)\1+$/.test(barcode)) {
      errors.push('Barcode cannot be all the same character');
    }

    const isValid = errors.length === 0;

    return NextResponse.json({
      valid: isValid,
      errors: isValid ? [] : errors,
      barcode,
    });
  } catch (error) {
    console.error('Failed to validate barcode:', error);
    return NextResponse.json(
      { error: 'Failed to validate barcode' },
      { status: 500 }
    );
  }
}
