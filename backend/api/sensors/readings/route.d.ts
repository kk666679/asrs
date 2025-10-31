import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    readings: ({
        sensors: {
            id: string;
            type: import("@prisma/client").$Enums.SensorType;
            code: string;
            name: string;
        };
    } & {
        id: string;
        timestamp: Date;
        sensorId: string;
        value: number;
        unit: string;
        quality: number;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}> | NextResponse<{
    error: string;
}>>;
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    id: string;
    timestamp: Date;
    sensorId: string;
    value: number;
    unit: string;
    quality: number;
}>>;
