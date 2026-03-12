package com.inventory.subscription.controller;

import com.inventory.subscription.dto.SubscriptionDetailsDTO;
import com.inventory.subscription.dto.UpgradeSubscriptionRequest;
import com.inventory.subscription.model.CompanyTenant;
import com.inventory.subscription.model.PaymentRecord;
import com.inventory.subscription.model.SystemSubscription;
import com.inventory.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@Slf4j
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    /**
     * Register a new company with 12-month trial
     * POST /api/subscriptions/register
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerCompany(@RequestBody Map<String, Object> request) {
        try {
            Long orgId = Long.valueOf(request.get("orgId").toString());
            String companyName = (String) request.get("companyName");
            String contactEmail = (String) request.get("contactEmail");

            CompanyTenant company = subscriptionService.registerNewCompanyWithTrial(orgId, companyName, contactEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Company registered successfully with 12-month trial");
            response.put("companyId", company.getId());
            response.put("orgId", company.getOrgId());
            response.put("companyName", company.getCompanyName());
            response.put("status", company.getStatus());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error registering company: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Block a company
     * PATCH /api/subscriptions/block/{orgId}
     */
    @PatchMapping("/block/{orgId}")
    public ResponseEntity<Map<String, Object>> blockCompany(@PathVariable Long orgId) {
        try {
            CompanyTenant company = subscriptionService.blockCompany(orgId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Company blocked successfully");
            response.put("orgId", company.getOrgId());
            response.put("status", company.getStatus());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error blocking company: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Upgrade subscription by adding a new system
     * POST /api/subscriptions/upgrade
     * 
     * Request body example:
     * {
     *   "orgId": 2,
     *   "newSystem": "GINUMA"
     * }
     * 
     * This endpoint adds a new system to the subscribed_systems JSON array.
     * If the system already exists, it returns an error.
     */
    @PostMapping("/upgrade")
    public ResponseEntity<Map<String, Object>> upgradeSubscription(@RequestBody UpgradeSubscriptionRequest request) {
        try {
            log.info("Received upgrade request: orgId={}, newSystem={}", request.getOrgId(), request.getNewSystem());

            CompanyTenant company = subscriptionService.upgradeSubscription(request.getOrgId(), request.getNewSystem());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Subscription upgraded successfully");
            response.put("orgId", company.getOrgId());
            response.put("companyName", company.getCompanyName());
            response.put("subscribedSystems", company.getSubscribedSystems());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Validation error upgrading subscription: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("Error upgrading subscription: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Submit payment for approval
     * POST /api/subscriptions/payments/submit
     */
    @PostMapping("/payments/submit")
    public ResponseEntity<Map<String, Object>> submitPayment(@RequestBody Map<String, Object> request) {
        try {
            Long orgId = Long.valueOf(request.get("orgId").toString());
            String systemName = (String) request.get("systemName");
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String proofDocumentUrl = (String) request.get("proofDocumentUrl");

            PaymentRecord payment = subscriptionService.submitPayment(orgId, systemName, amount, proofDocumentUrl);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment submitted successfully");
            response.put("paymentId", payment.getId());
            response.put("status", payment.getApprovalStatus());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error submitting payment: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Approve payment and extend subscription
     * PATCH /api/subscriptions/payments/{paymentId}/approve
     */
    @PatchMapping("/payments/{paymentId}/approve")
    public ResponseEntity<Map<String, Object>> approvePayment(@PathVariable Long paymentId) {
        try {
            PaymentRecord payment = subscriptionService.approvePayment(paymentId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment approved and subscription extended by 1 year");
            response.put("paymentId", payment.getId());
            response.put("status", payment.getApprovalStatus());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error approving payment: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Get allowed systems for a company
     * GET /api/subscriptions/{orgId}/allowed-systems
     */
    @GetMapping("/{orgId}/allowed-systems")
    public ResponseEntity<Map<String, Object>> getAllowedSystems(@PathVariable Long orgId) {
        try {
            List<String> allowedSystems = subscriptionService.getAllowedSystemsForCompany(orgId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orgId", orgId);
            response.put("allowedSystems", allowedSystems);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting allowed systems: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Get company details by orgId
     * GET /api/subscriptions/company/{orgId}
     */
    @GetMapping("/company/{orgId}")
    public ResponseEntity<?> getCompany(@PathVariable Long orgId) {
        try {
            CompanyTenant company = subscriptionService.getCompanyByOrgId(orgId);
            return ResponseEntity.ok(company);
        } catch (Exception e) {
            log.error("Error getting company: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Get all subscriptions for a company
     * GET /api/subscriptions/{orgId}/subscriptions
     */
    @GetMapping("/{orgId}/subscriptions")
    public ResponseEntity<List<SystemSubscription>> getSubscriptions(@PathVariable Long orgId) {
        try {
            List<SystemSubscription> subscriptions = subscriptionService.getSubscriptionsByOrgId(orgId);
            return ResponseEntity.ok(subscriptions);
        } catch (Exception e) {
            log.error("Error getting subscriptions: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get subscription details for Main Dashboard with planType and daysLeft
     * GET /api/subscriptions/{orgId}/dashboard
     * 
     * Returns subscription details including:
     * - planType: "TRIAL" or "PAID"
     * - daysLeft: Days remaining until expiry (negative if expired)
     * - statusMessage: Human-readable status
     * 
     * Example Response:
     * [
     *   {
     *     "id": 1,
     *     "orgId": 100,
     *     "systemName": "GINUMA",
     *     "planType": "TRIAL",
     *     "daysLeft": 45,
     *     "status": "TRIAL",
     *     "trialEndDate": "2026-04-26",
     *     "validUntil": "2026-04-26",
     *     "isActive": true,
     *     "statusMessage": "TRIAL subscription is active (45 days remaining)."
     *   }
     * ]
     */
    @GetMapping("/{orgId}/dashboard")
    public ResponseEntity<List<SubscriptionDetailsDTO>> getSubscriptionDetailsForDashboard(@PathVariable Long orgId) {
        try {
            log.info("Dashboard request: Fetching subscription details for orgId={}", orgId);
            List<SubscriptionDetailsDTO> details = 
                subscriptionService.getSubscriptionDetailsForDashboard(orgId);
            log.info("Dashboard response: Returning {} subscriptions for orgId={}", details.size(), orgId);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            log.error("Error getting subscription details for dashboard: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get all payments for a company
     * GET /api/subscriptions/{orgId}/payments
     */
    @GetMapping("/{orgId}/payments")
    public ResponseEntity<List<PaymentRecord>> getPayments(@PathVariable Long orgId) {
        try {
            List<PaymentRecord> payments = subscriptionService.getPaymentsByOrgId(orgId);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            log.error("Error getting payments: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get all pending payments (for super admin)
     * GET /api/subscriptions/payments/pending
     */
    @GetMapping("/payments/pending")
    public ResponseEntity<List<PaymentRecord>> getPendingPayments() {
        try {
            List<PaymentRecord> pendingPayments = subscriptionService.getAllPendingPayments();
            return ResponseEntity.ok(pendingPayments);
        } catch (Exception e) {
            log.error("Error getting pending payments: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
}
