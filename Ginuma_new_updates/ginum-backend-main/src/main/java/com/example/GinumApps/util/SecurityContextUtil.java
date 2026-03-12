package com.example.GinumApps.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility class to access security context and tenant information.
 * Helper methods for controllers and services to retrieve user context from JWT.
 */
public class SecurityContextUtil {

    /**
     * Get the current authenticated user's ID (from JWT user_id claim)
     * 
     * @return User ID as String, or null if not authenticated
     */
    public static String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof String) {
                return (String) principal;
            }
        }
        return null;
    }

    /**
     * Get the current organization ID (from JWT organization_id claim)
     * Stored in ThreadLocal TenantContext
     * 
     * @return Organization ID as String, or null if not set
     */
    public static String getCurrentOrganizationId() {
        return TenantContext.getCurrentTenant();
    }

    /**
     * Check if the current user has a specific role
     * 
     * @param role Role to check (with or without ROLE_ prefix)
     * @return true if user has the role, false otherwise
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }

        String roleToCheck = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals(roleToCheck));
    }

    /**
     * Check if user is authenticated
     * 
     * @return true if authenticated, false otherwise
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() 
                && !"anonymousUser".equals(authentication.getPrincipal());
    }

    /**
     * Get the full Authentication object
     * 
     * @return Authentication object or null
     */
    public static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }
}
