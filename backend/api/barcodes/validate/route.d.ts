import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<any>>;
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    total: number;
    valid: number;
    invalid: number;
    results: never[];
    errors: never[];
}>>;
