package com.example.GinumApps.dto;

import com.example.GinumApps.enums.PayeeType;
import com.example.GinumApps.enums.PaymentMethod;
import com.example.GinumApps.enums.TransactionType;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MoneyTransactionResponseDto {
    
    private Integer id;
    private String transactionNumber;
    private TransactionType type;
    private LocalDate transactionDate;
    
    private Integer bankAccountId;
    private String bankAccountName;
    private String bankAccountCode;
    
    private PayeeType payeeType;
    private Integer payeeId;
    private String payeeName;
    
    private Integer chargeAccountId;
    private String chargeAccountName;
    private String chargeAccountCode;
    
    private Double amount;
    private String description;
    private PaymentMethod paymentMethod;
    private String referenceNumber;
    
    private Integer projectId;
    private String projectName;
    
    private Integer journalEntryId;
    private String journalEntryReference;
    
    private Integer createdById;
    private String createdByName;
    private LocalDateTime createdAt;
}
