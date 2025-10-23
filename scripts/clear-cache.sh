#!/bin/bash

echo "Clearing Next.js cache and build artifacts..."

# Remove .next directory
if [ -d ".next" ]; then
  rm -rf .next
  echo "Removed .next directory."
else
  echo ".next directory not found, skipping."
fi

# Remove node_modules directory
if [ -d "node_modules" ]; then
  rm -rf node_modules
  echo "Removed node_modules directory."
else
  echo "node_modules directory not found, skipping."
fi

# Clear npm cache (optional, but good for a clean slate)
echo "Clearing npm cache..."
npm cache clean --force
echo "npm cache cleared."

echo "Cache clearing complete. Please run 'npm install' or 'pnpm install' next."
