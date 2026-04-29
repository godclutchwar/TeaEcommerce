#!/bin/bash
# Render provides DATABASE_URL as postgresql://user:pass@host:port/db
# Spring Boot needs jdbc:postgresql://... without user and pass in URL
if [ -n "$DATABASE_URL" ]; then
  # Remove the 'postgresql://' or 'postgres://' prefix
  URL_WITHOUT_PROTO="${DATABASE_URL#*://}"
  
  # Extract user and password (everything before @)
  CREDENTIALS="${URL_WITHOUT_PROTO%%@*}"
  
  # Extract host, port, db (everything after @)
  HOST_PORT_DB="${URL_WITHOUT_PROTO#*@}"
  
  # Split credentials into user and password
  DB_USER="${CREDENTIALS%%:*}"
  DB_PASS="${CREDENTIALS#*:}"
  
  export SPRING_DATASOURCE_URL="jdbc:postgresql://$HOST_PORT_DB"
  export SPRING_DATASOURCE_USERNAME="$DB_USER"
  export SPRING_DATASOURCE_PASSWORD="$DB_PASS"
  export SPRING_DATASOURCE_DRIVER="org.postgresql.Driver"
fi

exec java -jar app.jar
