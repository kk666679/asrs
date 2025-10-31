import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    certifications: any;
    pagination: {
        page: number;
        limit: number;
        total: any;
        pages: number;
    };
}> | NextResponse<{
    error: string;
}>>;
export declare function POST(request: NextRequest): Promise<NextResponse<any>>;
export declare function PUT(request: NextRequest): Promise<NextResponse<any>>;
export declare function DELETE(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    message: string;
}>>;
