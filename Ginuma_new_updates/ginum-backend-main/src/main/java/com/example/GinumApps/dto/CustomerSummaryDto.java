package com.example.GinumApps.dto;

import com.example.GinumApps.enums.CustomerType;
import com.example.GinumApps.enums.TaxType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSummaryDto {
    private Long id;
    private String name;
    private String email;
    private String phoneNo;
    private String billingAddress;
    private String deliveryAddress;
    private CustomerType customerType;
    private TaxType tax;
    private String nicNo;
    private String tinNo;
    private String vat;
    private String swiftNo;
    private Double discountPercentage;
}
