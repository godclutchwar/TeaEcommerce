package com.chaiandleaf.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/*
 * Converts Render's DATABASE_URL (postgresql://user:pass@host:port/db)
 * into Spring datasource properties at startup, before any bean is created.
 * Registered via META-INF/spring.factories.
 */
public class DatabaseUrlPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) return;

        try {
            // Normalize to http:// so java.net.URI can parse it
            String normalized = databaseUrl
                    .replaceFirst("^postgresql://", "http://")
                    .replaceFirst("^postgres://", "http://");

            URI uri = new URI(normalized);

            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String dbName = uri.getPath(); // already has leading /
            String[] userInfo = uri.getUserInfo().split(":", 2);
            String username = userInfo[0];
            String password = userInfo.length > 1 ? userInfo[1] : "";

            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + dbName;

            Map<String, Object> props = new HashMap<>();
            props.put("spring.datasource.url", jdbcUrl);
            props.put("spring.datasource.username", username);
            props.put("spring.datasource.password", password);
            props.put("spring.datasource.driver-class-name", "org.postgresql.Driver");

            environment.getPropertySources()
                    .addFirst(new MapPropertySource("render-database-url", props));
        } catch (Exception ignored) {
            // Parsing failed — fall through to application.properties defaults
        }
    }
}
