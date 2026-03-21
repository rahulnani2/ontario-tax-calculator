#!/bin/bash

#Create a Azure Resource group :: 
az group create --name three-tier-app --location canadacentral

# Create azure vNet   --> Web Subnet --> App Subnet --> DB Subnet

az network vnet create --resource-group three-tier-app --name CentralvNet-01 --address-prefix 10.0.0.0/16  --location canadacentral

#Subnets
az network vnet subnet create --resource-group three-tier-app --vnet-name CentralvNet-01 --name WebSubnet-01 --address-prefixes 10.0.1.0/24
az network vnet subnet create --resource-group three-tier-app --vnet-name CentralvNet-01 --name AppSubnet-01 --address-prefixes 10.0.2.0/24
az network vnet subnet create --resource-group three-tier-app --vnet-name CentralvNet-01 --name DBSubnet-01 --address-prefixes 10.0.3.0/24

# Create a Web-VM 
# 1. Create a Public IP address
az network public-ip create --resource-group three-tier-app --name WebPublicIP --sku Standard --allocation-method Static --location canadacentral

# 2. Create a Network Interface Card (NIC) attached to WebSubnet + Public IP
az network nic create --resource-group three-tier-app --name WebNIC-01 --vnet-name CentralvNet-01 --subnet WebSubnet-01 --public-ip-address WebPublicIP --location canadacentral

# 3. Create the Free-tier VM using the NIC
az vm create --resource-group three-tier-app --name WebVM-01 --nics WebNIC-01 --image Ubuntu2204 --size Standard_D2s_v5 --admin-username azureuser --generate-ssh-keys --location canadacentral

# Create a App-VM 
# 1. Create a Public IP address
az network public-ip create --resource-group three-tier-app --name myAppPublicIP --sku Standard --allocation-method Static --location canadacentral

# 2. Create a Network Interface Card (NIC) attached to AppSubnet + Public IP
az network nic create --resource-group three-tier-app --name AppNIC-01 --vnet-name CentralvNet-01 --subnet AppSubnet-01 --public-ip-address myAppPublicIP --location canadacentral

# 3. Create the Free-tier VM using the NIC
az vm create --resource-group three-tier-app --name AppVM-01 --nics AppNIC-01 --image Ubuntu2204 --size Standard_D2s_v5 --admin-username azureuser --generate-ssh-keys --location canadacentral

# Create SQL Database Server in Azure 
az sql server create --resource-group three-tier-app --name ontario-tax-calculator --location canadacentral --admin-user ontaxsqldbadmin --admin-password mySQLAdminPassword

# Configure a server-based firewall rule 


# Create a Single Database
az sql db create --resouce-group three-tier-app --server ontario-tax-calculator --name on-taxdb --sample-name taxCalcinfoDB --edition GeneralPurpose --compute-model Serverless --family Gen5 --capacity 2

