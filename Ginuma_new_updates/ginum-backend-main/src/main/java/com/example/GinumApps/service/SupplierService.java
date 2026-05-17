package com.example.GinumApps.service;

import com.example.GinumApps.client.InventorySupplierClient;
import com.example.GinumApps.dto.SupplierSummaryDto;
import com.example.GinumApps.enums.SupplierType;
import com.example.GinumApps.enums.TaxType;
import com.example.GinumApps.dto.external.SupplierResponseDto;
import com.example.GinumApps.exception.ResourceNotFoundException;
import com.example.GinumApps.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final InventorySupplierClient inventorySupplierClient;
    private final CompanyRepository companyRepository;

    // Fetch suppliers from inventory-service via Feign client and map to local summary DTO.
    public List<SupplierSummaryDto> getSuppliersByCompanyId(Integer companyId) {
        companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        List<SupplierResponseDto> externalSuppliers = inventorySupplierClient.getSuppliers(companyId);

        return externalSuppliers.stream()
                .map(this::convertExternalToSummary)
                .collect(Collectors.toList());
    }

    private SupplierSummaryDto convertExternalToSummary(SupplierResponseDto s) {
        String name = s.getSupplierName() != null ? s.getSupplierName() : s.getName();
        String mobile = s.getMobileNo() != null ? s.getMobileNo() : s.getContactNumber();

        SupplierType supplierType = null;
        TaxType taxType = null;
        try {
            if (s.getSupplierType() != null) supplierType = SupplierType.valueOf(s.getSupplierType());
        } catch (Exception ignored) {
        }
        try {
            if (s.getTax() != null) taxType = TaxType.valueOf(s.getTax());
        } catch (Exception ignored) {
        }

        return SupplierSummaryDto.builder()
                .id(s.getId())
                .supplierName(name)
                .email(s.getEmail())
                .mobileNo(mobile)
                .address(s.getAddress())
                .supplierType(supplierType)
                .tax(taxType)
                .itemCategory(s.getItemCategory())
                .build();
    }

}