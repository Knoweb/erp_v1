package com.inventory.subscription.controller;

import com.inventory.subscription.dto.SystemAccessResponse;
import com.inventory.subscription.exception.CompanyNotFoundException;
import com.inventory.subscription.service.SubscriptionAccessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for system access and subscription queries
 * Provides endpoints for the React frontend dashboard
 */
@Slf4j
@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = {
    "http://localhost:5173",  // Knoweb Main Portal
    "http://localhost:3000",   // Subscription Service Frontend
    "http://localhost:5176",   // Ginuma Frontend
    "http://localhost:5174"    // Inventory Frontend
})
public class SubscriptionAccessController {
    
    private final SubscriptionAccessService subscriptionAccessService;
    
    /**
     * Get subscribed systems for a specific organization
     * 
     * Endpoint: GET /api/subscriptions/my-systems/{orgId}
     * 
     * @param orgId Organization ID from path variable
     * @return SystemAccessResponse with company details and subscribed systems
     * 
     * Example Response:
     * {
     *   "orgId": 100,
     *   "companyName": "Acme Corporation",
     *   "contactEmail": "admin@acme.com",
     *   "status": "ACTIVE",
     *   "subscribedSystems": ["GINUMA", "INVENTORY"],
     *   "isActive": true,
     *   "isBlocked": false,
     *   "createdAt": "2026-03-10T14:30:00",
     *   "statusMessage": "Your account is active and all systems are accessible",
     *   "systemCount": 2
     * }
     */
    @GetMapping("/my-systems/{orgId}")
    public ResponseEntity<SystemAccessResponse> getMySubscribedSystems(@PathVariable Long orgId) {
        log.info("Received request to get subscribed systems for org_id: {}", orgId);
        
        try {
            SystemAccessResponse response = subscriptionAccessService.getSubscribedSystems(orgId);
            
            log.info("Successfully retrieved {} subscribed systems for org_id: {}", 
                     response.getSystemCount(), orgId);
            
            return ResponseEntity.ok(response);
            
        } catch (CompanyNotFoundException e) {
            log.error("Company not found for org_id: {}", orgId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
                    
        } catch (IllegalArgumentException e) {
            log.error("Invalid org_id: {}", orgId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
                    
        } catch (Exception e) {
            log.error("Unexpected error fetching systems for org_id: {}", orgId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
    
    /**
     * Check if organization has access to a specific system
     * 
     * Endpoint: GET /api/subscriptions/my-systems/{orgId}/access/{systemCode}
     * 
     * @param orgId Organization ID
     * @param systemCode System code (GINUMA or INVENTORY)
     * @return JSON with hasAccess boolean
     * 
     * Example Response:
     * {
     *   "hasAccess": true,
     *   "orgId": 100,
     *   "systemCode": "GINUMA"
     * }
     */
    @GetMapping("/my-systems/{orgId}/access/{systemCode}")
    public ResponseEntity<Map<String, Object>> checkSystemAccess(
            @PathVariable Long orgId,
            @PathVariable String systemCode) {
        
        log.info("Checking system access for org_id: {} and system: {}", orgId, systemCode);
        
        try {
            boolean hasAccess = subscriptionAccessService.hasSystemAccess(orgId, systemCode);
            
            Map<String, Object> response = new HashMap<>();
            response.put("hasAccess", hasAccess);
            response.put("orgId", orgId);
            response.put("systemCode", systemCode);
            
            return ResponseEntity.ok(response);
            
        } catch (CompanyNotFoundException e) {
            log.error("Company not found for org_id: {}", orgId);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Organization not found");
            errorResponse.put("orgId", orgId);
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error checking system access", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get company status
     * 
     * Endpoint: GET /api/subscriptions/my-systems/{orgId}/status
     * 
     * @param orgId Organization ID
     * @return JSON with status information
     * 
     * Example Response:
     * {
     *   "orgId": 100,
     *   "status": "ACTIVE",
     *   "isActive": true,
     *   "isBlocked": false
     * }
     */
    @GetMapping("/my-systems/{orgId}/status")
    public ResponseEntity<Map<String, Object>> getCompanyStatus(@PathVariable Long orgId) {
        log.info("Fetching company status for org_id: {}", orgId);
        
        try {
            var status = subscriptionAccessService.getCompanyStatus(orgId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("orgId", orgId);
            response.put("status", status.name());
            response.put("isActive", status == com.inventory.subscription.enums.CompanyStatus.ACTIVE);
            response.put("isBlocked", status == com.inventory.subscription.enums.CompanyStatus.BLOCKED);
            
            return ResponseEntity.ok(response);
            
        } catch (CompanyNotFoundException e) {
            log.error("Company not found for org_id: {}", orgId);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Organization not found");
            errorResponse.put("orgId", orgId);
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Subscription Access Service");
        return ResponseEntity.ok(response);
    }
}
