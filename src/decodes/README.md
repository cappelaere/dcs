# Building the Decodes Client

## Instal Gradle
export GRADLE=/app/dcs/gradle-8.0.2/bin

## Build
cd src/decodes
$GRADLE/gradle build
$GRADLE/gradle jar
$GRADLE/gradle shadowjar

java -cp build/libs/decodes-getting-started-0.0.1.jar examples.DecodesExample messages/33A07AAC.json
java -cp build/libs/decodes-getting-started-0.0.1.jar examples.DecodesExample messages/33A0747E.json

java -cp build/libs/decodes-getting-started-0.0.1.jar examples.DecodesExample messages/33A1282A.json
java -cp build/libs/decodes-getting-started-0.0.1.jar examples.DecodesExample messages/33A126F8.json
