package com.inventory.subscription.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "http://localhost:5175",
                        "http://localhost:5176",
                        "http://localhost:3000",
                        "http://localhost:3001",
                        "http://localhost:3002",
                        "http://localhost:3003",
                        "http://167.71.206.166:3000",
                        "http://167.71.206.166:3001",
                        "http://167.71.206.166:3002",
                        "http://167.71.206.166:3003")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "Content-Type")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
