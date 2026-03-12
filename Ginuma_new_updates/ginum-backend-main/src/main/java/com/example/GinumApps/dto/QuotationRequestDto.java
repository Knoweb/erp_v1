package com.example.GinumApps.dto;

import com.example.GinumApps.enums.QuotationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuotationRequestDto {
    @NotNull(message = "Customer ID is required")
    private Long customerId;
    
    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;
    
    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;
    
    private BigDecimal taxPercent = BigDecimal.ZERO;
    
    private QuotationStatus status;
    
    private String notes;
    
    private String termsAndConditions;
    
    @NotNull(message = "At least one line item is required")
    private List<QuotationLineItemDto> lineItems;
}
