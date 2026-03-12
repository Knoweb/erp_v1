package com.inventory.subscription.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for upgrading company subscription by adding a new system
 * Example: { "orgId": 2, "newSystem": "GINUMA" }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpgradeSubscriptionRequest {
    
    /**
     * Organization ID (foreign key to organizations table)
     */
    private Long orgId;
    
    /**
     * New system to add to subscription
     * Valid values: GINUMA, INVENTORY, PIRISAHR, ALL_IN_ONE
     */
    private String newSystem;
}
