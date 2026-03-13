# Multi-stage build for Spring Boot application
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven
RUN mvn clean package -DskipTests && \
	if ls target/*.jar >/dev/null 2>&1; then cp target/*.jar target/app.bin; \
	elif ls target/*.war >/dev/null 2>&1; then cp target/*.war target/app.bin; \
	else echo "No build artifact found in target" && exit 1; fi

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/app.bin /app/app.bin
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.bin"]
