# Demo  March 2023

Check VPN on ERAV: erav-e.noaa.gov/nesdis5006hq
Start DCS App
cd ~/.ssh
ssh opendcs

cd /home/ec2-user/dcs
source .env
cd $LRGSHOME
rm lrgs.lock lrgs.nohup lrgs.log
rm -rf archive/*
startLRGS -l lrgs.log 


Users:
- End-user
- Operator

## Operator

## GeoXO Portal
Show Left Navbar
/Services and documentation
/Demo Architecture / Dashboards and Services

### Other support SaaS services for demo
-> ElasticSearch Current size/status of DCS Stream
-> DCS Logfile
-> Software Bus Status
-> User Management

## End-user

### Start DCS 
-> Start DCS application

### DCS Streaming Near Real-time
Use DCS CLI
#### Subscribe to topic
Observe Data Streaming Kafka (Mode 1)
Data can be stored locally
Data can be processed on the cloud

#### Data Discovery and Access
DCS standard Query
DCS SQL queries


