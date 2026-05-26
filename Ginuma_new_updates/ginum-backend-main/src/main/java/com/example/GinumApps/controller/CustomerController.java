package com.example.GinumApps.controller;

import com.example.GinumApps.dto.CustomerSummaryDto;
import com.example.GinumApps.service.CustomerService;
import com.example.GinumApps.service.CustomerSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;
    private final CustomerSyncService customerSyncService;

    @GetMapping("/companies/{companyId}")
    public ResponseEntity<List<CustomerSummaryDto>> getCustomersByCompany(
            @PathVariable Integer companyId) {
        List<CustomerSummaryDto> customers = customerService.getCustomersByCompanyId(companyId);
        return ResponseEntity.ok(customers);
    }

    // === GET: Customer by ID ===
    @GetMapping("/{customerId}")
    public ResponseEntity<CustomerSummaryDto> getCustomerById(@PathVariable Long customerId) {
        return ResponseEntity.ok(customerService.getCustomerById(customerId));
    }

    // === POST: Sync customers from Middeniya ===
    @PostMapping("/sync/middeniya/{companyId}/{orgId}")
    public ResponseEntity<Map<String, Object>> syncCustomersFromMiddeniya(
            @PathVariable Integer companyId,
            @PathVariable Long orgId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        Map<String, Object> result = customerSyncService.syncCustomersFromMiddeniya(
                companyId.longValue(), orgId, token);
        return ResponseEntity.ok(result);
    }

    // === GET: Debug endpoint to test Middeniya API connectivity ===
    @GetMapping("/debug/middeniya/{orgId}")
    public ResponseEntity<Map<String, Object>> debugMiddeniyaApi(
            @PathVariable Long orgId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        Map<String, Object> debug = new java.util.HashMap<>();
        try {
            Object response = customerSyncService.testMiddeniyaApiConnection(orgId, token);
            debug.put("status", "success");
            debug.put("middeniyaResponse", response);
            debug.put("responseType", response != null ? response.getClass().getName() : "null");
        } catch (Exception e) {
            debug.put("status", "error");
            debug.put("message", e.getMessage());
            debug.put("cause", e.getCause() != null ? e.getCause().getMessage() : "unknown");
        }
        return ResponseEntity.ok(debug);
    }

    // Update and delete operations removed: customer master data is read-only in this service.
}
