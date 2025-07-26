@echo off 
echo Installing MERN E2E Chat Application... 
echo. 
echo Step 1: Installing Node.js Dependencies... 
npm install 
echo. 
echo Step 2: Setting up database... 
node setup-db.js 
echo. 
echo ✓ Installation completed successfully! 
echo. 
echo To start the development server, run: start-dev.bat 
echo To start the production server, run: start-prod.bat 
echo. 
pause 
