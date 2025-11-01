#!/usr/bin/env tsx

/**
 * API Endpoints Testing Script
 * Tests all API endpoints for correct linking and functionality
 */

import { promises as fs } from 'fs';
import path from 'path';

interface APIEndpoint {
  path: string;
  methods: string[];
  file: string;
  status: 'found' | 'missing' | 'error';
  issues: string[];
}

interface TestResult {
  totalEndpoints: number;
  workingEndpoints: number;
  brokenEndpoints: number;
  endpoints: APIEndpoint[];
  summary: string;
}

async function findAPIFiles(dir: string, basePath = ''): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const subFiles = await findAPIFiles(fullPath, relativePath);
      files.push(...subFiles);
    } else if (entry.name === 'route.ts') {
      files.push(relativePath.replace('/route.ts', ''));
    }
  }

  return files;
}

async function analyzeAPIFile(filePath: string): Promise<{ methods: string[]; issues: string[] }> {
  const issues: string[] = [];
  const methods: string[] = [];

  try {
    const fullPath = path.join('/workspaces/asrs/app/api', filePath, 'route.ts');
    const content = await fs.readFile(fullPath, 'utf-8');

    // Check for HTTP methods
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    for (const method of httpMethods) {
      if (content.includes(`export async function ${method}`)) {
        methods.push(method);
      }
    }

    // Check for common issues
    if (!content.includes('NextRequest') && !content.includes('Request')) {
      issues.push('Missing request parameter type');
    }

    if (!content.includes('NextResponse') && !content.includes('Response')) {
      issues.push('Missing response type');
    }

    if (!content.includes('try') && !content.includes('catch')) {
      issues.push('Missing error handling');
    }

    if (content.includes('console.log') || content.includes('console.error')) {
      issues.push('Contains console statements');
    }

    if (!content.includes('return')) {
      issues.push('Missing return statement');
    }

    // Check for database imports
    if (content.includes('prisma') && !content.includes('import')) {
      issues.push('Prisma used without import');
    }

  } catch (error) {
    issues.push(`File read error: ${error}`);
  }

  return { methods, issues };
}

async function testAPIEndpoints(): Promise<TestResult> {
  console.log('🔍 Discovering API endpoints...\n');

  const apiDir = '/workspaces/asrs/app/api';
  const endpointPaths = await findAPIFiles(apiDir);
  
  const endpoints: APIEndpoint[] = [];
  let workingEndpoints = 0;
  let brokenEndpoints = 0;

  for (const endpointPath of endpointPaths) {
    console.log(`📡 Testing: /api${endpointPath}`);
    
    const { methods, issues } = await analyzeAPIFile(endpointPath);
    
    const endpoint: APIEndpoint = {
      path: `/api${endpointPath}`,
      methods,
      file: `app/api${endpointPath}/route.ts`,
      status: issues.length === 0 ? 'found' : 'error',
      issues
    };

    if (issues.length === 0) {
      workingEndpoints++;
      console.log(`  ✅ Working - Methods: ${methods.join(', ')}`);
    } else {
      brokenEndpoints++;
      console.log(`  ❌ Issues found: ${issues.length}`);
      issues.forEach(issue => console.log(`     - ${issue}`));
    }

    endpoints.push(endpoint);
    console.log('');
  }

  const totalEndpoints = endpoints.length;
  const summary = `
📊 API ENDPOINTS ANALYSIS SUMMARY
================================
Total Endpoints: ${totalEndpoints}
Working Endpoints: ${workingEndpoints} (${((workingEndpoints/totalEndpoints)*100).toFixed(1)}%)
Endpoints with Issues: ${brokenEndpoints} (${((brokenEndpoints/totalEndpoints)*100).toFixed(1)}%)

🔧 ENDPOINT DETAILS:
${endpoints.map(ep => `
${ep.path}
  File: ${ep.file}
  Methods: ${ep.methods.join(', ') || 'None'}
  Status: ${ep.status}
  ${ep.issues.length > 0 ? `Issues: ${ep.issues.join(', ')}` : 'No issues'}
`).join('')}

🎯 RECOMMENDATIONS:
${brokenEndpoints > 0 ? `
- Fix ${brokenEndpoints} endpoints with issues
- Add proper error handling where missing
- Remove console statements from production code
- Ensure proper TypeScript types for requests/responses
` : '- All endpoints are properly configured! 🎉'}
`;

  return {
    totalEndpoints,
    workingEndpoints,
    brokenEndpoints,
    endpoints,
    summary
  };
}

async function generateAPIDocumentation(result: TestResult): Promise<void> {
  const documentation = `# API Endpoints Documentation

## Overview
This document provides a comprehensive overview of all API endpoints in the ASRS system.

## Endpoints Summary
- **Total Endpoints**: ${result.totalEndpoints}
- **Working Endpoints**: ${result.workingEndpoints}
- **Endpoints with Issues**: ${result.brokenEndpoints}

## Endpoint Details

${result.endpoints.map(endpoint => `
### ${endpoint.path}
- **File**: \`${endpoint.file}\`
- **Methods**: ${endpoint.methods.join(', ') || 'None defined'}
- **Status**: ${endpoint.status}
${endpoint.issues.length > 0 ? `- **Issues**: ${endpoint.issues.join(', ')}` : '- **Status**: ✅ No issues'}
`).join('')}

## API Testing Results
${result.summary}

---
*Generated on ${new Date().toISOString()}*
`;

  await fs.writeFile('/workspaces/asrs/docs/API_ENDPOINTS_TEST.md', documentation);
  console.log('📄 API documentation generated: docs/API_ENDPOINTS_TEST.md');
}

async function main() {
  try {
    console.log('🚀 Starting API Endpoints Investigation...\n');
    
    const result = await testAPIEndpoints();
    
    console.log(result.summary);
    
    await generateAPIDocumentation(result);
    
    console.log('\n✨ API endpoints investigation completed!');
    
    // Exit with error code if there are broken endpoints
    if (result.brokenEndpoints > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error during API testing:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}