import { NextRequest, NextResponse } from 'next/server';
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    file: {
        id: any;
        name: any;
        hash: any;
        size: any;
        type: any;
        uploadedAt: any;
        status: any;
        halalCertified: any;
        certifyingBody: any;
        description: any;
    };
}>>;
