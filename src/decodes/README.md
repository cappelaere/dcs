# Building the Decodes Client

## Instal Gradle
export GRADLE=/app/dcs/gradle-8.0.2/bin

## Build
cd src/kafka
$GRADLE/gradle build
$GRADLE/gradle jar
$GRADLE/gradle shadowjar

java -cp build/libs/decodes-getting-started-0.0.1.jar examples.DecodesExample 