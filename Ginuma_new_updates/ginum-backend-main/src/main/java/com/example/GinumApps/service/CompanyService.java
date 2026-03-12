// CompanyService.java
package com.example.GinumApps.service;

import com.example.GinumApps.dto.AccountRequestDto;
import com.example.GinumApps.dto.CompanyRegistrationDto;
import com.example.GinumApps.dto.CompanyResponseDto;
import com.example.GinumApps.enums.AccountType;
import com.example.GinumApps.exception.DuplicateEntityException;
import com.example.GinumApps.model.*;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.repository.CountryRepository;
import com.example.GinumApps.repository.CurrencyRepository;
import com.example.GinumApps.repository.SubscriptionPackageRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final SubscriptionPackageRepository subscriptionPackageRepository;
    private final CountryRepository countryRepository;
    private final CurrencyRepository currencyRepository;
    private final AccountService accountService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Transactional
    public Company registerCompany(CompanyRegistrationDto dto) {
        // Check for duplicate email
        if (companyRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateEntityException("Email already registered");
        }


        // Check for duplicate registration number (if provided)
        if (dto.getCompanyRegNo() != null &&
                companyRepository.existsByCompanyRegNo(dto.getCompanyRegNo())) {
            throw new DuplicateEntityException("Company registration number already exists");
        }

        // Fetch the Package entity based on the provided packageId
        SubscriptionPackage subscriptionPackageEntity = subscriptionPackageRepository.findById(dto.getPackageId())
                .orElseThrow(() -> new EntityNotFoundException("Package not found with ID: " + dto.getPackageId()));

        // Fetch the Country entity based on the provided country name
        Country countryEntity = countryRepository.findByName(dto.getCountryName())
                .orElseThrow(() -> new EntityNotFoundException("Country not found: " + dto.getCountryName()));

        // Fetch the Currency entity based on the provided currency name
        Currency currencyEntity = currencyRepository.findByCode(dto.getCurrencyCode())
                .orElseThrow(() -> new EntityNotFoundException("Currency not found: " + dto.getCurrencyCode()));


        // Map DTO to Company entity
        Company company = new Company();
        company.setCompanyName(dto.getCompanyName());
        company.setCompanyCategory(dto.getCompanyCategory());
        company.setCompanyRegNo(dto.getCompanyRegNo());
        company.setTinNo(dto.getTinNo());
        company.setVatNo(dto.getVatNo());
        company.setIsVatRegistered(dto.getIsVatRegistered());
        company.setPhoneNo(dto.getPhoneNo());
        company.setMobileNo(dto.getMobileNo());
        company.setCompanyRegisteredAddress(dto.getCompanyRegisteredAddress());
        company.setCompanyFactoryAddress(dto.getCompanyFactoryAddress());

        company.setEmail(dto.getEmail());
        company.setWebsiteUrl(dto.getWebsiteUrl());
        company.setPassword(passwordEncoder.encode(dto.getPassword()));
        company.setDateJoined(LocalDate.now());

        company.setPackageEntity(subscriptionPackageEntity);
        company.setCountry(countryEntity);
        company.setCurrency(currencyEntity);

        // Set default values
        company.setStatus(true); // Assuming active on registration
        company.setRole("COMPANY");
//        company.setDateUpdated(LocalDate.now());

        try {
            if (dto.getCompanyLogo() != null && !dto.getCompanyLogo().isEmpty()) {
                company.setCompanyLogo(dto.getCompanyLogo().getBytes());
            }
            if (dto.getBrReport() != null && !dto.getBrReport().isEmpty()) {
                company.setBrReport(dto.getBrReport().getBytes());
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read logo or report file", e);
        }

        Company savedCompany = companyRepository.save(company);

        // Initialize default accounts
        initializeDefaultAccounts(savedCompany);

        return savedCompany;
    }

    public Optional<Company> getCompanyById(Integer id) {
        return companyRepository.findById(id);
    }


    private void initializeDefaultAccounts(Company company) {
        Account freight = createDefaultAccount(company, "Freight Expenses", AccountType.EXPENSE, "5100");
        Account tax = createDefaultAccount(company, "Tax Payable", AccountType.LIABILITY_OTHER_LIABILITY, "5200");
        Account payable = createDefaultAccount(company, "Accounts Payable", AccountType.LIABILITY_ACCOUNTS_PAYABLE, "2100");

        company.setFreightAccount(freight);
        company.setTaxAccount(tax);
        company.setAccountsPayableAccount(payable);
    }

    private Account createDefaultAccount(Company company, String name, AccountType type, String code) {
        AccountRequestDto dto = new AccountRequestDto();
        dto.setAccountName(name);
        dto.setAccountType(type);
        dto.setAccountCode(code);
        dto.setCurrentBalance(BigDecimal.ZERO);

        return accountService.createAccount(company.getCompanyId(), dto);
    }

    public List<CompanyResponseDto> getAllCompanies() {
        List<Company> companies = companyRepository.findAll();
        return companies.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    public CompanyResponseDto convertToDto(Company company) {
        CompanyResponseDto dto = new CompanyResponseDto();
        dto.setCompanyId(company.getCompanyId());
        dto.setCompanyName(company.getCompanyName());
        dto.setCompanyCategory(company.getCompanyCategory());
        dto.setCompanyRegNo(company.getCompanyRegNo());
        dto.setIsVatRegistered(company.getIsVatRegistered());
        dto.setVatNo(company.getVatNo());
        dto.setTinNo(company.getTinNo());
        dto.setCompanyRegisteredAddress(company.getCompanyRegisteredAddress());
        dto.setCompanyFactoryAddress(company.getCompanyFactoryAddress());
        dto.setPhoneNo(company.getPhoneNo());
        dto.setMobileNo(company.getMobileNo());
        dto.setEmail(company.getEmail());
        dto.setWebsiteUrl(company.getWebsiteUrl());
        dto.setDateJoined(company.getDateJoined());
//        dto.setCompanyLogo(company.getCompanyLogo());
//        dto.setBrReportPath(company.getBrReportPath());
        dto.setCountryName(company.getCountry().getName());
        dto.setCurrencyCode(company.getCurrency().getCode());
        dto.setStatus(company.getStatus());
        dto.setSubscriptionExpiryDate(company.getSubscriptionExpiryDate());

        if (company.getPackageEntity() != null) {
            dto.setSubscriptionPackageId(company.getPackageEntity().getId());
        }
        if (company.getCompanyLogo() != null) {
            dto.setCompanyLogoBase64(Base64.getEncoder().encodeToString(company.getCompanyLogo()));
        }
        return dto;
    }

    /**
     * Sync organization from identity-service to Ginuma company
     * Creates new company if not exists, updates if exists
     */
    @Transactional
    public Company syncFromOrganization(Long orgId, String orgName, String email, String industryType, 
            String contactPhone, String mobileNumber, String registeredAddress, String factoryAddress,
            String registrationNo, String vatNo, String tinNo, Boolean isVatRegistered, String logoUrl) {
        
        System.out.println("🔄 Starting sync for organization: " + orgId + " (" + orgName + ")");
        
        // Check if company with this orgId already exists
        Optional<Company> existingCompany = companyRepository.findById(orgId.intValue());
        
        // Download and convert logo if logoUrl is provided
        byte[] logoBytes = null;
        if (logoUrl != null && !logoUrl.isEmpty() && !logoUrl.equals("/uploads/logos/default.png")) {
            try {
                // If logoUrl is a relative path, construct full URL
                String fullUrl = logoUrl;
                if (logoUrl.startsWith("/uploads/")) {
                    fullUrl = "http://localhost:8080" + logoUrl;  // User-service URL
                }
                
                System.out.println("📥 Downloading company logo from: " + fullUrl);
                logoBytes = restTemplate.getForObject(fullUrl, byte[].class);
                
                if (logoBytes != null && logoBytes.length > 0) {
                    System.out.println("✅ Logo downloaded successfully: " + logoBytes.length + " bytes");
                } else {
                    System.out.println("⚠️ Logo download returned empty data");
                }
            } catch (Exception e) {
                System.err.println("❌ Failed to download logo from " + logoUrl + ": " + e.getMessage());
                // Continue without logo rather than failing the entire sync
            }
        }
        
        if (existingCompany.isPresent()) {
            // Update existing company
            System.out.println("📝 Updating existing company ID: " + orgId);
            Company company = existingCompany.get();
            company.setCompanyName(orgName);
            company.setEmail(email);
            company.setPhoneNo(contactPhone);
            company.setMobileNo(mobileNumber);
            company.setCompanyRegisteredAddress(registeredAddress != null && !registeredAddress.isEmpty() ? registeredAddress : "To be updated");
            company.setCompanyFactoryAddress(factoryAddress);
            company.setCompanyRegNo(registrationNo);
            company.setVatNo(vatNo);
            company.setTinNo(tinNo);
            company.setIsVatRegistered(isVatRegistered != null ? isVatRegistered : false);
            
            // Update logo if downloaded
            if (logoBytes != null && logoBytes.length > 0) {
                company.setCompanyLogo(logoBytes);
                System.out.println("💾 Updated company logo for company ID: " + company.getCompanyId());
            }
            
            // Map industryType to CompanyCategory if needed
            try {
                company.setCompanyCategory(mapIndustryToCategory(industryType));
            } catch (Exception e) {
                // Keep existing category
            }
            
            Company saved = companyRepository.save(company);
            System.out.println("✅ Successfully updated company ID: " + saved.getCompanyId());
            return saved;
        } else {
            // Create new company
            System.out.println("➕ Creating new company with ID: " + orgId);
            Company company = new Company();
            company.setCompanyId(orgId.intValue());
            company.setCompanyName(orgName);
            company.setEmail(email);
            company.setPhoneNo(contactPhone);
            company.setMobileNo(mobileNumber);
            company.setCompanyRegisteredAddress(registeredAddress != null && !registeredAddress.isEmpty() ? registeredAddress : "To be updated");
            company.setCompanyFactoryAddress(factoryAddress);
            company.setCompanyRegNo(registrationNo);
            company.setVatNo(vatNo);
            company.setTinNo(tinNo);
            company.setIsVatRegistered(isVatRegistered != null ? isVatRegistered : false);
            company.setStatus(true);  // Active by default
            company.setRole("COMPANY");
            company.setPassword("");  // No password, using identity-service
            company.setDateJoined(LocalDate.now());
            
            // Set logo if downloaded
            if (logoBytes != null && logoBytes.length > 0) {
                company.setCompanyLogo(logoBytes);
                System.out.println("💾 Set company logo for new company ID: " + orgId);
            }
            
            // Set default country and currency (ID 1)
            Country country = countryRepository.findById(1L)
                    .orElseThrow(() -> new EntityNotFoundException("Default country not found"));
            Currency currency = currencyRepository.findById(1)
                    .orElseThrow(() -> new EntityNotFoundException("Default currency not found"));
            SubscriptionPackage subscriptionPackage = subscriptionPackageRepository.findById(1)
                    .orElseThrow(() -> new EntityNotFoundException("Default package not found"));
            
            company.setCountry(country);
            company.setCurrency(currency);
            company.setPackageEntity(subscriptionPackage);
            
            // Map industryType to CompanyCategory enum
            try {
                company.setCompanyCategory(mapIndustryToCategory(industryType));
            } catch (Exception e) {
                company.setCompanyCategory(com.example.GinumApps.enums.CompanyCategory.IT_AND_TECHNOLOGY);  // Default
            }
            
            System.out.println("💾 Saving new company to database...");
            Company saved = companyRepository.save(company);
            System.out.println("✅ Successfully created company ID: " + saved.getCompanyId());
            
            return saved;
        }
    }
    
    private com.example.GinumApps.enums.CompanyCategory mapIndustryToCategory(String industryType) {
        if (industryType == null) {
            return com.example.GinumApps.enums.CompanyCategory.PROFESSIONAL_SERVICES;
        }
        
        // Map industry types from Knoweb Inventory to Ginuma CompanyCategory
        return switch (industryType.toUpperCase()) {
            // Exact matches from Knoweb Inventory
            case "PHARMACY" -> com.example.GinumApps.enums.CompanyCategory.HEALTHCARE_AND_LIFE_SCIENCES;
            case "RETAIL" -> com.example.GinumApps.enums.CompanyCategory.MARKETING_AND_E_COMMERCE;
            case "MANUFACTURING" -> com.example.GinumApps.enums.CompanyCategory.MANUFACTURING_AND_LOGISTICS;
            case "ECOMMERCE" -> com.example.GinumApps.enums.CompanyCategory.MARKETING_AND_E_COMMERCE;
            case "HEALTHCARE" -> com.example.GinumApps.enums.CompanyCategory.HEALTHCARE_AND_LIFE_SCIENCES;
            case "CONSTRUCTION" -> com.example.GinumApps.enums.CompanyCategory.CONSTRUCTION_AND_ENGINEERING;
            case "FOOD_BEVERAGE", "FOOD", "BEVERAGE" -> com.example.GinumApps.enums.CompanyCategory.HOSPITALITY_AND_TOURISM;
            case "LOGISTICS" -> com.example.GinumApps.enums.CompanyCategory.MANUFACTURING_AND_LOGISTICS;
            case "GENERAL" -> com.example.GinumApps.enums.CompanyCategory.PROFESSIONAL_SERVICES;
            
            // Additional mappings for other possible values
            case "EDUCATION", "EDTECH" -> com.example.GinumApps.enums.CompanyCategory.EDUCATION_AND_EDTECH;
            case "FINANCE", "BANKING" -> com.example.GinumApps.enums.CompanyCategory.FINANCE;
            case "CREATIVE", "DESIGN" -> com.example.GinumApps.enums.CompanyCategory.CREATIVE_AND_DESIGN;
            case "REAL_ESTATE", "PROPERTY" -> com.example.GinumApps.enums.CompanyCategory.REAL_ESTATE_AND_PROPERTY_MANAGEMENT;
            case "HOSPITALITY", "TOURISM" -> com.example.GinumApps.enums.CompanyCategory.HOSPITALITY_AND_TOURISM;
            case "IT", "TECHNOLOGY", "SOFTWARE" -> com.example.GinumApps.enums.CompanyCategory.IT_AND_TECHNOLOGY;
            case "MARKETING" -> com.example.GinumApps.enums.CompanyCategory.MARKETING_AND_E_COMMERCE;
            case "ENGINEERING" -> com.example.GinumApps.enums.CompanyCategory.CONSTRUCTION_AND_ENGINEERING;
            case "LIFE_SCIENCES" -> com.example.GinumApps.enums.CompanyCategory.HEALTHCARE_AND_LIFE_SCIENCES;
            case "PROFESSIONAL_SERVICES", "SERVICES" -> com.example.GinumApps.enums.CompanyCategory.PROFESSIONAL_SERVICES;
            
            // Default fallback
            default -> {
                System.out.println("⚠️ Unknown industry type '" + industryType + "', defaulting to PROFESSIONAL_SERVICES");
                yield com.example.GinumApps.enums.CompanyCategory.PROFESSIONAL_SERVICES;
            }
        };
    }
    
    // Sync existing organization by fetching from user-service
    @Transactional
    public Company syncOrganizationById(Long orgId) {
        try {
            // Fetch organization from user-service via API Gateway
            String url = "http://localhost:8080/api/organizations/" + orgId;
            java.util.Map<String, Object> orgData = restTemplate.getForObject(url, java.util.Map.class);
            
            if (orgData == null) {
                throw new EntityNotFoundException("Organization not found with ID: " + orgId);
            }
            
            // Extract organization details with safe type conversion
            String orgName = (String) orgData.get("name");
            String email = (String) orgData.getOrDefault("contactEmail", "");
            String industryType = (String) orgData.getOrDefault("industryType", "GENERAL");
            String contactPhone = (String) orgData.get("contactPhone");
            String mobileNumber = (String) orgData.get("mobileNumber");
            String registeredAddress = (String) orgData.get("registeredAddress");
            String factoryAddress = (String) orgData.get("factoryAddress");
            String registrationNo = (String) orgData.get("registrationNo");
            String vatNo = (String) orgData.get("vatNo");
            String tinNo = (String) orgData.get("tinNo");
            
            // Safe Boolean conversion - handle both Boolean and String from API
            Boolean isVatRegistered = false;
            Object vatRegObj = orgData.get("isVatRegistered");
            if (vatRegObj instanceof Boolean) {
                isVatRegistered = (Boolean) vatRegObj;
            } else if (vatRegObj instanceof String) {
                isVatRegistered = Boolean.parseBoolean((String) vatRegObj);
            } else if (vatRegObj != null) {
                isVatRegistered = Boolean.TRUE.equals(vatRegObj) || "true".equalsIgnoreCase(vatRegObj.toString());
            }
            
            // Get logoUrl from orgData
            String logoUrl = (String) orgData.get("logoUrl");
            
            // Sync to Ginuma
            return syncFromOrganization(orgId, orgName, email, industryType,
                    contactPhone, mobileNumber, registeredAddress, factoryAddress,
                    registrationNo, vatNo, tinNo, isVatRegistered, logoUrl);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to sync organization " + orgId + ": " + e.getMessage(), e);
        }
    }
}