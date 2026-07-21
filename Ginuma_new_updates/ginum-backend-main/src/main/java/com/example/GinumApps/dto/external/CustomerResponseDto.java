package com.example.GinumApps.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CustomerResponseDto {
    private Long id;
    private String customerName;
    private String vatNumber;
    private Map<String, Object> contactInfo;
    private Long orgId;
    private String phoneNumber;
    private String address;
    private String tinNo;
    private String tin;
    private String nicNo;
    private String nic;
    private String identityNumber;
    private String registeredAddress;
    private String billingAddress;
    private Double discountPercentage;

    private Map<String, Object> additionalProperties = new java.util.HashMap<>();

    @com.fasterxml.jackson.annotation.JsonAnySetter
    public void addAdditionalProperty(String key, Object value) {
        this.additionalProperties.put(key, value);
    }
    
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }
}