package com.chaiandleaf.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/*
 * Resolves database connection at startup from either:
 *   DATABASE_URL  — Render's native format: postgresql://user:pass@host:port/db
 *   SPRING_DATASOURCE_URL — already JDBC format: jdbc:postgresql://...
 * Injects spring.datasource.* properties with highest priority so Hibernate
 * always has a valid URL regardless of placeholder resolution ordering.
 * Registered via both spring.factories (Boot 2.x) and .imports file (Boot 3.x).
 */
public class DatabaseUrlPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> props = new HashMap<>();

        // Priority 1: DATABASE_URL in postgresql:// format (Render native)
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl != null && !databaseUrl.isBlank()) {
            try {
                String normalized = databaseUrl
                        .replaceFirst("^postgresql://", "http://")
                        .replaceFirst("^postgres://", "http://");
                URI uri = new URI(normalized);
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String[] userInfo = uri.getUserInfo().split(":", 2);
                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + uri.getPath();
                props.put("spring.datasource.url", jdbcUrl);
                props.put("spring.datasource.username", userInfo[0]);
                props.put("spring.datasource.password", userInfo.length > 1 ? userInfo[1] : "");
                props.put("spring.datasource.driver-class-name", "org.postgresql.Driver");
            } catch (Exception ignored) {}
        }

        // Priority 2: SPRING_DATASOURCE_URL already in jdbc:postgresql:// format
        if (!props.containsKey("spring.datasource.url")) {
            String springUrl = System.getenv("SPRING_DATASOURCE_URL");
            if (springUrl != null && !springUrl.isBlank()) {
                props.put("spring.datasource.url", springUrl);
                props.put("spring.datasource.driver-class-name", "org.postgresql.Driver");
                String user = System.getenv("SPRING_DATASOURCE_USERNAME");
                String pass = System.getenv("SPRING_DATASOURCE_PASSWORD");
                if (user != null) props.put("spring.datasource.username", user);
                if (pass != null) props.put("spring.datasource.password", pass);
            }
        }

        if (!props.isEmpty()) {
            environment.getPropertySources()
                    .addFirst(new MapPropertySource("render-database-url", props));
        }
    }
}
