export interface PutawayRequest {
    itemId: string;
    quantity: number;
    batchNumber?: string;
    expiryDate?: Date;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    constraints?: {
        temperature?: 'AMBIENT' | 'REFRIGERATED' | 'FROZEN';
        hazardLevel?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
        maxWeight?: number;
    };
}
export interface PutawayResult {
    binId: string;
    binCode: string;
    location: string;
    score: number;
    reasons: string[];
}
export interface PickingRequest {
    items: Array<{
        itemId: string;
        quantity: number;
        priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    }>;
    constraints?: {
        maxWeight?: number;
        maxVolume?: number;
        timeWindow?: {
            start: Date;
            end: Date;
        };
    };
}
export interface PickingRoute {
    sequence: number;
    binId: string;
    binCode: string;
    itemId: string;
    quantity: number;
    location: string;
    estimatedTime: number;
    distance: number;
}
export interface OptimizedPickingPlan {
    routes: PickingRoute[];
    totalDistance: number;
    estimatedTime: number;
    efficiency: number;
}
export interface InventoryAlert {
    id: string;
    type: 'LOW_STOCK' | 'OVERSTOCK' | 'EXPIRY_WARNING' | 'QUALITY_ISSUE';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    itemId: string;
    binId?: string;
    message: string;
    threshold?: number;
    currentValue: number;
    createdAt: Date;
}
export interface SensorAlert {
    id: string;
    sensorId: string;
    type: 'THRESHOLD_EXCEEDED' | 'SENSOR_OFFLINE' | 'CALIBRATION_NEEDED';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    value: number;
    threshold: number;
    message: string;
    createdAt: Date;
}
export interface RobotTask {
    id: string;
    robotId: string;
    type: 'MOVE' | 'PICK' | 'PLACE' | 'SCAN' | 'CALIBRATE' | 'EMERGENCY_STOP';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    parameters: Record<string, any>;
    estimatedDuration: number;
    dependencies?: string[];
}
export interface QualityCheck {
    id: string;
    itemId: string;
    binId: string;
    checkType: 'VISUAL' | 'WEIGHT' | 'TEMPERATURE' | 'EXPIRY';
    status: 'PASS' | 'FAIL' | 'PENDING';
    notes?: string;
    performedBy: string;
    performedAt: Date;
}
export interface PerformanceMetrics {
    throughput: {
        hourly: number;
        daily: number;
        weekly: number;
    };
    accuracy: {
        picking: number;
        putaway: number;
        inventory: number;
    };
    efficiency: {
        spaceUtilization: number;
        robotUtilization: number;
        operatorProductivity: number;
    };
    costs: {
        operationalCost: number;
        maintenanceCost: number;
        energyCost: number;
    };
}
