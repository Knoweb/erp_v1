package com.example.GinumApps.dto.external;

import lombok.Data;

import java.util.Map;

@Data
public class CustomerResponseDto {
    private Long id;
    private String customerName;
    private String vatNumber;
    private Map<String, Object> contactInfo;
    private Long orgId;
    private String phoneNumber;
    private String address;
}