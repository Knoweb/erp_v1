package com.example.GinumApps.controller;

import com.example.GinumApps.dto.AccountRequestDto;
import com.example.GinumApps.dto.AccountResponseDto;
import com.example.GinumApps.model.Account;
import com.example.GinumApps.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies/{companyId}/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<?> createAccount(
            @PathVariable Integer companyId,
            @Valid @RequestBody AccountRequestDto request
    ) {
        try {
//            request.setCompanyId(companyId);
            Account createdAccount = accountService.createAccount(companyId,request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAccount);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<AccountResponseDto>> getAccountsByCompany(
            @PathVariable Integer companyId) {
        List<AccountResponseDto> accounts = accountService.getAccountsByCompany(companyId);
        return ResponseEntity.ok(accounts);
    }

}
