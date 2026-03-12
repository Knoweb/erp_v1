package com.inventory.gateway.config;

import com.inventory.gateway.filter.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

        @Autowired
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @Bean
        public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
                return builder.routes()
                                // 1. PUBLIC ROUTES

                                // Auth (Login, Register, Refresh)
                                .route("identity-auth-public", r -> r
                                                .path("/api/auth/**")
                                                .uri("lb://identity-service"))

                                // Logo Upload & Access
                                .route("user-logo-public", r -> r
                                                .path("/api/organizations/logo/**")
                                                .uri("lb://user-service"))

                                // Static File Access (Uploaded Logos)
                                .route("user-uploads-public", r -> r
                                                .path("/uploads/**")
                                                .uri("lb://user-service"))

                                // Organization Registration
                                .route("user-org-register", r -> r
                                                .path("/api/organizations")
                                                .and().method("POST")
                                                .uri("lb://user-service"))
                                
                                // Organization Data - GET requests to identity-service
                                .route("identity-organizations-get", r -> r
                                                .path("/api/organizations/**")
                                                .and().method("GET")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://identity-service"))
                                
                                // Organization Data - PUT requests to identity-service
                                .route("identity-organizations-put", r -> r
                                                .path("/api/organizations/**")
                                                .and().method("PUT")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://identity-service"))

                                // 2. PROTECTED ROUTES

                                // Identity - Users
                                .route("identity-users-protected", r -> r
                                                .path("/api/users/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://identity-service"))

                                // Product Service (including categories, brands, pharmacy)
                                .route("product-service", r -> r
                                                .path("/api/products/**", "/api/categories/**", "/api/brands/**",
                                                                "/api/pharmacy/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://product-service"))

                                // Inventory Service
                                .route("inventory-service", r -> r
                                                .path("/api/inventory/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://inventory-service"))

                                // Order Service
                                .route("order-service", r -> r
                                                .path("/api/orders/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://order-service"))

                                // Warehouse Service
                                .route("warehouse-service", r -> r
                                                .path("/api/warehouses/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://warehouse-service"))

                                // User Service - Protected (Branches only, organizations handled by identity-service)
                                .route("user-service", r -> r
                                                .path("/api/branches/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://user-service"))

                                // Supplier Service
                                .route("supplier-service", r -> r
                                                .path("/api/suppliers/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://supplier-service"))

                                // Notification Service
                                .route("notification-service", r -> r
                                                .path("/api/notifications/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://notification-service"))

                                // Subscription Service - Protected (Dashboard access control)
                                .route("subscription-service", r -> r
                                                .path("/api/subscriptions/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://subscription-service"))

                                // Catalog Service
                                .route("catalog-service", r -> r
                                                .path("/api/catalog/**", "/api/schemas/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://catalog-service"))

                                // Reporting Service
                                .route("reporting-service", r -> r
                                                .path("/api/reports/**", "/api/analytics/**", "/api/audit/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://reporting-service"))
                                
                                // Ginuma Service - Super Admin (Protected)
                                .route("ginuma-superadmin", r -> r
                                                .path("/api/superadmin/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://ginuma-service"))
                                
                                // Ginuma Service - Company-specific endpoints with companyId in path
                                // Pattern: /api/companies/{companyId}/...
                                .route("ginuma-company-specific", r -> r
                                                .path("/api/companies/*/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://ginuma-service"))
                                
                                // Ginuma Service - Companies base (Protected)
                                .route("ginuma-companies", r -> r
                                                .path("/api/companies/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://ginuma-service"))
                                
                                // Ginuma Service - Employees with companyId
                                // Pattern: /api/employees/{companyId}
                                .route("ginuma-employees-company", r -> r
                                                .path("/api/employees/*/**", "/api/employees/*")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://ginuma-service"))
                                
                                // Ginuma Service - Employees base (Protected)
                                .route("ginuma-employees", r -> r
                                                .path("/api/employees/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://ginuma-service"))
                                
                                // Ginuma Service - Departments with companyId first
                                // Pattern: /api/{companyId}/departments
                                .route("ginuma-company-departments", r -> r
                                                .path("/api/*/departments/**", "/api/*/departments")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://ginuma-service"))
                                
                                // Ginuma Service - Designations with companyId first
                                // Pattern: /api/{companyId}/designations
                                .route("ginuma-company-designations", r -> r
                                                .path("/api/*/designations/**", "/api/*/designations")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://ginuma-service"))
                                
                                // Ginuma Service - Purchase Orders with companyId first
                                // Pattern: /api/{companyId}/purchase-orders
                                .route("ginuma-company-purchase-orders", r -> r
                                                .path("/api/*/purchase-orders/**", "/api/*/purchase-orders")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://ginuma-service"))
                                
                                // Ginuma Service - Users with companyId
                                // Pattern: /api/users/{companyId}
                                .route("ginuma-users-company", r -> r
                                                .path("/api/users/*/**", "/api/users/*")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://ginuma-service"))
                                
                                // Ginuma Service - General departments (Protected)
                                .route("ginuma-departments", r -> r
                                                .path("/api/departments/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://ginuma-service"))
                                
                                // Ginuma Service - General payroll (Protected)
                                .route("ginuma-payroll", r -> r
                                                .path("/api/payroll/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://ginuma-service"))
                                
                                // Ginuma Service - Other common endpoints
                                .route("ginuma-common", r -> r
                                                .path("/api/currencies/**", "/api/countries/**", 
                                                      "/api/customers/**", "/api/suppliers/**",
                                                      "/api/sales-orders/**", "/api/aged-receivables/**")
                                                .filters(f -> f.filter(jwtAuthenticationFilter
                                                                .apply(new JwtAuthenticationFilter.Config())))
                                                .uri("lb://ginuma-service"))

                                .build();
        }
}
