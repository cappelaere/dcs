# dcs
dcs
## Installation
git clone https://github.com/opendcs/opendcs.git

## Replace
/opendcs/src/main/java/lrgs/archive/MsgFile.java

## Download the SDK from 
wget https://sdk-for-java.amazonwebservices.com/latest/aws-java-sdk.zip
unzip aws-java-sdk.zip
wget https://dlcdn.apache.org//commons/logging/binaries/commons-logging-1.2-bin.zip
unzip commons-logging-1.2-bin.zip

## install ant 1.10.2 so we can build
wget http://archive.apache.org/dist/ant/binaries/apache-ant-1.10.3-bin.tar.gz
tar xvfvz apache-ant-1.10.3-bin.tar.gz 
sudo ln -sfn ~/dcs/apache-ant-1.10.3 /opt/ant
sudo sh -c 'echo ANT_HOME=/opt/ant >> /etc/environment'
sudo ln -sfn /opt/ant/bin/ant /usr/bin/ant

## added dependencies in ivy.xml
<dependencies>
        <dependency org="com.amazonaws" name="aws-java-sdk-sqs" rev="1.12.401"/>
        