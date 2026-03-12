package com.example.GinumApps.dto;

import com.example.GinumApps.enums.QuotationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuotationResponseDto {
    private Long id;
    private String quotationNumber;
    private Long customerId;
    private String customerName;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private BigDecimal subtotal;
    private BigDecimal taxPercent;
    private BigDecimal taxAmount;
    private BigDecimal total;
    private QuotationStatus status;
    private String notes;
    private String termsAndConditions;
    private List<QuotationLineItemDto> lineItems;
}
