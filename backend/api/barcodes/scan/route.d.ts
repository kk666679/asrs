import { NextRequest, NextResponse } from 'next/server';
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    item: {
        id: any;
        name: any;
        barcode: any;
        sku: any;
        description: any;
        category: any;
        halalCertified: boolean;
        locations: any;
    };
    message: string;
}>>;
