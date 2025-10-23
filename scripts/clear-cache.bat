@echo off
echo Clearing Next.js cache and build artifacts...

REM Remove .next directory
if exist ".next" (
  rd /s /q ".next"
  echo Removed .next directory.
) else (
  echo .next directory not found, skipping.
)

REM Remove node_modules directory
if exist "node_modules" (
  rd /s /q "node_modules"
  echo Removed node_modules directory.
) else (
  echo node_modules directory not found, skipping.
)

REM Clear npm cache (optional, but good for a clean slate)
echo Clearing npm cache...
npm cache clean --force
echo npm cache cleared.

echo Cache clearing complete. Please run 'npm install' or 'pnpm install' next.
