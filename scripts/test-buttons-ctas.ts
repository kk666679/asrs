#!/usr/bin/env node

/**
 * Button and CTA Testing Script
 * Tests all interactive elements across the ASRS application
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ButtonTest {
  file: string;
  component: string;
  buttons: Array<{
    text: string;
    type: 'button' | 'link' | 'form' | 'toggle';
    action: string;
    enabled: boolean;
    issues?: string[];
  }>;
}

const testResults: ButtonTest[] = [];

// Test configuration
const testPages = [
  'app/page.tsx',
  'app/inventory/page.tsx', 
  'app/autonomous-mobile-robots/page.tsx',
  'app/autonomous-mobile-robots/material-handling/page.tsx',
  'components/app-sidebar.tsx'
];

function analyzeButtonsInFile(filePath: string): ButtonTest {
  const fullPath = path.join(process.cwd(), filePath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  
  const buttons: ButtonTest['buttons'] = [];
  
  // Regex patterns for different button types
  const buttonPatterns = [
    // Button components
    /<Button[^>]*>([^<]+)<\/Button>/g,
    /<Button[^>]*onClick={([^}]+)}[^>]*>([^<]+)<\/Button>/g,
    // Motion buttons
    /<motion\.div[^>]*whileHover[^>]*>[\s\S]*?<Button[^>]*>([^<]+)<\/Button>[\s\S]*?<\/motion\.div>/g,
    // Link buttons
    /<Link[^>]*href="([^"]+)"[^>]*>([^<]+)<\/Link>/g,
    // Form buttons
    /<button[^>]*type="submit"[^>]*>([^<]+)<\/button>/g,
    // Switch/Toggle components
    /<Switch[^>]*checked={([^}]+)}[^>]*\/>/g,
    // Tab triggers
    /<TabsTrigger[^>]*value="([^"]+)"[^>]*>([^<]+)<\/TabsTrigger>/g
  ];

  buttonPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const buttonText = match[1] || match[2] || match[3] || 'Unknown';
      const action = match[1] || 'click';
      
      // Check if button is properly enabled
      const isDisabled = content.includes('disabled={') || content.includes('disabled=true');
      const hasOnClick = content.includes('onClick=') || content.includes('onCheckedChange=');
      const hasHref = content.includes('href=');
      
      buttons.push({
        text: buttonText.replace(/\s+/g, ' ').trim(),
        type: determineButtonType(match[0]),
        action: action,
        enabled: !isDisabled && (hasOnClick || hasHref || content.includes('type="submit"')),
        issues: validateButton(match[0], content)
      });
    }
  });

  return {
    file: filePath,
    component: path.basename(filePath, '.tsx'),
    buttons: buttons
  };
}

function determineButtonType(buttonHtml: string): 'button' | 'link' | 'form' | 'toggle' {
  if (buttonHtml.includes('Switch') || buttonHtml.includes('Toggle')) return 'toggle';
  if (buttonHtml.includes('Link') || buttonHtml.includes('href=')) return 'link';
  if (buttonHtml.includes('type="submit"') || buttonHtml.includes('form')) return 'form';
  return 'button';
}

function validateButton(buttonHtml: string, fileContent: string): string[] {
  const issues: string[] = [];
  
  // Check for accessibility issues
  if (!buttonHtml.includes('aria-label') && !buttonHtml.includes('title') && 
      buttonHtml.includes('className') && buttonHtml.includes('h-4 w-4')) {
    issues.push('Icon-only button missing aria-label');
  }
  
  // Check for disabled state handling
  if (buttonHtml.includes('disabled={') && !buttonHtml.includes('isPending')) {
    issues.push('Disabled state may not be properly managed');
  }
  
  // Check for loading states
  if (buttonHtml.includes('onClick') && !fileContent.includes('useState') && 
      !fileContent.includes('useTransition')) {
    issues.push('No loading state management detected');
  }
  
  // Check for proper event handlers
  if (buttonHtml.includes('Button') && !buttonHtml.includes('onClick') && 
      !buttonHtml.includes('href') && !buttonHtml.includes('type="submit"')) {
    issues.push('Button missing click handler');
  }
  
  return issues;
}

function generateReport(): void {
  console.log('🔘 ASRS Button & CTA Testing Report');
  console.log('=====================================\n');
  
  let totalButtons = 0;
  let enabledButtons = 0;
  let issuesFound = 0;
  
  testResults.forEach(result => {
    console.log(`📄 ${result.file}`);
    console.log(`   Component: ${result.component}`);
    console.log(`   Buttons found: ${result.buttons.length}\n`);
    
    result.buttons.forEach((button, index) => {
      totalButtons++;
      if (button.enabled) enabledButtons++;
      if (button.issues && button.issues.length > 0) issuesFound += button.issues.length;
      
      console.log(`   ${index + 1}. "${button.text}"`);
      console.log(`      Type: ${button.type}`);
      console.log(`      Action: ${button.action}`);
      console.log(`      Enabled: ${button.enabled ? '✅' : '❌'}`);
      
      if (button.issues && button.issues.length > 0) {
        console.log(`      Issues: ${button.issues.length}`);
        button.issues.forEach(issue => {
          console.log(`        ⚠️  ${issue}`);
        });
      }
      console.log('');
    });
    
    console.log('---\n');
  });
  
  // Summary
  console.log('📊 SUMMARY');
  console.log('===========');
  console.log(`Total Buttons/CTAs: ${totalButtons}`);
  console.log(`Enabled: ${enabledButtons} (${Math.round((enabledButtons/totalButtons)*100)}%)`);
  console.log(`Disabled: ${totalButtons - enabledButtons}`);
  console.log(`Issues Found: ${issuesFound}`);
  console.log(`Success Rate: ${Math.round(((totalButtons - issuesFound)/totalButtons)*100)}%\n`);
  
  // Recommendations
  if (issuesFound > 0) {
    console.log('🔧 RECOMMENDATIONS');
    console.log('==================');
    console.log('1. Add aria-labels to icon-only buttons');
    console.log('2. Implement proper loading states for async actions');
    console.log('3. Ensure all buttons have appropriate click handlers');
    console.log('4. Add proper disabled state management\n');
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Button & CTA Analysis...\n');
  
  for (const page of testPages) {
    try {
      const result = analyzeButtonsInFile(page);
      testResults.push(result);
      console.log(`✅ Analyzed ${page}`);
    } catch (error) {
      console.log(`❌ Failed to analyze ${page}: ${error}`);
    }
  }
  
  console.log('\n📋 Generating Report...\n');
  generateReport();
  
  // Save report to file
  const reportContent = JSON.stringify(testResults, null, 2);
  fs.writeFileSync('button-test-report.json', reportContent);
  console.log('💾 Report saved to button-test-report.json');
}

if (require.main === module) {
  main().catch(console.error);
}

export { analyzeButtonsInFile, testResults };