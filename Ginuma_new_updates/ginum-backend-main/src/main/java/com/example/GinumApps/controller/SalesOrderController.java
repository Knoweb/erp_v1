package com.example.GinumApps.controller;

import com.example.GinumApps.dto.SalesOrderRequestDto;
import com.example.GinumApps.dto.SalesOrderResponseDto;
import com.example.GinumApps.service.SalesOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sales-orders")
@RequiredArgsConstructor
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    @PostMapping("/company/{companyId}")
    public ResponseEntity<SalesOrderResponseDto> createSalesOrder(
            @PathVariable Integer companyId,
            @Valid @RequestBody SalesOrderRequestDto requestDto) {
        SalesOrderResponseDto response = salesOrderService.createSalesOrder(requestDto, companyId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/company/{companyId}/next-so-number")
    public ResponseEntity<java.util.Map<String, String>> getNextSoNumber(@PathVariable Integer companyId) {
        String nextSoNumber = salesOrderService.getNextSoNumber(companyId);
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("soNumber", nextSoNumber);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<java.util.List<SalesOrderResponseDto>> getAllSalesOrdersByCompany(
            @PathVariable Integer companyId) {
        return ResponseEntity.ok(salesOrderService.getAllSalesOrdersByCompany(companyId));
    }
}
