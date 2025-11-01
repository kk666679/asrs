#!/usr/bin/env tsx

import { promises as fs } from 'fs';
import path from 'path';

interface APIEndpoint {
  path: string;
  methods: string[];
  usedBy: string[];
  issues: string[];
}

async function findAPIEndpoints(): Promise<string[]> {
  const apiDir = '/workspaces/asrs/app/api';
  const endpoints: string[] = [];
  
  async function scan(dir: string, basePath = ''): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('[')) {
        await scan(fullPath, relativePath);
      } else if (entry.name === 'route.ts') {
        endpoints.push(basePath || '/');
      }
    }
  }
  
  await scan(apiDir);
  return endpoints;
}

async function findPageFiles(): Promise<string[]> {
  const pagesDir = '/workspaces/asrs/app';
  const pages: string[] = [];
  
  async function scan(dir: string, basePath = ''): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name === 'api') continue;
        
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(basePath, entry.name);
        
        if (entry.isDirectory()) {
          await scan(fullPath, relativePath);
        } else if (entry.name === 'page.tsx') {
          pages.push(basePath || '/');
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  await scan(pagesDir);
  return pages;
}

async function analyzeAPIUsage(filePath: string): Promise<string[]> {
  const apiCalls: string[] = [];
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Find fetch calls to /api
    const fetchMatches = content.match(/fetch\s*\(\s*['"`]\/api[^'"`]*['"`]/g);
    if (fetchMatches) {
      fetchMatches.forEach(match => {
        const url = match.match(/['"`](\/api[^'"`]*)['"`]/)?.[1];
        if (url) apiCalls.push(url);
      });
    }
    
    // Find axios calls to /api
    const axiosMatches = content.match(/axios\.[a-z]+\s*\(\s*['"`]\/api[^'"`]*['"`]/g);
    if (axiosMatches) {
      axiosMatches.forEach(match => {
        const url = match.match(/['"`](\/api[^'"`]*)['"`]/)?.[1];
        if (url) apiCalls.push(url);
      });
    }
    
  } catch (error) {
    // Skip files we can't read
  }
  
  return [...new Set(apiCalls)];
}

async function main() {
  console.log('🔍 Analyzing API endpoints and page connections...\n');
  
  // Find all API endpoints
  const apiEndpoints = await findAPIEndpoints();
  console.log(`📡 Found ${apiEndpoints.length} API endpoints:`);
  apiEndpoints.forEach(endpoint => console.log(`  /api${endpoint}`));
  
  // Find all pages
  const pages = await findPageFiles();
  console.log(`\n📄 Found ${pages.length} pages:`);
  pages.forEach(page => console.log(`  ${page || '/'}`));
  
  // Analyze API usage in pages and components
  console.log('\n🔗 Analyzing API usage...');
  
  const apiUsageMap = new Map<string, string[]>();
  
  // Check pages
  for (const page of pages) {
    const pagePath = path.join('/workspaces/asrs/app', page, 'page.tsx');
    const apiCalls = await analyzeAPIUsage(pagePath);
    if (apiCalls.length > 0) {
      apiUsageMap.set(`page: ${page}`, apiCalls);
    }
  }
  
  // Check components
  const componentsDir = '/workspaces/asrs/components';
  try {
    const componentFiles = await fs.readdir(componentsDir, { recursive: true });
    for (const file of componentFiles) {
      if (typeof file === 'string' && file.endsWith('.tsx')) {
        const filePath = path.join(componentsDir, file);
        const apiCalls = await analyzeAPIUsage(filePath);
        if (apiCalls.length > 0) {
          apiUsageMap.set(`component: ${file}`, apiCalls);
        }
      }
    }
  } catch (error) {
    console.log('⚠️  Could not scan components directory');
  }
  
  // Check hooks
  const hooksDir = '/workspaces/asrs/lib/hooks';
  try {
    const hookFiles = await fs.readdir(hooksDir);
    for (const file of hookFiles) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const filePath = path.join(hooksDir, file);
        const apiCalls = await analyzeAPIUsage(filePath);
        if (apiCalls.length > 0) {
          apiUsageMap.set(`hook: ${file}`, apiCalls);
        }
      }
    }
  } catch (error) {
    console.log('⚠️  Could not scan hooks directory');
  }
  
  // Generate report
  console.log('\n📊 API USAGE REPORT');
  console.log('===================');
  
  const allUsedAPIs = new Set<string>();
  apiUsageMap.forEach((apis, source) => {
    console.log(`\n${source}:`);
    apis.forEach(api => {
      console.log(`  - ${api}`);
      allUsedAPIs.add(api);
    });
  });
  
  // Check for unused APIs
  const unusedAPIs = apiEndpoints.filter(endpoint => 
    !Array.from(allUsedAPIs).some(used => used.includes(endpoint))
  );
  
  console.log('\n🚨 ANALYSIS SUMMARY');
  console.log('==================');
  console.log(`Total API endpoints: ${apiEndpoints.length}`);
  console.log(`APIs being used: ${allUsedAPIs.size}`);
  console.log(`Potentially unused APIs: ${unusedAPIs.length}`);
  
  if (unusedAPIs.length > 0) {
    console.log('\n⚠️  Potentially unused API endpoints:');
    unusedAPIs.forEach(api => console.log(`  - /api${api}`));
  }
  
  // Check for missing APIs
  const missingAPIs = Array.from(allUsedAPIs).filter(used => 
    !apiEndpoints.some(endpoint => used.includes(endpoint))
  );
  
  if (missingAPIs.length > 0) {
    console.log('\n❌ Missing API endpoints:');
    missingAPIs.forEach(api => console.log(`  - ${api}`));
  }
  
  console.log('\n✅ API-Page alignment check completed!');
}

main().catch(console.error);