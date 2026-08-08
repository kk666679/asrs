import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { RobotsModule } from './modules/robots/robots.module';
import { RobotCommandsModule } from './modules/robot-commands/robot-commands.module';
import { RobotMetricsModule } from './modules/robot-metrics/robot-metrics.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HalalModule } from './modules/halal/halal.module';
import { ItemsModule } from './modules/items/items.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { SensorsModule } from './modules/sensors/sensors.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { LogisticsModule } from './modules/logistics/logistics.module';
import { LocationsModule } from './modules/locations/locations.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { MovementsModule } from './modules/movements/movements.module';
import { OperationsModule } from './modules/operations/operations.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ProductsModule } from './modules/products/products.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SupplyChainModule } from './modules/supply-chain/supply-chain.module';
import { IotModule } from './modules/iot/iot.module';
import { AiAgentsModule } from './modules/ai-agents/ai-agents.module';
import { BarcodeModule } from './modules/barcode/barcode.module';
import { RfidModule } from './modules/rfid/rfid.module';
import { QrCodeModule } from './modules/qr-code/qr-code.module';
import { AuthModule } from './modules/auth/auth.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { IpfsModule } from './modules/ipfs/ipfs.module';

@Module({
  imports: [
    RobotsModule,
    RobotCommandsModule,
    RobotMetricsModule,
    InventoryModule, 
    AnalyticsModule, 
    HalalModule,
    ItemsModule,
    AlertsModule,
    EquipmentModule,
    SensorsModule,
    ShipmentsModule,
    LogisticsModule,
    LocationsModule,
    MaintenanceModule,
    MovementsModule,
    OperationsModule,
    TransactionsModule,
    SettingsModule,
    ProductsModule,
    ReportsModule,
    SupplyChainModule,
    IotModule,
    AiAgentsModule,
    BarcodeModule,
    RfidModule,
    QrCodeModule,
    AuthModule,
    BlockchainModule,
    IpfsModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
