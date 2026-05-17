package com.example.GinumApps.controller;

import com.example.GinumApps.dto.CustomerSummaryDto;
import com.example.GinumApps.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;

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
    // Update and delete operations removed: customer master data is read-only in this service.
}
