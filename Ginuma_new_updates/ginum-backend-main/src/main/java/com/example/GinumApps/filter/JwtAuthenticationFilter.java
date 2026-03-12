package com.example.GinumApps.filter;

import com.example.GinumApps.util.TenantContext;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JWT Authentication Filter for Resource Server.
 * Validates JWT tokens from API Gateway and extracts user context.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${jwt.secret}")
    private String jwtSecret;

    /**
     * Skip JWT authentication for public endpoints
     * This prevents setting AnonymousAuthenticationToken for endpoints that should be fully public
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // Skip JWT filter for tenant setup endpoint (called by Identity Service without token)
        if ("POST".equals(method) && path.equals("/api/tenant/setup")) {
            logger.debug("Skipping JWT filter for tenant setup endpoint: " + path);
            return true;
        }
        
        // Skip for other public endpoints
        if (path.startsWith("/actuator/") ||
            path.startsWith("/v3/api-docs") ||
            path.startsWith("/swagger-ui") ||
            path.equals("/swagger-ui.html") ||
            path.startsWith("/api/auth/") ||
            path.equals("/api/countries") ||
            path.equals("/api/currencies") ||
            path.equals("/error")) {
            return true;
        }
        
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // Clear any existing authentication and tenant context
            SecurityContextHolder.clearContext();
            TenantContext.clear();

            // Extract token from Authorization header
            String token = extractTokenFromRequest(request);

            if (token != null && validateAndProcessToken(token, request)) {
                // Token was valid and authentication was set
            }

        } catch (Exception e) {
            logger.error("Cannot authenticate user: " + e.getMessage(), e);
        }

        // Continue the filter chain
        filterChain.doFilter(request, response);
    }

    /**
     * Extract Bearer token from Authorization header
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    /**
     * Validate JWT token and set up authentication context
     */
    private boolean validateAndProcessToken(String token, HttpServletRequest request) {
        try {
            logger.debug("======= JWT Validation Debug =======");
            logger.debug("Token received (first 50 chars): " + (token.length() > 50 ? token.substring(0, 50) + "..." : token));
            logger.debug("JWT Secret configured (first 20 chars): " + jwtSecret.substring(0, 20) + "...");
            
            // Parse and validate the JWT token using BASE64 decoding (matching identity-service)
            byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
            logger.debug("Secret key bytes length after BASE64 decode: " + keyBytes.length + " bytes (" + (keyBytes.length * 8) + " bits)");
            
            SecretKey key = Keys.hmacShaKeyFor(keyBytes);
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            logger.info("✅ JWT validation successful!");
            logger.info("📋 ALL CLAIMS: " + claims);

            // Extract claims (matching identity-service JWT structure)
            String username = claims.get("username", String.class);
            String email = claims.get("email", String.class);
            Object userIdObj = claims.get("userId");
            Object orgIdObj = claims.get("orgId");
            String tenantId = claims.get("tenantId", String.class);
            
            // Convert userId and orgId to String (they might be Long)
            String userId = userIdObj != null ? String.valueOf(userIdObj) : null;
            String organizationId = orgIdObj != null ? String.valueOf(orgIdObj) : null;
            
            logger.info("📧 Extracted - username: " + username + ", userId: " + userId + ", orgId: " + organizationId + ", tenantId: " + tenantId);
            
            // Extract roles - can be stored as List or comma-separated string
            List<String> roles = extractRoles(claims);
            logger.info("🎭 Extracted roles from JWT: " + roles + " (count: " + roles.size() + ")");

            // Set tenant context for multi-tenant queries (use orgId as tenant)
            if (organizationId != null && !organizationId.isEmpty()) {
                TenantContext.setCurrentTenant(organizationId);
                logger.info("🏢 Set tenant context to orgId: " + organizationId);
            }

            // Convert roles to Spring Security authorities
            List<SimpleGrantedAuthority> authorities = roles.stream()
                    .map(role -> {
                        // Ensure roles have ROLE_ prefix
                        String authorityName = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                        logger.info("   ↳ Mapping role '" + role + "' → authority '" + authorityName + "'");
                        return new SimpleGrantedAuthority(authorityName);
                    })
                    .collect(Collectors.toList());

            logger.info("🔐 Final Granted Authorities (count: " + authorities.size() + "): " + authorities);

            // Create authentication token
            // Use username as principal (preferred) or email as fallback
            String principal = username != null ? username : (email != null ? email : userId);
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            authorities
                    );

            // Set additional details (organizationId can be retrieved from TenantContext)
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            logger.info("✅ Authentication set in SecurityContext: " + authentication.getName() + " with authorities: " + authentication.getAuthorities());
            logger.info("=====================================\n");
            return true;

        } catch (io.jsonwebtoken.security.SignatureException e) {
            logger.error("JWT validation failed - SIGNATURE MISMATCH: " + e.getMessage());
            logger.error("This usually means the JWT secret used for signing doesn't match validation secret");
            return false;
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            logger.error("JWT validation failed - TOKEN EXPIRED: " + e.getMessage());
            return false;
        } catch (Exception e) {
            logger.error("JWT validation failed - " + e.getClass().getSimpleName() + ": " + e.getMessage());
            logger.error("Full error:", e);
            return false;
        }
    }

    /**
     * Extract roles from JWT claims
     * Supports both List<String> and comma-separated string formats
     * Checks multiple claim names: "roles" (plural), "role" (singular), "authorities"
     */
    @SuppressWarnings("unchecked")
    private List<String> extractRoles(Claims claims) {
        List<String> roles = new ArrayList<>();
        
        logger.info("🔍 Attempting to extract roles from claims...");
        logger.debug("   Available claims keys: " + claims.keySet());

        // Try 1: Check for "roles" claim (plural - identity-service uses this)
        Object rolesObj = claims.get("roles");
        logger.info("   'roles' claim: " + rolesObj + " (type: " + (rolesObj != null ? rolesObj.getClass().getSimpleName() : "null") + ")");
        
        if (rolesObj instanceof List) {
            // Roles stored as list
            List<?> rolesList = (List<?>) rolesObj;
            for (Object roleItem : rolesList) {
                if (roleItem != null) {
                    roles.add(roleItem.toString());
                }
            }
            logger.info("   ✅ Extracted from 'roles' (List): " + roles);
        } else if (rolesObj instanceof String) {
            // Roles stored as comma-separated string
            String rolesStr = (String) rolesObj;
            if (!rolesStr.isEmpty()) {
                for (String role : rolesStr.split(",")) {
                    roles.add(role.trim());
                }
            }
            logger.info("   ✅ Extracted from 'roles' (String): " + roles);
        }

        // Try 2: Check for single 'role' claim (singular - some legacy tokens use this)
        if (roles.isEmpty()) {
            Object roleObj = claims.get("role");
            logger.info("   'role' claim: " + roleObj + " (type: " + (roleObj != null ? roleObj.getClass().getSimpleName() : "null") + ")");
            
            if (roleObj instanceof String) {
                String singleRole = (String) roleObj;
                if (!singleRole.isEmpty()) {
                    roles.add(singleRole);
                    logger.info("   ✅ Extracted from 'role' (String): " + roles);
                }
            } else if (roleObj != null) {
                roles.add(roleObj.toString());
                logger.info("   ✅ Extracted from 'role' (Object): " + roles);
            }
        }
        
        // Try 3: Check for "authorities" claim (some systems use this)
        if (roles.isEmpty()) {
            Object authoritiesObj = claims.get("authorities");
            logger.info("   'authorities' claim: " + authoritiesObj + " (type: " + (authoritiesObj != null ? authoritiesObj.getClass().getSimpleName() : "null") + ")");
            
            if (authoritiesObj instanceof List) {
                List<?> authList = (List<?>) authoritiesObj;
                for (Object auth : authList) {
                    if (auth != null) {
                        roles.add(auth.toString());
                    }
                }
                logger.info("   ✅ Extracted from 'authorities' (List): " + roles);
            }
        }
        
        if (roles.isEmpty()) {
            logger.error("   ❌ NO ROLES FOUND IN TOKEN! Available claims: " + claims.keySet());
            logger.error("   This will cause 403 Forbidden errors. Check token generation in identity-service.");
        } else {
            logger.info("   ✅ Successfully extracted " + roles.size() + " role(s): " + roles);
        }

        return roles;
    }
}
