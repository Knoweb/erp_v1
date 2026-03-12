package com.example.GinumApps.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Tenant Setup Request DTO
 * 
 * Received from identity-service during user registration.
 * Contains all necessary data to provision a new tenant in Ginuma ERP.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantSetupRequest {
    
    // Organization Identity
    @NotNull(message = "orgId is required")
    private Long orgId;  // From identity_db.organizations.id
    
    // Company Information
    @NotBlank(message = "companyName is required")
    private String companyName;
    
    @Email(message = "Valid email is required")
    @NotBlank(message = "email is required")
    private String email;
    
    private String phoneNumber;
    private String registrationNo;
    private String tinNo;
    private String vatNo;
    private String website;
    
    // Admin User Information
    @Email(message = "Valid adminEmail is required")
    private String adminEmail;
    
    private String adminFirstName;
    private String adminLastName;
    
    // Address Information
    private String address;
    private String city;
    private String country;
    
    // Business Details
    private String industry;
    private String currency;
    
    // Database Configuration
    private String databaseName;  // Usually "ginuma_db"
    
    // Subscription Information
    private Boolean isTrialAccount;
    private String subscriptionTier;  // BASIC, STANDARD, PREMIUM
}
