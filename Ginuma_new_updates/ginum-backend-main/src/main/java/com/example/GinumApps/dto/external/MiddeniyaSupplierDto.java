package com.example.GinumApps.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * DTO for Middeniya inventory service supplier response format.
 * Handles the nested contactInfo structure returned by Middeniya droplet.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MiddeniyaSupplierDto {
    private Long id;
    private String name;
    private ContactInfo contactInfo;
    private Long orgId;
    private String createdAt;
    private String updatedAt;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ContactInfo {
        private String email;
        private String phone;
        private String gender;
    }

    /**
     * Convert Middeniya DTO to standard SupplierResponseDto format
     */
    public SupplierResponseDto toSupplierResponseDto() {
        SupplierResponseDto dto = new SupplierResponseDto();
        dto.setId(this.id);
        dto.setName(this.name);
        dto.setSupplierName(this.name);

        if (this.contactInfo != null) {
            dto.setEmail(this.contactInfo.email);
            dto.setMobileNo(this.contactInfo.phone);
        }

        // Middeniya API doesn't return these fields, so leave them null
        // The service will handle null values gracefully
        dto.setSupplierType(null);
        dto.setTax(null);
        dto.setItemCategory(null);
        dto.setAddress(null);
        dto.setBankDetails(null);

        return dto;
    }
}
