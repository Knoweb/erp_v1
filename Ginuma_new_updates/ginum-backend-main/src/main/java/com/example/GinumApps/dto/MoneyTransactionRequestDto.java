package com.example.GinumApps.dto;

import com.example.GinumApps.enums.PayeeType;
import com.example.GinumApps.enums.PaymentMethod;
import com.example.GinumApps.enums.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MoneyTransactionRequestDto {
    
    @NotNull(message = "Transaction type is required")
    private TransactionType type;
    
    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;
    
    @NotNull(message = "Bank account is required")
    private Integer bankAccountId;
    
    @NotNull(message = "Payee type is required")
    private PayeeType payeeType;
    
    @NotNull(message = "Payee is required")
    private Integer payeeId;
    
    @NotNull(message = "Charge account is required")
    private Integer chargeAccountId;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;
    
    private String description;
    
    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
    
    private String referenceNumber;
    
    private Integer projectId;
}
