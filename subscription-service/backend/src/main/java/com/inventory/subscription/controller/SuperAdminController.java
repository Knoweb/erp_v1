package com.inventory.subscription.controller;

import com.inventory.subscription.dto.AccessResponse;
import com.inventory.subscription.dto.RegisterCompanyRequest;
import com.inventory.subscription.enums.CompanyStatus;
import com.inventory.subscription.model.CompanyTenant;
import com.inventory.subscription.model.PaymentRecord;
import com.inventory.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Super Admin Controller
 * Handles administrative operations for subscription management
 */
@RestController
@RequestMapping("/api/superadmin/subscriptions")
@RequiredArgsConstructor
@Slf4j
public class SuperAdminController {

    private final SubscriptionService subscriptionService;

    /**
     * GET /api/superadmin/subscriptions/companies
     * Returns a list of all CompanyTenants with their current status
     */
    @GetMapping("/companies")
    public ResponseEntity<List<CompanyTenant>> getAllCompanies() {
        log.info("Super admin: Fetching all companies");
        List<CompanyTenant> companies = subscriptionService.getAllCompanies();
        return ResponseEntity.ok(companies);
    }

    /**
     * PUT /api/superadmin/subscriptions/companies/{orgId}/block
     * Calls the blockCompany logic and returns the updated CompanyTenant
     */
    @PutMapping("/companies/{orgId}/block")
    public ResponseEntity<CompanyTenant> blockCompany(@PathVariable Long orgId) {
        log.info("Super admin: Blocking company with orgId={}", orgId);
        CompanyTenant blockedCompany = subscriptionService.blockCompany(orgId);
        return ResponseEntity.ok(blockedCompany);
    }

    /**
     * PUT /api/superadmin/subscriptions/companies/{orgId}/unblock
     * Calls the unblockCompany logic and returns the updated CompanyTenant
     */
    @PutMapping("/companies/{orgId}/unblock")
    public ResponseEntity<CompanyTenant> unblockCompany(@PathVariable Long orgId) {
        log.info("Super admin: Unblocking company with orgId={}", orgId);
        CompanyTenant unblockedCompany = subscriptionService.unblockCompany(orgId);
        return ResponseEntity.ok(unblockedCompany);
    }

    /**
     * GET /api/superadmin/subscriptions/payments/pending
     * Returns a list of all PaymentRecords where approvalStatus is PENDING
     */
    @GetMapping("/payments/pending")
    public ResponseEntity<List<PaymentRecord>> getPendingPayments() {
        log.info("Super admin: Fetching all pending payments");
        List<PaymentRecord> pendingPayments = subscriptionService.getAllPendingPayments();
        return ResponseEntity.ok(pendingPayments);
    }

    /**
     * POST /api/superadmin/subscriptions/payments/{paymentId}/approve
     * Calls the approvePayment logic and returns the updated payment
     */
    @PostMapping("/payments/{paymentId}/approve")
    public ResponseEntity<PaymentRecord> approvePayment(@PathVariable Long paymentId) {
        log.info("Super admin: Approving payment with id={}", paymentId);
        PaymentRecord approvedPayment = subscriptionService.approvePayment(paymentId);
        return ResponseEntity.ok(approvedPayment);
    }
}
