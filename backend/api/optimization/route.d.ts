import { NextRequest, NextResponse } from 'next/server';
export declare function POST(request: NextRequest): Promise<any>;
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    movements: any;
}> | NextResponse<{
    result: any;
}> | NextResponse<{
    error: string;
}>>;
