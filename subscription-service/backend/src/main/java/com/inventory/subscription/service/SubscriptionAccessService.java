package com.inventory.subscription.service;

import com.inventory.subscription.dto.SystemAccessResponse;
import com.inventory.subscription.exception.CompanyNotFoundException;
import com.inventory.subscription.model.CompanyTenant;
import com.inventory.subscription.repository.CompanyTenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing system access and subscriptions
 * Provides business logic for retrieving subscribed systems
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionAccessService {
    
    private final CompanyTenantRepository companyTenantRepository;
    
    /**
     * Get subscribed systems for a specific organization
     * 
     * @param orgId Organization ID
     * @return SystemAccessResponse containing company details and subscribed systems
     * @throws CompanyNotFoundException if organization not found
     */
    @Transactional(readOnly = true)
    public SystemAccessResponse getSubscribedSystems(Long orgId) {
        log.info("Fetching subscribed systems for org_id: {}", orgId);
        
        // Validate orgId
        if (orgId == null || orgId <= 0) {
            log.error("Invalid org_id provided: {}", orgId);
            throw new IllegalArgumentException("Organization ID must be a positive number");
        }
        
        // Find company by org_id
        CompanyTenant companyTenant = companyTenantRepository.findByOrgId(orgId)
                .orElseThrow(() -> {
                    log.error("Company not found for org_id: {}", orgId);
                    return new CompanyNotFoundException("Organization not found with ID: " + orgId);
                });
        
        log.info("Found company: {} with {} subscribed systems", 
                 companyTenant.getCompanyName(), 
                 companyTenant.getSubscribedSystems().size());
        
        // Convert entity to DTO
        SystemAccessResponse response = SystemAccessResponse.fromEntity(companyTenant);
        
        // Additional logging for debugging
        if (response.getSubscribedSystems().isEmpty()) {
            log.warn("Organization {} has no subscribed systems", orgId);
        } else {
            log.info("Organization {} subscribed to: {}", 
                     orgId, 
                     String.join(", ", response.getSubscribedSystems()));
        }
        
        return response;
    }
    
    /**
     * Check if an organization has access to a specific system
     * 
     * @param orgId Organization ID
     * @param systemCode System code (e.g., "GINUMA", "INVENTORY")
     * @return true if organization has access, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean hasSystemAccess(Long orgId, String systemCode) {
        log.debug("Checking system access for org_id: {} and system: {}", orgId, systemCode);
        
        CompanyTenant companyTenant = companyTenantRepository.findByOrgId(orgId)
                .orElseThrow(() -> new CompanyNotFoundException("Organization not found with ID: " + orgId));
        
        boolean hasAccess = companyTenant.hasAccessToSystem(systemCode);
        
        log.debug("Organization {} {} access to system {}", 
                  orgId, 
                  hasAccess ? "has" : "does not have", 
                  systemCode);
        
        return hasAccess;
    }
    
    /**
     * Get company status
     * 
     * @param orgId Organization ID
     * @return Company status (ACTIVE, BLOCKED, PENDING)
     */
    @Transactional(readOnly = true)
    public com.inventory.subscription.enums.CompanyStatus getCompanyStatus(Long orgId) {
        log.debug("Fetching company status for org_id: {}", orgId);
        
        CompanyTenant companyTenant = companyTenantRepository.findByOrgId(orgId)
                .orElseThrow(() -> new CompanyNotFoundException("Organization not found with ID: " + orgId));
        
        return companyTenant.getStatus();
    }
}
