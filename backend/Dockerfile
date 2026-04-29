# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Cache dependencies
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Create uploads directory
RUN mkdir uploads
EXPOSE 8080
# Use a non-root user for security if possible, but keeping it simple for now
ENTRYPOINT ["java", "-jar", "app.jar"]
