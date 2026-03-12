package com.inventory.subscription.dto;

import com.inventory.subscription.enums.CompanyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for returning system access information to the frontend dashboard
 * Contains company details and list of subscribed systems
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemAccessResponse {
    
    /**
     * Organization ID
     */
    private Long orgId;
    
    /**
     * Company name
     */
    private String companyName;
    
    /**
     * Contact email
     */
    private String contactEmail;
    
    /**
     * Company status (ACTIVE, BLOCKED, PENDING)
     */
    private CompanyStatus status;
    
    /**
     * Plan type: "TRIAL" or "PAID"
     */
    private String planType;
    
    /**
     * List of subscribed system codes
     * Examples: ["GINUMA"], ["INVENTORY"], ["GINUMA", "INVENTORY"]
     */
    private List<String> subscribedSystems;
    
    /**
     * Whether the company account is active
     */
    private boolean isActive;
    
    /**
     * Whether the company is blocked
     */
    private boolean isBlocked;
    
    /**
     * Account creation timestamp
     */
    private LocalDateTime createdAt;
    
    /**
     * Human-readable status message
     */
    private String statusMessage;
    
    /**
     * Total number of subscribed systems
     */
    private int systemCount;
    
    /**
     * Factory method to create response from CompanyTenant entity
     */
    public static SystemAccessResponse fromEntity(com.inventory.subscription.model.CompanyTenant companyTenant) {
        if (companyTenant == null) {
            return null;
        }
        
        List<String> systems = companyTenant.getSubscribedSystems();
        CompanyStatus status = companyTenant.getStatus();
        
        return SystemAccessResponse.builder()
                .orgId(companyTenant.getOrgId())
                .companyName(companyTenant.getCompanyName())
                .contactEmail(companyTenant.getContactEmail())
                .status(status)
                .planType(companyTenant.getPlanType())
                .subscribedSystems(systems)
                .isActive(status == CompanyStatus.ACTIVE)
                .isBlocked(status == CompanyStatus.BLOCKED)
                .createdAt(companyTenant.getCreatedAt())
                .statusMessage(getStatusMessage(status))
                .systemCount(systems != null ? systems.size() : 0)
                .build();
    }
    
    /**
     * Generate human-readable status message
     */
    private static String getStatusMessage(CompanyStatus status) {
        return switch (status) {
            case ACTIVE -> "Your account is active and all systems are accessible";
            case BLOCKED -> "Your account has been blocked. Please contact support";
            case PENDING -> "Your account is pending approval";
            default -> "Account status unknown";
        };
    }
}
