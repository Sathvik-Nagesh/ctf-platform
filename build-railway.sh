#!/bin/bash
set -e

echo "🚀 Starting Railway build process..."

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

echo "🔨 Building React app..."
cd client && npm run build && cd ..

echo "📁 Copying build files to root..."
cp -r client/build .

echo "✅ Railway build completed successfully!"
echo "📂 Build files in root:"
ls -la build/
