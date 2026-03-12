package com.example.GinumApps.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Tenant Setup Response DTO
 * 
 * Returned to identity-service after tenant provisioning.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantSetupResponse {
    
    private Boolean success;
    private String message;
    
    // Created Entity IDs
    private Long orgId;  // Same as request orgId
    private Long companyId;  // From ginuma_db.companies.id
    private Long userId;  // From ginuma_db.users.id
    private Long branchId;  // From ginuma_db.branches.id (if applicable)
    
    // Tenant Information
    private String tenantId;  // Generated tenant identifier
    
    // Error Information (if failed)
    private String errorCode;
    private String errorDetails;
}
