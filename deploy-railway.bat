@echo off
REM RenalSense Deployment Script for Railway (Windows)

echo 🚀 Deploying RenalSense to Railway...

REM Check if Railway CLI is installed
where railway >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Installing Railway CLI...
    npm install -g @railway/cli
)

REM Check if user is logged in
echo 🔑 Checking Railway authentication...
railway whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Please login to Railway:
    railway login
)

REM Initialize Railway project
echo ⚙️ Initializing Railway project...
railway init

REM Set environment variables
echo 🔧 Setting up environment variables...
railway variables set NODE_ENV=production
railway variables set PORT=3000

REM Deploy the application
echo 🚀 Deploying application...
railway up

echo ✅ Deployment complete!
echo 🌐 Your app will be available at the Railway-provided URL
echo 📊 Check deployment status: railway status
echo 📝 View logs: railway logs

pause