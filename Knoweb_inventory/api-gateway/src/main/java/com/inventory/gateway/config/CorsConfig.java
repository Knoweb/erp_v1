package com.inventory.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Global CORS Configuration for Spring Cloud Gateway (Reactive)
 * Allows multiple frontend origins to communicate with backend microservices
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        
        // Allow multiple frontend origins
        corsConfig.addAllowedOrigin("http://localhost:5173"); // Knoweb Main Portal
        corsConfig.addAllowedOrigin("http://localhost:5174"); // Inventory Frontend
        corsConfig.addAllowedOrigin("http://localhost:5176"); // Ginuma Frontend
        corsConfig.addAllowedOrigin("http://localhost:3000");  // Alternative Frontend
        
        // Allow all HTTP methods (GET, POST, PUT, DELETE, OPTIONS, etc.)
        corsConfig.addAllowedMethod("*");
        
        // Allow all headers
        corsConfig.addAllowedHeader("*");
        
        // Expose headers so frontend can read them
        corsConfig.addExposedHeader("Authorization");
        corsConfig.addExposedHeader("Content-Type");
        corsConfig.addExposedHeader("X-User-Id");
        corsConfig.addExposedHeader("X-Username");
        
        // Allow credentials (cookies, authorization headers)
        corsConfig.setAllowCredentials(true);
        
        // Cache preflight response for 1 hour
        corsConfig.setMaxAge(3600L);

        // Apply CORS configuration to all routes
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
