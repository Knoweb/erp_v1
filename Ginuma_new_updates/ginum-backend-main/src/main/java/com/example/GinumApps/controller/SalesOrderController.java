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
    public ResponseEntity<?> createSalesOrder(
            @PathVariable Integer companyId,
            @Valid @RequestBody SalesOrderRequestDto requestDto) {
        try {
            SalesOrderResponseDto response = salesOrderService.createSalesOrder(requestDto, companyId);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR in createSalesOrder: " + e.getMessage());
            e.printStackTrace(); // Log on server
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            
            // Get the root cause message if possible
            Throwable cause = e;
            while(cause.getCause() != null) cause = cause.getCause();
            
            String message = cause.getMessage();
            if (message == null || message.isEmpty()) {
                message = "An unexpected error occurred: " + cause.getClass().getSimpleName();
            }
            errorResponse.put("message", message);
            errorResponse.put("error", cause.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
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

    @PostMapping("/company/{companyId}/{soId}/pay")
    public ResponseEntity<?> paySalesOrder(
            @PathVariable Integer companyId,
            @PathVariable Long soId,
            @RequestBody @Valid com.example.GinumApps.dto.SalesPaymentRequestDto request) {
        if (!request.getCompanyId().equals(companyId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Company ID mismatch");
        }
        salesOrderService.paySalesOrder(soId, request);
        return ResponseEntity.ok("Payment recorded successfully");
    }
}
