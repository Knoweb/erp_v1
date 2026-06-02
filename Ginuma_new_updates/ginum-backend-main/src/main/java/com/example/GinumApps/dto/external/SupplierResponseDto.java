package com.example.GinumApps.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SupplierResponseDto {
    private Long id;
    private String name;
    private String supplierName;
    private String contactNumber;
    private String mobileNo;
    private String email;
    private String address;
    private String bankDetails;
    private String supplierType;
    private String tax;
    private String itemCategory;
}
