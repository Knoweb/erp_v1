package com.inventory.subscription.service;

import com.inventory.subscription.dto.SubscriptionDetailsDTO;
import com.inventory.subscription.enums.*;
import com.inventory.subscription.exception.CompanyNotFoundException;
import com.inventory.subscription.exception.PaymentNotFoundException;
import com.inventory.subscription.model.CompanyTenant;
import com.inventory.subscription.model.PaymentRecord;
import com.inventory.subscription.model.SystemSubscription;
import com.inventory.subscription.repository.CompanyTenantRepository;
import com.inventory.subscription.repository.PaymentRecordRepository;
import com.inventory.subscription.repository.SystemSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class SubscriptionService {

    private final CompanyTenantRepository companyTenantRepository;
    private final SystemSubscriptionRepository systemSubscriptionRepository;
    private final PaymentRecordRepository paymentRecordRepository;

    /**
     * Register a new company with 12-month trial for both systems
     */
    public CompanyTenant registerNewCompanyWithTrial(Long orgId, String companyName, String contactEmail) {
        log.info("Registering new company with trial: orgId={}, companyName={}", orgId, companyName);
        
        // Check if company already exists
        if (companyTenantRepository.existsByOrgId(orgId)) {
            throw new IllegalArgumentException("Company with orgId " + orgId + " already exists");
        }

        // Create CompanyTenant with ACTIVE status
        CompanyTenant companyTenant = CompanyTenant.builder()
                .orgId(orgId)
                .companyName(companyName)
                .contactEmail(contactEmail)
                .status(CompanyStatus.ACTIVE)
                .build();

        companyTenant = companyTenantRepository.save(companyTenant);
        log.info("Created CompanyTenant with id={}", companyTenant.getId());

        // Calculate trial end date (12 months from today)
        LocalDate trialEndDate = LocalDate.now().plusMonths(12);

        // Create GINUMA subscription
        SystemSubscription ginumaSubscription = SystemSubscription.builder()
                .companyTenant(companyTenant)
                .systemName(SystemName.GINUMA)
                .status(SubscriptionStatus.TRIAL)
                .trialEndDate(trialEndDate)
                .validUntil(trialEndDate)
                .build();

        // Create INVENTORY subscription
        SystemSubscription inventorySubscription = SystemSubscription.builder()
                .companyTenant(companyTenant)
                .systemName(SystemName.INVENTORY)
                .status(SubscriptionStatus.TRIAL)
                .trialEndDate(trialEndDate)
                .validUntil(trialEndDate)
                .build();

        systemSubscriptionRepository.save(ginumaSubscription);
        systemSubscriptionRepository.save(inventorySubscription);

        log.info("Created trial subscriptions for both GINUMA and INVENTORY until {}", trialEndDate);

        return companyTenant;
    }

    /**
     * Block a company by orgId
     */
    public CompanyTenant blockCompany(Long orgId) {
        log.info("Blocking company with orgId={}", orgId);

        CompanyTenant companyTenant = companyTenantRepository.findByOrgId(orgId)
                .orElseThrow(() -> new CompanyNotFoundException(orgId));

        companyTenant.setStatus(CompanyStatus.BLOCKED);
        companyTenant = companyTenantRepository.save(companyTenant);

        log.info("Company with orgId={} has been blocked", orgId);
        return companyTenant;
    }

    /**
     * Unblock a company by orgId
     */
    public CompanyTenant unblockCompany(Long orgId) {
        log.info("Unblocking company with orgId={}", orgId);

        CompanyTenant companyTenant = companyTenantRepository.findByOrgId(orgId)
                .orElseThrow(() -> new CompanyNotFoundException(orgId));

        companyTenant.setStatus(CompanyStatus.ACTIVE);
        companyTenant = companyTenantRepository.save(companyTenant);

        log.info("Company with orgId={} has been unblocked", orgId);
        return companyTenant;
    }

    /**
     * Upgrade subscription by adding a new system to subscribed_systems JSON array
     * @param orgId Organization ID
     * @param newSystem System to add (e.g., "GINUMA", "INVENTORY", "PIRISAHR")
     * @return Updated CompanyTenant with new system added
     */
    public CompanyTenant upgradeSubscription(Long orgId, String newSystem) {
        log.info("Upgrading subscription for orgId={}, adding system={}", orgId, newSystem);

        // Find the company tenant
        CompanyTenant companyTenant = companyTenantRepository.findByOrgId(orgId)
                .orElseThrow(() -> new CompanyNotFoundException(orgId));

        // Validate the new system name
        if (newSystem == null || newSystem.trim().isEmpty()) {
            throw new IllegalArgumentException("System name cannot be null or empty");
        }

        String systemToAdd = newSystem.trim().toUpperCase();

        // Get current subscribed systems (JSON array)
        List<String> subscribedSystems = companyTenant.getSubscribedSystems();
        if (subscribedSystems == null) {
            subscribedSystems = new ArrayList<>();
        }

        // Check if system already exists
        if (subscribedSystems.contains(systemToAdd)) {
            log.warn("System {} already exists in subscribed_systems for orgId={}", systemToAdd, orgId);
            throw new IllegalArgumentException("System " + systemToAdd + " is already subscribed");
        }

        // Add the new system to the list
        subscribedSystems.add(systemToAdd);
        companyTenant.setSubscribedSystems(subscribedSystems);

        // Save the updated entity (JSON converter will handle serialization)
        companyTenant = companyTenantRepository.save(companyTenant);

        log.info("Successfully upgraded subscription for orgId={}. New subscribed_systems: {}", 
                orgId, companyTenant.getSubscribedSystems());

        return companyTenant;
    }

    /**
     * Submit a payment for approval
     */
    public PaymentRecord submitPayment(Long orgId, String systemName, BigDecimal amount, String proofDocumentUrl) {
        log.info("Submitting payment: orgId={}, system={}, amount={}", orgId, systemName, amount);

        CompanyTenant companyTenant = companyTenantRepository.findByOrgId(orgId)
                .orElseThrow(() -> new CompanyNotFoundException(orgId));

        SystemName system;
        try {
            system = SystemName.valueOf(systemName.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid system name: " + systemName + ". Must be GINUMA or INVENTORY");
        }

        PaymentRecord paymentRecord = PaymentRecord.builder()
                .companyTenant(companyTenant)
                .systemName(system)
                .amount(amount)
                .proofDocumentUrl(proofDocumentUrl)
                .approvalStatus(PaymentApprovalStatus.PENDING)
                .build();

        paymentRecord = paymentRecordRepository.save(paymentRecord);
        log.info("Payment submitted with id={}, status=PENDING", paymentRecord.getId());

        return paymentRecord;
    }

    /**
     * Approve a payment and extend subscription by 1 year
     */
    public PaymentRecord approvePayment(Long paymentId) {
        log.info("Approving payment with id={}", paymentId);

        PaymentRecord paymentRecord = paymentRecordRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException(paymentId));

        if (paymentRecord.getApprovalStatus() != PaymentApprovalStatus.PENDING) {
            throw new IllegalStateException("Payment is not in PENDING status. Current status: " + paymentRecord.getApprovalStatus());
        }

        // Set payment to APPROVED
        paymentRecord.setApprovalStatus(PaymentApprovalStatus.APPROVED);
        paymentRecord = paymentRecordRepository.save(paymentRecord);

        // Find the corresponding subscription
        CompanyTenant companyTenant = paymentRecord.getCompanyTenant();
        SystemName systemName = paymentRecord.getSystemName();

        SystemSubscription subscription = systemSubscriptionRepository
                .findByCompanyTenantAndSystemName(companyTenant, systemName)
                .orElseThrow(() -> new IllegalStateException(
                        "Subscription not found for company " + companyTenant.getOrgId() + " and system " + systemName));

        // Update subscription to PAID status
        subscription.setStatus(SubscriptionStatus.PAID);

        // Extend validUntil by 1 year
        LocalDate currentValidUntil = subscription.getValidUntil();
        LocalDate today = LocalDate.now();
        LocalDate newValidUntil;

        if (currentValidUntil == null || currentValidUntil.isBefore(today)) {
            // If expired or null, start from today
            newValidUntil = today.plusYears(1);
            log.info("Subscription was expired. Setting new validUntil from today: {}", newValidUntil);
        } else {
            // If still valid, extend from current valid date
            newValidUntil = currentValidUntil.plusYears(1);
            log.info("Extending subscription from current validUntil: {} to {}", currentValidUntil, newValidUntil);
        }

        subscription.setValidUntil(newValidUntil);
        systemSubscriptionRepository.save(subscription);

        log.info("Payment approved. Subscription extended to {}", newValidUntil);

        return paymentRecord;
    }

    /**
     * Get list of allowed systems for a company based on subscription status
     */
    @Transactional(readOnly = true)
    public List<String> getAllowedSystemsForCompany(Long orgId) {
        log.debug("Checking allowed systems for orgId={}", orgId);

        CompanyTenant companyTenant = companyTenantRepository.findByOrgId(orgId)
                .orElseThrow(() -> new CompanyNotFoundException(orgId));

        List<String> allowedSystems = new ArrayList<>();

        // Company must be ACTIVE (not BLOCKED)
        if (companyTenant.getStatus() != CompanyStatus.ACTIVE) {
            log.warn("Company orgId={} is BLOCKED. No systems allowed.", orgId);
            return allowedSystems;
        }

        // Get all subscriptions for this company
        List<SystemSubscription> subscriptions = systemSubscriptionRepository.findByCompanyTenant(companyTenant);
        LocalDate today = LocalDate.now();

        for (SystemSubscription subscription : subscriptions) {
            boolean isAllowed = false;

            if (subscription.getStatus() == SubscriptionStatus.TRIAL) {
                // TRIAL: Check if today is before trialEndDate
                if (subscription.getTrialEndDate() != null && today.isBefore(subscription.getTrialEndDate())) {
                    isAllowed = true;
                    log.debug("System {} allowed via TRIAL (ends: {})", subscription.getSystemName(), subscription.getTrialEndDate());
                }
            } else if (subscription.getStatus() == SubscriptionStatus.PAID) {
                // PAID: Check if today is before validUntil
                if (subscription.getValidUntil() != null && today.isBefore(subscription.getValidUntil())) {
                    isAllowed = true;
                    log.debug("System {} allowed via PAID subscription (valid until: {})", subscription.getSystemName(), subscription.getValidUntil());
                }
            }

            if (isAllowed) {
                allowedSystems.add(subscription.getSystemName().name());
            }
        }

        log.info("Allowed systems for orgId={}: {}", orgId, allowedSystems);
        return allowedSystems;
    }

    /**
     * Get company tenant by orgId
     */
    @Transactional(readOnly = true)
    public CompanyTenant getCompanyByOrgId(Long orgId) {
        return companyTenantRepository.findByOrgId(orgId)
                .orElseThrow(() -> new CompanyNotFoundException(orgId));
    }

    /**
     * Get all subscriptions for a company
     */
    @Transactional(readOnly = true)
    public List<SystemSubscription> getSubscriptionsByOrgId(Long orgId) {
        return systemSubscriptionRepository.findByCompanyTenant_OrgId(orgId);
    }

    /**
     * Get all payment records for a company
     */
    @Transactional(readOnly = true)
    public List<PaymentRecord> getPaymentsByOrgId(Long orgId) {
        return paymentRecordRepository.findByCompanyTenant_OrgId(orgId);
    }

    /**
     * Get all pending payments (for super admin)
     */
    @Transactional(readOnly = true)
    public List<PaymentRecord> getAllPendingPayments() {
        return paymentRecordRepository.findByApprovalStatus(PaymentApprovalStatus.PENDING);
    }

    /**
     * Get all companies (for super admin)
     */
    @Transactional(readOnly = true)
    public List<CompanyTenant> getAllCompanies() {
        log.info("Fetching all companies");
        return companyTenantRepository.findAll();
    }

    /**
     * Get subscription details with calculated daysLeft for Main Dashboard
     */
    @Transactional(readOnly = true)
    public List<SubscriptionDetailsDTO> getSubscriptionDetailsForDashboard(Long orgId) {
        log.info("Fetching subscription details for orgId={}", orgId);
        
        List<SystemSubscription> subscriptions = systemSubscriptionRepository.findByCompanyTenant_OrgId(orgId);
        
        return subscriptions.stream()
                .map(this::convertToSubscriptionDetailsDTO)
                .toList();
    }

    /**
     * Convert SystemSubscription entity to SubscriptionDetailsDTO with calculated fields
     */
    private SubscriptionDetailsDTO convertToSubscriptionDetailsDTO(SystemSubscription subscription) {
        LocalDate now = LocalDate.now();
        LocalDate expiryDate = subscription.getValidUntil();
        
        // Calculate days left (positive = days remaining, negative = expired)
        Integer daysLeft = null;
        if (expiryDate != null) {
            daysLeft = (int) java.time.temporal.ChronoUnit.DAYS.between(now, expiryDate);
        }
        
        // Determine plan type based on status
        String planType;
        if (subscription.getStatus() == SubscriptionStatus.TRIAL) {
            planType = "TRIAL";
        } else if (subscription.getStatus() == SubscriptionStatus.PAID) {
            planType = "PAID";
        } else {
            planType = subscription.getStatus().name();
        }
        
        // Check if subscription is active
        boolean isActive = subscription.getStatus() != SubscriptionStatus.EXPIRED 
                && (daysLeft == null || daysLeft >= 0);
        
        // Generate status message
        String statusMessage = generateStatusMessage(subscription.getStatus(), daysLeft, planType);
        
        return SubscriptionDetailsDTO.builder()
                .id(subscription.getId())
                .orgId(subscription.getCompanyTenant().getOrgId())
                .systemName(subscription.getSystemName())
                .planType(planType)
                .daysLeft(daysLeft)
                .status(subscription.getStatus())
                .trialEndDate(subscription.getTrialEndDate())
                .validUntil(subscription.getValidUntil())
                .isActive(isActive)
                .statusMessage(statusMessage)
                .build();
    }

    /**
     * Generate human-readable status message
     */
    private String generateStatusMessage(SubscriptionStatus status, Integer daysLeft, String planType) {
        if (status == SubscriptionStatus.EXPIRED || (daysLeft != null && daysLeft < 0)) {
            return "Subscription expired. Please renew to continue access.";
        }
        
        if (daysLeft == null) {
            return "Subscription status unknown.";
        }
        
        if (daysLeft == 0) {
            return planType + " subscription expires today.";
        }
        
        if (daysLeft <= 7) {
            return planType + " subscription expires in " + daysLeft + " day" + (daysLeft > 1 ? "s" : "") + ". Renew soon!";
        }
        
        if (daysLeft <= 30) {
            return planType + " subscription expires in " + daysLeft + " days.";
        }
        
        return planType + " subscription is active (" + daysLeft + " days remaining).";
    }
}
