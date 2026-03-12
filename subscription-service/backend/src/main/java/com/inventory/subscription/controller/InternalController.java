package com.inventory.subscription.controller;

import com.inventory.subscription.dto.AccessResponse;
import com.inventory.subscription.dto.RegisterCompanyRequest;
import com.inventory.subscription.enums.CompanyStatus;
import com.inventory.subscription.model.CompanyTenant;
import com.inventory.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Internal Controller
 * Handles internal service-to-service communication for authentication and registration
 */
@RestController
@RequestMapping("/api/internal/subscriptions")
@RequiredArgsConstructor
@Slf4j
public class InternalController {

    private final SubscriptionService subscriptionService;

    /**
     * POST /api/internal/subscriptions/register
     * Accepts a JSON payload (orgId, companyName, contactEmail) and registers the company with 12-month trial
     */
    @PostMapping("/register")
    public ResponseEntity<CompanyTenant> registerCompany(@RequestBody RegisterCompanyRequest request) {
        log.info("Internal: Registering company with orgId={}, companyName={}", 
                request.getOrgId(), request.getCompanyName());
        
        CompanyTenant registeredCompany = subscriptionService.registerNewCompanyWithTrial(
                request.getOrgId(),
                request.getCompanyName(),
                request.getContactEmail()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(registeredCompany);
    }

    /**
     * GET /api/internal/subscriptions/access/{orgId}
     * Returns a JSON response containing the boolean isBlocked and a List<String> allowedSystems
     */
    @GetMapping("/access/{orgId}")
    public ResponseEntity<AccessResponse> getAccess(@PathVariable Long orgId) {
        log.info("Internal: Checking access for orgId={}", orgId);
        
        CompanyTenant company = subscriptionService.getCompanyByOrgId(orgId);
        List<String> allowedSystems = subscriptionService.getAllowedSystemsForCompany(orgId);
        
        boolean isBlocked = company.getStatus() == CompanyStatus.BLOCKED;
        
        AccessResponse response = AccessResponse.builder()
                .orgId(orgId)
                .isBlocked(isBlocked)
                .allowedSystems(allowedSystems)
                .build();
        
        return ResponseEntity.ok(response);
    }
}
