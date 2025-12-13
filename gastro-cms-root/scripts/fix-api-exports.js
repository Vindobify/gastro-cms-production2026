const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../src/app/api');

function fixApiFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file already has exports
    if (content.includes('export const GET = withAuth') || content.includes('export async function')) {
        console.log(`  - Already has exports: ${filePath}`);
        return;
    }
    
    // Find function definitions
    const functions = [];
    const functionRegex = /async function (GET|POST|PUT|DELETE)\(/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
        functions.push(match[1]);
    }
    
    if (functions.length === 0) {
        console.log(`  - No functions found: ${filePath}`);
        return;
    }
    
    // Add exports at the end
    let exports = '\n// Export protected handlers\n';
    functions.forEach(func => {
        exports += `export const ${func} = withAuth(${func});\n`;
    });
    
    content += exports;
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed exports for ${filePath}: ${functions.join(', ')}`);
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

console.log('Fixing API exports...');
traverseDirectory(apiDir);
console.log('\n✅ API exports fixed!');
