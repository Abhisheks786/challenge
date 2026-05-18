const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const clientDir = path.join(__dirname, 'client', 'src');
const serverDir = path.join(__dirname, 'server', 'src');

const processDir = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      const isTsx = fullPath.endsWith('.tsx');
      
      const result = babel.transformFileSync(fullPath, {
        presets: [
          ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]
        ],
        plugins: ['@babel/plugin-syntax-jsx'],
        retainLines: true,
      });

      if (result && result.code) {
        const newExt = isTsx ? '.jsx' : '.js';
        const newPath = fullPath.substring(0, fullPath.lastIndexOf('.')) + newExt;
        let newCode = result.code;
        
        // Remove type imports
        newCode = newCode.replace(/import type {[^}]+} from ['"].*['"];?\n?/g, '');
        // Replace .tsx and .ts imports
        newCode = newCode.replace(/\.tsx?/g, '.js'); // Vite handles .js for imports

        fs.writeFileSync(newPath, newCode);
        fs.unlinkSync(fullPath); // Delete old TS file
        console.log(`Converted: ${fullPath} -> ${newPath}`);
      }
    }
  }
};

processDir(clientDir);
processDir(serverDir);
