import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    metrics: any;
    pagination: {
        page: number;
        limit: number;
        total: any;
        pages: number;
    };
}> | NextResponse<{
    error: string;
}>>;
