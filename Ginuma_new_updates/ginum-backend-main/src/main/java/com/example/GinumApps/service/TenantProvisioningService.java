package com.example.GinumApps.service;

import com.example.GinumApps.dto.TenantSetupRequest;
import com.example.GinumApps.dto.TenantSetupResponse;
import com.example.GinumApps.enums.CompanyCategory;
import com.example.GinumApps.model.*;
import com.example.GinumApps.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Date;
import java.util.Optional;

/**
 * Tenant Provisioning Service
 * 
 * Handles tenant setup in Ginuma ERP database (ginuma_db).
 * Called by TenantSetupController when identity-service registers a new user.
 * 
 * Creates:
 * 1. Company record in ginuma_db.company_tbl
 * 2. Admin user record in ginuma_db.users (or app_users)
 * 3. (Optionally) Default accounts, branches, etc.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TenantProvisioningService {

    private final CompanyRepository companyRepository;
    private final CountryRepository countryRepository;
    private final CurrencyRepository currencyRepository;
    private final SubscriptionPackageRepository subscriptionPackageRepository;
    private final PasswordEncoder passwordEncoder;

    // Default values for tenant setup
    private static final Integer DEFAULT_COUNTRY_ID = 1; // Adjust based on your data
    private static final Integer DEFAULT_CURRENCY_ID = 1; // Adjust based on your data
    private static final Integer DEFAULT_PACKAGE_ID = 1; // Basic package

    /**
     * Provision new tenant in Ginuma ERP
     * 
     * @param request Tenant setup details from identity-service
     * @return Response with created entity IDs
     */
    @Transactional
    public TenantSetupResponse provisionTenant(TenantSetupRequest request) {
        log.info("Starting tenant provisioning for org_id: {}, company: {}",
                request.getOrgId(), request.getCompanyName());

        try {
            // Step 1: Validate request
            validateTenantSetupRequest(request);

            // Step 2: Check if company already exists for this orgId
            if (companyRepository.existsByCompanyId(request.getOrgId().intValue())) {
                log.warn("Company already exists for org_id: {}", request.getOrgId());
                return TenantSetupResponse.builder()
                        .success(false)
                        .message("Company already provisioned for this organization")
                        .errorCode("COMPANY_ALREADY_EXISTS")
                        .orgId(request.getOrgId())
                        .build();
            }

            // Step 3: Fetch reference data (Country, Currency, Package)
            Country country = getCountryOrDefault(request.getCountry());
            Currency currency = getCurrencyOrDefault(request.getCurrency());
            SubscriptionPackage subscriptionPackage = getSubscriptionPackageOrDefault(
                    request.getSubscriptionTier());

            // Step 4: Create Company record
            Company company = createCompany(request, country, currency, subscriptionPackage);
            Company savedCompany = companyRepository.save(company);
            log.info("Company created successfully with ID: {} for org_id: {}",
                    savedCompany.getCompanyId(), request.getOrgId());

            // Step 5: Build success response
            return TenantSetupResponse.builder()
                    .success(true)
                    .message("Tenant provisioned successfully in Ginuma ERP")
                    .orgId(request.getOrgId())
                    .companyId(savedCompany.getCompanyId().longValue())
                    .tenantId("GINUMA_" + request.getOrgId())
                    .build();

        } catch (Exception e) {
            log.error("Tenant provisioning failed for org_id: {}, error: {}",
                    request.getOrgId(), e.getMessage(), e);

            return TenantSetupResponse.builder()
                    .success(false)
                    .message("Tenant provisioning failed")
                    .errorCode("PROVISIONING_ERROR")
                    .errorDetails(e.getMessage())
                    .build();
        }
    }

    /**
     * Validate tenant setup request
     */
    private void validateTenantSetupRequest(TenantSetupRequest request) {
        if (request.getOrgId() == null) {
            throw new IllegalArgumentException("orgId is required");
        }
        if (request.getCompanyName() == null || request.getCompanyName().trim().isEmpty()) {
            throw new IllegalArgumentException("companyName is required");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("email is required");
        }
    }

    /**
     * Create Company entity from request
     */
    private Company createCompany(
            TenantSetupRequest request,
            Country country,
            Currency currency,
            SubscriptionPackage subscriptionPackage) {
        Company company = new Company();

        // Use orgId as companyId for consistency across systems
        company.setCompanyId(request.getOrgId().intValue());

        // Company details
        company.setCompanyName(request.getCompanyName());
        company.setCompanyRegNo(request.getRegistrationNo());
        company.setTinNo(request.getTinNo());
        company.setVatNo(request.getVatNo());
        company.setIsVatRegistered(request.getVatNo() != null && !request.getVatNo().isEmpty());

        // Contact information
        company.setEmail(request.getEmail());
        company.setPhoneNo(request.getPhoneNumber());
        company.setWebsiteUrl(request.getWebsite());

        // Address information
        company.setCompanyRegisteredAddress(
                request.getAddress() != null ? request.getAddress() : "Not Provided");

        // Company category (industry)
        CompanyCategory category = parseCompanyCategory(request.getIndustry());
        company.setCompanyCategory(category);

        // Reference data
        company.setCountry(country);
        company.setCurrency(currency);
        company.setPackageEntity(subscriptionPackage);

        // Subscription dates
        company.setDateJoined(LocalDate.now());

        // Calculate trial expiry (14 days)
        Date subscriptionExpiry = new Date(System.currentTimeMillis() + (14L * 24 * 60 * 60 * 1000));
        company.setSubscriptionExpiryDate(subscriptionExpiry);

        // Default password (should be changed by admin)
        company.setPassword(passwordEncoder.encode("ChangeMe@123"));

        // Status
        company.setStatus(true); // Active
        company.setRole("COMPANY");

        return company;
    }

    /**
     * Parse industry type to CompanyCategory enum
     */
    private CompanyCategory parseCompanyCategory(String industry) {
        if (industry == null || industry.trim().isEmpty()) {
            return CompanyCategory.PROFESSIONAL_SERVICES;
        }

        try {
            // Try to match by enum name or display name
            return CompanyCategory.fromValue(industry);
        } catch (IllegalArgumentException e) {
            log.warn("Unknown industry type: {}, defaulting to PROFESSIONAL_SERVICES", industry);
            return CompanyCategory.PROFESSIONAL_SERVICES;
        }
    }

    /**
     * Get Country by name or return default
     */
    private Country getCountryOrDefault(String countryName) {
        if (countryName != null && !countryName.trim().isEmpty()) {
            Optional<Country> country = countryRepository.findByName(countryName);
            if (country.isPresent()) {
                return country.get();
            }
        }

        // Return default country
        return countryRepository.findById(DEFAULT_COUNTRY_ID)
                .orElseThrow(() -> new IllegalStateException("Default country not found"));
    }

    /**
     * Get Currency by code or return default
     */
    private Currency getCurrencyOrDefault(String currencyCode) {
        if (currencyCode != null && !currencyCode.trim().isEmpty()) {
            Optional<Currency> currency = currencyRepository.findByCode(currencyCode);
            if (currency.isPresent()) {
                return currency.get();
            }
        }

        // Return default currency
        return currencyRepository.findById(DEFAULT_CURRENCY_ID)
                .orElseThrow(() -> new IllegalStateException("Default currency not found"));
    }

    /**
     * Get SubscriptionPackage by tier or return default
     */
    private SubscriptionPackage getSubscriptionPackageOrDefault(String tier) {
        // For now, always return default package
        // TODO: Add findByName method to SubscriptionPackageRepository if needed

        return subscriptionPackageRepository.findById(DEFAULT_PACKAGE_ID)
                .orElseThrow(() -> new IllegalStateException("Default subscription package not found"));
    }
}
