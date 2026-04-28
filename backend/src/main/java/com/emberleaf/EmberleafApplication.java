package com.emberleaf;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/*
 * PURPOSE: Entry point for the Spring Boot application.
 *
 * WHAT IT DOES:
 * - @SpringBootApplication is a combination of @Configuration, @EnableAutoConfiguration, and @ComponentScan.
 *   It tells Spring to scan this package and all sub-packages for beans (@Component, @Service, @Repository, @Controller).
 * - SpringApplication.run() bootstraps the entire Spring context — creates beans, starts embedded Tomcat,
 *   connects to H2 database, maps controllers to routes.
 *
 * WHY IT MATTERS:
 * Without this file, Spring Boot has no way to start. It's the first class loaded when running the application.
 */
@SpringBootApplication
public class EmberleafApplication {
    public static void main(String[] args) {
        SpringApplication.run(EmberleafApplication.class, args);
    }
}
