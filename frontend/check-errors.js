// Simple error checker for the project
import fs from 'fs';
import path from 'path';

console.log('Checking for common issues...');

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('❌ node_modules not found - dependencies need to be installed');
} else {
  console.log('✅ node_modules exists');
}

// Check package.json
if (fs.existsSync('package.json')) {
  console.log('✅ package.json exists');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('Dependencies:', Object.keys(pkg.dependencies || {}));
} else {
  console.log('❌ package.json not found');
}

// Check key files
const keyFiles = [
  'src/main.tsx',
  'src/App.tsx', 
  'src/contexts/AuthContext.tsx',
  'src/pages/Login.tsx'
];

keyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

console.log('Error check complete.');
