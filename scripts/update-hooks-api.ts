#!/usr/bin/env tsx

import { promises as fs } from 'fs';
import path from 'path';

const hooks = [
  'useAlerts', 'useEquipment', 'useLocations', 'useMaintenance', 
  'useMovements', 'useOperations', 'useSensors', 'useShipments', 
  'useTransactions'
];

async function updateHook(hookName: string) {
  const filePath = `/workspaces/asrs/lib/hooks/${hookName}.ts`;
  
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    
    // Add API client import if not present
    if (!content.includes('apiClient')) {
      content = content.replace(
        "import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';",
        "import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';\nimport { apiClient } from '@/lib/api-client';"
      );
    }
    
    // Get the module name (remove 'use' prefix and make lowercase)
    const moduleName = hookName.replace('use', '').toLowerCase();
    
    // Replace fetch calls with API client calls
    content = content.replace(
      /const response = await fetch\('\/api\/([^']+)'\);[\s\S]*?return response\.json\(\);/g,
      `return apiClient.${moduleName}.getAll();`
    );
    
    content = content.replace(
      /const response = await fetch\('\/api\/([^']+)', \{[\s\S]*?method: 'POST',[\s\S]*?\}\);[\s\S]*?return response\.json\(\);/g,
      `return apiClient.${moduleName}.create(item);`
    );
    
    content = content.replace(
      /const response = await fetch\(`\/api\/([^`]+)\/\$\{id\}`, \{[\s\S]*?method: 'PATCH',[\s\S]*?\}\);[\s\S]*?return response\.json\(\);/g,
      `return apiClient.${moduleName}.update(id, updates);`
    );
    
    content = content.replace(
      /const response = await fetch\(`\/api\/([^`]+)\/\$\{id\}`, \{[\s\S]*?method: 'DELETE'[\s\S]*?\}\);[\s\S]*?if \(!response\.ok\) \{[\s\S]*?\}/g,
      `return apiClient.${moduleName}.delete(id);`
    );
    
    await fs.writeFile(filePath, content);
    console.log(`✅ Updated ${hookName}`);
    
  } catch (error) {
    console.log(`⚠️  Could not update ${hookName}: ${error}`);
  }
}

async function main() {
  console.log('🔄 Updating hooks to use NestJS API client...\n');
  
  for (const hook of hooks) {
    await updateHook(hook);
  }
  
  console.log('\n✨ Hook updates completed!');
}

main().catch(console.error);