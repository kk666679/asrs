import { Injectable } from '@nestjs/common';

@Injectable()
export class IotService {
  getDevices(query?: any) {
    return [
      {
        id: '1',
        name: 'Temperature Sensor A1',
        type: 'TEMPERATURE',
        location: 'Zone A',
        status: 'ACTIVE',
        lastReading: 22.5,
        batteryLevel: 85,
        signalStrength: 92
      },
      {
        id: '2',
        name: 'RFID Reader B2',
        type: 'RFID',
        location: 'Loading Dock',
        status: 'ACTIVE',
        lastReading: null,
        batteryLevel: 78,
        signalStrength: 88
      },
      {
        id: '3',
        name: 'Weight Scale C3',
        type: 'WEIGHT',
        location: 'Packaging',
        status: 'MAINTENANCE',
        lastReading: 450.2,
        batteryLevel: 45,
        signalStrength: 75
      }
    ];
  }

  getSensors() {
    return {
      total: 25,
      active: 22,
      maintenance: 2,
      offline: 1,
      types: {
        temperature: 8,
        humidity: 6,
        weight: 4,
        rfid: 3,
        barcode: 2,
        motion: 2
      }
    };
  }

  getReadings(query?: any) {
    return [
      {
        deviceId: '1',
        timestamp: new Date().toISOString(),
        value: 22.5,
        unit: '°C',
        quality: 100
      },
      {
        deviceId: '2',
        timestamp: new Date().toISOString(),
        value: 'TAG_12345',
        unit: 'tag',
        quality: 95
      }
    ];
  }

  createDevice(deviceData: any) {
    return {
      id: Date.now().toString(),
      ...deviceData,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
  }

  updateDevice(id: string, updateData: any) {
    return {
      id,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
  }

  sendCommand(commandData: any) {
    return {
      commandId: Date.now().toString(),
      status: 'SENT',
      timestamp: new Date().toISOString(),
      ...commandData
    };
  }
}