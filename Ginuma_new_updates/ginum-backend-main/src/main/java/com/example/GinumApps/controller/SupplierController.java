package com.example.GinumApps.controller;

import com.example.GinumApps.dto.SupplierDto;
import com.example.GinumApps.dto.SupplierSummaryDto;
import com.example.GinumApps.model.Supplier;
import com.example.GinumApps.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ginuma/suppliers")
@RequiredArgsConstructor
public class SupplierController {
    private final SupplierService supplierService;

    @GetMapping("/companies/{companyId}")
    public ResponseEntity<List<SupplierSummaryDto>> getSuppliersByCompany(
            @PathVariable Integer companyId) {
        List<SupplierSummaryDto> suppliers = supplierService.getSuppliersByCompanyId(companyId);
        return ResponseEntity.ok(suppliers);
    }

    // Supplier master data is read-only in this service. Delete/update operations are intentionally removed.
}
