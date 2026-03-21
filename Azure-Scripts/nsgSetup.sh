# Create Network Security Groups in Azure 
# ------------------------------------- Web NSG- Frontend VM --------------------------------------
az network create --resource-group three-tier-app --name web-nsg
# Allow Http from internet
az network nsg rule create \
   --resource-group three-tier-app \
   --nsg-name web-nsg  \  
   --name Allow-HTTP \ 
   --priority 100 \ 
   --source-address-prefixes All \ 
   --destination-port-ranges 80  \
   --protocol Tcp --access Allow 

# Allow Https from internet 
az network nsg rule create \  
   --resource-group three-tier-app \
   --nsg-name web-nsg \ 
   --name Allow-HTTPS \
   --priority 110 \
   --source-address-prefixes All \
   --destination-port-ranges 443 \
   --protocol tcp --access Allow 

# Allow SSH from your laptop IP 
az network nsg rule create \
  --resource-group three-tier-app \
  --nsg-name web-nsg \
  --name Allow-SSH \
  --priority 120 \
  --source-address-prefixes <your-home-ip>/32 \
  --destination-port-ranges 22 \
  --protocol Tcp --access Allow

# Deny all other inbound  - Optional
az network nsg rule create \ 
  --resource-group three-tier-app \
  --nsg-name web-nsg \
  --name Deny-All-Inbound \
  --priority 4096 \
  --source-address-prefixes "*" \
  --destination-port-ranges "*" \
  --protocol "*" --access Deny

# --------------------------------- App NSG - Backend VM ----------------------------------------------------------------
az network nsg create \
  --resource-group three-tier-app \
  --name app-nsg

# Allow port 5000 from Web Subnet ONLY
az network nsg rule create \
  --resource-group three-tier-app \
  --nsg-name app-nsg \
  --name Allow-From-Web-Subnet \
  --priority 100 \
  --source-address-prefixes 10.0.1.0/24 \
  --destination-port-ranges 5000 \
  --protocol Tcp --access Allow

# Allow SSH from your IP only
az network nsg rule create \
  --resource-group three-tier-app \
  --nsg-name app-nsg \
  --name Allow-SSH \
  --priority 110 \
  --source-address-prefixes <your-home-ip>/32 \
  --destination-port-ranges 22 \
  --protocol Tcp --access Allow

# Deny all other inbound  - Optional
az network nsg rule create \
  --resource-group three-tier-app \
  --nsg-name app-nsg \
  --name Deny-All-Inbound \
  --priority 4096 \
  --source-address-prefixes "*" \
  --destination-port-ranges "*" \
  --protocol "*" --access Deny


  #------------------------------------------ DB NSG - Azure SQL Private EndPoint ----------------------------------- 
  az network nsg create \
  --resource-group three-tier-app \
  --name db-nsg

# Allow SQL port 1433 from App Subnet ONLY
az network nsg rule create \
  --resource-group three-tier-app \
  --nsg-name db-nsg \
  --name Allow-SQL-From-App \
  --priority 100 \
  --source-address-prefixes 10.0.2.0/24 \
  --destination-port-ranges 1433 \
  --protocol Tcp --access Allow

# Deny everything else - Optional
az network nsg rule create \
  --resource-group three-tier-app \
  --nsg-name db-nsg \
  --name Deny-All-Inbound \
  --priority 4096 \
  --source-address-prefixes "*" \
  --destination-port-ranges "*" \
  --protocol "*" --access Deny

#  -------------------------------------------------- Associate NSGs to Subnets  ----------------------------------
az network vnet subnet update \
  --resource-group three-tier-app \
  --vnet-name CentralvNet-01 \
  --name WebSubnet-01 \
  --network-security-group web-nsg

az network vnet subnet update \
  --resource-group three-tier-app \
  --vnet-name CentralvNet-01 \
  --name AppSubnet-01 \
  --network-security-group app-nsg

az network vnet subnet update \
  --resource-group three-tier-app \
  --vnet-name CentralvNet-01 \
  --name DBSubnet-01 \
  --network-security-group db-nsg