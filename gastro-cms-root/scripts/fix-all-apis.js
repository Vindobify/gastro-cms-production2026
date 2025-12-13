const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../src/app/api');

function fixApiFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip auth files and files that already have proper exports
    if (filePath.includes('/auth/') || content.includes('export const GET = withAuth(')) {
        console.log(`  - Skipping: ${filePath}`);
        return;
    }
    
    // Find function definitions and rename them
    const functionMap = new Map();
    const functionRegex = /async function (GET|POST|PUT|DELETE)\(/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
        const method = match[1];
        const newName = method.toLowerCase() + 'Handler';
        functionMap.set(method, newName);
        
        // Rename the function
        content = content.replace(
            new RegExp(`async function ${method}\\(`),
            `async function ${newName}(`
        );
    }
    
    if (functionMap.size === 0) {
        console.log(`  - No functions found: ${filePath}`);
        return;
    }
    
    // Remove any existing exports
    content = content.replace(/\n\/\/ Export protected handlers\n.*$/s, '');
    
    // Add proper exports
    let exports = '\n// Export protected handlers\n';
    functionMap.forEach((newName, method) => {
        exports += `export const ${method} = withAuth(${newName});\n`;
    });
    
    content += exports;
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${filePath}: ${Array.from(functionMap.keys()).join(', ')}`);
}

function traverseDirectory(directory) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(dirent => {
        const fullPath = path.join(directory, dirent.name);
        if (dirent.isDirectory()) {
            traverseDirectory(fullPath);
        } else if (dirent.isFile() && dirent.name === 'route.ts') {
            fixApiFile(fullPath);
        }
    });
}

console.log('Fixing all API exports...');
traverseDirectory(apiDir);
console.log('\n✅ All API exports fixed!');
