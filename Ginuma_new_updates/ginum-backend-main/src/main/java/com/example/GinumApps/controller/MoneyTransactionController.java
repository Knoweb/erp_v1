package com.example.GinumApps.controller;

import com.example.GinumApps.dto.MoneyTransactionRequestDto;
import com.example.GinumApps.dto.MoneyTransactionResponseDto;
import com.example.GinumApps.enums.TransactionType;
import com.example.GinumApps.model.AppUser;
import com.example.GinumApps.model.MoneyTransaction;
import com.example.GinumApps.service.MoneyTransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies/{companyId}/money-transactions")
@RequiredArgsConstructor
public class MoneyTransactionController {
    
    private final MoneyTransactionService moneyTransactionService;
    
    @PostMapping
    public ResponseEntity<?> createTransaction(
            @PathVariable Integer companyId,
            @Valid @RequestBody MoneyTransactionRequestDto request,
            @AuthenticationPrincipal AppUser user) {
        try {
            MoneyTransaction transaction = moneyTransactionService.createTransaction(
                companyId, request, user.getId()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<List<MoneyTransactionResponseDto>> getAllTransactions(
            @PathVariable Integer companyId) {
        List<MoneyTransactionResponseDto> transactions = 
            moneyTransactionService.getAllTransactions(companyId);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Integer id) {
        try {
            MoneyTransactionResponseDto transaction = 
                moneyTransactionService.getTransactionById(id);
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<List<MoneyTransactionResponseDto>> getTransactionsByType(
            @PathVariable Integer companyId,
            @PathVariable TransactionType type) {
        List<MoneyTransactionResponseDto> transactions = 
            moneyTransactionService.getTransactionsByType(companyId, type);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<MoneyTransactionResponseDto>> getTransactionsByDateRange(
            @PathVariable Integer companyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<MoneyTransactionResponseDto> transactions = 
            moneyTransactionService.getTransactionsByDateRange(companyId, startDate, endDate);
        return ResponseEntity.ok(transactions);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Integer id) {
        try {
            moneyTransactionService.deleteTransaction(id);
            return ResponseEntity.ok(Map.of("message", "Transaction deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
}
