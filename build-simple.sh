#!/bin/bash
echo "Installing root dependencies..."
npm install

echo "Installing server dependencies..."
cd server && npm install && cd ..

echo "Installing client dependencies..."
cd client && npm install && cd ..

echo "Building client..."
cd client && npm run build && cd ..

echo "Copying build files..."
cp -r client/build/* .

echo "Build completed!"
