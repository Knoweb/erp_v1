package com.example.GinumApps.service;

import com.example.GinumApps.dto.MoneyTransactionRequestDto;
import com.example.GinumApps.dto.MoneyTransactionResponseDto;
import com.example.GinumApps.enums.TransactionType;
import com.example.GinumApps.model.MoneyTransaction;

import java.time.LocalDate;
import java.util.List;

public interface MoneyTransactionService {
    
    MoneyTransaction createTransaction(Integer companyId, MoneyTransactionRequestDto request, Integer userId);
    
    List<MoneyTransactionResponseDto> getAllTransactions(Integer companyId);
    
    List<MoneyTransactionResponseDto> getTransactionsByType(Integer companyId, TransactionType type);
    
    List<MoneyTransactionResponseDto> getTransactionsByDateRange(
        Integer companyId, 
        LocalDate startDate, 
        LocalDate endDate
    );
    
    MoneyTransactionResponseDto getTransactionById(Integer id);
    
    void deleteTransaction(Integer id);
    
    String generateTransactionNumber(Integer companyId);
}
