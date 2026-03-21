#!/bin/bash
# Install node.js and npm
sudo apt update 

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - 
sudo apt-get install -y nodejs

sudo npm install -g pm2

# Build the node backend Application in local or on VM based on source code location using the below commands
npm install 

# Build the backend code in your laptop
npm run build


# Copy the build output to the app directory /home/azureuser/app/
scp -i id_rsa  -r /d/Rahul\ Learning/Ontario\ Tax\ Calculator/backend/dist/   azureuser@<AppVM_PublicIP>:/home/azureuser/ontario-tax-calculator/
scp -i id_rsa  -r /d/Rahul\ Learning/Ontario\ Tax\ Calculator/backend/package.json   azureuser@<AppVM_PublicIP>:/home/azureuser/ontario-tax-calculator/
scp -i id_rsa  -r /d/Rahul\ Learning/Ontario\ Tax\ Calculator/backend/package-lock.json   azureuser@<AppVM_PublicIP>:/home/azureuser/ontario-tax-calculator/

# Install dependencies without dev dependencies in the App server
npm install --omit=dev

# Create production .env
nano /home/azureuser/ontario-tax-calculator/.env

# Start the backend application using pm2
pm2 start /home/azureuser/ontario-tax-calculator/server.js --name ontario-tax-calculator-api

# Save the pm2 startup script
pm2 save
pm2 startup

# Check the status of PM2 
pm2 status

# Perform the local health checks 
curl http://localhost:5000/health
curl http://localhost:5000/api/tax-data/2024 
curl curl -X POST http://localhost:5000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "tax_year": 2024,
    "employment_income": 95000,
    "self_employment_income": 0,
    "investment_income": 0,
    "rrsp_contribution": 5000,
    "other_deductions": 0,
    "other_credits": 0
  }'

# Test if port 1433 is reachbale from App Virtual machine
nc -zv <your-sql-server>.database.windows.net 1433
