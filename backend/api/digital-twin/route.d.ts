import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    twins: any;
}> | NextResponse<{
    agents: any;
}> | NextResponse<{
    health: any;
}> | NextResponse<{
    error: string;
}>>;
export declare function POST(request: NextRequest): Promise<NextResponse<{
    twin: any;
}> | NextResponse<{
    success: boolean;
}> | NextResponse<{
    results: any;
}> | NextResponse<{
    response: any;
}> | NextResponse<{
    error: string;
}>>;
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
}>>;
export declare function DELETE(): Promise<NextResponse<{
    message: string;
}> | NextResponse<{
    error: string;
}>>;
