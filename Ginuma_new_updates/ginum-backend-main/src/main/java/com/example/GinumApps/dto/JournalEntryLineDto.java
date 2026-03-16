package com.example.GinumApps.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JournalEntryLineDto {
    private String accountCode;
    private BigDecimal amount;

    private boolean debit;

    private String description;


}
