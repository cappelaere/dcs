all: target/aws-sqs.jar

target/aws-sqs.jar: src/main/java/*.java
	mvn package

clean:
	mvn clean