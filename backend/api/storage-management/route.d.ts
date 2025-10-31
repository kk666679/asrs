import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    storageTypes: {
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            pages: number;
        };
    };
    storageSections: {
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            pages: number;
        };
    };
    storageUnits: {
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            pages: number;
        };
    };
    storageBins: {
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            pages: number;
        };
    };
    summary: {
        totalCapacity: any;
        totalOccupied: any;
        overallUtilization: number;
        activeStorageTypes: any;
        activeSections: any;
        activeUnits: any;
        activeBins: any;
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
