package com.inventory.subscription.dto;

import com.inventory.subscription.enums.SubscriptionStatus;
import com.inventory.subscription.enums.SystemName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for returning subscription details to the Main Dashboard
 * Includes plan type (TRIAL/PAID) and days remaining until expiry
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionDetailsDTO {
    
    /**
     * Subscription ID
     */
    private Long id;
    
    /**
     * Organization ID
     */
    private Long orgId;
    
    /**
     * System name (GINUMA, INVENTORY, etc.)
     */
    private SystemName systemName;
    
    /**
     * Plan type: "TRIAL" or "PAID"
     */
    private String planType;
    
    /**
     * Days remaining until subscription expires
     * Negative value indicates expired
     */
    private Integer daysLeft;
    
    /**
     * Original subscription status from database
     */
    private SubscriptionStatus status;
    
    /**
     * Trial end date (if applicable)
     */
    private LocalDate trialEndDate;
    
    /**
     * Valid until date
     */
    private LocalDate validUntil;
    
    /**
     * Whether subscription is currently active
     */
    private boolean isActive;
    
    /**
     * Human-readable status message
     */
    private String statusMessage;
}
