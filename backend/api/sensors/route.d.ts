import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    sensors: ({
        zones: {
            id: string;
            code: string;
            name: string;
        } | null;
        bins: {
            id: string;
            code: string;
        } | null;
        sensor_readings: {
            timestamp: Date;
            value: number;
            unit: string;
        }[];
    } & {
        id: string;
        type: import("@prisma/client").$Enums.SensorType;
        code: string;
        name: string;
        status: import("@prisma/client").$Enums.SensorStatus;
        location: string | null;
        lastMaintenance: Date | null;
        zoneId: string | null;
        binId: string | null;
        calibrationDate: Date | null;
        thresholdMin: number | null;
        thresholdMax: number | null;
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
    type: import("@prisma/client").$Enums.SensorType;
    code: string;
    name: string;
    status: import("@prisma/client").$Enums.SensorStatus;
    location: string | null;
    lastMaintenance: Date | null;
    zoneId: string | null;
    binId: string | null;
    calibrationDate: Date | null;
    thresholdMin: number | null;
    thresholdMax: number | null;
}>>;
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    zones: {
        id: string;
        code: string;
        name: string;
    } | null;
    bins: {
        id: string;
        code: string;
    } | null;
    sensor_readings: {
        timestamp: Date;
        value: number;
        unit: string;
    }[];
} & {
    id: string;
    type: import("@prisma/client").$Enums.SensorType;
    code: string;
    name: string;
    status: import("@prisma/client").$Enums.SensorStatus;
    location: string | null;
    lastMaintenance: Date | null;
    zoneId: string | null;
    binId: string | null;
    calibrationDate: Date | null;
    thresholdMin: number | null;
    thresholdMax: number | null;
}>>;
export declare function DELETE(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    message: string;
}>>;
