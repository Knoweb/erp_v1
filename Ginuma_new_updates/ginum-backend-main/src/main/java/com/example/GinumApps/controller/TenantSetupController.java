package com.example.GinumApps.controller;

import com.example.GinumApps.dto.TenantSetupRequest;
import com.example.GinumApps.dto.TenantSetupResponse;
import com.example.GinumApps.service.TenantProvisioningService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * Tenant Setup Controller
 * 
 * Handles backend-to-backend tenant provisioning requests from identity-service.
 * This endpoint is called during user registration to create Ginuma-specific data.
 * 
 * Endpoint: POST /api/tenant/setup
 * Called by: identity-service (RegistrationOrchestratorService)
 */
@Slf4j
@RestController
@RequestMapping("/api/tenant")
@RequiredArgsConstructor
public class TenantSetupController {
    
    private final TenantProvisioningService tenantProvisioningService;
    
    /**
     * Setup new tenant in Ginuma ERP system
     * Creates organization and admin user in ginuma_db
     * 
     * This is a backend-to-backend call - no JWT authentication required
     * (Security configured to permitAll() for this endpoint)
     */
    @PostMapping("/setup")
    public ResponseEntity<TenantSetupResponse> setupTenant(
            @Valid @RequestBody TenantSetupRequest request
    ) {
        log.info("Received tenant setup request for org_id: {}, company: {}", 
                 request.getOrgId(), request.getCompanyName());
        
        try {
            // Delegate to service layer
            TenantSetupResponse response = tenantProvisioningService.provisionTenant(request);
            
            if (response.getSuccess()) {
                log.info("Tenant setup successful for org_id: {}", request.getOrgId());
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                log.warn("Tenant setup failed for org_id: {}, reason: {}", 
                         request.getOrgId(), response.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
        } catch (IllegalArgumentException e) {
            log.error("Validation error during tenant setup for org_id: {}, error: {}", 
                      request.getOrgId(), e.getMessage());
            
            TenantSetupResponse errorResponse = TenantSetupResponse.builder()
                    .success(false)
                    .message("Validation error: " + e.getMessage())
                    .errorCode("VALIDATION_ERROR")
                    .build();
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Unexpected error during tenant setup for org_id: {}, error: {}", 
                      request.getOrgId(), e.getMessage(), e);
            
            TenantSetupResponse errorResponse = TenantSetupResponse.builder()
                    .success(false)
                    .message("Internal server error: " + e.getMessage())
                    .errorCode("INTERNAL_ERROR")
                    .build();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Health check endpoint for tenant setup
     */
    @GetMapping("/setup/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Tenant setup endpoint is healthy");
    }
}
