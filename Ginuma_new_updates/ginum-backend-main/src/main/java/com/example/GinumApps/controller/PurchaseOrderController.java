package com.example.GinumApps.controller;

import com.example.GinumApps.dto.PurchaseOrderRequestDto;
import com.example.GinumApps.dto.PurchaseOrderResponseDto;
import com.example.GinumApps.dto.PurchasePaymentRequestDto;
import com.example.GinumApps.service.PurchaseOrderService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/{companyId}/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping
    public ResponseEntity<PurchaseOrderResponseDto> createPurchaseOrder(
            @PathVariable Integer companyId,
            @Valid @RequestBody PurchaseOrderRequestDto request) {
        PurchaseOrderResponseDto response = purchaseOrderService.createPurchaseOrder(request, companyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/next-po-number")
    public ResponseEntity<java.util.Map<String, String>> getNextPoNumber(@PathVariable Integer companyId) {
        String nextPoNumber = purchaseOrderService.getNextPoNumber(companyId);
        // Returning as a JSON object: {"poNumber": "00000001"}
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("poNumber", nextPoNumber);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<java.util.List<PurchaseOrderResponseDto>> getAllPurchaseOrdersByCompany(
            @PathVariable Integer companyId) {
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrdersByCompany(companyId));
    }

    // Exception handler for validation errors
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleValidationExceptions(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    // Exception handler for not found errors
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFoundExceptions(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDeniedExceptions(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
    }

    @PostMapping("/{poId}/pay")
    public ResponseEntity<?> payPurchaseOrder(
            @PathVariable Long poId,
            @RequestBody @Valid PurchasePaymentRequestDto request) {
        purchaseOrderService.payPurchaseOrder(poId, request);
        return ResponseEntity.ok("Payment recorded successfully");
    }

}