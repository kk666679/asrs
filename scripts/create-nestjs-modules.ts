#!/usr/bin/env tsx

import { promises as fs } from 'fs';
import path from 'path';

const modules = [
  'alerts', 'equipment', 'sensors', 'shipments', 'logistics',
  'locations', 'maintenance', 'movements', 'operations', 
  'transactions', 'settings', 'products', 'reports'
];

async function createModule(moduleName: string) {
  const moduleDir = `/workspaces/asrs/backend/src/modules/${moduleName}`;
  
  // Create directory
  await fs.mkdir(moduleDir, { recursive: true });
  
  // Create module file
  const moduleContent = `import { Module } from '@nestjs/common';
import { ${capitalize(moduleName)}Controller } from './${moduleName}.controller';
import { ${capitalize(moduleName)}Service } from './${moduleName}.service';

@Module({
  controllers: [${capitalize(moduleName)}Controller],
  providers: [${capitalize(moduleName)}Service],
})
export class ${capitalize(moduleName)}Module {}`;
  
  await fs.writeFile(path.join(moduleDir, `${moduleName}.module.ts`), moduleContent);
  
  // Create controller file
  const controllerContent = `import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ${capitalize(moduleName)}Service } from './${moduleName}.service';

@Controller('api/${moduleName}')
export class ${capitalize(moduleName)}Controller {
  constructor(private readonly ${moduleName}Service: ${capitalize(moduleName)}Service) {}

  @Get()
  findAll(@Query() query?: any) {
    return this.${moduleName}Service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.${moduleName}Service.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.${moduleName}Service.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.${moduleName}Service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.${moduleName}Service.remove(id);
  }
}`;
  
  await fs.writeFile(path.join(moduleDir, `${moduleName}.controller.ts`), controllerContent);
  
  // Create service file
  const serviceContent = `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${capitalize(moduleName)}Service {
  private data: any[] = [];

  findAll(query?: any) {
    return this.data;
  }

  findOne(id: string) {
    return this.data.find(item => item.id === id);
  }

  create(createDto: any) {
    const newItem = {
      id: Date.now().toString(),
      ...createDto,
      createdAt: new Date().toISOString()
    };
    this.data.push(newItem);
    return newItem;
  }

  update(id: string, updateDto: any) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updateDto, updatedAt: new Date().toISOString() };
      return this.data[index];
    }
    return null;
  }

  remove(id: string) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      return this.data.splice(index, 1)[0];
    }
    return null;
  }
}`;
  
  await fs.writeFile(path.join(moduleDir, `${moduleName}.service.ts`), serviceContent);
  
  console.log(`✅ Created ${moduleName} module`);
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function updateAppModule() {
  const appModulePath = '/workspaces/asrs/backend/src/app.module.ts';
  const content = await fs.readFile(appModulePath, 'utf-8');
  
  // Add imports
  const imports = modules.map(m => `import { ${capitalize(m)}Module } from './modules/${m}/${m}.module';`).join('\n');
  const moduleNames = modules.map(m => `${capitalize(m)}Module`).join(',\n    ');
  
  const newContent = content
    .replace('import { ItemsModule } from \'./modules/items/items.module\';', 
             `import { ItemsModule } from './modules/items/items.module';\n${imports}`)
    .replace('ItemsModule\n  ]', `ItemsModule,\n    ${moduleNames}\n  ]`);
  
  await fs.writeFile(appModulePath, newContent);
  console.log('✅ Updated app.module.ts');
}

async function main() {
  console.log('🚀 Creating NestJS modules...\n');
  
  for (const moduleName of modules) {
    await createModule(moduleName);
  }
  
  await updateAppModule();
  
  console.log('\n✨ All NestJS modules created successfully!');
}

main().catch(console.error);