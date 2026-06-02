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
}