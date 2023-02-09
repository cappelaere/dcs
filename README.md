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
sudo yum install java-1.8.0-amazon-corretto
sudo yum install java-11-amazon-corretto-headless

## Make sure to keep java-11
sudo alternatives --config java
sudo alternatives --config javac

sudo yum install mvn
sudo yum install maven

yum install git
cd /app
git clone https://github.com/opendcs/opendcs.git


## Replace
src/main/java/lrgs/archive/MsgFile.java -> opendcs/
src/main/java/lrgs/archive/PublishSNS.java -> opendcs/
src/ivy.xml -> opendcs


## install ant 1.10.2 so we can build
wget http://archive.apache.org/dist/ant/binaries/apache-ant-1.10.3-bin.tar.gz
tar xvfvz apache-ant-1.10.3-bin.tar.gz 
sudo ln -sfn /app/dcs/apache-ant-1.10.3 /opt/ant
sudo sh -c 'echo ANT_HOME=/opt/ant >> /etc/environment'
sudo ln -sfn /opt/ant/bin/ant /usr/bin/ant

## Build
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

## Restart LGRS
startLRGS -l $LRGSHOME/lrgslog -d 3

## Rebuild jar
cd opendcs
ant jar
cp /app/dcs/opendcs/build/lib/opendcs.jar /app/dcs/opendcs/OPENDCS/bin/opendcs.jar
