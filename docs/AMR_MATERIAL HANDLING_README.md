# AUTONOMOUS MOBILE ROBOT 

### MATERIAL HANDLING SYSTEM - POWERED BY PNEUMATIC - ASRS & CONVEYOR INTEGRATION

![Pneumatic](https://img.shields.io/badge/Pneumatic_Components-SMC-blue)
![PLC System](https://img.shields.io/badge/PLC_System-OMRON-orange)
![SCADA](https://img.shields.io/badge/SCADA_System-Ignition-yellow)
![Storage](https://img.shields.io/badge/Storage-ASRS-green)
![Transport Conveyor](https://img.shields.io/badge/Transport-Conveyor_System-lightgrey)
![Backend](https://img.shields.io/badge/Backend-NestJS-red)
![Frontend](https://img.shields.io/badge/Frontend-Next.js-black)
![Protocol OPC](https://img.shields.io/badge/Protocol-OPC_UA-blueviolet)

## 🚀 Integrated Material Handling System

```mermaid
flowchart TD
    subgraph A [ASRS Layer]
        A1[High-Bay Racking]
        A2[Storage/Retrieval Cranes]
        A3[Pallet Shuttles]
        A4[Inventory Management]
    end

    subgraph B [Conveyor Layer]
        B1[Infeed Conveyors]
        B2[Sortation Systems]
        B3[Accumulation Zones]
        B4[Transfer Cars]
    end

    subgraph C [AMR Fleet Layer]
        C1[Pneumatic AMRs]
        C2[Charging Stations]
        C3[Maintenance Bays]
        C4[Fleet Manager]
    end

    subgraph D [Control Layer]
        D1[OMRON PLC Network]
        D2[Ignition SCADA]
        D3[NestJS Backend]
        D4[Next.js Dashboard]
    end

    A <-->|Pallet Transfer| B
    B <-->|Load/Unload| C
    C <-->|Real-time Control| D
    D <-->|Supervision & Analytics| A
```

## 🏗️ Integrated System Architecture

```mermaid
graph TB
    subgraph ASRS_SYSTEM[ASRS Infrastructure]
        ASRS_WMS[ASRS WMS<br/>Inventory Management]
        STORAGE_CRANE[Storage Cranes<br/>S/R Machines]
        HIGH_BAY[High-Bay Racking<br/>10-30m height]
        PALlet_CON[Pallet Conveyors<br/>ASRS Interface]
    end

    subgraph CONVEYOR_SYSTEM[Conveyor Network]
        MAIN_CON[Main Line Conveyors<br/>Roller/Belt]
        SORTATION[Sortation System<br/>Diverters/Merges]
        ACCUMULATION[Accumulation Zones<br/>Buffers]
        TRANSFER[Transfer Cars<br/>Zone Crossing]
    end

    subgraph AMR_SYSTEM[AMR Fleet]
        PNEU_AMR[Pneumatic AMR<br/>SMC Components]
        AMR_FLEET[AMR Fleet Manager<br/>Task Dispatch]
        CHARGING[Automated Charging<br/>Opportunity]
        INTERFACE[Load/Unload Stations<br/>AMR/Conveyor]
    end

    subgraph CONTROL_SYSTEM[Unified Control System]
        MCP[Master Control PLC<br/>OMRON NJ Series]
        ASRS_PLC[ASRS PLC<br/>Crane Control]
        CONV_PLC[Conveyor PLC<br/>Zone Control]
        AMR_PLC[AMR PLC<br/>Pneumatic Control]
    end

    subgraph SUPERVISION[Supervision Layer]
        SCADA[Ignition SCADA<br/>System Overview]
        BACKEND[NestJS Backend<br/>Business Logic]
        FRONTEND[Next.js Dashboard<br/>Operator HMI]
        ANALYTICS[Analytics Engine<br/>Performance]
    end

    ASRS_WMS --> STORAGE_CRANE
    STORAGE_CRANE --> HIGH_BAY
    HIGH_BAY --> PALlet_CON
    PALlet_CON --> MAIN_CON
    MAIN_CON --> SORTATION
    SORTATION --> ACCUMULATION
    ACCUMULATION --> INTERFACE
    INTERFACE --> PNEU_AMR
    PNEU_AMR --> AMR_FLEET
    MCP --> ASRS_PLC
    MCP --> CONV_PLC
    MCP --> AMR_PLC
    SCADA --> MCP
    BACKEND --> SCADA
    FRONTEND --> BACKEND
    ANALYTICS --> BACKEND
```

## 🔄 Integrated Workflow

```mermaid
sequenceDiagram
    participant WMS as WMS/ERP System
    participant SCADA as Ignition SCADA
    participant MCP as Master Control PLC
    participant ASRS as ASRS Controller
    participant CONV as Conveyor Controller
    participant AMR as AMR Fleet Manager
    participant ROBOT as Pneumatic AMR

    WMS->>SCADA: New Order Request
    SCADA->>ASRS: Retrieve Pallet Command
    ASRS->>ASRS: Crane Retrieval Operation
    ASRS->>CONV: Release to Conveyor
    CONV->>CONV: Transport to AMR Station
    CONV->>AMR: Pallet Ready for Pickup
    AMR->>ROBOT: Dispatch to Station A3
    ROBOT->>CONV: Align with Conveyor
    ROBOT->>ROBOT: Activate Pneumatic Gripper
    ROBOT->>CONV: Confirm Pallet Acquisition
    CONV->>MCP: Pallet Transfer Complete
    ROBOT->>AMR: Transport to Destination
    AMR->>SCADA: Mission Status Update
    SCADA->>WMS: Order Progress Update
```

## 🏭 Physical Layout Integration

```mermaid
graph TB
    subgraph FLOOR_A [ASRS Zone - North]
        A1[ASRS Rack A1<br/>Raw Materials]
        A2[ASRS Rack A2<br/>WIP Storage]
        A3[ASRS Rack A3<br/>Finished Goods]
        A4[ASRS Interface<br/>Conveyor Infeed]
    end

    subgraph FLOOR_B [Conveyor Highway - Center]
        B1[Main Conveyor Line<br/>200m length]
        B2[Sortation Junction<br/>Divert to Zones]
        B3[Accumulation Buffer<br/>50 pallet capacity]
        B4[Transfer Stations<br/>AMR Handoff]
    end

    subgraph FLOOR_C [AMR Work Zone - South]
        C1[Assembly Station 1<br/>AMR Serviced]
        C2[Assembly Station 2<br/>AMR Serviced]
        C3[Quality Control<br/>AMR Serviced]
        C4[Shipping Prep<br/>AMR Serviced]
    end

    subgraph FLOOR_D [Support Areas]
        D1[AMR Charging Station]
        D2[Maintenance Bay]
        D3[Manual Workstations]
        D4[Supervisor Office]
    end

    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> C1
    B4 --> C2
    B4 --> C3
    B4 --> C4
    C1 --> D1
    C2 --> D1
    C3 --> D2
    C4 --> D3
```

## 🔧 ASRS-AMR-Conveyor Interface

```mermaid
flowchart LR
    subgraph ASRS_INTERFACE [ASRS Handoff]
        ASRS_OUT[ASRS Output Conveyor]
        PHOTO_EYE[Photoeye Detection]
        BARCODE[Barcode Scanner]
        STOPPER[Pneumatic Stopper]
    end

    subgraph CONVEYOR_INTERFACE [Conveyor Transfer]
        ACCUMULATION[Accumulation Zone]
        DIVERTER[Powered Divert]
        LIFT[Lift & Transfer Unit]
        ALIGNMENT[Alignment Guides]
    end

    subgraph AMR_INTERFACE [AMR Handoff]
        AMR_LOAD[AMR Load Position]
        PNEUMATIC[Pneumatic Gripper]
        SENSORS[Position Sensors]
        SAFETY[Safety Laser Scanner]
    end

    ASRS_INTERFACE --> CONVEYOR_INTERFACE
    CONVEYOR_INTERFACE --> AMR_INTERFACE

    style ASRS_INTERFACE fill:#e1f5fe
    style CONVEYOR_INTERFACE fill:#f3e5f5
    style AMR_INTERFACE fill:#e8f5e8
```

## 🎯 Integrated Control Logic

### Master Control System (OMRON PLC)

```structured-text
// Master Control Program - ASRS-AMR-Conveyor Coordination
PROGRAM MainSystemCoordinator
VAR
    // ASRS Interface Signals
    ASRS_PalletReady : BOOL;
    ASRS_PalletID : STRING[20];
    ASRS_RetrieveCommand : BOOL;
    
    // Conveyor Control Signals
    Conv_Position : ARRAY[1..10] OF BOOL;
    Conv_MotorSpeed : INT;
    Conv_DivertCommand : BOOL;
    
    // AMR Fleet Signals
    AMR_Available : BOOL;
    AMR_AssignedTask : BOOL;
    AMR_AtStation : BOOL;
    AMR_LoadComplete : BOOL;
    
    // Pneumatic System
    Pneumatic_GripperExtended : BOOL;
    Pneumatic_ClampActive : BOOL;
    Pneumatic_PressureOK : BOOL;
END_VAR

// Main Coordination State Machine
CASE SystemState OF
    0: // Idle - Wait for ASRS command
        IF ASRS_PalletReady THEN
            SystemState := 10;
        END_IF
        
    10: // Convey pallet to AMR station
        Conv_DivertCommand := TRUE;
        IF Conv_Position[5] THEN
            SystemState := 20;
        END_IF
        
    20: // Dispatch AMR and prepare handoff
        IF AMR_Available THEN
            AMR_AssignedTask := TRUE;
            SystemState := 30;
        END_IF
        
    30: // Execute pneumatic handoff
        IF AMR_AtStation AND Conv_Position[5] THEN
            Pneumatic_GripperExtended := TRUE;
            SystemState := 40;
        END_IF
        
    40: // Confirm load and release
        IF Pneumatic_ClampActive AND Pneumatic_PressureOK THEN
            AMR_LoadComplete := TRUE;
            Conv_DivertCommand := FALSE;
            SystemState := 50;
        END_IF
        
    50: // Complete cycle
        SystemState := 0;
END_CASE
```

## 📊 System Integration API

### NestJS Backend Services

```typescript
// apps/api/src/modules/integration/integration.service.ts
import { Injectable } from '@nestjs/common';
import { OpcuaService } from '../opcua/opcua.service';
import { MqttService } from '../mqtt/mqtt.service';

@Injectable()
export class IntegrationService {
  constructor(
    private opcuaService: OpcuaService,
    private mqttService: MqttService,
  ) {}

  async executeMaterialTransfer(transferRequest: TransferRequest) {
    const { source, destination, materialId, priority } = transferRequest;

    // 1. Reserve ASRS retrieval
    await this.reserveASRSOperation(source, materialId);

    // 2. Configure conveyor route
    const route = await this.calculateConveyorRoute(source, destination);
    await this.configureConveyorSystem(route);

    // 3. Dispatch AMR to handoff point
    const amr = await this.selectAvailableAMR();
    await this.dispatchAMR(amr, route.handoffPoint);

    // 4. Monitor execution
    return this.monitorTransferExecution(transferRequest, amr);
  }

  private async configureConveyorRoute(route: ConveyorRoute) {
    // Set diverters, speeds, and accumulation zones
    const commands = [
      this.opcuaService.writeTag('Conv_Divert_1', route.divert1State),
      this.opcuaService.writeTag('Conv_Speed_Main', route.mainSpeed),
      this.opcuaService.writeTag('Conv_Accum_Enable', route.accumulationEnable),
    ];

    await Promise.all(commands);
  }
}
```

## 🔌 PLC Network Integration

```mermaid
graph TB
    subgraph PLC_NETWORK [OMRON PLC Ethernet/IP Network]
        MCP[Master Control PLC<br/>NJ501-1300]
        
        subgraph ASRS_PLCS [ASRS Control]
            ASRS_PLC1[ASRS Aisle 1 PLC<br/>NJ301-1100]
            ASRS_PLC2[ASRS Aisle 2 PLC<br/>NJ301-1100]
            CRANE_PLC[Crane Controller<br/>NX1P2]
        end

        subgraph CONV_PLCS [Conveyor Control]
            CONV_ZONE1[Zone 1 PLC<br/>NJ101-1000]
            CONV_ZONE2[Zone 2 PLC<br/>NJ101-1000]
            SORTATION_PLC[Sortation PLC<br/>NJ101-1000]
        end

        subgraph AMR_PLCS [AMR Interface]
            AMR_STATION1[Station 1 PLC<br/>NX1P2]
            AMR_STATION2[Station 2 PLC<br/>NX1P2]
            PNEUMATIC_PLC[Pneumatic Control<br/>NJ101-1000]
        end
    end

    MCP --> ASRS_PLC1
    MCP --> ASRS_PLC2
    MCP --> CRANE_PLC
    MCP --> CONV_ZONE1
    MCP --> CONV_ZONE2
    MCP --> SORTATION_PLC
    MCP --> AMR_STATION1
    MCP --> AMR_STATION2
    MCP --> PNEUMATIC_PLC

    ASRS_PLC1 --> CRANE_PLC
    CONV_ZONE1 --> CONV_ZONE2
    CONV_ZONE2 --> SORTATION_PLC
```

## 🎛️ SCADA Supervision Screens

### Integrated Monitoring Dashboard

```typescript
// apps/web/app/integrated-dashboard/page.tsx
export default function IntegratedDashboard() {
  const { systemStatus, transferMetrics, alarms } = useIntegratedSystem();

  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      {/* ASRS Status Panel */}
      <div className="col-span-3">
        <Card>
          <CardTitle>ASRS Status</CardTitle>
        </CardHeader>
        <CardContent>
          <CraneStatus cranes={systemStatus.cranes} />
          <InventoryLevels levels={systemStatus.inventory} />
        </CardContent>
      </Card>
      </div>

      {/* Conveyor Network Panel */}
      <div className="col-span-6">
        <Card>
          <CardHeader>
            <CardTitle>Conveyor Network</CardTitle>
          </CardHeader>
          <CardContent>
            <ConveyorMap zones={systemStatus.conveyorZones} />
            <ThroughputMetrics metrics={transferMetrics} />
          </CardContent>
        </Card>
      </div>

      {/* AMR Fleet Panel */}
      <div className="col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>AMR Fleet</CardTitle>
          </CardHeader>
          <CardContent>
            <FleetStatus amrs={systemStatus.amrFleet} />
            <PneumaticSystem pressure={systemStatus.pneumaticPressure} />
          </CardContent>
        </Card>
      </div>

      {/* Transfer Control Panel */}
      <div className="col-span-12">
        <TransferControlPanel />
      </div>
    </div>
  );
}
```

## 📈 Performance Analytics

### Key Integration Metrics

```typescript
// apps/api/src/modules/analytics/integration-metrics.service.ts
@Injectable()
export class IntegrationMetricsService {
  async calculateSystemOEE(): Promise<SystemOEE> {
    const [asrsOEE, conveyorOEE, amrOEE] = await Promise.all([
      this.calculateASRSOEE(),
      this.calculateConveyorOEE(),
      this.calculateAMROEE(),
    ]);

    // Integrated OEE considers handoff efficiency
    const handoffEfficiency = await this.calculateHandoffEfficiency();
    
    return {
      overall: (asrsOEE * conveyorOEE * amrOEE * handoffEfficiency) * 100,
      components: {
        asrs: asrsOEE * 100,
        conveyor: conveyorOEE * 100,
        amr: amrOEE * 100,
        handoff: handoffEfficiency * 100,
      },
      timestamp: new Date(),
    };
  }

  private async calculateHandoffEfficiency(): Promise<number> {
    const successfulHandoffs = await this.transferLogRepository.count({
      where: { status: 'COMPLETED', handoffSuccessful: true },
    });

    const totalHandoffs = await this.transferLogRepository.count({
      where: { status: 'COMPLETED' },
    });

    return totalHandoffs > 0 ? successfulHandoffs / totalHandoffs : 1;
  }
}
```

## 🚀 Deployment & Operation

### Starting the Integrated System

```bash
# Start all services
docker-compose -f docker-compose.integrated.yml up -d

# Initialize ASRS system
curl -X POST http://localhost:4000/api/asrs/initialize

# Start conveyor network
curl -X POST http://localhost:4000/api/conveyor/start

# Deploy AMR fleet
curl -X POST http://localhost:4000/api/amr-fleet/deploy

# Monitor system status
curl http://localhost:4000/api/integration/status
```

### System Health Monitoring

```typescript
// Health check endpoints
const healthEndpoints = {
  asrs: 'http://asrs-controller:8080/health',
  conveyor: 'http://conveyor-controller:8081/health',
  amr: 'http://amr-fleet:8082/health',
  plc: 'opc.tcp://plc-network:4840',
  scada: 'http://ignition-gateway:8088',
};

// Comprehensive health check
async function performSystemHealthCheck() {
  const results = await Promise.allSettled([
    this.checkASRSHealth(),
    this.checkConveyorHealth(),
    this.checkAMRFleetHealth(),
    this.checkPLCNetworkHealth(),
    this.checkSCADAHealth(),
  ]);

  return this.aggregateHealthResults(results);
}
```

---

<div align="center">

## 🏭 Complete Material Handling Ecosystem

### ASRS + Conveyor + AMR Integration

```mermaid
pie title System Throughput Distribution
    "ASRS Retrieval" : 35
    "Conveyor Transport" : 25
    "AMR Delivery" : 30
    "Handoff Operations" : 10
```

![Storage](https://img.shields.io/badge/Storage-ASRS-green)
![Transport Conveyor](https://img.shields.io/badge/Transport-Conveyor_System-lightgrey)
![Delivery](https://img.shields.io/badge/Delivery-Pneumatic_SMC-blue)
![Control OMRON](https://img.shields.io/badge/Control-OMRON_PLC-orange)

**Seamless Integration** • **High Throughput** • **Automated Material Flow**

</div>

> This integrated system creates a complete automated material handling solution where ASRS provides high-density storage, conveyors handle high-speed transport between zones, and AMRs deliver flexible final-meter delivery to workstations. The pneumatic AMR system enables secure handling of various load types while maintaining the flexibility of autonomous navigation.
