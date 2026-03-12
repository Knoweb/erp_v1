package com.example.GinumApps.controller;

import com.example.GinumApps.dto.SupplierDto;
import com.example.GinumApps.dto.SupplierSummaryDto;
import com.example.GinumApps.model.Supplier;
import com.example.GinumApps.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {
    private final SupplierService supplierService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> createSupplier(
            @RequestPart("supplier") @Valid SupplierDto supplierDto,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {

        if (file != null && !file.isEmpty()) {
            supplierDto.setBusinessRegistration(file);
        }

        supplierService.createSupplier(supplierDto);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Supplier created successfully");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/companies/{companyId}")
    public ResponseEntity<List<SupplierSummaryDto>> getSuppliersByCompany(
            @PathVariable Integer companyId) {
        List<SupplierSummaryDto> suppliers = supplierService.getSuppliersByCompanyId(companyId);
        return ResponseEntity.ok(suppliers);
    }

    @DeleteMapping("/companies/{companyId}/{supplierId}")
    public ResponseEntity<?> deleteSupplier(
            @PathVariable Integer companyId,
            @PathVariable Long supplierId) {
        try {
            supplierService.deleteSupplier(companyId, supplierId);
            return ResponseEntity.ok(Map.of("message", "Supplier deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
