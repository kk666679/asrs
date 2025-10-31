import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest, { params }: {
    params: {
        hash: string;
    };
}): Promise<NextResponse<unknown>>;
