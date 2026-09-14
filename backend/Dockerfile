# Etapa 1: Compilacion y empaquetado del artefacto Java
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copiar definicion de dependencias
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copiar codigo fuente y construir JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Imagen final liviana de ejecucion
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Crear usuario sin privilegios por seguridad
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copiar artefacto compilado desde la etapa de construccion
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
