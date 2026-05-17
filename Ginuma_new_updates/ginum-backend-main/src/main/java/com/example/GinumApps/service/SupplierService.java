package com.example.GinumApps.service;

import com.example.GinumApps.dto.SupplierDto;
import com.example.GinumApps.dto.SupplierSummaryDto;
import com.example.GinumApps.exception.ResourceNotFoundException;
import com.example.GinumApps.model.Company;
import com.example.GinumApps.model.Supplier;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.repository.SupplierRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {
    private final SupplierRepository supplierRepository;
    private final CompanyRepository companyRepository;

    // Creation of Supplier is disabled in this service; master data is owned by a separate microservice.

    // public List<SupplierDto> getSuppliersByCompanyId(Integer companyId) {
    //
    // // Verify company exists first
    // companyRepository.findById(companyId)
    // .orElseThrow(() -> new ResourceNotFoundException("Company not found with id:
    // " + companyId));
    //
    // List<Supplier> suppliers =
    // supplierRepository.findByCompany_CompanyId(companyId);
    // return suppliers.isEmpty() ?
    // Collections.emptyList() :
    // suppliers.stream().map(this::convertToDto).collect(Collectors.toList());
    // }
    // private SupplierDto convertToDto(Supplier supplier) {
    // return SupplierDto.builder()
    //// .id(supplier.getId())
    // .supplierName(supplier.getSupplierName())
    // .email(supplier.getEmail())
    // .mobileNo(supplier.getMobileNo())
    // .address(supplier.getAddress())
    // .supplierType(supplier.getSupplierType())
    // .tinNo(supplier.getTinNo())
    // .tax(supplier.getTax())
    // .currencyId(supplier.getCurrency().getId())
    // .itemCategory(supplier.getItemCategory())
    // .swiftNo(supplier.getSwiftNo())
    // .discountPercentage(supplier.getDiscountPercentage())
    // .companyId(supplier.getCompany().getCompanyId())
    // .build();
    // }

    public List<SupplierSummaryDto> getSuppliersByCompanyId(Integer companyId) {
        companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        List<Supplier> suppliers = supplierRepository.findByCompany_CompanyId(companyId);
        return suppliers.stream()
                .map(this::convertToSummaryDto)
                .collect(Collectors.toList());
    }

    private SupplierSummaryDto convertToSummaryDto(Supplier supplier) {
        return SupplierSummaryDto.builder()
                .id(supplier.getId())
                .supplierName(supplier.getSupplierName())
                .email(supplier.getEmail())
                .mobileNo(supplier.getMobileNo())
                .address(supplier.getAddress())
                .supplierType(supplier.getSupplierType())
                .tax(supplier.getTax())
                .itemCategory(supplier.getItemCategory().name())
                .build();
    }

    // Deletion of suppliers is disabled; master data is owned by another service.
}