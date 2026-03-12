package com.example.GinumApps.config;

import com.example.GinumApps.filter.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Security Configuration for Resource Server.
 * This service acts as a backend microservice behind an API Gateway.
 * Authentication is handled by the Identity Service, and this service validates JWT tokens.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    @Order(1)
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CORS - Gateway handles CORS to prevent duplicate headers
                .cors(cors -> cors.disable())
                
                // Disable CSRF (stateless API with JWT)
                .csrf(csrf -> csrf.disable())

                // Set session management to STATELESS (no server-side sessions)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Configure authorization rules
                // 🔓 SIMPLIFIED: Only check if user has valid JWT (authenticated), no role checks
                .authorizeHttpRequests(auth -> auth
                        // Allow OPTIONS requests (CORS preflight)
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        
                        // SSO Tenant Setup - MUST be before authenticated() to avoid 401
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/tenant/setup").permitAll()
                        
                        // Public endpoints (no authentication required)
                        .requestMatchers(
                                "/actuator/**",           // Health checks for Eureka
                                "/v3/api-docs/**",        // API documentation
                                "/swagger-ui/**",         // Swagger UI
                                "/swagger-ui.html",
                                "/api/auth/**",           // Authentication endpoints (if any local auth exists)
                                "/api/countries",         // Public reference data
                                "/api/currencies",
                                "/api/superadmin/companies/sync/**",  // Internal service-to-service sync
                                "/error"
                        ).permitAll()
                        
                        // ✅ ALL OTHER ENDPOINTS: Just require valid JWT token (no role checks)
                        // This allows ANY authenticated user to access ANY endpoint
                        // Even if JWT has empty roles=[], as long as token is valid, access is granted
                        .anyRequest().authenticated()
                )

                // Add JWT authentication filter before UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfiguration corsConfiguration() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOriginPattern("*");
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setAllowCredentials(true);
        return config;
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration());
        return source;
    }
}
