# dcs
dcs
## EC2 instance with Docker installed in userdata

## 200MB Addtional Volume
mount to /app

lsblk
sudo file -s /dev/xvdf
sudo mkfs -t xfs /dev/xvdf
sudo mkdir /app
sudo mount /dev/xvdf /app

## Installation

### install Java-11
sudo yum install java-11-amazon-corretto

sudo yum install maven
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
nvm install v16

sudo yum install git

## install ant 1.10.2 so we can build
wget http://archive.apache.org/dist/ant/binaries/apache-ant-1.10.3-bin.tar.gz
tar xvfvz apache-ant-1.10.3-bin.tar.gz 
sudo ln -sfn /home/ec2-user/apache-ant-1.10.3 /opt/ant
sudo sh -c 'echo ANT_HOME=/opt/ant >> /etc/environment'
sudo ln -sfn /opt/ant/bin/ant /usr/bin/ant

## clone the app
cd /app
git clone https://github.com/opendcs/opendcs.git


## Replace
src/main/java/lrgs/archive/MsgFile.java -> opendcs/
src/main/java/lrgs/archive/PublishSNS.java -> opendcs/
src/ivy.xml -> opendcs


## Build
cd /app/dcs
source .env
cd opendcs
ant jar
ant opendcs

## Run the installer for single user
java -jar ./stable/opendcs-ot-7.0.4.jar
-> /app/dcs/opendcs/OPENDCS
source .env

### Added username/password to .lrgs.passwrd
run editPasswd
```
 adduser cappelaere
 addrole cappelaere admin
 addrole cappelaere dds
 write
 quit
```

## Edit ddsrecv.conf

## Rebuild jar as necessary
cd opendcs
ant jar
cp /app/dcs/opendcs/build/lib/opendcs.jar /app/dcs/opendcs/OPENDCS/bin/opendcs.jar

## Restart LGRS
startLRGS -l $LRGSHOME/lrgslog #-d 3

