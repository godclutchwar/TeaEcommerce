#!/bin/bash
# Render provides DATABASE_URL as postgresql://user:pass@host:port/db
# Spring Boot needs jdbc:postgresql://...
if [ -n "$DATABASE_URL" ]; then
  JDBC_URL="${DATABASE_URL/postgresql:\/\//jdbc:postgresql://}"
  JDBC_URL="${JDBC_URL/postgres:\/\//jdbc:postgresql://}"
  export SPRING_DATASOURCE_URL="$JDBC_URL"
  export SPRING_DATASOURCE_DRIVER=org.postgresql.Driver
fi

exec java -jar app.jar
