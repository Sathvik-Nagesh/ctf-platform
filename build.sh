#!/bin/bash

# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..

# Build the client
cd client && npm run build && cd ..

# Copy build files to root for serving
cp -r client/build/* .

echo "Build completed successfully!" 