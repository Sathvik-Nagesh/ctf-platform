#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 GitXTribe CTF Platform Setup');
console.log('================================\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js version: ${nodeVersion.trim()}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Check if npm is installed
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' });
  console.log(`✅ npm version: ${npmVersion.trim()}`);
} catch (error) {
  console.error('❌ npm is not installed. Please install npm first.');
  process.exit(1);
}

// Create necessary directories
const dirs = [
  'server/uploads',
  'server/logs',
  'client/public'
];

console.log('\n📁 Creating directories...');
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created: ${dir}`);
  } else {
    console.log(`ℹ️  Already exists: ${dir}`);
  }
});

// Copy environment file
console.log('\n📝 Setting up environment variables...');
if (!fs.existsSync('.env')) {
  if (fs.existsSync('env.example')) {
    fs.copyFileSync('env.example', '.env');
    console.log('✅ Created .env file from env.example');
    console.log('⚠️  Please edit .env file with your Firebase configuration');
  } else {
    console.log('⚠️  env.example not found. Please create .env file manually');
  }
} else {
  console.log('ℹ️  .env file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');

try {
  console.log('Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Installing server dependencies...');
  execSync('cd server && npm install', { stdio: 'inherit' });
  
  console.log('Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  console.log('✅ All dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Create .gitignore
console.log('\n📝 Creating .gitignore...');
const gitignoreContent = `
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build files
build/
dist/
*/build/
*/dist/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Uploaded files
server/uploads/*
!server/uploads/.gitkeep

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log
ui-debug.log

# Temporary files
*.tmp
*.temp
`;

if (!fs.existsSync('.gitignore')) {
  fs.writeFileSync('.gitignore', gitignoreContent.trim());
  console.log('✅ Created .gitignore');
} else {
  console.log('ℹ️  .gitignore already exists');
}

// Create .gitkeep for uploads directory
const uploadsGitkeep = path.join('server', 'uploads', '.gitkeep');
if (!fs.existsSync(uploadsGitkeep)) {
  fs.writeFileSync(uploadsGitkeep, '');
  console.log('✅ Created .gitkeep for uploads directory');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Create a Firebase project at https://console.firebase.google.com');
console.log('2. Enable Firestore Database in your Firebase project');
console.log('3. Generate a service account key and download the JSON file');
console.log('4. Edit the .env file with your Firebase configuration');
console.log('5. Run "npm run dev" to start the development servers');
console.log('\n📚 For more information, see the README.md file'); 