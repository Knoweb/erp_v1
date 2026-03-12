package com.example.GinumApps.dto;

import lombok.Data;

/**
 * DTO for syncing organization data from identity-service to Ginuma company
 */
@Data
public class CompanySyncRequest {
    private Long orgId;              // Organization ID from identity-service
    private String orgName;          // Organization name
    private String email;            // Company email
    private String industryType;     // Industry/category
    private Long countryId;          // Country ID (optional)
    private Long currencyId;         // Currency ID (optional)
    
    // Additional organization fields
    private String contactPhone;     // Phone number
    private String mobileNumber;     // Mobile number
    private String registeredAddress;// Registered address
    private String factoryAddress;   // Factory address
    private String registrationNo;   // Registration number
    private String vatNo;            // VAT number
    private String tinNo;            // TIN number
    private Boolean isVatRegistered; // VAT registration status
    private String website;          // Website URL
    private String logoUrl;          // Logo URL
    private String country;          // Country name
    private String currency;         // Currency code
}
