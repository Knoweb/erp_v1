package com.example.GinumApps.util;

/**
 * Thread-local storage for multi-tenant organization context.
 * Stores the organization_id from JWT token to be used globally in database queries.
 */
public class TenantContext {

    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();

    /**
     * Set the current tenant (organization_id) for this thread
     */
    public static void setCurrentTenant(String tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    /**
     * Get the current tenant (organization_id) for this thread
     */
    public static String getCurrentTenant() {
        return CURRENT_TENANT.get();
    }

    /**
     * Clear the current tenant from thread-local storage
     */
    public static void clear() {
        CURRENT_TENANT.remove();
    }

    /**
     * Check if tenant is set
     */
    public static boolean hasTenant() {
        return CURRENT_TENANT.get() != null;
    }
}
