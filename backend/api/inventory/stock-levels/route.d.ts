import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    inventory: any;
    pagination: {
        page: number;
        limit: number;
        total: any;
        pages: number;
    };
}> | NextResponse<{
    error: string;
}>>;
export declare function PUT(request: NextRequest): Promise<NextResponse<any>>;
