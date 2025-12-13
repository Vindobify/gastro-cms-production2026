const fs = require('fs');
const path = require('path');

// List of API files to update
const apiFiles = [
  'src/app/api/orders/route.ts',
  'src/app/api/orders/[id]/route.ts',
  'src/app/api/customers/route.ts',
  'src/app/api/customers/[id]/route.ts',
  'src/app/api/todos/route.ts',
  'src/app/api/todos/[id]/route.ts',
  'src/app/api/todos/toggle/[id]/route.ts',
  'src/app/api/todos/default/route.ts',
  'src/app/api/invoices/route.ts',
  'src/app/api/invoices/[id]/route.ts',
  'src/app/api/settings/route.ts',
  'src/app/api/dashboard/stats/route.ts'
];

function addAuthToFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has auth
    if (content.includes('withAuth')) {
      console.log(`✓ ${filePath} already has auth`);
      return;
    }
    
    // Add import
    if (!content.includes("import { withAuth } from '@/lib/authMiddleware';")) {
      const importMatch = content.match(/import.*from.*['"]@\/lib\/database['"];?\n/);
      if (importMatch) {
        content = content.replace(
          importMatch[0],
          importMatch[0] + "import { withAuth } from '@/lib/authMiddleware';\n"
        );
      }
    }
    
    // Convert export functions to async functions
    content = content.replace(/export async function (GET|POST|PUT|DELETE)/g, 'async function $1');
    
    // Add protected exports at the end
    const exportMatch = content.match(/export const (GET|POST|PUT|DELETE) = withAuth/);
    if (!exportMatch) {
      // Find all function names
      const functionMatches = content.match(/async function (get|post|put|delete|create|update|delete|fetch|load|handle)[A-Za-z]*/g);
      if (functionMatches) {
        const exports = [];
        const httpMethods = ['GET', 'POST', 'PUT', 'DELETE'];
        
        for (const method of httpMethods) {
          const methodLower = method.toLowerCase();
          const functionName = functionMatches.find(f => 
            f.toLowerCase().includes(methodLower) || 
            (methodLower === 'get' && f.toLowerCase().includes('fetch')) ||
            (methodLower === 'get' && f.toLowerCase().includes('load')) ||
            (methodLower === 'post' && f.toLowerCase().includes('create')) ||
            (methodLower === 'put' && f.toLowerCase().includes('update')) ||
            (methodLower === 'delete' && f.toLowerCase().includes('delete'))
          );
          
          if (functionName) {
            const funcName = functionName.match(/async function ([a-zA-Z0-9_]+)/)[1];
            exports.push(`export const ${method} = withAuth(${funcName});`);
          }
        }
        
        if (exports.length > 0) {
          content += '\n\n// Export protected handlers\n' + exports.join('\n');
        }
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✓ Added auth to ${filePath}`);
    
  } catch (error) {
    console.error(`✗ Error updating ${filePath}:`, error.message);
  }
}

// Process all files
console.log('Adding authentication to all APIs...\n');

apiFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    addAuthToFile(fullPath);
  } else {
    console.log(`✗ File not found: ${filePath}`);
  }
});

console.log('\n✅ Authentication added to all APIs!');
